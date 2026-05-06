export function slugify(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function slugToTitle(slug) {
  return String(slug || '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Extract the ISO date (yyyy-MM-dd) from the end of a wedding slug.
 * Returns null if no date is found.
 */
export function extractDateFromSlug(slug) {
  const match = String(slug || '').match(/(\d{4}-\d{2}-\d{2})$/);
  return match ? match[1] : null;
}

/**
 * Remove the trailing date segment from a slug and return a human-readable couple name.
 */
export function slugToCoupleTitle(slug) {
  const withoutDate = String(slug || '').replace(/[-]?\d{4}-\d{2}-\d{2}$/, '');
  return slugToTitle(withoutDate);
}
