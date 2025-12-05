"use client";

import { CodeOutput, EvaluationResult } from "../lib/codingTypes";

interface OutputPanelProps {
  output: CodeOutput | null;
  isRunning: boolean;
  feedback: EvaluationResult | null;
}

export default function OutputPanel({ output, isRunning, feedback }: OutputPanelProps) {
  const passedCount = output?.testResults?.filter((t) => t.passed).length ?? 0;
  const totalCount = output?.testResults?.length ?? 0;
  const allPassed = passedCount === totalCount && totalCount > 0;

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2 bg-slate-800 border-b border-slate-700 flex items-center gap-2">
        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-sm font-medium text-slate-300">Output</span>
        {output?.testResults && (
          <span className={`ml-auto text-xs ${allPassed ? "text-green-400" : "text-amber-400"}`}>
            {passedCount}/{totalCount} passed
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
        {isRunning ? (
          <div className="flex items-center gap-2 text-blue-400">
            <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span>Running tests...</span>
          </div>
        ) : output ? (
          <div className="space-y-3">
            {/* Error (syntax error or definition error) */}
            {output.error && (
              <div className="text-red-400">
                <span className="text-red-500 font-semibold">Error:</span>
                <pre className="mt-1 whitespace-pre-wrap text-xs">{output.error}</pre>
              </div>
            )}

            {/* Test Results */}
            {output.testResults && output.testResults.length > 0 && (
              <div className="space-y-2">
                {output.testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded border ${
                      result.passed
                        ? "border-green-700 bg-green-900/20"
                        : "border-red-700 bg-red-900/20"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={result.passed ? "text-green-400" : "text-red-400"}>
                        {result.passed ? "✓" : "✗"}
                      </span>
                      <span className="text-slate-300 text-xs">Test Case {index + 1}</span>
                    </div>
                    <div className="text-xs text-slate-400 ml-5">
                      <div>Input: {result.input}</div>
                      <div>Expected: {result.expected}</div>
                      <div className={result.passed ? "text-green-400" : "text-red-400"}>
                        Got: {result.actual}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Summary */}
                {allPassed && (
                  <div className="mt-3 p-2 bg-green-900/30 border border-green-700 rounded text-green-400 text-center">
                    All tests passed!
                  </div>
                )}
              </div>
            )}

            {/* Stdout (if any print statements) */}
            {output.stdout && (
              <div className="mt-2 pt-2 border-t border-slate-700">
                <span className="text-slate-500 text-xs">Console output:</span>
                <pre className="mt-1 text-slate-300 whitespace-pre-wrap text-xs">{output.stdout}</pre>
              </div>
            )}

            {/* No results */}
            {!output.error && !output.testResults?.length && !output.stdout && (
              <span className="text-slate-500 italic">No output</span>
            )}
          </div>
        ) : feedback ? (
          <div className="space-y-3">
            {/* Feedback from submission */}
            <div className={feedback.correct ? "text-green-400" : "text-amber-400"}>
              <span className="font-semibold">
                {feedback.correct ? "✓ All tests passed!" : `${feedback.passedTests}/${feedback.totalTests} tests passed`}
              </span>
            </div>
            <div className="text-slate-300 text-xs">{feedback.feedback}</div>
            {feedback.hint && !feedback.correct && (
              <div className="text-slate-400 italic text-xs">
                Hint: {feedback.hint}
              </div>
            )}
          </div>
        ) : (
          <div className="text-slate-500 italic text-xs">
            Click "Run" to test your code against the test cases.
          </div>
        )}
      </div>
    </div>
  );
}
