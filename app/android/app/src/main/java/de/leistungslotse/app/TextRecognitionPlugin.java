package de.leistungslotse.app;

import android.net.Uri;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.mlkit.vision.common.InputImage;
import com.google.mlkit.vision.text.Text;
import com.google.mlkit.vision.text.TextRecognition;
import com.google.mlkit.vision.text.TextRecognizer;
import com.google.mlkit.vision.text.latin.TextRecognizerOptions;

import java.io.File;

/**
 * Texterkennung auf dem Gerät mit Google ML Kit (Modell in der App enthalten, kein Download, kein Netz).
 * JavaScript: Capacitor.Plugins.TextRecognition.recognize({ path }) -> { lines: string[] }
 * path: Dateipfad oder file://- bzw. content://-URI des Fotos (vom Camera-Plugin).
 */
@CapacitorPlugin(name = "TextRecognition")
public class TextRecognitionPlugin extends Plugin {

    @PluginMethod
    public void recognize(PluginCall call) {
        String path = call.getString("path");
        if (path == null || path.isEmpty()) {
            call.reject("path fehlt");
            return;
        }
        Uri uri = (path.startsWith("file:") || path.startsWith("content:")) ? Uri.parse(path) : Uri.fromFile(new File(path));

        InputImage image;
        try {
            image = InputImage.fromFilePath(getContext(), uri);
        } catch (Exception e) {
            call.reject("Bild nicht lesbar", e);
            return;
        }

        TextRecognizer recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS);
        recognizer.process(image)
            .addOnSuccessListener(text -> {
                JSArray lines = new JSArray();
                for (Text.TextBlock block : text.getTextBlocks()) {
                    for (Text.Line line : block.getLines()) {
                        lines.put(line.getText());
                    }
                }
                JSObject result = new JSObject();
                result.put("lines", lines);
                call.resolve(result);
                recognizer.close();
            })
            .addOnFailureListener(e -> {
                call.reject("Texterkennung fehlgeschlagen", e);
                recognizer.close();
            });
    }
}
