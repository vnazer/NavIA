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

            let sog = max(loc.speed, 0) * Nautica.msANudos
            sogNudos = sog
            if sog > sogMaxNudos, loc.speedAccuracy >= 0, loc.speedAccuracy < 1.5 {
                sogMaxNudos = sog
            }

            // El rumbo del GPS no sirve con el bote casi detenido.
            if loc.course >= 0, sog >= 0.6 {
                muestrasCog.append((loc.timestamp, loc.course))
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
