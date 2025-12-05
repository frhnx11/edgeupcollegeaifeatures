"use client";

import { CodingChallenge } from "../lib/codingTypes";

interface QuestionDisplayProps {
  challenge: CodingChallenge;
}

export default function QuestionDisplay({ challenge }: QuestionDisplayProps) {
  return (
    <div className="h-full overflow-y-auto p-4 bg-white rounded-lg border border-slate-300">
      <h3 className="text-lg font-bold text-slate-800 mb-2">{challenge.title}</h3>

      <p className="text-slate-700 mb-3 whitespace-pre-wrap leading-relaxed text-sm">
        {challenge.description}
      </p>

      {/* Function Signature */}
      {challenge.functionSignature && (
        <div className="mb-3">
          <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wide mb-1">
            Function Signature
          </h4>
          <div className="bg-slate-900 text-green-400 p-3 rounded-lg font-mono text-sm">
            {challenge.functionSignature}
          </div>
        </div>
      )}

      {/* Test Cases */}
      <div className="space-y-2">
        <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wide">
          Test Cases
        </h4>
        {challenge.testCases.map((testCase, index) => (
          <div
            key={index}
            className="bg-slate-50 p-3 rounded-lg font-mono text-xs border border-slate-200"
          >
            <div className="text-slate-700 mb-1">
              <span className="text-slate-500 font-semibold">Input: </span>
              {testCase.input}
            </div>
            <div className="text-slate-700">
              <span className="text-slate-500 font-semibold">Output: </span>
              {testCase.output}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
