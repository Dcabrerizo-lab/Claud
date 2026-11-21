package de.sozialleistungslotse.app;

import android.app.Activity;
import android.view.WindowManager;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Schutz vor Bildschirmfotos und vor der Vorschau im App-Wechsler (FLAG_SECURE).
 * JavaScript: Capacitor.Plugins.SoloSchutz.setzen({ an: true|false }).
 * Die App schaltet den Schutz ein, wenn die App-PIN an ist und „Bildschirmfotos erlauben“ aus ist (src/app.js, schutzAnwenden).
 */
@CapacitorPlugin(name = "SoloSchutz")
public class SoloSchutzPlugin extends Plugin {
    @PluginMethod
    public void setzen(PluginCall call) {
        final boolean an = Boolean.TRUE.equals(call.getBoolean("an", false));
        final Activity a = getActivity();
        if (a == null) { call.reject("keine Activity"); return; }
        a.runOnUiThread(() -> {
            if (an) a.getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
            else a.getWindow().clearFlags(WindowManager.LayoutParams.FLAG_SECURE);
            call.resolve();
        });
    }
}
