export type ChoiceId = "a" | "b" | "c" | "d";

export type WellnessDimension = "stress" | "anxiety" | "depression" | "sleep";

export const DIMENSION_MAP: Record<ChoiceId, WellnessDimension> = {
  a: "stress",
  b: "anxiety",
  c: "depression",
  d: "sleep",
};

export const QUESTIONS = [
  {
    id: 1,
    scenario: "When you finally have a quiet moment to yourself, what usually happens?",
    choices: [
      { id: "a", title: "I start thinking about unfinished responsibilities." },
      { id: "b", title: "My mind continues running through different possibilities." },
      { id: "c", title: "I do not really feel interested in doing anything." },
      { id: "d", title: "I feel tired and would rather rest." },
    ],
  },
  {
    id: 2,
    scenario: "What is currently affecting your quality of life the most?",
    choices: [
      { id: "a", title: "Too many responsibilities." },
      { id: "b", title: "Too much uncertainty." },
      { id: "c", title: "Lack of enjoyment." },
      { id: "d", title: "Lack of quality rest." },
    ],
  },
  {
    id: 3,
    scenario: "What best describes your mornings?",
    choices: [
      { id: "a", title: "I immediately think about what needs to be done." },
      { id: "b", title: "I feel nervous about the day ahead." },
      { id: "c", title: "I struggle to find motivation." },
      { id: "d", title: "I wake up feeling exhausted." },
    ],
  },
  {
    id: 4,
    scenario: "When facing a challenge, your first reaction is usually:",
    choices: [
      { id: "a", title: "How am I going to handle everything?" },
      { id: "b", title: "What if something goes wrong?" },
      { id: "c", title: "I do not feel like dealing with this." },
      { id: "d", title: "I wish I could just rest." },
    ],
  },
  {
    id: 5,
    scenario: "During your free time, you often:",
    choices: [
      { id: "a", title: "Continue thinking about work or obligations." },
      { id: "b", title: "Find it difficult to stop worrying." },
      { id: "c", title: "Feel emotionally disconnected." },
      { id: "d", title: "Feel sleepy or drained." },
    ],
  },
  {
    id: 6,
    scenario: "Which statement sounds most like you?",
    choices: [
      { id: "a", title: "I often feel under pressure." },
      { id: "b", title: "I often feel on edge." },
      { id: "c", title: "I often feel emotionally low." },
      { id: "d", title: "I often feel physically fatigued." },
    ],
  },
  {
    id: 7,
    scenario: "If you could change one thing immediately, it would be:",
    choices: [
      { id: "a", title: "Reduce my stress." },
      { id: "b", title: "Reduce my worries." },
      { id: "c", title: "Improve my mood." },
      { id: "d", title: "Improve my sleep." },
    ],
  },
  {
    id: 8,
    scenario: "What drains your energy the most?",
    choices: [
      { id: "a", title: "Managing multiple demands." },
      { id: "b", title: "Constant overthinking." },
      { id: "c", title: "Feeling emotionally down." },
      { id: "d", title: "Poor sleep quality." },
    ],
  },
  {
    id: 9,
    scenario: "What best describes your current emotional state?",
    choices: [
      { id: "a", title: "Pressured." },
      { id: "b", title: "Concerned." },
      { id: "c", title: "Discouraged." },
      { id: "d", title: "Exhausted." },
    ],
  },
  {
    id: 10,
    scenario: "What do you find most difficult?",
    choices: [
      { id: "a", title: "Relaxing." },
      { id: "b", title: "Feeling calm." },
      { id: "c", title: "Feeling motivated." },
      { id: "d", title: "Feeling rested." },
    ],
  },
  {
    id: 11,
    scenario: "Which experience happens most often?",
    choices: [
      { id: "a", title: "Feeling overwhelmed." },
      { id: "b", title: "Feeling worried." },
      { id: "c", title: "Feeling empty." },
      { id: "d", title: "Feeling tired." },
    ],
  },
  {
    id: 12,
    scenario: "What would improve your wellbeing the most?",
    choices: [
      { id: "a", title: "Better balance." },
      { id: "b", title: "Greater peace of mind." },
      { id: "c", title: "More positive emotions." },
      { id: "d", title: "Better sleep quality." },
    ],
  },
  {
    id: 13,
    scenario: "When things do not go as planned, you usually:",
    choices: [
      { id: "a", title: "Feel pressured." },
      { id: "b", title: "Think about possible consequences." },
      { id: "c", title: "Feel disappointed." },
      { id: "d", title: "Feel mentally exhausted." },
    ],
  },
  {
    id: 14,
    scenario: "Which statement best reflects your recent experience?",
    choices: [
      { id: "a", title: "Life feels demanding." },
      { id: "b", title: "Life feels uncertain." },
      { id: "c", title: "Life feels less enjoyable." },
      { id: "d", title: "Life feels tiring." },
    ],
  },
  {
    id: 15,
    scenario: "Right now, what do you need most?",
    choices: [
      { id: "a", title: "Relief from pressure." },
      { id: "b", title: "Peace of mind." },
      { id: "c", title: "Emotional upliftment." },
      { id: "d", title: "Restorative sleep." },
    ],
  },
];

export const PROFILES = {
  stress: {
    name: "The Overloaded Achiever",
    dimension: "Stress",
    description:
      "You feel pressure to perform and often struggle with managing the weight of your responsibilities. You are driven and capable, but you may be carrying more than you should alone. Learning to delegate and set boundaries will help you sustain your energy long-term.",
    strengths: ["Driven", "Responsible"],
    growth: "Practice saying no to one thing this week and notice how it feels.",
  },
  anxiety: {
    name: "The Constant Thinker",
    dimension: "Anxiety",
    description:
      "Your mind is always active, often dwelling on what could go wrong. This vigilance comes from a deep desire to be prepared, but it can leave you feeling unsettled. Learning to sit with uncertainty rather than solve it will bring you more peace.",
    strengths: ["Thoughtful", "Perceptive"],
    growth: "Try a 5-minute grounding exercise when your thoughts start to spiral.",
  },
  depression: {
    name: "The Emotionally Drained Soul",
    dimension: "Low Mood",
    description:
      "You have been carrying a heaviness that makes everyday things feel harder than they should. This is not a sign of weakness — it is a signal that you need more support and gentleness right now. Small steps matter more than you know.",
    strengths: ["Empathetic", "Deep"],
    growth: "Identify one small thing that brought you comfort in the past and try it today.",
  },
  sleep: {
    name: "The Exhausted Sleeper",
    dimension: "Sleep & Rest",
    description:
      "Your body and mind are not getting the rest they need to recover. Poor sleep affects everything — your mood, focus, and resilience. Prioritising your sleep environment and evening routine is one of the most powerful things you can do for your wellbeing.",
    strengths: ["Enduring", "Persistent"],
    growth: "Set a consistent bedtime this week, even if just 30 minutes earlier than usual.",
  },
};

export const DAILY_QUOTES: { text: string; author: string }[] = [
  {
    text: "Between stimulus and response there is a space. In that space is our power to choose our response.",
    author: "Viktor Frankl",
  },
  { text: "The wound is the place where the Light enters you.", author: "Rumi" },
  { text: "What you seek is seeking you.", author: "Rumi" },
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
  {
    text: "Growth isn't about fixing yourself—it's about understanding yourself.",
    author: "Hearth",
  },
];

export const DAILY_REFLECTION =
  "Growth isn't about fixing yourself—it's about understanding yourself.";
