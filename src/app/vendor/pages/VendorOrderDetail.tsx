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
  customer: { name: string; phone: string; email: string };
  address: { line1: string; line2: string; city: string; state: string; pincode: string };
  items: Array<{ name: string; sku: string; qty: number; price: number; image: string }>;
  payment: { mode: string; status: string; transactionId: string };
  earnings: { itemTotal: number; commissionPercent: number; commissionAmount: number; netPayable: number };
};

const defaultOrder: VendorOrderDetailOrder = {
  id: "#ORD-1234",
  date: "2026-02-25 10:30 AM",
  status: "new",
  customer: { name: "Rajesh Kumar", phone: "+91 98765*****", email: "rajesh.k@example.com" },
  address: { line1: "123, MG Road, Koramangala", line2: "Near Starbucks", city: "Bangalore", state: "Karnataka", pincode: "560034" },
  items: [
    { name: "Wireless Bluetooth Headphones", sku: "WBH-001", qty: 1, price: 2499, image: "https://via.placeholder.com/100" },
    { name: "USB-C Cable", sku: "USBC-002", qty: 2, price: 299, image: "https://via.placeholder.com/100" },
  ],
  payment: { mode: "Prepaid", status: "Paid", transactionId: "TXN123456789" },
  earnings: { itemTotal: 3097, commissionPercent: 10, commissionAmount: 310, netPayable: 2787 },
};

export type VendorOrderDetailProps = {
  orderId?: string;
  order?: VendorOrderDetailOrder;
  onBack?: () => void;
};

export function VendorOrderDetail({ orderId = "", order: orderProp, onBack }: VendorOrderDetailProps) {
  const order = orderProp ?? { ...defaultOrder, id: orderId || defaultOrder.id };

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

  const handleAcceptOrder = () => {
    alert("Order accepted successfully!");
    onBack?.();
  };

  const handleRejectOrder = () => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }
    alert(`Order rejected: ${rejectReason}`);
    setShowRejectModal(false);
    onBack?.();
  };

  const handleShipOrder = () => {
    if (!courierName.trim()) {
      alert("Please provide courier name");
      return;
    }
    alert(`Order marked as shipped via ${courierName}`);
    setShowShipModal(false);
    onBack?.();
  };

  const handleDeliverOrder = () => {
    if (window.confirm("Mark this order as delivered?")) {
      alert("Order marked as delivered!");
      onBack?.();
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

  const statusTimeline = [
    { label: "Order Placed", date: "2026-02-25 10:30 AM", completed: true },
    { label: "Accepted by Vendor", date: "", completed: false },
    { label: "Shipped", date: "", completed: false },
    { label: "Out for Delivery", date: "", completed: false },
    { label: "Delivered", date: "", completed: false },
  ];

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
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

      {/* Action Buttons */}
      {order.status === "new" && (
        <Card>
          <div className="flex items-center gap-4">
            <Button variant="primary" onClick={handleAcceptOrder}>
              <CheckCircle className="w-5 h-5" />
              Accept Order
            </Button>
            <Button variant="danger" onClick={() => setShowRejectModal(true)}>
              <XCircle className="w-5 h-5" />
              Reject Order
            </Button>
          </div>
        </Card>
      )}

      {order.status === "accepted" && (
        <Card>
          <div className="flex items-center gap-4">
            <Button variant="primary" onClick={() => setShowShipModal(true)}>
              <Truck className="w-5 h-5" />
              Mark as Shipped
            </Button>
            <Button variant="secondary" onClick={() => setShowCancelModal(true)}>
              <XCircle className="w-5 h-5" />
              Cancel Order
            </Button>
          </div>
        </Card>
      )}

      {order.status === "shipped" && (
        <Card>
          <div className="flex items-center gap-4">
            <Button variant="primary" onClick={handleDeliverOrder}>
              <CheckCircle className="w-5 h-5" />
              Mark as Delivered
            </Button>
            <Button variant="secondary" onClick={() => setShowDisputeModal(true)}>
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
                  key={index}
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
                <p className="text-[#1E293B] mb-1">{order.address.line2}</p>
                <p className="text-[#1E293B]">
                  {order.address.city}, {order.address.state} - {order.address.pincode}
                </p>
              </div>
            </div>
          </Card>

          {/* Status Timeline */}
          <Card title="Order Status Timeline">
            <div className="space-y-4">
              {statusTimeline.map((step, index) => (
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
                    {index < statusTimeline.length - 1 && (
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
              {order.payment.transactionId && (
                <div className="p-3 bg-[#F8FAFC] rounded-lg">
                  <p className="text-xs text-[#64748B] mb-1">Transaction ID</p>
                  <p className="text-sm font-mono text-[#1E293B]">{order.payment.transactionId}</p>
                </div>
              )}
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
            <Button variant="danger" onClick={handleRejectOrder}>
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
            <Button variant="primary" onClick={handleShipOrder}>
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
