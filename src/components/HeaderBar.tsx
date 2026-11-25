"use client";

import {
  BookOpenCheck,
  Cpu,
  ExternalLink,
  Globe2,
  Landmark,
  Layers,
  Leaf,
  Plus,
  RefreshCw,
  Rocket,
  Scale,
  Settings2,
  Sparkles,
} from "lucide-react";
import { CANONICAL_THEMES, type CanonicalTheme, type DatasetMeta } from "@/types/conundrum";
import { THEME_STYLES } from "@/lib/themes";

interface HeaderBarProps {
  meta: DatasetMeta;
  selectedTheme: string;
  onSelectTheme: (theme: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenSetup: () => void;
  onAddNew: () => void;
  batchCount: number;
  onOpenBatchBuilder: () => void;
}

const THEME_ICONS: Record<CanonicalTheme, React.ComponentType<{ className?: string }>> = {
  "Sustainability & Environment": Leaf,
  "History & Culture": Landmark,
  "Science & Space": Rocket,
  "Technology & AI": Cpu,
  "Society & Global Issues": Globe2,
  "Philosophy & Religion": Scale,
};

export function HeaderBar({
  meta,
  selectedTheme,
  onSelectTheme,
  onRefresh,
  isRefreshing,
  onOpenSetup,
  onAddNew,
  batchCount,
  onOpenBatchBuilder,
}: HeaderBarProps) {
  const isLive = meta.source !== "fallback-snapshot";

  return (
    <header className="no-print bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Row: Brand, Active Count, Connection Actions */}
        <div className="py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm shrink-0">
              <BookOpenCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                  ICAN Conundrum Cards
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                  <Sparkles className="h-3 w-3 text-emerald-600" />
                  {meta.activeCount} Active
                  {meta.totalCount !== meta.activeCount && (
                    <span className="text-emerald-600/80 font-normal">
                      / {meta.totalCount} Total
                    </span>
                  )}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Interdisciplinary Challenge Catalog &amp; 5-Level Mastery Worksheets (Novice · Beginner · Competent · Proficient · Expert)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={onAddNew}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 shadow-2xs transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add New Conundrum</span>
            </button>

            <button
              type="button"
              onClick={onOpenBatchBuilder}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                batchCount > 0
                  ? "bg-blue-50 border-blue-300 text-blue-900 hover:bg-blue-100"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
              title="Open Batch Packet Builder to export multiple cards together"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Batch Builder</span>
              {batchCount > 0 && (
                <span className="rounded-full bg-blue-700 text-white px-1.5 py-0.2 text-[10px] font-bold tabular-nums">
                  {batchCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenSetup}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition cursor-pointer ${
                isLive
                  ? "bg-emerald-50/80 border-emerald-200 text-emerald-800 hover:bg-emerald-100/70"
                  : "bg-amber-50/80 border-amber-200 text-amber-900 hover:bg-amber-100/70"
              }`}
              title="View or configure Google Sheets live connection"
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isLive ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              <span className="hidden md:inline">{meta.sourceLabel}</span>
              <span className="md:hidden">{isLive ? "Live Sheet" : "Snapshot"}</span>
              <Settings2 className="h-3.5 w-3.5 opacity-75 ml-0.5" />
            </button>

            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition disabled:opacity-50 cursor-pointer"
              title="Reload data from Google Sheets"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Sync</span>
            </button>

            <a
              href={meta.spreadsheetUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition"
            >
              <span>Google Sheet</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-80" />
            </a>
          </div>
        </div>

        {/* Warning banner if live sync fell back */}
        {meta.warning && (
          <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 flex items-center justify-between gap-2">
            <span>{meta.warning}</span>
            <button
              type="button"
              onClick={onOpenSetup}
              className="font-semibold underline underline-offset-2 shrink-0 cursor-pointer"
            >
              Setup guide
            </button>
          </div>
        )}

        {/* Quick Stats Strip across the 6 Themes */}
        <div className="pb-3 pt-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {CANONICAL_THEMES.map((theme) => {
              const style = THEME_STYLES[theme];
              const Icon = THEME_ICONS[theme];
              const count = meta.themeCounts[theme] ?? 0;
              const isSelected = selectedTheme === theme;

              return (
                <button
                  key={theme}
                  type="button"
                  onClick={() => onSelectTheme(isSelected ? "ALL" : theme)}
                  className={`group flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition cursor-pointer ${
                    isSelected
                      ? `${style.badgeBg} ${style.badgeBorder} ring-2 ${style.ringColor} shadow-xs`
                      : "bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 transition ${
                        isSelected
                          ? `${style.pillActiveBg} text-white`
                          : `${style.badgeBg} ${style.badgeText}`
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span
                      className={`text-xs font-medium truncate ${
                        isSelected ? style.badgeText : "text-slate-700"
                      }`}
                      title={theme}
                    >
                      {style.shortName}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-bold tabular-nums px-1.5 py-0.5 rounded-md shrink-0 ${
                      isSelected
                        ? "bg-white/80 text-slate-900"
                        : "bg-white text-slate-600 border border-slate-200/70"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
