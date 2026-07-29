import type { Activity, Rep } from '../types';
import { parseSessionMinutes } from './sessionDuration';

const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_TIME_PERSONALITY_REPS = 8;

export type TimeBand = 'morning' | 'afternoon' | 'evening' | 'night';

export type TimeBandCounts = Record<TimeBand, number>;

export type ProgressRep = Rep & {
  activityId: string;
  activityName: string;
  activityColor: string;
  activityPhoto: string;
};

export type ProgressDay = {
  dateKey: string;
  label: string;
  count: number;
  isToday: boolean;
};

export type ProgressStatCard = {
  label: string;
  value: string;
  supportingText: string;
  color: string;
};

export type ProgressStats = {
  totalReps: number;
  todayReps: number;
  streak: number;
  bestDay: string | null;
  timePersonality: string | null;
  dominantTimeBand: TimeBand | null;
  timeBandCounts: TimeBandCounts;
  daysOnJourney: number | null;
  favouriteActivity: Activity | null;
  thisWeekReps: number;
  lastWeekReps: number;
  momentumDiff: number;
  estimatedMinutes: number;
  days: ProgressDay[];
  recentReps: ProgressRep[];
  narrative: string;
  cards: ProgressStatCard[];
  fingerprint: string;
};

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function timeBandForHour(hour: number): TimeBand {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

function timePersonalityForBand(band: TimeBand): string {
  switch (band) {
    case 'morning':
      return 'an early bird';
    case 'afternoon':
      return 'an afternoon person';
    case 'evening':
      return 'an evening person';
    case 'night':
      return 'a night owl';
  }
}

function dominantTimeBandFor(
  counts: TimeBandCounts,
  totalReps: number,
): TimeBand | null {
  if (totalReps < MIN_TIME_PERSONALITY_REPS) return null;

  const ranked = (Object.entries(counts) as [TimeBand, number][]).sort(
    (left, right) => right[1] - left[1],
  );
  const [top, runnerUp] = ranked;
  if (!top || top[1] === runnerUp?.[1] || top[1] / totalReps < 0.4) return null;
  return top[0];
}

function timeBandSupportingText(
  band: TimeBand,
  count: number,
  totalReps: number,
): string {
  const phrase =
    band === 'night'
      ? 'at night'
      : `in the ${band}`;
  return `${count} of ${totalReps} reps happen ${phrase}`;
}

function buildNarrative(input: Omit<ProgressStats, 'narrative' | 'cards' | 'fingerprint'>): string {
  if (input.totalReps === 0) {
    return 'Your story is waiting to be written. Every journey starts with a single rep.';
  }
  if (input.totalReps === 1) {
    return 'One rep in — the hardest one is always the first. Something is already different about you.';
  }

  const parts: string[] = [];
  if (input.streak >= 7) {
    parts.push(`You've shown up every single day for ${input.streak} days.`);
  } else if (input.streak >= 3) {
    parts.push(`${input.streak} days in a row — that's not luck, that's a habit forming.`);
  } else if (input.streak === 1) {
    parts.push("You showed up today. That's what counts.");
  }

  const favourite = input.favouriteActivity;
  if (favourite && favourite.reps > 0) {
    if (favourite.reps >= 50) {
      parts.push(
        `${favourite.name} is clearly your passion — ${favourite.reps} reps speaks for itself.`,
      );
    } else if (favourite.reps >= 10) {
      parts.push(`${favourite.name} is where you shine.`);
    } else {
      parts.push(`${favourite.name} is where it all started.`);
    }
  }

  if (input.bestDay && parts.length < 2) {
    parts.push(`Your ${input.bestDay}s are something special.`);
  }
  if (input.timePersonality && parts.length < 2) {
    parts.push(`You're ${input.timePersonality} — own it.`);
  }
  if (input.daysOnJourney && input.daysOnJourney > 7 && parts.length < 3) {
    parts.push(`${input.daysOnJourney} days in, and you're still here.`);
  }
  if (input.momentumDiff > 2 && parts.length < 3) {
    parts.push("This week you've been on fire.");
  } else if (input.momentumDiff < -2 && parts.length < 3) {
    parts.push('A quieter week — everyone needs one.');
  }

  return parts.length > 0
    ? parts.slice(0, 3).join(' ')
    : `${input.totalReps} reps. Each one a small act of becoming who you want to be.`;
}

export function calculateProgressStats(
  activities: Activity[],
  now = new Date(),
): ProgressStats {
  const today = startOfLocalDay(now);
  const allReps: ProgressRep[] = activities
    .flatMap((activity) =>
      activity.log.map((rep) => ({
        ...rep,
        activityId: activity.id,
        activityName: activity.name,
        activityColor: activity.color,
        activityPhoto: activity.photo,
      })),
    )
    .filter((rep) => !Number.isNaN(new Date(rep.loggedAt).getTime()))
    .sort(
      (left, right) =>
        new Date(right.loggedAt).getTime() - new Date(left.loggedAt).getTime(),
    );

  const countsByDate = new Map<string, number>();
  const countsByWeekday = new Map<string, number>();
  const timeBandCounts: TimeBandCounts = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0,
  };

  for (const rep of allReps) {
    const loggedAt = new Date(rep.loggedAt);
    const key = dateKey(loggedAt);
    countsByDate.set(key, (countsByDate.get(key) ?? 0) + 1);
    const weekday = loggedAt.toLocaleDateString('en-GB', { weekday: 'long' });
    countsByWeekday.set(weekday, (countsByWeekday.get(weekday) ?? 0) + 1);
    const band = timeBandForHour(loggedAt.getHours());
    timeBandCounts[band] += 1;
  }

  const days = Array.from({ length: 7 }, (_, index): ProgressDay => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - index));
    const key = dateKey(date);
    return {
      dateKey: key,
      label: date.toLocaleDateString('en-GB', { weekday: 'short' }),
      count: countsByDate.get(key) ?? 0,
      isToday: index === 6,
    };
  });

  let streak = 0;
  for (let offset = 0; ; offset += 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - offset);
    if ((countsByDate.get(dateKey(date)) ?? 0) === 0) break;
    streak += 1;
  }

  const bestDay =
    [...countsByWeekday.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ??
    null;
  const dominantTimeBand = dominantTimeBandFor(timeBandCounts, allReps.length);
  const timePersonality = dominantTimeBand
    ? timePersonalityForBand(dominantTimeBand)
    : null;

  const firstRep = allReps.at(-1);
  const daysOnJourney = firstRep
    ? Math.max(
        0,
        Math.floor(
          (today.getTime() - startOfLocalDay(new Date(firstRep.loggedAt)).getTime()) / DAY_MS,
        ),
      )
    : null;

  const favouriteActivity =
    [...activities]
      .filter((activity) => activity.reps > 0)
      .sort((left, right) => right.reps - left.reps)[0] ?? null;

  const thisWeekKeys = new Set<string>();
  const lastWeekKeys = new Set<string>();
  for (let offset = 0; offset < 7; offset += 1) {
    const current = new Date(today);
    current.setDate(current.getDate() - offset);
    thisWeekKeys.add(dateKey(current));
    const previous = new Date(today);
    previous.setDate(previous.getDate() - 7 - offset);
    lastWeekKeys.add(dateKey(previous));
  }

  let thisWeekReps = 0;
  let lastWeekReps = 0;
  for (const [key, count] of countsByDate) {
    if (thisWeekKeys.has(key)) thisWeekReps += count;
    if (lastWeekKeys.has(key)) lastWeekReps += count;
  }

  const estimatedMinutes = activities.reduce((total, activity) => {
    if (activity.repType !== 'time') return total;
    return total + activity.reps * parseSessionMinutes(activity.sessionLengthId);
  }, 0);

  const base = {
    totalReps: allReps.length,
    todayReps: countsByDate.get(dateKey(today)) ?? 0,
    streak,
    bestDay,
    timePersonality,
    dominantTimeBand,
    timeBandCounts,
    daysOnJourney,
    favouriteActivity,
    thisWeekReps,
    lastWeekReps,
    momentumDiff: thisWeekReps - lastWeekReps,
    estimatedMinutes,
    days,
    recentReps: allReps.slice(0, 10),
  };
  const narrative = buildNarrative(base);

  const cards: ProgressStatCard[] = [
    streak > 1
      ? {
          label: 'Current streak',
          value: `${streak} day${streak === 1 ? '' : 's'}`,
          supportingText:
            streak >= 7 ? 'On fire!' : streak >= 3 ? 'Keep it going' : 'Building momentum',
          color: '#FAA151',
        }
      : null,
    bestDay
      ? {
          label: 'Favourite day',
          value: bestDay,
          supportingText: 'Your most active day of the week',
          color: '#82CFC5',
        }
      : null,
    timePersonality && dominantTimeBand
      ? {
          label: 'You are',
          value: timePersonality,
          supportingText: timeBandSupportingText(
            dominantTimeBand,
            timeBandCounts[dominantTimeBand],
            allReps.length,
          ),
          color: '#FF99A7',
        }
      : null,
    daysOnJourney !== null && daysOnJourney > 0
      ? {
          label: 'Days on this journey',
          value: `${daysOnJourney} day${daysOnJourney === 1 ? '' : 's'}`,
          supportingText: 'Since your very first rep',
          color: '#009C77',
        }
      : null,
    favouriteActivity
      ? {
          label: 'Most practised activity',
          value: favouriteActivity.name,
          supportingText: `${favouriteActivity.reps} rep${favouriteActivity.reps === 1 ? '' : 's'} and counting`,
          color: favouriteActivity.color,
        }
      : null,
    allReps.length > 0
      ? {
          label: 'This week vs last',
          value:
            base.momentumDiff === 0
              ? 'Same pace'
              : base.momentumDiff > 0
                ? `+${base.momentumDiff} reps`
                : `${base.momentumDiff} reps`,
          supportingText:
            base.momentumDiff > 0
              ? "You're picking up speed"
              : base.momentumDiff < 0
                ? "A quieter week — that's okay"
                : 'Steady as ever',
          color: base.momentumDiff >= 0 ? '#009C77' : '#FAA151',
        }
      : null,
    estimatedMinutes > 0
      ? {
          label: 'Time invested',
          value:
            estimatedMinutes >= 60
              ? `~${Math.floor(estimatedMinutes / 60)}h${estimatedMinutes % 60 ? ` ${estimatedMinutes % 60}m` : ''}`
              : `~${estimatedMinutes}m`,
          supportingText: 'Based on your time-based activities',
          color: '#FDD0CD',
        }
      : null,
  ].filter((card): card is ProgressStatCard => Boolean(card));

  const fingerprint = JSON.stringify({
    totalReps: base.totalReps,
    streak,
    bestDay,
    timePersonality,
    daysOnJourney,
    favouriteActivity: favouriteActivity
      ? [favouriteActivity.id, favouriteActivity.name, favouriteActivity.reps]
      : null,
    thisWeekReps,
    lastWeekReps,
  });

  return { ...base, narrative, cards, fingerprint };
}
