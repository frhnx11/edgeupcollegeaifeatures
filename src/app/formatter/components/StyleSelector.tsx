"use client";

import { CitationStyle } from "../lib/types";

interface StyleSelectorProps {
  value: CitationStyle;
  onChange: (style: CitationStyle) => void;
  disabled?: boolean;
}

const styles: { id: CitationStyle; label: string; description: string }[] = [
  { id: "apa", label: "APA", description: "7th Edition" },
  { id: "mla", label: "MLA", description: "9th Edition" },
  { id: "chicago", label: "Chicago", description: "17th Edition" },
];

export default function StyleSelector({ value, onChange, disabled }: StyleSelectorProps) {
  return (
    <div className="flex gap-2">
      {styles.map((style) => (
        <button
          key={style.id}
          type="button"
          onClick={() => onChange(style.id)}
          disabled={disabled}
          className={`
            flex-1 px-4 py-3 rounded-xl border-2 transition-all duration-200
            ${value === style.id
              ? "border-teal-500 bg-teal-50 text-teal-700"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          <div className="font-semibold">{style.label}</div>
          <div className="text-xs opacity-70">{style.description}</div>
        </button>
      ))}
    </div>
  );
}
