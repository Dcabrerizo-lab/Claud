// Gemeinsame Verschlüsselungs-Bausteine für die Vorgänge (src/vorgaenge.js) und die Weitergabe (src/weitergabe.js).
// Läuft in der App und in Node (Tests). Nur WebCrypto, keine eigene Kryptografie.
// Parameter (unverändert gegenüber den bisherigen Kopien in beiden Dateien): Schlüssel aus PBKDF2-HMAC-SHA-256 mit 600 000 Durchläufen
// (OWASP Password Storage Cheat Sheet, abgerufen am 21.11.2026), Salz 16 Byte, IV 12 Byte, AES-GCM mit 256 Bit.
// Gespeicherte Vorgänge tragen ihre Durchläufe selbst (iter): schluessel() nimmt sie, ohne Angabe ITER.
// Wie die Daten aussehen (Felder, AAD), bestimmen weiterhin vorgaenge.js und weitergabe.js.
const Krypto = (function () {
  var ITER = 600000, SALZ = 16, IV = 12;

  function zufall(n) { var a = new Uint8Array(n); globalThis.crypto.getRandomValues(a); return a; }
  function webCrypto() { try { return !!(globalThis.crypto && globalThis.crypto.subtle && globalThis.TextEncoder); } catch (e) { return false; } }
  // PIN → AES-GCM-256-Schlüssel (nicht exportierbar, nur ver- und entschlüsseln)
  function schluessel(pin, salz, iter) {
    var sc = globalThis.crypto && globalThis.crypto.subtle;
    if (!sc) return Promise.reject(new Error('kein WebCrypto'));
    return sc.importKey('raw', new TextEncoder().encode(String(pin)), 'PBKDF2', false, ['deriveKey']).then(function (k) {
      return sc.deriveKey({ name: 'PBKDF2', salt: salz, iterations: iter || ITER, hash: 'SHA-256' }, k, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    });
  }

  // base64 (mit „=“, für gespeicherte Vorgänge) und base64url (ohne „=“, für SoLo-Kodes); in Stücken, damit auch große Daten gehen
  function b64(u8) {
    var s = '', n = 0x8000;
    for (var i = 0; i < u8.length; i += n) s += String.fromCharCode.apply(null, u8.subarray(i, i + n));
    return btoa(s);
  }
  function unb64(s) { var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  function b64url(u8) { return b64(u8).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  // ungültige Zeichen → null (die Weitergabe meldet dann „format“)
  function unb64url(s) {
    if (typeof s !== 'string' || !/^[A-Za-z0-9_-]*$/.test(s)) return null;
    return unb64(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4));
  }

  return { ITER: ITER, SALZ: SALZ, IV: IV, zufall: zufall, webCrypto: webCrypto, schluessel: schluessel, b64: b64, unb64: unb64, b64url: b64url, unb64url: unb64url };
})();
if (typeof module !== 'undefined') module.exports = Krypto;
