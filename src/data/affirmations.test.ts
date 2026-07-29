import { describe, expect, it } from 'vitest';
import {
  affirmationForDate,
  DAILY_AFFIRMATIONS,
} from './affirmations';

describe('affirmationForDate', () => {
  it('keeps the same affirmation throughout a local calendar day', () => {
    const morning = new Date(2026, 6, 29, 8);
    const evening = new Date(2026, 6, 29, 20);

    expect(affirmationForDate(morning, false)).toBe(
      affirmationForDate(evening, false),
    );
  });

  it('moves to the next affirmation on the next local day', () => {
    const today = new Date(2026, 6, 29, 20);
    const tomorrow = new Date(2026, 6, 30, 8);

    expect(affirmationForDate(today, false)).not.toBe(
      affirmationForDate(tomorrow, false),
    );
  });

  it('switches to the matching after-practice message after a rep', () => {
    const date = new Date(2026, 6, 29, 12);
    const dayNumber = Math.floor(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) /
        (24 * 60 * 60 * 1000),
    );
    const dailyPair =
      DAILY_AFFIRMATIONS[dayNumber % DAILY_AFFIRMATIONS.length];

    expect(affirmationForDate(date, false)).toBe(dailyPair.beforePractice);
    expect(affirmationForDate(date, true)).toBe(dailyPair.afterPractice);
  });
});
