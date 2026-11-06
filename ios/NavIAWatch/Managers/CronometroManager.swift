import Foundation
import Combine

/// Cuenta atrás de salida basada en una hora objetivo (no en restar segundos),
/// así no se desfasa si la pantalla se apaga o la app se ralentiza.
/// Al llegar a cero pasa a contar el tiempo de regata.
final class CronometroManager: ObservableObject {
    enum Estado: Equatable {
        case detenido
        case cuentaAtras(salida: Date)
        case enRegata(salida: Date)
    }

    @Published private(set) var estado: Estado = .detenido
    @Published private(set) var ahora = Date()
    @Published var minutos: Int {
        didSet { UserDefaults.standard.set(minutos, forKey: "crono.minutos") }
    }

    /// Se llama una vez al dar la salida (para arrancar la sesión, etc.).
    var alDarSalida: (() -> Void)?

    private var ultimoSegundoAvisado: Int?

    init() {
        let guardado = UserDefaults.standard.integer(forKey: "crono.minutos")
        minutos = (1...10).contains(guardado) ? guardado : 5
    }

    /// Segundos que faltan (cuenta atrás) o que van de regata (en regata).
    var segundos: TimeInterval {
        switch estado {
        case .detenido: return TimeInterval(minutos * 60)
        case .cuentaAtras(let salida): return max(0, salida.timeIntervalSince(ahora))
        case .enRegata(let salida): return ahora.timeIntervalSince(salida)
        }
    }

    func iniciar() {
        ultimoSegundoAvisado = nil
        estado = .cuentaAtras(salida: Date().addingTimeInterval(TimeInterval(minutos * 60)))
        Hapticos.inicio()
    }

    /// Redondea al minuto más cercano (se pulsa con la señal de la comisión).
    func sincronizar() {
        guard case .cuentaAtras(let salida) = estado else { return }
        let restante = salida.timeIntervalSinceNow
        let redondeado = (restante / 60).rounded() * 60
        if redondeado <= 0 {
            darSalida(en: Date())
        } else {
            estado = .cuentaAtras(salida: Date().addingTimeInterval(redondeado))
            ultimoSegundoAvisado = Int(redondeado)
            Hapticos.toque()
        }
    }

    /// Resta un minuto a la cuenta atrás (p. ej. salida a 4' tras bandera).
    func restarMinuto() {
        guard case .cuentaAtras(let salida) = estado else { return }
        let nueva = salida.addingTimeInterval(-60)
        if nueva <= Date() { darSalida(en: Date()) } else { estado = .cuentaAtras(salida: nueva) }
        Hapticos.toque()
    }

    func detener() {
        estado = .detenido
        ultimoSegundoAvisado = nil
        Hapticos.fin()
    }

    func tick(_ fecha: Date = Date()) {
        ahora = fecha
        guard case .cuentaAtras(let salida) = estado else { return }
        let restante = salida.timeIntervalSince(fecha)
        if restante <= 0 {
            darSalida(en: salida)
            return
        }
        let s = Int(restante.rounded(.up))
        guard s != ultimoSegundoAvisado else { return }
        ultimoSegundoAvisado = s
        avisar(s)
    }

    private func avisar(_ s: Int) {
        if s % 60 == 0 {
            Hapticos.minuto()
        } else if s == 30 || s == 20 || s == 15 {
            Hapticos.aviso()
        } else if s <= 10 {
            Hapticos.toque()
        }
    }

    private func darSalida(en salida: Date) {
        estado = .enRegata(salida: salida)
        Hapticos.salida()
        alDarSalida?()
    }
}
