export interface Author {
  given?: string;
  family?: string;
  name?: string; // For single name field
}

export interface CitationMetadata {
  title: string;
  authors: Author[];
  year?: number;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  publisher?: string;
  type?: string; // article, book, chapter, etc.
}

export interface FormattedCitation {
  inText: string;
  reference: string;
}

export type CitationStyle = "apa" | "mla" | "chicago";

export interface GenerateCitationRequest {
  input: string; // DOI or URL
  style: CitationStyle;
}

export interface GenerateCitationResponse {
  metadata: CitationMetadata;
  citation: FormattedCitation;
}
