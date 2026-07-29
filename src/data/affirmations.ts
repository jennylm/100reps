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
    beforePractice: 'One small start is enough.',
    afterPractice: 'You showed up today. Let that count.',
  },
  {
    beforePractice: 'You do not need perfect conditions. Begin where you are.',
    afterPractice: 'Progress can be quiet and still be real.',
  },
  {
    beforePractice: 'Small repetitions become remarkable things.',
    afterPractice: "Today's rep is part of something larger.",
  },
  {
    beforePractice: 'Make something today that yesterday did not have.',
    afterPractice: 'You made something today that yesterday did not have.',
  },
  {
    beforePractice: 'A little attention, given often, changes everything.',
    afterPractice: 'The attention you gave today matters.',
  },
  {
    beforePractice: 'There is no perfect rep. There is only the next one.',
    afterPractice: 'Done is a kind of beautiful.',
  },
  {
    beforePractice: 'Let curiosity lead; progress can follow.',
    afterPractice: 'You followed your curiosity today.',
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
