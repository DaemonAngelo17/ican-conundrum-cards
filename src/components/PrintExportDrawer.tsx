"use client";

import { useEffect } from "react";
import {
  AlertTriangle,
  Check,
  Download,
  FileText,
  KeyRound,
  LayoutList,
  Minimize2,
  Printer,
  ShieldCheck,
  X,
} from "lucide-react";
import type { ConundrumRecord } from "@/types/conundrum";
import { buildPdfFilename } from "@/lib/print-utils";

export type PacketPageNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type WritingLayoutMode = "lines" | "compact";

export const ALL_PACKET_PAGES: PacketPageNumber[] = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
];
export const TEACHER_KEY_PAGES: PacketPageNumber[] = [9, 10];

export interface PacketPageMeta {
  num: PacketPageNumber;
  short: string;
  title: string;
  subtitle: string;
  isTeacherKey?: boolean;
}

export const PACKET_PAGES: PacketPageMeta[] = [
  {
    num: 1,
    short: "P1",
    title: "Level 1 · Novice",
    subtitle: "Story passage, Vocab 1–3, Q1–Q4, Drawing & Civic Activity + Check-In",
  },
  {
    num: 2,
    short: "P2",
    title: "Level 2 · Beginner",
    subtitle: "Briefing passage, Vocab 1–4 + Vocab in Action, Q1–Q4, Civic Action Lab",
  },
  {
    num: 3,
    short: "P3",
    title: "Level 3 · Competent",
    subtitle: "Systems briefing, Vocab 1–4, Q1–Q5 Analytical/Math, Civic Policy Lab",
  },
  {
    num: 4,
    short: "P4",
    title: "Level 4 · Proficient",
    subtitle: "Executive case brief, Vocab 1–4, Q1–Q5 Capstone Inquiry, Policy Prototype",
  },
  {
    num: 5,
    short: "P5",
    title: "Level 5 · Expert",
    subtitle: "Research symposium dossier, Frontier Frameworks, Q1–Q5 Stress-Test & Defense",
  },
  {
    num: 6,
    short: "P6",
    title: "Shared Conundrum Blueprint",
    subtitle: "Objective, 5-Pillar planning matrix & Deliverables checklist",
  },
  {
    num: 7,
    short: "P7",
    title: "Conundrum Synthesis",
    subtitle: "Science hypothesis, Civic impact blueprint & Trade-off matrix",
  },
  {
    num: 8,
    short: "P8",
    title: "Teamwork, Civic Ethics & Reflection",
    subtitle: "Ethical deliberation, Team roles & Individual journal",
  },
  {
    num: 9,
    short: "P9",
    title: "Teacher Answer Key (Part 1: Novice, Beginner & Competent)",
    subtitle: "Detailed Q&A keys + activity checkpoints for Levels 1–3",
    isTeacherKey: true,
  },
  {
    num: 10,
    short: "P10",
    title: "Teacher Answer Key (Part 2: Proficient, Expert & Rubric)",
    subtitle: "Detailed Q&A keys for Levels 4–5 + 4-level standardized grading rubric",
    isTeacherKey: true,
  },
];

export interface PrintPreset {
  id: string;
  label: string;
  description: string;
  pages: PacketPageNumber[];
  teacherOnly?: boolean;
}

export const PRINT_PRESETS: PrintPreset[] = [
  {
    id: "all-10",
    label: "All 10 Pages",
    description: "Complete master packet (P1–P10)",
    pages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
  {
    id: "novice-bundle",
    label: "Novice + Blueprint",
    description: "Student packet · P1, P6, P7, P8 (no key)",
    pages: [1, 6, 7, 8],
  },
  {
    id: "beginner-bundle",
    label: "Beginner + Blueprint",
    description: "Student packet · P2, P6, P7, P8 (no key)",
    pages: [2, 6, 7, 8],
  },
  {
    id: "competent-bundle",
    label: "Competent + Blueprint",
    description: "Student packet · P3, P6, P7, P8 (no key)",
    pages: [3, 6, 7, 8],
  },
  {
    id: "proficient-bundle",
    label: "Proficient + Blueprint",
    description: "Student packet · P4, P6, P7, P8 (no key)",
    pages: [4, 6, 7, 8],
  },
  {
    id: "expert-bundle",
    label: "Expert + Blueprint",
    description: "Student packet · P5, P6, P7, P8 (no key)",
    pages: [5, 6, 7, 8],
  },
  {
    id: "teacher-key",
    label: "Teacher Answer Key & Rubric (2 Pages)",
    description: "Facilitator copy · P9 & P10 only",
    pages: [9, 10],
    teacherOnly: true,
  },
];

interface PrintExportDrawerProps {
  open: boolean;
  onClose: () => void;
  card: ConundrumRecord;
  selectedPages: PacketPageNumber[];
  onChangeSelectedPages: (pages: PacketPageNumber[]) => void;
  layoutMode: WritingLayoutMode;
  onChangeLayoutMode: (mode: WritingLayoutMode) => void;
  onDownloadPdf: () => void;
}

export function PrintExportDrawer({
  open,
  onClose,
  card,
  selectedPages,
  onChangeSelectedPages,
  layoutMode,
  onChangeLayoutMode,
  onDownloadPdf,
}: PrintExportDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const hasStudentPages = selectedPages.some((p) => p >= 1 && p <= 8);
  const hasTeacherKey = selectedPages.some((p) => p === 9 || p === 10);
  const potentialKeyLeak = hasStudentPages && hasTeacherKey;
  const pdfFilename = buildPdfFilename(card, "A4");

  const togglePage = (num: PacketPageNumber) => {
    if (selectedPages.includes(num)) {
      onChangeSelectedPages(selectedPages.filter((p) => p !== num));
    } else {
      onChangeSelectedPages([...selectedPages, num].sort((a, b) => a - b));
    }
  };

  const isPresetActive = (preset: PrintPreset) =>
    preset.pages.length === selectedPages.length &&
    preset.pages.every((p, idx) => selectedPages[idx] === p);

  return (
    <div
      className="no-print fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Download and print A4 PDF options"
    >
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] transition-opacity"
      />

      <div className="relative z-10 w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col">
        <div className="px-5 py-4 border-b border-slate-200 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Printer className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-950">
                Download / Print A4 Packet
              </h2>
              <p className="text-xs text-slate-500">
                {card.cardId} · {card.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close print drawer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 workspace-scroll">
          {/* Quick Presets */}
          <section className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Quick Presets (Novice → Expert)
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {PRINT_PRESETS.map((preset) => {
                const active = isPresetActive(preset);
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onChangeSelectedPages(preset.pages)}
                    className={`w-full text-left rounded-xl border px-3 py-2 transition flex items-center justify-between gap-2 cursor-pointer ${
                      active
                        ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                        : "bg-slate-50/70 border-slate-200 text-slate-800 hover:bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        {preset.teacherOnly && (
                          <KeyRound className="h-3.5 w-3.5 shrink-0" />
                        )}
                        <span>{preset.label}</span>
                      </div>
                      <div
                        className={`text-[11px] mt-0.5 ${
                          active ? "text-slate-300" : "text-slate-500"
                        }`}
                      >
                        {preset.description}
                      </div>
                    </div>
                    {active && <Check className="h-4 w-4 shrink-0 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Accidental Answer-Key Leak Warning */}
          {potentialKeyLeak ? (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0 text-xs text-amber-950">
                <div className="font-bold">Answer Key Included with Student Pages</div>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-snug">
                  Teacher Answer Key pages (P9–P10) are checked alongside student pages. Remove them before printing student handouts.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    onChangeSelectedPages(
                      selectedPages.filter((p) => p !== 9 && p !== 10)
                    )
                  }
                  className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-amber-900 px-2 py-1 text-[11px] font-semibold text-white hover:bg-amber-800 transition cursor-pointer"
                >
                  Exclude Keys (P9–P10)
                </button>
              </div>
            </div>
          ) : hasStudentPages && !hasTeacherKey ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-2 flex items-center gap-2 text-xs text-emerald-900">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Student-safe selection — Teacher Keys (P9–P10) are excluded.</span>
            </div>
          ) : null}

          {/* Individual Page Checkboxes */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Select A4 Pages ({selectedPages.length} of 10)
              </span>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => onChangeSelectedPages(ALL_PACKET_PAGES)}
                  className="font-semibold text-slate-700 hover:text-slate-950 underline cursor-pointer"
                >
                  All
                </button>
                <span className="text-slate-300">·</span>
                <button
                  type="button"
                  onClick={() => onChangeSelectedPages([])}
                  className="font-semibold text-slate-500 hover:text-slate-900 underline cursor-pointer"
                >
                  None
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              {PACKET_PAGES.map((page) => {
                const checked = selectedPages.includes(page.num);
                return (
                  <label
                    key={page.num}
                    className={`flex items-start gap-3 rounded-xl border p-2.5 cursor-pointer transition ${
                      checked
                        ? page.isTeacherKey
                          ? "bg-emerald-50/70 border-emerald-300"
                          : "bg-blue-50/40 border-blue-200"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePage(page.num)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-slate-900 cursor-pointer"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-white">
                          {page.short}
                        </span>
                        <span className="text-xs font-semibold text-slate-900 truncate">
                          {page.title}
                        </span>
                        {page.isTeacherKey && (
                          <span className="ml-auto shrink-0 rounded bg-emerald-700 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                            Teacher Only
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        {page.subtitle}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>

          {/* Answer Lines vs. Compact View Toggle */}
          <section className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Worksheet Spacing Mode
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onChangeLayoutMode("lines")}
                className={`rounded-xl border p-3 text-left transition cursor-pointer ${
                  layoutMode === "lines"
                    ? "bg-slate-900 border-slate-900 text-white"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <LayoutList className="h-3.5 w-3.5" />
                  <span>Blank Answer Lines</span>
                </div>
                <p
                  className={`text-[10.5px] mt-1 leading-snug ${
                    layoutMode === "lines" ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  Ruled writing spaces for printed student worksheets.
                </p>
              </button>

              <button
                type="button"
                onClick={() => onChangeLayoutMode("compact")}
                className={`rounded-xl border p-3 text-left transition cursor-pointer ${
                  layoutMode === "compact"
                    ? "bg-slate-900 border-slate-900 text-white"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <Minimize2 className="h-3.5 w-3.5" />
                  <span>Compact View</span>
                </div>
                <p
                  className={`text-[10.5px] mt-1 leading-snug ${
                    layoutMode === "compact" ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  Condensed layout for digital review or dense handouts.
                </p>
              </button>
            </div>
          </section>

          {/* Auto-Formatted Filename Preview */}
          <section className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <FileText className="h-3.5 w-3.5" />
              <span>Automatic PDF Filename</span>
            </div>
            <div className="font-mono text-[11px] font-semibold text-slate-900 break-all">
              {pdfFilename}
            </div>
          </section>
        </div>

        <div className="px-5 py-4 border-t border-slate-200 bg-slate-50/80 space-y-2">
          <button
            type="button"
            disabled={selectedPages.length === 0}
            onClick={onDownloadPdf}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-40 shadow-sm transition cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>
              Download PDF ({selectedPages.length}{" "}
              {selectedPages.length === 1 ? "A4 Page" : "A4 Pages"})
            </span>
          </button>
          <p className="text-[10.5px] text-slate-500 text-center leading-snug">
            Uses native vector A4 Print-to-PDF (12mm margins). Choose{" "}
            <strong className="text-slate-700">Save as PDF</strong> with{" "}
            <strong className="text-slate-700">Background graphics</strong> enabled.
          </p>
        </div>
      </div>
    </div>
  );
}
