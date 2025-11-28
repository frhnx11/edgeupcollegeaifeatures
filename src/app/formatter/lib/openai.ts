import OpenAI from "openai";
import { CitationMetadata } from "./types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const METADATA_EXTRACTION_PROMPT = `You are a citation metadata extractor. Given a URL or text description of an academic paper, extract the citation metadata.

Return a JSON object with this structure:
{
  "title": "Full title of the paper",
  "authors": [{ "given": "First", "family": "Last" }],
  "year": 2023,
  "journal": "Journal name if applicable",
  "volume": "volume number",
  "issue": "issue number",
  "pages": "page range like 123-145",
  "doi": "DOI if found",
  "url": "URL of the paper",
  "publisher": "Publisher name",
  "type": "article, book, chapter, website, etc."
}

Guidelines:
- Extract as much information as possible
- Use null for fields you cannot determine
- For authors, split into given (first) and family (last) names
- Year should be a number, not a string
- For DOI, only include the identifier part (e.g., "10.1234/example")

Only return valid JSON, no markdown or explanation.`;

export async function extractMetadataWithAI(input: string): Promise<CitationMetadata | null> {
  try {
    console.log("\n========== OPENAI METADATA EXTRACTION ==========");
    console.log("Input:", input.slice(0, 200));

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: METADATA_EXTRACTION_PROMPT },
        { role: "user", content: `Extract citation metadata from this: ${input}` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 500,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const metadata = JSON.parse(content) as CitationMetadata;
    console.log("Extracted metadata:", metadata);
    console.log("================================================\n");

    return metadata;
  } catch (error) {
    console.error("OpenAI metadata extraction error:", error);
    return null;
  }
}
