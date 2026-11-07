import SwiftUI

/// Pantallas deslizables: Salida · Velocidad · Borneo · Viento · Sesión.
struct MainTabView: View {
    // En depuración, `-pestana N` al lanzar abre directo esa pantalla.
    #if DEBUG
    @State private var pestana = UserDefaults.standard.integer(forKey: "pestana")
    #else
    @State private var pestana = 0
    #endif

    var body: some View {
        TabView(selection: $pestana) {
            CronometroView().tag(0)
            VelocidadView().tag(1)
            BorneoView().tag(2)
            VientoView().tag(3)
            SesionView().tag(4)
        }
        .tabViewStyle(.page)
    }
}

/// Punto de estado del GPS (verde < 10 m, amarillo < 25 m, rojo peor o sin señal).
struct IndicadorGPS: View {
    @EnvironmentObject var gps: GPSManager

    var body: some View {
        Circle()
            .fill(color)
            .frame(width: 7, height: 7)
    }

    private var color: Color {
        guard gps.activo, gps.precision >= 0 else { return .gray }
        if gps.precision < 10 { return .green }
        if gps.precision < 25 { return .yellow }
        return .red
    }
}

/// Cabecera pequeña común a todas las pantallas.
struct Cabecera: View {
    let titulo: String
    var detalle: String?
    var colorDetalle: Color = .gray

    var body: some View {
        HStack(spacing: 4) {
            Text(titulo)
                .font(.system(size: 11, weight: .bold))
                .foregroundStyle(.secondary)
            Spacer()
            if let detalle {
                Text(detalle)
                    .font(.system(size: 11, weight: .heavy))
                    .foregroundStyle(colorDetalle)
            }
            IndicadorGPS()
        }
    }
}
