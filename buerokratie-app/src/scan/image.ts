// Minimal grayscale image helpers. Platform-neutral: works on canvas ImageData in the browser
// and on decoded JPEG/PNG buffers in Node.

export interface Gray { width: number; height: number; data: Uint8Array }

export function toGray(rgba: { width: number; height: number; data: Uint8Array | Uint8ClampedArray }): Gray {
  const { width, height, data } = rgba;
  const g = new Uint8Array(width * height);
  for (let i = 0, j = 0; j < g.length; i += 4, j++) g[j] = (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8;
  return { width, height, data: g };
}

/**
 * "Ink" mask that tolerates shadows and uneven light: a pixel counts as ink when it is clearly darker
 * than the local paper brightness (max of its block, blocks of `cell` px, bilinear between blocks).
 */
export function inkMask(img: Gray, cell = 48, ratio = 0.72): Uint8Array {
  const { width: w, height: h, data } = img;
  const gw = Math.ceil(w / cell), gh = Math.ceil(h / cell);
  const bg = new Float32Array(gw * gh);
  for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) {
    // 90th percentile instead of max: robust against single bright noise pixels
    const hist = new Uint32Array(256); let n = 0;
    for (let y = gy * cell; y < Math.min(h, (gy + 1) * cell); y += 2) for (let x = gx * cell; x < Math.min(w, (gx + 1) * cell); x += 2) { hist[data[y * w + x]]++; n++; }
    let acc = 0, v = 255;
    for (; v > 0; v--) { acc += hist[v]; if (acc >= n * 0.1) break; }
    bg[gy * gw + gx] = v;
  }
  const mask = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    const fy = Math.min(gh - 1, Math.max(0, y / cell - 0.5)), y0 = Math.floor(fy), y1 = Math.min(gh - 1, y0 + 1), ty = fy - y0;
    for (let x = 0; x < w; x++) {
      const fx = Math.min(gw - 1, Math.max(0, x / cell - 0.5)), x0 = Math.floor(fx), x1 = Math.min(gw - 1, x0 + 1), tx = fx - x0;
      const b = (bg[y0 * gw + x0] * (1 - tx) + bg[y0 * gw + x1] * tx) * (1 - ty) + (bg[y1 * gw + x0] * (1 - tx) + bg[y1 * gw + x1] * tx) * ty;
      mask[y * w + x] = data[y * w + x] < b * ratio ? 1 : 0;
    }
  }
  return mask;
}
