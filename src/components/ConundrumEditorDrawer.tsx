"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Loader2,
  PlusCircle,
  Save,
  Sparkles,
  X,
} from "lucide-react";
import {
  CANONICAL_THEMES,
  type ConundrumFormPayload,
  type ConundrumRecord,
  type SaveConundrumResponse,
} from "@/types/conundrum";

interface ConundrumEditorDrawerProps {
  open: boolean;
  mode: "create" | "edit";
  initialCard: ConundrumRecord | null;
  suggestedNextId: string;
  onClose: () => void;
  onSaved: (result: SaveConundrumResponse) => void;
}

type EditorTab = "master" | "lower" | "middle" | "upper" | "senior" | "expert";

function buildInitialForm(
  mode: "create" | "edit",
  card: ConundrumRecord | null,
  suggestedNextId: string
): ConundrumFormPayload {
  if (mode === "edit" && card) {
    const req = (idx: number) =>
      card.requirements.find((r) => r.index === idx)?.raw ?? "";
    const l = card.worksheet?.lower;
    const m = card.worksheet?.middle;
    const u = card.worksheet?.upper;
    const s = card.worksheet?.senior;
    const ex = card.worksheet?.expert;

    const getQ = (
      qs: Array<{ id: string; prompt: string }> | undefined,
      id: string
    ) => qs?.find((q) => q.id === id)?.prompt ?? "";

    return {
      originalCardId: card.cardId,
      cardId: card.cardId,
      title: card.title,
      category: card.category || CANONICAL_THEMES[0],
      status: card.status || "Active",
      objective: card.objective,
      requirement1: req(1),
      requirement2: req(2),
      requirement3: req(3),
      requirement4: req(4),
      requirement5: req(5),
      deliverables: card.deliverables,
      disciplines: card.disciplinesRaw,
      notes: card.notes,
      lower: {
        passage: l?.passage ?? "",
        vocab1: l?.vocab[0]?.raw ?? "",
        vocab2: l?.vocab[1]?.raw ?? "",
        vocab3: l?.vocab[2]?.raw ?? "",
        q1: getQ(l?.questions, "Q1"),
        q2: getQ(l?.questions, "Q2"),
        q3: getQ(l?.questions, "Q3"),
        activity: l?.activityPrompt ?? "",
        answerKeyQuestions: l?.answerKeyQuestions ?? "",
        answerKeyActivity: l?.answerKeyActivity ?? "",
      },
      middle: {
        passage: m?.passage ?? "",
        vocab1: m?.vocab[0]?.raw ?? "",
        vocab2: m?.vocab[1]?.raw ?? "",
        vocab3: m?.vocab[2]?.raw ?? "",
        vocab4: m?.vocab[3]?.raw ?? "",
        q1: getQ(m?.questions, "Q1"),
        q2: getQ(m?.questions, "Q2"),
        q3: getQ(m?.questions, "Q3"),
        q4: getQ(m?.questions, "Q4"),
        activity: m?.activityPrompt ?? "",
        answerKeyQuestions: m?.answerKeyQuestions ?? "",
        answerKeyActivity: m?.answerKeyActivity ?? "",
      },
      upper: {
        passage: u?.passage ?? "",
        vocab1: u?.vocab[0]?.raw ?? "",
        vocab2: u?.vocab[1]?.raw ?? "",
        vocab3: u?.vocab[2]?.raw ?? "",
        vocab4: u?.vocab[3]?.raw ?? "",
        q1: getQ(u?.questions, "Q1"),
        q2: getQ(u?.questions, "Q2"),
        q3: getQ(u?.questions, "Q3"),
        q4: getQ(u?.questions, "Q4"),
        q5: getQ(u?.questions, "Q5"),
        activity: u?.activityPrompt ?? "",
        answerKeyQuestions: u?.answerKeyQuestions ?? "",
        answerKeyActivity: u?.answerKeyActivity ?? "",
      },
      senior: {
        passage: s?.passage ?? "",
        vocab1: s?.vocab[0]?.raw ?? "",
        vocab2: s?.vocab[1]?.raw ?? "",
        vocab3: s?.vocab[2]?.raw ?? "",
        vocab4: s?.vocab[3]?.raw ?? "",
        q1: getQ(s?.questions, "Q1"),
        q2: getQ(s?.questions, "Q2"),
        q3: getQ(s?.questions, "Q3"),
        q4: getQ(s?.questions, "Q4"),
        q5: getQ(s?.questions, "Q5"),
        activity: s?.activityPrompt ?? "",
        answerKeyQuestions: s?.answerKeyQuestions ?? "",
        answerKeyActivity: s?.answerKeyActivity ?? "",
      },
      expert: {
        passage: ex?.passage ?? "",
        vocab1: ex?.vocab[0]?.raw ?? "",
        vocab2: ex?.vocab[1]?.raw ?? "",
        vocab3: ex?.vocab[2]?.raw ?? "",
        vocab4: ex?.vocab[3]?.raw ?? "",
        q1: getQ(ex?.questions, "Q1"),
        q2: getQ(ex?.questions, "Q2"),
        q3: getQ(ex?.questions, "Q3"),
        q4: getQ(ex?.questions, "Q4"),
        q5: getQ(ex?.questions, "Q5"),
        activity: ex?.activityPrompt ?? "",
        answerKeyQuestions: ex?.answerKeyQuestions ?? "",
        answerKeyActivity: ex?.answerKeyActivity ?? "",
      },
    };
  }

  return {
    cardId: suggestedNextId,
    title: "",
    category: CANONICAL_THEMES[0],
    status: "Active",
    objective: "",
    requirement1: "",
    requirement2: "",
    requirement3: "",
    requirement4: "",
    requirement5: "",
    deliverables: "",
    disciplines: "",
    notes: "",
    lower: {
      passage: "",
      vocab1: "",
      vocab2: "",
      vocab3: "",
      q1: "",
      q2: "",
      q3: "",
      activity: "",
      answerKeyQuestions: "",
      answerKeyActivity: "",
    },
    middle: {
      passage: "",
      vocab1: "",
      vocab2: "",
      vocab3: "",
      vocab4: "",
      q1: "",
      q2: "",
      q3: "",
      q4: "",
      activity: "",
      answerKeyQuestions: "",
      answerKeyActivity: "",
    },
    upper: {
      passage: "",
      vocab1: "",
      vocab2: "",
      vocab3: "",
      vocab4: "",
      q1: "",
      q2: "",
      q3: "",
      q4: "",
      q5: "",
      activity: "",
      answerKeyQuestions: "",
      answerKeyActivity: "",
    },
    senior: {
      passage: "",
      vocab1: "",
      vocab2: "",
      vocab3: "",
      vocab4: "",
      q1: "",
      q2: "",
      q3: "",
      q4: "",
      q5: "",
      activity: "",
      answerKeyQuestions: "",
      answerKeyActivity: "",
    },
    expert: {
      passage: "",
      vocab1: "",
      vocab2: "",
      vocab3: "",
      vocab4: "",
      q1: "",
      q2: "",
      q3: "",
      q4: "",
      q5: "",
      activity: "",
      answerKeyQuestions: "",
      answerKeyActivity: "",
    },
  };
}

function FieldLabel({
  label,
  hint,
  required,
}: {
  label: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2 mb-1">
      <label className="text-xs font-semibold text-slate-800">
        {label}
        {required && <span className="text-rose-600 ml-0.5">*</span>}
      </label>
      {hint && <span className="text-[10.5px] text-slate-400">{hint}</span>}
    </div>
  );
}

const INPUT_CLASS =
  "w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition";

const TEXTAREA_CLASS = `${INPUT_CLASS} resize-y leading-relaxed`;

export function ConundrumEditorDrawer({
  open,
  mode,
  initialCard,
  suggestedNextId,
  onClose,
  onSaved,
}: ConundrumEditorDrawerProps) {
  const [form, setForm] = useState<ConundrumFormPayload>(() =>
    buildInitialForm(mode, initialCard, suggestedNextId)
  );
  const [activeTab, setActiveTab] = useState<EditorTab>("master");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(buildInitialForm(mode, initialCard, suggestedNextId));
    setActiveTab("master");
    setError(null);
  }, [open, mode, initialCard, suggestedNextId]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSaving) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, isSaving, onClose]);

  if (!open) return null;

  const updateLower = (
    key: keyof ConundrumFormPayload["lower"],
    value: string
  ) =>
    setForm((prev) => ({
      ...prev,
      lower: { ...prev.lower, [key]: value },
    }));

  const updateMiddle = (
    key: keyof ConundrumFormPayload["middle"],
    value: string
  ) =>
    setForm((prev) => ({
      ...prev,
      middle: { ...prev.middle, [key]: value },
    }));

  const updateUpper = (
    key: keyof ConundrumFormPayload["upper"],
    value: string
  ) =>
    setForm((prev) => ({
      ...prev,
      upper: { ...prev.upper, [key]: value },
    }));

  const updateSenior = (
    key: keyof NonNullable<ConundrumFormPayload["senior"]>,
    value: string
  ) =>
    setForm((prev) => ({
      ...prev,
      senior: {
        passage: "",
        vocab1: "",
        vocab2: "",
        vocab3: "",
        vocab4: "",
        q1: "",
        q2: "",
        q3: "",
        q4: "",
        q5: "",
        activity: "",
        answerKeyQuestions: "",
        answerKeyActivity: "",
        ...prev.senior,
        [key]: value,
      },
    }));

  const updateExpert = (
    key: keyof NonNullable<ConundrumFormPayload["expert"]>,
    value: string
  ) =>
    setForm((prev) => ({
      ...prev,
      expert: {
        passage: "",
        vocab1: "",
        vocab2: "",
        vocab3: "",
        vocab4: "",
        q1: "",
        q2: "",
        q3: "",
        q4: "",
        q5: "",
        activity: "",
        answerKeyQuestions: "",
        answerKeyActivity: "",
        ...prev.expert,
        [key]: value,
      },
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.cardId.trim() || !form.title.trim() || !form.objective.trim()) {
      setActiveTab("master");
      setError("Card ID, Title, and Objective are required.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/conundrums", {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = (await res.json()) as SaveConundrumResponse & {
        error?: string;
      };

      if (!res.ok || !json.ok) {
        throw new Error(json.error || `Request failed (HTTP ${res.status})`);
      }

      onSaved(json);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save conundrum record."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="no-print fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={mode === "create" ? "Add New Conundrum" : "Edit Conundrum"}
    >
      {/* Backdrop */}
      <div
        onClick={() => !isSaving && onClose()}
        className="fixed inset-0 bg-slate-950/45 backdrop-blur-[2px]"
      />

      {/* Slide-over Form Drawer */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-3xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col"
      >
        {/* Drawer Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
              {mode === "create" ? (
                <PlusCircle className="h-4 w-4" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-950">
                {mode === "create"
                  ? `Add New Conundrum (${suggestedNextId})`
                  : `Edit Conundrum · ${initialCard?.cardId ?? ""}`}
              </h2>
              <p className="text-xs text-slate-500">
                Saves to both Conundrum Database and Worksheet Content Database tabs.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            aria-label="Close editor drawer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Section Tabs */}
        <div className="px-5 sm:px-6 pt-3 pb-2.5 border-b border-slate-200 bg-slate-50/70">
          <div
            role="tablist"
            aria-label="Conundrum form sections"
            className="grid grid-cols-3 sm:grid-cols-6 gap-1.5"
          >
            {(
              [
                { id: "master", label: "Card", icon: ClipboardList },
                { id: "lower", label: "Novice", icon: BookOpen },
                { id: "middle", label: "Beginner", icon: GraduationCap },
                { id: "upper", label: "Competent", icon: GraduationCap },
                { id: "senior", label: "Proficient", icon: GraduationCap },
                { id: "expert", label: "Expert", icon: GraduationCap },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                    active
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inline Error Alert */}
        {error && (
          <div className="mx-5 sm:mx-6 mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-900 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4 workspace-scroll">
          {/* TAB 1: CONUNDRUM DATABASE */}
          {activeTab === "master" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-3">
                  <FieldLabel
                    label="Card ID"
                    hint={mode === "create" ? "Auto-next" : undefined}
                    required
                  />
                  <input
                    type="text"
                    value={form.cardId}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        cardId: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="CON-085"
                    className={`${INPUT_CLASS} font-mono font-bold`}
                    required
                  />
                </div>

                <div className="sm:col-span-6">
                  <FieldLabel label="Title" required />
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="e.g., Resilient Coastal Wetlands"
                    className={INPUT_CLASS}
                    required
                  />
                </div>

                <div className="sm:col-span-3">
                  <FieldLabel label="Status" />
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, status: e.target.value }))
                    }
                    className={INPUT_CLASS}
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="In Review">In Review</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <FieldLabel label="Category / Theme" required />
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, category: e.target.value }))
                    }
                    className={INPUT_CLASS}
                  >
                    {CANONICAL_THEMES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <FieldLabel
                    label="Focus Areas / Disciplines"
                    hint="Comma-separated"
                  />
                  <input
                    type="text"
                    value={form.disciplines}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        disciplines: e.target.value,
                      }))
                    }
                    placeholder="Biology, Mathematics, Civics, Economics"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <div>
                <FieldLabel label="Objective" required />
                <textarea
                  rows={2}
                  value={form.objective}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, objective: e.target.value }))
                  }
                  placeholder="Describe the core real-world challenge students must solve..."
                  className={TEXTAREA_CLASS}
                  required
                />
              </div>

              <div className="space-y-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  5 Interdisciplinary Requirements
                </div>
                {(
                  [
                    ["requirement1", "Requirement 1"],
                    ["requirement2", "Requirement 2"],
                    ["requirement3", "Requirement 3"],
                    ["requirement4", "Requirement 4"],
                    ["requirement5", "Requirement 5"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key}>
                    <FieldLabel
                      label={label}
                      hint="Format: Discipline: Requirement details"
                    />
                    <input
                      type="text"
                      value={form[key]}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, [key]: e.target.value }))
                      }
                      placeholder="e.g., Science: Analyze renewable energy options and local ecosystem impact."
                      className={INPUT_CLASS}
                    />
                  </div>
                ))}
              </div>

              <div>
                <FieldLabel label="Deliverables" />
                <textarea
                  rows={2}
                  value={form.deliverables}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      deliverables: e.target.value,
                    }))
                  }
                  placeholder="Expected student artifacts, models, reports, or presentations..."
                  className={TEXTAREA_CLASS}
                />
              </div>

              <div>
                <FieldLabel label="Notes" hint="Optional educator remarks" />
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Curriculum pacing, prerequisites, or facilitation tips..."
                  className={TEXTAREA_CLASS}
                />
              </div>
            </div>
          )}

          {/* TAB 2: LOWER (G1-2) */}
          {activeTab === "lower" && (
            <div className="space-y-4">
              <div>
                <FieldLabel label="Lower (G1–2) Reading Passage" />
                <textarea
                  rows={4}
                  value={form.lower.passage}
                  onChange={(e) => updateLower("passage", e.target.value)}
                  placeholder="Engaging Grade 1–2 story passage introducing the conundrum..."
                  className={TEXTAREA_CLASS}
                />
              </div>

              <div className="grid grid-cols-1 gap-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Vocabulary 1–3 (Term: Definition)
                </div>
                {(["vocab1", "vocab2", "vocab3"] as const).map((k, idx) => (
                  <div key={k}>
                    <FieldLabel label={`Vocab ${idx + 1}`} />
                    <input
                      type="text"
                      value={form.lower[k]}
                      onChange={(e) => updateLower(k, e.target.value)}
                      placeholder="Word: Kid-friendly definition..."
                      className={INPUT_CLASS}
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Questions Q1–Q3 &amp; Activity
                </div>
                <div>
                  <FieldLabel label="Q1 Science" />
                  <input
                    type="text"
                    value={form.lower.q1}
                    onChange={(e) => updateLower("q1", e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <FieldLabel label="Q2 Civic & Community" />
                  <input
                    type="text"
                    value={form.lower.q2}
                    onChange={(e) => updateLower("q2", e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <FieldLabel label="Q3 Science & Math Check" />
                  <input
                    type="text"
                    value={form.lower.q3}
                    onChange={(e) => updateLower("q3", e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <FieldLabel label="Science & Civic Activity" />
                  <textarea
                    rows={2}
                    value={form.lower.activity}
                    onChange={(e) => updateLower("activity", e.target.value)}
                    className={TEXTAREA_CLASS}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <FieldLabel label="Answer Key Q1–Q3" />
                  <textarea
                    rows={3}
                    value={form.lower.answerKeyQuestions}
                    onChange={(e) =>
                      updateLower("answerKeyQuestions", e.target.value)
                    }
                    placeholder="[Q1]: ...\n[Q2]: ...\n[Q3]: ..."
                    className={TEXTAREA_CLASS}
                  />
                </div>
                <div>
                  <FieldLabel label="Answer Key Activity" />
                  <textarea
                    rows={3}
                    value={form.lower.answerKeyActivity}
                    onChange={(e) =>
                      updateLower("answerKeyActivity", e.target.value)
                    }
                    placeholder="[Activity]: Look for..."
                    className={TEXTAREA_CLASS}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MIDDLE (G3-4) */}
          {activeTab === "middle" && (
            <div className="space-y-4">
              <div>
                <FieldLabel label="Middle (G3–4) Reading Passage" />
                <textarea
                  rows={4}
                  value={form.middle.passage}
                  onChange={(e) => updateMiddle("passage", e.target.value)}
                  className={TEXTAREA_CLASS}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                <div className="sm:col-span-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                  Vocabulary 1–4 (Term: Definition)
                </div>
                {(["vocab1", "vocab2", "vocab3", "vocab4"] as const).map(
                  (k, idx) => (
                    <div key={k}>
                      <FieldLabel label={`Vocab ${idx + 1}`} />
                      <input
                        type="text"
                        value={form.middle[k]}
                        onChange={(e) => updateMiddle(k, e.target.value)}
                        placeholder="Term: Definition..."
                        className={INPUT_CLASS}
                      />
                    </div>
                  )
                )}
              </div>

              <div className="grid grid-cols-1 gap-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Questions Q1–Q4 &amp; Civic Action Lab
                </div>
                <div>
                  <FieldLabel label="Q1 Science Inquiry" />
                  <input
                    type="text"
                    value={form.middle.q1}
                    onChange={(e) => updateMiddle("q1", e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <FieldLabel label="Q2 Systems & Environment" />
                  <input
                    type="text"
                    value={form.middle.q2}
                    onChange={(e) => updateMiddle("q2", e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <FieldLabel label="Q3 Civic Application" />
                  <input
                    type="text"
                    value={form.middle.q3}
                    onChange={(e) => updateMiddle("q3", e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <FieldLabel label="Q4 Math & Resource Plan" />
                  <input
                    type="text"
                    value={form.middle.q4}
                    onChange={(e) => updateMiddle("q4", e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <FieldLabel label="Civic Action Lab" />
                  <textarea
                    rows={2}
                    value={form.middle.activity}
                    onChange={(e) => updateMiddle("activity", e.target.value)}
                    className={TEXTAREA_CLASS}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <FieldLabel label="Answer Key Q1–Q4" />
                  <textarea
                    rows={3}
                    value={form.middle.answerKeyQuestions}
                    onChange={(e) =>
                      updateMiddle("answerKeyQuestions", e.target.value)
                    }
                    className={TEXTAREA_CLASS}
                  />
                </div>
                <div>
                  <FieldLabel label="Answer Key Civic Lab" />
                  <textarea
                    rows={3}
                    value={form.middle.answerKeyActivity}
                    onChange={(e) =>
                      updateMiddle("answerKeyActivity", e.target.value)
                    }
                    className={TEXTAREA_CLASS}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: UPPER (G5-6+) */}
          {activeTab === "upper" && (
            <div className="space-y-4">
              <div>
                <FieldLabel label="Upper (G5–6+) Reading Passage" />
                <textarea
                  rows={4}
                  value={form.upper.passage}
                  onChange={(e) => updateUpper("passage", e.target.value)}
                  className={TEXTAREA_CLASS}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                <div className="sm:col-span-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                  Vocabulary 1–4 (Term: Definition)
                </div>
                {(["vocab1", "vocab2", "vocab3", "vocab4"] as const).map(
                  (k, idx) => (
                    <div key={k}>
                      <FieldLabel label={`Vocab ${idx + 1}`} />
                      <input
                        type="text"
                        value={form.upper[k]}
                        onChange={(e) => updateUpper(k, e.target.value)}
                        placeholder="Term: Definition..."
                        className={INPUT_CLASS}
                      />
                    </div>
                  )
                )}
              </div>

              <div className="grid grid-cols-1 gap-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Questions Q1–Q5 &amp; Civic Policy Lab
                </div>
                <div>
                  <FieldLabel label="Q1 Science & Engineering" />
                  <input
                    type="text"
                    value={form.upper.q1}
                    onChange={(e) => updateUpper("q1", e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <FieldLabel label="Q2 Ecological & Tech Systems" />
                  <input
                    type="text"
                    value={form.upper.q2}
                    onChange={(e) => updateUpper("q2", e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <FieldLabel label="Q3 Civic Governance & Law" />
                  <input
                    type="text"
                    value={form.upper.q3}
                    onChange={(e) => updateUpper("q3", e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <FieldLabel label="Q4 Civic Ethics & Equity" />
                  <input
                    type="text"
                    value={form.upper.q4}
                    onChange={(e) => updateUpper("q4", e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <FieldLabel label="Q5 Quantitative Modeling" />
                  <input
                    type="text"
                    value={form.upper.q5}
                    onChange={(e) => updateUpper("q5", e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <FieldLabel label="Civic Policy Lab" />
                  <textarea
                    rows={2}
                    value={form.upper.activity}
                    onChange={(e) => updateUpper("activity", e.target.value)}
                    className={TEXTAREA_CLASS}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <FieldLabel label="Answer Key Q1–Q5" />
                  <textarea
                    rows={3}
                    value={form.upper.answerKeyQuestions}
                    onChange={(e) =>
                      updateUpper("answerKeyQuestions", e.target.value)
                    }
                    className={TEXTAREA_CLASS}
                  />
                </div>
                <div>
                  <FieldLabel label="Answer Key Policy Lab" />
                  <textarea
                    rows={3}
                    value={form.upper.answerKeyActivity}
                    onChange={(e) =>
                      updateUpper("answerKeyActivity", e.target.value)
                    }
                    className={TEXTAREA_CLASS}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SENIOR (G8-10) */}
          {activeTab === "senior" && (
            <div className="space-y-4">
              <div>
                <FieldLabel
                  label="High School / JHS (Grades 8–10) Executive Brief"
                  hint="Leave blank to auto-synthesize from the card's 5 pillars"
                />
                <textarea
                  rows={4}
                  value={form.senior?.passage ?? ""}
                  onChange={(e) => updateSenior("passage", e.target.value)}
                  className={TEXTAREA_CLASS}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                <div className="sm:col-span-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                  Senior Research Vocabulary 1–4 (Term: Definition)
                </div>
                {(["vocab1", "vocab2", "vocab3", "vocab4"] as const).map(
                  (k, idx) => (
                    <div key={k}>
                      <FieldLabel label={`Vocab ${idx + 1}`} />
                      <input
                        type="text"
                        value={form.senior?.[k] ?? ""}
                        onChange={(e) => updateSenior(k, e.target.value)}
                        placeholder="Term: Definition..."
                        className={INPUT_CLASS}
                      />
                    </div>
                  )
                )}
              </div>

              <div className="grid grid-cols-1 gap-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Capstone Questions Q1–Q5 &amp; Prototype Task
                </div>
                {(
                  [
                    ["q1", "Q1 Systems Architecture"],
                    ["q2", "Q2 Empirical & Quantitative Modeling"],
                    ["q3", "Q3 Policy & Economic Feasibility"],
                    ["q4", "Q4 Ethics, Equity & Externalities"],
                    ["q5", "Q5 Deliverable Defense"],
                  ] as const
                ).map(([k, lbl]) => (
                  <div key={k}>
                    <FieldLabel label={lbl} />
                    <input
                      type="text"
                      value={form.senior?.[k] ?? ""}
                      onChange={(e) => updateSenior(k, e.target.value)}
                      className={INPUT_CLASS}
                    />
                  </div>
                ))}
                <div>
                  <FieldLabel label="Capstone Policy & Systems Prototype" />
                  <textarea
                    rows={2}
                    value={form.senior?.activity ?? ""}
                    onChange={(e) => updateSenior("activity", e.target.value)}
                    className={TEXTAREA_CLASS}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <FieldLabel label="Answer Key Q1–Q5" />
                  <textarea
                    rows={3}
                    value={form.senior?.answerKeyQuestions ?? ""}
                    onChange={(e) =>
                      updateSenior("answerKeyQuestions", e.target.value)
                    }
                    className={TEXTAREA_CLASS}
                  />
                </div>
                <div>
                  <FieldLabel label="Answer Key Capstone Rubric" />
                  <textarea
                    rows={3}
                    value={form.senior?.answerKeyActivity ?? ""}
                    onChange={(e) =>
                      updateSenior("answerKeyActivity", e.target.value)
                    }
                    className={TEXTAREA_CLASS}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: EXPERT */}
          {activeTab === "expert" && (
            <div className="space-y-4">
              <div>
                <FieldLabel
                  label="Level 5 · Expert Symposium Dossier"
                  hint="Leave blank to auto-synthesize from the card's 5 pillars"
                />
                <textarea
                  rows={4}
                  value={form.expert?.passage ?? ""}
                  onChange={(e) => updateExpert("passage", e.target.value)}
                  className={TEXTAREA_CLASS}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                <div className="sm:col-span-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                  Expert Analytical Frameworks 1–4 (Term: Definition)
                </div>
                {(["vocab1", "vocab2", "vocab3", "vocab4"] as const).map(
                  (k, idx) => (
                    <div key={k}>
                      <FieldLabel label={`Framework ${idx + 1}`} />
                      <input
                        type="text"
                        value={form.expert?.[k] ?? ""}
                        onChange={(e) => updateExpert(k, e.target.value)}
                        placeholder="Framework: Definition..."
                        className={INPUT_CLASS}
                      />
                    </div>
                  )
                )}
              </div>

              <div className="grid grid-cols-1 gap-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Expert Questions Q1–Q5 &amp; Symposium Whitepaper
                </div>
                {(
                  [
                    ["q1", "Q1 Cascading Failure Modes"],
                    ["q2", "Q2 Sensitivity & Uncertainty Modeling"],
                    ["q3", "Q3 Institutional & Incentive Design"],
                    ["q4", "Q4 Competing Ethical Frameworks"],
                    ["q5", "Q5 Scalability & Peer-Review Defense"],
                  ] as const
                ).map(([k, lbl]) => (
                  <div key={k}>
                    <FieldLabel label={lbl} />
                    <input
                      type="text"
                      value={form.expert?.[k] ?? ""}
                      onChange={(e) => updateExpert(k, e.target.value)}
                      className={INPUT_CLASS}
                    />
                  </div>
                ))}
                <div>
                  <FieldLabel label="Expert Symposium Whitepaper & Defense" />
                  <textarea
                    rows={2}
                    value={form.expert?.activity ?? ""}
                    onChange={(e) => updateExpert("activity", e.target.value)}
                    className={TEXTAREA_CLASS}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <FieldLabel label="Answer Key Q1–Q5" />
                  <textarea
                    rows={3}
                    value={form.expert?.answerKeyQuestions ?? ""}
                    onChange={(e) =>
                      updateExpert("answerKeyQuestions", e.target.value)
                    }
                    className={TEXTAREA_CLASS}
                  />
                </div>
                <div>
                  <FieldLabel label="Answer Key Symposium Rubric" />
                  <textarea
                    rows={3}
                    value={form.expert?.answerKeyActivity ?? ""}
                    onChange={(e) =>
                      updateExpert("answerKeyActivity", e.target.value)
                    }
                    className={TEXTAREA_CLASS}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer Actions */}
        <div className="px-5 sm:px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 hidden sm:block">
            Writes to <code className="font-mono">Conundrum Database</code> +{" "}
            <code className="font-mono">Worksheet Content Database</code>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 shadow-xs transition cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>
                    {mode === "create"
                      ? `Create ${form.cardId || "Conundrum"}`
                      : `Save Changes (${form.cardId})`}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
