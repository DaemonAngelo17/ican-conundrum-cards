"use client";

import { useState } from "react";
import {
  BookOpen,
  CheckSquare,
  Download,
  FileText,
  FlaskConical,
  KeyRound,
  Layers,
  LayoutList,
  Minimize2,
  Pencil,
  PencilLine,
  Scale,
  SlidersHorizontal,
  Sparkles,
  Users,
} from "lucide-react";
import type { ConundrumRecord, WorksheetQuestion } from "@/types/conundrum";
import { getThemeStyle } from "@/lib/themes";
import { CustomConundrumEmblem } from "@/lib/card-artwork";
import { buildPdfFilename, triggerNamedPrint } from "@/lib/print-utils";
import {
  ALL_PACKET_PAGES,
  PACKET_PAGES,
  PrintExportDrawer,
  type PacketPageNumber,
  type WritingLayoutMode,
} from "./PrintExportDrawer";

type ScreenFocusPage = "selected" | PacketPageNumber;

function paragraphs(text: string): string[] {
  return text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

interface ParsedAnswerItem {
  id: string;
  label?: string;
  answer: string;
}

function parseAnswerKeyEntries(
  rawKey: string,
  questions: WorksheetQuestion[]
): ParsedAnswerItem[] {
  const lines = paragraphs(rawKey);
  const parsed: ParsedAnswerItem[] = [];

  for (const line of lines) {
    const match = /^\[?(Q\d+)\]?[:.\-\s]+(.+)$/i.exec(line);
    if (match) {
      const id = match[1].toUpperCase();
      const qMeta = questions.find((q) => q.id.toUpperCase() === id);
      parsed.push({
        id,
        label: qMeta?.label,
        answer: match[2].trim(),
      });
    } else if (parsed.length > 0) {
      parsed[parsed.length - 1].answer += ` ${line}`;
    } else {
      parsed.push({ id: "Key", answer: line });
    }
  }
  return parsed;
}

function DetailedBandAnswerKey({
  title,
  badgeClass,
  borderClass,
  bgClass,
  rawQuestionsKey,
  questions,
  rawActivityKey,
  activityTitle,
  extraCheckNote,
}: {
  title: string;
  badgeClass: string;
  borderClass: string;
  bgClass: string;
  rawQuestionsKey: string;
  questions: WorksheetQuestion[];
  rawActivityKey: string;
  activityTitle: string;
  extraCheckNote?: string;
}) {
  const entries = parseAnswerKeyEntries(rawQuestionsKey, questions);

  return (
    <div
      className={`print-avoid-break rounded-xl border ${borderClass} ${bgClass} p-3.5 space-y-2`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider ${badgeClass}`}
          >
            <KeyRound className="h-3 w-3" />
            {title}
          </span>
        </div>
        <span className="text-[10.5px] font-medium text-slate-500">
          {entries.length} Question Keys + {activityTitle}
        </span>
      </div>

      <div className="rounded-lg bg-white border border-slate-200/90 divide-y divide-slate-100">
        {entries.map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            className="px-3 py-1.5 flex items-start gap-2.5 text-xs leading-snug"
          >
            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-white shrink-0 mt-0.5">
              {item.id}
            </span>
            <div className="min-w-0 flex-1 text-slate-800">
              {item.label && (
                <strong className="text-slate-950 mr-1.5">
                  {item.label}:
                </strong>
              )}
              <span className="whitespace-pre-line">{item.answer}</span>
            </div>
          </div>
        ))}
        {extraCheckNote && (
          <div className="px-3 py-1.5 flex items-start gap-2.5 text-[11.5px] leading-snug bg-slate-50/70">
            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-600 text-white shrink-0 mt-0.5">
              Check
            </span>
            <div className="min-w-0 flex-1 text-slate-700">{extraCheckNote}</div>
          </div>
        )}
      </div>

      {rawActivityKey && (
        <div className="rounded-lg bg-white border border-slate-200/90 px-3 py-2 text-xs leading-snug text-slate-800">
          <span className="font-bold uppercase tracking-wider text-[10px] text-slate-600 mr-2">
            {activityTitle} Key:
          </span>
          <span className="whitespace-pre-line">
            {rawActivityKey.replace(/^\[(Activity|Rubric|Capstone Rubric)\]:\s*/i, "")}
          </span>
        </div>
      )}
    </div>
  );
}

function StudentHeader({
  card,
  badgeText,
  accentColorClass,
  mode = "student",
}: {
  card: ConundrumRecord;
  badgeText: string;
  accentColorClass: string;
  mode?: "student" | "team" | "teacher";
}) {
  return (
    <div className="print-avoid-break border-b-2 border-slate-900 pb-2.5 mb-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="h-10 w-10 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 p-0.5">
            <CustomConundrumEmblem
              card={card}
              className="h-9 w-9"
              showStamp={false}
            />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-white">
                {card.cardId}
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${accentColorClass}`}
              >
                {badgeText}
              </span>
              <span className="text-[10px] font-medium text-slate-500">
                {card.category}
              </span>
            </div>
            <h2 className="text-[16.5px] font-extrabold text-slate-950 tracking-tight leading-snug">
              {card.title}
            </h2>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
            ICAN Conundrum Packet
          </div>
          {mode === "student" && (
            <div className="mt-1 inline-flex items-center gap-1.5 rounded border border-slate-300 px-2 py-0.5 text-[10.5px] font-semibold text-slate-700">
              <span>Score:</span>
              <span className="w-7 border-b border-slate-400 inline-block" />
              <span>/</span>
              <span className="w-5 border-b border-slate-400 inline-block" />
            </div>
          )}
        </div>
      </div>

      {mode === "student" && (
        <div className="mt-2 grid grid-cols-12 gap-3 text-[10.5px] text-slate-700">
          <div className="col-span-6 flex items-end gap-1.5">
            <span className="font-semibold shrink-0">Name:</span>
            <span className="flex-1 border-b border-slate-400 h-3.5" />
          </div>
          <div className="col-span-3 flex items-end gap-1.5">
            <span className="font-semibold shrink-0">Class:</span>
            <span className="flex-1 border-b border-slate-400 h-3.5" />
          </div>
          <div className="col-span-3 flex items-end gap-1.5">
            <span className="font-semibold shrink-0">Date:</span>
            <span className="flex-1 border-b border-slate-400 h-3.5" />
          </div>
        </div>
      )}

      {mode === "team" && (
        <div className="mt-2 grid grid-cols-12 gap-3 text-[10.5px] text-slate-700">
          <div className="col-span-5 flex items-end gap-1.5">
            <span className="font-semibold shrink-0">Team / Scholar:</span>
            <span className="flex-1 border-b border-slate-400 h-3.5" />
          </div>
          <div className="col-span-4 flex items-end gap-1.5">
            <span className="font-semibold shrink-0">Grade / Section:</span>
            <span className="flex-1 border-b border-slate-400 h-3.5" />
          </div>
          <div className="col-span-3 flex items-end gap-1.5">
            <span className="font-semibold shrink-0">Date:</span>
            <span className="flex-1 border-b border-slate-400 h-3.5" />
          </div>
        </div>
      )}
    </div>
  );
}

function SheetFooter({
  card,
  pageNumber,
  sectionLabel,
}: {
  card: ConundrumRecord;
  pageNumber: number;
  sectionLabel: string;
}) {
  return (
    <footer className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
      <span>
        ICAN Conundrum Cards ·{" "}
        <strong className="font-mono text-slate-700">{card.cardId}</strong> ·{" "}
        {sectionLabel}
      </span>
      <span className="font-mono font-semibold text-slate-700">
        Page {pageNumber} of 10
      </span>
    </footer>
  );
}

export interface WorksheetPagesProps {
  card: ConundrumRecord;
  selectedPages: PacketPageNumber[];
  screenFocus?: ScreenFocusPage;
  layoutMode: WritingLayoutMode;
  isLastCardInBatch?: boolean;
}

export function WorksheetPages({
  card,
  selectedPages,
  screenFocus = "selected",
  layoutMode,
  isLastCardInBatch = true,
}: WorksheetPagesProps) {
  const ws = card.worksheet;
  if (!ws) return null;

  const theme = getThemeStyle(card.category);
  const isCompact = layoutMode === "compact";

  const activePrintPages =
    screenFocus === "selected" ? selectedPages : [screenFocus];
  const lastPrintedPage =
    isLastCardInBatch && activePrintPages.length > 0
      ? Math.max(...activePrintPages)
      : null;

  const getPageClasses = (pageNum: PacketPageNumber): string => {
    const isIncludedInPrint = activePrintPages.includes(pageNum);
    const isVisibleOnScreen =
      screenFocus === "selected"
        ? selectedPages.includes(pageNum)
        : screenFocus === pageNum;

    const classes = [
      "a4-sheet",
      "prose-safe",
      isCompact ? "a4-compact p-5 sm:p-6" : "p-6 sm:p-7",
    ];

    if (!isVisibleOnScreen) classes.push("hidden");
    if (!isIncludedInPrint) classes.push("print-hidden-page");
    if (lastPrintedPage === pageNum) classes.push("a4-last-selected");

    return classes.join(" ");
  };

  return (
    <div className="space-y-8 print:space-y-0">
      {/* ===================================================================== */}
      {/* PAGE 1 — LEVEL 1 · NOVICE                                             */}
      {/* ===================================================================== */}
      <section
        className={getPageClasses(1)}
        aria-label={`${card.cardId} Page 1: Level 1 · Novice`}
      >
        <div className={isCompact ? "space-y-2" : "space-y-3"}>
          <StudentHeader
            card={card}
            badgeText="Level 1 · Novice"
            accentColorClass="bg-emerald-100 text-emerald-900"
          />

          <div className="print-avoid-break rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              <BookOpen className="h-3.5 w-3.5 text-emerald-700" />
              <span>Read Together — Story &amp; Discovery</span>
            </div>
            <div className="space-y-1.5 text-[13px] leading-relaxed text-slate-800 whitespace-pre-line">
              {paragraphs(ws.lower.passage).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>

          <div className="print-avoid-break">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              <span>Word Bank (Vocabulary 1–3)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {ws.lower.vocab.map((v, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-indigo-200/80 bg-indigo-50/40 p-2.5 min-w-0"
                >
                  <div className="text-xs font-bold text-indigo-950">
                    {i + 1}. {v.term}
                  </div>
                  <p className="text-[11px] text-slate-700 mt-0.5 leading-snug whitespace-pre-line">
                    {v.definition}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
              Think &amp; Answer (Q1–Q{ws.lower.questions.length})
            </div>
            {ws.lower.questions.map((q) => (
              <div
                key={q.id}
                className="print-avoid-break rounded-lg border border-slate-200 px-3 py-2 space-y-1"
              >
                <div className="text-xs text-slate-900 leading-snug">
                  <span className="font-mono font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded text-[10px] mr-1.5">
                    {q.id}
                  </span>
                  <span className="font-semibold text-emerald-800 mr-1.5">
                    {q.label}:
                  </span>
                  <span className="whitespace-pre-line">{q.prompt}</span>
                </div>
                {!isCompact && <div className="writing-lines h-11 w-full" />}
              </div>
            ))}
          </div>

          <div className="print-avoid-break rounded-xl border-2 border-amber-300 bg-amber-50/35 p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-900">
              <Pencil className="h-3.5 w-3.5" />
              <span>{ws.lower.activityTitle}</span>
            </div>
            <p className="text-[11px] text-slate-800 leading-snug whitespace-pre-line">
              {ws.lower.activityPrompt}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div
                className={`sm:col-span-7 rounded-lg border-2 border-dashed border-slate-300 bg-white p-2 flex flex-col justify-between ${
                  isCompact ? "h-18" : "h-28"
                }`}
              >
                <span className="text-[9.5px] font-semibold uppercase tracking-wider text-slate-400">
                  Drawing / Design Box
                </span>
                <span className="text-[9px] text-slate-300 text-right">
                  Label your key parts!
                </span>
              </div>
              <div className="sm:col-span-5 rounded-lg border border-slate-300 bg-white p-2 flex flex-col">
                <span className="text-[9.5px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Community Rule / Explanation
                </span>
                {!isCompact ? (
                  <div className="writing-lines flex-1 min-h-[78px]" />
                ) : (
                  <div className="h-10 border-t border-slate-200 mt-1" />
                )}
              </div>
            </div>
          </div>

          {/* Primary Self-Check Strip */}
          <div className="print-avoid-break rounded-lg border border-emerald-200 bg-emerald-50/40 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-[10px] text-emerald-950">
            <span className="font-bold uppercase tracking-wider">My Check-In:</span>
            {[
              "I read the story carefully",
              "I used at least 1 new word",
              "I checked my math answer",
              "I labeled my drawing",
            ].map((item) => (
              <span key={item} className="inline-flex items-center gap-1">
                <span className="h-3 w-3 rounded border border-emerald-600 bg-white inline-block" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <SheetFooter
          card={card}
          pageNumber={1}
          sectionLabel="Level 1 · Novice"
        />
      </section>

      {/* ===================================================================== */}
      {/* PAGE 2 — LEVEL 2 · BEGINNER                                           */}
      {/* ===================================================================== */}
      <section
        className={getPageClasses(2)}
        aria-label={`${card.cardId} Page 2: Level 2 · Beginner`}
      >
        <div className={isCompact ? "space-y-2" : "space-y-2.5"}>
          <StudentHeader
            card={card}
            badgeText="Level 2 · Beginner"
            accentColorClass="bg-blue-100 text-blue-900"
          />

          <div className="print-avoid-break rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              <BookOpen className="h-3.5 w-3.5 text-blue-700" />
              <span>Briefing Passage</span>
            </div>
            <div className="space-y-1.5 text-[12.5px] leading-relaxed text-slate-800 whitespace-pre-line">
              {paragraphs(ws.middle.passage).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>

          <div className="print-avoid-break space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
              Core Vocabulary (1–4) &amp; Vocabulary in Action
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {ws.middle.vocab.map((v, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-blue-200/80 bg-blue-50/35 px-2.5 py-2 min-w-0"
                >
                  <span className="text-xs font-bold text-blue-950">
                    {i + 1}. {v.term}:{" "}
                  </span>
                  <span className="text-[11px] text-slate-700 leading-snug whitespace-pre-line">
                    {v.definition}
                  </span>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-blue-200 bg-white px-3 py-2">
              <div className="text-[11px] font-semibold text-blue-900 mb-0.5">
                Vocabulary in Action: Write one complete sentence connecting any two vocabulary words above to {card.title}.
              </div>
              {!isCompact && <div className="writing-lines h-7 w-full" />}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
              Inquiry &amp; Problem-Solving (Q1–Q4)
            </div>
            {ws.middle.questions.map((q) => (
              <div
                key={q.id}
                className="print-avoid-break rounded-lg border border-slate-200 px-3 py-2 space-y-1"
              >
                <div className="text-xs text-slate-900 leading-snug">
                  <span className="font-mono font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded text-[10px] mr-1.5">
                    {q.id}
                  </span>
                  <span className="font-semibold text-blue-800 mr-1.5">
                    {q.label}:
                  </span>
                  <span className="whitespace-pre-line">{q.prompt}</span>
                </div>
                {!isCompact && <div className="writing-lines h-11 w-full" />}
              </div>
            ))}
          </div>

          <div className="print-avoid-break rounded-xl border-2 border-amber-300 bg-amber-50/35 p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-900">
              <FlaskConical className="h-3.5 w-3.5" />
              <span>{ws.middle.activityTitle}</span>
            </div>
            <p className="text-[11px] text-slate-800 leading-snug whitespace-pre-line">
              {ws.middle.activityPrompt}
            </p>
            {!isCompact && (
              <div className="rounded-lg border border-slate-300 bg-white p-2">
                <div className="writing-lines h-20 w-full" />
              </div>
            )}
          </div>
        </div>

        <SheetFooter
          card={card}
          pageNumber={2}
          sectionLabel="Level 2 · Beginner"
        />
      </section>

      {/* ===================================================================== */}
      {/* PAGE 3 — LEVEL 3 · COMPETENT                                          */}
      {/* ===================================================================== */}
      <section
        className={getPageClasses(3)}
        aria-label={`${card.cardId} Page 3: Level 3 · Competent`}
      >
        <div className={isCompact ? "space-y-2" : "space-y-2.5"}>
          <StudentHeader
            card={card}
            badgeText="Level 3 · Competent"
            accentColorClass="bg-indigo-100 text-indigo-900"
          />

          <div className="print-avoid-break rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              <BookOpen className="h-3.5 w-3.5 text-indigo-700" />
              <span>Systems &amp; Policy Briefing</span>
            </div>
            <div className="space-y-1 text-xs leading-relaxed text-slate-800 whitespace-pre-line">
              {paragraphs(ws.upper.passage).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>

          <div className="print-avoid-break">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Academic &amp; Technical Vocabulary (1–4)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {ws.upper.vocab.map((v, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-indigo-200/80 bg-indigo-50/35 px-2.5 py-1.5 min-w-0"
                >
                  <span className="text-[11.5px] font-bold text-indigo-950">
                    {i + 1}. {v.term}:{" "}
                  </span>
                  <span className="text-[11px] text-slate-700 leading-snug whitespace-pre-line">
                    {v.definition}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
              Analytical &amp; Quantitative Questions (Q1–Q5)
            </div>
            {ws.upper.questions.map((q) => (
              <div
                key={q.id}
                className="print-avoid-break rounded-lg border border-slate-200 px-3 py-1.5 space-y-1"
              >
                <div className="text-[11.5px] text-slate-900 leading-snug">
                  <span className="font-mono font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded text-[10px] mr-1.5">
                    {q.id}
                  </span>
                  <span className="font-semibold text-indigo-800 mr-1.5">
                    {q.label}:
                  </span>
                  <span className="whitespace-pre-line">{q.prompt}</span>
                </div>
                {!isCompact && <div className="writing-lines h-10 w-full" />}
              </div>
            ))}
          </div>

          <div className="print-avoid-break rounded-xl border-2 border-amber-300 bg-amber-50/35 p-2.5 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-900">
              <FlaskConical className="h-3.5 w-3.5" />
              <span>{ws.upper.activityTitle}</span>
            </div>
            <p className="text-[11px] text-slate-800 leading-snug whitespace-pre-line">
              {ws.upper.activityPrompt}
            </p>
            {!isCompact && (
              <div className="rounded-lg border border-slate-300 bg-white p-2">
                <div className="writing-lines h-16 w-full" />
              </div>
            )}
          </div>
        </div>

        <SheetFooter
          card={card}
          pageNumber={3}
          sectionLabel="Level 3 · Competent"
        />
      </section>

      {/* ===================================================================== */}
      {/* PAGE 4 — LEVEL 4 · PROFICIENT                                         */}
      {/* ===================================================================== */}
      <section
        className={getPageClasses(4)}
        aria-label={`${card.cardId} Page 4: Level 4 · Proficient`}
      >
        <div className={isCompact ? "space-y-2" : "space-y-2.5"}>
          <StudentHeader
            card={card}
            badgeText="Level 4 · Proficient"
            accentColorClass="bg-violet-100 text-violet-950"
          />

          <div className="print-avoid-break rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              <BookOpen className="h-3.5 w-3.5 text-violet-700" />
              <span>Executive Case Brief &amp; Systems Context</span>
            </div>
            <div className="space-y-1 text-[11.5px] leading-relaxed text-slate-800 whitespace-pre-line">
              {paragraphs(ws.senior.passage).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>

          <div className="print-avoid-break">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Senior Research Terminology (1–4)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {ws.senior.vocab.map((v, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-violet-200/80 bg-violet-50/35 px-2.5 py-1.5 min-w-0"
                >
                  <span className="text-[11.5px] font-bold text-violet-950">
                    {i + 1}. {v.term}:{" "}
                  </span>
                  <span className="text-[11px] text-slate-700 leading-snug whitespace-pre-line">
                    {v.definition}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
              Capstone Systems &amp; Policy Inquiry (Q1–Q5)
            </div>
            {ws.senior.questions.map((q) => (
              <div
                key={q.id}
                className="print-avoid-break rounded-lg border border-slate-200 px-3 py-1.5 space-y-1"
              >
                <div className="text-[11.5px] text-slate-900 leading-snug">
                  <span className="font-mono font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded text-[10px] mr-1.5">
                    {q.id}
                  </span>
                  <span className="font-semibold text-violet-800 mr-1.5">
                    {q.label}:
                  </span>
                  <span className="whitespace-pre-line">{q.prompt}</span>
                </div>
                {!isCompact && <div className="writing-lines h-9 w-full" />}
              </div>
            ))}
          </div>

          <div className="print-avoid-break rounded-xl border-2 border-violet-300 bg-violet-50/30 p-2.5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-violet-950">
              <FlaskConical className="h-3.5 w-3.5" />
              <span>{ws.senior.activityTitle}</span>
            </div>
            <p className="text-[10.5px] text-slate-800 leading-snug whitespace-pre-line">
              {ws.senior.activityPrompt}
            </p>
            {!isCompact && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="rounded-lg border border-slate-300 bg-white p-2">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                    Part A · Multi-Pillar Solution Roadmap
                  </div>
                  <div className="writing-lines h-14 w-full" />
                </div>
                <div className="rounded-lg border border-slate-300 bg-white p-2">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                    Part B · Counter-Argument &amp; Risk Mitigation
                  </div>
                  <div className="writing-lines h-14 w-full" />
                </div>
              </div>
            )}
          </div>
        </div>

        <SheetFooter
          card={card}
          pageNumber={4}
          sectionLabel="Level 4 · Proficient"
        />
      </section>

      {/* ===================================================================== */}
      {/* PAGE 5 — LEVEL 5 · EXPERT (RESEARCH SYMPOSIUM)                        */}
      {/* ===================================================================== */}
      <section
        className={getPageClasses(5)}
        aria-label={`${card.cardId} Page 5: Level 5 · Expert`}
      >
        <div className={isCompact ? "space-y-2" : "space-y-2.5"}>
          <StudentHeader
            card={card}
            badgeText="Level 5 · Expert"
            accentColorClass="bg-rose-100 text-rose-950"
          />

          <div className="print-avoid-break rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              <BookOpen className="h-3.5 w-3.5 text-rose-700" />
              <span>Research Symposium Dossier &amp; Frontier Context</span>
            </div>
            <div className="space-y-1 text-[11.5px] leading-relaxed text-slate-800 whitespace-pre-line">
              {paragraphs(ws.expert.passage).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>

          <div className="print-avoid-break">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Expert Analytical Frameworks (1–4)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {ws.expert.vocab.map((v, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-rose-200/80 bg-rose-50/35 px-2.5 py-1.5 min-w-0"
                >
                  <span className="text-[11.5px] font-bold text-rose-950">
                    {i + 1}. {v.term}:{" "}
                  </span>
                  <span className="text-[11px] text-slate-700 leading-snug whitespace-pre-line">
                    {v.definition}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
              Frontier Stress-Test &amp; Systems Inquiry (Q1–Q5)
            </div>
            {ws.expert.questions.map((q) => (
              <div
                key={q.id}
                className="print-avoid-break rounded-lg border border-slate-200 px-3 py-1.5 space-y-1"
              >
                <div className="text-[11.5px] text-slate-900 leading-snug">
                  <span className="font-mono font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded text-[10px] mr-1.5">
                    {q.id}
                  </span>
                  <span className="font-semibold text-rose-800 mr-1.5">
                    {q.label}:
                  </span>
                  <span className="whitespace-pre-line">{q.prompt}</span>
                </div>
                {!isCompact && <div className="writing-lines h-9 w-full" />}
              </div>
            ))}
          </div>

          <div className="print-avoid-break rounded-xl border-2 border-rose-300 bg-rose-50/30 p-2.5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-rose-950">
              <FlaskConical className="h-3.5 w-3.5" />
              <span>{ws.expert.activityTitle}</span>
            </div>
            <p className="text-[11px] text-slate-800 leading-snug whitespace-pre-line">
              {ws.expert.activityPrompt}
            </p>
            {!isCompact && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="rounded-lg border border-slate-300 bg-white p-2">
                  <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                    Part A · Whitepaper Thesis &amp; Sensitivity Model
                  </div>
                  <div className="writing-lines h-14 w-full" />
                </div>
                <div className="rounded-lg border border-slate-300 bg-white p-2">
                  <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                    Part B · Adversarial Peer-Review Rebuttal
                  </div>
                  <div className="writing-lines h-14 w-full" />
                </div>
              </div>
            )}
          </div>
        </div>

        <SheetFooter
          card={card}
          pageNumber={5}
          sectionLabel="Level 5 · Expert"
        />
      </section>

      {/* ===================================================================== */}
      {/* PAGE 6 — SHARED CONUNDRUM BLUEPRINT                                   */}
      {/* ===================================================================== */}
      <section
        className={getPageClasses(6)}
        aria-label={`${card.cardId} Page 6: Shared Conundrum Blueprint`}
      >
        <div className={isCompact ? "space-y-3" : "space-y-4"}>
          <StudentHeader
            card={card}
            badgeText="Shared Conundrum Blueprint"
            accentColorClass={`${theme.badgeBg} ${theme.badgeText}`}
            mode="team"
          />

          <div className="print-avoid-break rounded-xl border border-slate-300 bg-slate-50 px-4 py-3">
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Mission Objective
            </div>
            <p className="text-sm font-semibold text-slate-900 mt-1 leading-relaxed whitespace-pre-line">
              {card.objective}
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                5-Pillar Integration &amp; Team Planning Matrix
              </span>
              <span className="text-[11px] text-slate-500">
                Connect each requirement to your team&apos;s design, evidence, and tools
              </span>
            </div>

            {card.requirements.map((req) => (
              <div
                key={req.index}
                className="print-avoid-break rounded-xl border border-slate-300 overflow-hidden grid grid-cols-1 sm:grid-cols-12"
              >
                <div className="sm:col-span-5 bg-slate-50/95 p-3 border-b sm:border-b-0 sm:border-r border-slate-200 flex flex-col justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-mono text-[10.5px] font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                        Pillar {req.index}
                      </span>
                      {req.discipline && (
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                          {req.discipline}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                      {req.text}
                    </p>
                  </div>
                  <div className="text-[10.5px] text-slate-500 border-t border-slate-200/80 pt-1.5">
                    Lead Member: _______________________
                  </div>
                </div>
                <div className="sm:col-span-7 bg-white p-3 flex flex-col">
                  <span className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Our Plan, Evidence &amp; Integration Notes
                  </span>
                  {!isCompact ? (
                    <div className="writing-lines flex-1 min-h-[84px]" />
                  ) : (
                    <div className="h-10 border-t border-slate-200 mt-1" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="print-avoid-break rounded-xl border-2 border-emerald-200 bg-emerald-50/40 p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-900">
              <CheckSquare className="h-4 w-4" />
              <span>Deliverables, Milestones &amp; Presentation Plan</span>
            </div>
            <p className="text-xs sm:text-[13px] text-slate-800 leading-relaxed whitespace-pre-line">
              {card.deliverables}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs text-slate-700">
              {[
                "Primary artifact drafted",
                "Visuals / data verified",
                "Presentation rehearsed",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-lg border border-emerald-200 bg-white px-3 py-2 flex items-center gap-2"
                >
                  <span className="h-4 w-4 rounded border border-slate-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            {!isCompact && (
              <div className="rounded-lg border border-emerald-200/90 bg-white p-2.5">
                <div className="text-[10.5px] font-semibold uppercase tracking-wider text-emerald-900/80 mb-1">
                  Key Presentation Message / Audience Hook
                </div>
                <div className="writing-lines h-12 w-full" />
              </div>
            )}
          </div>
        </div>

        <SheetFooter
          card={card}
          pageNumber={6}
          sectionLabel="Shared Conundrum Blueprint"
        />
      </section>

      {/* ===================================================================== */}
      {/* PAGE 7 — CONUNDRUM SYNTHESIS                                          */}
      {/* ===================================================================== */}
      <section
        className={getPageClasses(7)}
        aria-label={`${card.cardId} Page 7: Conundrum Synthesis`}
      >
        <div className={isCompact ? "space-y-3" : "space-y-4"}>
          <StudentHeader
            card={card}
            badgeText="Conundrum Synthesis"
            accentColorClass="bg-sky-100 text-sky-900"
            mode="team"
          />

          <div className="print-avoid-break rounded-xl border border-slate-300 p-4 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <h3 className="text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-900">
                Part I — Team Science &amp; Systems Hypothesis Specification
              </h3>
              <span className="text-[11px] font-mono text-slate-500">
                Evidence &amp; Modeling
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              State your core scientific or technical hypothesis for{" "}
              <strong>{card.title}</strong>, define key variables or constraints,
              and explain how your team will test or verify feasibility.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Core Hypothesis &amp; System Mechanism
                </div>
                <div className={isCompact ? "h-14" : "writing-lines h-36"} />
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Key Metrics, Variables &amp; Verification Method
                </div>
                <div className={isCompact ? "h-14" : "writing-lines h-36"} />
              </div>
            </div>
          </div>

          <div className="print-avoid-break rounded-xl border border-slate-300 p-4 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <h3 className="text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-900">
                Part II — Civic &amp; Community Impact Blueprint
              </h3>
              <span className="text-[11px] font-mono text-slate-500">
                Governance &amp; Adoption
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Outline who your solution serves, what community policies, budgets,
              or partnerships are required, and how access remains fair across all
              groups.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Target Stakeholders &amp; Equity Safeguards
                </div>
                <div className={isCompact ? "h-14" : "writing-lines h-36"} />
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Policy, Budget &amp; Implementation Steps
                </div>
                <div className={isCompact ? "h-14" : "writing-lines h-36"} />
              </div>
            </div>
          </div>

          <div className="print-avoid-break rounded-xl border border-slate-300 p-4 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <h3 className="text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-900">
                Part III — Cross-Disciplinary Trade-Off &amp; Impact Evaluation
              </h3>
              <span className="text-[11px] font-mono text-slate-500">
                Systems Balance
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Evaluate tensions across your focus areas (
              {card.disciplines.join(", ") || "all disciplines"}). Identify 3 key
              trade-offs and how your design balances them.
            </p>
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-800 text-[10.5px] uppercase tracking-wider">
                  <th className="border border-slate-300 px-2.5 py-2 text-left w-1/3">
                    Trade-Off / Constraint
                  </th>
                  <th className="border border-slate-300 px-2.5 py-2 text-left w-1/3">
                    Competing Disciplines / Risks
                  </th>
                  <th className="border border-slate-300 px-2.5 py-2 text-left w-1/3">
                    Mitigation &amp; Final Decision
                  </th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map((row) => (
                  <tr key={row}>
                    <td
                      className={`border border-slate-300 align-top p-2 text-xs font-semibold text-slate-400 ${
                        isCompact ? "h-10" : "h-20"
                      }`}
                    >
                      {row}.
                    </td>
                    <td className="border border-slate-300 align-top p-2" />
                    <td className="border border-slate-300 align-top p-2" />
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="rounded-lg border border-sky-200 bg-sky-50/40 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-800">
              <span className="font-bold text-sky-950">
                Overall Feasibility Confidence:
              </span>
              <div className="flex items-center gap-3">
                {["1 · High Risk", "2 · Challenging", "3 · Viable", "4 · Strong", "5 · Ready to Launch"].map(
                  (lvl) => (
                    <span key={lvl} className="inline-flex items-center gap-1 text-[11px]">
                      <span className="h-3.5 w-3.5 rounded-full border border-slate-400 bg-white inline-block" />
                      {lvl}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        <SheetFooter
          card={card}
          pageNumber={7}
          sectionLabel="Conundrum Synthesis"
        />
      </section>

      {/* ===================================================================== */}
      {/* PAGE 8 — TEAMWORK, CIVIC ETHICS BRIEF & SCHOLAR REFLECTION            */}
      {/* ===================================================================== */}
      <section
        className={getPageClasses(8)}
        aria-label={`${card.cardId} Page 8: Teamwork, Civic Ethics Brief and Scholar Reflection`}
      >
        <div className={isCompact ? "space-y-3" : "space-y-4"}>
          <StudentHeader
            card={card}
            badgeText="Teamwork, Civic Ethics & Scholar Reflection"
            accentColorClass="bg-purple-100 text-purple-900"
            mode="team"
          />

          <div className="print-avoid-break rounded-xl border border-purple-200 bg-purple-50/30 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs sm:text-[13px] font-bold uppercase tracking-wider text-purple-950">
              <Scale className="h-4 w-4 text-purple-700" />
              <span>Section A — Multi-Stakeholder Ethical Deliberation</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Examine the ethical consequences of your solution for{" "}
              <strong>{card.title}</strong> from multiple community viewpoints.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                "Who benefits most from our solution?",
                "Who might be left out or negatively impacted?",
                "What ethical rule or safeguard protects fairness?",
              ].map((prompt, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-purple-200 bg-white p-3"
                >
                  <div className="text-[11.5px] font-bold text-slate-900 mb-1.5 leading-snug">
                    {idx + 1}. {prompt}
                  </div>
                  <div className={isCompact ? "h-14" : "writing-lines h-32"} />
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-purple-200 bg-white px-3 py-2 text-xs text-slate-800">
              <span className="font-bold text-purple-950">
                Our Team&apos;s #1 Ethical Principle:{" "}
              </span>
              <span className="inline-block w-full border-b border-slate-300 mt-3" />
            </div>
          </div>

          <div className="print-avoid-break rounded-xl border border-slate-300 p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-900">
              <Users className="h-4 w-4 text-slate-700" />
              <span>Section B — Teamwork &amp; Civic Values Commitment</span>
            </div>
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-[10.5px] uppercase tracking-wider text-slate-800">
                  <th className="border border-slate-300 px-2.5 py-1.5 text-left w-1/3">
                    Team Member
                  </th>
                  <th className="border border-slate-300 px-2.5 py-1.5 text-left w-1/3">
                    Primary Role / Pillar Owned
                  </th>
                  <th className="border border-slate-300 px-2.5 py-1.5 text-left w-1/3">
                    Civic Value Practiced
                  </th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4].map((r) => (
                  <tr key={r}>
                    <td
                      className={`border border-slate-300 px-2.5 text-xs text-slate-400 ${
                        isCompact ? "h-7" : "h-9"
                      }`}
                    >
                      {r}.
                    </td>
                    <td className="border border-slate-300 px-2.5" />
                    <td className="border border-slate-300 px-2.5" />
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-700">
              <span className="font-bold text-slate-900">Team Check-In:</span>
              {[
                "Active Listening",
                "Shared Evidence",
                "Respectful Debate",
                "Equal Contribution",
              ].map((val) => (
                <span key={val} className="inline-flex items-center gap-1.5">
                  <span className="h-3.5 w-3.5 rounded border border-slate-400 inline-block" />
                  {val}
                </span>
              ))}
            </div>
          </div>

          <div className="print-avoid-break rounded-xl border border-slate-300 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-900">
              <FileText className="h-4 w-4 text-slate-700" />
              <span>
                Section C — Individual &amp; Community Reflection Journal
              </span>
            </div>
            <div className="space-y-3">
              {[
                "1. What new connection between science, society, or ethics surprised you most?",
                "2. How does this conundrum connect to a real issue in your school or local community?",
                "3. What is one concrete action or habit you can commit to after completing this project?",
              ].map((q) => (
                <div key={q}>
                  <div className="text-xs font-semibold text-slate-900 mb-1">
                    {q}
                  </div>
                  {!isCompact ? (
                    <div className="writing-lines h-20" />
                  ) : (
                    <div className="h-8 border-b border-slate-200" />
                  )}
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
              <span>Scholar Signature: ______________________________</span>
              <span>Date: __________________</span>
            </div>
          </div>
        </div>

        <SheetFooter
          card={card}
          pageNumber={8}
          sectionLabel="Teamwork, Civic Ethics Brief & Scholar Reflection"
        />
      </section>

      {/* ===================================================================== */}
      {/* PAGE 9 — TEACHER ANSWER KEY (PART 1 OF 2: NOVICE, BEGINNER, COMPETENT)*/}
      {/* ===================================================================== */}
      <section
        className={getPageClasses(9)}
        aria-label={`${card.cardId} Page 9: Teacher Answer Key Part 1 (Novice, Beginner & Competent)`}
      >
        <div className="space-y-3">
          <StudentHeader
            card={card}
            badgeText="Teacher Copy · Answer Key (Part 1 of 2)"
            accentColorClass="bg-emerald-700 text-white"
            mode="teacher"
          />

          {/* Metadata Summary Strip */}
          <div className="print-avoid-break rounded-xl border border-slate-300 bg-slate-50 p-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Card ID
              </div>
              <div className="font-mono font-bold text-slate-900">
                {card.cardId}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Category / Theme
              </div>
              <div className="font-semibold text-slate-900">
                {card.category}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Status
              </div>
              <div className="font-semibold text-emerald-700">
                {card.status}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Focus Areas / Disciplines
              </div>
              <div className="text-slate-800 leading-snug">
                {card.disciplinesRaw || "—"}
              </div>
            </div>
          </div>

          <DetailedBandAnswerKey
            title="Level 1 · Novice — Detailed Answer Key"
            badgeClass="bg-emerald-700 text-white"
            borderClass="border-emerald-200"
            bgClass="bg-emerald-50/40"
            rawQuestionsKey={ws.lower.answerKeyQuestions}
            questions={ws.lower.questions}
            rawActivityKey={ws.lower.answerKeyActivity}
            activityTitle={ws.lower.activityTitle}
            extraCheckNote={`Q4 My Idea & Connection: Accept any realistic action tied to ${card.title} naming who helps and what they do.`}
          />

          <DetailedBandAnswerKey
            title="Level 2 · Beginner — Detailed Answer Key"
            badgeClass="bg-blue-700 text-white"
            borderClass="border-blue-200"
            bgClass="bg-blue-50/40"
            rawQuestionsKey={ws.middle.answerKeyQuestions}
            questions={ws.middle.questions}
            rawActivityKey={ws.middle.answerKeyActivity}
            activityTitle={ws.middle.activityTitle}
            extraCheckNote="Vocabulary in Action: Full credit if the sentence accurately uses at least 2 core terms in context."
          />

          <DetailedBandAnswerKey
            title="Level 3 · Competent — Detailed Answer Key"
            badgeClass="bg-indigo-700 text-white"
            borderClass="border-indigo-200"
            bgClass="bg-indigo-50/40"
            rawQuestionsKey={ws.upper.answerKeyQuestions}
            questions={ws.upper.questions}
            rawActivityKey={ws.upper.answerKeyActivity}
            activityTitle={ws.upper.activityTitle}
          />
        </div>

        <SheetFooter
          card={card}
          pageNumber={9}
          sectionLabel="Teacher Answer Key (Part 1: Novice, Beginner & Competent)"
        />
      </section>

      {/* ===================================================================== */}
      {/* PAGE 10 — TEACHER ANSWER KEY (PART 2: PROFICIENT, EXPERT) & RUBRIC    */}
      {/* ===================================================================== */}
      <section
        className={getPageClasses(10)}
        aria-label={`${card.cardId} Page 10: Teacher Answer Key Part 2 and Standardized Grading Rubric`}
      >
        <div className="space-y-3">
          <StudentHeader
            card={card}
            badgeText="Teacher Copy · Answer Key (Part 2 of 2) & Grading Rubric"
            accentColorClass="bg-emerald-700 text-white"
            mode="teacher"
          />

          <DetailedBandAnswerKey
            title="Level 4 · Proficient — Capstone Answer Key"
            badgeClass="bg-violet-800 text-white"
            borderClass="border-violet-200"
            bgClass="bg-violet-50/40"
            rawQuestionsKey={ws.senior.answerKeyQuestions}
            questions={ws.senior.questions}
            rawActivityKey={ws.senior.answerKeyActivity}
            activityTitle={ws.senior.activityTitle}
          />

          <DetailedBandAnswerKey
            title="Level 5 · Expert — Symposium Answer Key"
            badgeClass="bg-rose-800 text-white"
            borderClass="border-rose-200"
            bgClass="bg-rose-50/40"
            rawQuestionsKey={ws.expert.answerKeyQuestions}
            questions={ws.expert.questions}
            rawActivityKey={ws.expert.answerKeyActivity}
            activityTitle={ws.expert.activityTitle}
          />

          {/* Detailed 4-Level Analytic Grading Rubric (100 Points Total) */}
          <div className="print-avoid-break rounded-xl border-2 border-slate-300 bg-white p-3 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Standardized 4-Level Grading Rubric (100 Points · Inter-Grader Consistency)
              </h3>
              <span className="text-[10px] font-mono text-slate-500">
                4 Criteria × 25 pts each
              </span>
            </div>

            <table className="w-full border-collapse text-[10px] leading-snug">
              <thead>
                <tr className="bg-slate-900 text-white text-[9.5px] uppercase tracking-wider">
                  <th className="border border-slate-300 px-2 py-1.5 text-left w-[19%]">
                    Criterion (25 pts)
                  </th>
                  <th className="border border-slate-300 px-2 py-1.5 text-left w-[19%]">
                    Exemplary (23–25)
                  </th>
                  <th className="border border-slate-300 px-2 py-1.5 text-left w-[19%]">
                    Proficient (18–22)
                  </th>
                  <th className="border border-slate-300 px-2 py-1.5 text-left w-[19%]">
                    Developing (12–17)
                  </th>
                  <th className="border border-slate-300 px-2 py-1.5 text-left w-[16%]">
                    Emerging (0–11)
                  </th>
                  <th className="border border-slate-300 px-1.5 py-1.5 text-center w-[8%]">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    name: "1. Reading, Vocab & Math Accuracy (P1–P5)",
                    exemplary:
                      "All Qs accurate with clear evidence; domain vocab used precisely; math steps & units exact.",
                    proficient:
                      "Most Qs accurate; minor gaps in explanation; vocab & math mostly correct.",
                    developing:
                      "Partial comprehension; 1–2 missing/incorrect answers or unlabeled calculations.",
                    emerging:
                      "Incomplete responses; major factual or math misconceptions.",
                  },
                  {
                    name: "2. Activity / Civic / Policy / Symposium Lab",
                    exemplary:
                      "Thorough, practical, and directly solves the conundrum with specific evidence/rules.",
                    proficient:
                      "Clear and relevant plan/drawing with solid connection to the prompt.",
                    developing:
                      "Basic idea present but lacks key labels, steps, or clear feasibility.",
                    emerging:
                      "Off-topic, minimal effort, or missing core lab component.",
                  },
                  {
                    name: "3. 5-Pillar Blueprint & Synthesis (P6–P7)",
                    exemplary:
                      "All 5 pillars tightly integrated; falsifiable hypothesis, clear KPIs, and realistic trade-off mitigations.",
                    proficient:
                      "Covers 4–5 pillars well; coherent hypothesis and reasonable trade-off analysis.",
                    developing:
                      "Covers 2–3 pillars superficially; vague metrics or unbalanced trade-offs.",
                    emerging:
                      "Siloed or incomplete blueprint; missing synthesis parts.",
                  },
                  {
                    name: "4. Teamwork, Ethics & Reflection (P8)",
                    exemplary:
                      "Identifies vulnerable stakeholders & binding ethical rule; clear team roles; deep personal reflection.",
                    proficient:
                      "Thoughtful fairness analysis, balanced team roles, and clear community connection.",
                    developing:
                      "Surface-level ethical note; uneven role documentation or brief reflection.",
                    emerging:
                      "Missing ethical analysis, team accountability, or reflection journal.",
                  },
                ].map((row) => (
                  <tr key={row.name}>
                    <td className="border border-slate-300 px-2 py-1.5 font-bold text-slate-900 bg-slate-50/80 align-top">
                      {row.name}
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 text-slate-800 align-top">
                      {row.exemplary}
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 text-slate-800 align-top">
                      {row.proficient}
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 text-slate-700 align-top">
                      {row.developing}
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 text-slate-600 align-top">
                      {row.emerging}
                    </td>
                    <td className="border border-slate-300 px-1.5 py-1.5 text-center font-mono text-slate-500 align-middle">
                      __/25
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Final Score & Sign-Off Strip */}
            <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-800">
              <div className="flex items-center gap-3 flex-wrap">
                <strong className="text-slate-950">Total: ____ / 100</strong>
                <span className="text-slate-300">|</span>
                {[
                  "Exemplary (90–100)",
                  "Proficient (75–89)",
                  "Developing (60–74)",
                  "Emerging (<60)",
                ].map((tier) => (
                  <span key={tier} className="inline-flex items-center gap-1 text-[10px]">
                    <span className="h-3 w-3 rounded border border-slate-400 bg-white inline-block" />
                    {tier}
                  </span>
                ))}
              </div>
              <span className="text-[10.5px] text-slate-600">
                Checked by: ____________________
              </span>
            </div>
          </div>
        </div>

        <SheetFooter
          card={card}
          pageNumber={10}
          sectionLabel="Teacher Answer Key (Part 2: Proficient, Expert) & Standardized Rubric"
        />
      </section>
    </div>
  );
}

interface WorksheetPacketViewProps {
  card: ConundrumRecord;
  onEditCard?: (card: ConundrumRecord) => void;
}

export function WorksheetPacketView({
  card,
  onEditCard,
}: WorksheetPacketViewProps) {
  const [selectedPages, setSelectedPages] =
    useState<PacketPageNumber[]>(ALL_PACKET_PAGES);
  const [screenFocus, setScreenFocus] = useState<ScreenFocusPage>("selected");
  const [layoutMode, setLayoutMode] = useState<WritingLayoutMode>("lines");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isCompact = layoutMode === "compact";

  const handleDownloadPdf = () => {
    setDrawerOpen(false);
    const filename = buildPdfFilename(card, "A4");
    triggerNamedPrint(filename);
  };

  if (!card.worksheet) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center space-y-3">
        <Layers className="h-8 w-8 text-slate-300 mx-auto" />
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            No Worksheet Content Linked for {card.cardId}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Add Grades 1–3, 3–5, 6–7, and 8–10 content for {card.cardId} to
            unlock the full 8-page A4 packet.
          </p>
        </div>
        {onEditCard && (
          <button
            type="button"
            onClick={() => onEditCard(card)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <PencilLine className="h-3.5 w-3.5" />
            <span>Add Worksheet Content</span>
          </button>
        )}
      </div>
    );
  }

  const activePrintPages =
    screenFocus === "selected" ? selectedPages : [screenFocus];

  return (
    <div className="space-y-5">
      {/* Packet Control Bar (No-Print) */}
      <div className="no-print rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              10-Page A4 Worksheet Packet — {card.cardId}
            </h3>
            <p className="text-xs text-slate-500">
              {selectedPages.length} of 10 pages selected (Novice → Expert) ·{" "}
              {selectedPages.some((p) => p === 9 || p === 10)
                ? "Includes Teacher Key & Rubric (P9–P10)"
                : "Student-safe (Keys excluded)"}{" "}
              · {isCompact ? "Compact View" : "Blank Answer Lines"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setLayoutMode((m) => (m === "lines" ? "compact" : "lines"))
              }
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              {isCompact ? (
                <>
                  <Minimize2 className="h-3.5 w-3.5 text-slate-600" />
                  <span>Compact View</span>
                </>
              ) : (
                <>
                  <LayoutList className="h-3.5 w-3.5 text-slate-600" />
                  <span>Answer Lines</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition cursor-pointer"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Print Options ({selectedPages.length}/10)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={activePrintPages.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-40 shadow-xs transition cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Page Jump Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 workspace-scroll">
          <button
            type="button"
            onClick={() => setScreenFocus("selected")}
            className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
              screenFocus === "selected"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Selected ({selectedPages.length})
          </button>

          {PACKET_PAGES.map((p) => {
            const active = screenFocus === p.num;
            const inSelection = selectedPages.includes(p.num);
            const pillLabel =
              p.num === 1
                ? "P1 · Novice"
                : p.num === 2
                  ? "P2 · Beginner"
                  : p.num === 3
                    ? "P3 · Competent"
                    : p.num === 4
                      ? "P4 · Proficient"
                      : p.num === 5
                        ? "P5 · Expert"
                        : p.num === 6
                          ? "P6 · Blueprint"
                          : p.num === 7
                            ? "P7 · Synthesis"
                            : p.num === 8
                              ? "P8 · Ethics"
                              : p.num === 9
                                ? "P9 · Key 1"
                                : "P10 · Key 2 & Rubric";
            return (
              <button
                key={p.num}
                type="button"
                onClick={() => setScreenFocus(p.num)}
                title={p.title}
                className={`shrink-0 inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition cursor-pointer ${
                  active
                    ? "bg-blue-700 text-white"
                    : inSelection
                      ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      : "bg-slate-50 text-slate-400 border border-dashed border-slate-200 hover:text-slate-700"
                }`}
              >
                <span>{pillLabel}</span>
                {p.isTeacherKey && <KeyRound className="h-3 w-3 opacity-80" />}
              </button>
            );
          })}
        </div>
      </div>

      {screenFocus === "selected" && selectedPages.length === 0 && (
        <div className="no-print rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm font-semibold text-slate-800">
            No pages selected in your packet
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Open Print Options to choose a preset or select individual A4 pages.
          </p>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition cursor-pointer"
          >
            Open Print Options
          </button>
        </div>
      )}

      <WorksheetPages
        card={card}
        selectedPages={selectedPages}
        screenFocus={screenFocus}
        layoutMode={layoutMode}
        isLastCardInBatch
      />

      <PrintExportDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        card={card}
        selectedPages={selectedPages}
        onChangeSelectedPages={(pages) => {
          setSelectedPages(pages);
          setScreenFocus("selected");
        }}
        layoutMode={layoutMode}
        onChangeLayoutMode={setLayoutMode}
        onDownloadPdf={handleDownloadPdf}
      />
    </div>
  );
}
