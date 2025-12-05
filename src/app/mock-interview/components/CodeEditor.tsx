"use client";

import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function CodeEditor({ value, onChange, disabled = false }: CodeEditorProps) {
  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-slate-300 bg-white">
      <Editor
        height="100%"
        defaultLanguage="python"
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
