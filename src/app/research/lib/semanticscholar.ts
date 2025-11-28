import { Paper, SemanticScholarResponse } from "./types";

const SEMANTIC_SCHOLAR_URL = "https://api.semanticscholar.org/graph/v1/paper/search/bulk";

const FIELDS = [
  "paperId",
  "title",
  "abstract",
  "authors",
  "year",
  "citationCount",
  "url",
  "openAccessPdf",
  "venue",
].join(",");

export async function searchPapers(keywords: string[]): Promise<{ papers: Paper[]; total: number }> {
  const query = keywords.join(" ");

  console.log("\n========== SEMANTIC SCHOLAR API REQUEST ==========");
  console.log("Search query:", query);

  const params = new URLSearchParams({
    query,
    fields: FIELDS,
    limit: "20",
  });

  const response = await fetch(`${SEMANTIC_SCHOLAR_URL}?${params}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Semantic Scholar API error:", response.status, errorText);
    throw new Error(`Semantic Scholar API error: ${response.status}`);
  }

  const data: SemanticScholarResponse = await response.json();

  console.log("\n========== SEMANTIC SCHOLAR API RESPONSE ==========");
  console.log("Total papers found:", data.total);
  console.log("Papers returned:", data.data?.length || 0);
  if (data.data && data.data.length > 0) {
    console.log("First 3 papers:");
    data.data.slice(0, 3).forEach((paper, i) => {
      console.log(`  ${i + 1}. ${paper.title} (${paper.year}) - ${paper.citationCount} citations`);
    });
  }
  console.log("===================================================\n");

  return {
    papers: data.data || [],
    total: data.total || 0,
  };
}
