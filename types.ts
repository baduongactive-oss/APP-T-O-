export interface ExamConfig {
  sampleText: string;
  fileName: string;
  sourceText?: string; // New: User provided text for reading/cloze
  topics: string;
  vocabulary: string;
  grammar: string;
  difficultyContext?: string;
  readingDistractorGuide?: string; // New: User instructions for reading distractors
}

export interface SavedConfig extends ExamConfig {
  id: string;
  name: string;
  createdAt: number;
}

export interface GeneratedExam {
  content: string; // Markdown content
  timestamp: number;
}

export enum AppStep {
  SETUP = 'SETUP',
  GENERATING = 'GENERATING',
  RESULT = 'RESULT',
}

export interface FileParseResult {
  text: string;
  fileName: string;
}