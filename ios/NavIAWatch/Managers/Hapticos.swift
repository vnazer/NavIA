import Foundation
import WatchKit

/// Vibraciones con nombre de uso, para que cada aviso se sienta distinto en la muñeca.
enum Hapticos {
    private static var device: WKInterfaceDevice { WKInterfaceDevice.current() }

    static func toque() { device.play(.click) }
    static func minuto() { device.play(.notification) }
    static func aviso() { device.play(.retry) }
    static func salida() {
        device.play(.success)
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.45) { device.play(.success) }
    }
    static func negada() {
        device.play(.directionDown)
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { device.play(.directionDown) }
    }
    static func favorable() { device.play(.directionUp) }
    static func inicio() { device.play(.start) }
    static func fin() { device.play(.stop) }
}
