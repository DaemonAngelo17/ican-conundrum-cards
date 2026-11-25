"use client";

import type { RefObject } from "react";
import { Filter, RotateCcw, Search, X } from "lucide-react";
import { CANONICAL_THEMES } from "@/types/conundrum";
import { THEME_STYLES } from "@/lib/themes";

interface FilterToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchInputRef?: RefObject<HTMLInputElement | null>;
  selectedTheme: string;
  onSelectTheme: (theme: string) => void;
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
  statuses: string[];
  themeCounts: Record<string, number>;
  totalCount: number;
  filteredCount: number;
  onResetFilters: () => void;
}

export function FilterToolbar({
  searchQuery,
  onSearchChange,
  searchInputRef,
  selectedTheme,
  onSelectTheme,
  selectedStatus,
  onSelectStatus,
  statuses,
  themeCounts,
  totalCount,
  filteredCount,
  onResetFilters,
}: FilterToolbarProps) {
  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedTheme !== "ALL" ||
    selectedStatus !== "ALL";

  return (
    <section
      aria-label="Search and filter conundrum cards"
      className="no-print bg-white/95 border-b border-slate-200/80"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-3">
        {/* Search Input + Status Filter Pills + Result Count */}
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1 max-w-2xl">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by Card ID (e.g. CON-012), title, keyword, or discipline..."
              aria-label="Search conundrum cards"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-14 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <kbd
                title="Press / to focus search"
                className="hidden sm:inline-flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 h-5 min-w-5 px-1.5 rounded border border-slate-200 bg-white text-[10px] font-mono font-semibold text-slate-400 pointer-events-none"
              >
                /
              </kbd>
            )}
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 mr-1">
              <Filter className="h-3.5 w-3.5" />
              Status:
            </span>
            <button
              type="button"
              onClick={() => onSelectStatus("ALL")}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                selectedStatus === "ALL"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              All
            </button>
            {statuses.map((status) => {
              const active = selectedStatus === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => onSelectStatus(active ? "ALL" : status)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                    active
                      ? "bg-emerald-700 text-white"
                      : "bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100"
                  }`}
                >
                  {status}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 md:ml-auto text-xs text-slate-500">
            <span className="tabular-nums font-medium">
              Showing{" "}
              <strong className="text-slate-900">{filteredCount}</strong> of{" "}
              {totalCount}
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-950 underline underline-offset-2 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Category / Theme Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 workspace-scroll">
          <button
            type="button"
            onClick={() => onSelectTheme("ALL")}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition cursor-pointer ${
              selectedTheme === "ALL"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200/80"
            }`}
          >
            All Themes ({totalCount})
          </button>

          {CANONICAL_THEMES.map((theme) => {
            const style = THEME_STYLES[theme];
            const active = selectedTheme === theme;
            const count = themeCounts[theme] ?? 0;

            return (
              <button
                key={theme}
                type="button"
                onClick={() => onSelectTheme(active ? "ALL" : theme)}
                className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition cursor-pointer ${
                  active
                    ? `${style.pillActiveBg} ${style.pillActiveText} border-transparent shadow-xs`
                    : `${style.badgeBg} ${style.badgeText} ${style.badgeBorder} hover:brightness-95`
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    active ? "bg-white" : style.dotColor
                  }`}
                />
                <span>{theme}</span>
                <span className={`tabular-nums ${active ? "opacity-85" : "opacity-70"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
