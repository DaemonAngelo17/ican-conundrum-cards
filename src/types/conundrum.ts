export const CANONICAL_THEMES = [
  "Sustainability & Environment",
  "History & Culture",
  "Science & Space",
  "Technology & AI",
  "Society & Global Issues",
  "Philosophy & Religion",
] as const;

export type CanonicalTheme = (typeof CANONICAL_THEMES)[number];

export type GradeBandLevel = "lower" | "middle" | "upper" | "senior" | "expert";

export interface VocabEntry {
  term: string;
  definition: string;
  raw: string;
}

export interface WorksheetQuestion {
  id: string;
  label: string;
  prompt: string;
}

export interface GradeBandContent {
  level: GradeBandLevel;
  title: string;
  shortLabel: string;
  gradeRange: string;
  passage: string;
  vocab: VocabEntry[];
  questions: WorksheetQuestion[];
  activityTitle: string;
  activityPrompt: string;
  answerKeyQuestions: string;
  answerKeyActivity: string;
}

export interface RequirementItem {
  index: number;
  discipline?: string;
  text: string;
  raw: string;
}

export interface WorksheetBundle {
  lower: GradeBandContent; // Level 1: Novice
  middle: GradeBandContent; // Level 2: Beginner
  upper: GradeBandContent; // Level 3: Competent
  senior: GradeBandContent; // Level 4: Proficient
  expert: GradeBandContent; // Level 5: Expert
}

export interface ConundrumRecord {
  cardId: string;
  title: string;
  category: string;
  objective: string;
  requirements: RequirementItem[];
  deliverables: string;
  disciplines: string[];
  disciplinesRaw: string;
  status: string;
  notes: string;
  worksheet: WorksheetBundle | null;
}

export type DataSourceMode =
  | "service-account"
  | "api-key"
  | "apps-script"
  | "fallback-snapshot";

export interface DatasetMeta {
  source: DataSourceMode;
  sourceLabel: string;
  spreadsheetId: string;
  spreadsheetUrl: string;
  fetchedAt: string;
  totalCount: number;
  activeCount: number;
  themeCounts: Record<string, number>;
  statuses: string[];
  warning?: string;
}

export interface ConundrumDatasetResponse {
  cards: ConundrumRecord[];
  meta: DatasetMeta;
}

export interface AdvancedBandFormFields {
  passage: string;
  vocab1: string;
  vocab2: string;
  vocab3: string;
  vocab4: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  activity: string;
  answerKeyQuestions: string;
  answerKeyActivity: string;
}

export interface ConundrumFormPayload {
  originalCardId?: string;
  cardId: string;
  title: string;
  category: string;
  status: string;
  objective: string;
  requirement1: string;
  requirement2: string;
  requirement3: string;
  requirement4: string;
  requirement5: string;
  deliverables: string;
  disciplines: string;
  notes: string;
  lower: {
    passage: string;
    vocab1: string;
    vocab2: string;
    vocab3: string;
    q1: string;
    q2: string;
    q3: string;
    activity: string;
    answerKeyQuestions: string;
    answerKeyActivity: string;
  };
  middle: {
    passage: string;
    vocab1: string;
    vocab2: string;
    vocab3: string;
    vocab4: string;
    q1: string;
    q2: string;
    q3: string;
    q4: string;
    activity: string;
    answerKeyQuestions: string;
    answerKeyActivity: string;
  };
  upper: AdvancedBandFormFields;
  senior?: AdvancedBandFormFields;
  expert?: AdvancedBandFormFields;
}

export interface SaveConundrumResponse {
  ok: boolean;
  action: "create" | "update";
  cardId: string;
  message: string;
  dataset: ConundrumDatasetResponse;
}
