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
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

/** Bump with each store release — busts CDN/WebView cache for HTML on first load. */
const APP_RELEASE = '1.0.6';

/**
 * Vendor home — middleware sends unauthenticated users to /vendor/login;
 * keeps returning vendors on the dashboard when the session cookie is still valid.
 * `app=1` enables hybrid-app chrome hiding on shared layouts; `v` busts stale caches.
 */
const VENDOR_DASHBOARD_URI = `https://indovyapar.com/vendor?app=1&v=${APP_RELEASE}`;

/**
 * Mobile Chrome UA — must match phone Chrome so CDN/server serve the same bundles as the browser.
 * Desktop UA caused stale/different cached JS in WebView vs Chrome on the same device.
 * If Google OAuth fails, try removing userAgent from WebView.
 */
const WEBVIEW_USER_AGENT =
  'Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

/** Disable pinch-zoom + clear stale SW/cache once per app release (post-deploy chunk mismatch). */
const DISABLE_ZOOM_SCRIPT = `
(function () {
  try {
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
        typeof msg.payload === 'string' &&
        msg.payload.startsWith('http')
      ) {
        Linking.openURL(msg.payload).catch(() => {
          setLoadErrorMessage('Could not open the sign-in browser.');
        });
      }
    } catch {
      /* ignore non-JSON bridge messages */
    }
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
      userAgent={WEBVIEW_USER_AGENT}
      originWhitelist={['*']}
      bounces={false}
      injectedJavaScriptBeforeContentLoaded={DISABLE_ZOOM_SCRIPT}
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
