import Foundation
import Combine
import CoreLocation

/// Une GPS, táctica, cronómetro y sesión, y los hace avanzar con un único reloj.
final class AppModel: ObservableObject {
    let gps = GPSManager()
    let tactica = TacticaManager()
    let crono = CronometroManager()
    let sesion = SesionManager()

    private var timer: AnyCancellable?
    private var pronosticoPedido = false

    init() {
        gps.alRecibir = { [weak self] ubicacion in
            guard let self else { return }
            self.sesion.agregar(ubicacion)
            if !self.pronosticoPedido {
                self.pronosticoPedido = true
                self.pedirPronostico(fijarSiNoHay: true)
            }
        }
        // La cuenta atrás necesita la sesión activa para seguir vibrando con la muñeca abajo.
        crono.alDarSalida = { [weak self] in
            self?.tactica.reiniciarContadores()
            self?.gps.reiniciarMaximo()
        }
    }

    func arrancar() {
        gps.iniciar()
        guard timer == nil else { return }
        timer = Timer.publish(every: 0.25, on: .main, in: .common)
            .autoconnect()
            .sink { [weak self] fecha in
                guard let self else { return }
                self.crono.tick(fecha)
                self.tactica.actualizar(cog: self.gps.cog, sogNudos: self.gps.sogNudos, ahora: fecha)
            }
    }

    func iniciarCuentaAtras() {
        if !sesion.activa { sesion.iniciar() }
        crono.iniciar()
    }

    func pedirPronostico(fijarSiNoHay: Bool) {
        guard let coordenada = gps.ultimaUbicacion?.coordinate else { return }
        Task { await tactica.cargarPronostico(en: coordenada, fijarSiNoHay: fijarSiNoHay) }
    }
}
