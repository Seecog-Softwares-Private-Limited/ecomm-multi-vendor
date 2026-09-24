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

import 'customer_native_marker.dart';
import 'google_oauth_bridge.dart';
import 'google_oauth_debug.dart';
import 'webview_url_policy.dart';

/// Full-screen WebView that hosts the IndoVyapar Customer Website.
///
/// This is the only customer-facing UI in the mobile app. Authentication,
/// catalog, cart, checkout, and payments are owned by the website.
/// Google Sign-In is the only native exception (system auth session).
class CustomerWebViewScreen extends StatefulWidget {
  const CustomerWebViewScreen({
    super.key,
    this.initialUrl = WebViewUrlPolicy.productionUrl,
    this.urlPolicy = const WebViewUrlPolicy(),
    this.oauthBridge = const GoogleOAuthBridge(),
  });

  final String initialUrl;
  final WebViewUrlPolicy urlPolicy;

  /// Injectable for tests; production uses [GoogleOAuthBridge].
  final GoogleOAuthBridge oauthBridge;

  @override
  State<CustomerWebViewScreen> createState() => _CustomerWebViewScreenState();
}

class _CustomerWebViewScreenState extends State<CustomerWebViewScreen> {
  late final WebViewController _controller;
  var _isLoading = true;
  var _hasError = false;
  String? _errorMessage;
  var _progress = 0;
  var _googleAuthInFlight = false;

  /// TEMPORARY: active OAuth attempt id while Auth Tab is open (debug only).
  String? _activeGoogleOAuthRequestId;

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
          onPageStarted: (url) {
            if (!mounted) return;
            setState(() {
              _isLoading = true;
              _hasError = false;
              _errorMessage = null;
            });
            // Re-inject after every main-frame document start (reload/navigation).
            unawaited(_injectCustomerNativeMarker(url));
            // Android often skips onNavigationRequest for 302 → Google.
            // Catch Google hosts here and restart a clean native OAuth start
            // instead of letting a truncated authorize URL show Error 400.
            final uri = Uri.tryParse(url);
            if (uri != null &&
                widget.oauthBridge.isGoogleAuthorizationHost(uri)) {
              GoogleOAuthDebug.log(
                'page_started_google',
                requestId: _activeGoogleOAuthRequestId,
                uri: uri,
                inflightBefore: _googleAuthInFlight,
                inflightAfter: _googleAuthInFlight,
                extra: 'willCallIntercept=true',
              );
              unawaited(_interceptGoogleAuthorizationHost(uri));
            }
          },
          onPageFinished: (url) {
            // Ensure marker is present after DOM ready (onPageStarted can race).
            unawaited(_injectCustomerNativeMarker(url));
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

    return controller;
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

  /// Sets [window.__INDOVYAPAR_CUSTOMER_NATIVE__] on IndoVyapar pages only.
  ///
  /// Re-run on every main-frame start/finish so full reloads restore the marker.
  /// Client-side Next.js navigations keep the same `window`, so the flag stays.
  /// Skips third-party hosts (Razorpay, bank ACS, etc.) to avoid side effects.
  Future<void> _injectCustomerNativeMarker(String url) async {
    final uri = Uri.tryParse(url);
    if (uri == null) return;
    final scheme = uri.scheme.toLowerCase();
    if (scheme != 'http' && scheme != 'https') return;
    if (!widget.urlPolicy.isAllowedHost(uri.host)) return;

    try {
      await _controller.runJavaScript(customerNativeMarkerJavaScript);
    } catch (_) {
      // Swallow — page may have navigated away; next finish will retry.
    }
  }

  Future<NavigationDecision> _handleNavigation(String url) async {
    final uri = Uri.tryParse(url);
    if (uri == null) return NavigationDecision.prevent;

    // about:blank / data: used by some payment / OAuth intermediaries.
    if (uri.scheme == 'about' || uri.scheme == 'data') {
      return NavigationDecision.navigate;
    }

    // Google OAuth start → system auth session (not embedded WebView).
    if (widget.oauthBridge.isGoogleOAuthStart(uri)) {
      GoogleOAuthDebug.log(
        'nav_oauth_start',
        requestId: _activeGoogleOAuthRequestId,
        uri: uri,
        inflightBefore: _googleAuthInFlight,
        inflightAfter: _googleAuthInFlight,
        extra: 'navigationPrevented=true willCallStart=true',
      );
      unawaited(_startGoogleOAuth(uri));
      return NavigationDecision.prevent;
    }

    // Never keep Google's authorize UI inside the WebView.
    // If we somehow land on accounts.google.com (redirect race / truncated
    // URL → Google 400), restart a clean native OAuth start instead of
    // showing Google's error page in-app.
    if (widget.oauthBridge.isGoogleAuthorizationHost(uri)) {
      GoogleOAuthDebug.log(
        'nav_google_host',
        requestId: _activeGoogleOAuthRequestId,
        uri: uri,
        inflightBefore: _googleAuthInFlight,
        inflightAfter: _googleAuthInFlight,
        extra:
            'navigationPrevented=true willCallIntercept=true '
            'willCallStart=${!_googleAuthInFlight}',
      );
      unawaited(_interceptGoogleAuthorizationHost(uri));
      return NavigationDecision.prevent;
    }

    if (widget.urlPolicy.shouldStayInWebView(uri)) {
      return NavigationDecision.navigate;
    }

    if (widget.urlPolicy.isExternalAppScheme(uri) || uri.scheme == 'intent') {
      await _openExternal(uri);
      return NavigationDecision.prevent;
    }

    // Keep ALL http(s) navigations in the WebView — including bank ACS / 3DS
    // hosts used by Razorpay. Opening those externally breaks the return path
    // so checkout.handler never runs and payment never verifies.
    if (uri.scheme == 'http' || uri.scheme == 'https') {
      return NavigationDecision.navigate;
    }

    return NavigationDecision.prevent;
  }

  Future<void> _interceptGoogleAuthorizationHost(Uri googleUri) async {
    GoogleOAuthDebug.log(
      'intercept_google_host',
      requestId: _activeGoogleOAuthRequestId,
      uri: googleUri,
      inflightBefore: _googleAuthInFlight,
      inflightAfter: _googleAuthInFlight,
      extra:
          'willCallStart=${!_googleAuthInFlight} '
          'navigationPrevented=true',
    );

    // Pull WebView off Google immediately so the user cannot submit email/password
    // against a truncated authorize URL (Google Error 400). loadRequest cancels
    // the in-flight Google navigation (WebViewController has no stopLoading).
    try {
      await _controller.loadRequest(
        Uri.parse('${widget.oauthBridge.siteOrigin}/login'),
      );
    } catch (_) {}

    final restart = widget.oauthBridge.resolveNativeStartUrl(googleUri);
    await _startGoogleOAuth(restart);
  }

  Future<void> _startGoogleOAuth(Uri startUri) async {
    final inflightBefore = _googleAuthInFlight;
    if (_googleAuthInFlight) {
      GoogleOAuthDebug.log(
        'auth_skip_inflight',
        requestId: _activeGoogleOAuthRequestId,
        uri: startUri,
        inflightBefore: inflightBefore,
        inflightAfter: true,
        extra: 'willCallStart=false',
      );
      return;
    }

    final requestId = GoogleOAuthDebug.nextRequestId();
    _activeGoogleOAuthRequestId = requestId;
    _googleAuthInFlight = true;
    GoogleOAuthDebug.log(
      'auth_start',
      requestId: requestId,
      uri: startUri,
      inflightBefore: inflightBefore,
      inflightAfter: true,
      extra: 'willCallStart=true',
    );

    if (mounted) {
      setState(() {
        _isLoading = true;
        _hasError = false;
        _errorMessage = null;
      });
    }

    try {
      // Bridge coerces Google authorize URLs → clean /api/auth/oauth/google?native=1.
      final redeemUrl = await widget.oauthBridge.authenticate(
        oauthStartUri: startUri,
        debugRequestId: requestId,
      );
      if (redeemUrl == null) {
        GoogleOAuthDebug.log(
          'auth_cancelled',
          requestId: requestId,
          uri: startUri,
          inflightBefore: true,
          inflightAfter: true,
        );
        // User cancelled — stay on current login page in WebView.
        if (mounted) {
          setState(() {
            _isLoading = false;
          });
        }
        return;
      }

      GoogleOAuthDebug.log(
        'auth_completed',
        requestId: requestId,
        uri: redeemUrl,
        inflightBefore: true,
        inflightAfter: true,
        extra: 'redeemPathOnly=true',
      );
      await _controller.loadRequest(redeemUrl);
    } on GoogleOAuthBridgeException catch (e) {
      GoogleOAuthDebug.log(
        'auth_error',
        requestId: requestId,
        uri: startUri,
        inflightBefore: true,
        inflightAfter: true,
        extra: 'errorType=GoogleOAuthBridgeException',
      );
      if (!mounted) return;
      // Surface error via website login page when possible.
      // Do not log e.message — may echo provider error text.
      final loginError = Uri.parse(
        '${widget.oauthBridge.siteOrigin}/login',
      ).replace(queryParameters: {'error': e.message});
      await _controller.loadRequest(loginError);
    } catch (_) {
      GoogleOAuthDebug.log(
        'auth_error',
        requestId: requestId,
        uri: startUri,
        inflightBefore: true,
        inflightAfter: true,
        extra: 'errorType=unknown',
      );
      if (!mounted) return;
      final loginError = Uri.parse(
        '${widget.oauthBridge.siteOrigin}/login',
      ).replace(
        queryParameters: {
          'error': 'Google sign-in failed. Please try again.',
        },
      );
      await _controller.loadRequest(loginError);
    } finally {
      final beforeClear = _googleAuthInFlight;
      _googleAuthInFlight = false;
      GoogleOAuthDebug.log(
        'auth_inflight_cleared',
        requestId: requestId,
        inflightBefore: beforeClear,
        inflightAfter: false,
      );
      _activeGoogleOAuthRequestId = null;
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _openExternal(Uri uri) async {
    try {
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
