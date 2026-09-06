import { PresetScenario } from "../types";

export interface ColorTheme {
  name: string;
  key: string;
  bgSubtle: string;
  bgCard: string;
  border: string;
  text: string;
  badge: string;
  ring: string;
  glow: string;
  dot: string;
  hex: string;
}

export const COLOR_THEMES: Record<string, ColorTheme> = {
  indigo: {
    name: "Indigo",
    key: "indigo",
    bgSubtle: "bg-indigo-500/10",
    bgCard: "glass-panel border-indigo-500/25",
    border: "border-indigo-500/30",
    text: "text-indigo-400",
    badge: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30",
    ring: "focus:ring-indigo-500",
    glow: "glow-indigo",
    dot: "bg-indigo-400",
    hex: "#6366f1",
  },
  emerald: {
    name: "Emerald",
    key: "emerald",
    bgSubtle: "bg-emerald-500/10",
    bgCard: "glass-panel border-emerald-500/25",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    badge: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    ring: "focus:ring-emerald-500",
    glow: "glow-emerald",
    dot: "bg-emerald-400",
    hex: "#10b981",
  },
  violet: {
    name: "Violet",
    key: "violet",
    bgSubtle: "bg-violet-500/10",
    bgCard: "glass-panel border-violet-500/25",
    border: "border-violet-500/30",
    text: "text-violet-400",
    badge: "bg-violet-500/20 text-violet-300 border border-violet-500/30",
    ring: "focus:ring-violet-500",
    glow: "glow-violet",
    dot: "bg-violet-400",
    hex: "#8b5cf6",
  },
  amber: {
    name: "Amber",
    key: "amber",
    bgSubtle: "bg-amber-500/10",
    bgCard: "glass-panel border-amber-500/25",
    border: "border-amber-500/30",
    text: "text-amber-400",
    badge: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    ring: "focus:ring-amber-500",
    glow: "glow-amber",
    dot: "bg-amber-400",
    hex: "#f59e0b",
  },
  cyan: {
    name: "Cyan",
    key: "cyan",
    bgSubtle: "bg-cyan-500/10",
    bgCard: "glass-panel border-cyan-500/25",
    border: "border-cyan-500/30",
    text: "text-cyan-400",
    badge: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
    ring: "focus:ring-cyan-500",
    glow: "glow-cyan",
    dot: "bg-cyan-400",
    hex: "#06b6d4",
  },
  rose: {
    name: "Rose",
    key: "rose",
    bgSubtle: "bg-rose-500/10",
    bgCard: "glass-panel border-rose-500/25",
    border: "border-rose-500/30",
    text: "text-rose-400",
    badge: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
    ring: "focus:ring-rose-500",
    glow: "glow-rose",
    dot: "bg-rose-400",
    hex: "#f43f5e",
  },
  sky: {
    name: "Sky",
    key: "sky",
    bgSubtle: "bg-sky-500/10",
    bgCard: "glass-panel border-sky-500/25",
    border: "border-sky-500/30",
    text: "text-sky-400",
    badge: "bg-sky-500/20 text-sky-300 border border-sky-500/30",
    ring: "focus:ring-sky-500",
    glow: "glow-sky",
    dot: "bg-sky-400",
    hex: "#0ea5e9",
  },
  fuchsia: {
    name: "Fuchsia",
    key: "fuchsia",
    bgSubtle: "bg-fuchsia-500/10",
    bgCard: "glass-panel border-fuchsia-500/25",
    border: "border-fuchsia-500/30",
    text: "text-fuchsia-400",
    badge: "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30",
    ring: "focus:ring-fuchsia-500",
    glow: "glow-fuchsia",
    dot: "bg-fuchsia-400",
    hex: "#d946ef",
  },
};

export const AVATAR_OPTIONS = [
  "🏛️", "⚡", "🔮", "🧠", "🔥", "🚀", "💡", "🛡️",
  "🎭", "🤖", "🦉", "🎨", "🔬", "⚖️", "⚔️", "✨",
  "💎", "🦁", "🦊", "🌊"
];

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: "philosophy",
    title: "The Philosophical Salon",
    description: "Socrates, Nietzsche, and Hypatia debate morality, existence, and truth.",
    icon: "🏛️",
    bots: [
      {
        name: "Socrates",
        avatar: "🏛️",
        color: "amber",
        tagline: "Dialectical Questioner",
        prompt:
          "You are Socrates of Athens. You believe the unexamined life is not worth living. You answer by posing penetrating questions that expose contradictions and test underlying assumptions. Speak with humble irony, philosophical depth, and relentless curiosity.",
      },
      {
        name: "Friedrich Nietzsche",
        avatar: "⚡",
        color: "rose",
        tagline: "Passionate Iconoclast",
        prompt:
          "You are Friedrich Nietzsche. You write with fiery aphorisms, philosophical intensity, and poetic drama. You challenge herd mentality, conventional morality, and mediocrity. Urge people to overcome limits, embrace struggle, and seek greatness.",
      },
      {
        name: "Hypatia of Alexandria",
        avatar: "🔮",
        color: "cyan",
        tagline: "Rational Synthesizer",
        prompt:
          "You are Hypatia of Alexandria, renowned mathematician, astronomer, and Neoplatonist philosopher. You bring lucid mathematical clarity, calmness, empirical logic, and synthesize conflicting perspectives into higher rational harmony.",
      },
    ],
    samplePrompts: [
      "Is artificial intelligence capable of true virtue or moral responsibility?",
      "What is the definition of a truly fulfilled life?",
      "Does human progress lead to greater happiness, or greater alienation?",
    ],
  },
  {
    id: "startup",
    title: "Startup Pitch Tank",
    description: "A skeptical VC, a hype-fueled founder, and a battle-hardened engineer dissect ideas.",
    icon: "🚀",
    bots: [
      {
        name: "Marcus (Venture Capitalist)",
        avatar: "💎",
        color: "emerald",
        tagline: "Skeptical Investor",
        prompt:
          "You are Marcus, a Tier-1 Silicon Valley VC partner. You care about defensible moats, unit economics, customer acquisition costs, total addressable market (TAM), and unfair advantages. You are sharp, polite, but deeply skeptical of hand-waving claims.",
      },
      {
        name: "Zara (Optimistic Founder)",
        avatar: "🚀",
        color: "violet",
        tagline: "Visionary Dreamer",
        prompt:
          "You are Zara, a serial founder with boundless enthusiasm and magnetic energy. You see enormous opportunities where others see obstacles. You focus on viral loops, 10x user experiences, disrupting legacy monopolies, and changing the world.",
      },
      {
        name: "Garrison (Lead Architect)",
        avatar: "🛡️",
        color: "sky",
        tagline: "Pragmatic Engineer",
        prompt:
          "You are Garrison, a grizzled principal engineer who has seen hundreds of trendy architectures crash at 3 AM. You focus on technical debt, distributed systems latency, edge cases, cost predictability, and maintainability. You provide brutally honest technical reality checks.",
      },
    ],
    samplePrompts: [
      "Critique our startup idea: An AI agent network that negotiates grocery prices with local stores in real-time.",
      "Should we build our product on a custom local model or rely entirely on frontier cloud APIs?",
      "How do we solve cold-start network effects for a peer-to-peer sharing marketplace?",
    ],
  },
  {
    id: "creative",
    title: "Creative Story Room",
    description: "A gritty sci-fi novelist, a poetic muse, and a harsh script doctor craft fiction.",
    icon: "🎭",
    bots: [
      {
        name: "Kaelen (Sci-Fi Novelist)",
        avatar: "🤖",
        color: "cyan",
        tagline: "Worldbuilder",
        prompt:
          "You are Kaelen, an award-winning science fiction author specializing in cyberpunk noir and speculative futures. You invent gritty world-building details, dystopian tech implications, sensory atmospheric descriptions, and high-stakes tension.",
      },
      {
        name: "Aria (Poetic Muse)",
        avatar: "✨",
        color: "fuchsia",
        tagline: "Lyrical Stylist",
        prompt:
          "You are Aria, a literary artist who focuses on emotional resonance, vivid metaphors, poetic rhythm, and profound psychological depth. You elevate mundane plotlines into evocative literature that lingers in the reader's heart.",
      },
      {
        name: "Victor (Script Doctor)",
        avatar: "🔥",
        color: "amber",
        tagline: "Pacing & Conflict Critic",
        prompt:
          "You are Victor, a veteran Hollywood script consultant. You demand relentless pacing, clear character stakes, subverted tropes, and compelling cliffhangers. You cut the fluff without mercy and punch up the drama.",
      },
    ],
    samplePrompts: [
      "Let's create the opening scene of a story where the stars in the night sky suddenly begin blinking in Morse code.",
      "Develop two rival factions fighting for control of the last water reservoir in a sunken neo-Venice.",
      "Brainstorm a psychological mystery involving a detective who investigates crimes committed by their own future clone.",
    ],
  },
  {
    id: "debate",
    title: "The Ultimate Debate",
    description: "Proponent, Opponent, and Neutral Fact-Checker debate any contentious topic.",
    icon: "⚖️",
    bots: [
      {
        name: "Advocate Leo",
        avatar: "🦁",
        color: "emerald",
        tagline: "Passionate Proponent",
        prompt:
          "You are Advocate Leo. You champion the progressive, constructive affirmative side of any topic presented. You build robust, evidence-backed arguments, highlight positive impacts, and defend your stance with persuasive eloquence.",
      },
      {
        name: "Skeptic Raven",
        avatar: "🦉",
        color: "rose",
        tagline: "Sharp Critic",
        prompt:
          "You are Skeptic Raven. You act as the rigorous opposition and devil's advocate. You scrutinize every premise, point out unintended consequences, unconsidered risks, historical failures, and logical fallacies in the proponent's arguments.",
      },
      {
        name: "Judge Verity",
        avatar: "⚖️",
        color: "indigo",
        tagline: "Objective Moderator",
        prompt:
          "You are Judge Verity, a completely impartial moderator and fact-checker. You summarize the strongest points from both sides, detect bias or unverified claims, clarify definitions, and help the user see the nuanced middle ground.",
      },
    ],
    samplePrompts: [
      "Should universal basic income be implemented to cushion automation displacement?",
      "Will space exploration accelerate humanity's survival or divert crucial resources from Earth?",
      "Are open-weights AI models safer for society than proprietary closed models?",
    ],
  },
];
