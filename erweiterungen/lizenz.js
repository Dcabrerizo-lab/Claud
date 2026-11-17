// Profi-Lizenz für Beratungsstellen (Erweiterung, nicht Teil der App 1.2.0)
// Eine Lizenz ist eine kleine JSON-Datei: { daten: {...}, sig: "..." }. Die Signatur (ECDSA P-256, SHA-256) wird offline mit dem
// öffentlichen Schlüssel geprüft (Web Crypto, im Browser und in Node ab Version 19). Kein Server, keine Daten nach außen.
// Den privaten Schlüssel hat nur der Anbieter (tools/lizenz-schluessel.js legt ihn außerhalb des Repositorys ab).
const Lizenz = (function () {
  'use strict';
  const FELDER = ['v', 'id', 'stelle', 'plaetze', 'ab', 'bis', 'ausgestellt', 'demo'];
  const subtle = () => (typeof crypto !== 'undefined' && crypto.subtle) || (typeof require === 'function' && require('crypto').webcrypto.subtle);

  // feste Reihenfolge der Felder → dieselben Bytes beim Signieren und Prüfen
  function kanonisch(d) {
    const o = {};
    for (const k of FELDER) if (d[k] !== undefined) o[k] = d[k];
    return JSON.stringify(o);
  }
  const b64u = {
    aus: (buf) => { const b = typeof Buffer !== 'undefined' ? Buffer.from(buf).toString('base64') : btoa(String.fromCharCode(...new Uint8Array(buf))); return b.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); },
    nach: (s) => { const t = String(s).replace(/-/g, '+').replace(/_/g, '/'); const p = t + '='.repeat((4 - (t.length % 4)) % 4); return typeof Buffer !== 'undefined' ? new Uint8Array(Buffer.from(p, 'base64')) : Uint8Array.from(atob(p), (c) => c.charCodeAt(0)); }
  };
  const ALG = { name: 'ECDSA', namedCurve: 'P-256' }, SIG = { name: 'ECDSA', hash: 'SHA-256' };
  const enc = (s) => new TextEncoder().encode(s);

  async function signiere(daten, privatJwk) {
    const key = await subtle().importKey('jwk', privatJwk, ALG, false, ['sign']);
    const sig = await subtle().sign(SIG, key, enc(kanonisch(daten)));
    return { daten, sig: b64u.aus(sig) };
  }

  // heute: 'JJJJ-MM-TT'. Ergebnis: { gueltig, grund, stelle, plaetze, bis, tageRest, demo }
  async function pruefe(lizenz, oeffentlichJwk, heute) {
    try {
      if (typeof lizenz === 'string') lizenz = JSON.parse(lizenz);
    } catch (e) { return { gueltig: false, grund: 'format' }; }
    const d = lizenz && lizenz.daten;
    if (!d || typeof lizenz.sig !== 'string' || d.v !== 1 || !d.stelle || !/^\d{4}-\d{2}-\d{2}$/.test(d.bis || '') || !/^\d{4}-\d{2}-\d{2}$/.test(d.ab || '')) return { gueltig: false, grund: 'format' };
    let echt = false;
    try {
      const key = await subtle().importKey('jwk', oeffentlichJwk, ALG, false, ['verify']);
      echt = await subtle().verify(SIG, key, b64u.nach(lizenz.sig), enc(kanonisch(d)));
    } catch (e) { echt = false; }
    if (!echt) return { gueltig: false, grund: 'signatur' };
    const basis = { stelle: d.stelle, plaetze: d.plaetze, ab: d.ab, bis: d.bis, id: d.id, demo: !!d.demo };
    if (heute < d.ab) return Object.assign({ gueltig: false, grund: 'nochNicht' }, basis);
    if (heute > d.bis) return Object.assign({ gueltig: false, grund: 'abgelaufen' }, basis);
    const tageRest = Math.round((Date.parse(d.bis) - Date.parse(heute)) / 864e5);
    return Object.assign({ gueltig: true, grund: 'ok', tageRest, baldAblauf: tageRest <= 30 }, basis);
  }

  const TEXT = {
    ok: 'Lizenz gültig',
    format: 'Diese Datei ist keine SoLo-Lizenz.',
    signatur: 'Die Lizenz ist beschädigt oder verändert worden.',
    nochNicht: 'Die Lizenz gilt erst ab dem angegebenen Datum.',
    abgelaufen: 'Die Lizenz ist abgelaufen. Mit der Verlängerung kommen auch die neuen Werte für das neue Jahr.'
  };

  return { signiere, pruefe, kanonisch, TEXT, b64u };
})();
if (typeof module !== 'undefined') module.exports = Lizenz;
