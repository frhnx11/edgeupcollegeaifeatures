"use client";

import Editor from "@monaco-editor/react";
import { SupportedLanguage } from "../lib/codingTypes";
import { LANGUAGE_CONFIG } from "../lib/languageConfig";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: SupportedLanguage;
  disabled?: boolean;
}

export default function CodeEditor({
  value,
  onChange,
  language = "python",
  disabled = false,
}: CodeEditorProps) {
  const monacoLanguage = LANGUAGE_CONFIG[language]?.monacoId || "python";

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-slate-300 bg-white">
      <Editor
        height="100%"
        language={monacoLanguage}
        value={value}
        onChange={(val) => onChange(val || "")}
        theme="vs-light"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          wordWrap: "on",
          readOnly: disabled,
          padding: { top: 16, bottom: 16 },
          automaticLayout: true,
        }}
      />
    </div>
  );
}
