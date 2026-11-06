import SwiftUI

/// Sesión de entrenamiento: mantiene la app activa con la muñeca abajo y guarda
/// la navegación (ruta, pulso) en Fitness.
struct SesionView: View {
    @EnvironmentObject var sesion: SesionManager
    @EnvironmentObject var tactica: TacticaManager
    @EnvironmentObject var gps: GPSManager
    @State private var confirmarFin = false

    var body: some View {
        ScrollView {
            VStack(spacing: 6) {
                Cabecera(titulo: "SESIÓN",
                         detalle: sesion.activa ? "ACTIVA" : "DETENIDA",
                         colorDetalle: sesion.activa ? .green : .gray)

                if let inicio = sesion.inicio {
                    Text(inicio, style: .timer)
                        .font(.system(size: 34, weight: .heavy, design: .rounded))
                        .monospacedDigit()
                }

                HStack {
                    Dato(titulo: "PULSO", valor: sesion.pulso.map { String(format: "%.0f", $0) } ?? "–", detalle: "lpm")
                    Spacer()
                    Dato(titulo: "VIRADAS", valor: "\(tactica.viradas)", detalle: nil)
                    Spacer()
                    Dato(titulo: "TRASL.", valor: "\(tactica.trasluchadas)", detalle: nil)
                }

                if sesion.activa {
                    Button(role: .destructive) {
                        confirmarFin = true
                    } label: {
                        Text("Terminar").frame(maxWidth: .infinity)
                    }
                } else {
                    Button(action: sesion.iniciar) {
                        Label("Iniciar sesión", systemImage: "sailboat.fill")
                            .frame(maxWidth: .infinity)
                    }
                    .tint(.green)
                    Text("Se inicia sola al empezar la cuenta atrás.")
                        .font(.system(size: 10))
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                }

                if let error = sesion.error {
                    Text(error).font(.system(size: 11)).foregroundStyle(.orange)
                }
            }
            .padding(.horizontal, 4)
        }
        .confirmationDialog("¿Terminar la sesión?", isPresented: $confirmarFin) {
            Button("Guardar en Fitness") { sesion.terminar(guardar: true) }
            Button("Descartar", role: .destructive) { sesion.terminar(guardar: false) }
            Button("Seguir", role: .cancel) {}
        }
    }
}
