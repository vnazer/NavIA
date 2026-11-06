import SwiftUI

/// Cuenta atrás de salida: corona para elegir minutos, SYNC grande con la señal
/// de la comisión y, tras la salida, tiempo de regata.
struct CronometroView: View {
    @EnvironmentObject var modelo: AppModel
    @EnvironmentObject var crono: CronometroManager
    @State private var corona: Double = 5

    var body: some View {
        VStack(spacing: 4) {
            Cabecera(titulo: "SALIDA", detalle: etiqueta, colorDetalle: color)

            Text(textoTiempo)
                .font(.system(size: 50, weight: .heavy, design: .rounded))
                .monospacedDigit()
                .foregroundStyle(color)
                .minimumScaleFactor(0.6)
                .lineLimit(1)

            switch crono.estado {
            case .detenido:
                Button(action: modelo.iniciarCuentaAtras) {
                    Label("INICIAR", systemImage: "flag.checkered")
                        .font(.system(size: 18, weight: .black))
                        .frame(maxWidth: .infinity, minHeight: 48)
                }
                .tint(.green)
                Text("Gira la corona: \(crono.minutos) min")
                    .font(.system(size: 11))
                    .foregroundStyle(.secondary)

            case .cuentaAtras:
                Button(action: crono.sincronizar) {
                    Text("SYNC")
                        .font(.system(size: 24, weight: .black))
                        .frame(maxWidth: .infinity, minHeight: 56)
                }
                .tint(.cyan)
                HStack(spacing: 6) {
                    Button("−1'", action: crono.restarMinuto)
                        .font(.system(size: 15, weight: .bold))
                    Button(role: .destructive, action: crono.detener) {
                        Image(systemName: "xmark")
                    }
                }

            case .enRegata:
                Button(role: .destructive, action: crono.detener) {
                    Text("Terminar")
                        .font(.system(size: 15, weight: .bold))
                        .frame(maxWidth: .infinity)
                }
            }
        }
        .padding(.horizontal, 4)
        .focusable(crono.estado == .detenido)
        .digitalCrownRotation($corona, from: 1, through: 10, by: 1,
                              sensitivity: .low, isContinuous: false, isHapticFeedbackEnabled: true)
        .onAppear { corona = Double(crono.minutos) }
        .onChange(of: corona) { valor in
            if crono.estado == .detenido { crono.minutos = Int(valor.rounded()) }
        }
    }

    private var etiqueta: String {
        switch crono.estado {
        case .detenido: return "LISTO"
        case .cuentaAtras: return "CUENTA ATRÁS"
        case .enRegata: return "EN REGATA"
        }
    }

    private var color: Color {
        switch crono.estado {
        case .detenido: return .white
        case .enRegata: return .green
        case .cuentaAtras:
            let s = crono.segundos
            if s <= 10 { return .red }
            if s <= 60 { return .orange }
            return .yellow
        }
    }

    private var textoTiempo: String {
        let enRegata: Bool
        if case .enRegata = crono.estado { enRegata = true } else { enRegata = false }
        // En cuenta atrás se redondea hacia arriba: "00:01" hasta el instante de la salida.
        let total = Int(enRegata ? crono.segundos.rounded(.down) : crono.segundos.rounded(.up))
        let h = total / 3600, m = (total % 3600) / 60, s = total % 60
        let base = h > 0 ? String(format: "%d:%02d:%02d", h, m, s) : String(format: "%02d:%02d", m, s)
        return enRegata ? "+" + base : base
    }
}
