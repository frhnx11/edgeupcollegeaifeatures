import { SupportedLanguage } from "./codingTypes";

export interface LanguageConfig {
  id: number; // Judge0 language ID
  name: string; // Display name
  monacoId: string; // Monaco editor language identifier
  extension: string; // File extension
  template: (functionName: string, params: string, returnType: string) => string;
}

export const LANGUAGE_CONFIG: Record<SupportedLanguage, LanguageConfig> = {
  python: {
    id: 71, // Python 3.8.1
    name: "Python",
    monacoId: "python",
    extension: "py",
    template: (fn, params, ret) =>
      `def ${fn}(${params}):\n    # Write your code here\n    pass`,
  },
  javascript: {
    id: 63, // JavaScript (Node.js 12.14.0)
    name: "JavaScript",
    monacoId: "javascript",
    extension: "js",
    template: (fn, params) =>
      `function ${fn}(${params}) {\n    // Write your code here\n    \n}`,
  },
  typescript: {
    id: 74, // TypeScript 3.7.4
    name: "TypeScript",
    monacoId: "typescript",
    extension: "ts",
    template: (fn, params, ret) =>
      `function ${fn}(${params}): ${ret || "any"} {\n    // Write your code here\n    \n}`,
  },
  java: {
    id: 62, // Java (OpenJDK 13.0.1)
    name: "Java",
    monacoId: "java",
    extension: "java",
    template: (fn, params, ret) =>
      `public class Solution {\n    public static ${ret || "int"} ${fn}(${params}) {\n        // Write your code here\n        return 0;\n    }\n}`,
  },
  cpp: {
    id: 54, // C++ (GCC 9.2.0)
    name: "C++",
    monacoId: "cpp",
    extension: "cpp",
    template: (fn, params, ret) =>
      `#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\n${ret || "int"} ${fn}(${params}) {\n    // Write your code here\n    return 0;\n}`,
  },
  c: {
    id: 50, // C (GCC 9.2.0)
    name: "C",
    monacoId: "c",
    extension: "c",
    template: (fn, params, ret) =>
      `#include <stdio.h>\n#include <stdlib.h>\n\n${ret || "int"} ${fn}(${params}) {\n    // Write your code here\n    return 0;\n}`,
  },
  csharp: {
    id: 51, // C# (Mono 6.6.0.161)
    name: "C#",
    monacoId: "csharp",
    extension: "cs",
    template: (fn, params, ret) =>
      `using System;\n\npublic class Solution {\n    public static ${ret || "int"} ${fn}(${params}) {\n        // Write your code here\n        return 0;\n    }\n}`,
  },
  go: {
    id: 60, // Go (1.13.5)
    name: "Go",
    monacoId: "go",
    extension: "go",
    template: (fn, params, ret) =>
      `package main\n\nimport "fmt"\n\nfunc ${fn}(${params}) ${ret || "int"} {\n    // Write your code here\n    return 0\n}`,
  },
  ruby: {
    id: 72, // Ruby (2.7.0)
    name: "Ruby",
    monacoId: "ruby",
    extension: "rb",
    template: (fn, params) =>
      `def ${fn}(${params})\n    # Write your code here\n    \nend`,
  },
  rust: {
    id: 73, // Rust (1.40.0)
    name: "Rust",
    monacoId: "rust",
    extension: "rs",
    template: (fn, params, ret) =>
      `fn ${fn}(${params}) -> ${ret || "i32"} {\n    // Write your code here\n    0\n}`,
  },
};

// Get all languages as array for dropdowns
export const SUPPORTED_LANGUAGES = Object.entries(LANGUAGE_CONFIG).map(
  ([key, config]) => ({
    value: key as SupportedLanguage,
    label: config.name,
  })
);

// Default language
export const DEFAULT_LANGUAGE: SupportedLanguage = "python";
