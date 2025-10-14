// components/mini-tools/grammar-checker.tsx
'use client'

import React, { useState, useCallback } from 'react'
import { 
  GrammarCheckRequest, 
  GrammarCheckResponse, 
  GrammarError,
  CheckMode,
  isValidGrammarCheckResponse
} from '@/types/tools/grammar-spell'

export const GrammarChecker: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [result, setResult] = useState<GrammarCheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mode, setMode] = useState<CheckMode>('comprehensive');
  const [copiedText, setCopiedText] = useState<boolean>(false);

  const handleCheck = useCallback(async () => {
    // Reset previous states
    setError(null);
    setResult(null);

    // Validate input
    if (!text.trim()) {
      setError('Please enter some text to check');
      return;
    }

    setIsLoading(true);
    try {
      const request: GrammarCheckRequest = {
        text,
        mode,
        language: 'en'
      };

      const response = await fetch('/api/tools/grammar-spell-checker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      const data = await response.json();

      // Validate response
      if (!response.ok) {
        throw new Error(data.error || 'Grammar check failed');
      }

      // Additional type checking
      if (!isValidGrammarCheckResponse(data)) {
        throw new Error('Invalid response format');
      }

      setResult(data);
    } catch (err) {
      console.error('Error checking grammar:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [text, mode]);

  const handleCopyText = useCallback(() => {
    if (result?.result.correctedText) {
      navigator.clipboard.writeText(result.result.correctedText).then(() => {
        setCopiedText(true);
        setTimeout(() => setCopiedText(false), 2000);
      });
    }
  }, [result]);

  const renderSideBySideComparison = () => {
    if (!result) return null;

    // Create a map of errors for easy lookup
    const errorMap = new Map(
      result.result.errors.map((error) => [error.original, error])
    );

    // Function to wrap text with error highlighting
    const highlightText = (text: string) => {
      // Split the text into words
      const words = text.split(/\s+/);
      
      return words.map((word, index) => {
        const error = errorMap.get(word);
        if (error) {
          return (
            <React.Fragment key={index}>
              <span 
                className="text-red-600 line-through mr-1" 
                title={error.explanation}
              >
                {word}
              </span>
              <span 
                className="text-green-600 ml-1" 
                title={`Suggestion: ${error.explanation}`}
              >
                {error.suggestion}
              </span>
            </React.Fragment>
          );
        }
        return <span key={index}>{word} </span>;
      });
    };

    return (
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        {/* Original Text Column */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Original Text</h3>
          <div className="text-gray-800 whitespace-pre-wrap">
            {result.result.originalText}
          </div>
        </div>

        {/* Corrected Text Column */}
        <div className="bg-green-50 p-4 rounded-lg border relative">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-green-800">Corrected Text</h3>
            <button 
              onClick={handleCopyText}
              className={`
                flex items-center justify-center 
                w-8 h-8 rounded-full 
                transition-colors duration-300
                ${copiedText 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }
              `}
              title={copiedText ? 'Copied!' : 'Copy Corrected Text'}
            >
              {copiedText ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              )}
            </button>
          </div>
          <div className="text-gray-800 whitespace-pre-wrap">
            {highlightText(result.result.correctedText)}
          </div>
        </div>
      </div>
    );
  };

  const renderErrorList = () => {
    if (!result || result.result.errors.length === 0) return null;

    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Detailed Error Analysis</h3>
        {result.result.errors.map((error, index) => (
          <div 
            key={index} 
            className="p-4 mb-3 bg-yellow-50 rounded-lg border border-yellow-200"
          >
            <div className="flex items-center mb-2">
              <span className="font-semibold text-sm uppercase mr-2 text-red-600">
                {error.type} ERROR
              </span>
              {error.severity && (
                <span className="text-xs text-gray-500">
                  Severity: {error.severity}
                </span>
              )}
            </div>
            <div className="mb-1">
              <span className="font-medium">Original:</span>{' '}
              <span className="text-red-700 line-through">{error.original}</span>
            </div>
            <div>
              <span className="font-medium">Suggestion:</span>{' '}
              <span className="text-green-700">{error.suggestion}</span>
            </div>
            {error.explanation && (
              <div className="mt-2 text-sm text-gray-600">
                <span className="font-medium">Explanation:</span>{' '}
                {error.explanation}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      {/* Mode Selection */}
      <div className="mb-4">
        <label htmlFor="check-mode" className="block text-sm font-medium text-gray-700 mb-2">
          Check Mode
        </label>
        <select
          id="check-mode"
          value={mode}
          onChange={(e) => setMode(e.target.value as CheckMode)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="comprehensive">Comprehensive</option>
          <option value="light">Light</option>
          <option value="academic">Academic</option>
          <option value="professional">Professional</option>
        </select>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Text Input */}
      <textarea 
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your text here for grammar and spell checking..."
        className="w-full h-48 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
      />

      {/* Check Button */}
      <button 
        onClick={handleCheck}
        disabled={isLoading}
        className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {isLoading ? 'Checking...' : 'Check Grammar'}
      </button>

      {/* Results Section */}
      {result && (
        <>
          {/* Readability Score */}
          {result.result.readabilityScore !== undefined && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg mt-6">
              <h3 className="text-md font-semibold mb-2">Readability Score</h3>
              <div className="flex items-center">
                <div 
                  className="w-16 h-16 flex items-center justify-center rounded-full font-bold text-2xl text-white"
                  style={{
                    backgroundColor: 
                      result.result.readabilityScore > 80 ? 'green' : 
                      result.result.readabilityScore > 60 ? 'orange' : 'red'
                  }}
                >
                  {result.result.readabilityScore}
                </div>
                <div className="ml-4">
                  <p className="text-gray-700">
                    {result.result.readabilityScore > 80 
                      ? 'Excellent readability' 
                      : result.result.readabilityScore > 60 
                      ? 'Good readability' 
                      : 'Needs improvement'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Side-by-Side Text Comparison */}
          {renderSideBySideComparison()}

          {/* Detailed Error Analysis */}
          {renderErrorList()}
        </>
      )}
    </div>
  );
};