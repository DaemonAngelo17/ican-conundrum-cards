"use client";

import {
  Award,
  CheckCircle2,
  Compass,
  Printer,
  StickyNote,
  Target,
} from "lucide-react";
import type { ConundrumRecord } from "@/types/conundrum";
import { buildPdfFilename, triggerNamedPrint } from "@/lib/print-utils";
import {
  CustomConundrumEmblem,
  getCardVisualIdentity,
  HeaderBackdropPattern,
} from "@/lib/card-artwork";

interface MasterCardSheetProps {
  card: ConundrumRecord;
  onFilterByDiscipline?: (discipline: string) => void;
  isLastInDocument?: boolean;
}

export function MasterCardSheet({
  card,
  onFilterByDiscipline,
  isLastInDocument = true,
}: MasterCardSheetProps) {
  const visual = getCardVisualIdentity(card);

  return (
    <div
      className={`a5-master-card ${
        isLastInDocument ? "a4-last-selected" : ""
      } rounded-2xl border border-slate-200/90 bg-white shadow-md overflow-hidden flex flex-col justify-between prose-safe`}
    >
      {/* =================================================================== */}
      {/* TOPIC-THEMED HEADER BANNER                                          */}
      {/* =================================================================== */}
      <div
        className={`relative bg-gradient-to-r ${visual.headerBg} text-white px-5 py-3.5 border-b ${visual.headerBorder} overflow-hidden`}
      >
        <HeaderBackdropPattern
          patternType={visual.patternType}
          stroke={visual.patternStroke}
        />

        <div className="relative z-10 flex items-start gap-3.5">
          {/* Custom Per-Conundrum Vector Emblem */}
          <div
            className={`h-14 w-14 rounded-xl border ${visual.emblemBg} ${visual.emblemBorder} ${visual.emblemColor} flex items-center justify-center shrink-0 backdrop-blur-[1px] shadow-inner p-1`}
            title={`${card.cardId} Custom Emblem · ${visual.motifLabel}`}
          >
            <CustomConundrumEmblem card={card} className="h-12 w-12" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Top Metadata Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-white text-slate-950 tracking-wide shadow-2xs">
                  {card.cardId}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${visual.pillBg} ${visual.pillText}`}
                >
                  {card.category}
                </span>
                <span className="inline-flex items-center rounded-full bg-white/15 border border-white/20 px-2 py-0.5 text-[10px] font-medium text-white/90">
                  {visual.motifLabel}
                </span>
              </div>

              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 border border-emerald-300/35 px-2 py-0.5 text-[10px] font-semibold text-emerald-100">
                <CheckCircle2 className="h-2.5 w-2.5" />
                {card.status}
              </span>
            </div>

            {/* Card Title */}
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white leading-tight">
              {card.title}
            </h2>

            {/* Compact Objective Strip */}
            <p className="mt-1 text-[11.5px] text-white/90 leading-snug whitespace-pre-line">
              <strong className="uppercase tracking-wider text-[9.5px] text-white/75 mr-1.5">
                Objective:
              </strong>
              {card.objective}
            </p>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* A5 LANDSCAPE 2-COLUMN BODY                                          */}
      {/* =================================================================== */}
      <div className="flex-1 px-5 py-3.5 grid grid-cols-1 md:grid-cols-12 print:grid-cols-12 gap-3.5 items-stretch">
        {/* Left Column (7 cols): 5 Structured Numbered Requirements */}
        <section className="md:col-span-7 print:col-span-7 flex flex-col">
          <div className="flex items-center gap-1.5 mb-2">
            <span
              className={`h-5 w-5 rounded-md ${visual.numBadgeBg} text-white flex items-center justify-center`}
            >
              <Target className="h-3 w-3" />
            </span>
            <h3 className="text-[10.5px] font-bold uppercase tracking-widest text-slate-800">
              5 Interdisciplinary Requirements
            </h3>
          </div>

          <div className="space-y-1.5 flex-1">
            {card.requirements.map((req) => (
              <div
                key={req.index}
                className="print-avoid-break rounded-lg border border-slate-200/90 bg-slate-50/75 px-2.5 py-1.5 flex items-start gap-2"
              >
                <span
                  className={`font-mono text-[10px] font-bold h-5 w-5 rounded ${visual.numBadgeBg} text-white flex items-center justify-center shrink-0 mt-0.5`}
                >
                  {req.index}
                </span>
                <div className="min-w-0 text-[10.5px] leading-snug text-slate-700">
                  {req.discipline && (
                    <strong className="text-slate-950 font-bold mr-1">
                      {req.discipline}:
                    </strong>
                  )}
                  <span className="whitespace-pre-line">{req.text}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right Column (5 cols): Deliverables + Disciplines + Notes */}
        <div className="md:col-span-5 print:col-span-5 flex flex-col gap-2.5">
          {/* Expected Deliverables */}
          <section
            className={`print-avoid-break rounded-xl border ${visual.deliverableBorder} ${visual.deliverableBg} p-3 flex-1`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Award className={`h-3.5 w-3.5 ${visual.deliverableTitle}`} />
              <h3
                className={`text-[10px] font-bold uppercase tracking-widest ${visual.deliverableTitle}`}
              >
                Expected Deliverables
              </h3>
            </div>
            <p className="text-[11px] text-slate-800 leading-snug whitespace-pre-line">
              {card.deliverables || "No deliverables specified."}
            </p>
          </section>

          {/* Focus Areas / Disciplines */}
          <section className="print-avoid-break rounded-xl border border-slate-200 bg-white p-2.5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Compass className="h-3 w-3 text-slate-600" />
              <h3 className="text-[9.5px] font-bold uppercase tracking-widest text-slate-700">
                Focus Areas / Disciplines
              </h3>
            </div>
            {card.disciplines.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {card.disciplines.map((d) =>
                  onFilterByDiscipline ? (
                    <button
                      key={d}
                      type="button"
                      onClick={() => onFilterByDiscipline(d)}
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${visual.pillBg} ${visual.pillText} hover:brightness-95 transition cursor-pointer`}
                    >
                      {d}
                    </button>
                  ) : (
                    <span
                      key={d}
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${visual.pillBg} ${visual.pillText}`}
                    >
                      {d}
                    </span>
                  )
                )}
              </div>
            ) : (
              <p className="text-[10px] text-slate-400">None specified</p>
            )}
          </section>

          {/* Notes */}
          <section className="print-avoid-break rounded-xl border border-slate-200 bg-slate-50/50 p-2.5">
            <div className="flex items-center gap-1.5 mb-0.5">
              <StickyNote className="h-3 w-3 text-amber-600" />
              <h3 className="text-[9.5px] font-bold uppercase tracking-widest text-slate-700">
                Educator Notes
              </h3>
            </div>
            <p className="text-[10px] text-slate-600 leading-snug whitespace-pre-line">
              {card.notes || "No additional notes recorded for this card."}
            </p>
          </section>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 5-TIER MASTERY PATHWAY STRIP (LEVEL DETAILS ON CARD)                */}
      {/* =================================================================== */}
      <div className="border-t border-slate-200 bg-slate-50/60 px-5 py-2">
        <div className="grid grid-cols-5 gap-1.5">
          {[
            { tier: "L1 · Novice", focus: "Story, 3 Vocab & Draw", dot: "bg-emerald-600" },
            { tier: "L2 · Beginner", focus: "Inquiry & Civic Lab", dot: "bg-blue-600" },
            { tier: "L3 · Competent", focus: "Systems, Math & Policy", dot: "bg-indigo-600" },
            { tier: "L4 · Proficient", focus: "Executive Capstone", dot: "bg-violet-600" },
            { tier: "L5 · Expert", focus: "Symposium & Stress-Test", dot: "bg-rose-700" },
          ].map((lvl) => (
            <div
              key={lvl.tier}
              className="rounded-md border border-slate-200/90 bg-white px-2 py-1"
            >
              <div className="flex items-center gap-1 text-[9px] font-bold text-slate-900">
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${lvl.dot}`} />
                <span className="truncate">{lvl.tier}</span>
              </div>
              <div className="text-[8.5px] text-slate-500 truncate mt-0.5">
                {lvl.focus}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =================================================================== */}
      {/* CRISP CARD FOOTER                                                   */}
      {/* =================================================================== */}
      <footer className="border-t border-slate-200 bg-slate-50/80 px-5 py-1.5 flex items-center justify-between text-[9.5px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${visual.accentBar}`} />
          <span>
            ICAN Conundrum Cards ·{" "}
            <strong className="font-mono text-slate-700">{card.cardId}</strong>{" "}
            · {card.category}
          </span>
        </span>
        <span className="font-mono font-semibold text-slate-600">
          Master Card · A5 Landscape (210 × 148 mm)
        </span>
      </footer>
    </div>
  );
}

interface MasterCardPrintViewProps {
  card: ConundrumRecord;
  onFilterByDiscipline: (discipline: string) => void;
}

export function MasterCardPrintView({
  card,
  onFilterByDiscipline,
}: MasterCardPrintViewProps) {
  const handlePrintCard = () => {
    const filename = buildPdfFilename(card, "A5-Landscape");
    triggerNamedPrint(filename);
  };

  return (
    <div className="space-y-4">
      {/* Action Bar (Screen Only) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-2xs">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Master Conundrum Card (A5 Landscape · 210 × 148 mm)
          </h3>
          <p className="text-xs text-slate-500">
            Topic-themed landscape reference card sized for crisp single-card A5
            printing or PDF export.
          </p>
        </div>
        <button
          type="button"
          onClick={handlePrintCard}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-xs transition cursor-pointer"
        >
          <Printer className="h-4 w-4" />
          <span>Print / Export Card (A5)</span>
        </button>
      </div>

      <MasterCardSheet
        card={card}
        onFilterByDiscipline={onFilterByDiscipline}
        isLastInDocument
      />
    </div>
  );
}
