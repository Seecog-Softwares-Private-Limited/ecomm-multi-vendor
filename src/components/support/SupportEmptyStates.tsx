"use client";

import { memo } from "react";
import { Inbox, MessageCircleQuestion, Search } from "lucide-react";

export const FaqEmptyState = memo(function FaqEmptyState() {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <MessageCircleQuestion className="mb-4 h-12 w-12 text-slate-300" aria-hidden />
      <h3 className="text-lg font-bold text-slate-900">No FAQs Available</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-600">Check back later or contact support directly.</p>
    </div>
  );
});

export const FaqSearchEmptyState = memo(function FaqSearchEmptyState({
  onClear,
}: {
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <Search className="mb-4 h-12 w-12 text-slate-300" aria-hidden />
      <h3 className="text-lg font-bold text-slate-900">No matching FAQs</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-600">Try different keywords or browse all categories.</p>
      <button type="button" onClick={onClear} className="iv-btn-outline mt-4">
        Clear search
      </button>
    </div>
  );
});

export const TicketsEmptyState = memo(function TicketsEmptyState({
  filtered,
  onCreate,
  onClearFilters,
}: {
  filtered: boolean;
  onCreate: () => void;
  onClearFilters: () => void;
}) {
  if (filtered) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <Search className="mb-4 h-12 w-12 text-slate-300" aria-hidden />
        <h3 className="text-lg font-bold text-slate-900">No tickets match</h3>
        <p className="mt-2 text-sm text-slate-600">Try adjusting your search or filters.</p>
        <button type="button" onClick={onClearFilters} className="iv-btn-outline mt-4">
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-12 text-center">
      <Inbox className="mb-4 h-12 w-12 text-slate-300" aria-hidden />
      <h3 className="text-lg font-bold text-slate-900">No Support Tickets Yet</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-600">
        When you contact us, your conversations will appear here.
      </p>
      <button type="button" onClick={onCreate} className="iv-btn-primary mt-4">
        Create a ticket
      </button>
    </div>
  );
});
