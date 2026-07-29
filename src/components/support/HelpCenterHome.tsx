"use client";

import { memo } from "react";
import { LifeBuoy, MessageCircleQuestion, Ticket, Mail } from "lucide-react";
import { SUPPORT_FEATURES } from "@/lib/support/support-features";
import { cmsFooterPublicPath } from "@/lib/cms-footer-pages";
import type { FaqCategoryId } from "@/lib/support/support-faq-data";
import type { SupportView } from "@/lib/support/support-utils";

type HelpCenterHomeProps = {
  isLoggedIn: boolean;
  onNavigate: (view: SupportView, faqCategory?: FaqCategoryId) => void;
};

type HomeTile = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  action: () => void;
  hidden?: boolean;
};

function HelpCenterHomeInner({ isLoggedIn, onNavigate }: HelpCenterHomeProps) {
  const tiles: HomeTile[] = [
    {
      id: "faq",
      title: "Frequently Asked Questions",
      description: "Quick answers to common questions",
      emoji: "❓",
      action: () => onNavigate("faq"),
      hidden: !SUPPORT_FEATURES.staticFaqs,
    },
    {
      id: "contact",
      title: "Contact Support",
      description: isLoggedIn ? "Raise a ticket — we typically reply within 24 hours" : "Sign in to contact our team",
      emoji: "✉️",
      action: () => onNavigate("contact"),
      hidden: !SUPPORT_FEATURES.createTicket,
    },
    {
      id: "tickets",
      title: "My Support Tickets",
      description: isLoggedIn ? "Track open and past requests" : "Sign in to view your tickets",
      emoji: "🎫",
      action: () => onNavigate("tickets"),
      hidden: !SUPPORT_FEATURES.listTickets,
    },
    {
      id: "orders-faq",
      title: "Order Issues",
      description: "Tracking, delays, cancellations",
      emoji: "📦",
      action: () => onNavigate("faq", "orders"),
      hidden: !SUPPORT_FEATURES.staticFaqs,
    },
    {
      id: "returns",
      title: "Returns & Refunds",
      description: "Return policy and refund timelines",
      emoji: "↩️",
      action: () => {
        if (SUPPORT_FEATURES.cmsTopicPages && typeof window !== "undefined") {
          window.location.href = cmsFooterPublicPath("returns-refunds");
        } else {
          onNavigate("faq", "returns");
        }
      },
    },
    {
      id: "payments",
      title: "Payments",
      description: "Payment methods and failed transactions",
      emoji: "💳",
      action: () => onNavigate("faq", "payments"),
      hidden: !SUPPORT_FEATURES.staticFaqs,
    },
    {
      id: "account",
      title: "Account & Security",
      description: "Password, profile, and account safety",
      emoji: "🔒",
      action: () => onNavigate("faq", "account"),
      hidden: !SUPPORT_FEATURES.staticFaqs,
    },
  ];

  const visible = tiles.filter((t) => !t.hidden);

  return (
    <div className="space-y-6">
      <div className="iv-card overflow-hidden bg-gradient-to-br from-[var(--iv-brand)] to-[var(--iv-brand-hover)] p-6 text-white sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
            <LifeBuoy className="h-7 w-7" aria-hidden />
          </div>
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">How can we help?</h2>
            <p className="mt-1 text-sm text-white/90 sm:text-base">
              Browse FAQs, contact support, or manage your tickets.
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {SUPPORT_FEATURES.staticFaqs && (
            <button type="button" onClick={() => onNavigate("faq")} className="iv-btn min-h-[var(--iv-touch-min)] border-white/30 bg-white/10 text-white hover:bg-white/20 focus:ring-white/40">
              <MessageCircleQuestion className="h-4 w-4" aria-hidden />
              Browse FAQs
            </button>
          )}
          {SUPPORT_FEATURES.createTicket && (
            <button type="button" onClick={() => onNavigate("contact")} className="iv-btn min-h-[var(--iv-touch-min)] bg-white text-[var(--iv-brand)] hover:bg-slate-50 focus:ring-white/40">
              <Mail className="h-4 w-4" aria-hidden />
              Contact Support
            </button>
          )}
          {SUPPORT_FEATURES.listTickets && isLoggedIn && (
            <button type="button" onClick={() => onNavigate("tickets")} className="iv-btn min-h-[var(--iv-touch-min)] border-white/30 bg-white/10 text-white hover:bg-white/20 focus:ring-white/40">
              <Ticket className="h-4 w-4" aria-hidden />
              My Tickets
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {visible.map((tile) => (
          <button
            key={tile.id}
            type="button"
            onClick={tile.action}
            className="iv-card iv-enter flex min-h-[var(--iv-touch-min)] items-start gap-3 p-4 text-left transition hover:border-[var(--iv-brand)]/30 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--iv-brand-ring)] sm:p-5"
          >
            <span className="text-2xl" aria-hidden>{tile.emoji}</span>
            <div className="min-w-0">
              <p className="font-bold text-slate-900">{tile.title}</p>
              <p className="mt-0.5 text-sm text-slate-600">{tile.description}</p>
            </div>
          </button>
        ))}
      </div>

      {SUPPORT_FEATURES.liveChat && (
        <p className="text-center text-sm text-slate-500">Live chat available</p>
      )}
    </div>
  );
}

export const HelpCenterHome = memo(HelpCenterHomeInner);
