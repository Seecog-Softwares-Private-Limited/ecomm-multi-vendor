import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

/** Bump with each store release — busts CDN/WebView cache for HTML on first load. */
const APP_RELEASE = '1.0.0.7';

/**
 * Vendor home — middleware sends unauthenticated users to /vendor/login;
 * keeps returning vendors on the dashboard when the session cookie is still valid.
 * `app=1` enables hybrid-app chrome hiding on shared layouts; `v` busts stale caches.
 */
const VENDOR_DASHBOARD_URI = `https://indovyapar.com/vendor?app=1&v=${APP_RELEASE}`;
const VENDOR_LOGIN_URI = `https://indovyapar.com/vendor/login?app=1&v=${APP_RELEASE}`;

/**
 * Platform-native mobile UA. An Android Chrome UA on iOS WKWebView can break
 * the system file/camera picker. Desktop UA previously served the wrong bundles.
 */
const ANDROID_WEBVIEW_USER_AGENT =
  'Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
const IPHONE_WEBVIEW_USER_AGENT =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const IPAD_WEBVIEW_USER_AGENT =
  'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';

function getWebViewUserAgent() {
  if (Platform.OS !== 'ios') return ANDROID_WEBVIEW_USER_AGENT;
  return Platform.isPad ? IPAD_WEBVIEW_USER_AGENT : IPHONE_WEBVIEW_USER_AGENT;
}

function isOurMarketplaceHost(hostname) {
  const host = String(hostname || '').toLowerCase();
  return (
    host === 'indovyapar.com' ||
    host.endsWith('.indovyapar.com') ||
    host === 'localhost' ||
    host.endsWith('.localhost')
  );
}

/** Customer auth surfaces must never appear inside the vendor app (Guideline 4.8). */
function isBlockedCustomerAuthPath(pathname) {
  const path = String(pathname || '').toLowerCase();
  if (path.startsWith('/vendor')) return false;
  if (path.startsWith('/api')) return false;
  return (
    path === '/login' ||
    path.startsWith('/login/') ||
    path === '/register' ||
    path.startsWith('/register/') ||
    path === '/forgot-password' ||
    path.startsWith('/forgot-password/') ||
    path === '/reset-password' ||
    path.startsWith('/reset-password/') ||
    path === '/complete-profile' ||
    path.startsWith('/complete-profile/')
  );
}

function randomAppleNonce(length = 32) {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-._';
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function injectAppleAuthResult(webRef, payload) {
  if (!webRef) return;
  const json = JSON.stringify(payload);
  webRef.injectJavaScript(`
    (function () {
      try {
        var payload = ${json};
        if (typeof window.__INDOVYAPAR_ON_APPLE_AUTH_RESULT__ === 'function') {
          window.__INDOVYAPAR_ON_APPLE_AUTH_RESULT__(payload);
        }
        window.dispatchEvent(new MessageEvent('message', {
          data: JSON.stringify({ type: 'custom', name: 'APPLE_AUTH_RESULT', payload: payload })
        }));
      } catch (e) {}
    })();
    true;
  `);
}

async function nativeSignInWithApple() {
  const available = await AppleAuthentication.isAvailableAsync();
  if (!available) {
    throw new Error('Sign in with Apple is not available on this device.');
  }
  const rawNonce = randomAppleNonce();
  // expo-apple-authentication forwards `nonce` unmodified to Apple.
  // Apple requires the SHA-256 hashed nonce value for replay protection.
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawNonce
  );
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
    nonce: hashedNonce,
  });
  if (!credential.identityToken) {
    throw new Error('Apple did not return an identity token.');
  }
  return {
    success: true,
    identityToken: credential.identityToken,
    authorizationCode: credential.authorizationCode ?? null,
    user: credential.user ?? null,
    email: credential.email ?? null,
    fullName: credential.fullName
      ? {
          givenName: credential.fullName.givenName ?? null,
          familyName: credential.fullName.familyName ?? null,
        }
      : null,
    // Backend verification expects the raw nonce, and hashes exactly once.
    nonce: rawNonce,
  };
}

/** Disable pinch-zoom + clear stale SW/cache; block customer auth SPA routes (Guideline 4 / 4.8). */
const DISABLE_ZOOM_SCRIPT = `
(function () {
  try {
    window.__INDOVYAPAR_NATIVE__ = {
      platform: ${JSON.stringify(Platform.OS)},
      appleSignIn: ${Platform.OS === 'ios' ? 'true' : 'false'},
      appRelease: ${JSON.stringify(APP_RELEASE)}
    };
    try { window.sessionStorage.setItem('indovyapar-app-mode', '1'); } catch (e) {}

    var meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'viewport';
      (document.head || document.documentElement).appendChild(meta);
    }
    meta.setAttribute(
      'content',
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
    );
    document.documentElement.style.touchAction = 'manipulation';

    var cacheKey = 'vendor_wv_cache_cleared_${APP_RELEASE}';
    if (window.localStorage && window.localStorage.getItem(cacheKey) !== '1') {
      window.localStorage.setItem(cacheKey, '1');
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function (regs) {
          regs.forEach(function (r) { r.unregister(); });
        });
      }
      if ('caches' in window) {
        caches.keys().then(function (keys) {
          keys.forEach(function (k) { caches.delete(k); });
        });
      }
    }

    var VENDOR_LOGIN = ${JSON.stringify(VENDOR_LOGIN_URI)};
    function isBlockedCustomerPath(pathname) {
      var path = String(pathname || '').toLowerCase();
      if (path.indexOf('/vendor') === 0 || path.indexOf('/api') === 0) return false;
      return (
        path === '/login' || path.indexOf('/login/') === 0 ||
        path === '/register' || path.indexOf('/register/') === 0 ||
        path === '/forgot-password' || path.indexOf('/forgot-password/') === 0 ||
        path === '/reset-password' || path.indexOf('/reset-password/') === 0 ||
        path === '/complete-profile' || path.indexOf('/complete-profile/') === 0
      );
    }
    function guardUrl(raw) {
      try {
        var u = new URL(String(raw), window.location.href);
        if (u.origin === window.location.origin && isBlockedCustomerPath(u.pathname)) {
          window.location.replace(VENDOR_LOGIN);
          return true;
        }
      } catch (e) {}
      return false;
    }
    var _push = history.pushState;
    var _replace = history.replaceState;
    history.pushState = function () {
      if (arguments[2] && guardUrl(arguments[2])) return;
      return _push.apply(this, arguments);
    };
    history.replaceState = function () {
      if (arguments[2] && guardUrl(arguments[2])) return;
      return _replace.apply(this, arguments);
    };
    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;
      if (a.getAttribute('target') === '_blank') {
        e.preventDefault();
        e.stopPropagation();
        if (!guardUrl(href)) {
          try { window.location.assign(a.href); } catch (err) {}
        }
        return;
      }
      if (guardUrl(href)) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
    var _open = window.open;
    window.open = function (url) {
      if (url && guardUrl(url)) return null;
      if (url) {
        try { window.location.assign(String(url)); } catch (e) {}
      }
      return null;
    };
    if (isBlockedCustomerPath(window.location.pathname)) {
      window.location.replace(VENDOR_LOGIN);
    }
  } catch (e) {}
})();
true;
`;

function VendorScreen() {
  const webRef = useRef(null);

  const [splash, setSplash] = useState(true);
  const [errorKey, setErrorKey] = useState(0);

  /** Last load error shown in overlay (network, WebView, or HTTP). */
  const [loadErrorMessage, setLoadErrorMessage] = useState(null);
  /** When false, navigator reports offline — block / warn. */
  const [isOffline, setIsOffline] = useState(false);

  const clearTransientError = useCallback(() => setLoadErrorMessage(null), []);

  /** Prevents clearing the error banner on load completion when HTTP 4xx/5xx is reported for the main doc. */
  const httpRejectedRef = useRef(false);
  /** True when the WebView reported a native load error for the current navigation. */
  const webViewFailedRef = useRef(false);

  const handleRetry = useCallback(() => {
    clearTransientError();
    setSplash(true);
    setErrorKey((k) => k + 1);
  }, [clearTransientError]);

  // On web, an embedded cross-origin iframe can't retain the site's session
  // cookie (browsers treat it as a blocked third-party cookie), so login loops
  // back to the sign-in page. Navigate the top-level window instead so the
  // vendor site loads first-party and auth works. Native uses the WebView.
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.replace(VENDOR_DASHBOARD_URI);
    }
  }, []);

  useEffect(() => {
    NetInfo.fetch().then((state) => {
      const offline =
        state.isConnected === false ||
        state.isInternetReachable === false;
      setIsOffline(Boolean(offline));
      if (offline) {
        setLoadErrorMessage('No internet connection.');
        setSplash(false);
      } else {
        setLoadErrorMessage((prev) =>
          prev === 'No internet connection.' ? null : prev,
        );
      }
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline =
        state.isConnected === false ||
        state.isInternetReachable === false;
      setIsOffline(Boolean(offline));
      if (offline) {
        setLoadErrorMessage('No internet connection.');
      } else {
        setLoadErrorMessage((prev) =>
          prev === 'No internet connection.' ? null : prev,
        );
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (webRef.current) {
        webRef.current.injectJavaScript(`
          (function () {
            if (typeof window.__INDOVYAPAR_VENDOR_HANDLE_BACK__ === 'function') {
              window.__INDOVYAPAR_VENDOR_HANDLE_BACK__();
            } else if (window.history.length > 1) {
              window.history.back();
            } else {
              window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'custom', name: 'VENDOR_NAV_EXIT' }));
            }
          })();
          true;
        `);
      }
      return true;
    });
    return () => sub.remove();
  }, []);

  const onLoadStart = useCallback(() => {
    httpRejectedRef.current = false;
    webViewFailedRef.current = false;
  }, []);

  const onLoadEnd = useCallback(() => {
    setSplash(false);
    if (
      !httpRejectedRef.current &&
      !webViewFailedRef.current &&
      !isOffline
    ) {
      setLoadErrorMessage(null);
    }
    httpRejectedRef.current = false;
    webViewFailedRef.current = false;
    // Re-assert capability flag after navigations (cached pages / SPA).
    webRef.current?.injectJavaScript(`
      (function () {
        try {
          window.__INDOVYAPAR_NATIVE__ = {
            platform: ${JSON.stringify(Platform.OS)},
            appleSignIn: ${Platform.OS === 'ios' ? 'true' : 'false'},
            appRelease: ${JSON.stringify(APP_RELEASE)}
          };
        } catch (e) {}
      })();
      true;
    `);
  }, [isOffline]);

  const onError = useCallback((syn) => {
    webViewFailedRef.current = true;
    const desc = syn?.nativeEvent?.description ?? 'Could not load the page.';
    setSplash(false);
    setLoadErrorMessage(desc);
  }, []);

  const onHttpError = useCallback((syn) => {
    const code = syn?.nativeEvent?.statusCode;
    if (code != null && code >= 400) {
      httpRejectedRef.current = true;
      setSplash(false);
      setLoadErrorMessage(`Unable to load (HTTP ${code}).`);
    }
  }, []);

  const onWebViewMessage = useCallback((event) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg?.type === 'custom' && msg?.name === 'VENDOR_NAV_EXIT') {
        BackHandler.exitApp();
        return;
      }
      if (
        msg?.type === 'custom' &&
        msg?.name === 'OPEN_EXTERNAL_BROWSER' &&
        typeof msg.payload === 'string'
      ) {
        const target = msg.payload.trim();
        // Never hand http(s) to Safari / Chrome Custom Tabs (Guideline 4).
        // Keep navigation inside the WebView. Only tel:/mailto: may leave the app.
        if (/^(tel:|mailto:)/i.test(target)) {
          Linking.openURL(target).catch(() => {});
          return;
        }
        if (/^https?:\/\//i.test(target)) {
          const dest = JSON.stringify(target);
          webRef.current?.injectJavaScript(
            `window.location.assign(${dest}); true;`
          );
          return;
        }
        return;
      }
      if (msg?.type === 'custom' && msg?.name === 'SIGN_IN_WITH_APPLE') {
        if (Platform.OS !== 'ios') {
          injectAppleAuthResult(webRef.current, {
            success: false,
            message: 'Sign in with Apple is only available on iOS.',
          });
          return;
        }
        nativeSignInWithApple()
          .then((payload) => injectAppleAuthResult(webRef.current, payload))
          .catch((err) => {
            const cancelled = err?.code === 'ERR_REQUEST_CANCELED';
            injectAppleAuthResult(webRef.current, {
              success: false,
              cancelled,
              message: cancelled
                ? 'Apple sign-in was cancelled.'
                : err?.message || 'Apple sign-in failed.',
            });
          });
      }
    } catch {
      /* ignore non-JSON bridge messages */
    }
  }, []);

  const onShouldStartLoadWithRequest = useCallback((request) => {
    const url = request?.url;
    if (!url || url === 'about:blank' || url.startsWith('data:') || url.startsWith('blob:')) {
      return true;
    }
    // Allow iframe / subframe loads (Google widgets, etc.).
    if (request?.isTopFrame === false) {
      return true;
    }

    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      return true;
    }

    if (isOurMarketplaceHost(parsed.hostname) && isBlockedCustomerAuthPath(parsed.pathname)) {
      const dest = JSON.stringify(VENDOR_LOGIN_URI);
      setTimeout(() => {
        webRef.current?.injectJavaScript(
          `window.location.replace(${dest}); true;`
        );
      }, 0);
      return false;
    }

    return true;
  }, []);

  // react-native-webview has no web implementation. Rather than embed the site
  // in an iframe (which breaks auth via third-party cookie blocking), web does a
  // top-level redirect (see effect above) and shows a brief loading screen here.
  const webViewEl = Platform.OS === 'web' ? (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color="#1a73e8" />
      <Text style={styles.redirectText}>Opening vendor sign in…</Text>
    </View>
  ) : (
    <WebView
      key={`vendor-${errorKey}`}
      ref={webRef}
      source={{ uri: VENDOR_DASHBOARD_URI }}
      style={styles.flexWeb}
      javaScriptEnabled
      domStorageEnabled
      cacheEnabled
      sharedCookiesEnabled
      allowsBackForwardNavigationGestures
      mediaPlaybackRequiresUserAction={false}
      allowsInlineMediaPlayback
      thirdPartyCookiesEnabled
      mixedContentMode="compatibility"
      incognito={false}
      userAgent={getWebViewUserAgent()}
      originWhitelist={['*']}
      setSupportMultipleWindows={false}
      bounces={false}
      injectedJavaScriptBeforeContentLoaded={DISABLE_ZOOM_SCRIPT}
      onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
      onNavigationStateChange={() => {}}
      onLoadStart={onLoadStart}
      onLoadEnd={onLoadEnd}
      onError={onError}
      onHttpError={onHttpError}
      onMessage={onWebViewMessage}
      {...Platform.select({
        ios: {
          pullToRefreshEnabled: false,
          automaticallyAdjustContentInsets: true,
          minimumZoomScale: 1,
          maximumZoomScale: 1,
        },
        android: {
          overScrollMode: 'never',
          nestedScrollEnabled: true,
          scalesPageToFit: false,
          setBuiltInZoomControls: false,
          setDisplayZoomControls: false,
          textZoom: 100,
        },
      })}
    />
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'right', 'bottom', 'left']}>
      {webViewEl}

      {splash && !loadErrorMessage ? (
        <View style={styles.overlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#1a73e8" />
        </View>
      ) : null}

      {loadErrorMessage ? (
        <View style={styles.errorWrap} accessibilityRole="alert">
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorDetail}>{loadErrorMessage}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <VendorScreen />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  flexWeb: {
    flex: 1,
  },
  redirectText: {
    marginTop: 16,
    fontSize: 15,
    color: '#444',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  errorWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#111',
  },
  errorDetail: {
    fontSize: 15,
    color: '#444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: '#1a73e8',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
