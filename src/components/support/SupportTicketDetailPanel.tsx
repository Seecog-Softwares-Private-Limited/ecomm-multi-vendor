"use client";

import { memo } from "react";
import { Headphones, MessageSquare, User } from "lucide-react";
import Link from "next/link";
import {
  STATUS_BADGE_CLASS,
  STATUS_LABELS,
  formatSupportDateTime,
  type SupportTicketRow,
} from "@/lib/support/support-utils";
import { SUPPORT_FEATURES } from "@/lib/support/support-features";
import { TicketDetailSkeleton } from "@/components/support/SupportSkeletons";

type SupportTicketDetailPanelProps = {
  ticket: SupportTicketRow | null;
  loading: boolean;
  onBack: () => void;
};

function SupportTicketDetailPanelInner({ ticket, loading, onBack }: SupportTicketDetailPanelProps) {
  if (loading) return <TicketDetailSkeleton />;

  if (!ticket) {
    return (
      <div className="py-12 text-center">
        <p className="font-medium text-slate-800">Ticket not found.</p>
        <button type="button" onClick={onBack} className="iv-btn-outline mt-4">
          Back to tickets
        </button>
      </div>
    );
  }

  const badgeClass = STATUS_BADGE_CLASS[ticket.status] ?? STATUS_BADGE_CLASS.CLOSED;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <button type="button" onClick={onBack} className="mb-3 text-sm font-semibold text-[var(--iv-brand)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--iv-brand-ring)]">
            ← Back to tickets
          </button>
          <p className="font-mono text-sm text-slate-500">{ticket.shortId}</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">{ticket.subject}</h2>
        </div>
        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${badgeClass}`}>
          {STATUS_LABELS[ticket.status] ?? ticket.status}
        </span>
      </div>

      {ticket.orderId && SUPPORT_FEATURES.orderLinkOnTicket && (
        <div className="iv-card-padded text-sm">
          <span className="text-slate-600">Related order: </span>
          <Link href={`/order-detail/${ticket.orderId}`} className="font-semibold text-[var(--iv-brand)] hover:underline">
            View order #{ticket.orderId.slice(0, 8).toUpperCase()}
          </Link>
        </div>
      )}

      <div className="space-y-4" aria-label="Conversation timeline">
        <div className="relative flex gap-3 sm:gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
            <User className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 iv-card-padded">
            <p className="text-xs font-semibold text-slate-500">You · Ticket opened</p>
            <p className="mt-2 text-sm text-slate-800">{ticket.subject}</p>
            <time className="mt-2 block text-xs text-slate-500" dateTime={ticket.createdAt}>
              {formatSupportDateTime(ticket.createdAt)}
            </time>
          </div>
        </div>

        {SUPPORT_FEATURES.adminReply && ticket.adminReply && (
          <div className="relative flex gap-3 sm:gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Headphones className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1 iv-card-padded border-emerald-100 bg-emerald-50/50">
              <p className="text-xs font-semibold text-emerald-800">
                Support team
                {SUPPORT_FEATURES.assignedAgent ? "" : ""}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{ticket.adminReply}</p>
              {ticket.adminRepliedAt && (
                <time className="mt-2 block text-xs text-slate-500" dateTime={ticket.adminRepliedAt}>
                  {formatSupportDateTime(ticket.adminRepliedAt)}
                </time>
              )}
            </div>
          </div>
        )}

        {!ticket.adminReply && (
          <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <MessageSquare className="h-4 w-4 shrink-0" aria-hidden />
            Our team will respond here. You&apos;ll see updates on this ticket.
          </div>
        )}
      </div>

      {SUPPORT_FEATURES.statusHistory && (
        <div aria-hidden className="hidden">
          Status history unavailable
        </div>
      )}
    </div>
  );
}

export const SupportTicketDetailPanel = memo(SupportTicketDetailPanelInner);
