import Foundation
import Capacitor
import UIKit
import Vision

/// Texterkennung auf dem Gerät mit Apple Vision (kein Netz).
/// JavaScript: Capacitor.Plugins.TextRecognition.recognize({ path }) -> { lines: string[] }
/// path: Dateipfad oder file://-URL des Fotos (vom Camera-Plugin).
@objc(TextRecognitionPlugin)
public class TextRecognitionPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "TextRecognitionPlugin"
    public let jsName = "TextRecognition"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "recognize", returnType: CAPPluginReturnPromise)
    ]

    @objc func recognize(_ call: CAPPluginCall) {
        guard let path = call.getString("path"), !path.isEmpty else {
            call.reject("path fehlt")
            return
        }
        let url = path.hasPrefix("file:") ? URL(string: path) : URL(fileURLWithPath: path)
        guard let fileURL = url, let image = UIImage(contentsOfFile: fileURL.path), let cgImage = image.cgImage else {
            call.reject("Bild nicht lesbar")
            return
        }

        let request = VNRecognizeTextRequest { request, error in
            if let error = error {
                call.reject("Texterkennung fehlgeschlagen", nil, error)
                return
            }
            let observations = (request.results as? [VNRecognizedTextObservation]) ?? []
            // Vision liefert keine feste Reihenfolge: von oben nach unten, dann von links nach rechts sortieren
            let sorted = observations.sorted { a, b in
                if abs(a.boundingBox.midY - b.boundingBox.midY) > 0.01 { return a.boundingBox.midY > b.boundingBox.midY }
                return a.boundingBox.minX < b.boundingBox.minX
            }
            let lines = sorted.compactMap { $0.topCandidates(1).first?.string }
            call.resolve(["lines": lines])
        }
        request.recognitionLevel = .accurate
        request.usesLanguageCorrection = true
        request.recognitionLanguages = ["de-DE", "en-US"]

        let orientation = CGImagePropertyOrientation(image.imageOrientation)
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                try VNImageRequestHandler(cgImage: cgImage, orientation: orientation, options: [:]).perform([request])
            } catch {
                call.reject("Texterkennung fehlgeschlagen", nil, error)
            }
        }
    }
}

extension CGImagePropertyOrientation {
    init(_ o: UIImage.Orientation) {
        switch o {
        case .up: self = .up
        case .down: self = .down
        case .left: self = .left
        case .right: self = .right
        case .upMirrored: self = .upMirrored
        case .downMirrored: self = .downMirrored
        case .leftMirrored: self = .leftMirrored
        case .rightMirrored: self = .rightMirrored
        @unknown default: self = .up
        }
    }
}
