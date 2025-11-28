"use client";

import { useState } from "react";
import ResumeUploader from "./components/ResumeUploader";
import JobList from "./components/JobList";
import { ResumeAnalysis, MatchedJob } from "./lib/types";
import Link from "next/link";

type Step = "upload" | "analyzing" | "searching" | "matching" | "results";

export default function JobMatchPage() {
  const [step, setStep] = useState<Step>("upload");
  const [error, setError] = useState<string | null>(null);
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null);
  const [matchedJobs, setMatchedJobs] = useState<MatchedJob[]>([]);

  const handleUpload = async (file: File) => {
    setError(null);
    setStep("analyzing");

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const analyzeRes = await fetch("/job-match/api/analyze", {
        method: "POST",
        body: formData,
      });

      const analyzeData = await analyzeRes.json();

      if (!analyzeRes.ok) {
        throw new Error(analyzeData.error || "Failed to analyze resume");
      }

      setResumeAnalysis(analyzeData.analysis);
      setStep("searching");

      const searchRes = await fetch("/job-match/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeAnalysis: analyzeData.analysis }),
      });

      const searchData = await searchRes.json();

      if (!searchRes.ok) {
        throw new Error(searchData.error || "Failed to search jobs");
      }

      setStep("matching");

      const matchRes = await fetch("/job-match/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeAnalysis: analyzeData.analysis,
          jobs: searchData.jobs,
        }),
      });

      const matchData = await matchRes.json();

      if (!matchRes.ok) {
        throw new Error(matchData.error || "Failed to match jobs");
      }

      setMatchedJobs(matchData.jobs);
      setStep("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep("upload");
    }
  };

  const handleReset = () => {
    setStep("upload");
    setError(null);
    setResumeAnalysis(null);
    setMatchedJobs([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50/30">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-white/20 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 animate-fade-in">
              <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    JobMatch AI
                  </h1>
                  <p className="text-xs text-slate-500">Smart job recommendations</p>
                </div>
              </Link>
            </div>
            {step === "results" && (
              <button
                onClick={handleReset}
                className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50
                         rounded-full hover:bg-blue-100 transition-all duration-300 animate-fade-in"
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

      <main className="max-w-6xl mx-auto px-6 py-12">
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

        {/* Upload Step */}
        {step === "upload" && (
          <div className="max-w-2xl mx-auto animate-fade-in-up">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                AI-Powered Matching
              </div>
              <h2 className="text-4xl font-bold text-slate-800 mb-4">
                Find Your Perfect Job
              </h2>
              <p className="text-lg text-slate-500 max-w-md mx-auto">
                Upload your resume and let AI find the best job matches tailored to your skills and experience
              </p>
            </div>
            <ResumeUploader onUpload={handleUpload} isLoading={false} />

            {/* Features */}
            <div className="grid grid-cols-3 gap-6 mt-12">
              {[
                { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", title: "Smart Analysis", desc: "AI reads your resume" },
                { icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z", title: "Job Search", desc: "Finds matching positions" },
                { icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", title: "Match Score", desc: "Ranks by compatibility" },
              ].map((feature, i) => (
                <div key={i} className={`text-center p-4 opacity-0 animate-fade-in-up stagger-${i + 1}`}>
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-blue-50 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        {(step === "analyzing" || step === "searching" || step === "matching") && (
          <div className="max-w-lg mx-auto animate-fade-in">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-10">
              <div className="flex flex-col items-center">
                {/* Animated loader */}
                <div className="relative mb-8">
                  <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                  </div>
                  <div className="absolute inset-0 w-20 h-20 rounded-full bg-blue-400/20 animate-pulse-ring" />
                </div>

                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  {step === "analyzing" && "Analyzing Your Resume"}
                  {step === "searching" && "Searching for Jobs"}
                  {step === "matching" && "Matching Jobs"}
                </h3>
                <p className="text-slate-500 text-center mb-8">
                  {step === "analyzing" && "AI is extracting your skills and experience..."}
                  {step === "searching" && "Finding relevant job opportunities..."}
                  {step === "matching" && "Calculating match scores for each position..."}
                </p>

                {/* Progress indicator */}
                <div className="flex items-center gap-3 w-full max-w-xs">
                  {["analyzing", "searching", "matching"].map((s, i) => {
                    const isActive = step === s;
                    const isPast = ["analyzing", "searching", "matching"].indexOf(step) > i;
                    return (
                      <div key={s} className="flex-1 flex items-center">
                        <div className={`
                          w-full h-2 rounded-full transition-all duration-500
                          ${isPast ? "bg-blue-500" : isActive ? "bg-blue-500 animate-pulse" : "bg-slate-200"}
                        `} />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between w-full max-w-xs mt-2 text-xs text-slate-400">
                  <span>Analyze</span>
                  <span>Search</span>
                  <span>Match</span>
                </div>
              </div>
            </div>

            {/* Resume preview during processing */}
            {resumeAnalysis && (step === "searching" || step === "matching") && (
              <div className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-lg p-6 animate-fade-in-up">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="font-medium text-slate-700">Profile Extracted</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-slate-400 w-20 flex-shrink-0">Roles:</span>
                    <span className="text-slate-700">{resumeAnalysis.job_titles.slice(0, 2).join(", ")}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-slate-400 w-20 flex-shrink-0">Experience:</span>
                    <span className="text-slate-700">{resumeAnalysis.experience_years} years</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {resumeAnalysis.skills.slice(0, 5).map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results Step */}
        {step === "results" && (
          <div className="animate-fade-in">
            {/* Resume Summary Card */}
            {resumeAnalysis && (
              <div className="mb-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/25 animate-fade-in-up">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-blue-100">Your Profile</span>
                    </div>
                    <p className="text-lg text-white/90 mb-4 leading-relaxed">{resumeAnalysis.summary}</p>
                    <div className="flex flex-wrap gap-2">
                      {resumeAnalysis.skills.slice(0, 6).map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {resumeAnalysis.skills.length > 6 && (
                        <span className="px-3 py-1.5 text-sm text-blue-100">
                          +{resumeAnalysis.skills.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-8 text-right">
                    <div className="text-4xl font-bold">{resumeAnalysis.experience_years}</div>
                    <div className="text-sm text-blue-100">years exp.</div>
                  </div>
                </div>
              </div>
            )}

            {/* Job List */}
            <JobList jobs={matchedJobs} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-sm text-slate-400">
          Powered by OpenAI GPT-4o & JSearch API
        </div>
      </footer>
    </div>
  );
}
