"use client";

import { useState, useEffect, useMemo } from "react";
import { CodingChallenge, EvaluationResult, CodeOutput } from "../lib/codingTypes";
import CodeEditor from "./CodeEditor";
import QuestionDisplay from "./QuestionDisplay";
import OutputPanel from "./OutputPanel";

interface CodingPanelProps {
  challenge: CodingChallenge;
  visible: boolean;
  onHint: (code: string) => void;
  onRun: (code: string) => void;
  isRequestingHint: boolean;
  isRunning: boolean;
  feedback: EvaluationResult | null;
  output: CodeOutput | null;
}

// Helper to generate default code template
function generateDefaultCode(functionSignature?: string): string {
  if (functionSignature) {
    return `${functionSignature}
    # Write your code here
    pass
`;
  }
  return `def solution():
    # Write your code here
    pass
`;
}

export default function CodingPanel({
  challenge,
  visible,
  onHint,
  onRun,
  isRequestingHint,
  isRunning,
  feedback,
  output,
}: CodingPanelProps) {
  // Memoize default code based on challenge
  const defaultCode = useMemo(
    () => generateDefaultCode(challenge.functionSignature),
    [challenge.functionSignature]
  );

  const [code, setCode] = useState<string>(defaultCode);
  const [animationState, setAnimationState] = useState<
    "hidden" | "entering" | "visible" | "exiting"
  >("hidden");

  useEffect(() => {
    if (visible) {
      setAnimationState("entering");
      const timer = setTimeout(() => setAnimationState("visible"), 300);
      return () => clearTimeout(timer);
    } else if (animationState !== "hidden") {
      setAnimationState("exiting");
      const timer = setTimeout(() => setAnimationState("hidden"), 300);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  // Reset code when challenge changes
  useEffect(() => {
    setCode(defaultCode);
  }, [defaultCode]);

  if (animationState === "hidden") return null;

  const getAnimationClasses = () => {
    switch (animationState) {
      case "entering":
        return "opacity-0 translate-x-8";
      case "visible":
        return "opacity-100 translate-x-0";
      case "exiting":
        return "opacity-0 translate-x-8";
      default:
        return "opacity-0";
    }
  };

  const isDisabled = isRequestingHint || isRunning;

  return (
    <div
      className={`
        absolute right-0 top-0 bottom-0 w-[65%] z-40 flex flex-col p-4
        bg-gradient-to-br from-slate-100 to-white
        border-l border-slate-300 shadow-xl
        transition-all duration-300 ease-out
        ${getAnimationClasses()}
      `}
    >
      {/* Header with Run and Submit Buttons */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-slate-700">Coding Challenge</h2>
        <div className="flex gap-2">
          <button
            onClick={() => onRun(code)}
            disabled={isDisabled}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300
                       text-white font-medium rounded-lg shadow-md transition-colors
                       flex items-center gap-2 text-sm"
          >
            {isRunning ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Running...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Run
              </>
            )}
          </button>
          <button
            onClick={() => onHint(code)}
            disabled={isDisabled}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300
                       text-white font-medium rounded-lg shadow-md transition-colors
                       flex items-center gap-2 text-sm"
          >
            {isRequestingHint ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Thinking...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Hint
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-3 min-h-0">
        {/* Top: Question Display */}
        <div className="h-[35%] min-h-0">
          <QuestionDisplay challenge={challenge} />
        </div>

        {/* Bottom: Code Editor + Output Panel side by side */}
        <div className="h-[65%] min-h-0 flex gap-3">
          {/* Code Editor */}
          <div className="w-1/2 min-w-0">
            <CodeEditor value={code} onChange={setCode} disabled={isDisabled} />
          </div>

          {/* Output Panel */}
          <div className="w-1/2 min-w-0">
            <OutputPanel output={output} isRunning={isRunning} feedback={feedback} />
          </div>
        </div>
      </div>
    </div>
  );
}
