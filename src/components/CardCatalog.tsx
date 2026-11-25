"use client";

import { ChevronRight, FileText, Layers, Plus } from "lucide-react";
import type { ConundrumRecord } from "@/types/conundrum";
import { getThemeStyle } from "@/lib/themes";
import { CustomConundrumEmblem } from "@/lib/card-artwork";

interface CardCatalogProps {
  cards: ConundrumRecord[];
  selectedCardId: string | null;
  onSelectCard: (cardId: string) => void;
  batchSelectedIds: string[];
  onToggleBatchCard: (cardId: string) => void;
  onResetFilters?: () => void;
  onAddNew?: () => void;
}

export function CardCatalog({
  cards,
  selectedCardId,
  onSelectCard,
  batchSelectedIds,
  onToggleBatchCard,
  onResetFilters,
  onAddNew,
}: CardCatalogProps) {
  const batchSet = new Set(batchSelectedIds);

  if (cards.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center space-y-3">
        <Layers className="h-8 w-8 text-slate-300 mx-auto" />
        <div>
          <h3 className="text-sm font-semibold text-slate-800">
            No matching conundrum cards
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Try a different Card ID, keyword, discipline, or clear your theme
            filters.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              Reset Filters
            </button>
          )}
          {onAddNew && (
            <button
              type="button"
              onClick={onAddNew}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              New Conundrum
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      role="listbox"
      aria-label="Conundrum card catalog"
      className="space-y-2"
    >
      {cards.map((card) => {
        const isSelected = card.cardId === selectedCardId;
        const isInBatch = batchSet.has(card.cardId);
        const theme = getThemeStyle(card.category);

        return (
          <div
            key={card.cardId}
            role="option"
            aria-selected={isSelected}
            className={`w-full text-left rounded-xl border p-3.5 transition-all group flex items-start gap-2.5 ${
              isSelected
                ? "bg-white border-slate-900 ring-2 ring-slate-900/10 shadow-sm"
                : isInBatch
                  ? "bg-blue-50/35 border-blue-300 hover:border-blue-400"
                  : "bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs"
            }`}
          >
            {/* Batch Multi-Select Checkbox */}
            <input
              type="checkbox"
              checked={isInBatch}
              onChange={() => onToggleBatchCard(card.cardId)}
              aria-label={`Select ${card.cardId} for batch export`}
              title="Add/remove from Batch Packet Builder"
              className="mt-1 h-4 w-4 rounded border-slate-300 accent-slate-900 shrink-0 cursor-pointer"
            />

            {/* Card Clickable Body */}
            <button
              type="button"
              onClick={() => onSelectCard(card.cardId)}
              className="flex-1 min-w-0 text-left cursor-pointer"
            >
              {/* Top Meta Row */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="h-6 w-6 rounded-md bg-slate-900 text-white flex items-center justify-center shrink-0 p-0.5">
                    <CustomConundrumEmblem
                      card={card}
                      className="h-5 w-5"
                      showStamp={false}
                    />
                  </span>
                  <span
                    className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-md ${
                      isSelected
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-700 group-hover:bg-slate-200/80"
                    }`}
                  >
                    {card.cardId}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium truncate ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full shrink-0 ${theme.dotColor}`}
                    />
                    <span className="truncate">{theme.shortName}</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {card.worksheet && (
                    <span
                      title="Differentiated worksheets linked (G1–2, G3–4, G5–6+)"
                      className="inline-flex items-center text-slate-400"
                    >
                      <FileText className="h-3.5 w-3.5" />
                    </span>
                  )}
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${
                      isSelected
                        ? "text-slate-900 translate-x-0.5"
                        : "text-slate-300 group-hover:text-slate-500"
                    }`}
                  />
                </div>
              </div>

              {/* Title */}
              <h3
                className={`text-sm font-semibold leading-snug ${
                  isSelected ? "text-slate-950" : "text-slate-800"
                }`}
              >
                {card.title}
              </h3>

              {/* Objective Excerpt */}
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                {card.objective}
              </p>

              {/* Discipline Pills */}
              {card.disciplines.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {card.disciplines.slice(0, 3).map((discipline) => (
                    <span
                      key={discipline}
                      className="inline-block rounded-md bg-slate-100/90 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                    >
                      {discipline}
                    </span>
                  ))}
                  {card.disciplines.length > 3 && (
                    <span className="inline-block rounded-md bg-slate-100/70 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                      +{card.disciplines.length - 3}
                    </span>
                  )}
                </div>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
