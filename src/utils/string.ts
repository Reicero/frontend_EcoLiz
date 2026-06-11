/**
 * String utility functions
 */

/**
 * Remove trailing slashes and trim whitespace
 */
export function normalizeUrl(value: string): string {
  return value.trim().replace(/\/+$/, '');
}

/**
 * Remove HTML tags from a string
 */
export function stripHtmlTags(value: string): string {
  return value?.replace(/<[^>]*>/g, '').trim() ?? '';
}

/**
 * Decode common HTML entities
 */
function decodeHtmlEntities(value: unknown) {
  let result = String(value ?? "");

  const namedEntities: Record<string, string> = {
    amp: "&",
    quot: '"',
    apos: "'",
    "#039": "'",
    nbsp: " ",
    rsquo: "’",
    lsquo: "‘",
    rdquo: "”",
    ldquo: "“",
    ndash: "–",
    mdash: "—",
    hellip: "…",
    laquo: "«",
    raquo: "»",
    times: "×",
    prime: "′",
    Prime: "″",
    eacute: "é",
    egrave: "è",
    ecirc: "ê",
    agrave: "à",
    ugrave: "ù",
    ccedil: "ç",
  };

  // Plusieurs passages pour gérer les entités doublement encodées :
  // &amp;Prime; devient d'abord &Prime;, puis ″
  for (let pass = 0; pass < 4; pass += 1) {
    const previousResult = result;

    result = result
      .replace(/&#x([0-9a-f]+);/gi, (_, hexadecimal: string) =>
        String.fromCodePoint(Number.parseInt(hexadecimal, 16))
      )
      .replace(/&#(\d+);/g, (_, decimal: string) =>
        String.fromCodePoint(Number.parseInt(decimal, 10))
      )
      .replace(/&([a-zA-Z0-9#]+);/g, (match, entity: string) => {
        return namedEntities[entity] ?? match;
      });

    if (result === previousResult) {
      break;
    }
  }

  return result;
}
