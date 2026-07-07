import SwiftUI
import WatchKit
import Combine

struct TimerView: View {
    @State private var timeRemaining = 300 // 5 minutos por defecto (300 segundos)
    @State private var isRunning = false
    
    var body: some View {
        VStack(spacing: 4) {
            // Conteo Regresivo Gigante
            Text(formatTime(timeRemaining))
                .font(.system(size: 46, weight: .bold, design: .monospaced))
                .foregroundColor(timeRemaining <= 30 ? .red : .yellow)
                .minimumScaleFactor(0.8)
                .padding(.top, 4)
            
            // Botones de Conteo / Start
            HStack(spacing: 8) {
                Button(action: {
                    toggleTimer()
                }) {
                    Image(systemName: isRunning ? "pause.fill" : "play.fill")
                        .font(.title3)
                        .foregroundColor(isRunning ? .orange : .green)
                }
                .buttonStyle(BorderedButtonStyle(tint: isRunning ? .orange.opacity(0.2) : .green.opacity(0.2)))
                .frame(width: 60, height: 40)
                
                Button(action: {
                    resetTimer()
                }) {
                    Text("5M")
                        .font(.headline)
                        .foregroundColor(.cyan)
                }
                .buttonStyle(BorderedButtonStyle(tint: .cyan.opacity(0.2)))
                .frame(width: 60, height: 40)
            }
            
            // BOTÓN SYNC GIGANTE (Ergonomía extrema para Laser)
            Button(action: {
                syncTimer()
            }) {
                Text("SYNC")
                    .font(.system(size: 20, weight: .black))
                    .foregroundColor(.black)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
            .buttonStyle(PrimitiveButtonStyle())
            .background(Color.cyan)
            .cornerRadius(12)
            .frame(height: 52)
            .padding(.horizontal, 4)
            .padding(.top, 4)
        }
        .onReceive(Timer.publish(every: 1.0, on: .main, in: .common).autoconnect()) { _ in
            guard isRunning else { return }
            if timeRemaining > 0 {
                timeRemaining -= 1
                triggerHapticFeedback(for: timeRemaining)
            } else {
                isRunning = false
                WKInterfaceDevice.current().play(.success)
            }
        }
    }
    
    // MARK: - Lógica del Temporizador
    
    private func toggleTimer() {
        isRunning.toggle()
        WKInterfaceDevice.current().play(.click)
    }
    
    private func resetTimer() {
        isRunning = false
        timeRemaining = 300
        WKInterfaceDevice.current().play(.retry)
    }
    
    private func syncTimer() {
        guard isRunning else { return }
        
        // Sincronizar al minuto más cercano (arriba o abajo)
        let secondsInMinute = 60
        let remainder = timeRemaining % secondsInMinute
        
        if remainder > 30 {
            // Redondear hacia arriba (sumar segundos faltantes para completar el minuto)
            timeRemaining += (secondsInMinute - remainder)
        } else {
            // Redondear hacia abajo (restar los segundos sobrantes del minuto)
            timeRemaining -= remainder
        }
        
        // Vibración corta para indicar éxito de sincronización
        WKInterfaceDevice.current().play(.click)
    }
    
    private func formatTime(_ seconds: Int) -> String {
        let minutes = seconds / 60
        let secs = seconds % 60
        return String(format: "%02d:%02d", minutes, secs)
    }
    
    // MARK: - Háptica en Segundo Plano (Sin Sonido en Laser)
    
    private func triggerHapticFeedback(for seconds: Int) {
        if seconds == 0 {
            WKInterfaceDevice.current().play(.success) // ¡SALIDA!
        } else if seconds == 60 || seconds == 120 || seconds == 180 || seconds == 240 {
            WKInterfaceDevice.current().play(.retry) // Cada minuto restante
        } else if seconds == 30 {
            WKInterfaceDevice.current().play(.failure) // 30 segundos
        } else if seconds <= 10 {
            WKInterfaceDevice.current().play(.click) // Segundero de los últimos 10s
        }
    }
}

// Estilo personalizado para el botón gigante SYNC para maximizar área táctil
struct PrimitiveButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.92 : 1.0)
            .animation(.easeOut(duration: 0.1), value: configuration.isPressed)
    }
}
