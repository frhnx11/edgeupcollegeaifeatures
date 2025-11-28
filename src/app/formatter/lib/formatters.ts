import { CitationMetadata, Author, FormattedCitation, CitationStyle } from "./types";

// Helper to get author's full name
function getAuthorName(author: Author): string {
  if (author.name) return author.name;
  if (author.family && author.given) return `${author.family}, ${author.given}`;
  if (author.family) return author.family;
  if (author.given) return author.given;
  return "Unknown";
}

// Helper to get last name only
function getLastName(author: Author): string {
  if (author.family) return author.family;
  if (author.name) {
    const parts = author.name.split(" ");
    return parts[parts.length - 1];
  }
  return "Unknown";
}

// Helper to get initials
function getInitials(author: Author): string {
  if (author.given) {
    return author.given
      .split(" ")
      .map((n) => n[0] + ".")
      .join(" ");
  }
  return "";
}

// ============================================
// APA 7th Edition
// ============================================
function formatAPA(metadata: CitationMetadata): FormattedCitation {
  const { authors, year, title, journal, volume, issue, pages, doi } = metadata;

  // In-text citation
  let inText: string;
  if (authors.length === 0) {
    inText = `("${title?.slice(0, 30)}${title && title.length > 30 ? "..." : ""}", ${year || "n.d."})`;
  } else if (authors.length === 1) {
    inText = `(${getLastName(authors[0])}, ${year || "n.d."})`;
  } else if (authors.length === 2) {
    inText = `(${getLastName(authors[0])} & ${getLastName(authors[1])}, ${year || "n.d."})`;
  } else {
    inText = `(${getLastName(authors[0])} et al., ${year || "n.d."})`;
  }

  // Full reference
  let authorStr: string;
  if (authors.length === 0) {
    authorStr = "";
  } else if (authors.length === 1) {
    authorStr = `${getLastName(authors[0])}, ${getInitials(authors[0])}`;
  } else if (authors.length === 2) {
    authorStr = `${getLastName(authors[0])}, ${getInitials(authors[0])}, & ${getLastName(authors[1])}, ${getInitials(authors[1])}`;
  } else if (authors.length <= 20) {
    const allButLast = authors
      .slice(0, -1)
      .map((a) => `${getLastName(a)}, ${getInitials(a)}`)
      .join(", ");
    const last = authors[authors.length - 1];
    authorStr = `${allButLast}, & ${getLastName(last)}, ${getInitials(last)}`;
  } else {
    const first19 = authors
      .slice(0, 19)
      .map((a) => `${getLastName(a)}, ${getInitials(a)}`)
      .join(", ");
    const last = authors[authors.length - 1];
    authorStr = `${first19}, ... ${getLastName(last)}, ${getInitials(last)}`;
  }

  let reference = authorStr ? `${authorStr} ` : "";
  reference += `(${year || "n.d."}). `;
  reference += `${title}. `;

  if (journal) {
    reference += `*${journal}*`;
    if (volume) {
      reference += `, *${volume}*`;
      if (issue) reference += `(${issue})`;
    }
    if (pages) reference += `, ${pages}`;
    reference += ". ";
  }

  if (doi) {
    reference += `https://doi.org/${doi}`;
  }

  return { inText, reference: reference.trim() };
}

// ============================================
// MLA 9th Edition
// ============================================
function formatMLA(metadata: CitationMetadata): FormattedCitation {
  const { authors, year, title, journal, volume, issue, pages } = metadata;

  // In-text citation (MLA uses page numbers, but we often don't have them)
  let inText: string;
  if (authors.length === 0) {
    inText = `("${title?.slice(0, 30)}${title && title.length > 30 ? "..." : ""}")`;
  } else if (authors.length === 1) {
    inText = `(${getLastName(authors[0])})`;
  } else if (authors.length === 2) {
    inText = `(${getLastName(authors[0])} and ${getLastName(authors[1])})`;
  } else {
    inText = `(${getLastName(authors[0])} et al.)`;
  }

  // Full reference
  let authorStr: string;
  if (authors.length === 0) {
    authorStr = "";
  } else if (authors.length === 1) {
    authorStr = getAuthorName(authors[0]);
  } else if (authors.length === 2) {
    authorStr = `${getAuthorName(authors[0])}, and ${getAuthorName(authors[1])}`;
  } else {
    authorStr = `${getAuthorName(authors[0])}, et al.`;
  }

  let reference = authorStr ? `${authorStr}. ` : "";
  reference += `"${title}." `;

  if (journal) {
    reference += `*${journal}*`;
    if (volume) {
      reference += `, vol. ${volume}`;
      if (issue) reference += `, no. ${issue}`;
    }
    if (year) reference += `, ${year}`;
    if (pages) reference += `, pp. ${pages}`;
    reference += ".";
  } else if (year) {
    reference += `${year}.`;
  }

  return { inText, reference: reference.trim() };
}

// ============================================
// Chicago 17th Edition (Author-Date style)
// ============================================
function formatChicago(metadata: CitationMetadata): FormattedCitation {
  const { authors, year, title, journal, volume, issue, pages, doi } = metadata;

  // In-text citation
  let inText: string;
  if (authors.length === 0) {
    inText = `("${title?.slice(0, 30)}${title && title.length > 30 ? "..." : ""}" ${year || "n.d."})`;
  } else if (authors.length === 1) {
    inText = `(${getLastName(authors[0])} ${year || "n.d."})`;
  } else if (authors.length === 2) {
    inText = `(${getLastName(authors[0])} and ${getLastName(authors[1])} ${year || "n.d."})`;
  } else {
    inText = `(${getLastName(authors[0])} et al. ${year || "n.d."})`;
  }

  // Full reference
  let authorStr: string;
  if (authors.length === 0) {
    authorStr = "";
  } else if (authors.length === 1) {
    authorStr = getAuthorName(authors[0]);
  } else if (authors.length === 2) {
    authorStr = `${getAuthorName(authors[0])}, and ${getAuthorName(authors[1])}`;
  } else if (authors.length <= 10) {
    const allButLast = authors
      .slice(0, -1)
      .map((a) => getAuthorName(a))
      .join(", ");
    const last = authors[authors.length - 1];
    authorStr = `${allButLast}, and ${getAuthorName(last)}`;
  } else {
    const first7 = authors
      .slice(0, 7)
      .map((a) => getAuthorName(a))
      .join(", ");
    authorStr = `${first7}, et al.`;
  }

  let reference = authorStr ? `${authorStr}. ` : "";
  reference += `${year || "n.d."}. `;
  reference += `"${title}." `;

  if (journal) {
    reference += `*${journal}*`;
    if (volume) {
      reference += ` ${volume}`;
      if (issue) reference += `, no. ${issue}`;
    }
    if (pages) reference += `: ${pages}`;
    reference += ".";
  }

  if (doi) {
    reference += ` https://doi.org/${doi}`;
  }

  return { inText, reference: reference.trim() };
}

// ============================================
// Main export
// ============================================
export function formatCitation(
  metadata: CitationMetadata,
  style: CitationStyle
): FormattedCitation {
  switch (style) {
    case "apa":
      return formatAPA(metadata);
    case "mla":
      return formatMLA(metadata);
    case "chicago":
      return formatChicago(metadata);
    default:
      return formatAPA(metadata);
  }
}
