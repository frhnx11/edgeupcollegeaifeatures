import { CitationMetadata, Author } from "./types";

const SEMANTIC_SCHOLAR_API = "https://api.semanticscholar.org/graph/v1";
const FIELDS = "paperId,title,abstract,authors,year,citationCount,venue,publicationVenue,externalIds,url";

interface SemanticScholarAuthor {
  name: string;
}

interface SemanticScholarPaper {
  paperId: string;
  title: string;
  authors: SemanticScholarAuthor[];
  year?: number;
  venue?: string;
  publicationVenue?: {
    name?: string;
  };
  externalIds?: {
    DOI?: string;
  };
  url?: string;
}

// Check if input is a Semantic Scholar URL
export function isSemanticScholarUrl(input: string): boolean {
  return input.includes("semanticscholar.org/paper/");
}

// Extract paper ID from Semantic Scholar URL
function extractPaperId(url: string): string | null {
  // URLs look like: https://www.semanticscholar.org/paper/Title-Here-Author/abc123def456
  const match = url.match(/semanticscholar\.org\/paper\/[^/]+\/([a-f0-9]+)/i);
  if (match) return match[1];

  // Alternative format: just the hash at the end
  const altMatch = url.match(/semanticscholar\.org\/paper\/([a-f0-9]{40})/i);
  if (altMatch) return altMatch[1];

  return null;
}

// Convert Semantic Scholar paper to our metadata format
function toMetadata(paper: SemanticScholarPaper): CitationMetadata {
  const authors: Author[] = paper.authors.map((a) => {
    const parts = a.name.split(" ");
    if (parts.length >= 2) {
      return {
        given: parts.slice(0, -1).join(" "),
        family: parts[parts.length - 1],
      };
    }
    return { name: a.name };
  });

  return {
    title: paper.title,
    authors,
    year: paper.year,
    journal: paper.publicationVenue?.name || paper.venue,
    doi: paper.externalIds?.DOI,
    url: paper.url || (paper.externalIds?.DOI ? `https://doi.org/${paper.externalIds.DOI}` : undefined),
  };
}

// Fetch paper by Semantic Scholar URL
export async function fetchFromSemanticScholar(url: string): Promise<CitationMetadata | null> {
  const paperId = extractPaperId(url);
  if (!paperId) {
    console.log("Could not extract paper ID from Semantic Scholar URL");
    return null;
  }

  try {
    const response = await fetch(`${SEMANTIC_SCHOLAR_API}/paper/${paperId}?fields=${FIELDS}`);

    if (!response.ok) {
      console.error(`Semantic Scholar API error: ${response.status}`);
      return null;
    }

    const paper: SemanticScholarPaper = await response.json();
    return toMetadata(paper);
  } catch (error) {
    console.error("Semantic Scholar fetch error:", error);
    return null;
  }
}

// Search for paper by title
export async function searchByTitle(title: string): Promise<CitationMetadata | null> {
  try {
    console.log("Searching Semantic Scholar for:", title);

    const response = await fetch(
      `${SEMANTIC_SCHOLAR_API}/paper/search?query=${encodeURIComponent(title)}&fields=${FIELDS}&limit=1`
    );

    if (!response.ok) {
      console.error(`Semantic Scholar search error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      console.log("No papers found for title search");
      return null;
    }

    const paper: SemanticScholarPaper = data.data[0];
    console.log("Found paper:", paper.title);
    return toMetadata(paper);
  } catch (error) {
    console.error("Semantic Scholar search error:", error);
    return null;
  }
}

// Check if input looks like a URL
export function isUrl(input: string): boolean {
  return input.startsWith("http://") || input.startsWith("https://");
}
