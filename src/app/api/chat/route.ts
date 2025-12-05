import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are James, an AI interviewer conducting a mock interview.

Interview Flow:
1. Start with a brief greeting, then IMMEDIATELY use the ask_language_preference tool
2. After user selects language, remember it for all coding challenges
3. Proceed with 5-6 interview questions, including 1-2 coding challenges

IMPORTANT - At the very start:
- Use the ask_language_preference tool to let user choose their language
- Do NOT ask for language in text - use the tool instead

When using show_coding_challenge:
- ALWAYS set the "language" parameter to match the user's selected preference
- Generate function signatures in their preferred language syntax
- Only use 1-2 coding challenges total in the entire interview

IMPORTANT - When user completes a coding challenge:
- If you see "[User completed the coding challenge successfully]", briefly congratulate them and move on to a DIFFERENT question (behavioral, technical, etc.)
- Do NOT give another coding challenge immediately after one is completed
- Do NOT repeat the same challenge

Guidelines:
- Keep responses to 1-2 short sentences max
- Brief acknowledgment of answers, then next question
- Coding challenges should be easy/entry-level problems
- After all questions: Give brief overall feedback

Start with a greeting and use ask_language_preference tool.`;

// Tool definitions
const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "ask_language_preference",
      description: "Show language selection buttons to the user. Use this at the very start of the interview to let the user choose their preferred programming language.",
      parameters: {
        type: "object",
        properties: {
          spoken_prompt: {
            type: "string",
            description: "What James says to ask for language preference (1 sentence, e.g., 'Which programming language would you like to use today?')",
          },
        },
        required: ["spoken_prompt"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "show_coding_challenge",
      description: "Display a coding challenge for the candidate to solve. Use this for 1-2 questions during the interview.",
      parameters: {
        type: "object",
        properties: {
          spoken_intro: {
            type: "string",
            description: "What James says to introduce the challenge (1-2 sentences)",
          },
          title: {
            type: "string",
            description: "Title of the coding problem",
          },
          description: {
            type: "string",
            description: "Full problem description with constraints",
          },
          function_signature: {
            type: "string",
            description: "The function signature the user should implement. Use Python syntax by default, e.g. 'def add_numbers(a: int, b: int) -> int:'",
          },
          language: {
            type: "string",
            enum: ["python", "javascript", "typescript", "java", "cpp", "c", "csharp", "go", "ruby", "rust"],
            description: "Programming language for the challenge. Default to 'python' unless the user specifies otherwise.",
          },
          test_cases: {
            type: "array",
            items: {
              type: "object",
              properties: {
                input: { type: "string" },
                output: { type: "string" },
              },
              required: ["input", "output"],
            },
            description: "Test cases with input/output. IMPORTANT: Use positional arguments only (e.g., '3, 5' not 'a = 3, b = 5'). For arrays: '[1, 2, 3], 5'. For strings: '\"hello\"'.",
          },
          hints: {
            type: "array",
            items: { type: "string" },
            description: "Hints to help if the candidate struggles",
          },
          solution_approach: {
            type: "string",
            description: "Brief description of the optimal approach for evaluation",
          },
        },
        required: ["spoken_intro", "title", "description", "function_signature", "test_cases"],
      },
    },
  },
];

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, disableTools } = await request.json();

    console.log("\n=== CHAT API REQUEST ===");
    console.log("Messages count:", messages?.length || 0);
    console.log("Disable tools:", disableTools || false);

    const chatMessages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    // Add conversation history
    if (messages && messages.length > 0) {
      chatMessages.push(...messages);
    } else {
      // First message - prompt to start
      chatMessages.push({
        role: "user",
        content: "[Interview starting - candidate is ready]",
      });
    }

    // Build request options - disable tools when requesting hints
    const requestOptions: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming = {
      model: "gpt-4o",
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 500,
    };

    // Only include tools if not disabled (e.g., for hint requests)
    if (!disableTools) {
      requestOptions.tools = tools;
      requestOptions.tool_choice = "auto";
    }

    const response = await openai.chat.completions.create(requestOptions);

    const message = response.choices[0].message;

    console.log("\n=== AI RESPONSE ===");
    console.log("Content:", message.content);
    console.log("Tool calls:", message.tool_calls ? JSON.stringify(message.tool_calls, null, 2) : "None");

    // Check if there are tool calls
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0];

      if (toolCall.type === "function") {
        const args = JSON.parse(toolCall.function.arguments);

        // Handle ask_language_preference tool
        if (toolCall.function.name === "ask_language_preference") {
          console.log("\n=== TOOL CALL: ask_language_preference ===");
          console.log("Spoken prompt:", args.spoken_prompt);

          return NextResponse.json({
            content: args.spoken_prompt,
            tool_call: {
              name: "ask_language_preference",
            },
          });
        }

        // Handle show_coding_challenge tool
        if (toolCall.function.name === "show_coding_challenge") {
          console.log("\n=== TOOL CALL: show_coding_challenge ===");
          console.log("Spoken intro:", args.spoken_intro);
          console.log("Challenge title:", args.title);

          return NextResponse.json({
            content: args.spoken_intro,
            tool_call: {
              name: "show_coding_challenge",
              challenge: {
                title: args.title,
                description: args.description,
                functionSignature: args.function_signature,
                language: args.language || "python",
                testCases: args.test_cases,
                hints: args.hints || [],
                solutionApproach: args.solution_approach || "",
              },
            },
          });
        }
      }
    }

    // Regular conversation response
    return NextResponse.json({
      content: message.content || "",
      tool_call: null,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
