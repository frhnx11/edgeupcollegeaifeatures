"use client";

import Link from "next/link";

const features = [
  {
    id: "job-match",
    title: "Job Match AI",
    description: "Upload your resume and let AI find the best job matches tailored to your skills and experience.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    href: "/job-match",
    gradient: "from-blue-500 to-blue-600",
    shadowColor: "shadow-blue-500/25",
    available: true,
  },
  {
    id: "research",
    title: "Research Paper Finder",
    description: "Describe your research topic and find relevant academic papers from 200M+ publications.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    href: "/research",
    gradient: "from-purple-500 to-purple-600",
    shadowColor: "shadow-purple-500/25",
    available: true,
  },
  {
    id: "formatter",
    title: "Citation Generator",
    description: "Generate perfectly formatted citations in APA, MLA, and Chicago styles from any DOI or paper URL.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    href: "/formatter",
    gradient: "from-teal-500 to-teal-600",
    shadowColor: "shadow-teal-500/25",
    available: true,
  },
  {
    id: "mock-interview",
    title: "Mock Interview",
    description: "Practice interviews with AI and get real-time feedback to ace your next job interview.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    href: "/mock-interview",
    gradient: "from-orange-500 to-orange-600",
    shadowColor: "shadow-orange-500/25",
    available: true,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/50">
      {/* Header */}
      <header className="border-b border-slate-200/50 bg-white/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">EdgeUp College</h1>
              <p className="text-xs text-slate-500">AI-Powered Tools</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            AI Features Available
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Choose Your AI Assistant
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Select a feature below to get started with AI-powered tools designed to help you succeed.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature) => (
            <Link
              key={feature.id}
              href={feature.href}
              className={`
                group relative bg-white rounded-2xl border border-slate-200 p-8
                transition-all duration-300 ease-out
                ${feature.available
                  ? "hover:shadow-xl hover:border-slate-300 hover:scale-[1.02] cursor-pointer"
                  : "opacity-75 cursor-default"
                }
              `}
              onClick={(e) => !feature.available && e.preventDefault()}
            >
              {/* Icon */}
              <div className={`
                w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient}
                flex items-center justify-center text-white mb-6
                shadow-lg ${feature.shadowColor}
                transition-transform duration-300
                ${feature.available ? "group-hover:scale-110" : ""}
              `}>
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">
                {feature.description}
              </p>

              {/* Status Badge */}
              {feature.available ? (
                <div className="inline-flex items-center gap-2 text-sm font-medium text-blue-600">
                  Get Started
                  <svg
                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-500">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Coming Soon
                </div>
              )}

              {/* Hover Effect Decoration */}
              {feature.available && (
                <div className={`
                  absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0
                  group-hover:opacity-5 transition-opacity duration-300 pointer-events-none
                `} />
              )}
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 mt-20">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center text-sm text-slate-400">
          Powered by AI
        </div>
      </footer>
    </div>
  );
}
