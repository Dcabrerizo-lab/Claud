// Cryptography for the vault. Only Web Crypto (AES-GCM, PBKDF2) and hash-wasm (Argon2id, WebAssembly).
//
// Key hierarchy:
//   data key (DEK, random AES-256)  ── encrypts the vault content
//   DEK wrapped with KEK(passphrase)      → changing the passphrase does not re-encrypt the data
//   DEK wrapped with KEK(recovery code)   → forgetting the passphrase does not mean losing everything
//   (later: DEK wrapped for an advisor = "Berater-Freigabe", without touching the data)
import { argon2id } from 'hash-wasm';

const subtle = globalThis.crypto.subtle;
const enc = new TextEncoder();
const dec = new TextDecoder();

export type KdfParams =
  | { alg: 'argon2id'; salt: string; memKiB: number; iterations: number; parallelism: number }
  | { alg: 'pbkdf2-sha256'; salt: string; iterations: number };

/** Defaults: Argon2id 64 MiB / 3 passes (OWASP 2024: ≥ 19 MiB, t ≥ 2); PBKDF2 600 000 (OWASP). */
export const ARGON2_DEFAULT = { memKiB: 64 * 1024, iterations: 3, parallelism: 1 };
export const PBKDF2_DEFAULT = { iterations: 600_000 };

export interface Wrapped { kdf: KdfParams; iv: string; data: string }   // wrapped DEK
export interface Sealed { iv: string; data: string }                     // encrypted payload

// ---------- encoding helpers ----------
export function b64(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}
type Bytes = Uint8Array<ArrayBuffer>;
export function unb64(s: string): Bytes {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
export const random = (n: number): Bytes => globalThis.crypto.getRandomValues(new Uint8Array(n));

// ---------- key derivation ----------
/** Unicode-normalised so the same passphrase typed on different keyboards gives the same key. */
const norm = (secret: string): Bytes => new Uint8Array(enc.encode(secret.normalize('NFC')));

async function deriveRaw(secret: string, kdf: KdfParams): Promise<Bytes> {
  const salt = unb64(kdf.salt);
  if (kdf.alg === 'argon2id') {
    return new Uint8Array(await argon2id({
      password: norm(secret), salt, memorySize: kdf.memKiB, iterations: kdf.iterations,
      parallelism: kdf.parallelism, hashLength: 32, outputType: 'binary',
    }));
  }
  const base = await subtle.importKey('raw', norm(secret), 'PBKDF2', false, ['deriveBits']);
  return new Uint8Array(await subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: kdf.iterations }, base, 256));
}

async function kek(secret: string, kdf: KdfParams): Promise<CryptoKey> {
  const raw = await deriveRaw(secret, kdf);
  try { return await subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']); }
  finally { raw.fill(0); }
}

/** Argon2id if WebAssembly works (and has enough memory), otherwise PBKDF2. */
export async function newKdf(prefer: 'argon2id' | 'pbkdf2-sha256' = 'argon2id', argon = ARGON2_DEFAULT, pbkdf2 = PBKDF2_DEFAULT): Promise<KdfParams> {
  const salt = b64(random(16));
  if (prefer === 'argon2id') {
    try {
      await argon2id({ password: 'probe', salt: random(16), memorySize: argon.memKiB, iterations: 1, parallelism: 1, hashLength: 32, outputType: 'binary' });
      return { alg: 'argon2id', salt, ...argon };
    } catch { /* no WebAssembly / not enough memory → fallback */ }
  }
  return { alg: 'pbkdf2-sha256', salt, ...pbkdf2 };
}

// ---------- data key ----------
export async function newDataKey(): Promise<CryptoKey> {
  // extractable only so it can be wrapped; it never leaves the device unencrypted
  return subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}

export async function wrapKey(dek: CryptoKey, secret: string, kdf: KdfParams): Promise<Wrapped> {
  const iv = random(12);
  const raw = new Uint8Array(await subtle.exportKey('raw', dek));
  try {
    const data = new Uint8Array(await subtle.encrypt({ name: 'AES-GCM', iv, additionalData: enc.encode('dek') }, await kek(secret, kdf), raw));
    return { kdf, iv: b64(iv), data: b64(data) };
  } finally { raw.fill(0); }
}

/** Throws WrongSecretError if the secret does not fit (AES-GCM authentication fails). */
export async function unwrapKey(w: Wrapped, secret: string): Promise<CryptoKey> {
  let raw: Bytes;
  try {
    raw = new Uint8Array(await subtle.decrypt({ name: 'AES-GCM', iv: unb64(w.iv), additionalData: enc.encode('dek') }, await kek(secret, w.kdf), unb64(w.data)));
  } catch { throw new WrongSecretError(); }
  try { return await subtle.importKey('raw', raw, 'AES-GCM', true, ['encrypt', 'decrypt']); }
  finally { raw.fill(0); }
}

export class WrongSecretError extends Error {
  constructor() { super('Passphrase oder Wiederherstellungscode ist falsch'); this.name = 'WrongSecretError'; }
}

// ---------- payload ----------
/** `context` is bound as additional data, so a ciphertext cannot be swapped between records. */
export async function seal(dek: CryptoKey, value: unknown, context: string): Promise<Sealed> {
  const iv = random(12);
  const data = new Uint8Array(await subtle.encrypt({ name: 'AES-GCM', iv, additionalData: enc.encode(context) }, dek, enc.encode(JSON.stringify(value))));
  return { iv: b64(iv), data: b64(data) };
}

export async function open<T = unknown>(dek: CryptoKey, s: Sealed, context: string): Promise<T> {
  const plain = await subtle.decrypt({ name: 'AES-GCM', iv: unb64(s.iv), additionalData: enc.encode(context) }, dek, unb64(s.data));
  return JSON.parse(dec.decode(plain)) as T;
}

// ---------- recovery code ----------
// 20 characters from an alphabet without look-alikes (no 0/O, 1/I/L), shown as 5 groups of 4:
// easy to write down by hand, ≈ 100 bit entropy (32^20 = 2^100), so a fast KDF would suffice; we use the same KDF anyway.
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
export function newRecoveryCode(): string {
  const out: string[] = [];
  const bytes = random(40);
  for (const b of bytes) { if (b < 248) out.push(ALPHABET[b % 31]); if (out.length === 20) break; } // 248 = 8·31: no modulo bias
  while (out.length < 20) { const b = random(1)[0]; if (b < 248) out.push(ALPHABET[b % 31]); }
  return out.join('').replace(/(.{4})(?=.)/g, '$1-');
}
/** Accepts lower case, spaces and missing or extra dashes when typing the code back. */
export function normalizeRecoveryCode(input: string): string {
  return input.toUpperCase().replace(/[^0-9A-Z]/g, '').replace(/(.{4})(?=.)/g, '$1-');
}
