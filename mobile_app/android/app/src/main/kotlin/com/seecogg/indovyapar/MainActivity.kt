package com.seecogg.indovyapar

import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

/**
 * Native Intent URI launcher for Razorpay UPI in the customer WebView.
 *
 * Flutter [url_launcher] uses Uri.parse + ACTION_VIEW, which ignores Android
 * Intent URI extras (scheme=, package=, S.browser_fallback_url). Razorpay's
 * WebView UPI docs require Intent.parseUri / ACTION_VIEW deep-link handling.
 */
class MainActivity : FlutterActivity() {
    private val channelName = "com.seecogg.indovyapar/android_intents"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, channelName)
            .setMethodCallHandler { call, result ->
                if (call.method != "launch") {
                    result.notImplemented()
                    return@setMethodCallHandler
                }
                val url = call.argument<String>("url")
                if (url.isNullOrBlank()) {
                    result.error("bad_args", "url required", null)
                    return@setMethodCallHandler
                }
                result.success(launchExternalUrl(url))
            }
    }

    private fun launchExternalUrl(url: String): Boolean {
        return try {
            val intent =
                if (url.startsWith("intent:", ignoreCase = true)) {
                    Intent.parseUri(url, Intent.URI_INTENT_SCHEME)
                } else {
                    Intent(Intent.ACTION_VIEW, Uri.parse(url))
                }
            startActivity(intent)
            true
        } catch (_: ActivityNotFoundException) {
            // Package-targeted UPI app missing — let Dart try upi:// chooser next.
            false
        } catch (_: Exception) {
            false
        }
    }
}
