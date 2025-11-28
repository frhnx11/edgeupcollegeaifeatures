"use client";

import { useState } from "react";
import Link from "next/link";
import ResearchInput from "./components/ResearchInput";
import PaperList from "./components/PaperList";
import { Paper } from "./lib/types";

type Step = "input" | "extracting" | "searching" | "results";

export default function ResearchPage() {
  const [step, setStep] = useState<Step>("input");
  const [error, setError] = useState<string | null>(null);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [lastQuery, setLastQuery] = useState("");

  const handleSearch = async (query: string) => {
    setError(null);
    setLastQuery(query);
    setStep("extracting");

    try {
      // Short delay to show extracting step
      await new Promise((resolve) => setTimeout(resolve, 500));
      setStep("searching");

      const response = await fetch("/research/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to search papers");
      }

      setPapers(data.papers);
      setKeywords(data.keywords);
      setTotal(data.total);
      setStep("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep("input");
    }
  };

  const handleReset = () => {
    setStep("input");
    setError(null);
    setPapers([]);
    setKeywords([]);
    setTotal(0);
    setLastQuery("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-purple-50/30">
      {/* Header */}
      <header className="border-b border-slate-200/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Research Assistant AI
                </h1>
                <p className="text-xs text-slate-500">Find academic papers</p>
              </div>
            </Link>
            {step === "results" && (
              <button
                onClick={handleReset}
                className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50
                         rounded-full hover:bg-purple-100 transition-all duration-300"
              >
                <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                New Search
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
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
          <div className="max-w-2xl mx-auto animate-fade-in-up">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                AI-Powered Search
              </div>
              <h2 className="text-4xl font-bold text-slate-800 mb-4">
                Find Research Papers
              </h2>
              <p className="text-lg text-slate-500 max-w-md mx-auto">
                Describe your research topic and let AI find the most relevant academic papers for you
              </p>
            </div>
            <ResearchInput onSearch={handleSearch} isLoading={false} />

            {/* Features */}
            <div className="grid grid-cols-3 gap-6 mt-12">
              {[
                { icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z", title: "Smart Keywords", desc: "AI extracts search terms" },
                { icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", title: "200M+ Papers", desc: "Semantic Scholar database" },
                { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", title: "Credibility Score", desc: "Citation count ranking" },
              ].map((feature, i) => (
                <div key={i} className="text-center p-4">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-purple-50 flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* Processing Steps */}
        {(step === "extracting" || step === "searching") && (
          <div className="max-w-lg mx-auto animate-fade-in">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-10">
              <div className="flex flex-col items-center">
                {/* Animated loader */}
                <div className="relative mb-8">
                  <div className="w-20 h-20 rounded-full bg-purple-50 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
                  </div>
                  <div className="absolute inset-0 w-20 h-20 rounded-full bg-purple-400/20 animate-pulse-ring" />
                </div>

                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  {step === "extracting" && "Analyzing Your Topic"}
                  {step === "searching" && "Searching Papers"}
                </h3>
                <p className="text-slate-500 text-center mb-8">
                  {step === "extracting" && "AI is extracting optimal search keywords..."}
                  {step === "searching" && "Finding relevant academic papers..."}
                </p>

                {/* Progress indicator */}
                <div className="flex items-center gap-3 w-full max-w-xs">
                  {["extracting", "searching"].map((s, i) => {
                    const isActive = step === s;
                    const isPast = ["extracting", "searching"].indexOf(step) > i;
                    return (
                      <div key={s} className="flex-1 flex items-center">
                        <div className={`
                          w-full h-2 rounded-full transition-all duration-500
                          ${isPast ? "bg-purple-500" : isActive ? "bg-purple-500 animate-pulse" : "bg-slate-200"}
                        `} />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between w-full max-w-xs mt-2 text-xs text-slate-400">
                  <span>Extract Keywords</span>
                  <span>Search Papers</span>
                </div>
              </div>
            </div>

            {/* Query preview */}
            {lastQuery && (
              <div className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-lg p-6 animate-fade-in-up">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <span className="font-medium text-slate-700">Your Query</span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-3">{lastQuery}</p>
              </div>
            )}
          </div>
        )}

        {/* Results Step */}
        {step === "results" && (
          <div className="animate-fade-in">
            <PaperList papers={papers} keywords={keywords} total={total} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 mt-20">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center text-sm text-slate-400">
          Powered by OpenAI & Semantic Scholar API
        </div>
      </footer>
    </div>
  );
}
