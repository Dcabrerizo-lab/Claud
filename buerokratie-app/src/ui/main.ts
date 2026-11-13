// App shell: set up, unlock, recover, master data form, auto-lock.
import '@fontsource/atkinson-hyperlegible/latin-400.css';
import '@fontsource/atkinson-hyperlegible/latin-ext-400.css';
import '@fontsource/atkinson-hyperlegible/latin-700.css';
import '@fontsource/atkinson-hyperlegible/latin-ext-700.css';
import '@fontsource/schibsted-grotesk/latin-800.css';
import '@fontsource/schibsted-grotesk/latin-ext-800.css';
import './styles.css';
import catalogData from '../../data/feldkatalog.json';
import { Catalog, type CatalogData } from '../core/catalog.js';
import { IndexedDbStorage } from '../core/storage.js';
import { Vault, MIN_PASSPHRASE, parseBackup, BackupError, ReplacedError, MAX_BACKUP_BYTES, type Backup } from '../core/vault.js';
import { saveTextFile, backupFileName } from './files.js';
import { WrongSecretError } from '../core/crypto.js';
import { t, setLang, detectLang, getLang, LANGS, DICTS } from './i18n.js';
import { Mask, STAMMDATEN_MODULE, esc } from './mask.js';

const IDLE_MS = 5 * 60 * 1000;      // E10: lock after 5 minutes without interaction
const HIDDEN_MS = 60 * 1000;        // … or after 1 minute in the background

const catalog = new Catalog(catalogData as CatalogData);
const storage = new IndexedDbStorage();
const app = document.getElementById('app')!;
let vault: Vault | null = null;
let current: () => void = () => {};
let mask: Mask | null = null;
let offChange: (() => void) | null = null;
/** Other windows/tabs of the app on this device: tell each other when something was saved. */
const channel = typeof BroadcastChannel === 'function' ? new BroadcastChannel('stammdaten-tresor') : null;
if (channel) channel.onmessage = async (e) => {
  if (!vault || vault.locked) return;
  if (e.data === 'replaced') return lock('main.replaced');                 // a backup was restored in another window
  await vault.refresh().catch((err) => { if (err instanceof ReplacedError) lock('main.replaced'); });
};
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(getLang() === 'de' ? 'de-DE' : 'en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
const stammdaten = () => vault!.module(STAMMDATEN_MODULE);
interface UiState { recoveryConfirmed?: boolean }
let big = false;
try { big = localStorage.getItem('tresor-big') === '1'; } catch { /* ignore */ }

// ---------- layout ----------
function shell(inner: string, opts: { lockable?: boolean } = {}): string {
  const langs = LANGS.map((l) => `<option value="${l}"${l === getLang() ? ' selected' : ''}>${esc(DICTS[l]['meta.name'])}</option>`).join('');
  return `<header class="top"><span class="brand">${esc(t('app.title'))}</span><div class="tools">
      <label class="sr" for="lang">${esc(t('lang.label'))}</label><select id="lang" class="lang">${langs}</select>
      <button type="button" class="btn secondary small" id="big" aria-pressed="${big}">${esc(t(big ? 'big.off' : 'big.on'))}</button>
      ${opts.lockable ? `<button type="button" class="btn small" id="lock">🔒 ${esc(t('main.lock'))}</button>` : ''}
    </div></header>
    <main id="main" tabindex="-1">${inner}</main>
    <footer><p class="disclaimer">${esc(t('app.disclaimer'))}</p>
    <div class="saved" id="saved" role="status" aria-live="polite"></div></footer>`;
}

function show(render: () => void) {
  current = render;
  app.className = 'app' + (big ? ' big' : '');
  render();
  document.getElementById('lang')?.addEventListener('change', (e) => { setLang((e.target as HTMLSelectElement).value); show(current); });
  document.getElementById('big')?.addEventListener('click', () => {
    big = !big; try { localStorage.setItem('tresor-big', big ? '1' : '0'); } catch { /* ignore */ }
    show(current);
  });
  document.getElementById('lock')?.addEventListener('click', () => lock('main.locked'));
  // move focus to the new screen's heading for screen readers and keyboard users
  (app.querySelector('h1') as HTMLElement | null)?.setAttribute('tabindex', '-1');
  (app.querySelector('h1') as HTMLElement | null)?.focus();
}

function pwField(id: string, label: string, autocomplete: string): string {
  return `<div class="field"><label for="${id}">${esc(label)}</label><div class="pw">
    <input id="${id}" type="password" autocomplete="${autocomplete}" autocapitalize="off" spellcheck="false" aria-describedby="${id}-e">
    <button type="button" class="btn secondary small" data-toggle="${id}" aria-controls="${id}">${esc(t('pass.show'))}</button></div>
    <span class="hint" id="${id}-e" aria-live="polite"></span></div>`;
}
function bindToggles() {
  app.querySelectorAll<HTMLButtonElement>('[data-toggle]').forEach((b) => b.addEventListener('click', () => {
    const i = document.getElementById(b.dataset.toggle!) as HTMLInputElement;
    const showIt = i.type === 'password';
    i.type = showIt ? 'text' : 'password';
    b.textContent = t(showIt ? 'pass.hide' : 'pass.show');
  }));
}
const val = (id: string) => (document.getElementById(id) as HTMLInputElement).value;
const msg = (text: string, kind = 'bad') => { const m = document.getElementById('msg')!; m.className = 'msg ' + kind; m.textContent = text; };

function strength(p: string): string {
  const n = [...p].length;
  return n < MIN_PASSPHRASE ? t('pass.short') : n < 12 ? t('pass.ok') : t('pass.good');
}

// ---------- screens ----------
function welcome() {
  app.innerHTML = shell(`<section class="card"><h1>${esc(t('welcome.h'))}</h1>
    <p>${esc(t('welcome.p1'))}</p><p>${esc(t('welcome.p2'))}</p>
    <div class="btns"><button type="button" class="btn block" id="start">${esc(t('welcome.start'))}</button>
    <button type="button" class="btn secondary block" id="have-backup">${esc(t('welcome.restore'))}</button></div></section>`);
  document.getElementById('start')!.addEventListener('click', () => show(setup));
  document.getElementById('have-backup')!.addEventListener('click', () => show(() => restore(false)));
}

function setup() {
  app.innerHTML = shell(`<section class="card"><h1>${esc(t('setup.h'))}</h1><p class="lead">${esc(t('setup.p'))}</p>
    <div class="msg" id="msg" role="alert"></div>
    <form id="f" novalidate>${pwField('p1', t('setup.pass'), 'new-password')}${pwField('p2', t('setup.pass2'), 'new-password')}
    <div class="btns"><button class="btn block" id="go">${esc(t('setup.go'))}</button></div></form></section>`);
  bindToggles();
  const hint = document.getElementById('p1-e')!;
  document.getElementById('p1')!.addEventListener('input', () => { hint.textContent = strength(val('p1')); });
  document.getElementById('f')!.addEventListener('submit', async (e) => {
    e.preventDefault();
    const p1 = val('p1'), p2 = val('p2');
    if ([...p1].length < MIN_PASSPHRASE) return msg(t('pass.short'));
    if (p1 !== p2) return msg(t('pass.mismatch'));
    const go = document.getElementById('go') as HTMLButtonElement;
    go.disabled = true; go.textContent = t('setup.busy');
    try {
      const r = await Vault.create(storage, catalog, p1);
      vault = r.vault;
      await stammdaten().setState({ recoveryConfirmed: false });
      IndexedDbStorage.persist();
      show(() => recovery(r.recoveryCode));
    } catch {
      go.disabled = false; go.textContent = t('setup.go'); msg(t('err.storage'));
    }
  });
}

function recovery(code: string, renewed = false) {
  app.innerHTML = shell(`<section class="card"><h1>${esc(t('rec.h'))}</h1>${renewed ? `<p class="msg warn">${esc(t('rec.renew'))}</p>` : ''}<p>${esc(t('rec.p'))}</p>
    <div class="code" id="code" role="img" aria-label="${esc(code.split('').join(' '))}">${code.split('-').map((g) => `<span class="g">${esc(g)}</span>`).join('<span aria-hidden="true">-</span>')}</div>
    <div class="btns noprint"><button type="button" class="btn secondary" id="print">🖨 ${esc(t('rec.print'))}</button></div>
    <label class="check"><input type="checkbox" id="ok"> <span>${esc(t('rec.check'))}</span></label>
    <div class="field"><label for="last">${esc(t('rec.confirm'))}</label><input id="last" maxlength="4" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-describedby="last-e"><span class="err" id="last-e" role="alert"></span></div>
    <div class="btns"><button type="button" class="btn block" id="done" disabled>${esc(t('rec.go'))}</button></div></section>`);
  const ok = document.getElementById('ok') as HTMLInputElement, done = document.getElementById('done') as HTMLButtonElement;
  const sync = () => { done.disabled = !(ok.checked && val('last').length === 4); };
  ok.addEventListener('change', sync);
  document.getElementById('last')!.addEventListener('input', sync);
  document.getElementById('print')!.addEventListener('click', () => window.print());
  done.addEventListener('click', async () => {
    if (val('last').toUpperCase() !== code.slice(-4)) { document.getElementById('last-e')!.textContent = t('rec.wrong'); return; }
    done.disabled = true;
    await stammdaten().setState({ ...stammdaten().getState<UiState>(), recoveryConfirmed: true });
    show(main);
  });
}

function unlock(notice?: string) {
  app.innerHTML = shell(`<section class="card"><h1>${esc(t('unlock.h'))}</h1>
    <div class="msg ${notice ? 'warn' : ''}" id="msg" role="alert">${notice ? esc(t(notice)) : ''}</div>
    <form id="f" novalidate>${pwField('p', t('setup.pass'), 'current-password')}
    <div class="btns"><button class="btn block" id="go">${esc(t('unlock.go'))}</button></div></form>
    <button type="button" class="link" id="forgot">${esc(t('unlock.forgot'))}</button></section>`);
  bindToggles();
  document.getElementById('forgot')!.addEventListener('click', () => show(forgot));
  document.getElementById('f')!.addEventListener('submit', async (e) => {
    e.preventDefault();
    const go = document.getElementById('go') as HTMLButtonElement;
    go.disabled = true; go.textContent = t('unlock.busy');
    try {
      vault = await Vault.unlock(storage, catalog, val('p'));
      await afterOpen();
    } catch (err) {
      go.disabled = false; go.textContent = t('unlock.go');
      msg(err instanceof WrongSecretError ? t('unlock.wrong') : t('err.storage'));
      (document.getElementById('p') as HTMLInputElement).select();
    }
  });
}

function forgot() {
  app.innerHTML = shell(`<section class="card"><h1>${esc(t('forgot.h'))}</h1><p class="lead">${esc(t('forgot.p'))}</p>
    <div class="msg" id="msg" role="alert"></div>
    <form id="f" novalidate><div class="field"><label for="code">${esc(t('forgot.code'))}</label>
      <input id="code" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="XXXX-XXXX-XXXX-XXXX-XXXX"></div>
    ${pwField('p1', t('forgot.new'), 'new-password')}${pwField('p2', t('setup.pass2'), 'new-password')}
    <div class="btns"><button class="btn block" id="go">${esc(t('forgot.go'))}</button></div></form>
    <button type="button" class="link" id="back">${esc(t('back'))}</button></section>`);
  bindToggles();
  document.getElementById('p1')!.addEventListener('input', () => { document.getElementById('p1-e')!.textContent = strength(val('p1')); });
  document.getElementById('back')!.addEventListener('click', () => show(() => unlock()));
  document.getElementById('f')!.addEventListener('submit', async (e) => {
    e.preventDefault();
    if ([...val('p1')].length < MIN_PASSPHRASE) return msg(t('pass.short'));
    if (val('p1') !== val('p2')) return msg(t('pass.mismatch'));
    const go = document.getElementById('go') as HTMLButtonElement;
    go.disabled = true;
    try {
      vault = await Vault.recover(storage, catalog, val('code'), val('p1'));
      await stammdaten().setState({ ...stammdaten().getState<UiState>(), recoveryConfirmed: true }); // the code was just used: it exists
      show(main);
    } catch (err) {
      go.disabled = false;
      msg(err instanceof WrongSecretError ? t('forgot.wrong') : t('err.storage'));
    }
  });
}

/** After unlocking: if the recovery code was never confirmed (app closed too early), issue a new one. */
async function afterOpen() {
  if (!stammdaten().getState<UiState>()?.recoveryConfirmed) {
    const code = await vault!.renewRecoveryCode();
    return show(() => recovery(code, true));
  }
  show(main);
}

function toast(text: string) {
  const saved = document.getElementById('saved');
  if (!saved) return;
  saved.textContent = '✓ ' + text; saved.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { saved.classList.remove('show'); saved.textContent = ''; }, 1500);
}
let toastTimer: ReturnType<typeof setTimeout>;

function main(notice?: string) {
  if (!vault || vault.locked) return show(() => unlock());
  const due = vault.backupDue();
  const last = vault.lastBackup;
  app.innerHTML = shell(`<h1>${esc(t('app.title'))}</h1><p class="lead">${esc(t('app.tagline'))}</p>
    ${notice ? `<p class="msg ok" role="status" id="notice">${esc(notice.includes(' ') ? notice : t(notice))}</p>` : ''}
    <div id="due-slot">${dueBanner(due)}</div>
    <div id="mask"></div>
    <section class="card" id="backup"><h2>${esc(t('backup.h'))}</h2><p class="lead">${esc(t('backup.p'))}</p>
      <p><strong id="backup-last">${esc(last ? t('backup.last', { date: fmtDate(last) }) : t('backup.never'))}</strong></p>
      <div class="btns"><button type="button" class="btn" id="backup-save">${esc(t('backup.save'))}</button>
      <button type="button" class="btn secondary" id="backup-restore">${esc(t('backup.restore'))}</button></div></section>
    <section class="card"><h2>${esc(t('sec.h'))}</h2><div class="btns">
      <button type="button" class="btn secondary" id="newcode">${esc(t('sec.code'))}</button>
      <button type="button" class="btn secondary" id="chpass">${esc(t('sec.pass'))}</button></div></section>`, { lockable: true });
  const v = vault;
  mask = new Mask(document.getElementById('mask')!, stammdaten(), catalog, () => { toast(t('main.saved')); updateDue(); });
  offChange?.();
  offChange = v.onChange((keys, by) => {
    if (by !== 'extern') channel?.postMessage('changed');   // tell other windows
    else if (keys.includes('*')) mask?.external();          // another window saved: show its state
  });
  document.getElementById('newcode')!.addEventListener('click', async () => {
    if (!confirm(t('sec.code.confirm'))) return;
    const code = await v.renewRecoveryCode();
    await stammdaten().setState({ ...stammdaten().getState<UiState>(), recoveryConfirmed: false });
    show(() => recovery(code));
  });
  document.getElementById('chpass')!.addEventListener('click', () => show(changePass));
  const save = async () => {
    const b = await v.exportBackup();
    const name = await saveTextFile(backupFileName(), JSON.stringify(b));
    show(() => main(t('backup.saved', { name })));
  };
  document.getElementById('backup-save')!.addEventListener('click', save);
  // the reminder can appear later (after the first saved value), so bind via the container
  document.getElementById('due-slot')!.addEventListener('click', (e) => { if ((e.target as HTMLElement).id === 'backup-now') save(); });
  document.getElementById('backup-restore')!.addEventListener('click', () => { if (confirm(t('restore.confirm'))) show(() => restore(true)); });
  // render only after pending saves are stored (e.g. language switch right after typing)
  v.idle().then(() => mask?.render());
}

/** Restore a backup: on a new device (replace = false) or instead of the current data (replace = true). */
function restore(replace: boolean) {
  app.innerHTML = shell(`<section class="card"><h1>${esc(t('restore.h'))}</h1><p class="lead">${esc(t('restore.p'))}</p>
    <div class="msg" id="msg" role="alert"></div>
    <form id="f" novalidate>
      <div class="field filepick"><span class="lab" id="file-lab">${esc(t('restore.file'))}</span>
        <input id="file" class="sr" type="file" accept=".json,application/json" aria-labelledby="file-lab file-btn" aria-describedby="file-info">
        <label for="file" class="btn secondary" id="file-btn">📂 ${esc(t('restore.pick'))}</label>
        <span class="hint" id="file-info" aria-live="polite"></span></div>
      <div id="with-pass">${pwField('p', t('setup.pass'), 'current-password')}</div>
      <div id="with-code" hidden><div class="field"><label for="code">${esc(t('forgot.code'))}</label>
        <input id="code" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="XXXX-XXXX-XXXX-XXXX-XXXX"></div>
        ${pwField('p1', t('forgot.new'), 'new-password')}${pwField('p2', t('setup.pass2'), 'new-password')}</div>
      <button type="button" class="link" id="mode">${esc(t('restore.withcode'))}</button>
      <div class="btns"><button class="btn block" id="go">${esc(t('restore.go'))}</button></div></form>
    <button type="button" class="link" id="back">${esc(t('back'))}</button></section>`, { lockable: replace });
  bindToggles();
  let backup: Backup | null = null;
  let withCode = false;
  const file = document.getElementById('file') as HTMLInputElement, info = document.getElementById('file-info')!;
  file.addEventListener('change', async () => {
    backup = null; info.textContent = ''; msg('', 'bad');
    const f = file.files?.[0];
    if (!f) return;
    try {
      if (f.size > MAX_BACKUP_BYTES) throw new BackupError('zu-gross');
      info.textContent = f.name;
      backup = parseBackup(await f.text());
      info.textContent = `${f.name} – ${t('restore.from', { date: fmtDate(backup.created) })}`;
    } catch (e) { msg(e instanceof BackupError ? t('err.backup.' + e.code) : t('err.backup.keine-sicherung')); }
  });
  document.getElementById('mode')!.addEventListener('click', (e) => {
    withCode = !withCode;
    document.getElementById('with-pass')!.hidden = withCode;
    document.getElementById('with-code')!.hidden = !withCode;
    (e.target as HTMLElement).textContent = t(withCode ? 'restore.withpass' : 'restore.withcode');
  });
  document.getElementById('back')!.addEventListener('click', () => show(replace ? main : welcome));
  document.getElementById('f')!.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!backup) return msg(file.files?.length ? t('err.backup.keine-sicherung') : t('restore.nofile'));
    if (withCode) {
      if ([...val('p1')].length < MIN_PASSPHRASE) return msg(t('pass.short'));
      if (val('p1') !== val('p2')) return msg(t('pass.mismatch'));
    }
    const go = document.getElementById('go') as HTMLButtonElement;
    go.disabled = true; go.textContent = t('restore.busy');
    try {
      const old = replace ? vault : null;
      await old?.idle().catch(() => undefined);
      // restore checks passphrase and file completely before replacing anything; on error the old vault stays open
      const restored = withCode
        ? await Vault.restore(storage, catalog, backup, val('code'), { recoveryCode: true, newPassphrase: val('p1') })
        : await Vault.restore(storage, catalog, backup, val('p'));
      if (old) { offChange?.(); offChange = null; mask = null; old.lock(); }
      vault = restored;
      channel?.postMessage('replaced');
      IndexedDbStorage.persist();
      if (withCode) await stammdaten().setState({ ...stammdaten().getState<UiState>(), recoveryConfirmed: true });
      show(() => main('restore.done'));
    } catch (err) {
      go.disabled = false; go.textContent = t('restore.go');
      msg(err instanceof WrongSecretError ? t(withCode ? 'restore.wrongcode' : 'restore.wrong') : err instanceof BackupError ? t('err.backup.' + err.code) : t('err.storage'));
    }
  });
}

function dueBanner(due: 'nie' | 'alt' | false): string {
  return due ? `<div class="msg warn" id="due"><p>${esc(t('backup.due.' + due))}</p><button type="button" class="btn" id="backup-now">${esc(t('backup.now'))}</button></div>` : '';
}
/** Shows or hides the backup reminder after each save, without redrawing the form. */
function updateDue() {
  const slot = document.getElementById('due-slot');
  if (!slot || !vault || vault.locked) return;
  const due = vault.backupDue();
  if ((document.getElementById('due') ? 'x' : '') !== (due ? 'x' : '')) slot.innerHTML = dueBanner(due);
}

function changePass() {
  app.innerHTML = shell(`<section class="card"><h1>${esc(t('chpass.h'))}</h1><p class="lead">${esc(t('setup.p'))}</p>
    <div class="msg" id="msg" role="alert"></div>
    <form id="f" novalidate>${pwField('p1', t('forgot.new'), 'new-password')}${pwField('p2', t('setup.pass2'), 'new-password')}
    <div class="btns"><button class="btn block" id="go">${esc(t('chpass.go'))}</button></div></form>
    <button type="button" class="link" id="back">${esc(t('back'))}</button></section>`, { lockable: true });
  bindToggles();
  document.getElementById('p1')!.addEventListener('input', () => { document.getElementById('p1-e')!.textContent = strength(val('p1')); });
  document.getElementById('back')!.addEventListener('click', () => show(main));
  document.getElementById('f')!.addEventListener('submit', async (e) => {
    e.preventDefault();
    if ([...val('p1')].length < MIN_PASSPHRASE) return msg(t('pass.short'));
    if (val('p1') !== val('p2')) return msg(t('pass.mismatch'));
    const go = document.getElementById('go') as HTMLButtonElement;
    go.disabled = true;
    try { await vault!.changePassphrase(val('p1')); show(() => main('chpass.done')); }
    catch { go.disabled = false; msg(t('err.storage')); }
  });
}

// ---------- locking ----------
/** Saves what is still being typed, waits until everything is stored, then locks. */
async function lock(notice: string) {
  const v = vault;
  if (!v) return;
  (document.activeElement as HTMLElement | null)?.blur?.(); // fires "change" → field is saved
  await v.idle().catch(() => undefined);
  if (vault !== v) return;
  offChange?.(); offChange = null; mask = null;
  v.lock(); vault = null;
  show(() => unlock(notice));
}
let idle: ReturnType<typeof setTimeout>;
const touch = () => { clearTimeout(idle); idle = setTimeout(() => lock('main.autolocked'), IDLE_MS); };
['pointerdown', 'keydown', 'input'].forEach((ev) => document.addEventListener(ev, touch, { passive: true }));
let hiddenAt = 0;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { hiddenAt = Date.now(); (document.activeElement as HTMLElement | null)?.blur?.(); } // save the field being edited
  else if (vault && Date.now() - hiddenAt > HIDDEN_MS) lock('main.autolocked');
});
// Capacitor (Android/iOS): lock immediately when the app goes to the background
(window as any).Capacitor?.Plugins?.App?.addListener?.('pause', () => lock('main.autolocked'));

// ---------- start ----------
(async () => {
  setLang(detectLang());
  if (!globalThis.crypto?.subtle) { app.innerHTML = `<p class="msg bad">${esc(t('err.nocrypto'))}</p>`; return; }
  touch();
  show(await Vault.exists(storage) ? () => unlock() : welcome);
})();
