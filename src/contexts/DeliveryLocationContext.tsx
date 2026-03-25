"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, X } from "lucide-react";
import {
  DEFAULT_DELIVERY_LOCATION,
  DELIVERY_LOCATION_SYNC_EVENT,
  formatDeliverToLine,
  readDeliveryLocationFromStorage,
  type DeliveryLocation,
  writeDeliveryLocationToStorage,
} from "@/lib/delivery-location";

type SavedAddressRow = {
  id: string;
  name: string;
  fullName: string;
  city: string;
  state: string;
  pincode: string;
  line1: string;
  isDefault: boolean;
  address: string;
};

type DeliveryLocationContextValue = {
  location: DeliveryLocation;
  setLocation: (loc: DeliveryLocation) => void;
  deliverToLabel: string;
  openDeliveryModal: () => void;
};

const DeliveryLocationContext = createContext<DeliveryLocationContextValue | null>(null);

export function useDeliveryLocation(): DeliveryLocationContextValue {
  const ctx = useContext(DeliveryLocationContext);
  if (!ctx) {
    throw new Error("useDeliveryLocation must be used within DeliveryLocationProvider");
  }
  return ctx;
}

function DividerWithText({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex items-center justify-center py-1">
      <div className="absolute inset-x-0 top-1/2 h-px bg-gray-200" aria-hidden />
      <span className="relative bg-white px-3 text-xs text-gray-500">{children}</span>
    </div>
  );
}

export function DeliveryLocationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [location, setLocationState] = useState<DeliveryLocation>(DEFAULT_DELIVERY_LOCATION);
  const [hydrated, setHydrated] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState("");

  const [authReady, setAuthReady] = useState(false);
  const [isCustomer, setIsCustomer] = useState(false);
  const [addresses, setAddresses] = useState<SavedAddressRow[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);

  useEffect(() => {
    setLocationState(readDeliveryLocationFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    const onSync = () => setLocationState(readDeliveryLocationFromStorage());
    window.addEventListener(DELIVERY_LOCATION_SYNC_EVENT, onSync);
    return () => window.removeEventListener(DELIVERY_LOCATION_SYNC_EVENT, onSync);
  }, []);

  useEffect(() => {
    if (!modalOpen) {
      setAuthReady(false);
      return;
    }
    let cancelled = false;
    setAuthReady(false);
    setAddressesLoading(true);
    (async () => {
      try {
        const meRes = await fetch("/api/auth/me", { credentials: "include" });
        const meJson = await meRes.json().catch(() => ({}));
        if (cancelled) return;
        const okCustomer =
          meRes.ok &&
          meJson?.success === true &&
          meJson?.data?.user?.role === "CUSTOMER";
        if (okCustomer) {
          setIsCustomer(true);
          const addrRes = await fetch("/api/addresses", { credentials: "include" });
          const addrJson = await addrRes.json().catch(() => ({}));
          if (!cancelled && addrRes.ok && addrJson?.success && Array.isArray(addrJson?.data?.addresses)) {
            setAddresses(addrJson.data.addresses as SavedAddressRow[]);
          } else if (!cancelled) {
            setAddresses([]);
          }
        } else {
          setIsCustomer(false);
          setAddresses([]);
        }
      } catch {
        if (!cancelled) {
          setIsCustomer(false);
          setAddresses([]);
        }
      } finally {
        if (!cancelled) {
          setAddressesLoading(false);
          setAuthReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [modalOpen]);

  useEffect(() => {
    if (modalOpen && hydrated) {
      setPinInput(location.pincode?.replace(/\D/g, "").slice(0, 6) ?? "");
    }
  }, [modalOpen, hydrated, location.pincode]);

  const setLocation = useCallback((loc: DeliveryLocation) => {
    const pin = /^\d{6}$/.test((loc.pincode ?? "").trim())
      ? loc.pincode!.trim()
      : DEFAULT_DELIVERY_LOCATION.pincode;
    const city = (loc.city ?? "").trim() || DEFAULT_DELIVERY_LOCATION.city;
    const displayLabel = (loc.displayLabel ?? "").trim();
    const next: DeliveryLocation = {
      city,
      pincode: pin,
      ...(displayLabel ? { displayLabel } : {}),
    };
    setLocationState(next);
    writeDeliveryLocationToStorage(next);
  }, []);

  const openDeliveryModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  const applyPinOnly = useCallback(() => {
    const digits = pinInput.replace(/\D/g, "").slice(0, 6);
    if (digits.length !== 6) return;
    setLocation({
      city: DEFAULT_DELIVERY_LOCATION.city,
      pincode: digits,
      displayLabel: undefined,
    });
    setModalOpen(false);
  }, [pinInput, setLocation]);

  const selectSavedAddress = useCallback(
    (a: SavedAddressRow) => {
      const pin = (a.pincode ?? "").replace(/\D/g, "").slice(0, 6);
      if (pin.length !== 6) return;
      const first = a.fullName?.trim().split(/\s+/)[0] || a.city;
      setLocation({
        city: a.city,
        pincode: pin,
        displayLabel: first,
      });
      setModalOpen(false);
    },
    [setLocation]
  );

  const goToLogin = useCallback(() => {
    const ret = pathname && pathname !== "/login" ? pathname : "/";
    router.push(`/login?returnUrl=${encodeURIComponent(ret)}`);
    setModalOpen(false);
  }, [router, pathname]);

  const deliverToLabel = useMemo(() => formatDeliverToLine(location), [location]);

  const value = useMemo(
    () => ({
      location,
      setLocation,
      deliverToLabel,
      openDeliveryModal,
    }),
    [location, setLocation, deliverToLabel, openDeliveryModal]
  );

  const returnUrl =
    pathname && pathname !== "/login" ? pathname : "/";

  return (
    <DeliveryLocationContext.Provider value={value}>
      {children}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delivery-location-title"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-[420px] rounded-lg bg-white shadow-2xl border border-gray-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3 border-b border-gray-100">
              <h2 id="delivery-location-title" className="text-lg font-semibold text-gray-900">
                Choose your location
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-5 space-y-4 max-h-[min(75vh,560px)] overflow-y-auto">
              {!authReady ? (
                <div className="flex justify-center py-10">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6A00] border-t-transparent" />
                </div>
              ) : isCustomer ? (
                <>
                  <p className="text-sm text-gray-600 leading-snug">
                    Select a delivery location to see product availability and delivery options
                  </p>

                  {addressesLoading ? (
                    <div className="flex justify-center py-6">
                      <div className="h-7 w-7 animate-spin rounded-full border-2 border-gray-300 border-t-[#FF6A00]" />
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/80 px-4 py-3 text-sm text-gray-600">
                      No saved addresses yet.{" "}
                      <Link
                        href={`/add-address?returnUrl=${encodeURIComponent(returnUrl)}`}
                        className="font-semibold text-[#FF6A00] hover:underline"
                        onClick={closeModal}
                      >
                        Add an address
                      </Link>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {addresses.map((a) => (
                        <li key={a.id}>
                          <button
                            type="button"
                            onClick={() => selectSavedAddress(a)}
                            className="w-full text-left rounded-lg border border-gray-200 px-3 py-3 hover:border-[#FF6A00] hover:bg-orange-50/40 transition flex gap-3"
                          >
                            <MapPin className="w-5 h-5 text-[#FF6A00] shrink-0 mt-0.5" aria-hidden />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-gray-900">{a.name}</span>
                                {a.isDefault && (
                                  <span className="text-[10px] font-bold uppercase tracking-wide text-[#FF6A00] bg-orange-50 px-1.5 py-0.5 rounded">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{a.address}</p>
                              <p className="text-xs text-gray-500 mt-1 font-medium">
                                {a.fullName} · {a.pincode}
                              </p>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  <Link
                    href="/address-management"
                    onClick={closeModal}
                    className="block text-center text-sm font-semibold text-[#FF6A00] hover:underline"
                  >
                    Manage addresses
                  </Link>

                  <DividerWithText>or enter an Indian pincode</DividerWithText>

                  <div className="flex gap-2 items-stretch">
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="Enter PIN code"
                      maxLength={6}
                      className="flex-1 min-w-0 px-3 py-2.5 rounded-md border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] outline-none text-base"
                    />
                    <button
                      type="button"
                      onClick={applyPinOnly}
                      disabled={pinInput.replace(/\D/g, "").length !== 6}
                      className="shrink-0 px-5 py-2.5 rounded-md border border-gray-300 bg-white text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Apply
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600 leading-snug">
                    Select a delivery location to see product availability and delivery options
                  </p>

                  <button
                    type="button"
                    onClick={goToLogin}
                    className="w-full py-2.5 px-4 rounded-lg bg-[#FFD814] border border-[#FCD200] text-sm font-semibold text-gray-900 shadow-sm hover:bg-[#F7CA00] active:bg-[#F0B800] transition"
                  >
                    Sign in to see your addresses
                  </button>

                  <DividerWithText>or enter an Indian pincode</DividerWithText>

                  <div className="flex gap-2 items-stretch">
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="Enter PIN code"
                      maxLength={6}
                      className="flex-1 min-w-0 px-3 py-2.5 rounded-md border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] outline-none text-base"
                    />
                    <button
                      type="button"
                      onClick={applyPinOnly}
                      disabled={pinInput.replace(/\D/g, "").length !== 6}
                      className="shrink-0 px-5 py-2.5 rounded-md border border-gray-300 bg-white text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Apply
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </DeliveryLocationContext.Provider>
  );
}
