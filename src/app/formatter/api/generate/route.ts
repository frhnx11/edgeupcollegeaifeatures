import { NextResponse } from "next/server";
import { fetchFromCrossRef, extractDOI } from "../../lib/crossref";
import { extractMetadataWithAI } from "../../lib/openai";
import { formatCitation } from "../../lib/formatters";
import { CitationStyle, GenerateCitationResponse } from "../../lib/types";
import { isSemanticScholarUrl, fetchFromSemanticScholar, searchByTitle, isUrl } from "../../lib/semanticscholar";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { input, style } = body as { input: string; style: CitationStyle };

    if (!input || !input.trim()) {
      return NextResponse.json(
        { error: "Please provide a paper URL, DOI, or title" },
        { status: 400 }
      );
    }

    if (!style || !["apa", "mla", "chicago"].includes(style)) {
      return NextResponse.json(
        { error: "Invalid citation style" },
        { status: 400 }
      );
    }

    const trimmedInput = input.trim();
    console.log("\n========== CITATION GENERATION ==========");
    console.log("Input:", trimmedInput);
    console.log("Style:", style);

    let metadata = null;

    // 1. Try DOI lookup via CrossRef (fastest & most accurate)
    const hasDOI = extractDOI(trimmedInput);
    if (hasDOI) {
      console.log("Detected DOI, trying CrossRef...");
      metadata = await fetchFromCrossRef(trimmedInput);
    }

    // 2. Try Semantic Scholar URL
    if (!metadata && isSemanticScholarUrl(trimmedInput)) {
      console.log("Detected Semantic Scholar URL...");
      metadata = await fetchFromSemanticScholar(trimmedInput);
    }

    // 3. For other URLs, try OpenAI extraction
    if (!metadata && isUrl(trimmedInput)) {
      console.log("Detected URL, trying AI extraction...");
      metadata = await extractMetadataWithAI(trimmedInput);
    }

    // 4. Treat as paper title - search Semantic Scholar
    if (!metadata && !isUrl(trimmedInput)) {
      console.log("Treating as paper title, searching...");
      metadata = await searchByTitle(trimmedInput);
    }

    // 5. Final fallback - AI extraction
    if (!metadata) {
      console.log("All methods failed, trying AI as last resort...");
      metadata = await extractMetadataWithAI(trimmedInput);
    }

    if (!metadata) {
      return NextResponse.json(
        { error: "Could not find this paper. Try pasting the exact title or a different URL." },
        { status: 404 }
      );
    }

    // Format the citation
    const citation = formatCitation(metadata, style);

    console.log("Generated citation:", citation);
    console.log("==========================================\n");

    const response: GenerateCitationResponse = {
      metadata,
      citation,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Citation generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate citation. Please try again." },
      { status: 500 }
    );
  }
}
