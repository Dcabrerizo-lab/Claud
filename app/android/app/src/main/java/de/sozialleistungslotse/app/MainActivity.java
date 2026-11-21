package de.sozialleistungslotse.app;

import android.os.Bundle;
import android.webkit.WebSettings;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Eigene Plugins vor super.onCreate registrieren
        registerPlugin(TextRecognitionPlugin.class);
        registerPlugin(PdfAusgabePlugin.class);
        registerPlugin(SoloSchutzPlugin.class); // Bildschirmfoto-Schutz (FLAG_SECURE), gesteuert aus src/app.js
        super.onCreate(savedInstanceState);
        schriftgroesseUebernehmen();
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
