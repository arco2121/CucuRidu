package it.arco2121.cucuridu;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import androidx.activity.OnBackPressedCallback;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Va registrato PRIMA di super.onCreate, altrimenti il JS non vede il plugin LanServer
        registerPlugin(LanServerPlugin.class);
        super.onCreate(savedInstanceState);
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        getWindow().setStatusBarColor(Color.TRANSPARENT);
        getWindow().setNavigationBarColor(Color.TRANSPARENT);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            getWindow().setStatusBarContrastEnforced(false);
            getWindow().setNavigationBarContrastEnforced(false);
        }

        if (this.bridge != null && this.bridge.getWebView() != null) {
            android.webkit.WebView webView = this.bridge.getWebView();
            webView.setBackgroundColor(Color.TRANSPARENT);
            webView.setFitsSystemWindows(false);
            if (webView.getParent() instanceof android.view.ViewGroup) {
                android.view.ViewGroup parent = (android.view.ViewGroup) webView.getParent();
                parent.setFitsSystemWindows(false);
                androidx.core.view.ViewCompat.setOnApplyWindowInsetsListener(parent, (v, insets) -> insets);
            }
        }

        // Rende status bar e navigation bar completamente trasparenti senza fasce nere
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        getWindow().setStatusBarColor(Color.TRANSPARENT);
        getWindow().setNavigationBarColor(Color.TRANSPARENT);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            getWindow().setStatusBarContrastEnforced(false);
            getWindow().setNavigationBarContrastEnforced(false);
        }
        WindowInsetsControllerCompat insetsController =
            WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        if (insetsController != null) {
            insetsController.setAppearanceLightStatusBars(true);
            insetsController.setAppearanceLightNavigationBars(true);
        }

        if (this.bridge != null && this.bridge.getWebView() != null) {
            this.bridge.getWebView().addJavascriptInterface(new Object() {
                @JavascriptInterface
                public void exitApp() {
                    runOnUiThread(() -> finish());
                }
            }, "CucuNativeAndroid");
        }

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (bridge != null && bridge.getWebView() != null) {
                    bridge.getWebView().post(() ->
                        bridge.getWebView().evaluateJavascript(
                            "if (window.CucuRiduBack && window.CucuRiduBack.handleBackAction) {" +
                            "  window.CucuRiduBack.handleBackAction();" +
                            "} else if (window.history.length > 1) {" +
                            "  window.history.back();" +
                            "} else if (window.CucuNativeAndroid) {" +
                            "  window.CucuNativeAndroid.exitApp();" +
                            "}",
                            null
                        )
                    );
                } else {
                    finish();
                }
            }
        });
    }
}