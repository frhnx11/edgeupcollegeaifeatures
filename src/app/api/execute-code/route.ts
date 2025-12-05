import { NextRequest, NextResponse } from "next/server";
import { SupportedLanguage, TestCase, TestResult } from "@/app/mock-interview/lib/codingTypes";
import { LANGUAGE_CONFIG } from "@/app/mock-interview/lib/languageConfig";
import { generateTestHarness, extractFunctionName } from "@/app/mock-interview/lib/testHarness";

// Free public Judge0 API - no API key required
const JUDGE0_API_URL = "https://ce.judge0.com";

// Base64 encode/decode helpers for Judge0 API
function toBase64(str: string): string {
  return Buffer.from(str, "utf-8").toString("base64");
}

function fromBase64(str: string | null): string {
  if (!str) return "";
  return Buffer.from(str, "base64").toString("utf-8");
}

interface Judge0Submission {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
}

interface Judge0Response {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  status: {
    id: number;
    description: string;
  };
  time: string;
  memory: number;
}

interface ExecuteRequest {
  code: string;
  language: SupportedLanguage;
  functionSignature: string;
  testCases: TestCase[];
}

export async function POST(request: NextRequest) {
  try {
    const { code, language, functionSignature, testCases }: ExecuteRequest = await request.json();

    if (!code || !language || !testCases) {
      return NextResponse.json(
        { error: "Code, language, and testCases are required" },
        { status: 400 }
      );
    }

    const languageConfig = LANGUAGE_CONFIG[language];
    if (!languageConfig) {
      return NextResponse.json(
        { error: `Unsupported language: ${language}` },
        { status: 400 }
      );
    }

    // Extract function name from signature
    const functionName = extractFunctionName(functionSignature, language);

    // Run each test case
    const testResults: TestResult[] = [];
    let hasError = false;
    let errorMessage = "";

    for (const testCase of testCases) {
      try {
        // Generate executable code with test harness
        const executableCode = generateTestHarness(
          language,
          code,
          functionName,
          testCase.input
        );

        // Submit to Judge0 (free public API with base64 encoding for special characters)
        const submission: Judge0Submission = {
          source_code: toBase64(executableCode),
          language_id: languageConfig.id,
        };

        const response = await fetch(`${JUDGE0_API_URL}/submissions?base64_encoded=true&wait=true`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submission),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Judge0 API error:", errorText);
          hasError = true;
          errorMessage = `Judge0 API error: ${response.status}`;
          break;
        }

        const result: Judge0Response = await response.json();

        // Decode base64 outputs from Judge0
        const stdout = fromBase64(result.stdout).trim();
        const stderr = fromBase64(result.stderr).trim();
        const compileOutput = fromBase64(result.compile_output).trim();

        // Check for compilation/runtime errors
        if (result.status.id !== 3) {
          // Status 3 = Accepted (ran successfully)
          if (result.status.id === 6) {
            // Compilation error
            hasError = true;
            errorMessage = compileOutput || "Compilation error";
            break;
          } else if (result.status.id === 11) {
            // Runtime error
            hasError = true;
            errorMessage = stderr || "Runtime error";
            break;
          } else if (result.status.id === 5) {
            // Time limit exceeded
            hasError = true;
            errorMessage = "Time limit exceeded - possible infinite loop";
            break;
          } else {
            // Other error
            hasError = true;
            errorMessage = result.status.description || stderr || "Execution error";
            break;
          }
        }

        // Compare output
        const actualOutput = stdout;
        const expectedOutput = testCase.output.trim();
        const passed = actualOutput === expectedOutput;

        testResults.push({
          input: testCase.input,
          expected: expectedOutput,
          actual: actualOutput,
          passed,
        });
      } catch (error) {
        console.error("Test case execution error:", error);
        hasError = true;
        errorMessage = error instanceof Error ? error.message : "Execution failed";
        break;
      }
    }

    // Return results
    return NextResponse.json({
      stdout: "",
      stderr: "",
      returnValue: null,
      error: hasError ? errorMessage : null,
      testResults: hasError ? [] : testResults,
    });
  } catch (error) {
    console.error("Execute code error:", error);
    return NextResponse.json(
      { error: "Failed to execute code" },
      { status: 500 }
    );
  }
}
