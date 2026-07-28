import * as FileSystem from 'expo-file-system/legacy';

/**
 * Google Cloud Vision SafeSearch — hard-blocks clear adult / explicit imagery
 * (Instagram-like: adult LIKELY+, racy VERY_LIKELY).
 *
 * Set EXPO_PUBLIC_GOOGLE_VISION_API_KEY in .env
 * Enable "Cloud Vision API" on your Google Cloud project and create an API key.
 *
 * Note: for production, proxy this through a backend so the key isn't in the app binary.
 */

export type Likelihood =
  | 'UNKNOWN'
  | 'VERY_UNLIKELY'
  | 'UNLIKELY'
  | 'POSSIBLE'
  | 'LIKELY'
  | 'VERY_LIKELY';

type SafeSearchAnnotation = {
  adult?: Likelihood;
  spoof?: Likelihood;
  medical?: Likelihood;
  violence?: Likelihood;
  racy?: Likelihood;
};

type AnnotateResponse = {
  responses?: {
    safeSearchAnnotation?: SafeSearchAnnotation;
    error?: { message?: string };
  }[];
};

const LIKELIHOOD_RANK: Record<Likelihood, number> = {
  UNKNOWN: 0,
  VERY_UNLIKELY: 1,
  UNLIKELY: 2,
  POSSIBLE: 3,
  LIKELY: 4,
  VERY_LIKELY: 5,
};

function atLeast(value: Likelihood | undefined, threshold: Likelihood): boolean {
  if (!value) return false;
  return LIKELIHOOD_RANK[value] >= LIKELIHOOD_RANK[threshold];
}

export type ImageSafetyResult =
  | { ok: true }
  | { ok: false; reason: string };

function getApiKey(): string | undefined {
  return process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY?.trim() || undefined;
}

/**
 * Returns ok:false for clear adult/explicit content.
 * Fails closed if the API key is missing or the request errors —
 * so unsuitable images can't slip through when screening is expected.
 */
export async function screenImageForSafety(imageUri: string): Promise<ImageSafetyResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return {
      ok: false,
      reason:
        'Photo screening isn’t set up yet. Add EXPO_PUBLIC_GOOGLE_VISION_API_KEY to your .env file.',
    };
  }

  let base64: string;
  try {
    base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } catch (error) {
    console.warn('[SafeSearch] Failed to read image', error);
    return { ok: false, reason: 'Couldn’t read that photo. Please try another.' };
  }

  try {
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [
            {
              image: { content: base64 },
              features: [{ type: 'SAFE_SEARCH_DETECTION', maxResults: 1 }],
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const body = await response.text();
      console.warn('[SafeSearch] API error', response.status, body);
      return {
        ok: false,
        reason: 'Couldn’t verify this photo right now. Please try again in a moment.',
      };
    }

    const data = (await response.json()) as AnnotateResponse;
    const first = data.responses?.[0];
    if (first?.error?.message) {
      console.warn('[SafeSearch] Annotate error', first.error.message);
      return {
        ok: false,
        reason: 'Couldn’t verify this photo right now. Please try again in a moment.',
      };
    }

    const verdict = first?.safeSearchAnnotation;
    if (!verdict) {
      return {
        ok: false,
        reason: 'Couldn’t verify this photo right now. Please try again in a moment.',
      };
    }

    // Instagram-like hard block for clear adult / explicit
    if (atLeast(verdict.adult, 'LIKELY') || atLeast(verdict.racy, 'VERY_LIKELY')) {
      return {
        ok: false,
        reason:
          'This photo can’t be used. Please choose an image that meets community standards (no adult or explicit content).',
      };
    }

    return { ok: true };
  } catch (error) {
    console.warn('[SafeSearch] Request failed', error);
    return {
      ok: false,
      reason: 'Couldn’t verify this photo right now. Please try again in a moment.',
    };
  }
}
