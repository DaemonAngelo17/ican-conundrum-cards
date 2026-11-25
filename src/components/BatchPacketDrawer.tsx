"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  ClipboardList,
  Download,
  FileSpreadsheet,
  Layers,
  LayoutList,
  Minimize2,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  CANONICAL_THEMES,
  type ConundrumRecord,
} from "@/types/conundrum";
import { THEME_STYLES } from "@/lib/themes";
import { slugifyTitle } from "@/lib/print-utils";
import {
  PACKET_PAGES,
  PRINT_PRESETS,
  type PacketPageNumber,
  type WritingLayoutMode,
} from "./PrintExportDrawer";

export type BatchExportFormat = "master-cards" | "worksheets";

export interface BatchPrintConfig {
  cards: ConundrumRecord[];
  format: BatchExportFormat;
  selectedPages: PacketPageNumber[];
  layoutMode: WritingLayoutMode;
  filename: string;
}

interface BatchPacketDrawerProps {
  open: boolean;
  onClose: () => void;
  allCards: ConundrumRecord[];
  filteredCards: ConundrumRecord[];
  selectedCardIds: string[];
  onChangeSelectedCardIds: (ids: string[]) => void;
  onExportBatch: (config: BatchPrintConfig) => void;
}

export function BatchPacketDrawer({
  open,
  onClose,
  allCards,
  filteredCards,
  selectedCardIds,
  onChangeSelectedCardIds,
  onExportBatch,
}: BatchPacketDrawerProps) {
  const [format, setFormat] = useState<BatchExportFormat>("worksheets");
  const [selectedPages, setSelectedPages] = useState<PacketPageNumber[]>([
    2, 6, 7, 8,
  ]);
  const [layoutMode, setLayoutMode] = useState<WritingLayoutMode>("lines");
  const [cardSearch, setCardSearch] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const selectedSet = useMemo(
    () => new Set(selectedCardIds),
    [selectedCardIds]
  );

  const selectedCards = useMemo(
    () => allCards.filter((c) => selectedSet.has(c.cardId)),
    [allCards, selectedSet]
  );

  const visibleList = useMemo(() => {
    const q = cardSearch.trim().toLowerCase();
    if (!q) return allCards;
    return allCards.filter(
      (c) =>
        c.cardId.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );
  }, [allCards, cardSearch]);

  if (!open) return null;

  const toggleCard = (id: string) => {
    if (selectedSet.has(id)) {
      onChangeSelectedCardIds(selectedCardIds.filter((x) => x !== id));
    } else {
      onChangeSelectedCardIds([...selectedCardIds, id]);
    }
  };

  const selectThemeCards = (theme: string) => {
    const ids = allCards
      .filter((c) => c.category === theme)
      .map((c) => c.cardId);
    const merged = Array.from(new Set([...selectedCardIds, ...ids]));
    onChangeSelectedCardIds(merged);
  };

  const selectFilteredCards = () => {
    const ids = filteredCards.map((c) => c.cardId);
    const merged = Array.from(new Set([...selectedCardIds, ...ids]));
    onChangeSelectedCardIds(merged);
  };

  const togglePage = (num: PacketPageNumber) => {
    if (selectedPages.includes(num)) {
      onChangeSelectedCardIds(selectedCardIds);
      setSelectedPages(selectedPages.filter((p) => p !== num));
    } else {
      setSelectedPages([...selectedPages, num].sort((a, b) => a - b));
    }
  };

  const hasStudentPages =
    format === "worksheets" && selectedPages.some((p) => p >= 1 && p <= 8);
  const hasTeacherKey =
    format === "worksheets" && selectedPages.some((p) => p === 9 || p === 10);
  const potentialKeyLeak = hasStudentPages && hasTeacherKey;

  const pagesPerCard = format === "master-cards" ? 1 : selectedPages.length;
  const totalPages = selectedCards.length * pagesPerCard;

  // Build smart filename
  const uniqueThemes = Array.from(new Set(selectedCards.map((c) => c.category)));
  const scopeSlug =
    uniqueThemes.length === 1
      ? slugifyTitle(uniqueThemes[0])
      : `${selectedCards.length}-Cards`;
  const modeSlug = format === "master-cards" ? "MasterCards_A5" : "Packets_A4";
  const batchFilename = `ICAN_Batch_${scopeSlug}_${modeSlug}.pdf`;

  const canExport = selectedCards.length > 0 && pagesPerCard > 0;

  return (
    <div
      className="no-print fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Batch Packet Builder"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/45 backdrop-blur-[2px]"
      />

      {/* Slide-over Panel */}
      <div className="relative z-10 w-full max-w-2xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Layers className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-950">
                Batch Packet Builder
              </h2>
              <p className="text-xs text-slate-500">
                Multi-select cards by theme or custom unit to export one clean A4 PDF.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Batch Packet Builder"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-5 workspace-scroll">
          {/* Step 1: Quick Select by Theme / Filter */}
          <section className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                1. Quick-Add Lesson Units ({selectedCards.length} selected)
              </span>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={selectFilteredCards}
                  className="font-semibold text-blue-700 hover:underline cursor-pointer"
                >
                  + Current Filter ({filteredCards.length})
                </button>
                <span className="text-slate-300">·</span>
                <button
                  type="button"
                  onClick={() => onChangeSelectedCardIds([])}
                  className="font-semibold text-slate-500 hover:text-slate-900 underline cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {CANONICAL_THEMES.map((theme) => {
                const style = THEME_STYLES[theme];
                const count = allCards.filter((c) => c.category === theme).length;
                return (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => selectThemeCards(theme)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition hover:brightness-95 cursor-pointer ${style.badgeBg} ${style.badgeText} ${style.badgeBorder}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${style.dotColor}`} />
                    <span>+ {style.shortName}</span>
                    <span className="opacity-70 tabular-nums">({count})</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Step 2: Individual Card Multi-Select */}
          <section className="space-y-2">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={cardSearch}
                onChange={(e) => setCardSearch(e.target.value)}
                placeholder="Filter cards to add/remove (e.g., CON-004, Mars, Ethics)..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-400 focus:outline-none"
              />
            </div>

            <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100 workspace-scroll">
              {visibleList.map((c) => {
                const checked = selectedSet.has(c.cardId);
                return (
                  <label
                    key={c.cardId}
                    className={`flex items-center gap-3 px-3 py-2 text-xs cursor-pointer transition ${
                      checked ? "bg-blue-50/50" : "bg-white hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCard(c.cardId)}
                      className="h-3.5 w-3.5 rounded accent-slate-900 cursor-pointer"
                    />
                    <span className="font-mono text-[11px] font-bold text-slate-700 w-16 shrink-0">
                      {c.cardId}
                    </span>
                    <span className="font-medium text-slate-900 truncate flex-1">
                      {c.title}
                    </span>
                    <span className="text-[10.5px] text-slate-500 hidden sm:inline shrink-0">
                      {c.category}
                    </span>
                  </label>
                );
              })}
              {visibleList.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-500">
                  No cards match &ldquo;{cardSearch}&rdquo;.
                </div>
              )}
            </div>
          </section>

          {/* Step 3: Output Format (Master Cards vs Worksheet Packets) */}
          <section className="space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              2. Export Format
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat("master-cards")}
                className={`rounded-xl border p-3 text-left transition cursor-pointer ${
                  format === "master-cards"
                    ? "bg-slate-900 border-slate-900 text-white"
                    : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <ClipboardList className="h-3.5 w-3.5" />
                  <span>Master Cards Deck</span>
                </div>
                <p
                  className={`text-[10.5px] mt-1 ${
                    format === "master-cards"
                      ? "text-slate-300"
                      : "text-slate-500"
                  }`}
                >
                  1 A5 landscape card per conundrum (210 × 148 mm).
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFormat("worksheets")}
                className={`rounded-xl border p-3 text-left transition cursor-pointer ${
                  format === "worksheets"
                    ? "bg-slate-900 border-slate-900 text-white"
                    : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  <span>Worksheet Packets</span>
                </div>
                <p
                  className={`text-[10.5px] mt-1 ${
                    format === "worksheets"
                      ? "text-slate-300"
                      : "text-slate-500"
                  }`}
                >
                  Choose specific pages (P1–P10) for every card.
                </p>
              </button>
            </div>
          </section>

          {/* Worksheet Page Options (when format === 'worksheets') */}
          {format === "worksheets" && (
            <section className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  3. Pages Per Card ({selectedPages.length} of 10)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setLayoutMode("lines")}
                    className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold cursor-pointer ${
                      layoutMode === "lines"
                        ? "bg-slate-900 text-white"
                        : "bg-white border border-slate-200 text-slate-600"
                    }`}
                  >
                    <LayoutList className="h-3 w-3" />
                    Lines
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayoutMode("compact")}
                    className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold cursor-pointer ${
                      layoutMode === "compact"
                        ? "bg-slate-900 text-white"
                        : "bg-white border border-slate-200 text-slate-600"
                    }`}
                  >
                    <Minimize2 className="h-3 w-3" />
                    Compact
                  </button>
                </div>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap gap-1.5">
                {PRINT_PRESETS.map((preset) => {
                  const active =
                    preset.pages.length === selectedPages.length &&
                    preset.pages.every((p, i) => selectedPages[i] === p);
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedPages(preset.pages)}
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer ${
                        active
                          ? "bg-slate-900 text-white"
                          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {active && <Check className="h-3 w-3 text-emerald-400" />}
                      <span>{preset.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Leak Guard */}
              {potentialKeyLeak ? (
                <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 flex items-center justify-between gap-2 text-xs text-amber-950">
                  <span className="inline-flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0" />
                    <span>Teacher Answer Key pages (P9–P10) are included with student pages.</span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedPages(
                        selectedPages.filter((p) => p !== 9 && p !== 10)
                      )
                    }
                    className="shrink-0 rounded-md bg-amber-900 px-2 py-1 text-[11px] font-semibold text-white hover:bg-amber-800 cursor-pointer"
                  >
                    Exclude P9–10
                  </button>
                </div>
              ) : hasStudentPages && !hasTeacherKey ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-1.5 flex items-center gap-2 text-[11px] text-emerald-900">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Student-safe batch — Teacher Keys (P9–P10) excluded.</span>
                </div>
              ) : null}

              {/* 7 Page Checkboxes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {PACKET_PAGES.map((p) => {
                  const checked = selectedPages.includes(p.num);
                  return (
                    <label
                      key={p.num}
                      className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium cursor-pointer ${
                        checked
                          ? p.isTeacherKey
                            ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                            : "bg-white border-slate-900 text-slate-900"
                          : "bg-white border-slate-200 text-slate-500"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => togglePage(p.num)}
                        className="h-3.5 w-3.5 accent-slate-900 cursor-pointer"
                      />
                      <span className="truncate">
                        {p.short} {p.isTeacherKey ? "Key" : p.title.split(" ")[0]}
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="px-5 sm:px-6 py-4 border-t border-slate-200 bg-slate-50/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">
              <strong className="text-slate-900">{selectedCards.length}</strong>{" "}
              {selectedCards.length === 1 ? "card" : "cards"} ×{" "}
              <strong className="text-slate-900">{pagesPerCard}</strong>{" "}
              {pagesPerCard === 1 ? "page" : "pages"} ={" "}
              <strong className="text-slate-950">
                {totalPages} {format === "master-cards" ? "A5" : "A4"}{" "}
                {totalPages === 1 ? "page" : "pages"}
              </strong>
            </span>
            <span className="font-mono text-[10.5px] text-slate-500 truncate max-w-[240px]">
              {batchFilename}
            </span>
          </div>

          <button
            type="button"
            disabled={!canExport}
            onClick={() =>
              onExportBatch({
                cards: selectedCards,
                format,
                selectedPages,
                layoutMode,
                filename: batchFilename,
              })
            }
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-40 shadow-sm transition cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>
              Export Batch PDF ({totalPages}{" "}
              {format === "master-cards" ? "A5" : "A4"}{" "}
              {totalPages === 1 ? "Page" : "Pages"})
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
