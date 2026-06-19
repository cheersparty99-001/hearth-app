export type ChoiceId = "a" | "b" | "c" | "d";
export type ChoiceIcon = "eco" | "flame" | "forum" | "shield";

export interface Choice {
  id: ChoiceId;
  icon: ChoiceIcon;
  text: string;
}

export interface Question {
  id: number;
  chapter: string;
  scenario: string;
  choices: Choice[];
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    chapter: "Relationships & Belonging",
    scenario:
      "Your close friend cancels plans with you last minute—again. You feel that familiar sting. What's your first reaction?",
    choices: [
      { id: "a", icon: "eco", text: "I understand—things happen. I let it go." },
      { id: "b", icon: "flame", text: "I feel hurt, but I don't say anything." },
      { id: "c", icon: "forum", text: "I ask them if everything's okay." },
      {
        id: "d",
        icon: "shield",
        text: "I pull away. I don't want to care more than they do.",
      },
    ],
  },
  {
    id: 2,
    chapter: "Trust & Honesty",
    scenario:
      "Your partner forgets something important to you. They apologize, but the weight stays. What's true for you?",
    choices: [
      { id: "a", icon: "eco", text: "I forgive them. It's not worth holding." },
      { id: "b", icon: "flame", text: "I say I'm okay, even though I'm not." },
      { id: "c", icon: "forum", text: "I tell them how it landed for me." },
      { id: "d", icon: "shield", text: "I keep a quiet distance for a while." },
    ],
  },
  {
    id: 3,
    chapter: "Boundaries",
    scenario:
      "A family member oversteps a line you thought was clear. The room goes quiet. What do you do?",
    choices: [
      { id: "a", icon: "eco", text: "I let it slide—keeping the peace matters." },
      { id: "b", icon: "flame", text: "I feel the heat rise, but I stay silent." },
      { id: "c", icon: "forum", text: "I name what I felt, gently and clearly." },
      { id: "d", icon: "shield", text: "I step away from the conversation entirely." },
    ],
  },
  {
    id: 4,
    chapter: "Recognition & Worth",
    scenario:
      "A coworker takes credit for an idea that was yours. Others nod along. What's your move?",
    choices: [
      { id: "a", icon: "eco", text: "I let them have it. It's just work." },
      { id: "b", icon: "flame", text: "I burn inside, but I say nothing." },
      { id: "c", icon: "forum", text: "I speak up and reclaim the idea calmly." },
      { id: "d", icon: "shield", text: "I make a note to share less with them." },
    ],
  },
  {
    id: 5,
    chapter: "Closeness & Distance",
    scenario:
      "Someone you love asks for space. You hear the words, but it stings. What rises in you?",
    choices: [
      { id: "a", icon: "eco", text: "I give it freely. Their needs come first." },
      { id: "b", icon: "flame", text: "I say yes, but I quietly feel abandoned." },
      { id: "c", icon: "forum", text: "I ask what they need, and share what I need too." },
      { id: "d", icon: "shield", text: "I withdraw first, before I can be left." },
    ],
  },
  {
    id: 6,
    chapter: "The True Self",
    scenario:
      "Someone close to you criticizes you in front of others. The words land harder than expected. What do you do?",
    choices: [
      { id: "a", icon: "eco", text: "I laugh it off and move on." },
      { id: "b", icon: "flame", text: "I smile, but it sits in my chest for days." },
      { id: "c", icon: "forum", text: "I tell them later that it hurt." },
      { id: "d", icon: "shield", text: "I rebuild my guard around them." },
    ],
  },
];

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
