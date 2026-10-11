import 'dart:io';

import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';

/// Launches Android `intent://` / UPI deep links for Razorpay WebView checkout.
///
/// [url_launcher] uses `Uri.parse` + `ACTION_VIEW`, which does **not** honor
/// Android Intent URI extras (`scheme=`, `package=`, `S.browser_fallback_url`).
/// That leaves Razorpay stuck on "Processing your payment". We first call
/// native `Intent.parseUri`, then fall back to a rewritten `upi://` URL.
class AndroidIntentLauncher {
  AndroidIntentLauncher({
    MethodChannel? channel,
    this.launchExternal = launchUrl,
    this.canLaunchExternal = canLaunchUrl,
  }) : _channel = channel ??
            const MethodChannel('com.seecogg.indovyapar/android_intents');

  final MethodChannel _channel;
  final Future<bool> Function(Uri uri, {LaunchMode mode}) launchExternal;
  final Future<bool> Function(Uri uri) canLaunchExternal;

  /// Prefer the UPI / wallet scheme over Razorpay's HTTPS browser fallback.
  static String? rewriteIntentToAppScheme(String rawUrl) {
    final schemeMatch = RegExp(r'[;:]scheme=([^;]+)').firstMatch(rawUrl);
    if (schemeMatch == null) return null;
    final scheme = schemeMatch.group(1)!.trim();
    if (scheme.isEmpty) return null;

    final withoutSchemePrefix = rawUrl.replaceFirst(RegExp(r'^intent:', caseSensitive: false), '');
    final pathAndQuery = withoutSchemePrefix.split('#Intent').first;
    if (pathAndQuery.isEmpty || pathAndQuery == '//') {
      return '$scheme://';
    }
    // intent://pay?... → upi://pay?...
    // intent:pay?...   → upi:pay?... (normalize to scheme:// when missing //)
    if (pathAndQuery.startsWith('//')) {
      return '$scheme:$pathAndQuery';
    }
    return '$scheme://$pathAndQuery';
  }

  static String? extractBrowserFallbackUrl(String rawUrl) {
    final match = RegExp(r'S\.browser_fallback_url=([^;]+)').firstMatch(rawUrl);
    if (match == null) return null;
    try {
      return Uri.decodeComponent(match.group(1)!);
    } catch (_) {
      return match.group(1);
    }
  }

  Future<bool> launch(String rawUrl) async {
    if (rawUrl.isEmpty) return false;

    if (Platform.isAndroid) {
      final nativeOk = await _launchNative(rawUrl);
      if (nativeOk) return true;
    }

    if (rawUrl.toLowerCase().startsWith('intent:')) {
      final rewritten = rewriteIntentToAppScheme(rawUrl);
      if (rewritten != null) {
        final ok = await _launchUriString(rewritten);
        if (ok) return true;
      }
      final fallback = extractBrowserFallbackUrl(rawUrl);
      if (fallback != null) {
        return _launchUriString(fallback);
      }
      return false;
    }

    return _launchUriString(rawUrl);
  }

  Future<bool> _launchNative(String rawUrl) async {
    try {
      final result = await _channel.invokeMethod<bool>('launch', {'url': rawUrl});
      return result == true;
    } on MissingPluginException {
      return false;
    } on PlatformException {
      return false;
    } catch (_) {
      return false;
    }
  }

  Future<bool> _launchUriString(String url) async {
    final uri = Uri.tryParse(url);
    if (uri == null) return false;
    try {
      final launched = await launchExternal(
        uri,
        mode: LaunchMode.externalApplication,
      );
      if (launched) return true;
    } catch (_) {
      // Fall through to canLaunch retry.
    }
    try {
      if (await canLaunchExternal(uri)) {
        return launchExternal(uri, mode: LaunchMode.externalApplication);
      }
    } catch (_) {}
    // Last attempt: launch without canLaunchUrl (Android 11 visibility).
    try {
      return await launchExternal(uri, mode: LaunchMode.externalApplication);
    } catch (_) {
      return false;
    }
  }
}
