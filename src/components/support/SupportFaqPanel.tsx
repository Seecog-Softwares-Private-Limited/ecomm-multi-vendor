"use client";

import { memo, useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";
import {
  FAQ_CATEGORIES,
  SUPPORT_FAQS,
  searchFaqs,
  type FaqCategoryId,
} from "@/lib/support/support-faq-data";
import { FaqEmptyState, FaqSearchEmptyState } from "@/components/support/SupportEmptyStates";

type SupportFaqPanelProps = {
  initialCategory?: FaqCategoryId | "all";
};

function SupportFaqPanelInner({ initialCategory = "all" }: SupportFaqPanelProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FaqCategoryId | "all">(initialCategory);

  const results = useMemo(
    () => searchFaqs(SUPPORT_FAQS, query, category),
    [query, category]
  );

  const hasQuery = query.trim().length > 0;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="iv-section-title text-xl">Frequently Asked Questions</h2>
        <p className="mt-1 text-sm text-slate-600">Search or browse by topic</p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search FAQs…"
          aria-label="Search FAQs"
          className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--iv-brand-ring)] min-h-[var(--iv-touch-min)]"
        />
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="FAQ categories">
        <button
          type="button"
          aria-pressed={category === "all"}
          onClick={() => setCategory("all")}
          className={`iv-chip min-h-[var(--iv-touch-min)] ${category === "all" ? "iv-chip-active" : ""}`}
        >
          All
        </button>
        {FAQ_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            aria-pressed={category === cat.id}
            onClick={() => setCategory(cat.id)}
            className={`iv-chip min-h-[var(--iv-touch-min)] ${category === cat.id ? "iv-chip-active" : ""}`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {SUPPORT_FAQS.length === 0 && <FaqEmptyState />}

      {SUPPORT_FAQS.length > 0 && results.length === 0 && hasQuery && <FaqSearchEmptyState onClear={() => setQuery("")} />}

      {results.length > 0 && (
        <Accordion type="multiple" className="iv-card divide-y divide-slate-100 rounded-2xl border border-slate-200/90 px-2">
          {results.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id} className="border-0 px-2">
              <AccordionTrigger className="py-4 text-left text-sm font-semibold text-slate-900 hover:no-underline sm:text-base">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-sm leading-relaxed text-slate-600">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}

export const SupportFaqPanel = memo(SupportFaqPanelInner);
