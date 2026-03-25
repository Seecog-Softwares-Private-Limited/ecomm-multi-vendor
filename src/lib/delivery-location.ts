export const DELIVERY_LOCATION_STORAGE_KEY = "indovyapar_delivery_location_v1";

export type DeliveryLocation = {
  city: string;
  pincode: string;
  /** Shown in header after "Deliver to" (e.g. first name from saved address). */
  displayLabel?: string;
};

export const DEFAULT_DELIVERY_LOCATION: DeliveryLocation = {
  city: "Mumbai",
  pincode: "400001",
  displayLabel: "",
};

/** Metro quick-picks (optional shortcuts elsewhere). */
export const QUICK_DELIVERY_CITIES: readonly DeliveryLocation[] = [
  { city: "Mumbai", pincode: "400001" },
  { city: "Delhi", pincode: "110001" },
  { city: "Bengaluru", pincode: "560001" },
  { city: "Hyderabad", pincode: "500001" },
  { city: "Chennai", pincode: "600001" },
  { city: "Kolkata", pincode: "700001" },
  { city: "Pune", pincode: "411001" },
  { city: "Ahmedabad", pincode: "380001" },
  { city: "Jaipur", pincode: "302001" },
  { city: "Surat", pincode: "395001" },
] as const;

export function formatDeliverToLine(loc: DeliveryLocation): string {
  const pc = (loc.pincode ?? "").trim();
  const hasPin = /^\d{6}$/.test(pc);
  const label = (loc.displayLabel ?? "").trim();
  if (label && hasPin) return `${label} ${pc}`;
  if (hasPin) return pc;
  const city = (loc.city ?? "").trim() || DEFAULT_DELIVERY_LOCATION.city;
  if (hasPin) return `${city}, ${pc}`;
  return city;
}

export function parseStoredDeliveryLocation(raw: string | null): DeliveryLocation {
  if (!raw) return { ...DEFAULT_DELIVERY_LOCATION };
  try {
    const p = JSON.parse(raw) as unknown;
    if (typeof p !== "object" || p === null) return { ...DEFAULT_DELIVERY_LOCATION };
    const o = p as Record<string, unknown>;
    const city = typeof o.city === "string" ? o.city.trim() : "";
    const pincode =
      typeof o.pincode === "string" && /^\d{6}$/.test(o.pincode) ? o.pincode : "";
    const displayLabel = typeof o.displayLabel === "string" ? o.displayLabel.trim() : "";
    if (!pincode) return { ...DEFAULT_DELIVERY_LOCATION };
    return {
      city: city || DEFAULT_DELIVERY_LOCATION.city,
      pincode,
      displayLabel: displayLabel || undefined,
    };
  } catch {
    return { ...DEFAULT_DELIVERY_LOCATION };
  }
}

export function readDeliveryLocationFromStorage(): DeliveryLocation {
  if (typeof window === "undefined") return { ...DEFAULT_DELIVERY_LOCATION };
  return parseStoredDeliveryLocation(localStorage.getItem(DELIVERY_LOCATION_STORAGE_KEY));
}

export function writeDeliveryLocationToStorage(loc: DeliveryLocation): void {
  if (typeof window === "undefined") return;
  const pincode = /^\d{6}$/.test((loc.pincode ?? "").trim())
    ? loc.pincode!.trim()
    : DEFAULT_DELIVERY_LOCATION.pincode;
  const city = typeof loc.city === "string" ? loc.city.trim() : "";
  const displayLabel = typeof loc.displayLabel === "string" ? loc.displayLabel.trim() : "";
  localStorage.setItem(
    DELIVERY_LOCATION_STORAGE_KEY,
    JSON.stringify({
      city: city || DEFAULT_DELIVERY_LOCATION.city,
      pincode,
      ...(displayLabel ? { displayLabel } : {}),
    })
  );
}

/** Dispatched after login sync or other code updates localStorage so the provider can re-read. */
export const DELIVERY_LOCATION_SYNC_EVENT = "indovyapar-delivery-sync";

export function emitDeliveryLocationSynced(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(DELIVERY_LOCATION_SYNC_EVENT));
  }
}

/**
 * After customer login: set header delivery PIN from default (or first) saved address.
 * No-op if not logged in as customer or no valid address PIN.
 */
export async function syncCustomerDefaultAddressToDeliveryLocation(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const res = await fetch("/api/addresses", { credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.success !== true || !Array.isArray(data?.data?.addresses)) return;

    type Row = { pincode?: string; city?: string; fullName?: string; isDefault?: boolean };
    const addresses = data.data.addresses as Row[];
    const norm = (p: string) => p.replace(/\D/g, "").slice(0, 6);
    const valid = (a: Row) => /^\d{6}$/.test(norm(String(a.pincode ?? "")));
    const def =
      addresses.find((a) => a.isDefault && valid(a)) ?? addresses.find((a) => valid(a));
    if (!def?.pincode) return;
    const pincode = norm(def.pincode);
    if (!/^\d{6}$/.test(pincode)) return;

    const full = (def.fullName ?? "").trim();
    const displayLabel = full ? full.split(/\s+/)[0] : undefined;
    writeDeliveryLocationToStorage({
      city: (def.city ?? "").trim() || DEFAULT_DELIVERY_LOCATION.city,
      pincode,
      ...(displayLabel ? { displayLabel } : {}),
    });
    emitDeliveryLocationSynced();
  } catch {
    /* ignore */
  }
}
