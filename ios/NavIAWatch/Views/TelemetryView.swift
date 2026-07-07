import SwiftUI

struct TelemetryView: View {
    @ObservedObject var gpsManager: GPSManager
    
    var body: some View {
        VStack(spacing: 2) {
            // Cabecera e Indicador GPS
            HStack {
                Text("LASER TELEMETRÍA")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(.gray)
                Spacer()
                Circle()
                    .fill(gpsIndicatorColor)
                    .frame(width: 8, height: 8)
            }
            .padding(.horizontal, 8)
            
            // VELOCIDAD SOG GIGANTE (Knots)
            VStack(spacing: -4) {
                Text(String(format: "%.1f", gpsManager.speedInKnots))
                    .font(.system(size: 60, weight: .black, design: .rounded))
                    .foregroundColor(.cyan)
                    .minimumScaleFactor(0.8)
                Text("NUDOS (SOG)")
                    .font(.system(size: 10, weight: .black))
                    .foregroundColor(.gray)
            }
            
            // RUMBO COG (Degrees)
            HStack(spacing: 12) {
                VStack(alignment: .center) {
                    Text(String(format: "%03.0f°", gpsManager.courseInDegrees))
                        .font(.system(size: 26, weight: .bold, design: .monospaced))
                        .foregroundColor(.white)
                    Text("RUMBO (COG)")
                        .font(.system(size: 8, weight: .bold))
                        .foregroundColor(.gray)
                }
                
                Divider()
                    .background(Color.gray.opacity(0.5))
                    .frame(height: 32)
                
                // Botón de control rápido
                Button(action: {
                    if gpsManager.isTracking {
                        gpsManager.stopTracking()
                    } else {
                        gpsManager.requestPermissionsAndStart()
                    }
                }) {
                    Image(systemName: gpsManager.isTracking ? "stop.fill" : "play.fill")
                        .font(.headline)
                        .foregroundColor(gpsManager.isTracking ? .red : .green)
                }
                .buttonStyle(BorderedButtonStyle(tint: gpsManager.isTracking ? .red.opacity(0.2) : .green.opacity(0.2)))
                .frame(width: 44, height: 36)
            }
            .padding(.top, 2)
        }
        .padding(.horizontal, 4)
    }
    
    private var gpsIndicatorColor: Color {
        guard gpsManager.isTracking else { return .gray }
        if gpsManager.gpsAccuracy < 10.0 {
            return .green // Excelente precisión
        } else if gpsManager.gpsAccuracy < 20.0 {
            return .yellow // Precisión moderada
        } else {
            return .red // Mala señal
        }
    }
}
