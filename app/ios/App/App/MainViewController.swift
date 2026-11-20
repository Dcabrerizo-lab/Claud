import UIKit
import WebKit
import Capacitor

/// Startbildschirm der App (SceneDelegate und Main.storyboard). Registriert die eigenen Plugins und schaltet
/// das seitliche Wischen zurück und vorwärts ein (WKWebView.allowsBackForwardNavigationGestures).
/// Die Web-App legt für jede Ebene einen Verlaufseintrag an (History API, src/navigation.js); Wischen vom linken Rand
/// geht damit genau eine Ebene hoch, Wischen vom rechten Rand wieder vor.
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(TextRecognitionPlugin())
        // capacitorDidLoad läuft in loadView, nachdem die WebView erzeugt ist und bevor die Startseite lädt (viewDidLoad)
        guard let webView = webView else { return }
        webView.allowsBackForwardNavigationGestures = true
        // Der Web-App mitteilen, dass das native Wischen aktiv ist (dann kein Rand-Wischen in JavaScript als Rückfall)
        let hinweis = WKUserScript(source: "window.SoLoNativWischen = true;", injectionTime: .atDocumentStart, forMainFrameOnly: true)
        webView.configuration.userContentController.addUserScript(hinweis)
    }
}
