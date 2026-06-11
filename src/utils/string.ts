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
export function decodeHtmlEntities(value: string): string {
  const entities: Record<string, string> = {
    amp: '&',
    quot: '"',
    apos: "'",
    '#039': "'",
    rsquo: "'",
    eacute: 'é',
    egrave: 'è',
    ecirc: 'ê',
    agrave: 'à',
    ugrave: 'ù',
    ccedil: 'ç',
  };

  return value.replace(/&([^;]+);/g, (match, entity) => entities[entity] ?? match);
}
