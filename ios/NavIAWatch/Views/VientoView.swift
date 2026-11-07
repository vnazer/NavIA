import SwiftUI

/// Viento de referencia (TWD): del pronóstico, con la corona o desde dos bordos.
struct VientoView: View {
    @EnvironmentObject var modelo: AppModel
    @EnvironmentObject var tactica: TacticaManager
    @State private var corona: Double = 0

    var body: some View {
        ScrollView {
            VStack(spacing: 4) {
                Cabecera(titulo: "VIENTO", detalle: tactica.fuente?.rawValue)

                HStack(spacing: 8) {
                    Image(systemName: "arrow.up")
                        // La flecha indica hacia dónde sopla (desde TWD, a TWD+180).
                        .rotationEffect(.degrees((tactica.twdReferencia ?? 0) + 180))
                        .font(.system(size: 26))
                        .foregroundStyle(.cyan)
                        .opacity(tactica.twdReferencia == nil ? 0.3 : 1)
                    VStack(alignment: .leading, spacing: 0) {
                        Text(Nautica.formatoRumbo(tactica.twdReferencia))
                            .font(.system(size: 38, weight: .heavy, design: .rounded))
                            .monospacedDigit()
                        Text(tactica.twdReferencia.map { "desde el " + Nautica.cardinal($0) } ?? "sin referencia")
                            .font(.system(size: 11))
                            .foregroundStyle(.secondary)
                    }
                }

                if let tws = tactica.twsNudos {
                    Text(textoIntensidad(tws))
                        .font(.system(size: 13, weight: .semibold))
                }

                Text("Corona: ajustar ±1°")
                    .font(.system(size: 10))
                    .foregroundStyle(.secondary)

                Button {
                    modelo.pedirPronostico(fijarSiNoHay: false)
                } label: {
                    Label(tactica.cargandoPronostico ? "Cargando…" : "Pronóstico", systemImage: "cloud.sun")
                        .frame(maxWidth: .infinity)
                }
                .disabled(tactica.cargandoPronostico)

                Button {
                    tactica.referenciaDesdeViradas()
                } label: {
                    Label("Desde viradas", systemImage: "arrow.triangle.swap")
                        .frame(maxWidth: .infinity)
                }
                .disabled(!tactica.hayDosBordos)

                if let error = tactica.errorPronostico {
                    Text(error).font(.system(size: 11)).foregroundStyle(.orange)
                }

                Stepper(value: $tactica.umbralAlerta, in: 3...15, step: 1) {
                    Text("Aviso \(Int(tactica.umbralAlerta))°")
                        .font(.system(size: 13))
                }
            }
            .padding(.horizontal, 4)
        }
        .focusable(true)
        .digitalCrownRotation($corona, from: -100_000, through: 100_000, by: 1,
                              sensitivity: .low, isContinuous: true, isHapticFeedbackEnabled: true)
        .onChange(of: corona) { [corona] nuevo in
            let delta = (nuevo - corona).rounded()
            if delta != 0 { tactica.ajustarReferencia(delta) }
        }
    }

    private func textoIntensidad(_ tws: Double) -> String {
        var texto = String(format: "%.0f kt", tws)
        if let racha = tactica.rachaNudos { texto += String(format: " · rachas %.0f", racha) }
        if let fecha = tactica.fechaPronostico {
            let minutos = Int(Date().timeIntervalSince(fecha) / 60)
            texto += minutos < 1 ? " · ahora" : " · hace \(minutos) min"
        }
        return texto
    }
}
