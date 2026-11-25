import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  CANONICAL_THEMES,
  type ConundrumDatasetResponse,
  type ConundrumFormPayload,
  type ConundrumRecord,
  type DataSourceMode,
  type GradeBandContent,
  type RequirementItem,
  type SaveConundrumResponse,
  type VocabEntry,
  type WorksheetBundle,
  type WorksheetQuestion,
} from "@/types/conundrum";

const DEFAULT_SPREADSHEET_ID =
  "1OkTnHn6l7dsmJ67GgmebhOH-DLWssIbAMF3iHFlDr3E";
const DEFAULT_CONUNDRUM_TAB = "Conundrum Database";
const DEFAULT_WORKSHEET_TAB = "Worksheet Content Database";

interface CachedResult {
  expiresAt: number;
  data: ConundrumDatasetResponse;
}

let memoryCache: CachedResult | null = null;

function cleanCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function parseVocab(raw: string): VocabEntry | null {
  const trimmed = cleanCell(raw);
  if (!trimmed) return null;
  const colonIdx = trimmed.indexOf(":");
  if (colonIdx > 0 && colonIdx < 60) {
    return {
      term: trimmed.slice(0, colonIdx).trim(),
      definition: trimmed.slice(colonIdx + 1).trim(),
      raw: trimmed,
    };
  }
  return {
    term: trimmed,
    definition: "",
    raw: trimmed,
  };
}

function parseRequirement(raw: string, index: number): RequirementItem | null {
  const trimmed = cleanCell(raw);
  if (!trimmed) return null;
  const colonIdx = trimmed.indexOf(":");
  if (colonIdx > 0 && colonIdx < 45) {
    return {
      index,
      discipline: trimmed.slice(0, colonIdx).trim(),
      text: trimmed.slice(colonIdx + 1).trim(),
      raw: trimmed,
    };
  }
  return {
    index,
    text: trimmed,
    raw: trimmed,
  };
}

function buildHeaderMap(headerRow: string[]): Map<string, number> {
  const map = new Map<string, number>();
  headerRow.forEach((cell, index) => {
    const key = cleanCell(cell).toLowerCase();
    if (key) map.set(key, index);
  });
  return map;
}

function getByHeader(
  row: string[],
  headers: Map<string, number>,
  exactNames: string[],
  fallbackIndex?: number
): string {
  for (const name of exactNames) {
    const idx = headers.get(name.toLowerCase());
    if (idx !== undefined && idx < row.length) {
      return cleanCell(row[idx]);
    }
  }
  if (
    fallbackIndex !== undefined &&
    fallbackIndex >= 0 &&
    fallbackIndex < row.length
  ) {
    return cleanCell(row[fallbackIndex]);
  }
  return "";
}

interface CardContextForSenior {
  title: string;
  category: string;
  objective: string;
  requirements: RequirementItem[];
  deliverables: string;
  disciplines: string[];
}

function buildSynthesizedSeniorBand(
  upper: GradeBandContent,
  ctx?: CardContextForSenior
): GradeBandContent {
  const title = ctx?.title || "this interdisciplinary challenge";
  const objective =
    ctx?.objective ||
    `Design a rigorous, evidence-backed strategy to address ${title}.`;
  const reqs = ctx?.requirements ?? [];
  const disciplines =
    ctx?.disciplines && ctx.disciplines.length > 0
      ? ctx.disciplines
      : ["Systems Science", "Governance", "Economics", "Ethics"];
  const deliverables =
    ctx?.deliverables ||
    "A comprehensive executive policy and systems proposal supported by quantitative evidence.";

  const r1 = reqs[0]?.raw || `Core scientific constraints of ${title}`;
  const r2 = reqs[1]?.raw || `Quantitative & systems modeling for ${title}`;
  const r3 = reqs[2]?.raw || `Technological or ecological integration`;
  const r4 = reqs[3]?.raw || `Economic feasibility and resource governance`;
  const r5 = reqs[4]?.raw || `Civic equity, ethics, and stakeholder impact`;

  const passage =
    `Executive Case Brief — ${title}: At the senior secondary level, addressing "${title}" requires synthesizing ${disciplines.join(", ")} under real-world resource, legal, and institutional constraints. The core mandate is clear: ${objective}\n\n` +
    `${upper.passage ? `${upper.passage}\n\n` : ""}` +
    `Decision-makers must weigh competing trade-offs across technical feasibility, long-term sustainability, fiscal viability, and equitable governance. Rather than treating scientific, economic, and ethical questions in isolation, high-school scholars must build an integrated systems argument capable of withstanding peer review, stakeholder scrutiny, and measurable cost-benefit evaluation.`;

  const baseTerms = upper.vocab.slice(0, 2);
  const seniorVocab: VocabEntry[] = [
    ...baseTerms,
    {
      term: "Systems Trade-Off",
      definition: `A strategic balance in ${title} where optimizing one variable (such as cost, speed, or scale) constrains another (such as equity or ecological resilience).`,
      raw: `Systems Trade-Off: A strategic balance in ${title} where optimizing one variable constrains another.`,
    },
    {
      term: "Stakeholder Externality",
      definition: `An indirect social, environmental, or economic consequence affecting communities not directly represented in primary decision-making.`,
      raw: "Stakeholder Externality: An indirect social, environmental, or economic consequence affecting third-party communities.",
    },
  ].slice(0, 4);

  const questions: WorksheetQuestion[] = [
    {
      id: "Q1",
      label: "Systems Architecture",
      prompt: `Analyze how these two pillars interact in ${title}: (${r1}) and (${r2}). Where do technical or structural bottlenecks emerge?`,
    },
    {
      id: "Q2",
      label: "Empirical & Quantitative Modeling",
      prompt: `Define two measurable KPIs or quantitative indicators you would track to evaluate success in (${r3}), and explain what baseline data is needed.`,
    },
    {
      id: "Q3",
      label: "Policy & Economic Feasibility",
      prompt: `Using (${r4}), propose a sustainable funding or governance mechanism. What institutional barrier is most likely to stall implementation?`,
    },
    {
      id: "Q4",
      label: "Ethics, Equity & Externalities",
      prompt: `Critically evaluate (${r5}). Which vulnerable or underrepresented group faces the highest risk of negative externalities, and what binding safeguard prevents harm?`,
    },
    {
      id: "Q5",
      label: "Deliverable Defense",
      prompt: `Your final output requires: "${deliverables}" — What strongest counter-argument would a skeptical review board raise, and how would your evidence rebut it?`,
    },
  ];

  const activityPrompt = `Capstone Policy & Systems Prototype: Draft a 2-part executive brief for "${title}" combining (A) a concrete multi-pillar implementation roadmap referencing at least 3 disciplines (${disciplines.slice(0, 3).join(", ")}) and (B) a structured risk-mitigation & counter-argument defense.`;

  const answerKeyQuestions = [
    `[Q1]: Strong responses explicitly link the constraints of ${reqs[0]?.discipline || "Pillar 1"} and ${reqs[1]?.discipline || "Pillar 2"}, identifying realistic trade-offs (e.g., cost vs. reliability, scale vs. safety).`,
    `[Q2]: Look for specific, falsifiable metrics (rates, ratios, thresholds, or longitudinal baselines) tied directly to ${title}.`,
    `[Q3]: Expect realistic funding/governance structures (public-private grants, phased budgets, oversight boards) and concrete identification of regulatory, political, or adoption hurdles.`,
    `[Q4]: High-scoring answers name a specific vulnerable stakeholder group, articulate an unintended consequence, and propose an enforceable legal/ethical safeguard.`,
    `[Q5]: Look for an authentic steel-manned objection (cost overrun, technical failure, social resistance) paired with an evidence-based rebuttal.`,
  ].join("\n");

  const answerKeyActivity =
    "[Capstone Rubric]: Exemplary briefs integrate all 5 conundrum pillars, cite quantitative benchmarks, explicitly address equity/ethics externalities, and present a persuasive counter-argument rebuttal.";

  return {
    level: "senior",
    title: "Proficient",
    shortLabel: "Proficient",
    gradeRange: "Level 4 · Proficient",
    passage,
    vocab: seniorVocab,
    questions,
    activityTitle: "Capstone Policy & Systems Prototype",
    activityPrompt,
    answerKeyQuestions,
    answerKeyActivity,
  };
}

function buildSynthesizedExpertBand(
  upper: GradeBandContent,
  ctx?: CardContextForSenior
): GradeBandContent {
  const title = ctx?.title || "this frontier conundrum";
  const objective =
    ctx?.objective ||
    `Architect a peer-reviewed, stress-tested systems solution for ${title}.`;
  const reqs = ctx?.requirements ?? [];
  const disciplines =
    ctx?.disciplines && ctx.disciplines.length > 0
      ? ctx.disciplines
      : ["Systems Science", "Governance", "Economics", "Ethics"];
  const deliverables =
    ctx?.deliverables ||
    "A publication-grade whitepaper, sensitivity model, and adversarial peer-review defense.";

  const r1 = reqs[0]?.raw || `Primary technical architecture of ${title}`;
  const r2 = reqs[1]?.raw || `Quantitative constraints and modeling`;
  const r3 = reqs[2]?.raw || `Cross-system technological/ecological coupling`;
  const r4 = reqs[3]?.raw || `Institutional governance and incentive alignment`;
  const r5 = reqs[4]?.raw || `Long-horizon ethics and intergenerational justice`;

  const passage =
    `Research Symposium Dossier — ${title}: At the Expert mastery tier, scholars treat "${title}" as an open frontier problem across ${disciplines.join(", ")}. Your mandate extends beyond designing a workable proposal (${objective}) to rigorously stress-testing its assumptions against second-order failure modes, institutional lock-in, and competing ethical frameworks.\n\n` +
    `Real-world deployments frequently fail not from lack of intent, but from unmodeled feedback loops, misaligned stakeholder incentives, and sensitivity to budget or environmental shocks. Expert teams must synthesize empirical evidence, sensitivity modeling, and governance safeguards into a defensible symposium whitepaper ready for adversarial peer review.`;

  const expertVocab: VocabEntry[] = [
    {
      term: "Second-Order Externality",
      definition: `A delayed or cascading system effect triggered indirectly by an intervention in ${title} (e.g., rebound effects or displaced burdens).`,
      raw: `Second-Order Externality: A delayed or cascading system effect triggered indirectly by an intervention in ${title}.`,
    },
    {
      term: "Adversarial Stress-Test",
      definition:
        "Deliberately modeling worst-case shocks (±25% cost, supply, or failure variance) to identify breaking points before real-world rollout.",
      raw: "Adversarial Stress-Test: Deliberately modeling worst-case shocks to identify breaking points before rollout.",
    },
    {
      term: "Institutional Lock-In",
      definition:
        "Structural inertia where legacy policies, infrastructure, or economic interests resist transitioning to a superior paradigm.",
      raw: "Institutional Lock-In: Structural inertia where legacy policies or interests resist transition.",
    },
    {
      term: "Pareto Trade-Off Frontier",
      definition:
        "The boundary of optimal designs where improving one metric (e.g., efficiency or speed) unavoidably reduces another (e.g., equity or resilience).",
      raw: "Pareto Trade-Off Frontier: The boundary where improving one metric unavoidably constrains another.",
    },
  ];

  const questions: WorksheetQuestion[] = [
    {
      id: "Q1",
      label: "Cascading Failure Modes",
      prompt: `Map one plausible second-order failure mode emerging from the interaction between (${r1}) and (${r2}), and design an early-warning circuit breaker.`,
    },
    {
      id: "Q2",
      label: "Sensitivity & Uncertainty Modeling",
      prompt: `In (${r3}), suppose your primary resource or cost assumption worsens by 25%. Show quantitatively or structurally how your model adapts without collapsing.`,
    },
    {
      id: "Q3",
      label: "Institutional & Incentive Design",
      prompt: `Using (${r4}), analyze how regulatory capture, short-term political cycles, or institutional lock-in could derail implementation—and specify an independent oversight mechanism.`,
    },
    {
      id: "Q4",
      label: "Competing Ethical Frameworks",
      prompt: `Compare how a utilitarian cost-benefit framework vs. a rights-based equity framework would judge (${r5}), and justify your resolution of the conflict.`,
    },
    {
      id: "Q5",
      label: "Scalability & Peer-Review Defense",
      prompt: `Scaling "${deliverables}" from a local pilot to national/global adoption introduces non-linear risks. Identify the sharpest peer-review critique and construct an evidence-based rebuttal.`,
    },
  ];

  const activityPrompt = `Expert Symposium Whitepaper & Defense: Compose (A) a concise executive thesis with a quantitative sensitivity/scaling table integrating all 5 pillars (${disciplines.join(", ")}) and (B) an adversarial peer-review rebuttal defending your design's weakest link.`;

  const answerKeyQuestions = [
    `[Q1]: Exemplary answers trace a concrete cause-and-effect chain (not just a single failure) between ${reqs[0]?.discipline || "Pillar 1"} and ${reqs[1]?.discipline || "Pillar 2"} and specify a measurable trigger/circuit breaker.`,
    `[Q2]: Look for explicit stress-testing under a 25% adverse shift (budget buffer, modular phasing, or contingency substitution) rather than vague optimism.`,
    `[Q3]: Strong responses identify specific misaligned incentives (profit vs. public good, election horizons) and propose structural insulation (independent audits, transparent open data, multi-year escrow).`,
    `[Q4]: Full credit requires accurately contrasting aggregate welfare (utilitarian) against non-negotiable protections for vulnerable minorities (rights-based/Rawlsian) with a reasoned synthesis.`,
    `[Q5]: Look for recognition of scaling bottlenecks (supply chains, governance heterogeneity, maintenance decay) paired with a rigorous, evidence-grounded rebuttal.`,
  ].join("\n");

  const answerKeyActivity =
    "[Symposium Rubric]: Distinguished Expert dossiers demonstrate multi-horizon systems thinking, explicit quantitative sensitivity analysis, institutional realism, and intellectual honesty in addressing counter-evidence.";

  return {
    level: "expert",
    title: "Expert",
    shortLabel: "Expert",
    gradeRange: "Level 5 · Expert",
    passage,
    vocab: expertVocab,
    questions,
    activityTitle: "Expert Symposium Whitepaper & Defense",
    activityPrompt,
    answerKeyQuestions,
    answerKeyActivity,
  };
}

function parseWorksheetRow(
  row: string[],
  headers: Map<string, number>,
  cardCtx?: CardContextForSenior
): WorksheetBundle {
  const get = (names: string[], fallbackIdx: number) =>
    getByHeader(row, headers, names, fallbackIdx);

  // Band 1: Primary (Grades 1–3) — maps from Lower columns
  const lowerVocab = [
    parseVocab(get(["Lower (G1-3) Vocab 1", "Lower (G1-2) Vocab 1"], 4)),
    parseVocab(get(["Lower (G1-3) Vocab 2", "Lower (G1-2) Vocab 2"], 5)),
    parseVocab(get(["Lower (G1-3) Vocab 3", "Lower (G1-2) Vocab 3"], 6)),
    parseVocab(get(["Lower (G1-3) Vocab 4", "Lower (G1-2) Vocab 4"], -1)),
  ].filter((v): v is VocabEntry => v !== null);

  const lowerQuestions: WorksheetQuestion[] = [
    {
      id: "Q1",
      label: "Science",
      prompt: get(["Lower (G1-3) Q1 Science", "Lower (G1-2) Q1 Science"], 7),
    },
    {
      id: "Q2",
      label: "Civic & Community",
      prompt: get(
        [
          "Lower (G1-3) Q2 Civic & Community",
          "Lower (G1-2) Q2 Civic & Community",
        ],
        8
      ),
    },
    {
      id: "Q3",
      label: "Science & Math Check",
      prompt: get(
        [
          "Lower (G1-3) Q3 Science & Math Check",
          "Lower (G1-2) Q3 Science & Math Check",
        ],
        9
      ),
    },
  ].filter((q) => q.prompt.length > 0);

  // Add Q4 Real-World Connection to give Grades 1–3 a full, balanced A4 sheet
  const lowerQ4FromSheet = get(["Lower (G1-3) Q4 Connection"], -1);
  lowerQuestions.push({
    id: "Q4",
    label: "My Idea & Connection",
    prompt:
      lowerQ4FromSheet ||
      `How could you and your classmates help with "${cardCtx?.title || "this project"}" in your own school or neighborhood?`,
  });

  const lower: GradeBandContent = {
    level: "lower",
    title: "Novice",
    shortLabel: "Novice",
    gradeRange: "Level 1 · Novice",
    passage: get(["Novice Passage", "Lower (G1-3) Passage", "Lower (G1-2) Passage"], 3),
    vocab: lowerVocab,
    questions: lowerQuestions,
    activityTitle: "Science & Civic Activity",
    activityPrompt: get(
      [
        "Lower (G1-3) Science & Civic Activity",
        "Lower (G1-2) Science & Civic Activity",
      ],
      10
    ),
    answerKeyQuestions: get(
      ["Lower (G1-3) Answer Key Q1-Q3", "Lower (G1-2) Answer Key Q1-Q3"],
      11
    ),
    answerKeyActivity: get(
      ["Lower (G1-3) Answer Key Activity", "Lower (G1-2) Answer Key Activity"],
      12
    ),
  };

  // Band 2: Intermediate (Grades 3–5) — maps from Middle columns
  const middleVocab = [
    parseVocab(get(["Middle (G3-5) Vocab 1", "Middle (G3-4) Vocab 1"], 14)),
    parseVocab(get(["Middle (G3-5) Vocab 2", "Middle (G3-4) Vocab 2"], 15)),
    parseVocab(get(["Middle (G3-5) Vocab 3", "Middle (G3-4) Vocab 3"], 16)),
    parseVocab(get(["Middle (G3-5) Vocab 4", "Middle (G3-4) Vocab 4"], 17)),
  ].filter((v): v is VocabEntry => v !== null);

  const middleQuestions: WorksheetQuestion[] = [
    {
      id: "Q1",
      label: "Science Inquiry",
      prompt: get(
        ["Middle (G3-5) Q1 Science Inquiry", "Middle (G3-4) Q1 Science Inquiry"],
        18
      ),
    },
    {
      id: "Q2",
      label: "Systems & Environment",
      prompt: get(
        [
          "Middle (G3-5) Q2 Systems & Environment",
          "Middle (G3-4) Q2 Systems & Environment",
        ],
        19
      ),
    },
    {
      id: "Q3",
      label: "Civic Application",
      prompt: get(
        [
          "Middle (G3-5) Q3 Civic Application",
          "Middle (G3-4) Q3 Civic Application",
        ],
        20
      ),
    },
    {
      id: "Q4",
      label: "Math & Resource Plan",
      prompt: get(
        [
          "Middle (G3-5) Q4 Math & Resource Plan",
          "Middle (G3-4) Q4 Math & Resource Plan",
        ],
        21
      ),
    },
  ].filter((q) => q.prompt.length > 0);

  const middle: GradeBandContent = {
    level: "middle",
    title: "Beginner",
    shortLabel: "Beginner",
    gradeRange: "Level 2 · Beginner",
    passage: get(["Beginner Passage", "Middle (G3-5) Passage", "Middle (G3-4) Passage"], 13),
    vocab: middleVocab,
    questions: middleQuestions,
    activityTitle: "Civic Action Lab",
    activityPrompt: get(
      ["Middle (G3-5) Civic Action Lab", "Middle (G3-4) Civic Action Lab"],
      22
    ),
    answerKeyQuestions: get(
      ["Middle (G3-5) Answer Key Q1-Q4", "Middle (G3-4) Answer Key Q1-Q4"],
      23
    ),
    answerKeyActivity: get(
      [
        "Middle (G3-5) Answer Key Civic Lab",
        "Middle (G3-4) Answer Key Civic Lab",
      ],
      24
    ),
  };

  // Band 3: Middle School (Grades 6–7) — maps from Upper columns
  const upperVocab = [
    parseVocab(get(["Upper (G6-7) Vocab 1", "Upper (G5-6+) Vocab 1"], 26)),
    parseVocab(get(["Upper (G6-7) Vocab 2", "Upper (G5-6+) Vocab 2"], 27)),
    parseVocab(get(["Upper (G6-7) Vocab 3", "Upper (G5-6+) Vocab 3"], 28)),
    parseVocab(get(["Upper (G6-7) Vocab 4", "Upper (G5-6+) Vocab 4"], 29)),
  ].filter((v): v is VocabEntry => v !== null);

  const upperQuestions: WorksheetQuestion[] = [
    {
      id: "Q1",
      label: "Science & Engineering",
      prompt: get(
        [
          "Upper (G6-7) Q1 Science & Engineering",
          "Upper (G5-6+) Q1 Science & Engineering",
        ],
        30
      ),
    },
    {
      id: "Q2",
      label: "Ecological & Tech Systems",
      prompt: get(
        [
          "Upper (G6-7) Q2 Ecological & Tech Systems",
          "Upper (G5-6+) Q2 Ecological & Tech Systems",
        ],
        31
      ),
    },
    {
      id: "Q3",
      label: "Civic Governance & Law",
      prompt: get(
        [
          "Upper (G6-7) Q3 Civic Governance & Law",
          "Upper (G5-6+) Q3 Civic Governance & Law",
        ],
        32
      ),
    },
    {
      id: "Q4",
      label: "Civic Ethics & Equity",
      prompt: get(
        [
          "Upper (G6-7) Q4 Civic Ethics & Equity",
          "Upper (G5-6+) Q4 Civic Ethics & Equity",
        ],
        33
      ),
    },
    {
      id: "Q5",
      label: "Quantitative Modeling",
      prompt: get(
        [
          "Upper (G6-7) Q5 Quantitative Modeling",
          "Upper (G5-6+) Q5 Quantitative Modeling",
        ],
        34
      ),
    },
  ].filter((q) => q.prompt.length > 0);

  const upper: GradeBandContent = {
    level: "upper",
    title: "Competent",
    shortLabel: "Competent",
    gradeRange: "Level 3 · Competent",
    passage: get(["Competent Passage", "Upper (G6-7) Passage", "Upper (G5-6+) Passage"], 25),
    vocab: upperVocab,
    questions: upperQuestions,
    activityTitle: "Civic Policy Lab",
    activityPrompt: get(
      ["Upper (G6-7) Civic Policy Lab", "Upper (G5-6+) Civic Policy Lab"],
      35
    ),
    answerKeyQuestions: get(
      ["Upper (G6-7) Answer Key Q1-Q5", "Upper (G5-6+) Answer Key Q1-Q5"],
      36
    ),
    answerKeyActivity: get(
      [
        "Upper (G6-7) Answer Key Policy Lab",
        "Upper (G5-6+) Answer Key Policy Lab",
      ],
      37
    ),
  };

  // Band 4: Proficient — reads Proficient / Senior columns if present, else synthesizes
  const seniorPassageFromSheet = get(
    ["Proficient Passage", "Senior (G8-10) Passage"],
    38
  );
  let senior: GradeBandContent;

  if (seniorPassageFromSheet) {
    const seniorVocab = [
      parseVocab(get(["Proficient Vocab 1", "Senior (G8-10) Vocab 1"], 39)),
      parseVocab(get(["Proficient Vocab 2", "Senior (G8-10) Vocab 2"], 40)),
      parseVocab(get(["Proficient Vocab 3", "Senior (G8-10) Vocab 3"], 41)),
      parseVocab(get(["Proficient Vocab 4", "Senior (G8-10) Vocab 4"], 42)),
    ].filter((v): v is VocabEntry => v !== null);

    const seniorQuestions: WorksheetQuestion[] = [
      {
        id: "Q1",
        label: "Systems Architecture",
        prompt: get(["Proficient Q1", "Senior (G8-10) Q1"], 43),
      },
      {
        id: "Q2",
        label: "Empirical & Quantitative Modeling",
        prompt: get(["Proficient Q2", "Senior (G8-10) Q2"], 44),
      },
      {
        id: "Q3",
        label: "Policy & Economic Feasibility",
        prompt: get(["Proficient Q3", "Senior (G8-10) Q3"], 45),
      },
      {
        id: "Q4",
        label: "Ethics, Equity & Externalities",
        prompt: get(["Proficient Q4", "Senior (G8-10) Q4"], 46),
      },
      {
        id: "Q5",
        label: "Deliverable Defense",
        prompt: get(["Proficient Q5", "Senior (G8-10) Q5"], 47),
      },
    ].filter((q) => q.prompt.length > 0);

    senior = {
      level: "senior",
      title: "Proficient",
      shortLabel: "Proficient",
      gradeRange: "Level 4 · Proficient",
      passage: seniorPassageFromSheet,
      vocab: seniorVocab,
      questions: seniorQuestions,
      activityTitle: "Capstone Policy & Systems Prototype",
      activityPrompt: get(["Proficient Activity", "Senior (G8-10) Activity"], 48),
      answerKeyQuestions: get(
        ["Proficient Answer Key Q1-Q5", "Senior (G8-10) Answer Key Q1-Q5"],
        49
      ),
      answerKeyActivity: get(
        ["Proficient Answer Key Activity", "Senior (G8-10) Answer Key Activity"],
        50
      ),
    };
  } else {
    senior = buildSynthesizedSeniorBand(upper, cardCtx);
  }

  // Band 5: Expert — reads Expert columns if present, else synthesizes
  const expertPassageFromSheet = get(["Expert Passage"], 51);
  let expert: GradeBandContent;

  if (expertPassageFromSheet) {
    const expertVocab = [
      parseVocab(get(["Expert Vocab 1"], 52)),
      parseVocab(get(["Expert Vocab 2"], 53)),
      parseVocab(get(["Expert Vocab 3"], 54)),
      parseVocab(get(["Expert Vocab 4"], 55)),
    ].filter((v): v is VocabEntry => v !== null);

    const expertQuestions: WorksheetQuestion[] = [
      { id: "Q1", label: "Cascading Failure Modes", prompt: get(["Expert Q1"], 56) },
      { id: "Q2", label: "Sensitivity & Uncertainty Modeling", prompt: get(["Expert Q2"], 57) },
      { id: "Q3", label: "Institutional & Incentive Design", prompt: get(["Expert Q3"], 58) },
      { id: "Q4", label: "Competing Ethical Frameworks", prompt: get(["Expert Q4"], 59) },
      { id: "Q5", label: "Scalability & Peer-Review Defense", prompt: get(["Expert Q5"], 60) },
    ].filter((q) => q.prompt.length > 0);

    expert = {
      level: "expert",
      title: "Expert",
      shortLabel: "Expert",
      gradeRange: "Level 5 · Expert",
      passage: expertPassageFromSheet,
      vocab: expertVocab,
      questions: expertQuestions,
      activityTitle: "Expert Symposium Whitepaper & Defense",
      activityPrompt: get(["Expert Activity"], 61),
      answerKeyQuestions: get(["Expert Answer Key Q1-Q5"], 62),
      answerKeyActivity: get(["Expert Answer Key Activity"], 63),
    };
  } else {
    expert = buildSynthesizedExpertBand(upper, cardCtx);
  }

  return { lower, middle, upper, senior, expert };
}

export function serializeFormToRows(payload: ConundrumFormPayload): {
  conundrumRow: string[];
  worksheetRow: string[];
} {
  const cardId = cleanCell(payload.cardId).toUpperCase();
  const title = cleanCell(payload.title);
  const category = cleanCell(payload.category);

  const conundrumRow: string[] = [
    cardId,
    title,
    category,
    cleanCell(payload.objective),
    cleanCell(payload.requirement1),
    cleanCell(payload.requirement2),
    cleanCell(payload.requirement3),
    cleanCell(payload.requirement4),
    cleanCell(payload.requirement5),
    cleanCell(payload.deliverables),
    cleanCell(payload.disciplines),
    cleanCell(payload.status) || "Active",
    cleanCell(payload.notes),
  ];

  const worksheetRow: string[] = [
    cardId,
    title,
    category,
    cleanCell(payload.lower.passage),
    cleanCell(payload.lower.vocab1),
    cleanCell(payload.lower.vocab2),
    cleanCell(payload.lower.vocab3),
    cleanCell(payload.lower.q1),
    cleanCell(payload.lower.q2),
    cleanCell(payload.lower.q3),
    cleanCell(payload.lower.activity),
    cleanCell(payload.lower.answerKeyQuestions),
    cleanCell(payload.lower.answerKeyActivity),
    cleanCell(payload.middle.passage),
    cleanCell(payload.middle.vocab1),
    cleanCell(payload.middle.vocab2),
    cleanCell(payload.middle.vocab3),
    cleanCell(payload.middle.vocab4),
    cleanCell(payload.middle.q1),
    cleanCell(payload.middle.q2),
    cleanCell(payload.middle.q3),
    cleanCell(payload.middle.q4),
    cleanCell(payload.middle.activity),
    cleanCell(payload.middle.answerKeyQuestions),
    cleanCell(payload.middle.answerKeyActivity),
    cleanCell(payload.upper.passage),
    cleanCell(payload.upper.vocab1),
    cleanCell(payload.upper.vocab2),
    cleanCell(payload.upper.vocab3),
    cleanCell(payload.upper.vocab4),
    cleanCell(payload.upper.q1),
    cleanCell(payload.upper.q2),
    cleanCell(payload.upper.q3),
    cleanCell(payload.upper.q4),
    cleanCell(payload.upper.q5),
    cleanCell(payload.upper.activity),
    cleanCell(payload.upper.answerKeyQuestions),
    cleanCell(payload.upper.answerKeyActivity),
  ];

  // Append Proficient (cols 39-51) and Expert (cols 52-64) if provided in form
  const hasSenior = Boolean(payload.senior && cleanCell(payload.senior.passage));
  const hasExpert = Boolean(payload.expert && cleanCell(payload.expert.passage));

  if (hasSenior || hasExpert) {
    const s = payload.senior;
    worksheetRow.push(
      cleanCell(s?.passage),
      cleanCell(s?.vocab1),
      cleanCell(s?.vocab2),
      cleanCell(s?.vocab3),
      cleanCell(s?.vocab4),
      cleanCell(s?.q1),
      cleanCell(s?.q2),
      cleanCell(s?.q3),
      cleanCell(s?.q4),
      cleanCell(s?.q5),
      cleanCell(s?.activity),
      cleanCell(s?.answerKeyQuestions),
      cleanCell(s?.answerKeyActivity)
    );
  }

  if (hasExpert) {
    const ex = payload.expert;
    worksheetRow.push(
      cleanCell(ex?.passage),
      cleanCell(ex?.vocab1),
      cleanCell(ex?.vocab2),
      cleanCell(ex?.vocab3),
      cleanCell(ex?.vocab4),
      cleanCell(ex?.q1),
      cleanCell(ex?.q2),
      cleanCell(ex?.q3),
      cleanCell(ex?.q4),
      cleanCell(ex?.q5),
      cleanCell(ex?.activity),
      cleanCell(ex?.answerKeyQuestions),
      cleanCell(ex?.answerKeyActivity)
    );
  }

  return { conundrumRow, worksheetRow };
}

export function joinSheetTabs(
  conundrumRows: string[][],
  worksheetRows: string[][],
  options: {
    source: DataSourceMode;
    sourceLabel: string;
    spreadsheetId: string;
    warning?: string;
  }
): ConundrumDatasetResponse {
  if (!conundrumRows.length) {
    throw new Error("Conundrum Database tab is empty.");
  }

  const cHeaders = buildHeaderMap(conundrumRows[0] ?? []);
  const wHeaders = buildHeaderMap(worksheetRows[0] ?? []);

  const rawWorksheetById = new Map<string, string[]>();
  for (let i = 1; i < worksheetRows.length; i++) {
    const row = worksheetRows[i];
    const cardId = getByHeader(row, wHeaders, ["Card ID"], 0).toUpperCase();
    if (!cardId) continue;
    rawWorksheetById.set(cardId, row);
  }

  const cards: ConundrumRecord[] = [];
  const themeCounts: Record<string, number> = {};
  for (const theme of CANONICAL_THEMES) {
    themeCounts[theme] = 0;
  }
  const statusSet = new Set<string>();

  for (let i = 1; i < conundrumRows.length; i++) {
    const row = conundrumRows[i];
    const cardId = getByHeader(row, cHeaders, ["Card ID"], 0).toUpperCase();
    if (!cardId) continue;

    const title = getByHeader(row, cHeaders, ["Title"], 1);
    const category = getByHeader(row, cHeaders, ["Category / Theme"], 2);
    const objective = getByHeader(row, cHeaders, ["Objective"], 3);

    const requirements = [1, 2, 3, 4, 5]
      .map((n) =>
        parseRequirement(
          getByHeader(row, cHeaders, [`Requirement ${n}`], 3 + n),
          n
        )
      )
      .filter((r): r is RequirementItem => r !== null);

    const deliverables = getByHeader(row, cHeaders, ["Deliverables"], 9);
    const disciplinesRaw = getByHeader(
      row,
      cHeaders,
      ["Focus Areas / Disciplines"],
      10
    );
    const disciplines = disciplinesRaw
      ? disciplinesRaw
          .split(",")
          .map((d) => d.trim())
          .filter(Boolean)
      : [];

    const status = getByHeader(row, cHeaders, ["Status"], 11) || "Active";
    const notes = getByHeader(row, cHeaders, ["Notes"], 12);

    statusSet.add(status);
    if (category) {
      themeCounts[category] = (themeCounts[category] ?? 0) + 1;
    }

    const rawWRow = rawWorksheetById.get(cardId);
    const worksheet = rawWRow
      ? parseWorksheetRow(rawWRow, wHeaders, {
          title,
          category,
          objective,
          requirements,
          deliverables,
          disciplines,
        })
      : null;

    cards.push({
      cardId,
      title,
      category,
      objective,
      requirements,
      deliverables,
      disciplines,
      disciplinesRaw,
      status,
      notes,
      worksheet,
    });
  }

  const activeCount = cards.filter(
    (c) => c.status.toLowerCase() === "active"
  ).length;

  return {
    cards,
    meta: {
      source: options.source,
      sourceLabel: options.sourceLabel,
      spreadsheetId: options.spreadsheetId,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${options.spreadsheetId}/edit`,
      fetchedAt: new Date().toISOString(),
      totalCount: cards.length,
      activeCount,
      themeCounts,
      statuses: Array.from(statusSet),
      warning: options.warning,
    },
  };
}

function base64UrlEncode(input: string | Buffer): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function getServiceAccountAccessToken(
  clientEmail: string,
  privateKeyRaw: string,
  scope = "https://www.googleapis.com/auth/spreadsheets"
): Promise<string> {
  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64UrlEncode(
    JSON.stringify({
      iss: clientEmail,
      scope,
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    })
  );

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(`${header}.${claim}`);
  signer.end();
  const signature = base64UrlEncode(signer.sign(privateKey));
  const assertion = `${header}.${claim}.${signature}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    throw new Error(
      `Service account auth failed (${tokenRes.status}): ${errText}`
    );
  }

  const tokenJson = (await tokenRes.json()) as { access_token?: string };
  if (!tokenJson.access_token) {
    throw new Error(
      "Service account token response did not include access_token."
    );
  }
  return tokenJson.access_token;
}

async function fetchBatchFromSheetsApi(
  spreadsheetId: string,
  conundrumTab: string,
  worksheetTab: string,
  auth: { accessToken?: string; apiKey?: string }
): Promise<{ conundrumRows: string[][]; worksheetRows: string[][] }> {
  const ranges = [
    `'${conundrumTab}'!A1:M500`,
    `'${worksheetTab}'!A1:BL500`,
  ];
  const params = new URLSearchParams();
  ranges.forEach((r) => params.append("ranges", r));
  if (auth.apiKey) {
    params.set("key", auth.apiKey);
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
    spreadsheetId
  )}/values:batchGet?${params.toString()}`;

  const headers: Record<string, string> = {};
  if (auth.accessToken) {
    headers.Authorization = `Bearer ${auth.accessToken}`;
  }

  const res = await fetch(url, { headers, cache: "no-store" });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Sheets API error (${res.status}): ${errText}`);
  }

  const json = (await res.json()) as {
    valueRanges?: Array<{ values?: string[][] }>;
  };

  const conundrumRows = json.valueRanges?.[0]?.values ?? [];
  const worksheetRows = json.valueRanges?.[1]?.values ?? [];
  return { conundrumRows, worksheetRows };
}

async function appendRowToSheetsApi(
  spreadsheetId: string,
  range: string,
  row: string[],
  accessToken: string
): Promise<void> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
    spreadsheetId
  )}/values/${encodeURIComponent(
    range
  )}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values: [row] }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed appending to ${range} (${res.status}): ${errText}`);
  }
}

async function updateRowInSheetsApi(
  spreadsheetId: string,
  range: string,
  row: string[],
  accessToken: string
): Promise<void> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
    spreadsheetId
  )}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values: [row] }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed updating ${range} (${res.status}): ${errText}`);
  }
}

async function fetchFromAppsScript(
  appsScriptUrl: string
): Promise<{ conundrumRows: string[][]; worksheetRows: string[][] }> {
  const res = await fetch(appsScriptUrl, {
    redirect: "follow",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Apps Script endpoint returned HTTP ${res.status}`);
  }
  const json = (await res.json()) as {
    conundrumRows?: string[][];
    worksheetRows?: string[][];
    error?: string;
  };
  if (json.error) {
    throw new Error(`Apps Script error: ${json.error}`);
  }
  return {
    conundrumRows: json.conundrumRows ?? [],
    worksheetRows: json.worksheetRows ?? [],
  };
}

function getSnapshotPaths() {
  const dataDir = path.join(process.cwd(), "src", "data");
  return {
    conundrumPath: path.join(dataDir, "raw-conundrums.json"),
    worksheetPath: path.join(dataDir, "raw-worksheets.json"),
  };
}

function loadFallbackSnapshot(
  spreadsheetId: string,
  warning?: string
): ConundrumDatasetResponse {
  const { conundrumPath, worksheetPath } = getSnapshotPaths();
  const conundrumRows = JSON.parse(
    fs.readFileSync(conundrumPath, "utf8")
  ) as string[][];
  const worksheetRows = JSON.parse(
    fs.readFileSync(worksheetPath, "utf8")
  ) as string[][];

  return joinSheetTabs(conundrumRows, worksheetRows, {
    source: "fallback-snapshot",
    sourceLabel: `Local Sheet Snapshot (${Math.max(0, conundrumRows.length - 1)} Cards)`,
    spreadsheetId,
    warning,
  });
}

export async function loadConundrumDataset(options?: {
  forceRefresh?: boolean;
}): Promise<ConundrumDatasetResponse> {
  const ttlSeconds = Number(process.env.SHEETS_CACHE_TTL_SECONDS || 300);
  if (
    !options?.forceRefresh &&
    memoryCache &&
    Date.now() < memoryCache.expiresAt
  ) {
    return memoryCache.data;
  }

  const spreadsheetId =
    process.env.GOOGLE_SHEETS_SPREADSHEET_ID || DEFAULT_SPREADSHEET_ID;
  const conundrumTab =
    process.env.GOOGLE_SHEETS_CONUNDRUM_TAB || DEFAULT_CONUNDRUM_TAB;
  const worksheetTab =
    process.env.GOOGLE_SHEETS_WORKSHEET_TAB || DEFAULT_WORKSHEET_TAB;

  const serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const serviceKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
  const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

  let dataset: ConundrumDatasetResponse;

  try {
    if (serviceEmail && serviceKey) {
      const accessToken = await getServiceAccountAccessToken(
        serviceEmail,
        serviceKey
      );
      const { conundrumRows, worksheetRows } = await fetchBatchFromSheetsApi(
        spreadsheetId,
        conundrumTab,
        worksheetTab,
        { accessToken }
      );
      dataset = joinSheetTabs(conundrumRows, worksheetRows, {
        source: "service-account",
        sourceLabel: "Live Google Sheet (Service Account)",
        spreadsheetId,
      });
    } else if (appsScriptUrl) {
      const { conundrumRows, worksheetRows } =
        await fetchFromAppsScript(appsScriptUrl);
      dataset = joinSheetTabs(conundrumRows, worksheetRows, {
        source: "apps-script",
        sourceLabel: "Live Google Sheet (Apps Script)",
        spreadsheetId,
      });
    } else if (apiKey) {
      const { conundrumRows, worksheetRows } = await fetchBatchFromSheetsApi(
        spreadsheetId,
        conundrumTab,
        worksheetTab,
        { apiKey }
      );
      dataset = joinSheetTabs(conundrumRows, worksheetRows, {
        source: "api-key",
        sourceLabel: "Live Google Sheet (API Key)",
        spreadsheetId,
      });
    } else {
      dataset = loadFallbackSnapshot(spreadsheetId);
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown Google Sheets error";
    dataset = loadFallbackSnapshot(
      spreadsheetId,
      `Live Google Sheets sync failed (${message}). Showing local snapshot.`
    );
  }

  memoryCache = {
    expiresAt: Date.now() + Math.max(10, ttlSeconds) * 1000,
    data: dataset,
  };

  return dataset;
}

export async function saveConundrumRecord(
  action: "create" | "update",
  payload: ConundrumFormPayload
): Promise<SaveConundrumResponse> {
  const cardId = cleanCell(payload.cardId).toUpperCase();
  const lookupId = cleanCell(payload.originalCardId || cardId).toUpperCase();

  if (!cardId) {
    throw new Error("Card ID is required (e.g., CON-085).");
  }
  if (!cleanCell(payload.title)) {
    throw new Error("Title is required.");
  }
  if (!cleanCell(payload.objective)) {
    throw new Error("Objective is required.");
  }

  const { conundrumRow, worksheetRow } = serializeFormToRows(payload);
  const wEndCol =
    worksheetRow.length > 51 ? "BL" : worksheetRow.length > 38 ? "AY" : "AL";

  const spreadsheetId =
    process.env.GOOGLE_SHEETS_SPREADSHEET_ID || DEFAULT_SPREADSHEET_ID;
  const conundrumTab =
    process.env.GOOGLE_SHEETS_CONUNDRUM_TAB || DEFAULT_CONUNDRUM_TAB;
  const worksheetTab =
    process.env.GOOGLE_SHEETS_WORKSHEET_TAB || DEFAULT_WORKSHEET_TAB;

  const serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const serviceKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
  const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

  let message = "";

  if (serviceEmail && serviceKey) {
    const accessToken = await getServiceAccountAccessToken(
      serviceEmail,
      serviceKey,
      "https://www.googleapis.com/auth/spreadsheets"
    );
    const { conundrumRows, worksheetRows } = await fetchBatchFromSheetsApi(
      spreadsheetId,
      conundrumTab,
      worksheetTab,
      { accessToken }
    );

    const existingConundrumIdx = conundrumRows.findIndex(
      (r, idx) => idx > 0 && cleanCell(r[0]).toUpperCase() === lookupId
    );
    const duplicateIdx = conundrumRows.findIndex(
      (r, idx) => idx > 0 && cleanCell(r[0]).toUpperCase() === cardId
    );

    if (action === "create") {
      if (duplicateIdx !== -1) {
        throw new Error(
          `Card ID "${cardId}" already exists in Conundrum Database.`
        );
      }
      await appendRowToSheetsApi(
        spreadsheetId,
        `'${conundrumTab}'!A:M`,
        conundrumRow,
        accessToken
      );
      await appendRowToSheetsApi(
        spreadsheetId,
        `'${worksheetTab}'!A:${wEndCol}`,
        worksheetRow,
        accessToken
      );
      message = `Created ${cardId} in both Google Sheet tabs (Service Account).`;
    } else {
      if (existingConundrumIdx === -1) {
        throw new Error(
          `Card ID "${lookupId}" was not found in Conundrum Database.`
        );
      }
      if (cardId !== lookupId && duplicateIdx !== -1) {
        throw new Error(
          `Cannot rename to "${cardId}" because it already exists.`
        );
      }

      const cRowNum = existingConundrumIdx + 1;
      await updateRowInSheetsApi(
        spreadsheetId,
        `'${conundrumTab}'!A${cRowNum}:M${cRowNum}`,
        conundrumRow,
        accessToken
      );

      const existingWorksheetIdx = worksheetRows.findIndex(
        (r, idx) => idx > 0 && cleanCell(r[0]).toUpperCase() === lookupId
      );
      if (existingWorksheetIdx !== -1) {
        const wRowNum = existingWorksheetIdx + 1;
        await updateRowInSheetsApi(
          spreadsheetId,
          `'${worksheetTab}'!A${wRowNum}:${wEndCol}${wRowNum}`,
          worksheetRow,
          accessToken
        );
      } else {
        await appendRowToSheetsApi(
          spreadsheetId,
          `'${worksheetTab}'!A:${wEndCol}`,
          worksheetRow,
          accessToken
        );
      }
      message = `Updated ${cardId} in both Google Sheet tabs (Service Account).`;
    }
  } else if (appsScriptUrl) {
    const res = await fetch(appsScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      redirect: "follow",
      body: JSON.stringify({
        action,
        originalCardId: lookupId,
        cardId,
        conundrumRow,
        worksheetRow,
      }),
    });

    if (!res.ok) {
      throw new Error(`Apps Script write failed (HTTP ${res.status}).`);
    }
    const json = (await res.json()) as { ok?: boolean; error?: string };
    if (json.error || !json.ok) {
      throw new Error(json.error || "Apps Script rejected write operation.");
    }
    message =
      action === "create"
        ? `Created ${cardId} in both Google Sheet tabs (Apps Script).`
        : `Updated ${cardId} in both Google Sheet tabs (Apps Script).`;
  } else if (apiKey) {
    throw new Error(
      "Google Sheets API Keys are read-only. To write back to your Google Sheet, configure a Service Account (Editor access) or deploy apps-script/Code.gs in .env.local."
    );
  } else {
    const { conundrumPath, worksheetPath } = getSnapshotPaths();
    const conundrumRows = JSON.parse(
      fs.readFileSync(conundrumPath, "utf8")
    ) as string[][];
    const worksheetRows = JSON.parse(
      fs.readFileSync(worksheetPath, "utf8")
    ) as string[][];

    const existingConundrumIdx = conundrumRows.findIndex(
      (r, idx) => idx > 0 && cleanCell(r[0]).toUpperCase() === lookupId
    );
    const duplicateIdx = conundrumRows.findIndex(
      (r, idx) => idx > 0 && cleanCell(r[0]).toUpperCase() === cardId
    );

    if (action === "create") {
      if (duplicateIdx !== -1) {
        throw new Error(`Card ID "${cardId}" already exists.`);
      }
      conundrumRows.push(conundrumRow);
      worksheetRows.push(worksheetRow);
      message = `Created ${cardId} in local snapshot (connect Service Account or Apps Script in .env.local to sync live to Google Sheets).`;
    } else {
      if (existingConundrumIdx === -1) {
        throw new Error(`Card ID "${lookupId}" was not found.`);
      }
      if (cardId !== lookupId && duplicateIdx !== -1) {
        throw new Error(
          `Cannot rename to "${cardId}" because it already exists.`
        );
      }
      conundrumRows[existingConundrumIdx] = conundrumRow;

      const existingWorksheetIdx = worksheetRows.findIndex(
        (r, idx) => idx > 0 && cleanCell(r[0]).toUpperCase() === lookupId
      );
      if (existingWorksheetIdx !== -1) {
        worksheetRows[existingWorksheetIdx] = worksheetRow;
      } else {
        worksheetRows.push(worksheetRow);
      }
      message = `Updated ${cardId} in local snapshot (connect Service Account or Apps Script in .env.local to sync live to Google Sheets).`;
    }

    fs.writeFileSync(conundrumPath, JSON.stringify(conundrumRows, null, 2));
    fs.writeFileSync(worksheetPath, JSON.stringify(worksheetRows, null, 2));
  }

  memoryCache = null;
  const dataset = await loadConundrumDataset({ forceRefresh: true });

  return {
    ok: true,
    action,
    cardId,
    message,
    dataset,
  };
}
