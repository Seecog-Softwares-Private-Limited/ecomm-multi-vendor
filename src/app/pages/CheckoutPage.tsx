"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Check,
  Plus,
  CreditCard,
  Smartphone,
  Wallet,
  Lock,
  X,
  Pencil,
  Trash2,
} from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Navbar } from "@/components/Navbar";

type AddressApi = {
  id: string;
  type: string;
  name: string;
  fullName: string;
  address: string;
  phone: string;
  isDefault: boolean;
  line1?: string;
  line2?: string | null;
  city?: string;
  state?: string;
  pincode?: string;
};

type CartItemApi = {
  id: string;
  productId: string;
  quantity: number;
  variantKey: string | null;
  product: {
    id: string;
    name: string;
    sellingPrice: number;
    mrp: number;
    stock: number;
    status: string;
    imageUrl: string | null;
    gstPercent: number | null;
  };
};

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400";
const SHIPPING_FREE_THRESHOLD = 500;
const SHIPPING_COST = 50;

export function CheckoutPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<AddressApi[]>([]);
  const [cartItems, setCartItems] = useState<CartItemApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<"card" | "upi" | "cod">("cod");
  const [upiId, setUpiId] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addAddressSubmitting, setAddAddressSubmitting] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);
  const [newAddressForm, setNewAddressForm] = useState({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    type: "HOME" as "HOME" | "OFFICE" | "OTHER",
    isDefault: true,
  });

  const fetchData = useCallback(async () => {
    try {
      const [addrRes, cartRes] = await Promise.all([
        fetch("/api/addresses", { credentials: "include" }),
        fetch("/api/cart/items", { credentials: "include" }),
      ]);

      if (addrRes.status === 401 || cartRes.status === 401) {
        router.push("/login?returnUrl=" + encodeURIComponent("/checkout"));
        return;
      }
      if (addrRes.status === 403 || cartRes.status === 403) {
        router.push("/");
        return;
      }

      const addrData = await addrRes.json().catch(() => ({}));
      const cartData = await cartRes.json().catch(() => ({}));
      const addrList = addrData?.data?.addresses ?? [];
      const items = cartData?.data?.items ?? [];

      setAddresses(addrList);
      setCartItems(items);
      if (addrList.length > 0) {
        const defaultAddr = addrList.find((a: AddressApi) => a.isDefault) ?? addrList[0];
        setSelectedAddressId(defaultAddr.id);
      }
    } catch {
      toast.error("Could not load checkout data.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const subtotal = cartItems.reduce(
    (sum, it) => sum + it.product.sellingPrice * it.quantity,
    0
  );
  const discount = 0;
  const amountAfterDiscount = Math.max(0, subtotal - discount);
  const shipping =
    amountAfterDiscount >= SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_COST;
  const tax = cartItems.reduce(
    (sum, it) => sum + it.product.sellingPrice * it.quantity * ((it.product.gstPercent ?? 0) / 100),
    0
  );
  const total = amountAfterDiscount + shipping + tax;

  const openRazorpayCheckout = async (
    orderId: string,
    paymentMethod: "card" | "upi" | "cod",
    upiIdValue: string
  ) => {
    const rzRes = await fetch("/api/payments/razorpay-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ orderId }),
    });
    const rzData = await rzRes.json().catch(() => ({}));
    if (!rzRes.ok) {
      toast.error(rzData?.error?.message ?? "Could not start payment. Please try again.");
      setPlacing(false);
      return;
    }
    if (rzData?.data?.configured === false) {
      toast.success("Order placed! Card/UPI payment is not set up yet; your order is confirmed.");
      router.push(`/order-confirmation?orderId=${orderId}`);
      setPlacing(false);
      return;
    }
    if (!rzData?.data?.razorpayOrderId || !rzData?.data?.keyId) {
      toast.error("Could not start payment. Please try again.");
      setPlacing(false);
      return;
    }
    const { razorpayOrderId, keyId } = rzData.data;

    const loadScript = (src: string): Promise<void> =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const s = document.createElement("script");
        s.src = src;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Failed to load Razorpay"));
        document.body.appendChild(s);
      });

    try {
      await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    } catch {
      toast.error("Payment could not be loaded. Please try again.");
      setPlacing(false);
      return;
    }

    const Razorpay = (window as unknown as {
      Razorpay: {
        new (options: Record<string, unknown>): {
          open: () => void;
          on?: (event: string, cb: (res: { error?: { description?: string } }) => void) => void;
        };
      };
    }).Razorpay;
    if (!Razorpay) {
      toast.error("Payment gateway not available.");
      setPlacing(false);
      return;
    }

    const prefill: Record<string, string> = {};
    const customerEmail = (rzData.data.customerEmail ?? "").trim() || "customer@example.com";
    let customerPhone = (rzData.data.customerPhone ?? "").trim().replace(/\D/g, "").slice(-10) || "9999999999";
    if (customerPhone.length === 10) {
      customerPhone = "+91" + customerPhone;
    }
    prefill.email = customerEmail;
    prefill.contact = customerPhone;
    if (paymentMethod === "upi") {
      prefill.method = "upi";
      if (upiIdValue.trim()) prefill.vpa = upiIdValue.trim();
    }
    const rz = new Razorpay({
      key: keyId,
      amount: rzData.data.amount,
      currency: rzData.data.currency || "INR",
      order_id: razorpayOrderId,
      name: "Indovyapar",
      description: "Order payment",
      ...(Object.keys(prefill).length > 0 && { prefill }),
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        try {
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              orderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json().catch(() => ({}));
          if (!verifyRes.ok) {
            toast.error(verifyData?.error?.message ?? "Payment verification failed.");
            setPlacing(false);
            return;
          }
          toast.success("Payment successful! Order confirmed.");
          router.push(`/order-confirmation?orderId=${orderId}`);
        } catch {
          toast.error("Payment verification failed.");
        } finally {
          setPlacing(false);
        }
      },
      modal: { ondismiss: () => setPlacing(false) },
    });
    if (typeof rz.on === "function") {
      rz.on("payment.failed", (response: { error?: { description?: string } }) => {
        setPlacing(false);
        const msg = response?.error?.description ?? "Payment failed or was cancelled.";
        toast.error(msg);
      });
    }
    rz.open();
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address.");
      return;
    }
    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      router.push("/cart");
      return;
    }
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          shippingAddressId: selectedAddressId,
          paymentMethod: selectedPayment,
          couponCode: couponCode.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error?.message ?? "Could not place order.");
        setPlacing(false);
        return;
      }
      const orderId = data?.data?.orderId;
      const requiresRazorpay = data?.data?.requiresRazorpay === true;

      if (requiresRazorpay && (selectedPayment === "card" || selectedPayment === "upi")) {
        await openRazorpayCheckout(orderId, selectedPayment, upiId);
        return;
      }

      toast.success("Order placed successfully!");
      router.push(orderId ? `/order-confirmation?orderId=${orderId}` : "/order-confirmation");
    } catch {
      toast.error("Could not place order.");
    } finally {
      setPlacing(false);
    }
  };

  const parseVariantKey = (variantKey: string | null) => {
    if (!variantKey) return "";
    return variantKey
      .split("|")
      .map((p) => p.replace(":", ": "))
      .join(" • ");
  };

  const openEditAddress = (addr: AddressApi) => {
    setEditingAddressId(addr.id);
    setNewAddressForm({
      fullName: addr.fullName,
      phone: addr.phone,
      line1: addr.line1 ?? "",
      line2: addr.line2 ?? "",
      city: addr.city ?? "",
      state: addr.state ?? "",
      pincode: addr.pincode ?? "",
      type: (addr.type === "OFFICE" ? "OFFICE" : addr.type === "OTHER" ? "OTHER" : "HOME") as "HOME" | "OFFICE" | "OTHER",
      isDefault: addr.isDefault,
    });
    setShowAddAddressModal(true);
  };

  const handleAddAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { fullName, phone, line1, city, state, pincode } = newAddressForm;
    if (!fullName.trim() || !phone.trim() || !line1.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      toast.error("Please fill all required fields.");
      return;
    }
    setAddAddressSubmitting(true);
    try {
      const isEdit = !!editingAddressId;
      const url = isEdit ? `/api/addresses/${editingAddressId}` : "/api/addresses";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newAddressForm),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error?.message ?? (isEdit ? "Could not update address." : "Could not save address."));
        setAddAddressSubmitting(false);
        return;
      }
      const saved = data?.data?.address as AddressApi;
      if (saved) {
        if (isEdit) {
          setAddresses((prev) => prev.map((a) => (a.id === saved.id ? saved : a)));
        } else {
          setAddresses((prev) => [...prev, saved]);
          setSelectedAddressId(saved.id);
        }
      }
      toast.success(isEdit ? "Address updated." : "Address added successfully.");
      setShowAddAddressModal(false);
      setEditingAddressId(null);
      setNewAddressForm({
        fullName: "",
        phone: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        pincode: "",
        type: "HOME",
        isDefault: true,
      });
    } catch {
      toast.error("Could not save address.");
    } finally {
      setAddAddressSubmitting(false);
    }
  };

  const handleDeleteAddress = async (addr: AddressApi) => {
    if (!confirm("Remove this address? This cannot be undone.")) return;
    setDeletingAddressId(addr.id);
    try {
      const res = await fetch(`/api/addresses/${addr.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data?.error?.message ?? "Could not remove address.");
        return;
      }
      setAddresses((prev) => prev.filter((a) => a.id !== addr.id));
      if (selectedAddressId === addr.id) {
        const remaining = addresses.filter((a) => a.id !== addr.id);
        setSelectedAddressId(remaining.length > 0 ? remaining[0].id : null);
      }
      toast.success("Address removed.");
    } catch {
      toast.error("Could not remove address.");
    } finally {
      setDeletingAddressId(null);
    }
  };

  if (loading) {
    return (
      <div
        className="w-full min-h-screen bg-[#F9FAFB]"
        style={{ fontFamily: "'Manrope', sans-serif" }}
      >
        <TopBar />
        <Navbar />
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 py-12 flex items-center justify-center min-h-[400px]">
          <p className="text-[#6B7280] font-medium">Loading checkout…</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full min-h-screen bg-[#F9FAFB]"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      <TopBar />
      <Navbar />

      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 py-8">
        {/* Progress steps */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-10">
          <Link
            href="/cart"
            className="flex items-center gap-2 text-[#16A34A] font-semibold"
          >
            <div className="w-9 h-9 rounded-full bg-[#16A34A] text-white flex items-center justify-center">
              <Check className="w-5 h-5" />
            </div>
            <span>Cart</span>
          </Link>
          <div className="w-12 sm:w-20 h-0.5 bg-[#FF6A00]" />
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#FF6A00] text-white flex items-center justify-center font-bold text-[15px]">
              2
            </div>
            <span className="font-semibold text-[#111827]">Checkout</span>
          </div>
          <div className="w-12 sm:w-20 h-0.5 bg-[#E5E7EB]" />
          <div className="flex items-center gap-2 text-[#9CA3AF]">
            <div className="w-9 h-9 rounded-full bg-[#E5E7EB] text-[#6B7280] flex items-center justify-center font-bold text-[15px]">
              3
            </div>
            <span>Confirmation</span>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-10 text-center">
            <p className="text-[#374151] font-semibold mb-4">Your cart is empty</p>
            <Link
              href="/cart"
              className="inline-block px-6 py-3 bg-[#FF6A00] text-white font-semibold rounded-xl hover:bg-[#E55F00] transition"
            >
              Go to Cart
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Address + Payment */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address */}
              <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-[#111827]">
                    Delivery Address
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAddressId(null);
                      setNewAddressForm({
                        fullName: "",
                        phone: "",
                        line1: "",
                        line2: "",
                        city: "",
                        state: "",
                        pincode: "",
                        type: "HOME",
                        isDefault: true,
                      });
                      setShowAddAddressModal(true);
                    }}
                    className="flex items-center gap-2 text-[#FF6A00] font-semibold hover:text-[#E55F00] transition text-[15px]"
                  >
                    <Plus className="w-5 h-5" />
                    Add New
                  </button>
                </div>
                {addresses.length === 0 ? (
                  <p className="text-[#6B7280] mb-4">
                    No saved addresses. Add one to continue.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedAddressId(addr.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedAddressId(addr.id);
                          }
                        }}
                        className={`w-full text-left p-5 rounded-xl border-2 transition-all cursor-pointer ${
                          selectedAddressId === addr.id
                            ? "border-[#FF6A00] bg-[#FFF4EC]"
                            : "border-[#E5E7EB] hover:border-[#D1D5DC] bg-white"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-[#111827]">
                                {addr.name}
                              </span>
                              {addr.isDefault && (
                                <span className="px-2 py-0.5 bg-[#FF6A00] text-white text-xs rounded-md font-semibold">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-[#6B7280] text-[14px] mb-1">
                              {addr.address}
                            </p>
                            <p className="text-[#6B7280] text-[14px]">
                              {addr.phone}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditAddress(addr);
                              }}
                              className="p-2 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#FF6A00] transition"
                              title="Edit address"
                              aria-label="Edit address"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAddress(addr);
                              }}
                              disabled={deletingAddressId === addr.id}
                              className="p-2 rounded-lg text-[#6B7280] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition disabled:opacity-50"
                              title="Remove address"
                              aria-label="Remove address"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            {selectedAddressId === addr.id && (
                              <div className="w-6 h-6 rounded-full bg-[#FF6A00] text-white flex items-center justify-center ml-1">
                                <Check className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-[#111827] mb-5">
                  Payment Method
                </h2>
                <div className="space-y-3 mb-5">
                  {[
                    {
                      id: "card" as const,
                      icon: CreditCard,
                      title: "Credit / Debit Card",
                      desc: "Visa, Mastercard, Amex",
                    },
                    {
                      id: "upi" as const,
                      icon: Smartphone,
                      title: "UPI / Wallet",
                      desc: "Google Pay, PhonePe, Paytm",
                    },
                    {
                      id: "cod" as const,
                      icon: Wallet,
                      title: "Cash on Delivery",
                      desc: "Pay when you receive",
                    },
                  ].map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedPayment(method.id)}
                      className={`w-full p-5 rounded-xl border-2 transition-all flex items-center gap-4 ${
                        selectedPayment === method.id
                          ? "border-[#FF6A00] bg-[#FFF4EC]"
                          : "border-[#E5E7EB] hover:border-[#D1D5DC] bg-white"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-center shrink-0">
                        <method.icon className="w-6 h-6 text-[#FF6A00]" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-bold text-[#111827]">
                          {method.title}
                        </p>
                        <p className="text-sm text-[#6B7280]">{method.desc}</p>
                      </div>
                      {selectedPayment === method.id && (
                        <div className="w-6 h-6 rounded-full bg-[#FF6A00] text-white flex items-center justify-center shrink-0">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {selectedPayment === "card" && (
                  <div className="p-5 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] space-y-4">
                    <input
                      type="text"
                      placeholder="Card Number"
                      className="w-full px-4 py-2.5 border border-[#D1D5DC] rounded-lg focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] outline-none text-[15px]"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="MM / YY"
                        className="px-4 py-2.5 border border-[#D1D5DC] rounded-lg focus:border-[#FF6A00] outline-none text-[15px]"
                      />
                      <input
                        type="text"
                        placeholder="CVV"
                        className="px-4 py-2.5 border border-[#D1D5DC] rounded-lg focus:border-[#FF6A00] outline-none text-[15px]"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Cardholder Name"
                      className="w-full px-4 py-2.5 border border-[#D1D5DC] rounded-lg focus:border-[#FF6A00] outline-none text-[15px]"
                    />
                    <p className="text-xs text-[#6B7280]">
                      Secured by Razorpay. You will complete payment after clicking Place Order.
                    </p>
                  </div>
                )}

                {selectedPayment === "upi" && (
                  <div className="p-5 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="UPI ID (e.g. name@paytm)"
                      className="w-full px-4 py-2.5 border border-[#D1D5DC] rounded-lg focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] outline-none text-[15px]"
                    />
                    <p className="text-xs text-[#6B7280] mt-2">
                      Secured by Razorpay. You will complete payment after clicking Place Order.
                    </p>
                    <p className="text-xs text-[#6B7280] mt-1.5">
                      For testing: use <strong>success@razorpay</strong> for a successful payment; <strong>failure@razorpay</strong> will show a failed payment. Requires Razorpay test keys in .env.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:sticky lg:top-24 self-start">
              <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-[#111827] mb-5">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-5 pb-5 border-b border-[#E5E7EB] max-h-[280px] overflow-y-auto">
                  {cartItems.map((it) => (
                    <div key={it.id} className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#F3F4F6] border border-[#E5E7EB] shrink-0">
                        <img
                          src={it.product.imageUrl || PLACEHOLDER_IMAGE}
                          alt={it.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#111827] text-sm line-clamp-2">
                          {it.product.name}
                        </p>
                        <p className="text-xs text-[#6B7280] mt-0.5">
                          {parseVariantKey(it.variantKey)}
                          {it.variantKey && " • "}Qty: {it.quantity}
                        </p>
                        <p className="text-sm font-bold text-[#111827] mt-1">
                          ₹
                          {(it.product.sellingPrice * it.quantity).toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 mb-5 pb-5 border-b border-[#E5E7EB]">
                  <div className="flex justify-between text-[15px]">
                    <span className="text-[#6B7280]">Subtotal</span>
                    <span className="font-semibold text-[#111827]">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between text-[15px]">
                    <span className="text-[#6B7280]">Shipping</span>
                    {shipping === 0 ? (
                      <span className="font-semibold text-[#16A34A]">FREE</span>
                    ) : (
                      <span className="font-semibold text-[#111827]">
                        ₹{shipping.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between text-[15px]">
                    <span className="text-[#6B7280]">Tax</span>
                    <span className="font-semibold text-[#111827]">
                      ₹{tax.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline mb-6 p-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
                  <span className="text-lg font-bold text-[#111827]">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-[#FF6A00]">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={
                    placing ||
                    addresses.length === 0 ||
                    !selectedAddressId
                  }
                  className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 bg-[#FF6A00] hover:bg-[#E55F00] transition shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Lock className="w-5 h-5" />
                  {placing ? "Placing Order…" : "Place Order"}
                </button>

                <p className="text-xs text-center text-[#6B7280] mt-4">
                  By placing this order, you agree to our{" "}
                  <Link href="/terms" className="text-[#FF6A00] hover:underline">
                    Terms & Conditions
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Address Modal */}
      {showAddAddressModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => {
            if (!addAddressSubmitting) {
              setShowAddAddressModal(false);
              setEditingAddressId(null);
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-address-title"
        >
          <div
            className="bg-white rounded-xl shadow-xl border border-[#E5E7EB] w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between">
              <h2 id="add-address-title" className="text-xl font-bold text-[#111827]">
                {editingAddressId ? "Edit Address" : "Add New Address"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  if (!addAddressSubmitting) {
                    setShowAddAddressModal(false);
                    setEditingAddressId(null);
                  }
                }}
                className="p-2 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] transition"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddAddressSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                  Full Name <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  value={newAddressForm.fullName}
                  onChange={(e) =>
                    setNewAddressForm((f) => ({ ...f, fullName: e.target.value }))
                  }
                  placeholder="Enter full name"
                  className="w-full px-4 py-2.5 border border-[#D1D5DC] rounded-lg focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] outline-none text-[15px]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                  Mobile Number <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="tel"
                  value={newAddressForm.phone}
                  onChange={(e) =>
                    setNewAddressForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="Enter mobile number"
                  className="w-full px-4 py-2.5 border border-[#D1D5DC] rounded-lg focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] outline-none text-[15px]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                  Address Line 1 <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  value={newAddressForm.line1}
                  onChange={(e) =>
                    setNewAddressForm((f) => ({ ...f, line1: e.target.value }))
                  }
                  placeholder="Street address, building name"
                  className="w-full px-4 py-2.5 border border-[#D1D5DC] rounded-lg focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] outline-none text-[15px]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                  Address Line 2 <span className="text-[#6B7280]">(optional)</span>
                </label>
                <input
                  type="text"
                  value={newAddressForm.line2}
                  onChange={(e) =>
                    setNewAddressForm((f) => ({ ...f, line2: e.target.value }))
                  }
                  placeholder="Apartment, suite, unit, etc."
                  className="w-full px-4 py-2.5 border border-[#D1D5DC] rounded-lg focus:border-[#FF6A00] outline-none text-[15px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                    City <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="text"
                    value={newAddressForm.city}
                    onChange={(e) =>
                      setNewAddressForm((f) => ({ ...f, city: e.target.value }))
                    }
                    placeholder="Enter city"
                    className="w-full px-4 py-2.5 border border-[#D1D5DC] rounded-lg focus:border-[#FF6A00] outline-none text-[15px]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                    State <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="text"
                    value={newAddressForm.state}
                    onChange={(e) =>
                      setNewAddressForm((f) => ({ ...f, state: e.target.value }))
                    }
                    placeholder="Enter state"
                    className="w-full px-4 py-2.5 border border-[#D1D5DC] rounded-lg focus:border-[#FF6A00] outline-none text-[15px]"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                  Pincode <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  value={newAddressForm.pincode}
                  onChange={(e) =>
                    setNewAddressForm((f) => ({ ...f, pincode: e.target.value }))
                  }
                  placeholder="Enter pincode"
                  className="w-full px-4 py-2.5 border border-[#D1D5DC] rounded-lg focus:border-[#FF6A00] outline-none text-[15px]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                  Address Type
                </label>
                <select
                  value={newAddressForm.type}
                  onChange={(e) =>
                    setNewAddressForm((f) => ({
                      ...f,
                      type: e.target.value as "HOME" | "OFFICE" | "OTHER",
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-[#D1D5DC] rounded-lg focus:border-[#FF6A00] outline-none text-[15px]"
                >
                  <option value="HOME">Home</option>
                  <option value="OFFICE">Office</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={newAddressForm.isDefault}
                  onChange={(e) =>
                    setNewAddressForm((f) => ({ ...f, isDefault: e.target.checked }))
                  }
                  className="w-4 h-4 rounded border-[#D1D5DC] text-[#FF6A00] focus:ring-[#FF6A00]"
                />
                <label htmlFor="isDefault" className="text-sm font-medium text-[#374151]">
                  Set as default address
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={addAddressSubmitting}
                  className="flex-1 py-3 rounded-xl font-semibold text-white bg-[#FF6A00] hover:bg-[#E55F00] transition disabled:opacity-60"
                >
                  {addAddressSubmitting
                    ? "Saving…"
                    : editingAddressId
                      ? "Update Address"
                      : "Save Address"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!addAddressSubmitting) {
                      setShowAddAddressModal(false);
                      setEditingAddressId(null);
                    }
                  }}
                  className="flex-1 py-3 rounded-xl font-semibold text-[#374151] border border-[#E5E7EB] hover:bg-[#F9FAFB] transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
