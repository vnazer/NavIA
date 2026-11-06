import Foundation
import Combine
import HealthKit
import CoreLocation

/// Sesión de entrenamiento de vela (HKWorkoutSession).
///
/// Es lo que mantiene la app viva con la muñeca abajo: sin ella watchOS la
/// suspende y se detienen el cronómetro, el GPS y las vibraciones. Además guarda
/// el entrenamiento con su ruta en la app Fitness/Salud y entrega el pulso.
final class SesionManager: NSObject, ObservableObject {
    @Published private(set) var activa = false
    @Published private(set) var inicio: Date?
    @Published private(set) var pulso: Double?
    @Published private(set) var error: String?

    private let store = HKHealthStore()
    private var sesion: HKWorkoutSession?
    private var builder: HKLiveWorkoutBuilder?
    private var ruta: HKWorkoutRouteBuilder?

    func iniciar() {
        guard !activa else { return }
        guard HKHealthStore.isHealthDataAvailable() else {
            error = "Salud no disponible en este reloj"
            return
        }
        let compartir: Set<HKSampleType> = [HKObjectType.workoutType(), HKSeriesType.workoutRoute()]
        let leer: Set<HKObjectType> = [HKQuantityType(.heartRate), HKObjectType.workoutType()]
        store.requestAuthorization(toShare: compartir, read: leer) { [weak self] _, _ in
            // Aunque se niegue el permiso, la sesión igual mantiene la app activa.
            DispatchQueue.main.async { self?.arrancar() }
        }
    }

    private func arrancar() {
        guard !activa else { return }
        let configuracion = HKWorkoutConfiguration()
        configuracion.activityType = .sailing
        configuracion.locationType = .outdoor
        do {
            let nuevaSesion = try HKWorkoutSession(healthStore: store, configuration: configuracion)
            let nuevoBuilder = nuevaSesion.associatedWorkoutBuilder()
            nuevoBuilder.dataSource = HKLiveWorkoutDataSource(healthStore: store, workoutConfiguration: configuracion)
            nuevaSesion.delegate = self
            nuevoBuilder.delegate = self

            let fecha = Date()
            nuevaSesion.startActivity(with: fecha)
            nuevoBuilder.beginCollection(withStart: fecha) { _, _ in }

            sesion = nuevaSesion
            builder = nuevoBuilder
            ruta = HKWorkoutRouteBuilder(healthStore: store, device: nil)
            inicio = fecha
            activa = true
            error = nil
        } catch {
            self.error = "No se pudo iniciar la sesión"
        }
    }

    /// Agrega puntos GPS a la ruta del entrenamiento.
    func agregar(_ ubicacion: CLLocation) {
        guard activa, let ruta else { return }
        ruta.insertRouteData([ubicacion]) { _, _ in }
    }

    func terminar(guardar: Bool) {
        guard let sesion, let builder else { return }
        let ruta = self.ruta
        sesion.end()
        builder.endCollection(withEnd: Date()) { _, _ in
            guard guardar else {
                builder.discardWorkout()
                ruta?.discard()
                return
            }
            builder.finishWorkout { entrenamiento, _ in
                if let entrenamiento {
                    ruta?.finishRoute(with: entrenamiento, metadata: nil) { _, _ in }
                }
            }
        }
        self.sesion = nil
        self.builder = nil
        self.ruta = nil
        activa = false
        inicio = nil
        pulso = nil
    }
}

extension SesionManager: HKWorkoutSessionDelegate {
    nonisolated func workoutSession(_ workoutSession: HKWorkoutSession,
                                    didChangeTo toState: HKWorkoutSessionState,
                                    from fromState: HKWorkoutSessionState,
                                    date: Date) {}

    nonisolated func workoutSession(_ workoutSession: HKWorkoutSession, didFailWithError error: Error) {
        DispatchQueue.main.async {
            self.error = "La sesión se detuvo"
            self.activa = false
        }
    }
}

extension SesionManager: HKLiveWorkoutBuilderDelegate {
    nonisolated func workoutBuilderDidCollectEvent(_ workoutBuilder: HKLiveWorkoutBuilder) {}

    nonisolated func workoutBuilder(_ workoutBuilder: HKLiveWorkoutBuilder,
                                    didCollectDataOf collectedTypes: Set<HKSampleType>) {
        let tipo = HKQuantityType(.heartRate)
        guard collectedTypes.contains(tipo),
              let valor = workoutBuilder.statistics(for: tipo)?.mostRecentQuantity()?
                .doubleValue(for: HKUnit.count().unitDivided(by: .minute())) else { return }
        DispatchQueue.main.async { self.pulso = valor }
    }
}
