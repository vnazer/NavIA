import Foundation
import Combine
import CoreLocation

/// GPS del reloj: velocidad (SOG) y rumbo (COG) suavizado con media circular.
final class GPSManager: NSObject, ObservableObject, CLLocationManagerDelegate {
    @Published private(set) var sogNudos: Double = 0
    @Published private(set) var sogMaxNudos: Double = 0
    @Published private(set) var cog: Double?
    @Published private(set) var precision: Double = -1
    @Published private(set) var ultimaUbicacion: CLLocation?
    @Published private(set) var activo = false
    @Published private(set) var permisoDenegado = false

    /// Cada lectura válida (para la ruta del entrenamiento y la táctica).
    var alRecibir: ((CLLocation) -> Void)?

    private let manager = CLLocationManager()
    private var muestrasCog: [(fecha: Date, rumbo: Double)] = []
    private let ventanaCog: TimeInterval = 4

    override init() {
        super.init()
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyBestForNavigation
        manager.distanceFilter = kCLDistanceFilterNone
        manager.activityType = .otherNavigation
        // Requiere UIBackgroundModes=location; sigue registrando con la muñeca abajo
        // mientras la sesión de entrenamiento mantiene la app viva.
        manager.allowsBackgroundLocationUpdates = true
    }

    func iniciar() {
        switch manager.authorizationStatus {
        case .notDetermined:
            manager.requestWhenInUseAuthorization()
        case .authorizedAlways, .authorizedWhenInUse:
            arrancar()
        default:
            permisoDenegado = true
        }
    }

    func detener() {
        manager.stopUpdatingLocation()
        activo = false
    }

    func reiniciarMaximo() { sogMaxNudos = 0 }

    private func arrancar() {
        permisoDenegado = false
        guard !activo else { return }
        manager.startUpdatingLocation()
        activo = true
    }

    // MARK: - CLLocationManagerDelegate

    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        switch manager.authorizationStatus {
        case .authorizedAlways, .authorizedWhenInUse: arrancar()
        case .denied, .restricted: permisoDenegado = true
        default: break
        }
    }

    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        for loc in locations {
            precision = loc.horizontalAccuracy
            // Descarta lecturas sin precisión o demasiado ruidosas para táctica.
            guard loc.horizontalAccuracy >= 0, loc.horizontalAccuracy < 25 else { continue }

            // Si el chip no entrega velocidad/rumbo (señal débil), se derivan de la
            // posición anterior.
            var velocidad = loc.speed
            var rumbo = loc.course
            // Sin `speedAccuracy` (-1) se confía en la velocidad que entrega el chip.
            var velocidadFiable = loc.speed >= 0 && loc.speedAccuracy < 1.5
            if let previa = ultimaUbicacion, velocidad < 0 || rumbo < 0 {
                let dt = loc.timestamp.timeIntervalSince(previa.timestamp)
                if dt >= 0.5 && dt <= 10 {
                    let distancia = loc.distance(from: previa)
                    if velocidad < 0 { velocidad = distancia / dt }
                    if rumbo < 0, distancia >= 2 { rumbo = Nautica.rumbo(desde: previa.coordinate, hasta: loc.coordinate) }
                    velocidadFiable = false
                }
            }

            let sog = max(velocidad, 0) * Nautica.msANudos
            sogNudos = sog
            if sog > sogMaxNudos, velocidadFiable {
                sogMaxNudos = sog
            }

            // El rumbo del GPS no sirve con el bote casi detenido.
            if rumbo >= 0, sog >= 0.6 {
                muestrasCog.append((loc.timestamp, rumbo))
            }
            muestrasCog.removeAll { loc.timestamp.timeIntervalSince($0.fecha) > ventanaCog }
            cog = Nautica.mediaCircular(muestrasCog.map(\.rumbo))

            ultimaUbicacion = loc
            alRecibir?(loc)
        }
    }

    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        // kCLErrorLocationUnknown es transitorio; el resto se refleja en `precision`.
    }
}
