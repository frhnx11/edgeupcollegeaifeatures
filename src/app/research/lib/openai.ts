import OpenAI from "openai";
import { KeywordExtraction } from "./types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const KEYWORD_EXTRACTION_PROMPT = `You are an academic search assistant. Your job is to extract optimal search keywords from a user's research description.

Given a natural language description of a research topic, extract 3-5 search keywords that would work best for finding academic papers.

Guidelines:
- Use academic/scientific terminology
- Include both broad and specific terms
- Consider synonyms used in academic literature
- Avoid common words like "study", "research", "paper"

Return a JSON object with this exact structure:
{ "keywords": ["keyword1", "keyword2", "keyword3"] }

Only return valid JSON, no markdown or explanation.`;

export async function extractKeywords(query: string): Promise<KeywordExtraction> {
  console.log("\n========== OPENAI KEYWORD EXTRACTION ==========");
  console.log("User query:", query);

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: KEYWORD_EXTRACTION_PROMPT },
      { role: "user", content: query },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_tokens: 200,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  const extraction = JSON.parse(content) as KeywordExtraction;

  console.log("Extracted keywords:", extraction.keywords);
  console.log("================================================\n");

  return extraction;
}
