import { CitationMetadata, Author } from "./types";

const CROSSREF_API = "https://api.crossref.org/works";

interface CrossRefAuthor {
  given?: string;
  family?: string;
  name?: string;
}

interface CrossRefResponse {
  message: {
    title?: string[];
    author?: CrossRefAuthor[];
    published?: {
      "date-parts"?: number[][];
    };
    "published-print"?: {
      "date-parts"?: number[][];
    };
    "published-online"?: {
      "date-parts"?: number[][];
    };
    "container-title"?: string[];
    volume?: string;
    issue?: string;
    page?: string;
    DOI?: string;
    URL?: string;
    publisher?: string;
    type?: string;
  };
}

function extractDOI(input: string): string | null {
  // Match DOI patterns like 10.1234/example or full URLs
  const doiRegex = /(?:https?:\/\/(?:dx\.)?doi\.org\/)?(?:doi:)?(10\.\d{4,}(?:\.\d+)*\/[^\s]+)/i;
  const match = input.trim().match(doiRegex);
  return match ? match[1] : null;
}

function getYear(message: CrossRefResponse["message"]): number | undefined {
  const dateSource = message.published
    || message["published-print"]
    || message["published-online"];

  if (dateSource?.["date-parts"]?.[0]?.[0]) {
    return dateSource["date-parts"][0][0];
  }
  return undefined;
}

export async function fetchFromCrossRef(input: string): Promise<CitationMetadata | null> {
  const doi = extractDOI(input);

  if (!doi) {
    return null;
  }

  try {
    const response = await fetch(`${CROSSREF_API}/${encodeURIComponent(doi)}`, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "EdgeUpCollege/1.0 (mailto:contact@edgeupcollege.com)",
      },
    });

    if (!response.ok) {
      console.error(`CrossRef API error: ${response.status}`);
      return null;
    }

    const data: CrossRefResponse = await response.json();
    const { message } = data;

    const authors: Author[] = (message.author || []).map((a) => ({
      given: a.given,
      family: a.family,
      name: a.name,
    }));

    return {
      title: message.title?.[0] || "Untitled",
      authors,
      year: getYear(message),
      journal: message["container-title"]?.[0],
      volume: message.volume,
      issue: message.issue,
      pages: message.page,
      doi: message.DOI,
      url: message.URL || (message.DOI ? `https://doi.org/${message.DOI}` : undefined),
      publisher: message.publisher,
      type: message.type,
    };
  } catch (error) {
    console.error("CrossRef fetch error:", error);
    return null;
  }
}

export { extractDOI };
