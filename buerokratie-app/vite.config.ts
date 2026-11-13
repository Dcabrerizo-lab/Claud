// Builds ONE self-contained HTML file (fonts, code, WebAssembly inlined), like dist/leistungs-lotse.html:
// usable as installable web app, as a file on an intranet and as Capacitor www/ for Android/iOS.
// A strict Content-Security-Policy with hashes of the inlined script/style is added after bundling.
import { defineConfig } from 'vitest/config';
import type { Plugin } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

const sha = (s: string) => `'sha256-${createHash('sha256').update(s, 'utf8').digest('base64')}'`;

function csp(): Plugin {
  return {
    name: 'inject-csp',
    apply: 'build',
    enforce: 'post',
    closeBundle() {
      const file = resolve(__dirname, 'dist/index.html');
      let html = readFileSync(file, 'utf8');
      const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map((m) => sha(m[1]));
      const styles = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map((m) => sha(m[1]));
      const policy = [
        "default-src 'none'",
        `script-src ${scripts.join(' ')} 'wasm-unsafe-eval'`, // wasm: Argon2id (hash-wasm)
        `style-src ${styles.join(' ')}`,
        'font-src data:', 'img-src data: blob:',
        "connect-src 'self'",                                  // E1: nothing outside the app itself
        "worker-src 'self' blob:", "base-uri 'none'", "form-action 'none'", "object-src 'none'",
      ].join('; ');
      html = html.replace('<meta charset="utf-8">', `<meta charset="utf-8">\n<meta http-equiv="Content-Security-Policy" content="${policy}">`);
      writeFileSync(file, html);
      copyFileSync(file, resolve(__dirname, 'dist/daten-tresor.html'));
    },
  };
}

export default defineConfig({
  plugins: [viteSingleFile({ removeViteModuleLoader: true }), csp()],
  build: { target: 'es2022', outDir: 'dist', emptyOutDir: true, assetsInlineLimit: 100_000_000, chunkSizeWarningLimit: 5000 },
  // large property runs (FC_RUNS=50000) need more time per test than the 5 s default
  test: { include: ['test/**/*.test.ts'], testTimeout: Math.max(30_000, Number(process.env.FC_RUNS ?? 0) * 12) },
});
