import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are James, an AI interviewer conducting a 7-question mock interview.

Guidelines:
- Keep responses to 1-2 short sentences max
- Brief acknowledgment of their answer, then next question
- Track question count internally
- Include 1-2 coding challenges during the interview (use the show_coding_challenge tool)
- Coding challenges should be easy/entry-level Python problems
- After 7 questions: Give brief overall feedback

Start with a one-sentence intro and your first question.`;

// Tool definition for coding challenges
const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
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
            description: "The exact Python function signature the user should implement, e.g. 'def add_numbers(a: int, b: int) -> int:'",
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
            description: "Example input/output test cases",
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

      if (toolCall.type === "function" && toolCall.function.name === "show_coding_challenge") {
        const args = JSON.parse(toolCall.function.arguments);

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
              testCases: args.test_cases,
              hints: args.hints || [],
              solutionApproach: args.solution_approach || "",
            },
          },
        });
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
