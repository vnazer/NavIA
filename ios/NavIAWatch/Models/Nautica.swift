import Foundation

/// Utilidades náuticas puras (réplica Swift de lo esencial de @navia/nav-utils).
/// Todos los ángulos en grados verdaderos [0, 360).
enum Nautica {
    static let msANudos = 1.943844

    static func normalizar(_ grados: Double) -> Double {
        let r = grados.truncatingRemainder(dividingBy: 360)
        return r < 0 ? r + 360 : r
    }

    /// Diferencia firmada `a - b` en (-180, 180]. Positivo = `a` está a la derecha (horario) de `b`.
    static func diferencia(_ a: Double, _ b: Double) -> Double {
        var d = (a - b).truncatingRemainder(dividingBy: 360)
        if d > 180 { d -= 360 } else if d <= -180 { d += 360 }
        return d
    }

    /// Media circular: promedia rumbos sin el error de 359° + 1° = 180°.
    static func mediaCircular(_ angulos: [Double]) -> Double? {
        guard !angulos.isEmpty else { return nil }
        var s = 0.0, c = 0.0
        for a in angulos {
            let r = a * .pi / 180
            s += sin(r)
            c += cos(r)
        }
        guard abs(s) > 1e-9 || abs(c) > 1e-9 else { return nil }
        return normalizar(atan2(s, c) * 180 / .pi)
    }

    /// Dispersión (desviación máxima respecto de la media circular), en grados.
    static func dispersion(_ angulos: [Double]) -> Double {
        guard let media = mediaCircular(angulos) else { return 180 }
        return angulos.map { abs(diferencia($0, media)) }.max() ?? 180
    }

    private static let puntos = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
                                 "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"]

    static func cardinal(_ grados: Double) -> String {
        puntos[Int((normalizar(grados) + 11.25) / 22.5) % 16]
    }

    static func formatoRumbo(_ grados: Double?) -> String {
        guard let g = grados else { return "---°" }
        return String(format: "%03.0f°", normalizar(g.rounded()))
    }
}
