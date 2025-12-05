"use client";

import { SupportedLanguage } from "../lib/codingTypes";
import { SUPPORTED_LANGUAGES } from "../lib/languageConfig";

interface LanguageButtonsProps {
  onSelect: (language: SupportedLanguage) => void;
  visible: boolean;
}

export default function LanguageButtons({ onSelect, visible }: LanguageButtonsProps) {
  if (!visible) return null;

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-200">
        <h3 className="text-center text-slate-700 font-medium mb-4">
          Select your preferred language:
        </h3>
        <div className="grid grid-cols-5 gap-3">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.value}
              onClick={() => onSelect(lang.value)}
              className="px-4 py-3 bg-slate-100 hover:bg-blue-500 hover:text-white
                         text-slate-700 font-medium rounded-xl
                         transition-all duration-200 hover:scale-105 hover:shadow-md
                         border border-slate-200 hover:border-blue-500"
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
