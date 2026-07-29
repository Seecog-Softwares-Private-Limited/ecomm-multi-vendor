"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ArrowLeft, Home, MessageCircleQuestion, Mail, Ticket } from "lucide-react";
import { HelpCenterHome } from "@/components/support/HelpCenterHome";
import { SupportFaqPanel } from "@/components/support/SupportFaqPanel";
import { SupportTicketListPanel } from "@/components/support/SupportTicketListPanel";
import { SupportTicketDetailPanel } from "@/components/support/SupportTicketDetailPanel";
import { ContactSupportForm } from "@/components/support/ContactSupportForm";
import { HelpCenterSkeleton } from "@/components/support/SupportSkeletons";
import { fetchSupportTicketDetail } from "@/hooks/useSupportTickets";
import { SUPPORT_FEATURES } from "@/lib/support/support-features";
import type { FaqCategoryId } from "@/lib/support/support-faq-data";
import type { SupportTicketRow, SupportView } from "@/lib/support/support-utils";

type HelpCenterShellProps = {
  /** When true, skip auth gate for FAQ/home */
  allowGuestBrowse?: boolean;
};

const NAV_ITEMS: { view: SupportView; label: string; icon: typeof Home; auth?: boolean }[] = [
  { view: "home", label: "Home", icon: Home },
  { view: "faq", label: "FAQs", icon: MessageCircleQuestion },
  { view: "tickets", label: "My Tickets", icon: Ticket, auth: true },
  { view: "contact", label: "Contact", icon: Mail, auth: true },
];

function parseView(raw: string | null): SupportView {
  if (raw === "faq" || raw === "tickets" || raw === "contact" || raw === "detail") return raw;
  return "home";
}

function HelpCenterShellInner({ allowGuestBrowse = true }: HelpCenterShellProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "/support-tickets";
  const searchParams = useSearchParams();
  const basePath = pathname.startsWith("/info/help-center")
    ? "/info/help-center"
    : "/support-tickets";
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState<SupportView>("home");
  const [faqCategory, setFaqCategory] = useState<FaqCategoryId | "all">("all");
  const [detailTicket, setDetailTicket] = useState<SupportTicketRow | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const user = data?.data?.user;
        setIsLoggedIn(Boolean(user && user.role === "CUSTOMER"));
      })
      .catch(() => setIsLoggedIn(false))
      .finally(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    const v = parseView(searchParams.get("view"));
    const ticketId = searchParams.get("ticket");
    const cat = searchParams.get("category") as FaqCategoryId | null;

    if (cat && ["general", "orders", "returns", "payments", "account"].includes(cat)) {
      setFaqCategory(cat);
    }

    if (ticketId && SUPPORT_FEATURES.ticketDetail) {
      setView("detail");
      setDetailLoading(true);
      void fetchSupportTicketDetail(ticketId).then((t) => {
        setDetailTicket(t);
        setDetailLoading(false);
      });
      return;
    }

    if ((v === "tickets" || v === "contact") && !isLoggedIn && !allowGuestBrowse) {
      router.replace(`/login?returnUrl=${encodeURIComponent(basePath)}`);
      return;
    }

    setView(v);
  }, [authChecked, searchParams, isLoggedIn, allowGuestBrowse, router, basePath]);

  const navigate = useCallback(
    (next: SupportView, category?: FaqCategoryId) => {
      const params = new URLSearchParams();
      if (next !== "home") params.set("view", next);
      if (category) params.set("category", category);
      const qs = params.toString();
      router.push(qs ? `${basePath}?${qs}` : basePath, { scroll: false });
      if (category) setFaqCategory(category);
      setView(next);
      setDetailTicket(null);
    },
    [router, basePath]
  );

  const openTicket = useCallback(
    (ticket: SupportTicketRow) => {
      router.push(`${basePath}?view=detail&ticket=${encodeURIComponent(ticket.id)}`, {
        scroll: false,
      });
      setDetailTicket(ticket);
      setView("detail");
    },
    [router, basePath]
  );

  if (!authChecked) {
    return <HelpCenterSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Help Center</h1>
          <p className="mt-1 text-slate-600">Support, FAQs, and ticket management</p>
        </div>
        {view !== "home" && (
          <button type="button" onClick={() => navigate("home")} className="iv-btn-ghost shrink-0 self-start">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to Home
          </button>
        )}
      </div>

      <nav
        className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden"
        aria-label="Help center sections"
      >
        {NAV_ITEMS.map(({ view: v, label, icon: Icon, auth }) => {
          if (auth && !isLoggedIn) return null;
          if (v === "faq" && !SUPPORT_FEATURES.staticFaqs) return null;
          if (v === "tickets" && !SUPPORT_FEATURES.listTickets) return null;
          if (v === "contact" && !SUPPORT_FEATURES.createTicket) return null;
          return (
            <button
              key={v}
              type="button"
              aria-current={view === v ? "page" : undefined}
              onClick={() => navigate(v)}
              className={`inline-flex min-h-[var(--iv-touch-min)] shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--iv-brand-ring)] ${
                view === v
                  ? "bg-[var(--iv-brand)] text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-[var(--iv-brand)]/40"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="iv-fade-in">
        {view === "home" && (
          <HelpCenterHome isLoggedIn={isLoggedIn} onNavigate={navigate} />
        )}
        {view === "faq" && (
          <SupportFaqPanel initialCategory={faqCategory} />
        )}
        {view === "tickets" && (
          <SupportTicketListPanel
            enabled={isLoggedIn}
            onCreateClick={() => navigate("contact")}
            onSelectTicket={openTicket}
          />
        )}
        {view === "contact" && (
          <ContactSupportForm
            isLoggedIn={isLoggedIn}
            onSuccess={(ticket) => openTicket(ticket)}
          />
        )}
        {view === "detail" && (
          <SupportTicketDetailPanel
            ticket={detailTicket}
            loading={detailLoading}
            onBack={() => navigate("tickets")}
          />
        )}
      </div>
    </div>
  );
}

export const HelpCenterShell = memo(HelpCenterShellInner);
