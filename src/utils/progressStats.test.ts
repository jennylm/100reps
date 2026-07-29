import { describe, expect, it } from 'vitest';
import type { Activity, Rep } from '../types';
import { calculateProgressStats } from './progressStats';

function activity(
  overrides: Partial<Activity> & Pick<Activity, 'id' | 'name' | 'log'>,
): Activity {
  return {
    icon: 'A',
    color: '#009C77',
    photo: 'https://example.com/photo.jpg',
    reps: overrides.log.length,
    goal: 100,
    ...overrides,
  };
}

function rep(
  id: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute = 0,
): Rep {
  return {
    id,
    loggedAt: new Date(year, month, day, hour, minute).toISOString(),
    note: '',
  };
}

describe('calculateProgressStats', () => {
  it('returns the empty-state narrative and seven chart days', () => {
    const stats = calculateProgressStats([], new Date(2026, 6, 29, 12));

    expect(stats.totalReps).toBe(0);
    expect(stats.days).toHaveLength(7);
    expect(stats.cards).toHaveLength(0);
    expect(stats.narrative).toContain('waiting to be written');
  });

  it('calculates streak, momentum, favourite activity, and real time invested', () => {
    const activities: Activity[] = [
      activity({
        id: 'writing',
        name: 'Writing',
        repType: 'time',
        sessionLengthId: '45',
        log: [
          {
            id: 'w1',
            loggedAt: new Date(2026, 6, 29, 8).toISOString(),
            note: 'Morning pages',
          },
          {
            id: 'w2',
            loggedAt: new Date(2026, 6, 28, 19).toISOString(),
            note: 'Evening session',
          },
        ],
      }),
      activity({
        id: 'pottery',
        name: 'Pottery',
        repType: 'goal',
        log: [
          {
            id: 'p1',
            loggedAt: new Date(2026, 6, 21, 14).toISOString(),
            note: 'One pot',
          },
        ],
      }),
    ];

    const stats = calculateProgressStats(activities, new Date(2026, 6, 29, 12));

    expect(stats.totalReps).toBe(3);
    expect(stats.todayReps).toBe(1);
    expect(stats.streak).toBe(2);
    expect(stats.thisWeekReps).toBe(2);
    expect(stats.lastWeekReps).toBe(1);
    expect(stats.momentumDiff).toBe(1);
    expect(stats.favouriteActivity?.name).toBe('Writing');
    expect(stats.estimatedMinutes).toBe(90);
    expect(stats.recentReps[0]?.id).toBe('w1');
  });

  it('changes the future AI fingerprint when narrative inputs change', () => {
    const first = activity({
      id: 'writing',
      name: 'Writing',
      log: [
        {
          id: 'w1',
          loggedAt: new Date(2026, 6, 29, 8).toISOString(),
          note: '',
        },
      ],
    });

    const before = calculateProgressStats([first], new Date(2026, 6, 29, 12));
    const after = calculateProgressStats(
      [
        {
          ...first,
          reps: 2,
          log: [
            ...first.log,
            {
              id: 'w2',
              loggedAt: new Date(2026, 6, 29, 9).toISOString(),
              note: '',
            },
          ],
        },
      ],
      new Date(2026, 6, 29, 12),
    );

    expect(after.fingerprint).not.toBe(before.fingerprint);
  });

  it('does not infer a time personality before eight reps', () => {
    const stats = calculateProgressStats(
      [
        activity({
          id: 'drawing',
          name: 'Drawing',
          log: [1, 2].map((id) => ({
            id: String(id),
            loggedAt: new Date(2026, 6, 29 - id, 14).toISOString(),
            note: '',
          })),
        }),
      ],
      new Date(2026, 6, 29, 18),
    );

    expect(stats.timePersonality).toBeNull();
    expect(stats.cards.some((card) => card.label === 'You are')).toBe(false);
  });

  it('classifies 2pm practice as afternoon rather than night', () => {
    const stats = calculateProgressStats(
      [
        activity({
          id: 'drawing',
          name: 'Drawing',
          log: Array.from({ length: 8 }, (_, index) => ({
            id: String(index),
            loggedAt: new Date(2026, 6, 29 - index, 14).toISOString(),
            note: '',
          })),
        }),
      ],
      new Date(2026, 6, 29, 18),
    );

    expect(stats.dominantTimeBand).toBe('afternoon');
    expect(stats.timePersonality).toBe('an afternoon person');
    expect(stats.timeBandCounts).toEqual({
      morning: 0,
      afternoon: 8,
      evening: 0,
      night: 0,
    });
    expect(stats.cards.find((card) => card.label === 'You are')?.supportingText).toBe(
      '8 of 8 reps happen in the afternoon',
    );
  });

  it('uses local midnight across a month boundary', () => {
    const stats = calculateProgressStats(
      [
        activity({
          id: 'reading',
          name: 'Reading',
          log: [
            rep('before-midnight', 2026, 6, 31, 23, 59),
            rep('at-midnight', 2026, 7, 1, 0),
          ],
        }),
      ],
      new Date(2026, 7, 1, 12),
    );

    expect(stats.todayReps).toBe(1);
    expect(stats.streak).toBe(2);
    expect(stats.days.at(-2)).toMatchObject({
      dateKey: '2026-07-31',
      count: 1,
      isToday: false,
    });
    expect(stats.days.at(-1)).toMatchObject({
      dateKey: '2026-08-01',
      count: 1,
      isToday: true,
    });
  });

  it('counts multiple reps on one day without inflating the streak', () => {
    const stats = calculateProgressStats(
      [
        activity({
          id: 'music',
          name: 'Music',
          log: [
            rep('today-1', 2026, 6, 29, 9),
            rep('today-2', 2026, 6, 29, 18),
            rep('yesterday-1', 2026, 6, 28, 8),
            rep('yesterday-2', 2026, 6, 28, 12),
            rep('yesterday-3', 2026, 6, 28, 20),
          ],
        }),
      ],
      new Date(2026, 6, 29, 21),
    );

    expect(stats.totalReps).toBe(5);
    expect(stats.todayReps).toBe(2);
    expect(stats.streak).toBe(2);
    expect(stats.days.at(-2)?.count).toBe(3);
    expect(stats.days.at(-1)?.count).toBe(2);
  });

  it('ignores reps with invalid timestamps', () => {
    const stats = calculateProgressStats(
      [
        activity({
          id: 'writing',
          name: 'Writing',
          log: [
            rep('valid', 2026, 6, 29, 9),
            { id: 'invalid', loggedAt: 'not-a-date', note: '' },
          ],
        }),
      ],
      new Date(2026, 6, 29, 12),
    );

    expect(stats.totalReps).toBe(1);
    expect(stats.todayReps).toBe(1);
    expect(stats.recentReps.map(({ id }) => id)).toEqual(['valid']);
    expect(stats.timeBandCounts).toEqual({
      morning: 1,
      afternoon: 0,
      evening: 0,
      night: 0,
    });
  });

  it('classifies the exact boundaries of all four time bands', () => {
    const stats = calculateProgressStats(
      [
        activity({
          id: 'practice',
          name: 'Practice',
          log: [
            rep('night-end', 2026, 6, 29, 4, 59),
            rep('morning-start', 2026, 6, 29, 5),
            rep('morning-end', 2026, 6, 29, 11, 59),
            rep('afternoon-start', 2026, 6, 29, 12),
            rep('afternoon-end', 2026, 6, 29, 16, 59),
            rep('evening-start', 2026, 6, 29, 17),
            rep('evening-end', 2026, 6, 29, 21, 59),
            rep('night-start', 2026, 6, 29, 22),
          ],
        }),
      ],
      new Date(2026, 6, 29, 23),
    );

    expect(stats.timeBandCounts).toEqual({
      morning: 2,
      afternoon: 2,
      evening: 2,
      night: 2,
    });
  });

  it('does not choose a time personality when the leading bands are tied', () => {
    const stats = calculateProgressStats(
      [
        activity({
          id: 'practice',
          name: 'Practice',
          log: [
            ...Array.from({ length: 4 }, (_, index) =>
              rep(`morning-${index}`, 2026, 6, 29 - index, 8),
            ),
            ...Array.from({ length: 4 }, (_, index) =>
              rep(`evening-${index}`, 2026, 6, 29 - index, 19),
            ),
          ],
        }),
      ],
      new Date(2026, 6, 29, 21),
    );

    expect(stats.timeBandCounts.morning).toBe(4);
    expect(stats.timeBandCounts.evening).toBe(4);
    expect(stats.dominantTimeBand).toBeNull();
    expect(stats.timePersonality).toBeNull();
  });
});
