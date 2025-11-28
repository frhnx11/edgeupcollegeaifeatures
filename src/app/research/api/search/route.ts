import { NextRequest, NextResponse } from "next/server";
import { extractKeywords } from "../../lib/openai";
import { searchPapers } from "../../lib/semanticscholar";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body as { query: string };

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Please provide a research topic" },
        { status: 400 }
      );
    }

    // Step 1: Extract keywords from natural language query using OpenAI
    const { keywords } = await extractKeywords(query);

    if (!keywords || keywords.length === 0) {
      return NextResponse.json(
        { error: "Could not extract search terms from your query. Please try rephrasing." },
        { status: 400 }
      );
    }

    // Step 2: Search Semantic Scholar with extracted keywords
    const { papers, total } = await searchPapers(keywords);

    if (papers.length === 0) {
      return NextResponse.json(
        { error: "No papers found matching your research topic. Try a different description." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      papers,
      keywords,
      total,
    });
  } catch (error) {
    console.error("Error searching papers:", error);
    return NextResponse.json(
      { error: "Failed to search for papers. Please try again." },
      { status: 500 }
    );
  }
}
