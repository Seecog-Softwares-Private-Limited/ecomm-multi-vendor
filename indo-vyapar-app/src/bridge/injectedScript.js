/**
 * Injected into WebView on load: bridge API, chunk errors, location hooks,
 * session helpers, pull-to-refresh, haptics, share.
 */
export const INJECTED_APP_SCRIPT = `
(function () {
  function post(msg) {
    if (!window.ReactNativeWebView) return;
    try {
      window.ReactNativeWebView.postMessage(JSON.stringify(msg));
    } catch (e) {}
  }

  window.__INDO_VYAPAR_MOBILE__ = true;
  window.__INDO_VYAPAR_BRIDGE_VERSION__ = 2;

  /* --- App-only UI: light scheme, hide footer & in-WebView OAuth buttons --- */
  function hideNode(node) {
    if (!node || !node.style || node.getAttribute("data-iv-hidden") === "1") return;
    node.style.setProperty("display", "none", "important");
    node.setAttribute("data-iv-hidden", "1");
  }

  function ensureLightColorScheme() {
    var head = document.head || document.getElementsByTagName("head")[0];
    if (!head) return;
    var meta = document.querySelector('meta[name="color-scheme"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "color-scheme");
      head.appendChild(meta);
    }
    meta.setAttribute("content", "light");
    var theme = document.querySelector('meta[name="theme-color"]');
    if (!theme) {
      theme = document.createElement("meta");
      theme.setAttribute("name", "theme-color");
      head.appendChild(theme);
    }
    theme.setAttribute("content", "#ffffff");
    if (!document.querySelector("style[data-indo-vyapar-ui]")) {
      var uiStyle = document.createElement("style");
      uiStyle.setAttribute("data-indo-vyapar-ui", "color-scheme");
      uiStyle.textContent =
        ":root{color-scheme:light !important;}" +
        "html{color-scheme:light !important;}" +
        "footer,[role='contentinfo'],.footer,#footer{display:none !important;}";
      head.appendChild(uiStyle);
    }
  }

  function hideOAuthButtons() {
    document
      .querySelectorAll(
        'a[href*="/oauth/apple"], a[href*="appleid.apple.com"],' +
          'a[href*="/oauth/google"], a[href*="accounts.google.com"],' +
          'a[href*="/oauth/facebook"], a[href*="facebook.com"]'
      )
      .forEach(hideNode);
    document.querySelectorAll("button,a,[role='button']").forEach(function (node) {
      var label = String(node.getAttribute("aria-label") || "").toLowerCase();
      var href = String(node.getAttribute("href") || "").toLowerCase();
      var text = String(node.innerText || "").trim().toLowerCase();
      if (text.length > 120) return;
      if (/oauth\\/(apple|google|facebook)|appleid\\.apple|accounts\\.google|facebook\\.com/.test(href)) {
        hideNode(node);
        return;
      }
      if (/sign in with (apple|google|facebook)|continue with (apple|google|facebook)/.test(label + " " + text)) {
        hideNode(node);
      }
    });
  }

  function applyAppOnlyUi() {
    try {
      ensureLightColorScheme();
      document.querySelectorAll("footer,[role='contentinfo'],.footer,#footer").forEach(hideNode);
      hideOAuthButtons();
    } catch (_) {}
  }

  applyAppOnlyUi();
  document.addEventListener("DOMContentLoaded", applyAppOnlyUi);
  var uiObs = new MutationObserver(applyAppOnlyUi);
  if (document.documentElement) {
    uiObs.observe(document.documentElement, { childList: true, subtree: true });
  }

  /* --- Chunk / module load guard --- */
  function isChunkError(message) {
    return /Loading chunk|ChunkLoadError|Failed to fetch dynamically imported module/i.test(message || "");
  }
  window.addEventListener("error", function (event) {
    var msg = (event && event.message) || "";
    if (isChunkError(msg)) post({ type: "chunk_error", message: msg });
  });
  window.addEventListener("unhandledrejection", function (event) {
    var reason = event && event.reason;
    var msg = (reason && (reason.message || String(reason))) || "";
    if (isChunkError(msg)) post({ type: "chunk_error", message: msg });
  });

  /* --- Native bridge API for website --- */
  window.IndoVyaparNative = {
    post: post,
    requestLocation: function () { post({ type: "request_location" }); },
    openCamera: function () { post({ type: "request_camera" }); },
    pickImage: function (opts) {
      post({ type: "request_image_picker", allowsMultiple: !!(opts && opts.multiple) });
    },
    pickFile: function () { post({ type: "request_file_upload" }); },
    registerPush: function () { post({ type: "request_push_register" }); },
    authenticateBiometric: function (reason) {
      post({ type: "request_biometric", reason: reason || "Confirm your identity" });
    },
    syncSession: function (data) { post({ type: "sync_session", session: data || {} }); },
    getSession: function () { post({ type: "get_session" }); },
    clearSession: function () { post({ type: "clear_session" }); },
    navigate: function (screen) { post({ type: "navigate_native", screen: screen }); },
    openExternal: function (url) { post({ type: "open_external", url: url }); },
    share: function (title, url) {
      post({ type: "share_request", title: title || document.title, url: url || location.href });
    }
  };

  /* --- Listen for native → web events --- */
  [
    "native-ready",
    "native-location",
    "native-camera-result",
    "native-image-picker-result",
    "native-file-upload-result",
    "native-push-token",
    "native-biometric-result",
    "native-session-sync",
    "native-network-status",
    "native-permissions-result"
  ].forEach(function (name) {
    window.addEventListener(name, function (e) {
      if (window.onIndoVyaparNativeEvent) {
        try { window.onIndoVyaparNativeEvent(name, e.detail || {}); } catch (_) {}
      }
    });
  });

  /* --- Tablet / responsive polish --- */
  var style = document.createElement("style");
  style.setAttribute("data-indo-vyapar", "responsive");
  style.textContent =
    "html{-webkit-text-size-adjust:100%;}" +
    "@media (min-width:768px){body{background-color:#fff7ed;} img{max-width:100%;height:auto;}}" +
    "@media (min-width:768px){#__next,main,#root{max-width:1200px;margin-left:auto;margin-right:auto;}}" +
    "@media (min-width:1024px){#__next,main,#root{max-width:1280px;padding-left:16px;padding-right:16px;}}";
  document.documentElement.appendChild(style);

  /* --- Image retry + placeholder --- */
  var PLACEHOLDER =
    "data:image/svg+xml," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240" viewBox="0 0 320 240">' +
        '<rect fill="#fff7ed" width="320" height="240"/>' +
        '<rect fill="#fed7aa" x="80" y="70" width="160" height="100" rx="6"/>' +
        '<text x="160" y="200" text-anchor="middle" fill="#ea580c" font-family="system-ui,sans-serif" font-size="12">Indo Vyapar</text>' +
      "</svg>"
    );

  function enhanceImg(img) {
    if (!img || img.dataset.ivImg === "1") return;
    img.dataset.ivImg = "1";
    var original = img.getAttribute("src") || "";
    var tries = 0;
    img.addEventListener("error", function onErr() {
      tries += 1;
      if (tries === 1 && original) {
        var sep = original.indexOf("?") >= 0 ? "&" : "?";
        img.src = original + sep + "iv_retry=" + Date.now();
        return;
      }
      img.src = PLACEHOLDER;
      img.alt = img.alt || "Product image";
    }, false);
    img.addEventListener("load", function () { img.style.opacity = "1"; });
    img.style.backgroundColor = "#ffedd5";
    img.style.opacity = img.complete ? "1" : "0.65";
    img.style.transition = "opacity 0.25s ease";
  }
  function scanImages() {
    document.querySelectorAll("img").forEach(enhanceImg);
  }
  scanImages();
  var imgObs = new MutationObserver(scanImages);
  imgObs.observe(document.documentElement, { childList: true, subtree: true });

  /* --- Pull-from-top refresh --- */
  var startY = null;
  var armed = false;
  window.addEventListener("touchstart", function (e) {
    if (window.scrollY <= 2 && e.touches && e.touches[0]) startY = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener("touchmove", function (e) {
    if (startY == null || !e.touches || !e.touches[0]) return;
    var dy = e.touches[0].clientY - startY;
    if (window.scrollY <= 2 && dy > 90) armed = true;
  }, { passive: true });
  window.addEventListener("touchend", function () {
    if (armed) {
      armed = false;
      startY = null;
      post({ type: "pull_refresh" });
    } else {
      startY = null;
    }
  }, { passive: true });

  /* --- Haptics on commerce actions --- */
  document.addEventListener("click", function (e) {
    var el = e.target && e.target.closest && e.target.closest("button,a,[role='button'],input[type='submit']");
    if (!el) return;
    var text = ((el.innerText || "") + " " + (el.getAttribute("aria-label") || "")).toLowerCase();
    var style = "selection";
    if (/cart|checkout|wishlist|buy now|add to cart|place order|order now/i.test(text)) {
      style = "impact_medium";
    }
    post({ type: "haptic", style: style });
  }, true);

  window.indoVyaparShare = function (title, url) {
    window.IndoVyaparNative.share(title, url);
  };

  post({ type: "web_ready" });
  true;
})();
`;
