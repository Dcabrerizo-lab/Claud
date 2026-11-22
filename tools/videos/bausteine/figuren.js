'use strict';
// Comic-Bausteine für SoLo-Videos: Figuren und Gegenstände als SVG.
// Alles selbst gezeichnet. Jede Funktion liefert { w, h, svg } (Inhalt OHNE äußeres <svg>),
// Füße bzw. Unterkante liegen bei y = h. Konturen: Klasse "o" (schwarz, 7 px).

const P = {
  blau: '#2b4a9b', navy: '#1a2456', gold: '#f2b233', hell: '#f2f5f9',
  gruen: '#17643f', gruenhell: '#e2f3ea', warm: '#fbefcf', weiss: '#ffffff',
  grau: '#9aa3b5', grauhell: '#d9dee8', ink: '#111111', rot: '#c8463d',
};
const HAUT = { hell: '#f6d5bd', mittel: '#e3ab82', braun: '#b97a50', dunkel: '#7a4a2c' };
const HAAR = { schwarz: '#231812', braun: '#5b3a22', grau: '#c9ccd3', weiss: '#eef0f3', rotbraun: '#8a4426' };

const O = 'class="o"';
const r = (n) => Math.round(n * 10) / 10;

// ---------- Teile ----------
function armPfad(sx, shX, shY, a1, a2, l1, l2) {
  const d = Math.PI / 180;
  const ex = shX + sx * Math.sin(a1 * d) * l1, ey = shY + Math.cos(a1 * d) * l1;
  const wx = ex + sx * Math.sin((a1 + a2) * d) * l2, wy = ey + Math.cos((a1 + a2) * d) * l2;
  return { d: `M${r(shX)} ${r(shY)} L${r(ex)} ${r(ey)} L${r(wx)} ${r(wy)}`, ex, ey, wx, wy };
}
function dickeLinie(d, farbe, breite) {
  return `<path d="${d}" fill="none" stroke="${P.ink}" stroke-width="${breite + 14}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="${farbe}" stroke-width="${breite}" stroke-linecap="round" stroke-linejoin="round"/>`;
}
function hand(x, y, haut, rad = 24) { return `<circle ${O} cx="${r(x)}" cy="${r(y)}" r="${rad}" fill="${haut}"/>`; }

function miniHandy(x, y, s = 1, winkel = 0) {
  return `<g transform="translate(${r(x)} ${r(y)}) rotate(${winkel}) scale(${s})">
  <rect ${O} x="-30" y="-52" width="60" height="104" rx="12" fill="${P.navy}"/>
  <rect x="-21" y="-40" width="42" height="74" rx="5" fill="${P.hell}"/>
  <path d="M-11 0 l8 8 l15 -17" fill="none" stroke="${P.gruen}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></g>`;
}

function gesicht(cx, cy, R, m = {}) {
  const ex = R * 0.38, ey = cy - R * 0.02;
  const mimik = m.mimik || 'freundlich';
  let s = '';
  // Augen
  if (mimik === 'freude') {
    s += `<path d="M${r(cx - ex - 13)} ${r(ey + 4)} q13 -16 26 0 M${r(cx + ex - 13)} ${r(ey + 4)} q13 -16 26 0" fill="none" stroke="${P.ink}" stroke-width="7" stroke-linecap="round"/>`;
  } else {
    for (const sx of [-1, 1]) {
      s += `<ellipse cx="${r(cx + sx * ex)}" cy="${r(ey)}" rx="10" ry="14" fill="${P.ink}"/><circle cx="${r(cx + sx * ex + 3)}" cy="${r(ey - 5)}" r="3.6" fill="#fff"/>`;
      if (m.wimpern) s += `<path d="M${r(cx + sx * (ex + 8))} ${r(ey - 10)} l${sx * 9} -7" stroke="${P.ink}" stroke-width="5" stroke-linecap="round"/>`;
    }
  }
  // Brauen
  const by = ey - R * 0.33;
  if (mimik === 'sorge') {
    s += `<path d="M${r(cx - ex - 16)} ${r(by + 2)} L${r(cx - ex + 14)} ${r(by - 8)} M${r(cx + ex + 16)} ${r(by + 2)} L${r(cx + ex - 14)} ${r(by - 8)}" stroke="${P.ink}" stroke-width="7" stroke-linecap="round"/>`;
  } else if (mimik === 'denken') {
    s += `<path d="M${r(cx - ex - 15)} ${r(by)} q15 -10 30 0 M${r(cx + ex - 15)} ${r(by - 10)} q15 -8 30 4" fill="none" stroke="${P.ink}" stroke-width="7" stroke-linecap="round"/>`;
  } else {
    s += `<path d="M${r(cx - ex - 15)} ${r(by)} q15 -10 30 0 M${r(cx + ex - 15)} ${r(by)} q15 -10 30 0" fill="none" stroke="${P.ink}" stroke-width="7" stroke-linecap="round"/>`;
  }
  // Wangen
  s += `<circle cx="${r(cx - R * 0.58)}" cy="${r(cy + R * 0.3)}" r="${r(R * 0.15)}" fill="#e8846f" opacity=".35"/><circle cx="${r(cx + R * 0.58)}" cy="${r(cy + R * 0.3)}" r="${r(R * 0.15)}" fill="#e8846f" opacity=".35"/>`;
  // Nase
  s += `<path d="M${r(cx + 2)} ${r(cy + R * 0.1)} q-8 14 4 16" fill="none" stroke="${P.ink}" stroke-width="5" stroke-linecap="round" opacity=".6"/>`;
  // Mund
  const my = cy + R * 0.45;
  if (mimik === 'freude') {
    s += `<path ${O} d="M${r(cx - 30)} ${r(my - 4)} Q${r(cx)} ${r(my + 40)} ${r(cx + 30)} ${r(my - 4)} Z" fill="#7a2230"/><path d="M${r(cx - 14)} ${r(my + 16)} q14 -10 28 0" fill="#e86a6a"/>`;
  } else if (mimik === 'sorge') {
    s += `<path d="M${r(cx - 20)} ${r(my + 10)} q10 -10 20 -2 q10 8 20 -2" fill="none" stroke="${P.ink}" stroke-width="6" stroke-linecap="round"/>`;
  } else if (mimik === 'denken') {
    s += `<path d="M${r(cx - 14)} ${r(my + 6)} L${r(cx + 18)} ${r(my)}" stroke="${P.ink}" stroke-width="6" stroke-linecap="round"/>`;
  } else {
    s += `<path d="M${r(cx - 26)} ${r(my)} Q${r(cx)} ${r(my + 24)} ${r(cx + 26)} ${r(my)}" fill="none" stroke="${P.ink}" stroke-width="6.5" stroke-linecap="round"/>`;
  }
  if (m.brille) {
    s += `<g fill="none" stroke="${P.ink}" stroke-width="5.5"><circle cx="${r(cx - ex)}" cy="${r(ey)}" r="24"/><circle cx="${r(cx + ex)}" cy="${r(ey)}" r="24"/><path d="M${r(cx - ex + 24)} ${r(ey)} h${r(2 * ex - 48)}"/></g>`;
  }
  return s;
}

// Haare: hinten (vor dem Kopf gezeichnet) und vorne
function haare(stil, cx, cy, R, farbe) {
  const k = (x, y) => `${r(cx + x * R)} ${r(cy + y * R)}`;
  const vorne = [], hinten = [];
  switch (stil) {
    case 'bob': // kurzer Bob mit seitlichem Pony (Lotsin)
      hinten.push(`<path ${O} fill="${farbe}" d="M${k(-1.12, 0.62)} C${k(-1.3, -0.6)} ${k(-0.6, -1.25)} ${k(0.1, -1.18)} C${k(0.8, -1.15)} ${k(1.32, -0.6)} ${k(1.12, 0.62)} C${k(1.0, 0.75)} ${k(0.85, 0.72)} ${k(0.8, 0.6)} L${k(-0.8, 0.6)} C${k(-0.85, 0.72)} ${k(-1.0, 0.75)} ${k(-1.12, 0.62)} Z"/>`);
      vorne.push(`<path ${O} fill="${farbe}" d="M${k(-0.98, 0.25)} C${k(-1.08, -0.8)} ${k(-0.2, -1.22)} ${k(0.45, -1.02)} C${k(1.0, -0.85)} ${k(1.1, -0.2)} ${k(0.98, 0.25)} C${k(0.9, -0.1)} ${k(0.8, -0.3)} ${k(0.62, -0.42)} C${k(0.2, -0.38)} ${k(-0.25, -0.55)} ${k(-0.45, -0.72)} C${k(-0.6, -0.4)} ${k(-0.8, -0.1)} ${k(-0.98, 0.25)} Z"/>`);
      break;
    case 'kurz': // Kurzhaarschnitt mit seitlichem Pony
      vorne.push(`<path ${O} fill="${farbe}" d="M${k(-1.02, 0.1)} C${k(-1.12, -0.9)} ${k(-0.2, -1.32)} ${k(0.45, -1.08)} C${k(1.05, -0.88)} ${k(1.15, -0.2)} ${k(1.02, 0.18)} L${k(0.86, -0.18)} C${k(0.55, -0.55)} ${k(0.1, -0.52)} ${k(-0.38, -0.62)} C${k(-0.5, -0.35)} ${k(-0.78, -0.15)} ${k(-0.9, 0.3)} Z"/>`);
      break;
    case 'kurzmann':
      vorne.push(`<path ${O} fill="${farbe}" d="M${k(-0.98, -0.05)} C${k(-1.05, -0.95)} ${k(0.1, -1.25)} ${k(0.75, -0.95)} C${k(1.05, -0.75)} ${k(1.05, -0.3)} ${k(0.98, -0.05)} L${k(0.8, -0.42)} C${k(0.3, -0.6)} ${k(-0.3, -0.58)} ${k(-0.82, -0.4)} Z"/>`);
      break;
    case 'locken': {
      let c = '';
      const pts = [[-0.85, -0.35], [-0.7, -0.7], [-0.35, -0.95], [0.05, -1.03], [0.45, -0.95], [0.78, -0.7], [0.9, -0.35], [-0.3, -0.62], [0.2, -0.66]];
      for (const [x, y] of pts) c += `<circle ${O} cx="${r(cx + x * R)}" cy="${r(cy + y * R)}" r="${r(R * 0.3)}" fill="${farbe}"/>`;
      for (const [x, y] of pts) c += `<circle cx="${r(cx + x * R)}" cy="${r(cy + y * R)}" r="${r(R * 0.3 - 4)}" fill="${farbe}"/>`;
      vorne.push(c);
      break;
    }
    case 'dutt':
      hinten.push(`<circle ${O} cx="${r(cx)}" cy="${r(cy - R * 1.1)}" r="${r(R * 0.36)}" fill="${farbe}"/>`);
      vorne.push(`<path ${O} fill="${farbe}" d="M${k(-1.0, 0.15)} C${k(-1.05, -0.85)} ${k(-0.3, -1.12)} ${k(0, -1.05)} C${k(0.3, -1.12)} ${k(1.05, -0.85)} ${k(1.0, 0.15)} C${k(0.85, -0.3)} ${k(0.5, -0.62)} ${k(0, -0.6)} C${k(-0.5, -0.62)} ${k(-0.85, -0.3)} ${k(-1.0, 0.15)} Z"/>`);
      break;
    case 'zoepfe':
      hinten.push(`<circle ${O} cx="${r(cx - R * 1.08)}" cy="${r(cy + R * 0.1)}" r="${r(R * 0.32)}" fill="${farbe}"/><circle ${O} cx="${r(cx + R * 1.08)}" cy="${r(cy + R * 0.1)}" r="${r(R * 0.32)}" fill="${farbe}"/>`);
      vorne.push(`<path ${O} fill="${farbe}" d="M${k(-1.0, 0.05)} C${k(-1.08, -1.45)} ${k(1.08, -1.45)} ${k(1.0, 0.05)} C${k(0.7, -0.45)} ${k(0.2, -0.5)} ${k(0.05, -0.62)} C${k(-0.2, -0.45)} ${k(-0.7, -0.45)} ${k(-1.0, 0.05)} Z"/>`);
      break;
    case 'zopf':
      hinten.push(`<path ${O} fill="${farbe}" d="M${k(0.6, -0.6)} C${k(1.5, -0.5)} ${k(1.45, 0.6)} ${k(1.15, 1.0)} C${k(1.05, 0.5)} ${k(0.9, 0.0)} ${k(0.7, -0.2)} Z"/>`);
      vorne.push(`<path ${O} fill="${farbe}" d="M${k(-1.0, 0.1)} C${k(-1.08, -0.9)} ${k(0.1, -1.2)} ${k(0.7, -0.92)} C${k(1.05, -0.7)} ${k(1.06, -0.2)} ${k(1.0, 0.1)} C${k(0.8, -0.35)} ${k(0.4, -0.55)} ${k(-0.1, -0.55)} C${k(-0.55, -0.5)} ${k(-0.85, -0.25)} ${k(-1.0, 0.1)} Z"/>`);
      break;
    case 'kranz': // Haarkranz, ältere Person
      vorne.push(`<path ${O} fill="${farbe}" d="M${k(-1.02, 0.25)} C${k(-1.1, -0.3)} ${k(-0.95, -0.55)} ${k(-0.7, -0.62)} C${k(-0.75, -0.3)} ${k(-0.85, -0.05)} ${k(-0.8, 0.3)} Z"/><path ${O} fill="${farbe}" d="M${k(1.02, 0.25)} C${k(1.1, -0.3)} ${k(0.95, -0.55)} ${k(0.7, -0.62)} C${k(0.75, -0.3)} ${k(0.85, -0.05)} ${k(0.8, 0.3)} Z"/>`);
      break;
    case 'kopftuch': // Hidschab: deckt Haare und Hals, Gesichtsöffnung frei
      hinten.push(`<path ${O} fill="${farbe}" d="M${k(-1.2, 0.0)} C${k(-1.3, -1.55)} ${k(1.3, -1.55)} ${k(1.2, 0.0)} C${k(1.25, 0.8)} ${k(1.0, 1.25)} ${k(0.7, 1.55)} L${k(-0.7, 1.55)} C${k(-1.0, 1.25)} ${k(-1.25, 0.8)} ${k(-1.2, 0.0)} Z"/>`);
      vorne.push(`<path ${O} fill="${farbe}" d="M${k(-1.1, 0.3)} C${k(-1.2, -1.45)} ${k(1.2, -1.45)} ${k(1.1, 0.3)} L${k(0.86, 0.22)} C${k(0.92, -0.82)} ${k(-0.92, -0.82)} ${k(-0.86, 0.22)} Z"/><path d="M${k(-0.55, -0.9)} C${k(-0.2, -1.04)} ${k(0.2, -1.04)} ${k(0.55, -0.9)}" fill="none" stroke="#ffffff" stroke-opacity=".25" stroke-width="10" stroke-linecap="round"/>`);
      break;
    default: break;
  }
  return { vorne: vorne.join(''), hinten: hinten.join('') };
}

// ---------- Person ----------
// opt: haut, haar, haarfarbe, oben, unten, schuhe, arme:{l:[a1,a2], r:[a1,a2]}, mimik, brille, kind, rock, bart, handyIn:'l'|'r', rucksack, kragen
function person(opt) {
  const kind = !!opt.kind;
  const W = 400, H = kind ? 600 : 900;
  const R = kind ? 82 : 90;
  const cx = 200, cy = kind ? 120 : 140;
  const halsY = cy + R * 0.85;
  const schY = cy + R + (kind ? 30 : 40);
  const huefY = kind ? 390 : 560;
  const fussY = H - 22;
  const haut = HAUT[opt.haut] || opt.haut || HAUT.mittel;
  const hf = HAAR[opt.haarfarbe] || opt.haarfarbe || HAAR.schwarz;
  const oben = opt.oben || P.blau, unten = opt.unten || P.navy;
  const schuhe = opt.schuhe || P.ink;
  const sw = kind ? 92 : 78; // halbe Schulterbreite
  const arme = opt.arme || { l: [12, 8], r: [12, 8] };
  const l1 = kind ? 90 : 122, l2 = kind ? 82 : 112, armB = kind ? 34 : 40;
  let s = '';
  const H2 = haare(opt.haar || 'kurz', cx, cy, R, hf);
  // Rucksack hinten
  if (opt.rucksack) s += `<rect ${O} x="${cx - sw - 16}" y="${schY + 10}" width="${2 * sw + 32}" height="${huefY - schY - 40}" rx="40" fill="${opt.rucksack}"/>`;
  // Beine
  if (!opt.sitzend) {
    const lb = kind ? 40 : 50;
    s += dickeLinie(`M${cx - 30} ${huefY - 10} L${cx - 36} ${fussY - 14}`, unten, lb);
    s += dickeLinie(`M${cx + 30} ${huefY - 10} L${cx + 36} ${fussY - 14}`, unten, lb);
    s += `<path ${O} d="M${cx - 80} ${fussY + 4} q4 -32 44 -32 q26 0 26 32 z" fill="${schuhe}"/>`;
    s += `<path ${O} d="M${cx + 80} ${fussY + 4} q-4 -32 -44 -32 q-26 0 -26 32 z" fill="${schuhe}"/>`;
  }
  // Hals
  s += `<rect ${O} x="${cx - 24}" y="${halsY - 10}" width="48" height="${schY - halsY + 30}" fill="${haut}"/>`;
  // Rumpf
  const rockY = opt.rock ? huefY + (kind ? 70 : 120) : huefY;
  const unterB = opt.rock ? sw + 30 : sw - 12;
  s += `<path ${O} fill="${oben}" d="M${cx - sw} ${schY + 30} Q${cx - sw} ${schY} ${cx - sw + 30} ${schY} L${cx + sw - 30} ${schY} Q${cx + sw} ${schY} ${cx + sw} ${schY + 30} L${cx + unterB} ${rockY} Q${cx} ${rockY + 12} ${cx - unterB} ${rockY} Z"/>`;
  if (opt.rock && opt.rockFarbe) {
    s += `<path ${O} fill="${opt.rockFarbe}" d="M${cx - sw + 6} ${huefY - 20} L${cx + sw - 6} ${huefY - 20} L${cx + unterB} ${rockY} Q${cx} ${rockY + 12} ${cx - unterB} ${rockY} Z"/>`;
  }
  if (opt.kragen === 'v') { // Blazer mit weißem Oberteil
    s += `<path ${O} fill="#fff" d="M${cx - 34} ${schY} L${cx} ${schY + 80} L${cx + 34} ${schY} Z"/>`;
    s += `<path d="M${cx} ${schY + 84} L${cx} ${huefY - 8}" stroke="${P.ink}" stroke-width="5"/><circle cx="${cx + 14}" cy="${schY + 140}" r="7" fill="${P.ink}"/>`;
  } else if (opt.kragen === 'hoodie') {
    s += `<path d="M${cx - 50} ${schY + 4} Q${cx} ${schY + 60} ${cx + 50} ${schY + 4}" fill="none" stroke="${P.ink}" stroke-width="6"/><path d="M${cx - 18} ${schY + 30} v60 M${cx + 18} ${schY + 30} v60" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`;
    s += `<rect ${O} x="${cx - 60}" y="${huefY - 110}" width="120" height="60" rx="16" fill="${oben}"/>`;
  } else if (opt.kragen === 'strick') {
    s += `<path d="M${cx - 30} ${schY} L${cx} ${schY + 60} L${cx + 30} ${schY}" fill="#fff" stroke="${P.ink}" stroke-width="6"/>` +
      [0, 1, 2].map((i) => `<circle cx="${cx}" cy="${schY + 90 + i * 50}" r="7" fill="${P.ink}"/>`).join('');
  }
  if (opt.rucksack) s += `<path d="M${cx - sw + 22} ${schY + 4} L${cx - sw + 30} ${huefY - 50} M${cx + sw - 22} ${schY + 4} L${cx + sw - 30} ${huefY - 50}" stroke="${P.ink}" stroke-width="14" stroke-linecap="round"/>`;
  // Kopf
  s += H2.hinten;
  s += `<circle ${O} cx="${cx - R + 2}" cy="${cy + 8}" r="18" fill="${haut}"/><circle ${O} cx="${cx + R - 2}" cy="${cy + 8}" r="18" fill="${haut}"/>`;
  if (opt.haar === 'kopftuch') s = s.replace(/<circle class="o" cx="\d+(\.\d+)?" cy="\d+(\.\d+)?" r="18"[^>]*>/g, '');
  s += `<circle ${O} cx="${cx}" cy="${cy}" r="${R}" fill="${haut}"/>`;
  if (opt.bart) s += `<path ${O} fill="${hf}" d="M${cx - R * 0.92} ${cy + 6} C${cx - R * 0.9} ${cy + R * 1.25} ${cx + R * 0.9} ${cy + R * 1.25} ${cx + R * 0.92} ${cy + 6} C${cx + R * 0.6} ${cy + R * 0.55} ${cx - R * 0.6} ${cy + R * 0.55} ${cx - R * 0.92} ${cy + 6} Z"/>`;
  s += gesicht(cx, cy, R, opt);
  s += H2.vorne;
  if (opt.ohrringe) s += `<circle ${O} cx="${cx - R + 2}" cy="${cy + 34}" r="8" fill="${P.gold}" stroke-width="4"/><circle ${O} cx="${cx + R - 2}" cy="${cy + 34}" r="8" fill="${P.gold}" stroke-width="4"/>`;
  // Arme
  const shL = [cx - sw + 18, schY + 26], shR = [cx + sw - 18, schY + 26];
  const AL = armPfad(-1, shL[0], shL[1], arme.l[0], arme.l[1], l1, arme.l[2] ? l2 * arme.l[2] : l2);
  const AR = armPfad(1, shR[0], shR[1], arme.r[0], arme.r[1], l1, arme.r[2] ? l2 * arme.r[2] : l2);
  const armFarbe = opt.armFarbe || oben;
  const wink = opt.wink; // 'r' | 'l' → Arm erhält Klasse für Winkbewegung
  const armSvg = (A, sh, seite) => {
    let g = dickeLinie(A.d, armFarbe, armB) + hand(A.wx, A.wy, haut, kind ? 20 : 24);
    if (opt.handyIn === seite) g += miniHandy(A.wx + (seite === 'r' ? 4 : -4), A.wy - 30, kind ? 0.8 : 1, seite === 'r' ? 8 : -8) + hand(A.wx, A.wy + 4, haut, kind ? 16 : 19);
    if (opt.halt && opt.halt[seite]) g += opt.halt[seite](A.wx, A.wy);
    if (wink === seite) return `<g class="wink" data-px="${r(sh[0])}" data-py="${r(sh[1])}">${g}</g>`;
    return g;
  };
  s += armSvg(AL, shL, 'l') + armSvg(AR, shR, 'r');
  return { w: W, h: H, svg: s, haende: { l: [AL.wx, AL.wy], r: [AR.wx, AR.wy] } };
}

// ---------- Rollstuhl mit sitzender Person ----------
function rollstuhlPerson(opt) {
  const W = 520, H = 760;
  const haut = HAUT[opt.haut] || HAUT.braun;
  const hf = HAAR[opt.haarfarbe] || HAAR.weiss;
  const cx = 250, cy = 170, R = 86;
  const schY = cy + R + 36, huefY = 470;
  let s = '';
  // großes Rad hinten
  s += `<circle ${O} cx="220" cy="590" r="150" fill="none" stroke-width="7"/><circle cx="220" cy="590" r="150" fill="none" stroke="${P.grau}" stroke-width="18"/><circle cx="220" cy="590" r="150" fill="none" stroke="${P.ink}" stroke-width="5"/>`;
  s += `<circle cx="220" cy="590" r="122" fill="none" stroke="${P.ink}" stroke-width="5"/>`;
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 6; s += `<path d="M${r(220 - Math.cos(a) * 118)} ${r(590 - Math.sin(a) * 118)} L${r(220 + Math.cos(a) * 118)} ${r(590 + Math.sin(a) * 118)}" stroke="${P.grau}" stroke-width="5"/>`; }
  s += `<circle ${O} cx="220" cy="590" r="20" fill="${P.grauhell}"/>`;
  // Rahmen
  s += `<path d="M150 300 L150 480 L380 480 L410 660" fill="none" stroke="${P.ink}" stroke-width="22" stroke-linejoin="round" stroke-linecap="round"/><path d="M150 300 L150 480 L380 480 L410 660" fill="none" stroke="${P.grauhell}" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"/>`;
  if (opt.griffe !== false) s += `<path d="M150 330 L90 330" stroke="${P.ink}" stroke-width="20" stroke-linecap="round"/><path d="M150 330 L90 330" stroke="${P.grauhell}" stroke-width="8" stroke-linecap="round"/>`;
  s += `<circle ${O} cx="410" cy="700" r="38" fill="${P.grauhell}"/><circle cx="410" cy="700" r="10" fill="${P.ink}"/>`;
  // Person sitzend
  s += dickeLinie(`M220 ${huefY - 10} L370 ${huefY - 4} L392 640`, opt.unten || P.navy, 54);
  s += `<path ${O} d="M352 668 q4 -32 44 -32 q40 0 46 32 z" fill="${P.ink}"/>`;
  s += `<path ${O} fill="${opt.oben || P.navy}" d="M${cx - 80} ${schY + 30} Q${cx - 80} ${schY} ${cx - 50} ${schY} L${cx + 50} ${schY} Q${cx + 80} ${schY} ${cx + 80} ${schY + 30} L${cx + 70} ${huefY} L${cx - 90} ${huefY} Z"/>`;
  s += `<path d="M${cx - 30} ${schY} L${cx} ${schY + 60} L${cx + 30} ${schY}" fill="#fff" stroke="${P.ink}" stroke-width="6"/>`;
  s += `<rect ${O} x="${cx - 24}" y="${cy + R * 0.8}" width="48" height="${schY - cy - R * 0.8 + 20}" fill="${haut}"/>`;
  s += `<circle ${O} cx="${cx - R + 2}" cy="${cy + 8}" r="18" fill="${haut}"/><circle ${O} cx="${cx + R - 2}" cy="${cy + 8}" r="18" fill="${haut}"/>`;
  s += `<circle ${O} cx="${cx}" cy="${cy}" r="${R}" fill="${haut}"/>`;
  s += gesicht(cx, cy, R, { mimik: opt.mimik, brille: opt.brille !== false });
  s += haare('kranz', cx, cy, R, hf).vorne;
  // Armlehne + Arm
  s += `<path d="M150 420 L330 420" stroke="${P.ink}" stroke-width="20" stroke-linecap="round"/><path d="M150 420 L330 420" stroke="${P.grauhell}" stroke-width="8" stroke-linecap="round"/>`;
  const A = armPfad(1, cx + 50, schY + 30, 10, 75, 110, 100);
  s += dickeLinie(A.d, opt.oben || P.navy, 40) + hand(A.wx, A.wy, haut);
  if (opt.halt) s += opt.halt(A.wx, A.wy);
  return { w: W, h: H, svg: s };
}

// ---------- Gegenstände (Koordinatensystem 200×200, Unterkante 200) ----------
const DINGE = {
  brief: () => `<g transform="rotate(-6 100 110)"><rect ${O} x="18" y="50" width="164" height="112" rx="10" fill="#fff"/><path d="M22 56 L100 116 L178 56" fill="none" stroke="${P.ink}" stroke-width="7" stroke-linejoin="round"/><rect ${O} x="140" y="66" width="28" height="22" fill="${P.gold}" stroke-width="5"/></g>`,
  brief_offen: () => `<rect ${O} x="18" y="80" width="164" height="110" rx="10" fill="#fff"/><rect ${O} x="40" y="20" width="120" height="130" fill="#fff"/><path d="M58 50h84M58 72h84M58 94h60" stroke="${P.grau}" stroke-width="8" stroke-linecap="round"/><path ${O} d="M18 84 L100 140 L182 84 L182 190 L18 190 Z" fill="${P.hell}"/>`,
  formular: () => `<g transform="rotate(4 100 100)"><rect ${O} x="34" y="10" width="132" height="180" rx="8" fill="#fff"/><path d="M54 40h90" stroke="${P.blau}" stroke-width="10" stroke-linecap="round"/>${[72, 108, 144].map((y) => `<rect x="52" y="${y}" width="22" height="22" rx="4" fill="#fff" stroke="${P.ink}" stroke-width="5"/><path d="M86 ${y + 11}h56" stroke="${P.grau}" stroke-width="8" stroke-linecap="round"/>`).join('')}</g>`,
  muenzen: () => `${[150, 128, 106].map((y, i) => `<ellipse ${O} cx="${80 + i * 4}" cy="${y}" rx="56" ry="18" fill="${P.gold}"/>`).join('')}<circle ${O} cx="132" cy="120" r="54" fill="${P.gold}"/><circle cx="132" cy="120" r="40" fill="none" stroke="#c88a12" stroke-width="5"/><text x="132" y="140" text-anchor="middle" font-family="Schibsted Grotesk" font-weight="800" font-size="58" fill="${P.ink}">€</text>`,
  haus: () => `<path ${O} d="M30 100 L100 34 L170 100 Z" fill="${P.blau}"/><rect ${O} x="44" y="98" width="112" height="96" fill="${P.warm}"/><rect ${O} x="88" y="130" width="34" height="64" fill="${P.navy}"/><rect ${O} x="56" y="116" width="24" height="24" fill="#fff"/><rect ${O} x="132" y="44" width="18" height="40" fill="${P.navy}"/>`,
  kalender: () => `<rect ${O} x="24" y="34" width="152" height="156" rx="12" fill="#fff"/><path ${O} d="M24 46 a12 12 0 0 1 12 -12 h128 a12 12 0 0 1 12 12 v34 h-152 z" fill="${P.blau}"/><path d="M62 22v26M138 22v26" stroke="${P.ink}" stroke-width="12" stroke-linecap="round"/>${[0, 1, 2].map((row) => [0, 1, 2, 3].map((c) => `<rect x="${40 + c * 32}" y="${92 + row * 30}" width="22" height="20" rx="4" fill="${P.grauhell}"/>`).join('')).join('')}<circle cx="115" cy="132" r="24" fill="none" stroke="${P.gold}" stroke-width="9"/>`,
  handy: () => `<rect ${O} x="52" y="8" width="96" height="186" rx="20" fill="${P.navy}"/><rect x="64" y="28" width="72" height="146" rx="8" fill="${P.hell}"/><circle cx="100" cy="100" r="28" fill="${P.gruen}"/><path d="M86 100 l10 10 l20 -22" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`,
  lupe: () => `<path d="M120 124 L176 182" stroke="${P.ink}" stroke-width="34" stroke-linecap="round"/><path d="M120 124 L176 182" stroke="${P.navy}" stroke-width="20" stroke-linecap="round"/><circle ${O} cx="88" cy="90" r="60" fill="#dff0fb" stroke-width="12"/><path d="M60 70 q14 -22 38 -24" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round"/>`,
  schloss: () => `<path d="M60 96 V70 a40 40 0 0 1 80 0 V96" fill="none" stroke="${P.ink}" stroke-width="30"/><path d="M60 96 V70 a40 40 0 0 1 80 0 V96" fill="none" stroke="${P.grau}" stroke-width="16"/><rect ${O} x="34" y="92" width="132" height="100" rx="16" fill="${P.gold}"/><circle cx="100" cy="132" r="14" fill="${P.ink}"/><path d="M100 136 v28" stroke="${P.ink}" stroke-width="12" stroke-linecap="round"/>`,
  mappe: () => `<rect ${O} x="40" y="20" width="110" height="140" fill="#fff" transform="rotate(-8 95 90)"/><rect ${O} x="62" y="14" width="110" height="140" fill="#fff" transform="rotate(6 117 84)"/><path d="M80 50h60M80 72h60" stroke="${P.grau}" stroke-width="8" stroke-linecap="round" transform="rotate(6 117 84)"/><path ${O} d="M14 70 h64 l14 16 h94 v104 h-172 z" fill="${P.blau}"/><rect x="72" y="124" width="56" height="26" rx="6" fill="${P.warm}" stroke="${P.ink}" stroke-width="5"/>`,
  haken: () => `<circle ${O} cx="100" cy="110" r="80" fill="${P.gruen}"/><path d="M62 112 l26 26 l52 -56" fill="none" stroke="#fff" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>`,
  frage: () => `<circle ${O} cx="100" cy="106" r="84" fill="#fff"/><text x="100" y="146" text-anchor="middle" font-family="Schibsted Grotesk" font-weight="800" font-size="120" fill="${P.blau}">?</text>`,
  stapel: () => `${[0, 1, 2, 3].map((i) => `<rect ${O} x="${30 + (i % 2) * 10}" y="${150 - i * 34}" width="140" height="40" rx="6" fill="${i % 2 ? '#fff' : P.hell}" transform="rotate(${(i % 2 ? 4 : -5)} 100 ${170 - i * 34})"/>`).join('')}`,
  weltkugel: () => `<circle ${O} cx="100" cy="104" r="84" fill="${P.blau}"/><path d="M40 70 q30 -10 40 10 q10 30 -10 40 q-20 10 -20 34 M120 30 q-10 30 20 40 q30 6 30 36 M110 150 q20 -10 40 4" fill="none" stroke="${P.gruenhell}" stroke-width="12" stroke-linecap="round"/><circle cx="100" cy="104" r="84" fill="none" stroke="${P.ink}" stroke-width="7"/>`,
  stern: () => `<path ${O} d="M100 20 L120 78 L182 80 L132 116 L150 176 L100 140 L50 176 L68 116 L18 80 L80 78 Z" fill="${P.gold}"/>`,
};

function ding(name) {
  const f = DINGE[name];
  if (!f) throw new Error(`Unbekannter Baustein: ${name}`);
  return { w: 200, h: 200, svg: f() };
}

// ---------- Figuren-Katalog ----------
const POSEN = {
  stehen: { l: [12, 8], r: [12, 8] },
  winken: { l: [12, 8], r: [150, 25] },
  zeigen: { l: [12, 8], r: [96, -8] },
  zeigenlinks: { l: [96, -8], r: [12, 8] },
  denken: { l: [10, -75], r: [45, 160, 1.6] },
  freuen: { l: [148, -12], r: [148, -12] },
  halten: { l: [10, -78], r: [10, -78] },
  handy: { l: [12, 8], r: [12, -95] },
};

function figur(name, o = {}) {
  const pose = o.pose || 'stehen';
  const arme = POSEN[pose] || POSEN.stehen;
  const mimik = o.mimik || (pose === 'freuen' ? 'freude' : pose === 'denken' ? 'denken' : 'freundlich');
  const wink = pose === 'winken' ? 'r' : undefined;
  const handyIn = pose === 'handy' ? 'r' : undefined;
  const halt = {};
  if (o.haelt) { // Gegenstand in der rechten Hand (z. B. brief)
    halt.r = (x, y) => `<g transform="translate(${r(x - 55)} ${r(y - 100)}) scale(.55)">${ding(o.haelt).svg}</g>`;
  }
  switch (name) {
    case 'lotsin':
      return person({ haut: 'mittel', haar: 'bob', haarfarbe: 'schwarz', ohrringe: true, oben: P.blau, unten: P.navy, kragen: 'v', arme, mimik, wink,
        handyIn: ({ winken: 'l', zeigen: 'l', denken: 'l', handy: 'r', halten: 'r', stehen: 'l' })[pose], halt });
    case 'mutter':
      return person({ haut: 'hell', haar: 'zopf', haarfarbe: 'braun', oben: P.gruenhell, rock: true, rockFarbe: P.navy, unten: P.navy, armFarbe: P.gruenhell, arme, mimik, wink, halt, handyIn });
    case 'kind':
      return person({ kind: true, haut: 'hell', haar: 'zoepfe', haarfarbe: 'braun', oben: P.gold, unten: P.blau, arme, mimik, wink, halt, handyIn });
    case 'rentnerin':
      return person({ haut: 'hell', haar: 'dutt', haarfarbe: 'grau', brille: true, oben: P.gruen, kragen: 'strick', rock: true, rockFarbe: P.navy, unten: P.navy, arme, mimik, wink, halt, handyIn });
    case 'student':
      return person({ haut: 'dunkel', haar: 'locken', haarfarbe: 'schwarz', oben: P.blau, kragen: 'hoodie', unten: P.navy, rucksack: P.gruen, schuhe: '#fff', arme, mimik, wink, halt, handyIn });
    case 'vater':
      return person({ haut: 'braun', haar: 'kurzmann', haarfarbe: 'schwarz', bart: true, oben: P.gruen, unten: P.navy, arme, mimik, wink, halt, handyIn });
    case 'pflegerin':
      return person({ haut: 'mittel', haar: 'zopf', haarfarbe: 'rotbraun', oben: P.gruenhell, armFarbe: P.gruenhell, unten: P.gruen, schuhe: '#fff', arme: o.pose ? arme : { l: [-35, 3], r: [20, -5] }, mimik, wink, halt });
    case 'rollstuhl':
      return rollstuhlPerson({ mimik, halt: o.haelt ? halt.r : undefined });
    default:
      throw new Error(`Unbekannte Figur: ${name}`);
  }
}

// Gruppen: mehrere Teile in einem Baustein
function gruppe(name, o = {}) {
  if (name === 'mutter-kind') {
    const m = figur('mutter', { pose: o.pose || 'stehen', mimik: o.mimik });
    const k = figur('kind', { pose: 'stehen', mimik: o.mimikKind || (o.mimik === 'sorge' ? 'freundlich' : o.mimik) });
    return { w: 640, h: 900, svg: `<g>${m.svg}</g><g transform="translate(300 300)">${k.svg}</g>` };
  }
  if (name === 'rollstuhl-pflege') {
    const p = figur('pflegerin', { mimik: o.mimik });
    const rs = figur('rollstuhl', { mimik: o.mimik, haelt: o.haelt });
    return { w: 760, h: 900, svg: `<g transform="translate(0 0)">${p.svg}</g><g transform="translate(200 140)">${rs.svg}</g>` };
  }
  return null;
}

function baustein(was, o = {}) {
  const g = gruppe(was, o);
  if (g) return g;
  if (DINGE[was]) return ding(was);
  return figur(was, o);
}

module.exports = { baustein, P, POSEN, DINGE, FIGUREN: ['lotsin', 'mutter', 'kind', 'mutter-kind', 'rentnerin', 'student', 'vater', 'pflegerin', 'rollstuhl', 'rollstuhl-pflege'] };
