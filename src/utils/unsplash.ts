/**
 * Unsplash Search API — requires EXPO_PUBLIC_UNSPLASH_ACCESS_KEY
 * Get a free key at https://unsplash.com/developers
 */

type UnsplashPhoto = {
  likes?: number;
  urls?: { small?: string; regular?: string };
  width?: number;
  height?: number;
};

type UnsplashSearchResponse = {
  results?: UnsplashPhoto[];
};

function getAccessKey(): string | undefined {
  const key = process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY;
  return key?.trim() || undefined;
}

function toCardUrl(raw: string): string {
  const base = raw.split('?')[0];
  // entropy crop usually keeps the interesting subject in-frame for square cards
  return `${base}?w=800&h=800&fit=crop&crop=entropy&auto=format&q=80`;
}

/** Strip filler words that make Unsplash return junk stock. */
export function cleanSearchQuery(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(
      /\b(my|the|a|an|and|or|for|with|to|of|in|on|at|daily|morning|evening|weekly|mins?|minutes?|hours?|session|practice)\b/g,
      ' ',
    )
    .replace(/\s+/g, ' ')
    .trim();
}

type SearchOptions = {
  /** Extra context, e.g. area name "Music" */
  context?: string;
};

/**
 * Search Unsplash and pick the strongest result among the top hits
 * (by likes), not just results[0].
 */
export async function searchUnsplashPhoto(
  query: string,
  options: SearchOptions = {},
): Promise<string | null> {
  const parts = [cleanSearchQuery(query), cleanSearchQuery(options.context ?? '')]
    .filter(Boolean);
  const trimmed = parts.join(' ').trim();
  if (!trimmed) return null;

  const accessKey = getAccessKey();
  if (!accessKey) {
    console.warn(
      '[Unsplash] Missing EXPO_PUBLIC_UNSPLASH_ACCESS_KEY — skipping photo search.',
    );
    return null;
  }

  const url =
    `https://api.unsplash.com/search/photos` +
    `?query=${encodeURIComponent(trimmed)}` +
    `&per_page=12&orientation=landscape&content_filter=high`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        'Accept-Version': 'v1',
      },
    });

    if (!response.ok) {
      console.warn('[Unsplash] Search failed', response.status);
      return null;
    }

    const data = (await response.json()) as UnsplashSearchResponse;
    const results = data.results ?? [];
    if (results.length === 0) return null;

    // Prefer well-liked photos — first result is often a weak / odd match
    const best = [...results].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0))[0];
    const raw = best?.urls?.regular ?? best?.urls?.small;
    if (!raw) return null;

    return toCardUrl(raw);
  } catch (error) {
    console.warn('[Unsplash] Search error', error);
    return null;
  }
}
