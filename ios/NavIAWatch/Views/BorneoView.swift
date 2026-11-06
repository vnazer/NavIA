import SwiftUI

/// Rolada respecto del viento de referencia, en ceñida: verde favorable, rojo en contra.
/// Vibra al superar el umbral (doble ▼ si conviene virar).
struct BorneoView: View {
    @EnvironmentObject var tactica: TacticaManager

    var body: some View {
        VStack(spacing: 3) {
            Cabecera(titulo: "BORNEO",
                     detalle: tactica.amura?.rawValue.uppercased(),
                     colorDetalle: tactica.amura == .estribor ? .green : .red)

            if tactica.twdReferencia == nil {
                Text("Fija el viento en la pantalla Viento")
                    .font(.footnote)
                    .multilineTextAlignment(.center)
                    .foregroundStyle(.secondary)
                    .padding(.top, 10)
            } else if let valor = tactica.borneo {
                HStack(spacing: 4) {
                    Image(systemName: icono(valor))
                        .font(.system(size: 26, weight: .black))
                    Text(String(format: "%+.0f°", valor))
                        .font(.system(size: 52, weight: .heavy, design: .rounded))
                        .monospacedDigit()
                        .minimumScaleFactor(0.6)
                }
                .foregroundStyle(color(valor))

                Text(texto(valor))
                    .font(.system(size: 13, weight: .black))
                    .foregroundStyle(color(valor))

                Button("Poner en 0", action: tactica.ceroAqui)
                    .font(.system(size: 13, weight: .semibold))
            } else {
                Text("–")
                    .font(.system(size: 52, weight: .heavy, design: .rounded))
                    .foregroundStyle(.secondary)
                Text(motivoSinDato)
                    .font(.system(size: 12))
                    .multilineTextAlignment(.center)
                    .foregroundStyle(.secondary)
            }

            Text("Ref. \(Nautica.formatoRumbo(tactica.twdReferencia)) · virs \(tactica.viradas)")
                .font(.system(size: 10))
                .foregroundStyle(.secondary)
        }
        .padding(.horizontal, 4)
    }

    private var motivoSinDato: String {
        switch tactica.rumbo {
        case nil: return "Navega a más de 1 kt"
        case .cenida?: return "Mantén el rumbo unos segundos"
        default: return "Solo en ceñida"
        }
    }

    private func color(_ v: Double) -> Color {
        if v >= tactica.umbralAlerta / 2 { return .green }
        if v <= -tactica.umbralAlerta / 2 { return .red }
        return .yellow
    }

    private func icono(_ v: Double) -> String {
        if v >= tactica.umbralAlerta / 2 { return "arrow.up.circle.fill" }
        if v <= -tactica.umbralAlerta / 2 { return "arrow.down.circle.fill" }
        return "equal.circle.fill"
    }

    private func texto(_ v: Double) -> String {
        if v <= -tactica.umbralAlerta { return "EN CONTRA · VIRA" }
        if v <= -tactica.umbralAlerta / 2 { return "EN CONTRA" }
        if v >= tactica.umbralAlerta / 2 { return "FAVORABLE" }
        return "ESTABLE"
    }
}
