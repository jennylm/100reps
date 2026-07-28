export type ActivityArea = {
  id: string;
  label: string;
  emoji: string;
  subcategories: string[];
};

const SUBCATS: Record<string, string[]> = {
  Fitness: [
    'Running',
    'Walking',
    'Strength training',
    'Cycling',
    'Swimming',
    'HIIT',
    'Yoga',
    'Stretching',
    'Other',
  ],
  Creative: [
    'Drawing',
    'Painting',
    'Photography',
    'Sculpture',
    'Crafts',
    'Design',
    'Pottery',
    'Other',
  ],
  Writing: [
    'Fiction',
    'Non-fiction',
    'Journaling',
    'Poetry',
    'Blogging',
    'Screenwriting',
    'Other',
  ],
  Music: [
    'Instrument practice',
    'Songwriting',
    'Music theory',
    'Singing',
    'Production',
    'Other',
  ],
  Coding: [
    'Personal project',
    'Learning',
    'Open source',
    'Freelance',
    'Game dev',
    'Other',
  ],
  Learning: [
    'Reading',
    'Studying',
    'Online course',
    'Podcast',
    'Language learning',
    'Documentary',
    'Other',
  ],
  Cooking: [
    'Cook a meal',
    'Try a new recipe',
    'Meal prep',
    'Baking',
    'Fermentation',
    'Other',
  ],
  'Home & Garden': [
    'Gardening',
    'DIY',
    'Organising',
    'Decorating',
    'Maintenance',
    'Other',
  ],
  Wellbeing: [
    'Meditation',
    'Journaling',
    'Breathwork',
    'Cold exposure',
    'Nature walk',
    'Other',
  ],
  Relationships: [
    'Quality time',
    'Date night',
    'Call a friend',
    'Family time',
    'Volunteering',
    'Other',
  ],
  Career: [
    'Networking',
    'Skill building',
    'Side project',
    'Mentoring',
    'Public speaking',
    'Other',
  ],
  Finance: [
    'Budgeting',
    'Investing',
    'Financial reading',
    'Side income',
    'Review',
    'Other',
  ],
  Outdoors: [
    'Hiking',
    'Wild swimming',
    'Cycling',
    'Running',
    'Camping',
    'Climbing',
    'Other',
  ],
  Health: [
    'Sleep hygiene',
    'Nutrition',
    'Hydration',
    'Check-up',
    'Therapy',
    'Other',
  ],
};

function subs(label: string): string[] {
  return SUBCATS[label] ?? ['Other'];
}

export const ACTIVITY_AREAS: ActivityArea[] = [
  { id: 'fitness', label: 'Fitness', emoji: '💪', subcategories: subs('Fitness') },
  { id: 'creative', label: 'Creative', emoji: '🎨', subcategories: subs('Creative') },
  { id: 'writing', label: 'Writing', emoji: '✍️', subcategories: subs('Writing') },
  { id: 'music', label: 'Music', emoji: '🎵', subcategories: subs('Music') },
  { id: 'coding', label: 'Coding', emoji: '💻', subcategories: subs('Coding') },
  { id: 'learning', label: 'Learning', emoji: '📚', subcategories: subs('Learning') },
  { id: 'cooking', label: 'Cooking', emoji: '🍳', subcategories: subs('Cooking') },
  { id: 'home-garden', label: 'Home & Garden', emoji: '🌱', subcategories: subs('Home & Garden') },
  { id: 'wellbeing', label: 'Wellbeing', emoji: '🧘', subcategories: subs('Wellbeing') },
  { id: 'relationships', label: 'Relationships', emoji: '🤝', subcategories: subs('Relationships') },
  { id: 'career', label: 'Career', emoji: '💼', subcategories: subs('Career') },
  { id: 'finance', label: 'Finance', emoji: '💰', subcategories: subs('Finance') },
  { id: 'outdoors', label: 'Outdoors', emoji: '🌍', subcategories: subs('Outdoors') },
  { id: 'health', label: 'Health', emoji: '❤️', subcategories: subs('Health') },
];

export const SESSION_LENGTHS = [
  { id: '10', label: '10 minutes' },
  { id: '15', label: '15 minutes' },
  { id: '20', label: '20 minutes' },
  { id: '30', label: '30 minutes' },
  { id: '45', label: '45 minutes' },
  { id: '60', label: '1 hour' },
  { id: '90', label: '90 minutes' },
  { id: '120', label: '2 hours' },
  { id: 'other', label: 'Other' },
] as const;

export type SessionLengthId = (typeof SESSION_LENGTHS)[number]['id'];

const PRESET_SESSION_LENGTH_IDS: ReadonlySet<string> = new Set(
  SESSION_LENGTHS.filter((item) => item.id !== 'other').map((item) => item.id),
);

/** True when the stored id is one of the fixed chips (not Other / custom). */
export function isPresetSessionLength(id: string | null | undefined): boolean {
  return Boolean(id && PRESET_SESSION_LENGTH_IDS.has(id));
}

export function sessionLengthChipSelection(id: string | null | undefined): {
  selectedId: string;
  customValue: string;
} {
  if (!id) {
    return { selectedId: '45', customValue: '' };
  }
  if (isPresetSessionLength(id)) {
    return { selectedId: id, customValue: '' };
  }
  // Stored custom duration (or legacy "other") → Other chip + free text
  return {
    selectedId: 'other',
    customValue: id === 'other' ? '' : id,
  };
}

export function sessionLengthLabel(id: string | null | undefined): string {
  if (!id) return '';
  const preset = SESSION_LENGTHS.find((item) => item.id === id);
  if (preset && preset.id !== 'other') return preset.label;
  return id === 'other' ? 'Other' : id;
}
