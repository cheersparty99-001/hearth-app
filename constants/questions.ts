export type ChoiceId = "a" | "b" | "c" | "d";

export interface Choice {
  id: ChoiceId;
  icon: string;
  title: string;
  description: string;
}

export interface Question {
  id: number;
  chapter: string;
  scenario: string;
  question: string;
  choices: Choice[];
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    chapter: "Relationships & Belonging",
    scenario:
      "You receive an exciting job offer in a new city. It promises growth, but means leaving the people closest to you behind.",
    question: "What matters most to you in this moment?",
    choices: [
      {
        id: "a",
        icon: "💼",
        title: "Embrace Growth",
        description: "Take the leap — this opportunity calls to me.",
      },
      {
        id: "b",
        icon: "🏡",
        title: "Honor Connection",
        description: "Stay close — the people I love come first.",
      },
      {
        id: "c",
        icon: "⚖️",
        title: "Find Balance",
        description: "Negotiate something that honors both.",
      },
      {
        id: "d",
        icon: "⏳",
        title: "Take More Time",
        description: "I need more information before deciding.",
      },
    ],
  },
  {
    id: 2,
    chapter: "Freedom vs Security",
    scenario:
      "You have saved enough to quit your job and pursue something meaningful. But the safety of a steady paycheck feels hard to release.",
    question: "What do you do?",
    choices: [
      {
        id: "a",
        icon: "🌅",
        title: "Take the Leap",
        description: "Now or never — I choose freedom.",
      },
      {
        id: "b",
        icon: "🏠",
        title: "Stay for Now",
        description: "Not the right time — security matters.",
      },
      {
        id: "c",
        icon: "💬",
        title: "Have the Talk",
        description: "Discuss it openly with the people involved.",
      },
      {
        id: "d",
        icon: "🔄",
        title: "Plan Transition",
        description: "Set a date and prepare carefully.",
      },
    ],
  },
  {
    id: 3,
    chapter: "Achievement & Meaning",
    scenario:
      "After five years of dedicated work, your promotion finally arrives — but the role has shifted away from what first made you fall in love with this path.",
    question: "What do you choose?",
    choices: [
      {
        id: "a",
        icon: "📈",
        title: "Take Promotion",
        description: "I earned this — I'll make it work.",
      },
      {
        id: "b",
        icon: "🚶",
        title: "Walk Away",
        description: "Stay put — meaning matters more than title.",
      },
      {
        id: "c",
        icon: "🗣️",
        title: "Speak Up",
        description: "Voice my disagreement and reshape the role.",
      },
      {
        id: "d",
        icon: "🔍",
        title: "Understand First",
        description: "Ask questions before I commit.",
      },
    ],
  },
  {
    id: 4,
    chapter: "Loss & Letting Go",
    scenario:
      "Your closest friend hurt you deeply. They've reached out to make amends — sincere, vulnerable, asking for another chance.",
    question: "What do you do?",
    choices: [
      {
        id: "a",
        icon: "💚",
        title: "Forgive Fully",
        description: "Rebuild — our bond is worth it.",
      },
      {
        id: "b",
        icon: "🌊",
        title: "Allow Distance",
        description: "Things have changed — I let it go.",
      },
      {
        id: "c",
        icon: "🤝",
        title: "Forgive Slowly",
        description: "I need time to rebuild trust.",
      },
      {
        id: "d",
        icon: "💭",
        title: "Reflect First",
        description: "I'm not ready to decide yet.",
      },
    ],
  },
  {
    id: 5,
    chapter: "The True Self",
    scenario:
      "If no one was watching, no one would judge, and no consequences could follow — there is something you've been carrying for a long time.",
    question: "Choose what resonates.",
    choices: [
      {
        id: "a",
        icon: "🚪",
        title: "Leave Something",
        description: "I've stayed too long in a place I've outgrown.",
      },
      {
        id: "b",
        icon: "👁️",
        title: "Be Seen",
        description: "I'd let someone truly see me.",
      },
      {
        id: "c",
        icon: "🌱",
        title: "Start Something",
        description: "There's something I've been afraid to start.",
      },
      {
        id: "d",
        icon: "🤫",
        title: "Say Something",
        description: "There are words I've never said aloud.",
      },
    ],
  },
];

export const DAILY_QUOTES: { text: string; author: string }[] = [
  {
    text: "Between stimulus and response there is a space. In that space is our power to choose our response.",
    author: "Viktor Frankl",
  },
  {
    text: "The wound is the place where the Light enters you.",
    author: "Rumi",
  },
  {
    text: "What you seek is seeking you.",
    author: "Rumi",
  },
  {
    text: "Out of suffering have emerged the strongest souls; the most massive characters are seared with scars.",
    author: "Kahlil Gibran",
  },
  {
    text: "The privilege of a lifetime is to become who you truly are.",
    author: "Carl Jung",
  },
  {
    text: "We do not see things as they are, we see them as we are.",
    author: "Anaïs Nin",
  },
  {
    text: "Owning our story and loving ourselves through that process is the bravest thing we'll ever do.",
    author: "Brené Brown",
  },
];
