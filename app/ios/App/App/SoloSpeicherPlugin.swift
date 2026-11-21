import Foundation
import Capacitor
import UIKit

private enum SpeicherFehler: Error { case ort, lesen, pruefen }

/// Speicher für die Angaben auf iOS, ohne iCloud- und Finder-Sicherung.
/// Capacitor Preferences speichert in UserDefaults (Library/Preferences); die gehen mit in jede Sicherung.
/// Dieses Plugin legt die Werte stattdessen in Library/Application Support/SoLo/angaben.json ab:
/// Ordner und Datei mit isExcludedFromBackup (nicht in iCloud-/Finder-Sicherung, Apple: URLResourceValues.isExcludedFromBackup)
/// und Datenschutzklasse „bis zum ersten Entsperren“ (wie bisher).
/// JavaScript: dieselben Aufrufe wie Preferences (get, set, remove, keys, clear); src/app.js nimmt es statt Preferences, wenn vorhanden.
/// Übernahme: Beim ersten Start werden alle Werte aus Preferences (UserDefaults, Schlüssel „CapacitorStorage.<key>“) in die Datei
/// geschrieben, wieder gelesen und verglichen; erst danach aus UserDefaults gelöscht. Klappt etwas nicht, arbeitet das Plugin
/// wie bisher mit UserDefaults weiter (kein Datenverlust).
@objc(SoloSpeicherPlugin)
public class SoloSpeicherPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SoloSpeicherPlugin"
    public let jsName = "SoloSpeicher"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "get", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "set", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "remove", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "keys", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clear", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "info", returnType: CAPPluginReturnPromise)
    ]

    private static let praefix = "CapacitorStorage."
    private let warteschlange = DispatchQueue(label: "de.sozialleistungslotse.speicher")
    private var werte: [String: String] = [:]
    private var ausweich = false // true: Datei nicht nutzbar, dann wie bisher UserDefaults
    private var datei: URL?

    override public func load() {
        warteschlange.sync { self.vorbereiten() }
    }

    private static func ausSicherung(_ url: URL) throws {
        var u = url
        var rv = URLResourceValues()
        rv.isExcludedFromBackup = true
        try u.setResourceValues(rv)
    }

    private func vorbereiten() {
        let fm = FileManager.default
        do {
            let basis = try fm.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
            let ordner = basis.appendingPathComponent("SoLo", isDirectory: true)
            try fm.createDirectory(at: ordner, withIntermediateDirectories: true, attributes: nil)
            try SoloSpeicherPlugin.ausSicherung(ordner)
            let url = ordner.appendingPathComponent("angaben.json", isDirectory: false)
            datei = url
            let gab = fm.fileExists(atPath: url.path)
            if gab {
                let data = try Data(contentsOf: url)
                guard let d = try JSONSerialization.jsonObject(with: data, options: []) as? [String: String] else { throw SpeicherFehler.lesen }
                werte = d
            }
            // Werte aus Preferences übernehmen (UserDefaults gewinnt: dort steht nur etwas, was nach der Datei geschrieben wurde)
            let ud = UserDefaults.standard
            var alt: [String] = []
            for (k, v) in ud.dictionaryRepresentation() where k.hasPrefix(SoloSpeicherPlugin.praefix) {
                guard let s = v as? String else { continue }
                werte[String(k.dropFirst(SoloSpeicherPlugin.praefix.count))] = s
                alt.append(k)
            }
            if !alt.isEmpty || !gab {
                try schreiben()
                let pruef = try JSONSerialization.jsonObject(with: Data(contentsOf: url), options: []) as? [String: String]
                guard pruef == werte else { throw SpeicherFehler.pruefen }
                for k in alt { ud.removeObject(forKey: k) }
            } else {
                try SoloSpeicherPlugin.ausSicherung(url)
            }
        } catch {
            ausweich = true
            werte = [:]
        }
    }

    private func schreiben() throws {
        guard let url = datei else { throw SpeicherFehler.ort }
        let data = try JSONSerialization.data(withJSONObject: werte, options: [])
        try data.write(to: url, options: [.atomic, .completeFileProtectionUntilFirstUserAuthentication])
        try SoloSpeicherPlugin.ausSicherung(url) // atomares Schreiben legt eine neue Datei an: Merkmal neu setzen
    }

    @objc func get(_ call: CAPPluginCall) {
        guard let key = call.getString("key") else { call.reject("Must provide a key"); return }
        let wert: String? = warteschlange.sync {
            self.ausweich ? UserDefaults.standard.string(forKey: SoloSpeicherPlugin.praefix + key) : self.werte[key]
        }
        call.resolve(["value": wert as Any])
    }

    @objc func set(_ call: CAPPluginCall) {
        guard let key = call.getString("key") else { call.reject("Must provide a key"); return }
        let value = call.getString("value", "")
        let ok: Bool = warteschlange.sync {
            if self.ausweich { UserDefaults.standard.set(value, forKey: SoloSpeicherPlugin.praefix + key); return true }
            let vorher = self.werte[key]
            self.werte[key] = value
            do { try self.schreiben(); return true } catch { self.werte[key] = vorher; return false }
        }
        if ok { call.resolve() } else { call.reject("Speichern nicht möglich") }
    }

    @objc func remove(_ call: CAPPluginCall) {
        guard let key = call.getString("key") else { call.reject("Must provide a key"); return }
        let ok: Bool = warteschlange.sync {
            if self.ausweich { UserDefaults.standard.removeObject(forKey: SoloSpeicherPlugin.praefix + key); return true }
            guard let vorher = self.werte.removeValue(forKey: key) else { return true }
            do { try self.schreiben(); return true } catch { self.werte[key] = vorher; return false }
        }
        if ok { call.resolve() } else { call.reject("Löschen nicht möglich") }
    }

    @objc func keys(_ call: CAPPluginCall) {
        let liste: [String] = warteschlange.sync {
            if self.ausweich {
                return UserDefaults.standard.dictionaryRepresentation().keys
                    .filter { $0.hasPrefix(SoloSpeicherPlugin.praefix) }
                    .map { String($0.dropFirst(SoloSpeicherPlugin.praefix.count)) }
            }
            return Array(self.werte.keys)
        }
        call.resolve(["keys": liste])
    }

    @objc func clear(_ call: CAPPluginCall) {
        let ok: Bool = warteschlange.sync {
            if self.ausweich {
                let ud = UserDefaults.standard
                for k in ud.dictionaryRepresentation().keys where k.hasPrefix(SoloSpeicherPlugin.praefix) { ud.removeObject(forKey: k) }
                return true
            }
            let vorher = self.werte
            self.werte = [:]
            do { try self.schreiben(); return true } catch { self.werte = vorher; return false }
        }
        if ok { call.resolve() } else { call.reject("Löschen nicht möglich") }
    }

    /// Für Tests auf dem Gerät: ob die Datei ohne Sicherung benutzt wird
    @objc func info(_ call: CAPPluginCall) {
        let aus: Bool = warteschlange.sync { self.ausweich }
        call.resolve(["ohneSicherung": !aus])
    }
}

/// Abdeckung beim Wechsel in den Hintergrund (Vorschau im App-Wechsler), wenn die App-PIN an ist.
/// JavaScript: Capacitor.Plugins.SoloSchutz.setzen({ an: true|false }); SceneDelegate liest SoloSchutzPlugin.aktiv.
/// iOS erlaubt kein Sperren von Bildschirmfotos; die Abdeckung gilt nur für die Vorschau.
@objc(SoloSchutzPlugin)
public class SoloSchutzPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SoloSchutzPlugin"
    public let jsName = "SoloSchutz"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "setzen", returnType: CAPPluginReturnPromise)
    ]
    static var aktiv = false

    @objc func setzen(_ call: CAPPluginCall) {
        let an = call.getBool("an", false)
        DispatchQueue.main.async {
            SoloSchutzPlugin.aktiv = an
            call.resolve()
        }
    }
}
