package de.sozialleistungslotse.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Eigene Plugins vor super.onCreate registrieren
        registerPlugin(TextRecognitionPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
