package de.sozialleistungslotse.app;

import android.content.ClipData;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebSettings;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        soloDateiAusIntent(getIntent()); // vor super.onCreate: Capacitor liest die Start-Adresse beim Anlegen der Bridge
        // Eigene Plugins vor super.onCreate registrieren
        registerPlugin(TextRecognitionPlugin.class);
        registerPlugin(PdfAusgabePlugin.class);
        registerPlugin(SoloSchutzPlugin.class); // Bildschirmfoto-Schutz (FLAG_SECURE), gesteuert aus src/app.js
        super.onCreate(savedInstanceState);
        schriftgroesseUebernehmen();
    }

    @Override
    protected void onNewIntent(Intent intent) {
        soloDateiAusIntent(intent);
        super.onNewIntent(intent);
    }

    /**
     * SoLo-Datei (.solo) öffnen: Das App-Plugin von Capacitor meldet nur VIEW-Intents an JavaScript (appUrlOpen, getLaunchUrl).
     * Teilen an SoLo (SEND mit einer content://-Datei) wird darum in VIEW mit derselben Adresse umgewandelt; das Leserecht für
     * die Datei bleibt dasselbe. Wird SoLo aus „Zuletzt verwendet“ neu gestartet, liefert Android den alten Intent noch einmal:
     * dann keine alte Datei erneut öffnen (das Leserecht ist meist abgelaufen). Gelesen und geprüft wird nur in JavaScript
     * über den vorhandenen Weg mit PIN-Abfrage (src/weitergabe.js nativInit), hier wird nichts gelesen.
     */
    static void soloDateiAusIntent(Intent intent) {
        if (intent == null) return;
        String aktion = intent.getAction();
        if ((intent.getFlags() & Intent.FLAG_ACTIVITY_LAUNCHED_FROM_HISTORY) != 0) {
            if (Intent.ACTION_VIEW.equals(aktion) || Intent.ACTION_SEND.equals(aktion)) {
                intent.setAction(Intent.ACTION_MAIN);
                intent.setDataAndType(null, null);
                intent.removeExtra(Intent.EXTRA_STREAM);
                intent.setClipData(null);
            }
            return;
        }
        if (!Intent.ACTION_SEND.equals(aktion)) return;
        Uri datei = null;
        ClipData clip = intent.getClipData();
        if (clip != null && clip.getItemCount() > 0) datei = clip.getItemAt(0).getUri();
        if (datei == null) datei = streamAusExtra(intent);
        if (datei == null || !"content".equals(datei.getScheme())) return;
        intent.setAction(Intent.ACTION_VIEW);
        intent.setDataAndType(datei, intent.getType());
    }

    @SuppressWarnings("deprecation")
    private static Uri streamAusExtra(Intent intent) {
        try {
            Object o = intent.getParcelableExtra(Intent.EXTRA_STREAM);
            return o instanceof Uri ? (Uri) o : null;
        } catch (RuntimeException e) {
            return null;
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        schriftgroesseUebernehmen(); // falls die Schriftgröße in den Einstellungen geändert wurde
    }

    /** Schriftgröße aus den Android-Einstellungen (Anzeige → Schriftgröße) auf die App übertragen. */
    private void schriftgroesseUebernehmen() {
        if (getBridge() == null || getBridge().getWebView() == null) return;
        float skala = getResources().getConfiguration().fontScale;
        int zoom = Math.round(Math.max(0.85f, Math.min(2.0f, skala)) * 100);
        WebSettings ws = getBridge().getWebView().getSettings();
        if (ws.getTextZoom() != zoom) ws.setTextZoom(zoom);
    }
}
