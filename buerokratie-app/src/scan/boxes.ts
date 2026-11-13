// Finds the empty input box to the right of a label in a photo/scan.
// Works in the label's own text direction (handles tilted photos); perspective is treated locally.
import type { Phrase, Box } from './labels.js';

export interface FieldBox {
  /** Corners in image pixels: top-left, top-right, bottom-right, bottom-left. */
  quad: [number, number][];
  angle: number;   // radians, text direction
  height: number;  // px, perpendicular to text direction
  width: number;   // px, along text direction
  kind: 'box' | 'checkbox' | 'guess';
}

interface Ctx { mask: Uint8Array; w: number; h: number; text: Box[] }

const ink = (c: Ctx, x: number, y: number) => {
  const xi = Math.round(x), yi = Math.round(y);
  if (!(xi >= 0 && yi >= 0 && xi < c.w && yi < c.h && c.mask[yi * c.w + xi] === 1)) return false;
  // ink inside a recognised word is text, not a box edge (inset 2 px so box lines touching a word survive)
  for (const b of c.text) if (xi > b.x0 + 2 && xi < b.x1 - 2 && yi > b.y0 + 2 && yi < b.y1 - 2) return false;
  return true;
};

/** Longest run of ink along the "across" direction through (x, y), within ±reach. Returns [from, to] offsets. */
function crossRun(c: Ctx, x: number, y: number, nx: number, ny: number, reach: number): [number, number] {
  let best: [number, number] = [0, -1], start: number | null = null, gap = 0;
  for (let s = -reach; s <= reach; s++) {
    // a 5-px wide probe tolerates slanted edges (perspective) and thin/broken lines
    let hit = false;
    for (let o = -2; o <= 2 && !hit; o++) hit = ink(c, x + nx * s + o, y + ny * s);
    if (hit) { if (start === null) start = s; gap = 0; }
    else if (start !== null && ++gap > 2) {
      if (s - gap - start > best[1] - best[0]) best = [start, s - gap];
      start = null; gap = 0;
    }
  }
  if (start !== null && reach - start > best[1] - best[0]) best = [start, reach];
  return best;
}

/**
 * Walks from the end of the label along the text direction and looks for a vertical box edge
 * (an ink run across the line at least ~0.9 text heights long), then for the matching right edge.
 */
export function findBoxRightOf(phrase: Phrase, mask: Uint8Array, width: number, height: number, textBoxes: Box[] = []): FieldBox {
  // only words near the label's line matter; keeps the per-pixel check cheap
  const ly0 = phrase.bbox.y0 - phrase.height * 4, ly1 = phrase.bbox.y1 + phrase.height * 4;
  const c: Ctx = { mask, w: width, h: height, text: textBoxes.filter((b) => b.y1 > ly0 && b.y0 < ly1) };
  const a = phrase.angle, dx = Math.cos(a), dy = Math.sin(a), nx = -Math.sin(a), ny = Math.cos(a);
  const th = Math.max(8, phrase.height);
  // centre line of the label: middle of the last word, continued in text direction
  const last = phrase.words[phrase.words.length - 1].bbox;
  const sx = last.x1, sy = (last.y0 + last.y1) / 2;
  // walk until the probe leaves the image
  const maxSteps = Math.round(Math.hypot(width, height));
  const inside = (t: number) => { const x = sx + dx * t, y = sy + dy * t; return x >= 0 && y >= 0 && x < width && y < height; };
  const reach = Math.round(th * 2.2);
  // a box edge is clearly taller than the text next to it (letters reach ~1.0 × th)
  const minEdge = th * 1.2;

  let left: { t: number; run: [number, number] } | undefined; // first vertical edge right of the label
  for (let t = Math.round(th * 0.4); t < maxSteps && inside(t); t++) {
    const run = crossRun(c, sx + dx * t, sy + dy * t, nx, ny, reach);
    if (run[1] - run[0] >= minEdge && run[0] < th * 0.3 && run[1] > -th * 0.3) { left = { t, run }; break; }
  }
  const quad = (t0: number, t1: number, r: [number, number]): [number, number][] => {
    const p = (t: number, s: number): [number, number] => [sx + dx * t + nx * s, sy + dy * t + ny * s];
    return [p(t0, r[0]), p(t1, r[0]), p(t1, r[1]), p(t0, r[1])];
  };
  if (!left) {
    // No box found (e.g. dotted line or free space): propose a field right of the label; the user adjusts it.
    const t0 = th, t1 = th + th * 14;
    return { quad: quad(t0, t1, [-th * 0.8, th * 0.8]), angle: a, height: th * 1.6, width: t1 - t0, kind: 'guess' };
  }
  const midS = (left.run[0] + left.run[1]) / 2;
  const reachV = Math.round(Math.max(th * 2.5, (left.run[1] - left.run[0]) * 1.2));
  // Top and bottom border at position t: walk from the box centre line outwards until ink.
  // Horizontal borders are long and stable, so this is more robust than the (often broken) vertical edge.
  const edgesAt = (t: number): [number, number] | undefined => {
    const x = sx + dx * t, y = sy + dy * t;
    let up: number | undefined, down: number | undefined;
    for (let s = 2; s <= reachV && up === undefined; s++) if (ink(c, x + nx * (midS - s), y + ny * (midS - s))) up = midS - s;
    for (let s = 2; s <= reachV && down === undefined; s++) if (ink(c, x + nx * (midS + s), y + ny * (midS + s))) down = midS + s;
    return up !== undefined && down !== undefined && down - up >= th * 0.9 ? [up, down] : undefined;
  };
  const hasLines = (t0: number, t1: number) => { let n = 0, k = 0; for (let t = t0; t <= t1; t += 2, n++) if (edgesAt(t)) k++; return n ? k / n : 0; };

  // Is this really a LEFT edge? The box must continue to the right. If the label runs into the box
  // (common on dense forms), the first edge we meet is the box's RIGHT edge: walk back to its start.
  let lt = left.t;
  if (hasLines(lt + 3, lt + th * 2) < 0.5 && hasLines(lt - th * 2, lt - 3) > 0.7) {
    let t = lt - 3;
    while (t > -width && hasLines(t - 6, t) > 0.6) t -= 6;
    lt = t + 3;
  }
  // right end: next vertical edge, or where the top/bottom lines stop
  let rt: number | undefined;
  let miss = 0;
  for (let t = lt + Math.max(4, Math.round(th)); t < maxSteps && inside(t); t++) {
    const run = crossRun(c, sx + dx * t + nx * midS, sy + dy * t + ny * midS, nx, ny, reachV);
    if (run[1] - run[0] >= (left.run[1] - left.run[0]) * 0.6) { rt = t; break; }
    if (t % 2 === 0) { miss = edgesAt(t) ? 0 : miss + 2; if (miss > th * 1.5) { rt = t - miss; break; } }
  }
  if (rt === undefined) {
    // box runs off the photo: left edge is reliable, width is a guess
    const t1 = lt + th * 14;
    return { quad: quad(lt, t1, left.run), angle: a, height: left.run[1] - left.run[0], width: t1 - lt, kind: 'guess' };
  }
  const wBox = rt - lt;
  const hs = [0.2, 0.5, 0.8].map((f) => edgesAt(lt + wBox * f)).filter((e): e is [number, number] => !!e);
  const eL = edgesAt(lt + Math.min(6, wBox * 0.1)) ?? hs[0] ?? left.run;
  const eR = edgesAt(rt - Math.min(6, wBox * 0.1)) ?? hs[hs.length - 1] ?? left.run;
  const boxH = hs.length ? hs.map((e) => e[1] - e[0]).sort((x, y) => x - y)[Math.floor(hs.length / 2)] : left.run[1] - left.run[0];
  // Real quadrilateral (follows perspective); text direction from bottom-left → bottom-right
  const p = (t: number, s: number): [number, number] => [sx + dx * t + nx * s, sy + dy * t + ny * s];
  const q: [number, number][] = [p(lt, eL[0]), p(rt, eR[0]), p(rt, eR[1]), p(lt, eL[1])];
  const kind = wBox < boxH * 1.6 ? 'checkbox' : 'box';
  const angle = Math.atan2(q[2][1] - q[3][1], q[2][0] - q[3][0]);
  return { quad: q, angle, height: boxH, width: wBox, kind };
}
