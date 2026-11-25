import { CANONICAL_THEMES, type CanonicalTheme } from "@/types/conundrum";

export interface ThemeStyle {
  name: CanonicalTheme;
  shortName: string;
  accentHex: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  pillActiveBg: string;
  pillActiveText: string;
  dotColor: string;
  surfaceTint: string;
  ringColor: string;
}

export const THEME_STYLES: Record<CanonicalTheme, ThemeStyle> = {
  "Sustainability & Environment": {
    name: "Sustainability & Environment",
    shortName: "Sustainability",
    accentHex: "#059669",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-800",
    badgeBorder: "border-emerald-200",
    pillActiveBg: "bg-emerald-700",
    pillActiveText: "text-white",
    dotColor: "bg-emerald-500",
    surfaceTint: "from-emerald-50/90 to-teal-50/40",
    ringColor: "ring-emerald-500/25",
  },
  "History & Culture": {
    name: "History & Culture",
    shortName: "History & Culture",
    accentHex: "#b45309",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-800",
    badgeBorder: "border-amber-200",
    pillActiveBg: "bg-amber-700",
    pillActiveText: "text-white",
    dotColor: "bg-amber-500",
    surfaceTint: "from-amber-50/90 to-orange-50/40",
    ringColor: "ring-amber-500/25",
  },
  "Science & Space": {
    name: "Science & Space",
    shortName: "Science & Space",
    accentHex: "#1d4ed8",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-800",
    badgeBorder: "border-blue-200",
    pillActiveBg: "bg-blue-700",
    pillActiveText: "text-white",
    dotColor: "bg-blue-500",
    surfaceTint: "from-blue-50/90 to-sky-50/40",
    ringColor: "ring-blue-500/25",
  },
  "Technology & AI": {
    name: "Technology & AI",
    shortName: "Technology & AI",
    accentHex: "#4f46e5",
    badgeBg: "bg-indigo-50",
    badgeText: "text-indigo-800",
    badgeBorder: "border-indigo-200",
    pillActiveBg: "bg-indigo-700",
    pillActiveText: "text-white",
    dotColor: "bg-indigo-500",
    surfaceTint: "from-indigo-50/90 to-violet-50/40",
    ringColor: "ring-indigo-500/25",
  },
  "Society & Global Issues": {
    name: "Society & Global Issues",
    shortName: "Society & Global",
    accentHex: "#be123c",
    badgeBg: "bg-rose-50",
    badgeText: "text-rose-800",
    badgeBorder: "border-rose-200",
    pillActiveBg: "bg-rose-700",
    pillActiveText: "text-white",
    dotColor: "bg-rose-500",
    surfaceTint: "from-rose-50/90 to-pink-50/40",
    ringColor: "ring-rose-500/25",
  },
  "Philosophy & Religion": {
    name: "Philosophy & Religion",
    shortName: "Philosophy",
    accentHex: "#7e22ce",
    badgeBg: "bg-purple-50",
    badgeText: "text-purple-800",
    badgeBorder: "border-purple-200",
    pillActiveBg: "bg-purple-700",
    pillActiveText: "text-white",
    dotColor: "bg-purple-500",
    surfaceTint: "from-purple-50/90 to-fuchsia-50/40",
    ringColor: "ring-purple-500/25",
  },
};

const FALLBACK_STYLE: ThemeStyle = {
  name: "Science & Space",
  shortName: "General",
  accentHex: "#475569",
  badgeBg: "bg-slate-100",
  badgeText: "text-slate-700",
  badgeBorder: "border-slate-200",
  pillActiveBg: "bg-slate-800",
  pillActiveText: "text-white",
  dotColor: "bg-slate-500",
  surfaceTint: "from-slate-50 to-slate-100/40",
  ringColor: "ring-slate-500/20",
};

export function getThemeStyle(category: string): ThemeStyle {
  const normalized = category.trim();
  if (normalized in THEME_STYLES) {
    return THEME_STYLES[normalized as CanonicalTheme];
  }
  const matched = CANONICAL_THEMES.find(
    (t) => t.toLowerCase() === normalized.toLowerCase()
  );
  return matched ? THEME_STYLES[matched] : FALLBACK_STYLE;
}
