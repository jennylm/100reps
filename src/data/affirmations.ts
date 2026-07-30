type DailyAffirmation = {
  beforePractice: string;
  afterPractice: string;
};

/**
 * Edit or add affirmations here. Each pair is shown for one local calendar day:
 * `beforePractice` until the first rep, then `afterPractice` for the rest of the day.
 */
export const DAILY_AFFIRMATIONS: DailyAffirmation[] = [
  {
    beforePractice: "Ready when you are.",
    afterPractice: "Another page in your journey.",
  },
  {
    beforePractice: "What will today's rep look like?",
    afterPractice: "One more moment captured.",
  },
  {
    beforePractice: "No pressure. Just begin.",
    afterPractice: "One more rep added to your journey.",
  },
  {
    beforePractice: "Let's see where today's practice leads.",
    afterPractice: "That's one you'll be able to look back on.",
  },
  {
    beforePractice: "Every journey is built one rep at a time.",
    afterPractice: "Your journey keeps growing.",
  },
  {
    beforePractice: "Today's rep doesn't have to be perfect.",
    afterPractice: "However it went, you showed up.",
  },
  {
    beforePractice: "A little practice is enough.",
    afterPractice: "See you next time.",
  },
  {
    beforePractice: "The next rep is the only one that matters.",
    afterPractice: "Another step taken.",
  },
  {
    beforePractice: "Begin where you are.",
    afterPractice: "Today's effort is part of the bigger picture.",
  },
  {
    beforePractice: "Take your time.",
    afterPractice: "Your story is one rep longer.",
  }
];

export function affirmationForDate(
  date: Date,
  hasPractisedToday: boolean,
): string {
  const localDateNumber = Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) /
      (24 * 60 * 60 * 1000),
  );
  const affirmation =
    DAILY_AFFIRMATIONS[localDateNumber % DAILY_AFFIRMATIONS.length];

  return hasPractisedToday
    ? affirmation.afterPractice
    : affirmation.beforePractice;
}
