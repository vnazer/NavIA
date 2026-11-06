import Foundation
import Combine
import CoreLocation

enum Amura: String {
    case estribor = "Estribor"
    case babor = "Babor"
}

enum Rumbo: String {
    case cenida = "Ceñida"
    case traves = "Través"
    case popa = "Popa"
}

/// Táctica a partir de una dirección de viento de referencia (TWD) y del rumbo GPS.
///
/// La referencia sale del pronóstico, se ajusta a mano con la corona o se calcula
/// con dos bordos de ceñida (bisectriz). En ceñida, con rumbo estable, se estima el
/// viento actual y se compara con la referencia: positivo = rolada favorable (lift),
/// negativo = rolada en contra (header).
final class TacticaManager: ObservableObject {
    enum Fuente: String {
        case pronostico = "Pronóstico"
        case manual = "Manual"
        case viradas = "Viradas"
    }

    // Referencia de viento
    @Published private(set) var twdReferencia: Double?
    @Published private(set) var fuente: Fuente?
    @Published private(set) var twsNudos: Double?
    @Published private(set) var rachaNudos: Double?
    @Published private(set) var fechaPronostico: Date?
    @Published private(set) var cargandoPronostico = false
    @Published private(set) var errorPronostico: String?

    // Estado táctico
    @Published private(set) var amura: Amura?
    @Published private(set) var rumbo: Rumbo?
    @Published private(set) var twa: Double?
    @Published private(set) var vmgNudos: Double?
    @Published private(set) var twdEstimado: Double?
    @Published private(set) var borneo: Double?
    @Published private(set) var rumboEstable = false
    @Published private(set) var viradas = 0
    @Published private(set) var trasluchadas = 0
    @Published private(set) var anguloCenida: Double = 42

    /// Grados de rolada que disparan la vibración.
    @Published var umbralAlerta: Double {
        didSet { defaults.set(umbralAlerta, forKey: Claves.umbral) }
    }

    var hayDosBordos: Bool { bordoEstribor != nil && bordoBabor != nil }

    private let defaults = UserDefaults.standard
    private var historialCog: [(fecha: Date, rumbo: Double)] = []
    private var bordoEstribor: (fecha: Date, rumbo: Double)?
    private var bordoBabor: (fecha: Date, rumbo: Double)?
    private var alertaActiva = 0 // -1 negada avisada, +1 favorable avisada
    private var negadaDesde: Date?

    private enum Claves {
        static let twd = "tactica.twd"
        static let fuente = "tactica.fuente"
        static let umbral = "tactica.umbral"
        static let cenida = "tactica.cenida"
    }

    init() {
        let umbral = defaults.double(forKey: Claves.umbral)
        umbralAlerta = umbral > 0 ? umbral : 6
        if defaults.object(forKey: Claves.twd) != nil {
            twdReferencia = defaults.double(forKey: Claves.twd)
            fuente = Fuente(rawValue: defaults.string(forKey: Claves.fuente) ?? "") ?? .manual
        }
        let cenida = defaults.double(forKey: Claves.cenida)
        if cenida > 0 { anguloCenida = cenida }
    }

    // MARK: - Referencia

    func fijarReferencia(_ twd: Double, fuente: Fuente) {
        twdReferencia = Nautica.normalizar(twd)
        self.fuente = fuente
        defaults.set(twdReferencia, forKey: Claves.twd)
        defaults.set(fuente.rawValue, forKey: Claves.fuente)
        alertaActiva = 0
        negadaDesde = nil
    }

    /// Ajuste fino con la corona (grados enteros).
    func ajustarReferencia(_ delta: Double) {
        let base = twdReferencia ?? 0
        fijarReferencia(base + delta, fuente: .manual)
    }

    /// Pone el borneo en cero tomando el viento estimado ahora como referencia.
    func ceroAqui() {
        if let actual = twdEstimado { fijarReferencia(actual, fuente: .manual) }
    }

    /// Bisectriz de los dos últimos bordos de ceñida estables.
    func referenciaDesdeViradas() {
        guard let e = bordoEstribor, let b = bordoBabor,
              let twd = Nautica.mediaCircular([e.rumbo, b.rumbo]) else { return }
        let medio = abs(Nautica.diferencia(b.rumbo, e.rumbo)) / 2
        if (30...60).contains(medio) {
            anguloCenida = medio
            defaults.set(medio, forKey: Claves.cenida)
        }
        fijarReferencia(twd, fuente: .viradas)
    }

    func reiniciarContadores() {
        viradas = 0
        trasluchadas = 0
    }

    // MARK: - Cálculo

    func actualizar(cog: Double?, sogNudos: Double, ahora: Date = Date()) {
        if let cog { historialCog.append((ahora, cog)) }
        historialCog.removeAll { ahora.timeIntervalSince($0.fecha) > 15 }

        guard let ref = twdReferencia, let cog, sogNudos >= 1.0 else {
            limpiarEstado()
            return
        }

        let anguloViento = Nautica.diferencia(ref, cog) // + viento por estribor
        let nuevaAmura: Amura = anguloViento >= 0 ? .estribor : .babor
        let absTwa = abs(anguloViento)
        let nuevoRumbo: Rumbo = absTwa < 70 ? .cenida : (absTwa > 115 ? .popa : .traves)

        if let anterior = amura, anterior != nuevaAmura {
            if nuevoRumbo == .popa { trasluchadas += 1 } else { viradas += 1 }
            Hapticos.toque()
            alertaActiva = 0
            negadaDesde = nil
        }
        amura = nuevaAmura
        rumbo = nuevoRumbo
        twa = absTwa
        vmgNudos = abs(sogNudos * cos(absTwa * .pi / 180))

        let rumbos = historialCog.map(\.rumbo)
        rumboEstable = rumbos.count >= 6 && Nautica.dispersion(rumbos) <= 6

        guard nuevoRumbo == .cenida, rumboEstable, let medio = Nautica.mediaCircular(rumbos) else {
            twdEstimado = nil
            borneo = nil
            return
        }

        switch nuevaAmura {
        case .estribor: bordoEstribor = (ahora, medio)
        case .babor: bordoBabor = (ahora, medio)
        }
        // Bordos de hace más de 20 min ya no describen el viento actual.
        if let e = bordoEstribor, ahora.timeIntervalSince(e.fecha) > 1200 { bordoEstribor = nil }
        if let b = bordoBabor, ahora.timeIntervalSince(b.fecha) > 1200 { bordoBabor = nil }

        let estimado = Nautica.normalizar(medio + (nuevaAmura == .estribor ? anguloCenida : -anguloCenida))
        twdEstimado = estimado
        // En estribor una rolada a la derecha (horaria) es favorable; en babor, al revés.
        let delta = Nautica.diferencia(estimado, ref)
        let valor = nuevaAmura == .estribor ? delta : -delta
        borneo = valor
        evaluarAlertas(valor, ahora: ahora)
    }

    private func evaluarAlertas(_ valor: Double, ahora: Date) {
        if valor <= -umbralAlerta {
            if negadaDesde == nil { negadaDesde = ahora }
            // Debe sostenerse unos segundos para no vibrar con cada ola.
            if alertaActiva != -1, let desde = negadaDesde, ahora.timeIntervalSince(desde) >= 6 {
                alertaActiva = -1
                Hapticos.negada()
            }
        } else if valor >= umbralAlerta {
            negadaDesde = nil
            if alertaActiva != 1 {
                alertaActiva = 1
                Hapticos.favorable()
            }
        } else if abs(valor) < umbralAlerta / 2 {
            alertaActiva = 0
            negadaDesde = nil
        }
    }

    private func limpiarEstado() {
        rumbo = nil
        twa = nil
        vmgNudos = nil
        twdEstimado = nil
        borneo = nil
        rumboEstable = false
    }

    // MARK: - Pronóstico (Open-Meteo, sin API key)

    func cargarPronostico(en coordenada: CLLocationCoordinate2D, fijarSiNoHay: Bool) async {
        cargandoPronostico = true
        errorPronostico = nil
        defer { cargandoPronostico = false }

        var componentes = URLComponents(string: "https://api.open-meteo.com/v1/forecast")!
        componentes.queryItems = [
            URLQueryItem(name: "latitude", value: String(format: "%.4f", coordenada.latitude)),
            URLQueryItem(name: "longitude", value: String(format: "%.4f", coordenada.longitude)),
            URLQueryItem(name: "current", value: "wind_speed_10m,wind_direction_10m,wind_gusts_10m"),
            URLQueryItem(name: "wind_speed_unit", value: "kn"),
        ]
        do {
            let (datos, respuesta) = try await URLSession.shared.data(from: componentes.url!)
            guard (respuesta as? HTTPURLResponse)?.statusCode == 200 else {
                errorPronostico = "Sin respuesta del pronóstico"
                return
            }
            let actual = try JSONDecoder().decode(RespuestaOpenMeteo.self, from: datos).current
            twsNudos = actual.wind_speed_10m
            rachaNudos = actual.wind_gusts_10m
            fechaPronostico = Date()
            if fijarSiNoHay ? twdReferencia == nil : true {
                fijarReferencia(actual.wind_direction_10m, fuente: .pronostico)
            }
        } catch {
            errorPronostico = "Sin conexión"
        }
    }
}

private struct RespuestaOpenMeteo: Decodable {
    struct Actual: Decodable {
        let wind_speed_10m: Double
        let wind_direction_10m: Double
        let wind_gusts_10m: Double?
    }
    let current: Actual
}
