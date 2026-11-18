package com.santiniketan.gitanjali;

import android.app.Activity;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * Gitanjali Cinema Hall - ticket booking app.
 * The whole UI is an offline web app bundled in assets/www.
 */
public class MainActivity extends Activity {

    private WebView web;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Window w = getWindow();
        w.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        w.setStatusBarColor(Color.parseColor("#0E0C11"));
        w.setNavigationBarColor(Color.parseColor("#0E0C11"));

        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#0E0C11"));

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(false);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setTextZoom(100);
        s.setMediaPlaybackRequiresUserGesture(true);
        if (Build.VERSION.SDK_INT >= 21) {
            s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        }
        if (Build.VERSION.SDK_INT >= 26) {
            s.setSafeBrowsingEnabled(false);
        }

        web.setWebViewClient(new WebViewClient());
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);

        // Android 15+ draws edge to edge; keep the page clear of the bars.
        if (Build.VERSION.SDK_INT >= 21) {
            web.setOnApplyWindowInsetsListener(new View.OnApplyWindowInsetsListener() {
                @Override
                public WindowInsets onApplyWindowInsets(View v, WindowInsets insets) {
                    int top, bottom, left, right;
                    if (Build.VERSION.SDK_INT >= 30) {
                        android.graphics.Insets bars =
                                insets.getInsets(WindowInsets.Type.systemBars()
                                        | WindowInsets.Type.displayCutout());
                        top = bars.top;
                        bottom = bars.bottom;
                        left = bars.left;
                        right = bars.right;
                    } else {
                        top = insets.getSystemWindowInsetTop();
                        bottom = insets.getSystemWindowInsetBottom();
                        left = insets.getSystemWindowInsetLeft();
                        right = insets.getSystemWindowInsetRight();
                    }
                    v.setPadding(left, top, right, bottom);
                    return insets;
                }
            });
        }

        setContentView(web);
        web.loadUrl("file:///android_asset/www/index.html");
    }

    @Override
    public void onBackPressed() {
        // Let the page handle Back first (it moves between screens).
        if (web != null) {
            web.evaluateJavascript(
                "(function(){try{return window.gjBack?window.gjBack():false}catch(e){return false}})()",
                value -> {
                    if (value == null || !value.contains("true")) {
                        finish();
                    }
                });
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onDestroy() {
        if (web != null) {
            web.destroy();
            web = null;
        }
        super.onDestroy();
    }
}
