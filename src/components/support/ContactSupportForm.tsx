"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createSupportTicket } from "@/hooks/useSupportTickets";
import { SUPPORT_FEATURES } from "@/lib/support/support-features";
import type { SupportTicketRow } from "@/lib/support/support-utils";

type OrderOption = { id: string; label: string };

type ContactSupportFormProps = {
  isLoggedIn: boolean;
  onSuccess: (ticket: SupportTicketRow) => void;
};

function ContactSupportFormInner({ isLoggedIn, onSuccess }: ContactSupportFormProps) {
  const [subject, setSubject] = useState("");
  const [orderId, setOrderId] = useState("");
  const [orders, setOrders] = useState<OrderOption[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadOrders = useCallback(async () => {
    if (!SUPPORT_FEATURES.orderSelectionOnCreate) return;
    setOrdersLoading(true);
    try {
      const res = await fetch("/api/orders", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      const rows = data?.data?.orders ?? [];
      setOrders(
        rows.slice(0, 20).map((o: { id: string; createdAt: string; status: string }) => ({
          id: o.id,
          label: `Order #${o.id.slice(0, 8).toUpperCase()} · ${o.status}`,
        }))
      );
    } catch {
      /* optional */
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) void loadOrders();
  }, [isLoggedIn, loadOrders]);

  if (!isLoggedIn) {
    return (
      <div className="iv-card py-12 text-center">
        <p className="font-medium text-slate-800">Sign in to contact support</p>
        <p className="mt-2 text-sm text-slate-600">We&apos;ll link tickets to your account for faster help.</p>
        <a href="/login?returnUrl=%2Fsupport-tickets%3Fview%3Dcontact" className="iv-btn-primary mt-4 inline-flex">
          Sign in
        </a>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = subject.trim();
    if (!trimmed) {
      toast.error("Please describe your issue");
      return;
    }
    setSubmitting(true);
    const result = await createSupportTicket({
      subject: trimmed,
      orderId: orderId || null,
    });
    setSubmitting(false);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success("Support ticket created");
    setSubject("");
    setOrderId("");
    onSuccess(result.ticket);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="iv-section-title text-xl">Contact Support</h2>
        <p className="mt-1 text-sm text-slate-600">
          Describe your issue and we&apos;ll get back to you on your ticket.
        </p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="iv-card space-y-5 p-5 sm:p-6">
        {SUPPORT_FEATURES.ticketCategory && (
          <div>{/* category — hidden until API supports it */}</div>
        )}

        <div>
          <label htmlFor="support-subject" className="mb-1.5 block text-sm font-semibold text-slate-800">
            Subject / describe your issue
          </label>
          <input
            id="support-subject"
            type="text"
            required
            maxLength={500}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Item arrived damaged"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm min-h-[var(--iv-touch-min)] focus:outline-none focus:ring-2 focus:ring-[var(--iv-brand-ring)]"
          />
        </div>

        {SUPPORT_FEATURES.ticketDescriptionField && (
          <div>{/* description field hidden — API uses subject only */}</div>
        )}

        {SUPPORT_FEATURES.orderSelectionOnCreate && (
          <div>
            <label htmlFor="support-order" className="mb-1.5 block text-sm font-semibold text-slate-800">
              Related order <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <select
              id="support-order"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              disabled={ordersLoading}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm min-h-[var(--iv-touch-min)] focus:outline-none focus:ring-2 focus:ring-[var(--iv-brand-ring)]"
            >
              <option value="">No specific order</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {SUPPORT_FEATURES.attachments && (
          <div>{/* attachments hidden */}</div>
        )}

        <button type="submit" disabled={submitting} className="iv-btn-primary w-full sm:w-auto min-w-[10rem]">
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Submitting…
            </>
          ) : (
            "Submit Ticket"
          )}
        </button>
      </form>
    </div>
  );
}

export const ContactSupportForm = memo(ContactSupportFormInner);
