export interface BiologyTerm {
  id: string;
  englishTerm: string;
  pronunciation: string;
  vietnameseTerm: string;
  grade: '10' | '11' | '12' | 'THPT';
  topic: string;
  definition: string;
  simpleExplanation: string;
  example: string;
  memoryTip: string;
  keywords: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: number;
  text?: string;
  matchedTerm?: BiologyTerm;
  isAiFallback?: boolean;
  aiSuggestedAnswer?: string;
  unrecognizedQuery?: boolean;
}

export interface QuizQuestion {
  id: string;
  termId: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  englishTerm: string;
  vietnameseTerm: string;
}

export type ActiveTab = 'chat' | 'flashcard' | 'quiz' | 'favorites' | 'history' | 'teacher';
