// Supported programming languages
export type SupportedLanguage =
  | "python"
  | "javascript"
  | "typescript"
  | "java"
  | "cpp"
  | "c"
  | "csharp"
  | "go"
  | "ruby"
  | "rust";

export interface TestCase {
  input: string;
  output: string;
  explanation?: string;
}

export interface CodingChallenge {
  title: string;
  description: string;
  functionSignature: string;
  language: SupportedLanguage;
  testCases: TestCase[];
  hints: string[];
  solutionApproach: string;
}

export interface TestResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export interface CodeOutput {
  stdout: string;
  stderr: string;
  returnValue: string | null;
  error: string | null;
  testResults?: TestResult[];
}

export interface EvaluationResult {
  correct: boolean;
  feedback: string;
  passedTests: number;
  totalTests: number;
  hint?: string;
}

export interface CodingState {
  isActive: boolean;
  challenge: CodingChallenge | null;
  userCode: string;
  isSubmitting: boolean;
  isRunning: boolean;
  attempts: number;
  feedback: EvaluationResult | null;
  output: CodeOutput | null;
}
