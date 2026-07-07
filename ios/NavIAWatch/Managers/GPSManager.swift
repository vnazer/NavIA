import Foundation
import CoreLocation
import WatchKit
import Combine

public enum SailingTack: String {
    case starboard = "Estribor"
    case port = "Babor"
    case unknown = "---"
}

public class GPSManager: NSObject, ObservableObject, CLLocationManagerDelegate {
    @Published public var speedInKnots: Double = 0.0
    @Published public var courseInDegrees: Double = 0.0
    @Published public var currentTack: SailingTack = .unknown
    @Published public var shiftIndex: Double = 0.0 // Grados favorable (+) o negada (-)
    @Published public var estimatedTWD: Double = 0.0 // True Wind Direction estimado
    @Published public var gpsAccuracy: Double = 0.0
    @Published public var isTracking: Bool = false
    
    private let locationManager = CLLocationManager()
    
    // Filtros y buffers para el cálculo de roles de viento
    private var headingBuffer: [Double] = []
    private let bufferLimit = 15 // ~15 segundos de rumbo para promediar
    
    private var stableStarboardHeading: Double?
    private var stablePortHeading: Double?
    
    override public init() {
        super.init()
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBestForNavigation
        locationManager.distanceFilter = 1.0 // Actualizar cada metro de movimiento
        
        // Habilitar actualizaciones en segundo plano para watchOS
        locationManager.allowsBackgroundLocationUpdates = true
    }
    
    public func requestPermissionsAndStart() {
        let status = locationManager.authorizationStatus
        if status == .notDetermined {
            locationManager.requestAlwaysAuthorization()
        } else if status == .authorizedAlways || status == .authorizedWhenInUse {
            startTracking()
        }
    }
    
    public func startTracking() {
        locationManager.startUpdatingLocation()
        isTracking = true
        // Feedback háptico al iniciar el entrenamiento Laser
        WKInterfaceDevice.current().play(.start)
    }
    
    public func stopTracking() {
        locationManager.stopUpdatingLocation()
        isTracking = false
        WKInterfaceDevice.current().play(.stop)
    }
    
    // MARK: - CLLocationManagerDelegate
    
    public func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        
        // Actualizar precisión y filtrar lecturas ruidosas
        self.gpsAccuracy = location.horizontalAccuracy
        guard location.horizontalAccuracy < 20.0 else { return }
        
        // 1. Convertir velocidad a nudos (1 m/s = 1.94384 nudos)
        let rawSpeed = location.speed
        self.speedInKnots = rawSpeed > 0 ? (rawSpeed * 1.94384) : 0.0
        
        // 2. Extraer rumbo COG (Course Over Ground)
        let rawCourse = location.course
        guard rawCourse >= 0 else { return } // -1 indica rumbo no válido
        self.courseInDegrees = rawCourse
        
        // Evitar cálculos tácticos si el bote está parado o derivando lento
        if self.speedInKnots > 0.8 {
            processTacticalCalculations(currentHeading: rawCourse)
        }
    }
    
    public func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        if manager.authorizationStatus == .authorizedAlways || manager.authorizationStatus == .authorizedWhenInUse {
            startTracking()
        }
    }
    
    // MARK: - Algoritmo Táctico Offline "roles de viento" (Nivel Dios)
    
    private func processTacticalCalculations(currentHeading: Double) {
        // Añadir rumbo al búfer dinámico
        headingBuffer.append(currentHeading)
        if headingBuffer.count > bufferLimit {
            headingBuffer.removeFirst()
        }
        
        // Calcular varianza de rumbo en el búfer para determinar si navegamos estables o virando
        let averageHeading = headingBuffer.reduce(0.0, +) / Double(headingBuffer.count)
        let variance = headingBuffer.map { pow($0 - averageHeading, 2) }.reduce(0.0, +) / Double(headingBuffer.count)
        
        let isStable = variance < 8.0 // Menos de 8 grados de desviación en 15s indica bordo estable
        
        if isStable {
            // Clasificar bordo: La ceñida del Laser típicamente tiene una diferencia de ~90° entre amuras
            if let starboard = stableStarboardHeading {
                // Si la diferencia es de aproximadamente 90° (+/- 25°) determinamos la otra amura
                let diff = angleDifference(currentHeading, starboard)
                if abs(diff - 90.0) < 25.0 {
                    stablePortHeading = currentHeading
                    currentTack = .port
                } else if abs(diff) < 20.0 {
                    stableStarboardHeading = currentHeading
                    currentTack = .starboard
                }
            } else if let port = stablePortHeading {
                let diff = angleDifference(currentHeading, port)
                if abs(diff + 90.0) < 25.0 {
                    stableStarboardHeading = currentHeading
                    currentTack = .starboard
                } else if abs(diff) < 20.0 {
                    stablePortHeading = currentHeading
                    currentTack = .port
                }
            } else {
                // Primer bordo registrado (asumimos Estribor temporalmente)
                stableStarboardHeading = currentHeading
                currentTack = .starboard
            }
            
            // Actualizar la dirección media del viento estimado (TWD) basado en las amuras estables
            if let starboard = stableStarboardHeading, let port = stablePortHeading {
                // El viento medio es la bisectriz del ángulo de las viradas
                let bisector = (starboard + port) / 2.0
                estimatedTWD = bisector.truncatingRemainder(dividingBy: 360.0)
            } else if estimatedTWD == 0.0 {
                // Si no hay dos amuras estables aún, estimamos el viento a 45 grados de la amura actual
                let offset = (currentTack == .starboard) ? 45.0 : -45.0
                estimatedTWD = (currentHeading + offset).truncatingRemainder(dividingBy: 360.0)
            }
            
            // Calcular el índice de borneo (Shift Index)
            calculateShiftIndex(currentHeading: currentHeading)
        } else {
            // Rumbo inestable: Posiblemente estamos en medio de una virada
            let firstHeading = headingBuffer.first ?? currentHeading
            let totalDiff = angleDifference(currentHeading, firstHeading)
            
            // Si viramos más de 60 grados, confirmamos cambio de bordo y emitimos haptics suaves
            if abs(totalDiff) > 60.0 {
                currentTack = (currentTack == .starboard) ? .port : .starboard
                headingBuffer.removeAll()
                WKInterfaceDevice.current().play(.click) // Feedback táctil de virada completada
            }
        }
    }
    
    private func calculateShiftIndex(currentHeading: Double) {
        guard estimatedTWD > 0 else { return }
        
        let targetHeading: Double
        let deviation: Double
        
        if currentTack == .starboard {
            // En Estribor: Rumbo ideal = TWD - 45°. Grados por encima es Favorable (+), por debajo es Negada (-)
            targetHeading = (estimatedTWD - 45.0 + 360.0).truncatingRemainder(dividingBy: 360.0)
            deviation = angleDifference(currentHeading, targetHeading)
        } else {
            // En Babor: Rumbo ideal = TWD + 45°. Grados por debajo (hacia el este) es Favorable (+), por encima es Negada (-)
            targetHeading = (estimatedTWD + 45.0).truncatingRemainder(dividingBy: 360.0)
            deviation = -angleDifference(currentHeading, targetHeading)
        }
        
        // Filtro de paso bajo para suavizar el índice de borneo
        let alpha = 0.2
        self.shiftIndex = (alpha * deviation) + ((1.0 - alpha) * self.shiftIndex)
        
        // ALERTAR AL TIMONEL: Si la negada (Header) supera los -3° de pérdida, avisar por háptica (¡Vira ya!)
        if self.shiftIndex < -3.5 {
            // Alerta táctica vibratoria para virar en el momento óptimo del borneo
            WKInterfaceDevice.current().play(.directionDown)
        }
    }
    
    // MARK: - Utilidades Matemáticas de Rumbo
    
    private func angleDifference(_ current: Double, _ target: Double) -> Double {
        var diff = current - target
        while diff < -180.0 { diff += 360.0 }
        while diff > 180.0  { diff -= 360.0 }
        return diff
    }
}
