// Widerspruchs-Schreiben (Erweiterung, nicht Teil der App 1.2.0)
// Baut einen sachlichen Widerspruch aus den Funden des Bescheid-Checks oder des Pflegegutachten-Checks.
// Der Nutzer prüft jede Begründung selbst und unterschreibt; SoLo entscheidet nichts (Dokumentvorlage, vgl. BGH I ZR 113/20).
const Widerspruch = (function () {
  'use strict';
  const de = (s) => { if (!s) return '…'; const [y, m, d] = s.split('-'); return `${d}.${m}.${y}`; };

  // w = { art: 'sgb2'|'pflege', absender: {name, strasse, ort}, stelle: {name, strasse, ort}, bescheidDatum, zeichen, punkte: [string], heute,
  //       pflege: {pgBescheid, pgZiel}, unterlagenNachreichen: bool, akteneinsicht: bool }
  function text(w) {
    const a = w.absender || {}, s = w.stelle || {};
    const z = [];
    z.push([a.name, a.strasse, a.ort].filter(Boolean).join('\n') || '[Name, Anschrift]');
    z.push('');
    z.push([s.name, s.strasse, s.ort].filter(Boolean).join('\n') || '[Stelle, Anschrift]');
    z.push('');
    z.push(`${a.ort ? a.ort.replace(/^\d{5}\s*/, '') + ', ' : ''}${de(w.heute)}`);
    z.push('');
    const was = { pflege: 'Bescheid über die Feststellung des Pflegegrades', wohngeld: 'Wohngeldbescheid', kiz: 'Bescheid über den Kinderzuschlag', gsa: 'Bescheid über Leistungen der Grundsicherung im Alter und bei Erwerbsminderung' }[w.art] || 'Bescheid über Leistungen zur Sicherung des Lebensunterhalts (Grundsicherungsgeld)';
    z.push(`Widerspruch gegen den ${was} vom ${de(w.bescheidDatum)}`);
    if (w.zeichen) z.push(({ pflege: 'Versichertennummer', wohngeld: 'Wohngeldnummer / Aktenzeichen', kiz: 'Kindergeldnummer', gsa: 'Aktenzeichen' }[w.art] || 'Nummer der Bedarfsgemeinschaft / Aktenzeichen') + ': ' + w.zeichen);
    z.push('');
    z.push('Sehr geehrte Damen und Herren,');
    z.push('');
    z.push(`hiermit lege ich Widerspruch gegen den oben genannten Bescheid ein.`);
    z.push('');
    if (w.art === 'pflege') {
      z.push(`Festgestellt wurde Pflegegrad ${w.pflege && w.pflege.pgBescheid != null ? w.pflege.pgBescheid : '…'}. Nach meiner Überzeugung sind die Beeinträchtigungen im Alltag höher, als im Gutachten bewertet.${w.pflege && w.pflege.pgZiel ? ` Ich beantrage die Feststellung von Pflegegrad ${w.pflege.pgZiel}.` : ''}`);
      z.push('');
      z.push('Begründung: Folgende Kriterien sind im Gutachten zu niedrig bewertet:');
    } else {
      z.push('Begründung: Die Leistungen sind zu niedrig festgesetzt. Insbesondere:');
    }
    z.push('');
    (w.punkte || []).forEach((p, i) => { z.push(`${i + 1}. ${p}`); z.push(''); });
    if (w.art === 'pflege') {
      z.push('Ich bitte um eine erneute Begutachtung, möglichst im häuslichen Umfeld und in Anwesenheit der Pflegeperson.');
      z.push('');
    } else {
      z.push('Ich beantrage, den Bescheid aufzuheben bzw. zu ändern und mir die zustehenden Leistungen in richtiger Höhe nachzuzahlen.');
      z.push('');
    }
    if (w.akteneinsicht) { z.push('Zugleich beantrage ich Akteneinsicht (§ 25 SGB X) bzw. die Übersendung einer Kopie der Unterlagen, auf denen die Entscheidung beruht.'); z.push(''); }
    if (w.unterlagenNachreichen) { z.push('Eine ausführliche Begründung und weitere Unterlagen reiche ich nach.'); z.push(''); }
    z.push('Bitte bestätigen Sie mir den Eingang dieses Widerspruchs.');
    z.push('');
    z.push('Mit freundlichen Grüßen');
    z.push('');
    z.push('');
    z.push('________________________________');
    z.push(a.name || '[Unterschrift]');
    return z.join('\n');
  }

  // Antrag auf Höherstufung (Neufeststellung des Pflegegrades), wenn sich der Zustand seit der letzten Begutachtung verschlechtert hat.
  // Jederzeit möglich, keine Frist; höhere Leistungen ab dem Monat des Antrags (§ 33 Abs. 1 SGB XI, § 48 SGB X).
  // w = { absender, stelle, zeichen, heute, pgJetzt, seit (Datum der letzten Begutachtung), punkte: [string], arzt: bool }
  function hoeherstufung(w) {
    const a = w.absender || {}, s = w.stelle || {};
    const z = [];
    z.push([a.name, a.strasse, a.ort].filter(Boolean).join('\n') || '[Name, Anschrift]');
    z.push('');
    z.push([s.name, s.strasse, s.ort].filter(Boolean).join('\n') || '[Pflegekasse, Anschrift]');
    z.push('');
    z.push(`${a.ort ? a.ort.replace(/^\d{5}\s*/, '') + ', ' : ''}${de(w.heute)}`);
    z.push('');
    z.push('Antrag auf Höherstufung des Pflegegrades');
    if (w.zeichen) z.push(`Versichertennummer: ${w.zeichen}`);
    z.push('');
    z.push('Sehr geehrte Damen und Herren,');
    z.push('');
    z.push(`derzeit ist Pflegegrad ${w.pgJetzt != null && w.pgJetzt !== '' ? w.pgJetzt : '…'} festgestellt${w.seit ? ` (Begutachtung vom ${de(w.seit)})` : ''}. Seitdem hat sich der Gesundheitszustand deutlich verschlechtert, der Hilfebedarf ist gestiegen. Ich beantrage deshalb die erneute Begutachtung und die Feststellung eines höheren Pflegegrades.`);
    z.push('');
    z.push('Folgendes hat sich verändert:');
    z.push('');
    (w.punkte || []).forEach((p, i) => { z.push(`${i + 1}. ${p}`); z.push(''); });
    if (w.arzt) { z.push('Ärztliche Unterlagen zu den Veränderungen füge ich bei bzw. reiche ich nach.'); z.push(''); }
    z.push('Ich bitte um eine Begutachtung im häuslichen Umfeld und in Anwesenheit der Pflegeperson. Bitte bestätigen Sie mir den Eingang dieses Antrags.');
    z.push('');
    z.push('Mit freundlichen Grüßen');
    z.push('');
    z.push('');
    z.push('________________________________');
    z.push(a.name || '[Unterschrift]');
    return z.join('\n');
  }
  // Punkte für den Höherstufungsantrag: was sich verändert hat (gleiche Auswahl wie beim Widerspruch, andere Formulierung)
  function punkteHoeher(auswahl, Pflege) {
    return auswahl.map((x) => {
      const k = Pflege.kriterium(x.id), sk = Pflege.SKALA[k.s].stufen;
      return `${k.id} ${k.name}: bei der letzten Begutachtung „${sk[x.stufeIst]}“, heute „${sk[x.stufeSoll]}“. ${x.alltag ? x.alltag.trim() : '[Bitte beschreiben, was sich verändert hat und seit wann.]'}`;
    });
  }

  // Begründungs-Punkte aus einem Bescheid-Check (Grundsicherungsgeld, Wohngeld, Kinderzuschlag: gleiche Form)
  function punkteSGB2(res) {
    return res.gruende.map((p) => `${p.name} (${p.recht}): ${p.grund}`);
  }
  // Begründungs-Punkte aus dem Pflegegutachten: auswahl = [{id, stufeIst, stufeSoll, alltag}] (alltag = eigene Beschreibung, Pflicht)
  function punktePflege(auswahl, Pflege) {
    return auswahl.map((x) => {
      const k = Pflege.kriterium(x.id);
      const sk = Pflege.SKALA[k.s].stufen;
      return `${k.id} ${k.name}: im Gutachten „${sk[x.stufeIst]}“, tatsächlich „${sk[x.stufeSoll]}“. ${x.alltag ? x.alltag.trim() : '[Bitte beschreiben, wie es im Alltag wirklich ist.]'}`;
    });
  }

  return { text, hoeherstufung, punkteSGB2, punktePflege, punkteHoeher };
})();
if (typeof module !== 'undefined') module.exports = Widerspruch;
