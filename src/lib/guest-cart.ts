/**
 * Guest cart (localStorage) for users who are not logged in.
 * Merged into server cart on login. Dispatches "guest-cart-changed" so Navbar can update count.
 */

const STORAGE_KEY = "indovyapar_guest_cart";
const EVENT_NAME = "guest-cart-changed";

export type GuestCartItem = {
  productId: string;
  quantity: number;
  variantKey: string | null;
  name: string;
  price: number;
  imageUrl: string | null;
  mrp?: number;
};

function getStored(): GuestCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setStored(items: GuestCartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch {
    // ignore
  }
}

export function getGuestCart(): GuestCartItem[] {
  return getStored();
}

export function getGuestCartCount(): number {
  return getStored().reduce((sum, it) => sum + it.quantity, 0);
}

export function addToGuestCart(item: {
  productId: string;
  quantity: number;
  variantKey?: string | null;
  name: string;
  price: number;
  imageUrl?: string | null;
  mrp?: number;
}): void {
  const list = getStored();
  const variantKey = item.variantKey ?? null;
  const existing = list.find(
    (x) => x.productId === item.productId && (x.variantKey ?? null) === variantKey
  );
  const newItem: GuestCartItem = {
    productId: item.productId,
    quantity: item.quantity,
    variantKey,
    name: item.name,
    price: item.price,
    imageUrl: item.imageUrl ?? null,
    mrp: item.mrp,
  };
  if (existing) {
    const next = list.map((x) =>
      x === existing
        ? { ...newItem, quantity: Math.min(99, existing.quantity + item.quantity) }
        : x
    );
    setStored(next);
  } else {
    setStored([...list, { ...newItem, quantity: Math.min(99, item.quantity) }]);
  }
}

export function updateGuestCartQuantity(productId: string, variantKey: string | null, quantity: number): void {
  if (quantity < 1) {
    removeFromGuestCart(productId, variantKey);
    return;
  }
  const list = getStored();
  const existing = list.find((x) => x.productId === productId && (x.variantKey ?? null) === variantKey);
  if (!existing) return;
  const next = list.map((x) =>
    x === existing ? { ...x, quantity: Math.min(99, quantity) } : x
  );
  setStored(next);
}

export function removeFromGuestCart(productId: string, variantKey?: string | null): void {
  const vk = variantKey ?? null;
  const next = getStored().filter(
    (x) => !(x.productId === productId && (x.variantKey ?? null) === vk)
  );
  setStored(next);
}

export function clearGuestCart(): void {
  setStored([]);
}

export function subscribeToGuestCartChanges(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
