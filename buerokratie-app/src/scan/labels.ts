// Turns OCR words into label phrases and matches them against the field catalogue.
// Rule-based + fuzzy (Levenshtein on the start of the phrase), tolerant to typical OCR errors.

export interface Box { x0: number; y0: number; x1: number; y1: number }
export interface OcrWord { text: string; confidence: number; bbox: Box; baseline?: Box }

export interface Phrase { text: string; words: OcrWord[]; bbox: Box; angle: number; height: number }

export interface CatalogField {
  key: string; typ: string; de: string; liste?: string; abgeleitet?: string;
  synonyme: Record<string, string[]>;
}

export interface LabelMatch {
  key: string;          // catalogue key
  index?: number;       // 1-based list index (e.g. Kind 2)
  phrase: Phrase;
  synonym: string;
  score: number;        // 0..1
}

const median = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)] ?? 0; };

/** Angle of a word's baseline in radians (image coordinates, y down; positive = clockwise). */
function wordAngle(w: OcrWord): number {
  const b = w.baseline;
  if (!b || b.x1 - b.x0 < 5) return 0;
  return Math.atan2(b.y1 - b.y0, b.x1 - b.x0);
}

/**
 * Groups words into phrases: same text line (projected along the dominant angle) and a horizontal gap
 * smaller than ~1.6 × text height. Large gaps separate a label from field content or a second column.
 */
export function groupPhrases(words: OcrWord[]): Phrase[] {
  const ws = words.filter((w) => w.text.trim() && w.confidence > 20 && /[\p{L}\d]/u.test(w.text));
  if (!ws.length) return [];
  const angle = median(ws.filter((w) => w.text.length >= 4).map(wordAngle));
  const cos = Math.cos(angle), sin = Math.sin(angle);
  const h = (w: OcrWord) => (w.bbox.y1 - w.bbox.y0) * cos; // approx. text height
  // Rotate centres into the text direction: u = along the line, v = across
  const uv = (w: OcrWord) => {
    const cx = (w.bbox.x0 + w.bbox.x1) / 2, cy = (w.bbox.y0 + w.bbox.y1) / 2;
    return { u: cx * cos + cy * sin, v: -cx * sin + cy * cos };
  };
  const items = ws.map((w) => ({ w, ...uv(w), h: h(w), half: (w.bbox.x1 - w.bbox.x0) / 2 }))
    .sort((a, b) => a.v - b.v || a.u - b.u);
  const lineH = median(items.map((i) => i.h));
  // 1) lines by v
  const lines: typeof items[] = [];
  for (const it of items) {
    const line = lines.find((l) => Math.abs(l[0].v - it.v) < lineH * 0.5);
    line ? line.push(it) : lines.push([it]);
  }
  // 2) split lines into phrases by gap
  const phrases: Phrase[] = [];
  for (const line of lines) {
    line.sort((a, b) => a.u - b.u);
    let cur: typeof items = [];
    const flush = () => {
      if (!cur.length) return;
      const wsx = cur.map((c) => c.w);
      phrases.push({
        text: wsx.map((w) => w.text).join(' '),
        words: wsx,
        bbox: { x0: Math.min(...wsx.map((w) => w.bbox.x0)), y0: Math.min(...wsx.map((w) => w.bbox.y0)), x1: Math.max(...wsx.map((w) => w.bbox.x1)), y1: Math.max(...wsx.map((w) => w.bbox.y1)) },
        angle,
        height: median(cur.map((c) => c.h)),
      });
      cur = [];
    };
    for (const it of line) {
      const prev = cur[cur.length - 1];
      if (prev && it.u - it.half - (prev.u + prev.half) > lineH * 1.6) flush();
      cur.push(it);
    }
    flush();
  }
  return phrases;
}

export function normalize(s: string): string {
  return s.toLowerCase()
    .replace(/[„“"'’`´]/g, '')
    .replace(/[^\p{L}\d]+/gu, ' ')
    .trim();
}

function lev(a: string, b: string): number {
  const d = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = d[0]; d[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const t = d[j];
      d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = t;
    }
  }
  return d[b.length];
}

/** Similarity of the synonym with the best-fitting start of the phrase (labels often carry extra text). */
export function prefixScore(phrase: string, synonym: string): number {
  const p = normalize(phrase), s = normalize(synonym);
  if (!s) return 0;
  let best = 0;
  for (let len = Math.max(1, s.length - 2); len <= Math.min(p.length, s.length + 2); len++) {
    const cand = p.slice(0, len);
    // the prefix must end at a word boundary, otherwise "Name" would match "Namensänderung"
    if (len < p.length && /[\p{L}\d]/u.test(p[len]) && /[\p{L}\d]/u.test(p[len - 1])) continue;
    best = Math.max(best, 1 - lev(cand, s) / Math.max(cand.length, s.length));
  }
  // Partial label: OCR often loses the end of a long label (touching box edge, broken word).
  // Accept a sufficiently long phrase that matches the beginning of the synonym, slightly penalised.
  if (p.length >= 10 && p.length < s.length - 2) {
    const sim = 1 - lev(p, s.slice(0, p.length)) / p.length;
    best = Math.max(best, sim - 0.05);
  }
  return best;
}

const KIND = /^\s*kind\s*(\d{1,2})\s*[:.)\-]?\s*/i;

export function matchLabel(phrase: Phrase, catalog: CatalogField[], lang = 'de', threshold = 0.8): LabelMatch | undefined {
  const m = KIND.exec(phrase.text);
  const text = m ? phrase.text.slice(m[0].length) : phrase.text;
  const index = m ? Number(m[1]) : undefined;
  let best: LabelMatch | undefined;
  for (const f of catalog) {
    // With "Kind N:" prefix only list fields; without prefix list fields only via specific synonyms
    if (m && f.liste !== 'kinder') continue;
    for (const syn of f.synonyme[lang] ?? []) {
      if (!m && f.liste && catalog.some((o) => !o.liste && (o.synonyme[lang] ?? []).some((x) => normalize(x) === normalize(syn)))) continue;
      const score = prefixScore(text, syn);
      if (score < threshold) continue;
      // tie-break: higher score, then longer synonym ("Name, Vorname" beats "Name")
      if (!best || score > best.score + 1e-9 || (Math.abs(score - best.score) < 1e-9 && syn.length > best.synonym.length)) {
        best = { key: f.key, index: f.liste ? (index ?? 1) : undefined, phrase, synonym: syn, score };
      }
    }
  }
  return best;
}
