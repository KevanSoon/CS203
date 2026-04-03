/* ─── Types ─── */

export type QuizType = "mcq" | "true_false" | "fill_blank";

export interface CardForm {
  id: string;
  front: string;
  back: string;
  mediaUrl?: string;
}

export interface QuizOptionMap {
  [key: string]: string;
}

export interface QuizForm {
  id: string;
  title: string;
  question: string;
  quizType: QuizType;
  options: QuizOptionMap;
  correctAnswer: string;
}

export interface ChapterForm {
  title: string;
  description: string;
  cards: CardForm[];
  quizzes: QuizForm[];
  isExpanded: boolean;
}

/* ─── Factories ─── */

export const OPTION_KEYS_MCQ = ["A", "B", "C", "D"] as const;
export const OPTION_KEYS_TF = ["A", "B"] as const;

export const CREATE_LESSON_LIMITS = {
  lessonTitle: 100,
  lessonDescription: 255,
  chapterTitle: 100,
  chapterDescription: 255,
  cardFront: 150,
  cardBack: 150,
  quizTitle: 200,
  quizQuestion: 150,
  quizCorrectAnswer: 255,
  tagName: 45,
} as const;

export function emptyCard(): CardForm {
  return { id: crypto.randomUUID(), front: "", back: "" };
}

export function emptyQuiz(type: QuizType = "mcq"): QuizForm {
  return {
    id: crypto.randomUUID(),
    title: "",
    question: "",
    quizType: type,
    options:
      type === "true_false"
        ? { A: "True", B: "False" }
        : { A: "", B: "", C: "", D: "" },
    correctAnswer: "",
  };
}

export function emptyChapter(): ChapterForm {
  return {
    title: "",
    description: "",
    cards: [emptyCard()],
    quizzes: [emptyQuiz()],
    isExpanded: true,
  };
}

export function optionKeysForType(type: QuizType) {
  if (type === "true_false") return OPTION_KEYS_TF;
  return OPTION_KEYS_MCQ;
}
