"use client";

import { useState } from "react";
import Link from "next/link";
import CitationInput from "./components/CitationInput";
import CitationResult from "./components/CitationResult";
import { CitationStyle, CitationMetadata, FormattedCitation } from "./lib/types";

type Step = "input" | "loading" | "result";

export default function FormatterPage() {
  const [step, setStep] = useState<Step>("input");
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<CitationMetadata | null>(null);
  const [citation, setCitation] = useState<FormattedCitation | null>(null);
  const [currentStyle, setCurrentStyle] = useState<CitationStyle>("apa");

  const handleGenerate = async (input: string, style: CitationStyle) => {
    setError(null);
    setCurrentStyle(style);
    setStep("loading");

    try {
      const response = await fetch("/formatter/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, style }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate citation");
      }

      setMetadata(data.metadata);
      setCitation(data.citation);
      setStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep("input");
    }
  };

  const handleReset = () => {
    setStep("input");
    setError(null);
    setMetadata(null);
    setCitation(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-teal-50/30">
      {/* Header */}
      <header className="border-b border-slate-200/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/25">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Citation Generator
                </h1>
                <p className="text-xs text-slate-500">Format your references</p>
              </div>
            </Link>
            {step === "result" && (
              <button
                onClick={handleReset}
                className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-teal-600 bg-teal-50
                         rounded-full hover:bg-teal-100 transition-all duration-300"
              >
                <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                New Citation
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Error Alert */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl animate-scale-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-red-800">Something went wrong</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Input Step */}
        {step === "input" && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-600 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
                APA, MLA, Chicago
              </div>
              <h2 className="text-4xl font-bold text-slate-800 mb-4">
                Generate Citations Instantly
              </h2>
              <p className="text-lg text-slate-500 max-w-md mx-auto">
                Paste any paper URL or title and get properly formatted citations
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-8">
              <CitationInput onGenerate={handleGenerate} isLoading={false} />
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-6 mt-12">
              {[
                { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", title: "Accurate", desc: "CrossRef metadata" },
                { icon: "M13 10V3L4 14h7v7l9-11h-7z", title: "Instant", desc: "No account needed" },
                { icon: "M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2", title: "One-Click Copy", desc: "Ready to paste" },
              ].map((feature, i) => (
                <div key={i} className="text-center p-4">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-teal-50 flex items-center justify-center">
                    <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.icon} />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-slate-700 text-sm">{feature.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading Step */}
        {step === "loading" && (
          <div className="max-w-lg mx-auto animate-fade-in">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-10">
              <div className="flex flex-col items-center">
                {/* Animated loader */}
                <div className="relative mb-8">
                  <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full border-4 border-teal-500 border-t-transparent animate-spin" />
                  </div>
                  <div className="absolute inset-0 w-20 h-20 rounded-full bg-teal-400/20 animate-pulse" />
                </div>

                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  Generating Citation
                </h3>
                <p className="text-slate-500 text-center">
                  Fetching paper metadata and formatting...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Result Step */}
        {step === "result" && metadata && citation && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-8">
            <CitationResult
              metadata={metadata}
              citation={citation}
              style={currentStyle}
              onReset={handleReset}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 mt-20">
        <div className="max-w-3xl mx-auto px-6 py-6 text-center text-sm text-slate-400">
          Powered by CrossRef API
        </div>
      </footer>
    </div>
  );
}
