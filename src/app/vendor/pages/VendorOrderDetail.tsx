"use client";

import {
  ArrowLeft,
  Package,
  CheckCircle,
  XCircle,
  Truck,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import { Button, Card, Alert, Modal, Input, Textarea, Select } from "../components/UIComponents";
import * as React from "react";

export type VendorOrderDetailOrder = {
  id: string;
  date: string;
  status: string;
  /** From latest CANCELLED status event (e.g. customer cancellation reason). */
  cancellationNote?: string | null;
  customer: { name: string; phone: string; email: string };
  address: { line1: string; line2: string; city: string; state: string; pincode: string };
  items: Array<{ name: string; sku: string; qty: number; price: number; image: string }>;
  payment: { mode: string; status: string; transactionId: string };
  earnings: { itemTotal: number; commissionPercent: number; commissionAmount: number; netPayable: number };
  timeline: Array<{ label: string; date: string; completed: boolean }>;
};

export type VendorOrderDetailProps = {
  orderId?: string;
  order?: VendorOrderDetailOrder;
  onBack?: () => void;
};

export function VendorOrderDetail({ orderId = "", order: orderProp, onBack }: VendorOrderDetailProps) {
  const [order, setOrder] = React.useState<VendorOrderDetailOrder | null>(
    orderProp ?? null
  );
  const [loading, setLoading] = React.useState(!orderProp && Boolean(orderId?.trim()));
  const [loadError, setLoadError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (orderProp) {
      setOrder(orderProp);
      setLoading(false);
      setLoadError(null);
      return;
    }
    const id = orderId?.trim();
    if (!id) {
      setOrder(null);
      setLoading(false);
      setLoadError("Missing order ID.");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    fetch(`/api/vendor/orders/${encodeURIComponent(id)}`, { credentials: "include", cache: "no-store" })
      .then(async (res) => {
        const json = (await res.json().catch(() => ({}))) as {
          success?: boolean;
          data?: VendorOrderDetailOrder;
          error?: { message?: string };
        };
        if (cancelled) return;
        if (!res.ok || !json?.success) {
          setOrder(null);
          setLoadError(json?.error?.message ?? `Could not load order (${res.status}).`);
          return;
        }
        if (!json.data) {
          setLoadError("Invalid response from server.");
          return;
        }
        setOrder(json.data);
      })
      .catch(() => {
        if (!cancelled) {
          setOrder(null);
          setLoadError("Failed to load order. Check your connection and try again.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [orderId, orderProp]);

  const [showRejectModal, setShowRejectModal] = React.useState(false);
  const [showShipModal, setShowShipModal] = React.useState(false);
  const [showCancelModal, setShowCancelModal] = React.useState(false);
  const [showDisputeModal, setShowDisputeModal] = React.useState(false);

  const [rejectReason, setRejectReason] = React.useState("");
  const [courierName, setCourierName] = React.useState("");
  const [trackingLink, setTrackingLink] = React.useState("");
  const [cancelReason, setCancelReason] = React.useState("");
  const [disputeType, setDisputeType] = React.useState("");
  const [disputeDetails, setDisputeDetails] = React.useState("");
  const [actionBusy, setActionBusy] = React.useState(false);
  const [banner, setBanner] = React.useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const patchOrder = React.useCallback(
    async (body: Record<string, unknown>) => {
      const id = orderId?.trim();
      if (!id || orderProp) return false;
      setActionBusy(true);
      setBanner(null);
      try {
        const res = await fetch(`/api/vendor/orders/${encodeURIComponent(id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });
        const json = (await res.json().catch(() => ({}))) as {
          success?: boolean;
          data?: VendorOrderDetailOrder;
          error?: { message?: string };
        };
        if (!res.ok || !json?.success) {
          setBanner({
            type: "error",
            message: json?.error?.message ?? `Request failed (${res.status}).`,
          });
          return false;
        }
        if (json.data) {
          setOrder(json.data);
        }
        return true;
      } catch {
        setBanner({ type: "error", message: "Network error. Try again." });
        return false;
      } finally {
        setActionBusy(false);
      }
    },
    [orderId, orderProp]
  );

  const handleAcceptOrder = async () => {
    const ok = await patchOrder({ action: "accept" });
    if (ok) {
      setBanner({ type: "success", message: "Order accepted. You can ship when ready." });
    }
  };

  const handleRejectOrder = async () => {
    if (!rejectReason.trim()) {
      setBanner({ type: "error", message: "Please provide a reason for rejection." });
      return;
    }
    const ok = await patchOrder({ action: "reject", reason: rejectReason.trim() });
    if (ok) {
      setShowRejectModal(false);
      setRejectReason("");
      setBanner({ type: "success", message: "Order rejected." });
    }
  };

  const handleShipOrder = async () => {
    if (!courierName.trim()) {
      setBanner({ type: "error", message: "Please enter the courier name." });
      return;
    }
    const ok = await patchOrder({
      action: "ship",
      courierName: courierName.trim(),
      trackingLink: trackingLink.trim() || undefined,
    });
    if (ok) {
      setShowShipModal(false);
      setCourierName("");
      setTrackingLink("");
      setBanner({ type: "success", message: "Marked as shipped." });
    }
  };

  const handleDeliverOrder = async () => {
    if (!window.confirm("Mark this order as delivered?")) return;
    const ok = await patchOrder({ action: "deliver" });
    if (ok) {
      setBanner({ type: "success", message: "Marked as delivered." });
    }
  };

  const handleCancelOrder = () => {
    if (!cancelReason.trim()) {
      alert("Please provide a reason for cancellation");
      return;
    }
    alert(`Order cancelled: ${cancelReason}`);
    setShowCancelModal(false);
    onBack?.();
  };

  const handleReportIssue = () => {
    if (!disputeType || !disputeDetails.trim()) {
      alert("Please select issue type and provide details");
      return;
    }
    alert(`Issue reported: ${disputeType}`);
    setShowDisputeModal(false);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: "bg-blue-500",
      accepted: "bg-green-500",
      shipped: "bg-purple-500",
      delivered: "bg-teal-500",
      cancelled: "bg-red-500",
      rejected: "bg-orange-500",
    };
    return colors[status] || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#3B82F6] border-t-transparent" />
        <p className="text-[#64748B] text-sm">Loading order…</p>
      </div>
    );
  }

  if (loadError || !order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onBack?.()}
            className="p-2 hover:bg-[#F8FAFC] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-[#64748B]" />
          </button>
          <h1 className="text-2xl font-bold text-[#1E293B]">Order</h1>
        </div>
        <Alert type="error" message={loadError ?? "Order not found."} />
        <Button variant="secondary" onClick={() => onBack?.()}>
          Back to orders
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {banner ? (
        <Alert
          type={banner.type === "success" ? "success" : "error"}
          message={banner.message}
          dismissible
          onDismiss={() => setBanner(null)}
        />
      ) : null}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onBack?.()}
            className="p-2 hover:bg-[#F8FAFC] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-[#64748B]" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[#1E293B] mb-2">Order {order.id}</h1>
            <p className="text-[#64748B]">{order.date}</p>
          </div>
        </div>
        <div>
          <span
            className={`${getStatusColor(order.status)} text-white text-sm font-bold px-4 py-2 rounded-lg`}
          >
            {order.status.toUpperCase()}
          </span>
        </div>
      </div>

      {order.status === "cancelled" && (
        <Alert
          type="warning"
          title="This order was cancelled"
          message={
            order.cancellationNote?.trim() ||
            "No cancellation message was recorded for this order."
          }
        />
      )}

      {/* Action Buttons */}
      {order.status === "new" && (
        <Card>
          <div className="flex items-center gap-4">
            <Button variant="primary" disabled={actionBusy} onClick={() => void handleAcceptOrder()}>
              <CheckCircle className="w-5 h-5" />
              Accept Order
            </Button>
            <Button
              variant="danger"
              disabled={actionBusy}
              onClick={() => setShowRejectModal(true)}
            >
              <XCircle className="w-5 h-5" />
              Reject Order
            </Button>
          </div>
        </Card>
      )}

      {order.status === "accepted" && (
        <Card>
          <div className="flex items-center gap-4">
            <Button variant="primary" disabled={actionBusy} onClick={() => setShowShipModal(true)}>
              <Truck className="w-5 h-5" />
              Mark as Shipped
            </Button>
            <Button variant="secondary" disabled={actionBusy} onClick={() => setShowCancelModal(true)}>
              <XCircle className="w-5 h-5" />
              Cancel Order
            </Button>
          </div>
        </Card>
      )}

      {order.status === "shipped" && (
        <Card>
          <div className="flex items-center gap-4">
            <Button variant="primary" disabled={actionBusy} onClick={() => void handleDeliverOrder()}>
              <CheckCircle className="w-5 h-5" />
              Mark as Delivered
            </Button>
            <Button variant="secondary" disabled={actionBusy} onClick={() => setShowDisputeModal(true)}>
              <AlertTriangle className="w-5 h-5" />
              Report an Issue
            </Button>
          </div>
        </Card>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card title="Order Items">
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={`${item.sku}-${index}`}
                  className="flex items-center gap-4 p-4 bg-[#F8FAFC] rounded-xl"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg border-2 border-[#E2E8F0]"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-[#1E293B] mb-1">{item.name}</h4>
                    <p className="text-sm text-[#64748B] mb-2">SKU: {item.sku}</p>
                    <p className="text-sm text-[#64748B]">Quantity: {item.qty}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#1E293B]">₹{item.price}</p>
                    <p className="text-sm text-[#64748B]">per unit</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Customer Details */}
          <Card title="Customer Details">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-[#1E293B]">{order.customer.name}</p>
                  <p className="text-sm text-[#64748B]">Customer</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#64748B]" />
                <p className="text-[#1E293B]">{order.customer.phone}</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#64748B]" />
                <p className="text-[#1E293B]">{order.customer.email}</p>
              </div>
            </div>
          </Card>

          {/* Delivery Address */}
          <Card title="Delivery Address">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#64748B] mt-1" />
              <div>
                <p className="text-[#1E293B] mb-1">{order.address.line1}</p>
                {order.address.line2 ? (
                  <p className="text-[#1E293B] mb-1">{order.address.line2}</p>
                ) : null}
                <p className="text-[#1E293B]">
                  {order.address.city}, {order.address.state} - {order.address.pincode}
                </p>
              </div>
            </div>
          </Card>

          {/* Status Timeline */}
          <Card title="Order Status Timeline">
            <div className="space-y-4">
              {order.timeline.map((step, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed
                          ? "bg-green-500 text-white"
                          : "bg-[#E2E8F0] text-[#64748B]"
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span className="text-xs font-bold">{index + 1}</span>
                      )}
                    </div>
                    {index < order.timeline.length - 1 && (
                      <div
                        className={`w-0.5 h-12 ${
                          step.completed ? "bg-green-500" : "bg-[#E2E8F0]"
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <p
                      className={`font-semibold ${
                        step.completed ? "text-[#1E293B]" : "text-[#94A3B8]"
                      }`}
                    >
                      {step.label}
                    </p>
                    {step.date && (
                      <p className="text-sm text-[#64748B] mt-1">{step.date}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          {/* Payment Details */}
          <Card title="Payment Details">
            <div className="space-y-3">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-5 h-5 text-[#64748B]" />
                <div>
                  <p className="font-semibold text-[#1E293B]">{order.payment.mode}</p>
                  <p className="text-sm text-[#64748B]">{order.payment.status}</p>
                </div>
              </div>
              {order.payment.transactionId ? (
                <div className="p-3 bg-[#F8FAFC] rounded-lg">
                  <p className="text-xs text-[#64748B] mb-1">Transaction ID</p>
                  <p className="text-sm font-mono text-[#1E293B] break-all">{order.payment.transactionId}</p>
                </div>
              ) : null}
            </div>
          </Card>

          {/* Vendor Earnings */}
          <Card title="Your Earnings">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Item Total</span>
                <span className="font-semibold text-[#1E293B]">₹{order.earnings.itemTotal}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Commission ({order.earnings.commissionPercent}%)</span>
                <span className="font-semibold">- ₹{order.earnings.commissionAmount}</span>
              </div>
              <div className="border-t-2 border-[#E2E8F0] pt-3">
                <div className="flex justify-between">
                  <span className="font-bold text-[#1E293B]">Net Payable</span>
                  <span className="font-bold text-[#3B82F6] text-xl">
                    ₹{order.earnings.netPayable}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card title="Need Help?">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setShowDisputeModal(true)}
            >
              <AlertTriangle className="w-5 h-5" />
              Report an Issue
            </Button>
          </Card>
        </div>
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Order"
        size="md"
      >
        <div className="space-y-4">
          <Alert
            type="warning"
            message="Rejecting orders frequently may affect your vendor rating. Please provide a valid reason."
          />
          <Textarea
            label="Reason for Rejection"
            placeholder="Explain why you're rejecting this order..."
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            required
          />
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setShowRejectModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" disabled={actionBusy} onClick={() => void handleRejectOrder()}>
              Reject Order
            </Button>
          </div>
        </div>
      </Modal>

      {/* Ship Modal */}
      <Modal
        isOpen={showShipModal}
        onClose={() => setShowShipModal(false)}
        title="Mark as Shipped"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Courier Name"
            placeholder="e.g., Blue Dart, DTDC, Delhivery"
            value={courierName}
            onChange={(e) => setCourierName(e.target.value)}
            required
          />
          <Input
            label="Tracking Link (Optional)"
            placeholder="https://..."
            value={trackingLink}
            onChange={(e) => setTrackingLink(e.target.value)}
          />
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setShowShipModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" disabled={actionBusy} onClick={() => void handleShipOrder()}>
              Confirm Shipment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Order"
        size="md"
      >
        <div className="space-y-4">
          <Alert
            type="warning"
            message="This order has been accepted. Cancelling now may require admin approval."
          />
          <Textarea
            label="Reason for Cancellation"
            placeholder="Explain why you're cancelling this order..."
            rows={4}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            required
          />
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setShowCancelModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleCancelOrder}>
              Cancel Order
            </Button>
          </div>
        </div>
      </Modal>

      {/* Dispute Modal */}
      <Modal
        isOpen={showDisputeModal}
        onClose={() => setShowDisputeModal(false)}
        title="Report an Issue"
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="Issue Type"
            value={disputeType}
            onChange={(e) => setDisputeType(e.target.value)}
            options={[
              { value: "", label: "Select Issue" },
              { value: "wrong-address", label: "Wrong Address" },
              { value: "customer-unreachable", label: "Customer Unreachable" },
              { value: "product-damaged", label: "Product Damaged" },
              { value: "other", label: "Other" },
            ]}
            required
          />
          <Textarea
            label="Issue Details"
            placeholder="Provide more details about the issue..."
            rows={4}
            value={disputeDetails}
            onChange={(e) => setDisputeDetails(e.target.value)}
            required
          />
          <Alert
            type="info"
            message="Admin will review this issue and take necessary action. You'll be notified via email."
          />
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setShowDisputeModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleReportIssue}>
              Submit Issue
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
