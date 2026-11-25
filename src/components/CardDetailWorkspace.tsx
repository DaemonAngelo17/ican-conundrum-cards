"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileSpreadsheet,
  PencilLine,
} from "lucide-react";
import type { ConundrumRecord } from "@/types/conundrum";
import { getThemeStyle } from "@/lib/themes";
import { MasterCardPrintView } from "./MasterCardPrintView";
import { WorksheetPacketView } from "./WorksheetPacketView";

interface CardDetailWorkspaceProps {
  card: ConundrumRecord;
  currentIndex: number;
  totalFiltered: number;
  onPrev: () => void;
  onNext: () => void;
  onFilterByDiscipline: (discipline: string) => void;
  onEditCard: (card: ConundrumRecord) => void;
}

type DetailMode = "master-card" | "worksheet-packet";

export function CardDetailWorkspace({
  card,
  currentIndex,
  totalFiltered,
  onPrev,
  onNext,
  onFilterByDiscipline,
  onEditCard,
}: CardDetailWorkspaceProps) {
  const [mode, setMode] = useState<DetailMode>("master-card");
  const theme = getThemeStyle(card.category);

  return (
    <article className="print-full space-y-5">
      {/* Compact Sticky Workspace Mode Bar (Screen Only) */}
      <div className="no-print rounded-2xl border border-slate-200 bg-white p-3.5 sm:px-5 flex flex-wrap items-center justify-between gap-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        {/* Two Main Modes Switcher */}
        <div
          role="tablist"
          aria-label="Conundrum detail workspace modes"
          className="inline-flex rounded-xl bg-slate-100 p-1 gap-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "master-card"}
            onClick={() => setMode("master-card")}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer ${
              mode === "master-card"
                ? "bg-white text-slate-950 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            <span>Master Card View</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={mode === "worksheet-packet"}
            onClick={() => setMode("worksheet-packet")}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer ${
              mode === "worksheet-packet"
                ? "bg-white text-slate-950 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>10-Page A4 Worksheet Packet</span>
          </button>
        </div>

        {/* Selected Card Indicator + Edit + Prev/Next */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEditCard(card)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-950 hover:border-slate-300 transition cursor-pointer"
          >
            <PencilLine className="h-3.5 w-3.5" />
            <span>Edit Conundrum</span>
          </button>

          <span
            className={`hidden sm:inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${theme.dotColor}`} />
            <span className="font-mono">{card.cardId}</span>
          </span>

          <span className="text-xs text-slate-500 tabular-nums">
            {currentIndex + 1} / {totalFiltered}
          </span>

          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              onClick={onPrev}
              disabled={totalFiltered <= 1}
              aria-label="Previous conundrum card"
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={totalFiltered <= 1}
              aria-label="Next conundrum card"
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Mode Content */}
      {mode === "master-card" ? (
        <MasterCardPrintView
          card={card}
          onFilterByDiscipline={onFilterByDiscipline}
        />
      ) : (
        <WorksheetPacketView card={card} onEditCard={onEditCard} />
      )}
    </article>
  );
}
