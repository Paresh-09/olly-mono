// types/grammar-checker.ts

// Supported check modes
export type CheckMode = 'comprehensive' | 'light' | 'academic' | 'professional';

// Possible error types
export type ErrorType = 'grammar' | 'spelling' | 'style' | 'punctuation';

// Structure for individual grammar error
export interface GrammarError {
  type: ErrorType;
  original: string;
  suggestion: string;
  explanation?: string;
  severity?: 'low' | 'medium' | 'high';
}

// Request payload for grammar checking
export interface GrammarCheckRequest {
  text: string;
  language?: string;
  mode?: CheckMode;
}

// Detailed response structure
export interface GrammarCheckResult {
  originalText: string;
  correctedText: string;
  errors: GrammarError[];
  readabilityScore?: number;
}

// Full API response
export interface GrammarCheckResponse {
  result: GrammarCheckResult;
  error?: string;
}

// Type guard to check if the response is valid
export function isValidGrammarCheckResponse(response: any): response is GrammarCheckResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'result' in response &&
    typeof response.result === 'object' &&
    Array.isArray(response.result.errors)
  );
}