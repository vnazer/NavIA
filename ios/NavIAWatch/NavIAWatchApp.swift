import SwiftUI

@main
struct NavIAWatchApp: App {
    @StateObject private var modelo = AppModel()

    var body: some Scene {
        WindowGroup {
            MainTabView()
                .environmentObject(modelo)
                .environmentObject(modelo.gps)
                .environmentObject(modelo.tactica)
                .environmentObject(modelo.crono)
                .environmentObject(modelo.sesion)
                .onAppear { modelo.arrancar() }
        }
    }
}
