"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { TopBar } from "./TopBar";
import { Navbar } from "./Navbar";
import type { CategoryTreeItem } from "@/types/catalog";

type MenuRow = { kind: "menu"; slug: string; name: string; emoji: string };
type CatRow = { kind: "category"; tree: CategoryTreeItem };
type BrowseRow = MenuRow | CatRow;

const MENU_ROWS: MenuRow[] = [
  { kind: "menu", slug: "deals", name: "Deals", emoji: "🏷️" },
  { kind: "menu", slug: "new-arrivals", name: "New Arrivals", emoji: "📦" },
  { kind: "menu", slug: "best-sellers", name: "Best Sellers", emoji: "📈" },
];

function rowKey(row: BrowseRow): string {
  return row.kind === "menu" ? `m:${row.slug}` : `c:${row.tree.slug}`;
}

export function MobileCategoryBrowsePage() {
  const [tree, setTree] = useState<CategoryTreeItem[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const leftScrollRef = useRef<HTMLDivElement | null>(null);
  const activeLeftRef = useRef<HTMLButtonElement | null>(null);

  const rows = useMemo<BrowseRow[]>(() => {
    const cats: CatRow[] = tree.map((t) => ({ kind: "category", tree: t }));
    return [...MENU_ROWS, ...cats];
  }, [tree]);

  const selectedRow = useMemo(() => {
    if (!rows.length) return null;
    const found = rows.find((r) => rowKey(r) === selectedKey);
    return found ?? rows[0];
  }, [rows, selectedKey]);

  useLayoutEffect(() => {
    if (selectedKey != null || !rows.length) return;
    setSelectedKey(rowKey(rows[0]));
  }, [rows, selectedKey]);

  useLayoutEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia("(max-width: 767px)").matches) return;
    const el = activeLeftRef.current;
    const scroller = leftScrollRef.current;
    if (!el || !scroller) return;
    const s = scroller.getBoundingClientRect();
    const e = el.getBoundingClientRect();
    const delta = e.top + e.height / 2 - (s.top + s.height / 2);
    scroller.scrollTop = scroller.scrollTop + delta;
  }, [selectedKey, rows.length]);

  const load = useCallback(() => {
    fetch("/api/categories?tree=1")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((json) => {
        const data = json?.data;
        if (!Array.isArray(data)) {
          setLoadError(true);
          return;
        }
        setTree(data as CategoryTreeItem[]);
        setLoadError(false);
      })
      .catch(() => setLoadError(true));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div
      className="flex min-h-0 flex-1 flex-col bg-white"
      style={{
        fontFamily: "'Manrope', sans-serif",
      }}
    >
      <TopBar />
      <Navbar />

      {/* Master–detail: always row on mobile so subcategories sit to the right, not below */}
      <div
        className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-row overflow-hidden md:my-4 md:rounded-2xl md:border md:border-slate-200 md:shadow-sm"
        style={{ minHeight: "min(60dvh, calc(100dvh - 170px))" }}
      >
        <div
          ref={leftScrollRef}
          className="flex w-[34%] max-w-[148px] shrink-0 flex-col self-stretch overflow-y-auto border-r border-slate-200 bg-slate-50 sm:max-w-[170px] md:max-w-[200px] md:rounded-l-2xl"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {rows.map((row) => {
            const key = rowKey(row);
            const active = selectedRow && rowKey(selectedRow) === key;
            const label = row.kind === "menu" ? row.name : row.tree.name;
            const emoji = row.kind === "menu" ? row.emoji : row.tree.icon ?? "📦";
            return (
              <button
                key={key}
                type="button"
                ref={active ? activeLeftRef : undefined}
                onClick={() => setSelectedKey(key)}
                className={`flex w-full items-start gap-2 border-l-[3px] px-2.5 py-3 text-left text-[12px] leading-tight transition-colors sm:px-3 sm:text-[13px] ${
                  active
                    ? "border-[#FF6A00] bg-white font-semibold text-[#111827]"
                    : "border-transparent font-medium text-slate-600 hover:bg-white/70"
                }`}
              >
                <span className="text-base leading-none sm:text-lg" aria-hidden>
                  {emoji}
                </span>
                <span className="break-words">{label}</span>
              </button>
            );
          })}
        </div>

        <div
          className="min-h-0 min-w-0 flex-1 self-stretch overflow-y-auto bg-white px-3 py-4 md:rounded-r-2xl"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {!tree.length && !loadError ? (
            <p className="px-1 text-sm text-slate-500">Loading categories…</p>
          ) : loadError ? (
            <p className="px-1 text-sm text-red-600">Could not load categories. Pull to refresh or try again.</p>
          ) : selectedRow == null ? null : selectedRow.kind === "menu" ? (
            <div>
              <h2 className="mb-4 text-lg font-bold text-[#111827]">{selectedRow.name}</h2>
              <Link
                href={`/category/${selectedRow.slug}`}
                className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-gradient-to-br from-[#FFF5EF] to-white px-4 py-8 text-center shadow-sm transition active:scale-[0.99] hover:border-[#FF6A00]/40"
              >
                <span className="mb-2 text-4xl">{selectedRow.emoji}</span>
                <span className="text-base font-semibold text-[#FF6A00]">Shop {selectedRow.name}</span>
                <span className="mt-1 text-xs text-slate-500">See all products in this collection</span>
              </Link>
            </div>
          ) : (
            <div>
              <h2 className="mb-1 text-lg font-bold text-[#111827]">{selectedRow.tree.name}</h2>
              <p className="mb-4 text-xs text-slate-500">Pick a category to browse products</p>

              <Link
                href={`/category/${selectedRow.tree.slug}`}
                className="mb-4 flex items-center justify-center rounded-xl bg-[#FF6A00] px-4 py-3 text-center text-sm font-bold text-white shadow-md transition hover:bg-[#E55F00]"
              >
                Shop all {selectedRow.tree.name}
              </Link>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {selectedRow.tree.subcategories.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/category/${selectedRow.tree.slug}/${sub.slug}`}
                    className="flex flex-col items-center rounded-xl border border-slate-100 bg-slate-50/90 px-1.5 py-3 text-center transition active:scale-[0.98] hover:border-[#FF6A00]/35 hover:bg-[#FFF9F5]"
                  >
                    <span className="mb-1.5 flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
                      {sub.icon}
                    </span>
                    <span className="line-clamp-2 text-[10px] font-semibold leading-snug text-slate-800 sm:text-[11px]">
                      {sub.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
