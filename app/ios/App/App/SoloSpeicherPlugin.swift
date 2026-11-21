import Foundation
import Capacitor
import UIKit

private enum SpeicherFehler: Error { case ort, pruefen, gesperrt }

/// Speicher für die Angaben auf iOS, ohne iCloud- und Finder-Sicherung.
/// Capacitor Preferences speichert in UserDefaults (Library/Preferences); die gehen mit in jede Sicherung.
/// Dieses Plugin legt die Werte stattdessen in Library/Application Support/SoLo/angaben.json ab:
/// Ordner und Datei mit isExcludedFromBackup (nicht in iCloud-/Finder-Sicherung, Apple: URLResourceValues.isExcludedFromBackup)
/// und Datenschutzklasse .complete (FileProtectionType.complete, seit 21.11.2026; vorher „bis zum ersten Entsperren“):
/// Die Datei ist nur lesbar und schreibbar, solange das Gerät entsperrt ist (etwa 10 Sekunden nach dem Sperren nicht mehr).
/// Die App schreibt nur im Vordergrund: beim Wechsel in den Hintergrund speichert src/app.js sofort (flush), also vor dem Sperren.
/// Während das Gerät gesperrt ist, lehnt das Plugin Schreiben ab (JavaScript meldet dann „Speichern nicht möglich“) und liest aus dem
/// Arbeitsspeicher; ist die Datei noch nicht gelesen, wird wie bisher nichts gelesen und nichts geschrieben, bis sie lesbar ist.
/// Umstellung vorhandener Dateien: beim nächsten Lesen nach dem Entsperren bekommt die Datei die neue Schutzklasse (setAttributes),
/// spätestens beim nächsten Schreiben (atomares Schreiben legt sie mit .completeFileProtection neu an).
/// JavaScript: dieselben Aufrufe wie Preferences (get, set, remove, keys, clear); src/app.js nimmt es statt Preferences, wenn vorhanden.
/// Übernahme: Beim ersten Start werden alle Werte aus Preferences (UserDefaults, Schlüssel „CapacitorStorage.<key>“) in die Datei
/// geschrieben, wieder gelesen und verglichen; erst danach aus UserDefaults gelöscht. Klappt das Anlegen oder Schreiben nicht und gibt es
/// die Datei noch nicht, arbeitet das Plugin wie bisher mit UserDefaults weiter (kein Datenverlust; dann aber mit Sicherung, siehe info → ohneSicherung).
/// Gibt es die Datei schon, wird nie auf UserDefaults ausgewichen (Unabhängige Prüfung 21.11.2026, zweiter Durchgang).
/// Ist eine vorhandene Datei gerade nicht lesbar, wird nichts gelesen und nichts geschrieben, bis sie lesbar ist (Unabhängige Prüfung 21.11.2026).
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
    private var bereit = false // true: Datei gelesen oder neu angelegt
    private var ohneMerkmal = false // true: Ordner ließ sich nicht von der Sicherung ausnehmen
    private var datei: URL?
    private var gesperrt = false // true: Gerät gesperrt, Dateien mit Schutzklasse .complete gerade nicht lesbar oder schreibbar

    override public func load() {
        let nc = NotificationCenter.default
        nc.addObserver(self, selector: #selector(geschuetztWeg), name: UIApplication.protectedDataWillBecomeUnavailableNotification, object: nil)
        nc.addObserver(self, selector: #selector(geschuetztDa), name: UIApplication.protectedDataDidBecomeAvailableNotification, object: nil)
        let frei: Bool = Thread.isMainThread ? UIApplication.shared.isProtectedDataAvailable : true
        warteschlange.sync {
            self.gesperrt = !frei
            self.vorbereiten()
        }
    }

    @objc private func geschuetztWeg() { warteschlange.async { self.gesperrt = true } }
    @objc private func geschuetztDa() { warteschlange.async { self.gesperrt = false } }

    /// Schutzklasse .complete nachträglich setzen (Dateien aus der Zeit vor dem 21.11.2026)
    private static func schutzSetzen(_ url: URL) {
        try? FileManager.default.setAttributes([.protectionKey: FileProtectionType.complete], ofItemAtPath: url.path)
    }

    private static func ausSicherung(_ url: URL) throws {
        var u = url
        var rv = URLResourceValues()
        rv.isExcludedFromBackup = true
        try u.setResourceValues(rv)
    }

    /// Liest die Datei und übernimmt alte Werte. Läuft beim Laden und, solange es nicht geklappt hat, vor jedem Aufruf erneut.
    /// Drei Ausgänge:
    ///   bereit   – Datei gelesen oder neu angelegt: alle Aufrufe arbeiten mit der Datei.
    ///   ausweich – es gibt noch keine Datei, und Ordner oder Datei lassen sich nicht anlegen oder schreiben: wie bisher UserDefaults (nichts wurde verändert).
    ///   keins    – die Datei gibt es, sie ist aber gerade nicht lesbar oder nicht schreibbar (z. B. Gerät seit dem Einschalten noch nie entsperrt):
    ///              Lesen und Schreiben werden abgelehnt, bis sie lesbar ist. So überschreibt ein leerer Start nie vorhandene Angaben.
    private func vorbereiten() {
        if bereit || ausweich { return }
        // Gerät gesperrt: nichts entscheiden (sonst würde ein erstes Anlegen scheitern und dauerhaft auf UserDefaults ausgewichen)
        if gesperrt { return }
        let fm = FileManager.default
        guard let basis = fm.urls(for: .applicationSupportDirectory, in: .userDomainMask).first else { ausweich = true; return }
        let ordner = basis.appendingPathComponent("SoLo", isDirectory: true)
        let url = ordner.appendingPathComponent("angaben.json", isDirectory: false)
        var gab = fm.fileExists(atPath: url.path)
        // Auf UserDefaults ausweichen nur, solange es die Datei noch nicht gibt. Liegen die Angaben schon in der Datei, bleibt es bei der Datei:
        // sonst sähe die App leer aus, neue Eingaben gingen in UserDefaults und würden beim nächsten Start mit der Datei vermischt.
        do {
            try fm.createDirectory(at: ordner, withIntermediateDirectories: true, attributes: nil)
        } catch {
            if gab { return } // später erneut versuchen, bis dahin nichts lesen und nichts schreiben
            ausweich = true
            return
        }
        do {
            try SoloSpeicherPlugin.ausSicherung(ordner)
            ohneMerkmal = false
        } catch {
            if !gab { ausweich = true; return }
            ohneMerkmal = true // Datei weiter benutzen; info meldet dann ohneSicherung = false
        }
        datei = url
        var geladen: [String: String] = [:]
        if gab {
            let data: Data
            do { data = try Data(contentsOf: url) } catch { return } // gerade nicht lesbar: später erneut, bis dahin nichts schreiben
            if let d = (try? JSONSerialization.jsonObject(with: data, options: [])) as? [String: String] {
                geladen = d
                SoloSpeicherPlugin.schutzSetzen(url) // Umstellung auf .complete ohne auf das nächste Schreiben zu warten
            } else {
                // Inhalt beschädigt: Datei nicht überschreiben, sondern daneben aufheben (gleicher Ordner, ohne Sicherung) und leer beginnen
                let defekt = url.deletingLastPathComponent().appendingPathComponent("angaben-defekt.json", isDirectory: false)
                try? fm.removeItem(at: defekt)
                do { try fm.moveItem(at: url, to: defekt) } catch { return }
                SoloSpeicherPlugin.schutzSetzen(defekt)
                gab = false
            }
        }
        // Werte aus Preferences übernehmen. Steht ein Schlüssel schon in der Datei, gewinnt die Datei (sie ist nie älter:
        // UserDefaults wird nur benutzt, solange es die Datei nicht gibt; Reste dort stammen von einer abgebrochenen Übernahme).
        let ud = UserDefaults.standard
        var alt: [String] = []
        for (k, v) in ud.dictionaryRepresentation() where k.hasPrefix(SoloSpeicherPlugin.praefix) {
            guard let s = v as? String else { continue }
            let kurz = String(k.dropFirst(SoloSpeicherPlugin.praefix.count))
            if geladen[kurz] == nil { geladen[kurz] = s }
            alt.append(k)
        }
        werte = geladen
        if !alt.isEmpty || !gab {
            do {
                try schreiben()
                let pruef = try JSONSerialization.jsonObject(with: Data(contentsOf: url), options: []) as? [String: String]
                guard pruef == werte else { throw SpeicherFehler.pruefen }
            } catch {
                // Schreiben oder Nachlesen klappt nicht: UserDefaults bleibt unangetastet.
                // Ohne Datei wird wie bisher UserDefaults benutzt; mit Datei wird später erneut versucht (bis dahin nichts lesen, nichts schreiben).
                werte = [:]
                if !gab {
                    try? fm.removeItem(at: url) // keine halb geprüfte Datei liegen lassen: sie würde beim nächsten Start gegen neuere Werte in UserDefaults gewinnen
                    ausweich = true
                }
                return
            }
            for k in alt { ud.removeObject(forKey: k) } // erst nach geprüftem Schreiben
        } else {
            try? SoloSpeicherPlugin.ausSicherung(url)
        }
        bereit = true
    }

    private func schreiben() throws {
        guard let url = datei else { throw SpeicherFehler.ort }
        if gesperrt { throw SpeicherFehler.gesperrt } // Schreiben bei gesperrtem Gerät klappt mit .complete nicht: sauber ablehnen
        let data = try JSONSerialization.data(withJSONObject: werte, options: [])
        try data.write(to: url, options: [.atomic, .completeFileProtection])
        try SoloSpeicherPlugin.ausSicherung(url) // atomares Schreiben legt eine neue Datei an: Merkmal neu setzen
    }

    @objc func get(_ call: CAPPluginCall) {
        guard let key = call.getString("key") else { call.reject("Must provide a key"); return }
        let erg: (ok: Bool, wert: String?) = warteschlange.sync {
            self.vorbereiten()
            if self.ausweich { return (true, UserDefaults.standard.string(forKey: SoloSpeicherPlugin.praefix + key)) }
            if !self.bereit { return (false, nil) }
            return (true, self.werte[key])
        }
        if erg.ok { call.resolve(["value": erg.wert as Any]) } else { call.reject("Speicher gerade nicht lesbar") }
    }

    @objc func set(_ call: CAPPluginCall) {
        guard let key = call.getString("key") else { call.reject("Must provide a key"); return }
        let value = call.getString("value", "")
        let ok: Bool = warteschlange.sync {
            self.vorbereiten()
            if self.ausweich { UserDefaults.standard.set(value, forKey: SoloSpeicherPlugin.praefix + key); return true }
            if !self.bereit { return false }
            let vorher = self.werte[key]
            self.werte[key] = value
            do { try self.schreiben(); return true } catch { self.werte[key] = vorher; return false }
        }
        if ok { call.resolve() } else { call.reject("Speichern nicht möglich") }
    }

    @objc func remove(_ call: CAPPluginCall) {
        guard let key = call.getString("key") else { call.reject("Must provide a key"); return }
        let ok: Bool = warteschlange.sync {
            self.vorbereiten()
            if self.ausweich { UserDefaults.standard.removeObject(forKey: SoloSpeicherPlugin.praefix + key); return true }
            if !self.bereit { return false }
            guard let vorher = self.werte.removeValue(forKey: key) else { return true }
            do { try self.schreiben(); return true } catch { self.werte[key] = vorher; return false }
        }
        if ok { call.resolve() } else { call.reject("Löschen nicht möglich") }
    }

    @objc func keys(_ call: CAPPluginCall) {
        let liste: [String]? = warteschlange.sync {
            self.vorbereiten()
            if !self.ausweich && !self.bereit { return nil }
            if self.ausweich {
                return UserDefaults.standard.dictionaryRepresentation().keys
                    .filter { $0.hasPrefix(SoloSpeicherPlugin.praefix) }
                    .map { String($0.dropFirst(SoloSpeicherPlugin.praefix.count)) }
            }
            return Array(self.werte.keys)
        }
        if let liste = liste { call.resolve(["keys": liste]) } else { call.reject("Speicher gerade nicht lesbar") }
    }

    @objc func clear(_ call: CAPPluginCall) {
        let ok: Bool = warteschlange.sync {
            self.vorbereiten()
            if !self.ausweich && !self.bereit { return false }
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
        let stand: (Bool, Bool, Bool) = warteschlange.sync { self.vorbereiten(); return (self.bereit, self.ausweich, self.ohneMerkmal) }
        call.resolve(["ohneSicherung": stand.0 && !stand.1 && !stand.2, "bereit": stand.0, "ausweich": stand.1])
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
