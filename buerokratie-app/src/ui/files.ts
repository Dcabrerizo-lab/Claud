// Saving and reading the backup file: browser download / file picker, or in the Android/iOS app the
// Capacitor plugins Filesystem + Share (the same plugins the Leistungs-Lotse uses).

function plug(name: string): any {
  try { return (window as any).Capacitor?.Plugins?.[name] ?? null; } catch { return null; }
}

/** Offers a text file for saving. Returns the file name. */
export async function saveTextFile(name: string, text: string): Promise<string> {
  const fs = plug('Filesystem'), share = plug('Share');
  if (fs && share) {
    // native app: write to the app's cache folder, then let the user choose where it goes (Files, USB, mail to oneself …)
    const r = await fs.writeFile({ path: name, data: text, directory: 'CACHE', encoding: 'utf8' });
    await share.share({ title: name, files: [r.uri] });
    return name;
  }
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url; a.download = name; a.rel = 'noopener';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return name;
}

export function backupFileName(date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `Daten-Tresor-Sicherung-${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}.json`;
}
