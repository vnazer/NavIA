import SwiftUI

struct TacticaView: View {
    @ObservedObject var gpsManager: GPSManager
    
    var body: some View {
        VStack(spacing: 2) {
            // Cabecera de Táctica
            HStack {
                Text("DETECTOR DE ROLES")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(.gray)
                Spacer()
                Text(gpsManager.currentTack.rawValue)
                    .font(.system(size: 12, weight: .black))
                    .foregroundColor(tackColor)
            }
            .padding(.horizontal, 6)
            
            Spacer(minLength: 2)
            
            // ÍNDICE DE BORNEO GIGANTE
            VStack(spacing: -4) {
                HStack(spacing: 4) {
                    Image(systemName: shiftArrowIcon)
                        .font(.system(size: 28, weight: .black))
                        .foregroundColor(shiftColor)
                    
                    Text(String(format: "%+.1f°", gpsManager.shiftIndex))
                        .font(.system(size: 42, weight: .black, design: .rounded))
                        .foregroundColor(shiftColor)
                        .minimumScaleFactor(0.8)
                }
                
                Text(shiftLabel)
                    .font(.system(size: 11, weight: .black))
                    .foregroundColor(shiftColor)
            }
            
            Spacer(minLength: 2)
            
            // PANEL TÁCTICO INFERIOR / RECOMENDACIÓN DE VIRADA
            if gpsManager.shiftIndex < -3.0 {
                // Alerta parpadeante de Negada / ¡Virada sugerida!
                VStack {
                    Text("¡VIRA YA! (TACK)")
                        .font(.system(size: 13, weight: .black))
                        .foregroundColor(.white)
                        .padding(.vertical, 4)
                        .frame(maxWidth: .infinity)
                        .background(Color.red)
                        .cornerRadius(6)
                        .flashingEffect() // Efecto de parpadeo táctico
                }
                .padding(.horizontal, 4)
            } else {
                // Indicador de Viento Medio Estimado
                HStack {
                    Text("TWD Estimado:")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(.gray)
                    Text(String(format: "%03.0f°", gpsManager.estimatedTWD))
                        .font(.system(size: 11, weight: .black, design: .monospaced))
                        .foregroundColor(.white)
                }
                .padding(.vertical, 4)
            }
        }
        .padding(.horizontal, 4)
    }
    
    // MARK: - Helper Computations
    
    private var tackColor: Color {
        switch gpsManager.currentTack {
        case .starboard: return .green
        case .port: return .red
        case .unknown: return .gray
        }
    }
    
    private var shiftColor: Color {
        if gpsManager.shiftIndex >= 0.5 {
            return .green // Lift / Favorable
        } else if gpsManager.shiftIndex <= -0.5 {
            return .red // Header / Negada
        } else {
            return .yellow // Viento estable
        }
    }
    
    private var shiftArrowIcon: String {
        if gpsManager.shiftIndex >= 0.5 {
            return "arrow.up.right.circle.fill"
        } else if gpsManager.shiftIndex <= -0.5 {
            return "arrow.down.left.circle.fill"
        } else {
            return "arrow.right.circle.fill"
        }
    }
    
    private var shiftLabel: String {
        if gpsManager.shiftIndex >= 0.5 {
            return "LIFT (FAVORABLE)"
        } else if gpsManager.shiftIndex <= -0.5 {
            return "HEADER (NEGADA)"
        } else {
            return "ESTABLE"
        }
    }
}

// MARK: - Efecto Flashing Táctico para alertas extremas

struct FlashingModifier: ViewModifier {
    @State private var isRed = false
    
    func body(content: Content) -> some View {
        content
            .opacity(isRed ? 0.3 : 1.0)
            .onAppear {
                withAnimation(Animation.linear(duration: 0.4).repeatForever(autoreverses: true)) {
                    isRed.toggle()
                }
            }
    }
}

extension View {
    func flashingEffect() -> some View {
        self.modifier(FlashingModifier())
    }
}
