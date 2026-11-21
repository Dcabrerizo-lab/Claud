import UIKit
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = MainViewController() // eigene Plugins und Wischen zurück (MainViewController.swift)
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    // Vorschau im App-Wechsler verdecken, wenn die App-PIN an ist (SoloSchutzPlugin.aktiv, gesetzt aus src/app.js)
    private var abdeckung: UIView?

    func sceneWillResignActive(_ scene: UIScene) {
        guard SoloSchutzPlugin.aktiv, abdeckung == nil, let w = window else { return }
        let v = UIView(frame: w.bounds)
        v.backgroundColor = .systemBackground
        v.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        if let bild = UIImage(named: "Splash") {
            let iv = UIImageView(image: bild)
            iv.contentMode = .scaleAspectFill
            iv.frame = v.bounds
            iv.autoresizingMask = [.flexibleWidth, .flexibleHeight]
            v.addSubview(iv)
        }
        w.addSubview(v)
        abdeckung = v
    }

    func sceneDidBecomeActive(_ scene: UIScene) {
        abdeckung?.removeFromSuperview()
        abdeckung = nil
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}
