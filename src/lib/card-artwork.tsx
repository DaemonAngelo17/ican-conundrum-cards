import type { ConundrumRecord } from "@/types/conundrum";

export type CrestShape =
  | "hexagon"
  | "shield"
  | "octagon"
  | "diamond"
  | "circle-ring"
  | "arch-seal"
  | "star-badge"
  | "blueprint-frame";

export type TopicIconKey =
  | "city"
  | "mars-rocket"
  | "lunar-dome"
  | "asteroid"
  | "satellite-orbit"
  | "radio-dish"
  | "ice-moon"
  | "solar-orbit"
  | "dna-bio"
  | "energy-solar"
  | "battery-bolt"
  | "water-ocean"
  | "coral-reef"
  | "glacier-ice"
  | "forest-eco"
  | "soil-sprout"
  | "fabric-recycle"
  | "history-scroll"
  | "theater-art"
  | "ancient-tablet"
  | "memorial-dove"
  | "ai-brain"
  | "bci-wave"
  | "robot-chip"
  | "cyber-shield"
  | "deepfake-eye"
  | "bioacoustic"
  | "justice-scales"
  | "globe-society"
  | "economy-chart"
  | "housing-roof"
  | "food-grain"
  | "philosophy-lamp"
  | "hourglass-life"
  | "health-med"
  | "space-atom"
  | "cloud-sky";

export interface CardVisualIdentity {
  cardNumber: number;
  motifLabel: string;
  crestShape: CrestShape;
  accentHue: string;
  headerBg: string;
  headerBorder: string;
  accentBar: string;
  emblemBg: string;
  emblemBorder: string;
  emblemColor: string;
  pillBg: string;
  pillText: string;
  numBadgeBg: string;
  deliverableBg: string;
  deliverableBorder: string;
  deliverableTitle: string;
  patternStroke: string;
  patternType: "topo" | "arch" | "orbit" | "circuit" | "globe" | "sacred";
  iconKey: TopicIconKey;
}

const CREST_SHAPES: CrestShape[] = [
  "hexagon",
  "shield",
  "octagon",
  "circle-ring",
  "arch-seal",
  "diamond",
  "star-badge",
  "blueprint-frame",
];

function parseCardNumber(cardId: string): number {
  const match = /(\d+)/.exec(cardId);
  return match ? Number.parseInt(match[1], 10) : 1;
}

function getThemePalette(
  category: string,
  cardNum: number
): Omit<CardVisualIdentity, "iconKey" | "motifLabel" | "crestShape" | "cardNumber"> {
  const c = category.toLowerCase();
  const variant = cardNum % 3;

  if (c.includes("sustain") || c.includes("environ")) {
    const gradients = [
      "from-emerald-950 via-emerald-800 to-teal-800",
      "from-teal-950 via-emerald-900 to-green-800",
      "from-green-950 via-teal-800 to-emerald-800",
    ];
    return {
      accentHue: ["#34d399", "#2dd4bf", "#4ade80"][variant],
      headerBg: gradients[variant],
      headerBorder: "border-emerald-700/40",
      accentBar: "bg-emerald-600",
      emblemBg: "bg-emerald-50/15",
      emblemBorder: "border-emerald-300/45",
      emblemColor: "text-emerald-200",
      pillBg: "bg-emerald-50",
      pillText: "text-emerald-900",
      numBadgeBg: "bg-emerald-800",
      deliverableBg: "bg-emerald-50/75",
      deliverableBorder: "border-emerald-200",
      deliverableTitle: "text-emerald-900",
      patternStroke: "rgba(167, 243, 208, 0.16)",
      patternType: "topo",
    };
  }
  if (c.includes("history") || c.includes("culture")) {
    const gradients = [
      "from-amber-950 via-amber-900 to-orange-900",
      "from-stone-900 via-amber-900 to-yellow-900",
      "from-orange-950 via-amber-900 to-stone-800",
    ];
    return {
      accentHue: ["#fbbf24", "#fb923c", "#facc15"][variant],
      headerBg: gradients[variant],
      headerBorder: "border-amber-700/40",
      accentBar: "bg-amber-600",
      emblemBg: "bg-amber-50/15",
      emblemBorder: "border-amber-300/45",
      emblemColor: "text-amber-200",
      pillBg: "bg-amber-50",
      pillText: "text-amber-900",
      numBadgeBg: "bg-amber-800",
      deliverableBg: "bg-amber-50/75",
      deliverableBorder: "border-amber-200",
      deliverableTitle: "text-amber-950",
      patternStroke: "rgba(253, 230, 138, 0.16)",
      patternType: "arch",
    };
  }
  if (c.includes("science") || c.includes("space")) {
    const gradients = [
      "from-slate-950 via-blue-950 to-sky-900",
      "from-blue-950 via-indigo-950 to-cyan-900",
      "from-sky-950 via-slate-900 to-blue-900",
    ];
    return {
      accentHue: ["#38bdf8", "#60a5fa", "#22d3ee"][variant],
      headerBg: gradients[variant],
      headerBorder: "border-sky-700/40",
      accentBar: "bg-blue-600",
      emblemBg: "bg-sky-50/15",
      emblemBorder: "border-sky-300/45",
      emblemColor: "text-sky-200",
      pillBg: "bg-blue-50",
      pillText: "text-blue-900",
      numBadgeBg: "bg-blue-800",
      deliverableBg: "bg-blue-50/70",
      deliverableBorder: "border-blue-200",
      deliverableTitle: "text-blue-950",
      patternStroke: "rgba(186, 230, 253, 0.16)",
      patternType: "orbit",
    };
  }
  if (c.includes("tech") || c.includes("ai")) {
    const gradients = [
      "from-slate-950 via-indigo-950 to-violet-900",
      "from-indigo-950 via-slate-900 to-blue-900",
      "from-violet-950 via-indigo-900 to-slate-900",
    ];
    return {
      accentHue: ["#818cf8", "#a78bfa", "#38bdf8"][variant],
      headerBg: gradients[variant],
      headerBorder: "border-indigo-700/40",
      accentBar: "bg-indigo-600",
      emblemBg: "bg-indigo-50/15",
      emblemBorder: "border-indigo-300/45",
      emblemColor: "text-indigo-200",
      pillBg: "bg-indigo-50",
      pillText: "text-indigo-900",
      numBadgeBg: "bg-indigo-800",
      deliverableBg: "bg-indigo-50/70",
      deliverableBorder: "border-indigo-200",
      deliverableTitle: "text-indigo-950",
      patternStroke: "rgba(199, 210, 254, 0.17)",
      patternType: "circuit",
    };
  }
  if (c.includes("society") || c.includes("global")) {
    const gradients = [
      "from-rose-950 via-rose-900 to-pink-900",
      "from-red-950 via-rose-900 to-amber-950",
      "from-pink-950 via-rose-900 to-slate-900",
    ];
    return {
      accentHue: ["#fb7185", "#f472b6", "#fda4af"][variant],
      headerBg: gradients[variant],
      headerBorder: "border-rose-700/40",
      accentBar: "bg-rose-600",
      emblemBg: "bg-rose-50/15",
      emblemBorder: "border-rose-300/45",
      emblemColor: "text-rose-200",
      pillBg: "bg-rose-50",
      pillText: "text-rose-900",
      numBadgeBg: "bg-rose-800",
      deliverableBg: "bg-rose-50/70",
      deliverableBorder: "border-rose-200",
      deliverableTitle: "text-rose-950",
      patternStroke: "rgba(254, 205, 211, 0.16)",
      patternType: "globe",
    };
  }
  const gradients = [
    "from-purple-950 via-purple-900 to-fuchsia-900",
    "from-fuchsia-950 via-purple-900 to-indigo-950",
    "from-violet-950 via-purple-900 to-slate-900",
  ];
  return {
    accentHue: ["#c084fc", "#e879f9", "#a78bfa"][variant],
    headerBg: gradients[variant],
    headerBorder: "border-purple-700/40",
    accentBar: "bg-purple-600",
    emblemBg: "bg-purple-50/15",
    emblemBorder: "border-purple-300/45",
    emblemColor: "text-purple-200",
    pillBg: "bg-purple-50",
    pillText: "text-purple-900",
    numBadgeBg: "bg-purple-800",
    deliverableBg: "bg-purple-50/70",
    deliverableBorder: "border-purple-200",
    deliverableTitle: "text-purple-950",
    patternStroke: "rgba(233, 213, 255, 0.16)",
    patternType: "sacred",
  };
}

function detectTopicIcon(card: ConundrumRecord): {
  iconKey: TopicIconKey;
  motifLabel: string;
} {
  const t = `${card.title} ${card.objective}`.toLowerCase();

  if (/\b(lunar|moon)\b/.test(t)) return { iconKey: "lunar-dome", motifLabel: "Lunar Habitat" };
  if (/\b(asteroid|planetary defense)\b/.test(t)) return { iconKey: "asteroid", motifLabel: "Planetary Defense" };
  if (/\b(orbital debris|kessler|space station|satellite)\b/.test(t)) return { iconKey: "satellite-orbit", motifLabel: "Orbital Systems" };
  if (/\b(first contact|extraterrestrial)\b/.test(t)) return { iconKey: "radio-dish", motifLabel: "Deep-Space Signal" };
  if (/\b(europa|enceladus|subsurface ocean)\b/.test(t)) return { iconKey: "ice-moon", motifLabel: "Ocean Worlds" };
  if (/\b(space-based solar|sbsp|space weather|geomagnetic)\b/.test(t)) return { iconKey: "solar-orbit", motifLabel: "Solar & Space" };
  if (/\b(mars|generation ship|space tourism|space nutrition)\b/.test(t)) return { iconKey: "mars-rocket", motifLabel: "Space Mission" };
  if (/\b(coral reef)\b/.test(t)) return { iconKey: "coral-reef", motifLabel: "Marine Biology" };
  if (/\b(permafrost|arctic|methane)\b/.test(t)) return { iconKey: "glacier-ice", motifLabel: "Cryosphere" };
  if (/\b(soil|phosphorus|agriculture|hunger|micronutrient|food)\b/.test(t)) return { iconKey: "food-grain", motifLabel: "Food & Soil" };
  if (/\b(fast fashion|bio-fabric|circular economy|zero-waste|e-waste)\b/.test(t)) return { iconKey: "fabric-recycle", motifLabel: "Circular Design" };
  if (/\b(housing|city|urban|megacit|multigenerational|heat island|campus)\b/.test(t)) return { iconKey: "city", motifLabel: "Urban Systems" };
  if (/\b(battery|batteries|solid-state|mineral)\b/.test(t)) return { iconKey: "battery-bolt", motifLabel: "Energy Storage" };
  if (/\b(solar|fusion|energy grid|renewable)\b/.test(t)) return { iconKey: "energy-solar", motifLabel: "Clean Energy" };
  if (/\b(ocean|water|desalination|deep-sea|marine)\b/.test(t)) return { iconKey: "water-ocean", motifLabel: "Water & Oceans" };
  if (/\b(gene|genetic|synthetic biology|bioprint|organ|regenerative)\b/.test(t)) return { iconKey: "dna-bio", motifLabel: "Biotechnology" };
  if (/\b(pandemic|vaccine|health|mental|medicine)\b/.test(t)) return { iconKey: "health-med", motifLabel: "Public Health" };
  if (/\b(brain-computer|bci|cognitive|neuromorphic)\b/.test(t)) return { iconKey: "bci-wave", motifLabel: "Neurotech" };
  if (/\b(bioacoustic|animal communication)\b/.test(t)) return { iconKey: "bioacoustic", motifLabel: "Bioacoustics" };
  if (/\b(deepfake|disinformation|misinformation|synthetic media)\b/.test(t)) return { iconKey: "deepfake-eye", motifLabel: "Media Integrity" };
  if (/\b(cyber|encryption|quantum|security)\b/.test(t)) return { iconKey: "cyber-shield", motifLabel: "Cyber & Quantum" };
  if (/\b(geoengineering|carbon capture|sky|climate|digital twin)\b/.test(t)) return { iconKey: "cloud-sky", motifLabel: "Climate Systems" };
  if (/\b(ai|artificial intelligence|algorithm|sentient|autonomous|robot)\b/.test(t)) return { iconKey: "ai-brain", motifLabel: "AI & Autonomy" };
  if (/\b(ancient script|scroll|language|oral epic|storytelling)\b/.test(t)) return { iconKey: "ancient-tablet", motifLabel: "Living Heritage" };
  if (/\b(peace memorial|post-conflict|just war|diplomacy|interfaith)\b/.test(t)) return { iconKey: "memorial-dove", motifLabel: "Peace & Memory" };
  if (/\b(pop culture|museum|expo|recreation|heritage|indigenous)\b/.test(t)) return { iconKey: "theater-art", motifLabel: "Culture & Arts" };
  if (/\b(history|archaeology|trade network)\b/.test(t)) return { iconKey: "history-scroll", motifLabel: "Historical Inquiry" };
  if (/\b(longevity|immortality|griefbot|death|future generation)\b/.test(t)) return { iconKey: "hourglass-life", motifLabel: "Time & Ethics" };
  if (/\b(justice|law|ethics|politics|public opinion|rights|truth)\b/.test(t)) return { iconKey: "justice-scales", motifLabel: "Ethics & Law" };
  if (/\b(debt|economy|work|automation|micro-insurance|humanitarian)\b/.test(t)) return { iconKey: "economy-chart", motifLabel: "Global Economy" };
  if (/\b(dark matter|observator|physics)\b/.test(t)) return { iconKey: "space-atom", motifLabel: "Astrophysics" };
  if (/\b(rewild|biodiversity|environment|stewardship)\b/.test(t)) return { iconKey: "forest-eco", motifLabel: "Ecology" };
  if (/\b(purpose|meaning|wisdom|philosophy|religion|craft)\b/.test(t)) return { iconKey: "philosophy-lamp", motifLabel: "Philosophy" };

  return { iconKey: "globe-society", motifLabel: card.category };
}

export function getCardVisualIdentity(card: ConundrumRecord): CardVisualIdentity {
  const cardNumber = parseCardNumber(card.cardId);
  const palette = getThemePalette(card.category, cardNumber);
  const topic = detectTopicIcon(card);
  const crestShape = CREST_SHAPES[(cardNumber - 1) % CREST_SHAPES.length];

  return {
    cardNumber,
    crestShape,
    ...palette,
    ...topic,
  };
}

function CrestFramePath({ shape, stroke }: { shape: CrestShape; stroke: string }) {
  switch (shape) {
    case "hexagon":
      return <polygon points="32,3 57,17.5 57,46.5 32,61 7,46.5 7,17.5" fill="none" stroke={stroke} strokeWidth="2" />;
    case "shield":
      return <path d="M32 4 L56 12 V31 C56 46 45 55 32 60 C19 55 8 46 8 31 V12 Z" fill="none" stroke={stroke} strokeWidth="2" />;
    case "octagon":
      return <polygon points="20,4 44,4 60,20 60,44 44,60 20,60 4,44 4,20" fill="none" stroke={stroke} strokeWidth="2" />;
    case "diamond":
      return <polygon points="32,3 61,32 32,61 3,32" fill="none" stroke={stroke} strokeWidth="2" />;
    case "arch-seal":
      return <path d="M10 58 V26 A22 22 0 0 1 54 26 V58 Z" fill="none" stroke={stroke} strokeWidth="2" />;
    case "star-badge":
      return (
        <g fill="none" stroke={stroke} strokeWidth="1.8">
          <circle cx="32" cy="32" r="27" />
          <circle cx="32" cy="32" r="22" strokeDasharray="3 3" />
        </g>
      );
    case "blueprint-frame":
      return (
        <g fill="none" stroke={stroke} strokeWidth="1.8">
          <rect x="6" y="6" width="52" height="52" rx="10" />
          <path d="M6 16h5M53 16h5M6 48h5M53 48h5" />
        </g>
      );
    case "circle-ring":
    default:
      return (
        <g fill="none" stroke={stroke} strokeWidth="2">
          <circle cx="32" cy="32" r="28" />
          <circle cx="32" cy="32" r="24" strokeOpacity="0.45" />
        </g>
      );
  }
}

export function TopicIconPaths({ iconKey }: { iconKey: TopicIconKey }) {
  switch (iconKey) {
    case "city":
      return (
        <>
          <path d="M16 44h32M20 44V27h7v17M29 44V19h9v25M40 44V30h6v14" />
          <circle cx="22" cy="21" r="2.5" />
        </>
      );
    case "lunar-dome":
      return (
        <>
          <path d="M16 42h32M20 42a12 12 0 0 1 24 0" />
          <path d="M26 42v-8a6 6 0 0 1 12 0v8M42 20a5 5 0 1 1-4-4 4 4 0 0 0 4 4z" />
        </>
      );
    case "asteroid":
      return (
        <>
          <circle cx="36" cy="36" r="8" />
          <path d="M16 18l11 11M22 16l8 8M16 25l8 8" />
          <circle cx="34" cy="34" r="1.5" />
          <circle cx="39" cy="38" r="1" />
        </>
      );
    case "satellite-orbit":
      return (
        <>
          <rect x="27" y="27" width="10" height="10" rx="2" />
          <path d="M16 29h11v6H16zM37 29h11v6H37zM32 27v-6M32 43v-6" />
          <ellipse cx="32" cy="32" rx="18" ry="6" transform="rotate(-25 32 32)" strokeOpacity="0.55" />
        </>
      );
    case "radio-dish":
      return (
        <>
          <path d="M20 44h24M32 44v-8M22 24a14 14 0 0 0 20 12L22 24z" />
          <path d="M35 23a5 5 0 0 1 6 6M38 18a10 10 0 0 1 10 10" />
        </>
      );
    case "ice-moon":
      return (
        <>
          <circle cx="32" cy="32" r="13" />
          <path d="M20 34c4-2 8-2 12 0s8 2 12 0M24 25l6 3 6-4 5 2" />
        </>
      );
    case "solar-orbit":
      return (
        <>
          <circle cx="32" cy="22" r="4.5" />
          <path d="M18 42l4-10h20l4 10H18zM26 32l-1.5 10M32 32v10M38 32l1.5 10" />
        </>
      );
    case "mars-rocket":
      return (
        <>
          <circle cx="39" cy="38" r="7" />
          <path d="M22 33c0-7 4-13 7-15 3 2 7 8 7 15" />
          <path d="M22 33l-3 4h5M36 33l3 4h-5" />
          <circle cx="29" cy="27" r="2" />
        </>
      );
    case "coral-reef":
      return (
        <>
          <path d="M32 45V24M32 34l-8-7v-6M32 31l8-6v-6M24 37l-5-4M40 38l5-4M20 45h24" />
        </>
      );
    case "glacier-ice":
      return (
        <>
          <path d="M16 42l8-18 6 7 6-11 10 22H16zM15 46c5-2 10-2 17 0s12 2 17 0" />
        </>
      );
    case "food-grain":
      return (
        <>
          <path d="M32 45V19M32 38c-6 0-9-3-9-8 5 0 9 3 9 8zM32 31c6 0 9-3 9-8-5 0-9 3-9 8zM32 24c-5-2-7-5-7-8 4 0 7 3 7 8z" />
        </>
      );
    case "fabric-recycle":
      return (
        <>
          <path d="M25 22l7-5 7 5M42 30l3 8-7 3M22 30l-3 8 7 3" />
          <path d="M24 22a11 11 0 0 1 16 0M42 36a11 11 0 0 1-14 6M22 36a11 11 0 0 1 2-14" />
        </>
      );
    case "battery-bolt":
      return (
        <>
          <rect x="19" y="21" width="26" height="24" rx="3" />
          <path d="M27 17h10v4H27zM33 26l-5 7h5l-2 7 7-8h-5z" />
        </>
      );
    case "energy-solar":
      return (
        <>
          <circle cx="32" cy="22" r="4.5" />
          <path d="M32 14v2M23 22h2M39 22h2M19 42l4-10h18l4 10H19zM26 32l-1 10M32 32v10M38 32l1 10" />
        </>
      );
    case "water-ocean":
      return (
        <>
          <path d="M32 16c-5 7-9 11-9 16a9 9 0 0 0 18 0c0-5-4-9-9-16z" />
          <path d="M17 44c4-2 7-2 10 0s6 2 10 0 7-2 10 0" />
        </>
      );
    case "dna-bio":
      return (
        <>
          <path d="M24 17c0 8 16 8 16 15s-16 7-16 15" />
          <path d="M40 17c0 8-16 8-16 15s16 7 16 15" />
          <path d="M26 22h12M27 32h10M26 42h12" />
        </>
      );
    case "health-med":
      return (
        <>
          <rect x="18" y="22" width="28" height="22" rx="4" />
          <path d="M27 22v-4h10v4M32 28v10M27 33h10" />
        </>
      );
    case "bci-wave":
      return (
        <>
          <path d="M20 34a12 12 0 1 1 24 0c0 5-3 9-7 10H27c-4-1-7-5-7-10z" />
          <path d="M16 32h6l3-5 4 10 3-5h16" />
        </>
      );
    case "bioacoustic":
      return (
        <>
          <path d="M20 32v-4M25 36v-12M30 40V24M35 37V27M40 34v-4M45 33v-2" />
        </>
      );
    case "deepfake-eye":
      return (
        <>
          <path d="M16 32s6-10 16-10 16 10 16 10-6 10-16 10-16-10-16-10z" />
          <circle cx="32" cy="32" r="4.5" />
          <path d="M20 20l24 24" />
        </>
      );
    case "cyber-shield":
      return (
        <>
          <path d="M32 16l13 4v10c0 8-5 13-13 17-8-4-13-9-13-17V20l13-4z" />
          <rect x="27" y="30" width="10" height="8" rx="1.5" />
          <path d="M29 30v-3a3 3 0 0 1 6 0v3" />
        </>
      );
    case "cloud-sky":
      return (
        <>
          <path d="M22 39h21a7 7 0 0 0 1-14 9 9 0 0 0-17-2 6 6 0 0 0-5 16z" />
          <path d="M24 44l2-3M32 44l2-3M40 44l2-3" />
        </>
      );
    case "ai-brain":
      return (
        <>
          <circle cx="32" cy="32" r="5" />
          <circle cx="21" cy="23" r="2.5" />
          <circle cx="43" cy="23" r="2.5" />
          <circle cx="21" cy="41" r="2.5" />
          <circle cx="43" cy="41" r="2.5" />
          <path d="M23 25l5 4M41 25l-5 4M23 39l5-4M41 39l-5-4" />
        </>
      );
    case "ancient-tablet":
      return (
        <>
          <rect x="20" y="17" width="24" height="30" rx="3" />
          <path d="M25 24h14M25 30h10M25 36h14M25 41h8" />
        </>
      );
    case "memorial-dove":
      return (
        <>
          <path d="M18 39c6-2 10-7 13-15 3 5 8 7 15 7-4 5-9 10-18 11l-10-3z" />
          <path d="M31 24l-5-6 9 2" />
        </>
      );
    case "theater-art":
      return (
        <>
          <path d="M19 20h14v11c0 5-3 8-7 9-4-1-7-4-7-9V20z" />
          <path d="M32 24h13v10c0 4-3 7-6.5 8-2.5-.6-4.5-2-5.5-4" />
        </>
      );
    case "history-scroll":
      return (
        <>
          <path d="M19 43h26M22 40h20M24 26v14M30 26v14M34 26v14M40 26v14M18 26h28L32 18 18 26z" />
        </>
      );
    case "hourglass-life":
      return (
        <>
          <path d="M22 18h20M22 46h20M24 18c0 8 8 10 8 14s-8 6-8 14M40 18c0 8-8 10-8 14s8 6 8 14" />
        </>
      );
    case "justice-scales":
      return (
        <>
          <path d="M32 18v26M24 44h16M21 23h22M21 23l-4 9h8l-4-9zM43 23l-4 9h8l-4-9z" />
        </>
      );
    case "economy-chart":
      return (
        <>
          <path d="M18 43h28M18 43V20M22 37l6-7 5 3 9-10M37 23h5v5" />
        </>
      );
    case "space-atom":
      return (
        <>
          <circle cx="32" cy="32" r="2.5" fill="currentColor" />
          <ellipse cx="32" cy="32" rx="14" ry="5.5" transform="rotate(30 32 32)" />
          <ellipse cx="32" cy="32" rx="14" ry="5.5" transform="rotate(-30 32 32)" />
          <ellipse cx="32" cy="32" rx="14" ry="5.5" transform="rotate(90 32 32)" />
        </>
      );
    case "forest-eco":
      return (
        <>
          <path d="M32 44V29M32 33c-8 0-12-5-12-12 7 0 12 4 12 12zM32 29c8 0 12-5 12-11-7 0-12 3-12 11zM24 44h16" />
        </>
      );
    case "philosophy-lamp":
      return (
        <>
          <path d="M26 39h12M27 43h10M26 35c-3-2-5-5-5-9a11 11 0 1 1 22 0c0 4-2 7-5 9l-1.5 4h-9L26 35z" />
        </>
      );
    case "robot-chip":
      return (
        <>
          <rect x="23" y="23" width="18" height="18" rx="3" />
          <rect x="28" y="28" width="8" height="8" rx="1" />
          <path d="M28 17v6M36 17v6M28 41v6M36 41v6M17 28h6M17 36h6M41 28h6M41 36h6" />
        </>
      );
    case "globe-society":
    default:
      return (
        <>
          <circle cx="32" cy="32" r="13" />
          <ellipse cx="32" cy="32" rx="6" ry="13" />
          <path d="M19 32h26M21 25h22M21 39h22" />
        </>
      );
  }
}

/**
 * Renders a unique custom SVG emblem for each conundrum (CON-001 through CON-084+),
 * combining a topic-matched vector illustration, a per-card deterministic crest
 * frame, theme accent hue, and embedded card number stamp.
 */
export function CustomConundrumEmblem({
  card,
  className = "h-12 w-12",
  showStamp = true,
}: {
  card: ConundrumRecord;
  className?: string;
  showStamp?: boolean;
}) {
  const visual = getCardVisualIdentity(card);
  const stamp = String(visual.cardNumber).padStart(2, "0");

  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-label={`${card.cardId} custom emblem: ${visual.motifLabel}`}
    >
      <CrestFramePath shape={visual.crestShape} stroke={visual.accentHue} />
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <TopicIconPaths iconKey={visual.iconKey} />
      </g>
      {showStamp && (
        <g>
          <rect
            x="40"
            y="45"
            width="20"
            height="14"
            rx="4"
            fill="#0f172a"
            stroke={visual.accentHue}
            strokeWidth="1.2"
          />
          <text
            x="50"
            y="55"
            textAnchor="middle"
            fontSize="8.5"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            fontWeight="700"
            fill="#ffffff"
          >
            {stamp}
          </text>
        </g>
      )}
    </svg>
  );
}

export function HeaderBackdropPattern({
  patternType,
  stroke,
}: {
  patternType: CardVisualIdentity["patternType"];
  stroke: string;
}) {
  return (
    <svg
      className="absolute inset-0 h-full w-full pointer-events-none select-none"
      viewBox="0 0 600 130"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {patternType === "topo" && (
        <g fill="none" stroke={stroke} strokeWidth="1.5">
          <path d="M0 95 Q120 40 240 85 T480 75 T600 50" />
          <path d="M0 115 Q140 65 260 105 T500 95 T600 72" />
          <path d="M0 60 Q160 15 310 55 T600 25" />
        </g>
      )}
      {patternType === "arch" && (
        <g fill="none" stroke={stroke} strokeWidth="1.2">
          <path d="M40 130 V55 A45 45 0 0 1 130 55 V130" />
          <path d="M160 130 V55 A45 45 0 0 1 250 55 V130" />
          <path d="M420 130 V45 A65 65 0 0 1 550 45 V130" />
          <line x1="0" y1="22" x2="600" y2="22" strokeDasharray="4 6" />
        </g>
      )}
      {patternType === "orbit" && (
        <g fill="none" stroke={stroke} strokeWidth="1.2">
          <ellipse cx="520" cy="65" rx="140" ry="48" transform="rotate(-12 520 65)" />
          <ellipse cx="520" cy="65" rx="95" ry="30" transform="rotate(14 520 65)" />
          <circle cx="430" cy="30" r="2.5" fill={stroke} />
          <circle cx="565" cy="95" r="2" fill={stroke} />
          <circle cx="110" cy="25" r="1.8" fill={stroke} />
          <circle cx="290" cy="98" r="1.5" fill={stroke} />
        </g>
      )}
      {patternType === "circuit" && (
        <g fill="none" stroke={stroke} strokeWidth="1.3">
          <path d="M360 20 H440 L465 45 H560" />
          <path d="M390 105 H470 L495 80 H585" />
          <path d="M480 20 V55 L510 85 V125" />
          <circle cx="440" cy="20" r="3" fill={stroke} />
          <circle cx="560" cy="45" r="3" fill={stroke} />
          <circle cx="470" cy="105" r="3" fill={stroke} />
          <circle cx="585" cy="80" r="3" fill={stroke} />
        </g>
      )}
      {patternType === "globe" && (
        <g fill="none" stroke={stroke} strokeWidth="1.2">
          <circle cx="535" cy="68" r="72" />
          <ellipse cx="535" cy="68" rx="34" ry="72" />
          <line x1="463" y1="68" x2="600" y2="68" />
          <line x1="474" y1="36" x2="596" y2="36" />
          <line x1="474" y1="100" x2="596" y2="100" />
        </g>
      )}
      {patternType === "sacred" && (
        <g fill="none" stroke={stroke} strokeWidth="1.2">
          <circle cx="515" cy="65" r="46" />
          <circle cx="545" cy="65" r="46" />
          <circle cx="530" cy="40" r="46" />
          <circle cx="530" cy="90" r="46" />
        </g>
      )}
    </svg>
  );
}
