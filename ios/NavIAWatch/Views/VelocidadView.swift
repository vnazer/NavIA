import SwiftUI

/// Velocidad (SOG) grande, rumbo (COG), VMG y máxima.
struct VelocidadView: View {
    @EnvironmentObject var gps: GPSManager
    @EnvironmentObject var tactica: TacticaManager

    var body: some View {
        VStack(spacing: 2) {
            Cabecera(titulo: "VELOCIDAD", detalle: tactica.rumbo?.rawValue.uppercased())

            if gps.permisoDenegado {
                Text("Activa la ubicación para NavIA en Ajustes del reloj")
                    .font(.footnote)
                    .multilineTextAlignment(.center)
                    .foregroundStyle(.orange)
                    .padding(.top, 8)
            } else {
                HStack(alignment: .firstTextBaseline, spacing: 2) {
                    Text(String(format: "%.1f", gps.sogNudos))
                        .font(.system(size: 62, weight: .heavy, design: .rounded))
                        .monospacedDigit()
                        .foregroundStyle(.cyan)
                        .minimumScaleFactor(0.6)
                    Text("kt")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundStyle(.secondary)
                }

                HStack {
                    Dato(titulo: "RUMBO", valor: Nautica.formatoRumbo(gps.cog),
                         detalle: gps.cog.map { Nautica.cardinal($0) })
                    Spacer()
                    Dato(titulo: "VMG", valor: tactica.vmgNudos.map { String(format: "%.1f", $0) } ?? "–",
                         detalle: tactica.rumbo == .popa ? "↓ sotav." : (tactica.rumbo == .cenida ? "↑ barlov." : nil))
                    Spacer()
                    Dato(titulo: "MÁX", valor: String(format: "%.1f", gps.sogMaxNudos), detalle: nil)
                }
            }
        }
        .padding(.horizontal, 4)
    }
}

struct Dato: View {
    let titulo: String
    let valor: String
    let detalle: String?

    var body: some View {
        VStack(spacing: 0) {
            Text(titulo)
                .font(.system(size: 9, weight: .bold))
                .foregroundStyle(.secondary)
            Text(valor)
                .font(.system(size: 19, weight: .bold, design: .rounded))
                .monospacedDigit()
            if let detalle {
                Text(detalle)
                    .font(.system(size: 9, weight: .semibold))
                    .foregroundStyle(.secondary)
            }
        }
    }
}
