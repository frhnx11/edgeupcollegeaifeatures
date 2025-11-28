"use client";

import { useState } from "react";
import { CitationStyle } from "../lib/types";
import StyleSelector from "./StyleSelector";

interface CitationInputProps {
  onGenerate: (input: string, style: CitationStyle) => void;
  isLoading: boolean;
}

export default function CitationInput({ onGenerate, isLoading }: CitationInputProps) {
  const [input, setInput] = useState("");
  const [style, setStyle] = useState<CitationStyle>("apa");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onGenerate(input.trim(), style);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Paper Input */}
      <div>
        <label htmlFor="citation-input" className="block text-sm font-medium text-slate-700 mb-2">
          Paper URL, DOI, or Title
        </label>
        <div className="relative">
          <input
            id="citation-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste any paper URL, DOI, or title..."
            disabled={isLoading}
            className={`
              w-full px-5 py-4 text-lg rounded-xl border-2 border-slate-200
              focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10
              transition-all duration-200 outline-none
              placeholder:text-slate-400
              ${isLoading ? "opacity-50 cursor-not-allowed bg-slate-50" : "bg-white"}
            `}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Works with Semantic Scholar, Google Scholar, arXiv, or just the paper title
        </p>
      </div>

      {/* Style Selector */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Citation Style
        </label>
        <StyleSelector value={style} onChange={setStyle} disabled={isLoading} />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!input.trim() || isLoading}
        className={`
          w-full py-4 rounded-xl font-semibold text-lg
          transition-all duration-300
          ${!input.trim() || isLoading
            ? "bg-slate-200 text-slate-400 cursor-not-allowed"
            : "bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:shadow-xl hover:shadow-teal-500/25 hover:scale-[1.02]"
          }
        `}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Generating Citation...
          </span>
        ) : (
          "Generate Citation"
        )}
      </button>
    </form>
  );
}
