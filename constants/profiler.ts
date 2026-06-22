export type Category = "stress" | "anxiety" | "depression" | "sleep";

export interface ProfilerOption {
  key: string;
  text: string;
  category: Category;
}

export interface ProfilerQuestion {
  id: number;
  text: string;
  options: ProfilerOption[];
}

export interface ProfilerCategory {
  key: string;
  id: Category;
  label: string;
}

export interface ProfilerProfile {
  id: string;
  name: string;
  primary: Category;
  secondary: Category | null;
  description: string;
}

export interface ProfilerMeta {
  title: string;
  subtitle: string;
  version: string;
  source: string;
  disclaimer: string;
  instructions: string;
  timeframe: string;
}

export const PROFILER_META: ProfilerMeta = {
  title: "Hearth Mental Wellness Profiler",
  subtitle: "Understand your mental wellness landscape",
  version: "2.0",
  source: "Camillia Siaw",
  disclaimer:
    "This is not a diagnostic tool but a guide to self-awareness and a starting point for prioritizing your mental health. For personalized advice, please consult a mental health professional.",
  instructions:
    "Choose the option that best describes your experience over the last two weeks. There are no right or wrong answers. Be as honest as possible.",
  timeframe: "last two weeks",
};

export const PROFILER_CATEGORIES: Record<Category, ProfilerCategory> = {
  stress: { key: "A", id: "stress", label: "Stress" },
  anxiety: { key: "B", id: "anxiety", label: "Anxiety" },
  depression: { key: "C", id: "depression", label: "Depression" },
  sleep: { key: "D", id: "sleep", label: "Sleep" },
};

export const PROFILER_QUESTIONS: ProfilerQuestion[] = [
  {
    id: 1,
    text: "When you finally have a quiet moment to yourself, what usually happens?",
    options: [
      { key: "A", text: "I start thinking about unfinished responsibilities.", category: "stress" },
      { key: "B", text: "My mind continues running through different possibilities.", category: "anxiety" },
      { key: "C", text: "I don't really feel interested in doing anything.", category: "depression" },
      { key: "D", text: "I feel tired and would rather rest.", category: "sleep" },
    ],
  },
  {
    id: 2,
    text: "What is currently affecting your quality of life the most?",
    options: [
      { key: "A", text: "Too many responsibilities.", category: "stress" },
      { key: "B", text: "Too much uncertainty.", category: "anxiety" },
      { key: "C", text: "Lack of enjoyment.", category: "depression" },
      { key: "D", text: "Lack of quality rest.", category: "sleep" },
    ],
  },
  {
    id: 3,
    text: "What best describes your mornings?",
    options: [
      { key: "A", text: "I immediately think about what needs to be done.", category: "stress" },
      { key: "B", text: "I feel nervous about the day ahead.", category: "anxiety" },
      { key: "C", text: "I struggle to find motivation.", category: "depression" },
      { key: "D", text: "I wake up feeling exhausted.", category: "sleep" },
    ],
  },
  {
    id: 4,
    text: "When facing a challenge, your first reaction is usually:",
    options: [
      { key: "A", text: '"How am I going to handle everything?"', category: "stress" },
      { key: "B", text: '"What if something goes wrong?"', category: "anxiety" },
      { key: "C", text: '"I don\'t feel like dealing with this."', category: "depression" },
      { key: "D", text: '"I wish I could just rest."', category: "sleep" },
    ],
  },
  {
    id: 5,
    text: "During your free time, you often:",
    options: [
      { key: "A", text: "Continue thinking about work or obligations.", category: "stress" },
      { key: "B", text: "Find it difficult to stop worrying.", category: "anxiety" },
      { key: "C", text: "Feel emotionally disconnected.", category: "depression" },
      { key: "D", text: "Feel sleepy or drained.", category: "sleep" },
    ],
  },
  {
    id: 6,
    text: "Which statement sounds most like you?",
    options: [
      { key: "A", text: "I often feel under pressure.", category: "stress" },
      { key: "B", text: "I often feel on edge.", category: "anxiety" },
      { key: "C", text: "I often feel emotionally low.", category: "depression" },
      { key: "D", text: "I often feel physically fatigued.", category: "sleep" },
    ],
  },
  {
    id: 7,
    text: "If you could change one thing immediately, it would be:",
    options: [
      { key: "A", text: "Reduce my stress.", category: "stress" },
      { key: "B", text: "Reduce my worries.", category: "anxiety" },
      { key: "C", text: "Improve my mood.", category: "depression" },
      { key: "D", text: "Improve my sleep.", category: "sleep" },
    ],
  },
  {
    id: 8,
    text: "What drains your energy the most?",
    options: [
      { key: "A", text: "Managing multiple demands.", category: "stress" },
      { key: "B", text: "Constant overthinking.", category: "anxiety" },
      { key: "C", text: "Feeling emotionally down.", category: "depression" },
      { key: "D", text: "Poor sleep quality.", category: "sleep" },
    ],
  },
  {
    id: 9,
    text: "What best describes your current emotional state?",
    options: [
      { key: "A", text: "Pressured.", category: "stress" },
      { key: "B", text: "Concerned.", category: "anxiety" },
      { key: "C", text: "Discouraged.", category: "depression" },
      { key: "D", text: "Exhausted.", category: "sleep" },
    ],
  },
  {
    id: 10,
    text: "What do you find most difficult?",
    options: [
      { key: "A", text: "Relaxing.", category: "stress" },
      { key: "B", text: "Feeling calm.", category: "anxiety" },
      { key: "C", text: "Feeling motivated.", category: "depression" },
      { key: "D", text: "Feeling rested.", category: "sleep" },
    ],
  },
  {
    id: 11,
    text: "Which experience happens most often?",
    options: [
      { key: "A", text: "Feeling overwhelmed.", category: "stress" },
      { key: "B", text: "Feeling worried.", category: "anxiety" },
      { key: "C", text: "Feeling empty.", category: "depression" },
      { key: "D", text: "Feeling tired.", category: "sleep" },
    ],
  },
  {
    id: 12,
    text: "What would improve your wellbeing the most?",
    options: [
      { key: "A", text: "Better balance.", category: "stress" },
      { key: "B", text: "Greater peace of mind.", category: "anxiety" },
      { key: "C", text: "More positive emotions.", category: "depression" },
      { key: "D", text: "Better sleep quality.", category: "sleep" },
    ],
  },
  {
    id: 13,
    text: "When things don't go as planned, you usually:",
    options: [
      { key: "A", text: "Feel pressured.", category: "stress" },
      { key: "B", text: "Think about possible consequences.", category: "anxiety" },
      { key: "C", text: "Feel disappointed.", category: "depression" },
      { key: "D", text: "Feel mentally exhausted.", category: "sleep" },
    ],
  },
  {
    id: 14,
    text: "Which statement best reflects your recent experience?",
    options: [
      { key: "A", text: "Life feels demanding.", category: "stress" },
      { key: "B", text: "Life feels uncertain.", category: "anxiety" },
      { key: "C", text: "Life feels less enjoyable.", category: "depression" },
      { key: "D", text: "Life feels tiring.", category: "sleep" },
    ],
  },
  {
    id: 15,
    text: "Right now, what do you need most?",
    options: [
      { key: "A", text: "Relief from pressure.", category: "stress" },
      { key: "B", text: "Peace of mind.", category: "anxiety" },
      { key: "C", text: "Emotional upliftment.", category: "depression" },
      { key: "D", text: "Restorative sleep.", category: "sleep" },
    ],
  },
];

export const PROFILER_PROFILES: ProfilerProfile[] = [
  {
    id: "overloaded_achiever",
    name: "The Overloaded Achiever",
    primary: "stress",
    secondary: "anxiety",
    description:
      "Typically characterized by high Stress and potentially Anxiety. You often feel pressure to perform, struggle with time management, and may experience physical symptoms of stress. You thrive on productivity but can burn out if your workload isn't managed effectively.",
  },
  {
    id: "constant_thinker",
    name: "The Constant Thinker",
    primary: "anxiety",
    secondary: "depression",
    description:
      "Defined by high Anxiety and possibly Depression. You often ruminate on worries, experience persistent unease, and may find it hard to quiet your mind. You might be prone to catastrophizing and struggle with decision-making due to overthinking.",
  },
  {
    id: "emotionally_drained_soul",
    name: "The Emotionally Drained Soul",
    primary: "depression",
    secondary: null,
    description:
      "Strongly indicated by high Depression. You may experience persistent sadness, a loss of interest in life, feelings of hopelessness, and a significant lack of energy. Emotional fatigue is a key characteristic, impacting daily functioning.",
  },
  {
    id: "exhausted_sleeper",
    name: "The Exhausted Sleeper",
    primary: "sleep",
    secondary: "stress",
    description:
      "Defined by dominant Sleep scores, often accompanied by high Stress or Anxiety. You struggle with sleep quality and quantity, leading to daytime fatigue, reduced cognitive function, and irritability. Poor sleep can exacerbate other mental health challenges.",
  },
];

export const PROFILER_RESULT_FOOTER =
  "These profiles are general interpretations. A low score in one area does not negate the importance of maintaining good mental health practices. For personalized advice and support, please consult with a mental health professional.";

/** Calculate category counts from answers.
 *  Returns a record of category -> count (0-15).
 */
export function calculateScores(
  answers: Record<number, Category>
): Record<Category, number> {
  const counts: Record<Category, number> = {
    stress: 0,
    anxiety: 0,
    depression: 0,
    sleep: 0,
  };
  for (const category of Object.values(answers)) {
    if (category in counts) {
      counts[category]++;
    }
  }
  return counts;
}

/** Determine primary profile(s) from category counts.
 *  Returns an array (1 profile normally, 2+ if tied).
 */
export function determineProfiles(
  scores: Record<Category, number>
): ProfilerProfile[] {
  const maxCount = Math.max(...Object.values(scores));
  const topCategories = Object.entries(scores)
    .filter(([, count]) => count === maxCount)
    .map(([cat]) => cat as Category);

  return topCategories
    .map((cat) => PROFILER_PROFILES.find((p) => p.primary === cat))
    .filter((p): p is ProfilerProfile => p !== undefined);
}