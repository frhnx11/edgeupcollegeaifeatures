// Paper from Semantic Scholar API
export interface Paper {
  paperId: string;
  title: string;
  abstract: string | null;
  authors: Author[];
  year: number | null;
  citationCount: number;
  url: string;
  openAccessPdf: { url: string } | null;
  venue: string | null;
}

export interface Author {
  authorId: string;
  name: string;
}

// Semantic Scholar API response
export interface SemanticScholarResponse {
  total: number;
  token: string | null;
  data: Paper[];
}

// Search request/response types
export interface SearchRequest {
  query: string;
}

export interface SearchResponse {
  papers: Paper[];
  keywords: string[];
  total: number;
}

// Keyword extraction from OpenAI
export interface KeywordExtraction {
  keywords: string[];
}
