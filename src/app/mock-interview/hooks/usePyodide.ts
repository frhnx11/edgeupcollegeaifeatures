"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { CodeOutput, TestCase, TestResult } from "../lib/codingTypes";

// Pyodide types
interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdout: (options: { batched: (msg: string) => void }) => void;
  setStderr: (options: { batched: (msg: string) => void }) => void;
  globals: {
    get: (name: string) => unknown;
  };
}

declare global {
  interface Window {
    loadPyodide?: () => Promise<PyodideInterface>;
  }
}

// Singleton pattern - keep pyodide instance across component remounts
let pyodideInstance: PyodideInterface | null = null;
let pyodideLoading: Promise<PyodideInterface> | null = null;

export function usePyodide() {
  const [isLoading, setIsLoading] = useState(!pyodideInstance);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stdoutRef = useRef<string>("");
  const stderrRef = useRef<string>("");

  // Load Pyodide
  useEffect(() => {
    const loadPyodide = async () => {
      // Already loaded
      if (pyodideInstance) {
        setIsLoading(false);
        return;
      }

      // Currently loading
      if (pyodideLoading) {
        try {
          await pyodideLoading;
          setIsLoading(false);
        } catch (err) {
          setError("Failed to load Python runtime");
        }
        return;
      }

      // Start loading
      try {
        // Load the script if not already loaded
        if (!window.loadPyodide) {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js";
          script.async = true;

          await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load Pyodide script"));
            document.head.appendChild(script);
          });
        }

        // Initialize Pyodide
        pyodideLoading = window.loadPyodide!();
        pyodideInstance = await pyodideLoading;
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load Python runtime");
        console.error("Pyodide load error:", err);
      }
    };

    loadPyodide();
  }, []);

  // Run code
  const runCode = useCallback(async (code: string): Promise<CodeOutput> => {
    if (!pyodideInstance) {
      return {
        stdout: "",
        stderr: "",
        returnValue: null,
        error: "Python runtime not loaded yet",
      };
    }

    setIsRunning(true);
    stdoutRef.current = "";
    stderrRef.current = "";

    // Capture stdout/stderr
    pyodideInstance.setStdout({
      batched: (msg: string) => {
        stdoutRef.current += msg + "\n";
      },
    });

    pyodideInstance.setStderr({
      batched: (msg: string) => {
        stderrRef.current += msg + "\n";
      },
    });

    try {
      const result = await pyodideInstance.runPythonAsync(code);

      setIsRunning(false);
      return {
        stdout: stdoutRef.current.trim(),
        stderr: stderrRef.current.trim(),
        returnValue: result !== undefined && result !== null ? String(result) : null,
        error: null,
      };
    } catch (err) {
      setIsRunning(false);
      const errorMessage = err instanceof Error ? err.message : String(err);

      return {
        stdout: stdoutRef.current.trim(),
        stderr: stderrRef.current.trim(),
        returnValue: null,
        error: errorMessage,
      };
    }
  }, []);

  // Run code with test cases
  const runWithTestCases = useCallback(
    async (
      code: string,
      functionName: string,
      testCases: TestCase[]
    ): Promise<CodeOutput> => {
      if (!pyodideInstance) {
        return {
          stdout: "",
          stderr: "",
          returnValue: null,
          error: "Python runtime not loaded yet",
        };
      }

      setIsRunning(true);
      stdoutRef.current = "";
      stderrRef.current = "";

      // Capture stdout/stderr
      pyodideInstance.setStdout({
        batched: (msg: string) => {
          stdoutRef.current += msg + "\n";
        },
      });

      pyodideInstance.setStderr({
        batched: (msg: string) => {
          stderrRef.current += msg + "\n";
        },
      });

      try {
        // First, run user's code to define the function
        await pyodideInstance.runPythonAsync(code);

        // Run test cases
        const testResults: TestResult[] = [];

        for (const testCase of testCases) {
          try {
            // Build the function call from the input
            // Input format: "a = 3, b = 5" or "3, 5"
            const callCode = `
__test_result__ = ${functionName}(${testCase.input})
str(__test_result__)
`;
            const result = await pyodideInstance.runPythonAsync(callCode);
            const actualOutput = String(result);

            testResults.push({
              input: testCase.input,
              expected: testCase.output,
              actual: actualOutput,
              passed: actualOutput.trim() === testCase.output.trim(),
            });
          } catch (testErr) {
            testResults.push({
              input: testCase.input,
              expected: testCase.output,
              actual: testErr instanceof Error ? testErr.message : String(testErr),
              passed: false,
            });
          }
        }

        setIsRunning(false);
        return {
          stdout: stdoutRef.current.trim(),
          stderr: stderrRef.current.trim(),
          returnValue: null,
          error: null,
          testResults,
        };
      } catch (err) {
        setIsRunning(false);
        const errorMessage = err instanceof Error ? err.message : String(err);

        return {
          stdout: stdoutRef.current.trim(),
          stderr: stderrRef.current.trim(),
          returnValue: null,
          error: errorMessage,
        };
      }
    },
    []
  );

  return {
    isLoading,
    isRunning,
    error,
    runCode,
    runWithTestCases,
  };
}
