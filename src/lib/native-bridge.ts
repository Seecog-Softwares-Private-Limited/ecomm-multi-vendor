export type NativeBridgeMessage =
  | {
      type: "auth-token";
      token: string;
    }
  | {
      type: "deep-link";
      href: string;
    }
  | {
      type: "device-info";
      platform: string;
      version?: string;
    }
  | {
      type: "custom";
      name: "OPEN_EXTERNAL_BROWSER";
      payload?: unknown;
    }
  | {
      type: "custom";
      name: "SIGN_IN_WITH_APPLE";
      payload?: { returnUrl?: string };
    }
  | {
      type: "custom";
      name: "APPLE_AUTH_RESULT";
      payload?: AppleAuthResultPayload;
    }
  | {
      type: "custom";
      name: string;
      payload?: unknown;
    };

export type AppleAuthResultPayload =
  | {
      success: true;
      identityToken: string;
      authorizationCode?: string | null;
      user?: string | null;
      email?: string | null;
      fullName?: {
        givenName?: string | null;
        familyName?: string | null;
      } | null;
      nonce: string;
    }
  | {
      success: false;
      cancelled?: boolean;
      cancelled?: boolean;
      message: string;
    };

export type NativeBridgeHandler = (message: NativeBridgeMessage) => void;

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
    __INDOVYAPAAR_NATIVE_BRIDGE__?: {
      postMessage: (message: NativeBridgeMessage) => void;
      subscribe?: (handler: NativeBridgeHandler) => () => void;
    };
    __INDOVYAPAR_ON_APPLE_AUTH_RESULT__?: (payload: AppleAuthResultPayload) => void;
  }
}

function canUseDom() {
  return typeof window !== "undefined";
}

export function hasNativeBridge(): boolean {
  if (!canUseDom()) return false;
  return Boolean(window.ReactNativeWebView || window.__INDOVYAPAAR_NATIVE_BRIDGE__);
}

export function postToNative(message: NativeBridgeMessage): boolean {
  if (!canUseDom()) return false;

  if (window.__INDOVYAPAAR_NATIVE_BRIDGE__) {
    window.__INDOVYAPAAR_NATIVE_BRIDGE__.postMessage(message);
    return true;
  }

  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
    return true;
  }

  return false;
}

export function subscribeToNative(handler: NativeBridgeHandler): () => void {
  if (!canUseDom()) return () => {};

  const bridge = window.__INDOVYAPAAR_NATIVE_BRIDGE__;
  if (bridge?.subscribe) {
    return bridge.subscribe(handler);
  }

  const onMessage = (event: MessageEvent<string | NativeBridgeMessage>) => {
    try {
      const raw = event.data;
      const payload =
        typeof raw === "string" ? (JSON.parse(raw) as NativeBridgeMessage) : raw;
      handler(payload);
    } catch {
      // Ignore malformed bridge messages.
    }
  };

  window.addEventListener("message", onMessage);
  return () => window.removeEventListener("message", onMessage);
}
