import SwiftUI

struct MainTabView: View {
    @StateObject private var gpsManager = GPSManager()
    @State private var selectedTab = 1 // Telemetría por defecto
    
    var body: some View {
        TabView(selection: $selectedTab) {
            // Pestaña 1: Cronómetro Regata
            TimerView()
                .tag(0)
            
            // Pestaña 2: Telemetría Primaria (SOG / COG)
            TelemetryView(gpsManager: gpsManager)
                .tag(1)
            
            // Pestaña 3: Táctica (Detector de Borneo)
            TacticaView(gpsManager: gpsManager)
                .tag(2)
        }
        .onAppear {
            // Solicitar permisos e iniciar automáticamente al abrir la app
            gpsManager.requestPermissionsAndStart()
        }
        .onDisappear {
            // Detener GPS al cerrar para ahorrar batería
            gpsManager.stopTracking()
        }
    }
}
