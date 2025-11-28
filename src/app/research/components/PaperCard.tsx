"use client";

import { useState } from "react";
import { Paper } from "../lib/types";

interface PaperCardProps {
  paper: Paper;
  index: number;
}

function formatAuthors(authors: { name: string }[]): string {
  if (authors.length === 0) return "Unknown authors";
  if (authors.length === 1) return authors[0].name;
  if (authors.length === 2) return `${authors[0].name} and ${authors[1].name}`;
  return `${authors[0].name} et al.`;
}

function getCitationBadgeColor(count: number): string {
  if (count >= 100) return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (count >= 50) return "bg-blue-100 text-blue-700 border-blue-200";
  if (count >= 10) return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
}

function getCitationLabel(count: number): string {
  if (count >= 100) return "Highly Cited";
  if (count >= 50) return "Well Cited";
  if (count >= 10) return "Cited";
  return "";
}

export default function PaperCard({ paper, index }: PaperCardProps) {
  const [expanded, setExpanded] = useState(false);

  const abstract = paper.abstract || "No abstract available";
  const shouldTruncate = abstract.length > 300;
  const displayAbstract = expanded || !shouldTruncate
    ? abstract
    : abstract.slice(0, 300) + "...";

  return (
    <div
      className="group bg-white rounded-2xl border border-slate-200 p-6
                 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300
                 transition-all duration-300 ease-out
                 opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <a
            href={paper.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold text-slate-800 hover:text-purple-600
                       transition-colors line-clamp-2 leading-tight"
          >
            {paper.title}
          </a>
          <p className="text-slate-500 text-sm mt-1">
            {formatAuthors(paper.authors)}
          </p>
        </div>

        {/* Citation Badge */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div className={`
            px-3 py-2 rounded-xl border text-center min-w-[70px]
            ${getCitationBadgeColor(paper.citationCount)}
          `}>
            <div className="text-lg font-bold">{paper.citationCount}</div>
            <div className="text-[10px] uppercase tracking-wide">citations</div>
          </div>
          {getCitationLabel(paper.citationCount) && (
            <span className={`mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full border
              ${getCitationBadgeColor(paper.citationCount)}`}>
              {getCitationLabel(paper.citationCount)}
            </span>
          )}
        </div>
      </div>

      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
        {paper.year && (
          <span className="inline-flex items-center gap-1.5 text-slate-500">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {paper.year}
          </span>
        )}
        {paper.venue && (
          <span className="px-2.5 py-1 bg-purple-50 text-purple-600 rounded-lg text-xs font-medium truncate max-w-[200px]">
            {paper.venue}
          </span>
        )}
        {paper.openAccessPdf && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-medium">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
            </svg>
            Open Access
          </span>
        )}
      </div>

      {/* Abstract */}
      <div className="mb-4">
        <p className="text-slate-600 text-sm leading-relaxed">
          {displayAbstract}
        </p>
        {shouldTruncate && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-sm font-medium text-purple-600 hover:text-purple-700"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
        <a
          href={paper.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2
                     bg-slate-900 text-white rounded-lg
                     hover:bg-purple-600 hover:shadow-lg hover:shadow-purple-500/25
                     transition-all duration-300 text-sm font-medium"
        >
          View Paper
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}
