import type { Activity } from '../types';

export const INIT_ACTIVITIES: Activity[] = [
  {
    id: 'writing',
    name: 'Writing',
    icon: 'W',
    color: '#FAA151',
    photo:
      'https://images.unsplash.com/photo-1758876020200-1e19cddaf656?w=400&h=400&fit=crop&auto=format',
    reps: 67,
    goal: 100,
    log: [
      {
        id: '1',
        loggedAt: '2026-07-28T09:14:00.000Z',
        note: '1,200 words on chapter 3 — finally cracked the opening.',
        imageUrl:
          'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=220&fit=crop&auto=format',
      },
      {
        id: '2',
        loggedAt: '2026-07-26T22:31:00.000Z',
        note: '600 words. Late session, but it counts.',
      },
      {
        id: '3',
        loggedAt: '2026-07-24T08:00:00.000Z',
        note: 'Morning pages, 500 words. Felt effortless today.',
        imageUrl:
          'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=220&fit=crop&auto=format',
      },
      {
        id: '4',
        loggedAt: '2026-07-21T10:20:00.000Z',
        note: 'First session back after a week off. Rusty but done.',
      },
    ],
  },
  {
    id: 'piano',
    name: 'Piano',
    icon: 'P',
    color: '#009C77',
    photo:
      'https://images.unsplash.com/photo-1552422535-c45813c61732?w=400&h=400&fit=crop&auto=format',
    reps: 23,
    goal: 100,
    log: [
      {
        id: '1',
        loggedAt: '2026-07-27T19:30:00.000Z',
        note: 'Chopin Ballade No.1 — worked the coda section for 90 mins.',
        imageUrl:
          'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=220&fit=crop&auto=format',
      },
      {
        id: '2',
        loggedAt: '2026-07-25T20:15:00.000Z',
        note: 'Scales and Scarlatti sonata K.141.',
      },
      {
        id: '3',
        loggedAt: '2026-07-22T18:45:00.000Z',
        note: "Sight-reading session. A Bach Prelude I'd never played before.",
      },
    ],
  },
  {
    id: 'pottery',
    name: 'Pottery',
    icon: 'Po',
    color: '#FF99A7',
    photo:
      'https://images.unsplash.com/photo-1590605095243-072811dbe64c?w=400&h=400&fit=crop&auto=format',
    reps: 45,
    goal: 100,
    log: [
      {
        id: '1',
        loggedAt: '2026-07-27T14:00:00.000Z',
        note: 'Three bowls thrown — one collapsed, two survived!',
        imageUrl:
          'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=220&fit=crop&auto=format',
      },
      {
        id: '2',
        loggedAt: '2026-07-22T11:00:00.000Z',
        note: "Trimming and glazing session from last week's pots.",
      },
      {
        id: '3',
        loggedAt: '2026-07-18T13:30:00.000Z',
        note: 'Cylinder practice. Getting the walls thinner.',
      },
    ],
  },
  {
    id: 'gym',
    name: 'Gym',
    icon: 'G',
    color: '#82CFC5',
    photo:
      'https://images.unsplash.com/photo-1521805103424-d8f8430e8933?w=400&h=400&fit=crop&auto=format',
    reps: 89,
    goal: 100,
    log: [
      {
        id: '1',
        loggedAt: '2026-07-28T06:45:00.000Z',
        note: 'Deadlifts: 3×5 at 140 kg. Personal best!',
        imageUrl:
          'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=220&fit=crop&auto=format',
      },
      {
        id: '2',
        loggedAt: '2026-07-26T07:00:00.000Z',
        note: 'Pull day — rows, pull-ups, face pulls, rear delts.',
      },
      {
        id: '3',
        loggedAt: '2026-07-24T06:30:00.000Z',
        note: 'Squat day. 5×3 at 120 kg. Legs were shaking at the end.',
      },
      {
        id: '4',
        loggedAt: '2026-07-22T07:15:00.000Z',
        note: 'Push day. Bench press and overhead press.',
      },
    ],
  },
];
