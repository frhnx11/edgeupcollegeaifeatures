"use client";

import { useState } from "react";
import { CitationMetadata, FormattedCitation, CitationStyle } from "../lib/types";

interface CitationResultProps {
  metadata: CitationMetadata;
  citation: FormattedCitation;
  style: CitationStyle;
  onReset: () => void;
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
        transition-all duration-200
        ${copied
          ? "bg-green-100 text-green-700"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
        }
      `}
    >
      {copied ? (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}

const styleLabels: Record<CitationStyle, string> = {
  apa: "APA 7th Edition",
  mla: "MLA 9th Edition",
  chicago: "Chicago 17th Edition",
};

export default function CitationResult({ metadata, citation, style, onReset }: CitationResultProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Success Header */}
      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="font-medium text-green-800">Citation Generated</p>
          <p className="text-sm text-green-600">{styleLabels[style]}</p>
        </div>
      </div>

      {/* Paper Info */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
        <h3 className="font-semibold text-slate-800 mb-2">{metadata.title}</h3>
        <div className="flex flex-wrap gap-3 text-sm text-slate-500">
          {metadata.authors.length > 0 && (
            <span>
              {metadata.authors
                .slice(0, 3)
                .map((a) => a.family || a.name || "Unknown")
                .join(", ")}
              {metadata.authors.length > 3 && " et al."}
            </span>
          )}
          {metadata.year && <span>{metadata.year}</span>}
          {metadata.journal && (
            <span className="px-2 py-0.5 bg-teal-50 text-teal-600 rounded-md text-xs">
              {metadata.journal}
            </span>
          )}
        </div>
      </div>

      {/* In-text Citation */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-semibold text-slate-700">In-text Citation</h4>
            <p className="text-xs text-slate-400">Use this in your paper body</p>
          </div>
          <CopyButton text={citation.inText} label="Copy" />
        </div>
        <div className="p-4 bg-slate-50 rounded-lg font-mono text-lg text-slate-800">
          {citation.inText}
        </div>
      </div>

      {/* Full Reference */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-semibold text-slate-700">Full Reference</h4>
            <p className="text-xs text-slate-400">Add this to your bibliography</p>
          </div>
          <CopyButton text={citation.reference} label="Copy" />
        </div>
        <div
          className="p-4 bg-slate-50 rounded-lg text-slate-800 leading-relaxed"
          style={{ fontFamily: "Times New Roman, serif" }}
          dangerouslySetInnerHTML={{
            __html: citation.reference
              .replace(/\*(.*?)\*/g, "<em>$1</em>") // Convert *text* to italics
          }}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onReset}
          className="flex-1 py-3 rounded-xl font-medium text-teal-600 bg-teal-50 hover:bg-teal-100 transition-colors"
        >
          Generate Another Citation
        </button>
      </div>
    </div>
  );
}
