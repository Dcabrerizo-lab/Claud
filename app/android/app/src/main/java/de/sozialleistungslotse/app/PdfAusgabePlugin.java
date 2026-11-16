package de.sozialleistungslotse.app;

import android.app.Activity;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.CancellationSignal;
import android.os.Environment;
import android.os.ParcelFileDescriptor;
import android.print.PageRange;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintDocumentInfo;
import android.print.PrintManager;
import android.provider.MediaStore;
import android.util.Base64;

import androidx.activity.result.ActivityResult;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * Antragsmappe als PDF drucken oder speichern (nur Android; auf dem iPhone bietet der Teilen-Dialog beides schon an).
 * JavaScript:
 *   Capacitor.Plugins.PdfAusgabe.drucken({ data: base64, name })  -> öffnet den Druckdialog des Systems (Drucker oder „Als PDF speichern“)
 *   Capacitor.Plugins.PdfAusgabe.speichern({ data: base64, name }) -> { ort: "Download" } ab Android 10 direkt im Ordner Downloads,
 *                                                                    bis Android 9 über „Speichern unter“ (Ordner frei wählbar), { ort: "gewaehlt" }
 * Keine Berechtigungen nötig, kein Netz.
 */
@CapacitorPlugin(name = "PdfAusgabe")
public class PdfAusgabePlugin extends Plugin {

    private static String dateiname(PluginCall call) {
        String n = call.getString("name", "Antragsmappe.pdf");
        n = n.replaceAll("[^A-Za-z0-9ÄÖÜäöüß ._-]", "_");
        return n.toLowerCase().endsWith(".pdf") ? n : n + ".pdf";
    }

    private static byte[] daten(PluginCall call) {
        String b64 = call.getString("data");
        if (b64 == null || b64.isEmpty()) return null;
        try { return Base64.decode(b64, Base64.DEFAULT); } catch (IllegalArgumentException e) { return null; }
    }

    @PluginMethod
    public void drucken(PluginCall call) {
        byte[] pdf = daten(call);
        if (pdf == null) { call.reject("data fehlt"); return; }
        final String name = dateiname(call);
        final File datei = new File(getContext().getCacheDir(), "druck-" + name);
        try (OutputStream o = new FileOutputStream(datei)) { o.write(pdf); } catch (Exception e) { call.reject("Datei nicht schreibbar", e); return; }
        final Activity act = getActivity();
        act.runOnUiThread(() -> {
            try {
                PrintManager pm = (PrintManager) act.getSystemService(Context.PRINT_SERVICE);
                PrintAttributes attr = new PrintAttributes.Builder().setMediaSize(PrintAttributes.MediaSize.ISO_A4).build();
                pm.print(name.replace(".pdf", ""), new PdfAdapter(datei, name), attr);
                call.resolve();
            } catch (Exception e) {
                call.reject("Drucken nicht möglich", e);
            }
        });
    }

    /** Reicht die fertige PDF-Datei unverändert an den Druckdienst weiter. */
    private static class PdfAdapter extends PrintDocumentAdapter {
        private final File datei; private final String name;
        PdfAdapter(File datei, String name) { this.datei = datei; this.name = name; }

        @Override
        public void onLayout(PrintAttributes alt, PrintAttributes neu, CancellationSignal abbruch, LayoutResultCallback cb, Bundle extras) {
            if (abbruch.isCanceled()) { cb.onLayoutCancelled(); return; }
            cb.onLayoutFinished(new PrintDocumentInfo.Builder(name).setContentType(PrintDocumentInfo.CONTENT_TYPE_DOCUMENT).build(), true);
        }

        @Override
        public void onWrite(PageRange[] seiten, ParcelFileDescriptor ziel, CancellationSignal abbruch, WriteResultCallback cb) {
            try (InputStream in = new FileInputStream(datei); OutputStream out = new FileOutputStream(ziel.getFileDescriptor())) {
                byte[] buf = new byte[16384]; int n;
                while ((n = in.read(buf)) > 0) { if (abbruch.isCanceled()) { cb.onWriteCancelled(); return; } out.write(buf, 0, n); }
                cb.onWriteFinished(new PageRange[] { PageRange.ALL_PAGES });
            } catch (Exception e) {
                cb.onWriteFailed(e.getMessage());
            }
        }

        @Override
        public void onFinish() { datei.delete(); }
    }

    @PluginMethod
    public void speichern(PluginCall call) {
        byte[] pdf = daten(call);
        if (pdf == null) { call.reject("data fehlt"); return; }
        String name = dateiname(call);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            // Android 10 und neuer: MediaStore, Ordner Downloads, ohne Berechtigung
            ContentResolver cr = getContext().getContentResolver();
            ContentValues v = new ContentValues();
            v.put(MediaStore.MediaColumns.DISPLAY_NAME, name);
            v.put(MediaStore.MediaColumns.MIME_TYPE, "application/pdf");
            v.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
            v.put(MediaStore.MediaColumns.IS_PENDING, 1);
            Uri uri = cr.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
            if (uri == null) { call.reject("Speichern nicht möglich"); return; }
            try (OutputStream o = cr.openOutputStream(uri)) {
                o.write(pdf);
            } catch (Exception e) {
                cr.delete(uri, null, null);
                call.reject("Speichern nicht möglich", e);
                return;
            }
            v.clear(); v.put(MediaStore.MediaColumns.IS_PENDING, 0); cr.update(uri, v, null, null);
            JSObject r = new JSObject(); r.put("ort", "Download"); r.put("name", name);
            call.resolve(r);
        } else {
            // Android 7 bis 9: „Speichern unter“ des Systems (Storage Access Framework), Ordner frei wählbar
            File tmp = new File(getContext().getCacheDir(), "speichern-" + name);
            try (OutputStream o = new FileOutputStream(tmp)) { o.write(pdf); } catch (Exception e) { call.reject("Datei nicht schreibbar", e); return; }
            Intent i = new Intent(Intent.ACTION_CREATE_DOCUMENT);
            i.addCategory(Intent.CATEGORY_OPENABLE);
            i.setType("application/pdf");
            i.putExtra(Intent.EXTRA_TITLE, name);
            call.getData().put("tmp", tmp.getAbsolutePath());
            startActivityForResult(call, i, "gespeichert");
        }
    }

    @ActivityCallback
    private void gespeichert(PluginCall call, ActivityResult res) {
        if (call == null) return;
        File tmp = new File(call.getString("tmp", ""));
        if (res.getResultCode() != Activity.RESULT_OK || res.getData() == null || res.getData().getData() == null) {
            tmp.delete();
            call.reject("abgebrochen");
            return;
        }
        try (InputStream in = new FileInputStream(tmp); OutputStream out = getContext().getContentResolver().openOutputStream(res.getData().getData())) {
            byte[] buf = new byte[16384]; int n;
            while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
            JSObject r = new JSObject(); r.put("ort", "gewaehlt"); r.put("name", tmp.getName().replace("speichern-", ""));
            call.resolve(r);
        } catch (Exception e) {
            call.reject("Speichern nicht möglich", e);
        } finally {
            tmp.delete();
        }
    }
}
