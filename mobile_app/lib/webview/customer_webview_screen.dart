import 'dart:async';
import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';
import 'package:webview_flutter_wkwebview/webview_flutter_wkwebview.dart';

import 'webview_url_policy.dart';

/// Full-screen WebView that hosts the IndoVyapar Customer Website.
///
/// This is the only customer-facing UI in the mobile app. Authentication,
/// catalog, cart, checkout, and payments are owned by the website.
class CustomerWebViewScreen extends StatefulWidget {
  const CustomerWebViewScreen({
    super.key,
    this.initialUrl = WebViewUrlPolicy.productionUrl,
    this.urlPolicy = const WebViewUrlPolicy(),
  });

  final String initialUrl;
  final WebViewUrlPolicy urlPolicy;

  @override
  State<CustomerWebViewScreen> createState() => _CustomerWebViewScreenState();
}

class _CustomerWebViewScreenState extends State<CustomerWebViewScreen> {
  late final WebViewController _controller;
  var _isLoading = true;
  var _hasError = false;
  String? _errorMessage;
  var _progress = 0;

  @override
  void initState() {
    super.initState();
    _controller = _createController();
    unawaited(_configurePlatformFeatures());
    unawaited(_loadInitialUrl());
  }

  WebViewController _createController() {
    late final PlatformWebViewControllerCreationParams params;
    if (WebViewPlatform.instance is WebKitWebViewPlatform) {
      params = WebKitWebViewControllerCreationParams(
        allowsInlineMediaPlayback: true,
        mediaTypesRequiringUserAction: const <PlaybackMediaTypes>{},
      );
    } else {
      params = const PlatformWebViewControllerCreationParams();
    }

    final controller = WebViewController.fromPlatformCreationParams(params)
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFFFFFFFF))
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (progress) {
            if (!mounted) return;
            setState(() => _progress = progress);
          },
          onPageStarted: (_) {
            if (!mounted) return;
            setState(() {
              _isLoading = true;
              _hasError = false;
              _errorMessage = null;
            });
          },
          onPageFinished: (_) {
            if (!mounted) return;
            setState(() {
              _isLoading = false;
              _progress = 100;
            });
          },
          onWebResourceError: (error) {
            // Ignore subframe / image errors; only surface main-frame failures.
            if (error.isForMainFrame != true) return;
            if (!mounted) return;
            setState(() {
              _isLoading = false;
              _hasError = true;
              _errorMessage = error.description.isNotEmpty
                  ? error.description
                  : 'Unable to load IndoVyapar. Check your connection and try again.';
            });
          },
          onNavigationRequest: (request) => _handleNavigation(request.url),
          onHttpAuthRequest: (request) {
            // Website does not use HTTP basic auth; deny quietly.
          },
        ),
      );

    // Prefer a standard mobile Chrome UA so Google OAuth is less likely to
    // reject the embedded WebView (Google blocks the default "; wv" UA).
    // Cookies / session still stay in this WebView cookie jar.
    if (!kIsWeb) {
      unawaited(_applyMobileChromeUserAgent(controller));
    }

    return controller;
  }

  Future<void> _applyMobileChromeUserAgent(WebViewController controller) async {
    try {
      final current = await controller.getUserAgent();
      if (current == null || current.isEmpty) return;
      final cleaned = current
          .replaceAll(RegExp(r'\s*;?\s*wv\b'), '')
          .replaceAll('Version/4.0 ', '');
      await controller.setUserAgent(cleaned);
    } catch (_) {
      // Non-fatal — default UA still works for normal browsing.
    }
  }

  Future<void> _configurePlatformFeatures() async {
    final platform = _controller.platform;

    if (platform is AndroidWebViewController) {
      AndroidWebViewController.enableDebugging(kDebugMode);
      await platform.setMediaPlaybackRequiresUserGesture(false);
      await platform.setOnShowFileSelector(_androidFilePicker);

      final cookieManager = WebViewCookieManager();
      final androidCookies =
          cookieManager.platform as AndroidWebViewCookieManager;
      await androidCookies.setAcceptThirdPartyCookies(platform, true);
    }

    if (platform is WebKitWebViewController) {
      await platform.setAllowsBackForwardNavigationGestures(true);
    }
  }

  Future<List<String>> _androidFilePicker(FileSelectorParams params) async {
    try {
      final result = await FilePicker.platform.pickFiles(
        allowMultiple: params.mode == FileSelectorMode.openMultiple,
      );
      if (result == null) return const <String>[];

      return result.files
          .where((file) => file.path != null && file.path!.isNotEmpty)
          .map((file) => File(file.path!).uri.toString())
          .toList(growable: false);
    } catch (_) {
      return const <String>[];
    }
  }

  Future<void> _loadInitialUrl() async {
    try {
      await _controller.loadRequest(Uri.parse(widget.initialUrl));
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _hasError = true;
        _errorMessage = 'Failed to open IndoVyapar: $e';
      });
    }
  }

  Future<NavigationDecision> _handleNavigation(String url) async {
    final uri = Uri.tryParse(url);
    if (uri == null) return NavigationDecision.prevent;

    // about:blank / data: used by some payment / OAuth intermediaries.
    if (uri.scheme == 'about' || uri.scheme == 'data') {
      return NavigationDecision.navigate;
    }

    if (widget.urlPolicy.shouldStayInWebView(uri)) {
      return NavigationDecision.navigate;
    }

    if (widget.urlPolicy.isExternalAppScheme(uri) || uri.scheme == 'intent') {
      await _openExternal(uri);
      return NavigationDecision.prevent;
    }

    // Unknown https host — open externally rather than trapping the user.
    if (uri.scheme == 'http' || uri.scheme == 'https') {
      await _openExternal(uri);
      return NavigationDecision.prevent;
    }

    return NavigationDecision.prevent;
  }

  Future<void> _openExternal(Uri uri) async {
    try {
      // Android intent:// URLs (UPI / Razorpay bank apps) — rewrite to a
      // launchable https/package form when possible.
      if (uri.scheme == 'intent') {
        await _launchAndroidIntent(uri);
        return;
      }

      final mode = LaunchMode.externalApplication;
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: mode);
      }
    } catch (_) {
      // Swallow — user can retry from the website.
    }
  }

  Future<void> _launchAndroidIntent(Uri uri) async {
    // intent://host/path#Intent;scheme=https;package=...;end
    final raw = uri.toString();
    final schemeMatch = RegExp(r'scheme=([^;]+)').firstMatch(raw);
    final fallbackMatch = RegExp(
      r'S\.browser_fallback_url=([^;]+)',
    ).firstMatch(raw);

    if (fallbackMatch != null) {
      final fallback = Uri.tryParse(
        Uri.decodeComponent(fallbackMatch.group(1)!),
      );
      if (fallback != null && await canLaunchUrl(fallback)) {
        await launchUrl(fallback, mode: LaunchMode.externalApplication);
        return;
      }
    }

    if (schemeMatch != null) {
      final scheme = schemeMatch.group(1)!;
      final rewritten = raw
          .replaceFirst('intent:', '$scheme:')
          .split('#Intent')
          .first;
      final launchUri = Uri.tryParse(rewritten);
      if (launchUri != null && await canLaunchUrl(launchUri)) {
        await launchUrl(launchUri, mode: LaunchMode.externalApplication);
      }
    }
  }

  Future<void> _retry() async {
    setState(() {
      _hasError = false;
      _errorMessage = null;
      _isLoading = true;
    });
    await _loadInitialUrl();
  }

  Future<bool> _handleBack() async {
    if (await _controller.canGoBack()) {
      await _controller.goBack();
      return false;
    }
    return true;
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) async {
        if (didPop) return;
        final shouldExit = await _handleBack();
        if (shouldExit && context.mounted) {
          // Exit the app when WebView history is empty (Android back).
          if (Platform.isAndroid) {
            SystemNavigator.pop();
          }
        }
      },
      child: Scaffold(
        backgroundColor: Colors.white,
        body: SafeArea(
          child: Stack(
            children: [
              if (!_hasError)
                WebViewWidget(controller: _controller)
              else
                _ErrorView(
                  message:
                      _errorMessage ??
                      'Unable to load IndoVyapar. Please try again.',
                  onRetry: _retry,
                ),
              if (_isLoading && !_hasError)
                const Align(
                  alignment: Alignment.topCenter,
                  child: LinearProgressIndicator(minHeight: 2),
                ),
              if (_isLoading && !_hasError && _progress < 10)
                const Center(child: CircularProgressIndicator()),
            ],
          ),
        ),
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  const _ErrorView({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.wifi_off, size: 48, color: Color(0xFF666666)),
            const SizedBox(height: 16),
            Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 16, color: Color(0xFF333333)),
            ),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: onRetry,
              style: FilledButton.styleFrom(
                backgroundColor: const Color(0xFF1B7A43),
              ),
              child: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }
}
