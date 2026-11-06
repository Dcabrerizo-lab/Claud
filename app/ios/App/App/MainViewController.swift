import UIKit
import Capacitor

/// Startbildschirm der App (in Main.storyboard eingetragen). Registriert die eigenen Plugins.
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(TextRecognitionPlugin())
    }
}
