"use client";

import { memo } from "react";
import { Clock } from "lucide-react";
import {
  STATUS_BADGE_CLASS,
  STATUS_LABELS,
  formatRelativeTime,
  formatSupportDate,
  type SupportTicketRow,
} from "@/lib/support/support-utils";

type SupportTicketCardProps = {
  ticket: SupportTicketRow;
  onSelect: (ticket: SupportTicketRow) => void;
};

function SupportTicketCardInner({ ticket, onSelect }: SupportTicketCardProps) {
  const badgeClass = STATUS_BADGE_CLASS[ticket.status] ?? STATUS_BADGE_CLASS.CLOSED;
  const lastActivity = ticket.lastUpdateAt ?? ticket.createdAt;

  return (
    <article className="iv-card iv-enter p-4 transition hover:border-[var(--iv-brand)]/25 hover:shadow-md sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold text-slate-500">{ticket.shortId}</span>
            <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${badgeClass}`}>
              {STATUS_LABELS[ticket.status] ?? ticket.status}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 sm:text-lg">{ticket.subject}</h3>
          <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 sm:text-sm">
            <div>
              <dt className="sr-only">Created</dt>
              <dd>Created {formatSupportDate(ticket.createdAt)}</dd>
            </div>
            <div className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <dt className="sr-only">Last updated</dt>
              <dd>Updated {formatRelativeTime(lastActivity)}</dd>
            </div>
          </dl>
        </div>
        <button
          type="button"
          onClick={() => onSelect(ticket)}
          className="iv-btn-outline w-full shrink-0 sm:w-auto"
        >
          View Details
        </button>
      </div>
    </article>
  );
}

export const SupportTicketCard = memo(SupportTicketCardInner, (a, b) => a.ticket.id === b.ticket.id);
