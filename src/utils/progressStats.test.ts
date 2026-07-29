import { describe, expect, it } from 'vitest';
import type { Activity } from '../types';
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
});
