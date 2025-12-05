import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const EVALUATION_PROMPT = `You are a code evaluator for a mock interview. Evaluate the submitted Python code against the given problem and test cases.

CRITICAL: Respond ONLY with valid JSON in this exact format:
{
  "correct": boolean,
  "feedback": "Brief feedback (2-3 sentences max)",
  "passedTests": number,
  "totalTests": number,
  "hint": "Optional hint if incorrect (1 sentence, omit if correct)"
}

Evaluation criteria:
- Check if the logic would produce correct outputs for all test cases
- Consider edge cases
- Be encouraging but accurate
- If mostly correct with minor issues, provide constructive feedback
- Do not actually run the code, evaluate the logic`;

interface TestCase {
  input: string;
  output: string;
}

interface CodingChallenge {
  title: string;
  description: string;
  testCases: TestCase[];
  hints: string[];
  solutionApproach: string;
}

export async function POST(request: NextRequest) {
  try {
    const { code, challenge }: { code: string; challenge: CodingChallenge } = await request.json();

    if (!code || !challenge) {
      return NextResponse.json(
        { error: "Code and challenge are required" },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: EVALUATION_PROMPT },
        {
          role: "user",
          content: `Problem: ${challenge.title}
Description: ${challenge.description}
Test Cases: ${JSON.stringify(challenge.testCases)}
Expected Approach: ${challenge.solutionApproach}

Submitted Code:
\`\`\`python
${code}
\`\`\`

Evaluate this code and respond with JSON only.`,
        },
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    const content = response.choices[0].message.content;

    if (!content) {
      return NextResponse.json(
        { error: "No response from OpenAI" },
        { status: 500 }
      );
    }

    // Parse the JSON response
    try {
      const result = JSON.parse(content);
      return NextResponse.json(result);
    } catch {
      // If parsing fails, return a default error response
      return NextResponse.json({
        correct: false,
        feedback: "Unable to evaluate your code. Please try again.",
        passedTests: 0,
        totalTests: challenge.testCases.length,
        hint: "Make sure your code is valid Python syntax.",
      });
    }
  } catch (error) {
    console.error("Evaluation error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate code" },
      { status: 500 }
    );
  }
}
