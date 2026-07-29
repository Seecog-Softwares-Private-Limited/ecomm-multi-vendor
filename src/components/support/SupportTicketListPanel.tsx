"use client";

import { memo, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useSupportTickets } from "@/hooks/useSupportTickets";
import { CustomerErrorState } from "@/components/ui-customer/CustomerErrorState";
import { SupportTicketCard } from "@/components/support/SupportTicketCard";
import { TicketsEmptyState } from "@/components/support/SupportEmptyStates";
import { TicketListSkeleton } from "@/components/support/SupportSkeletons";
import {
  filterTicketsBySearch,
  STATUS_LABELS,
  TICKET_FILTERS,
  type SupportTicketRow,
  type TicketFilter,
} from "@/lib/support/support-utils";

type SupportTicketListPanelProps = {
  enabled: boolean;
  onCreateClick: () => void;
  onSelectTicket: (ticket: SupportTicketRow) => void;
};

function SupportTicketListPanelInner({
  enabled,
  onCreateClick,
  onSelectTicket,
}: SupportTicketListPanelProps) {
  const [statusFilter, setStatusFilter] = useState<TicketFilter>("ALL");
  const [search, setSearch] = useState("");
  const { tickets, loading, error, refetch } = useSupportTickets(enabled, statusFilter);

  const displayed = useMemo(
    () => filterTicketsBySearch(tickets, search),
    [tickets, search]
  );

  if (!enabled) {
    return (
      <div className="iv-card py-12 text-center">
        <p className="font-medium text-slate-800">Sign in to view your support tickets.</p>
        <a href="/login?returnUrl=%2Fsupport-tickets%3Fview%3Dtickets" className="iv-btn-primary mt-4 inline-flex">
          Sign in
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="iv-section-title text-xl">My Support Tickets</h2>
          <p className="mt-1 text-sm text-slate-600">Track and manage your requests</p>
        </div>
        <button type="button" onClick={onCreateClick} className="iv-btn-primary shrink-0">
          <Plus className="h-4 w-4" aria-hidden />
          New Ticket
        </button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by subject or ticket ID…"
          aria-label="Search tickets"
          className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm min-h-[var(--iv-touch-min)] focus:outline-none focus:ring-2 focus:ring-[var(--iv-brand-ring)]"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by status">
        {TICKET_FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={statusFilter === f}
            onClick={() => setStatusFilter(f)}
            className={`iv-chip min-h-[var(--iv-touch-min)] shrink-0 whitespace-nowrap ${statusFilter === f ? "iv-chip-active" : ""}`}
          >
            {f === "ALL" ? "All" : STATUS_LABELS[f] ?? f}
          </button>
        ))}
      </div>

      {loading && <TicketListSkeleton />}

      {error && (
        <CustomerErrorState
          title="Couldn't load tickets"
          message={error}
          onRetry={() => void refetch()}
          showContinueShopping={false}
        />
      )}

      {!loading && !error && displayed.length === 0 && (
        <TicketsEmptyState
          filtered={statusFilter !== "ALL" || search.trim().length > 0}
          onCreate={onCreateClick}
          onClearFilters={() => {
            setStatusFilter("ALL");
            setSearch("");
          }}
        />
      )}

      {!loading && !error && displayed.length > 0 && (
        <div className="space-y-3" role="list" aria-label="Support tickets">
          {displayed.map((ticket) => (
            <SupportTicketCard key={ticket.id} ticket={ticket} onSelect={onSelectTicket} />
          ))}
        </div>
      )}
    </div>
  );
}

export const SupportTicketListPanel = memo(SupportTicketListPanelInner);
