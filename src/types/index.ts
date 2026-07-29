export type Screen = 'home' | 'detail' | 'progress' | 'community' | 'add' | 'timer';

export interface Rep {
  id: string;
  /** ISO timestamptz from the database (canonical). Format in the UI. */
  loggedAt: string;
  note: string;
  /** Signed or local URL for display */
  imageUrl?: string;
  /** Storage path when synced to Supabase */
  imagePath?: string;
  /** Active practice duration in seconds when logged from a timed session */
  durationSeconds?: number;
}

export interface Activity {
  id: string;
  name: string;
  icon: string;
  color: string;
  photo: string;
  reps: number;
  goal: number;
  log: Rep[];
  areaId?: string;
  subcategory?: string;
  repType?: RepDefinitionType;
  sessionLengthId?: string;
  goalDefinition?: string;
  visibility?: ActivityVisibility;
}

export type RepDefinitionType = 'time' | 'goal';
export type ActivityVisibility = 'public' | 'private';

export type AddActivityDraft = {
  areaId: string | null;
  subcategory: string | null;
  name: string;
  repType: RepDefinitionType;
  sessionLengthId: string | null;
  goalDefinition: string;
  visibility: ActivityVisibility;
};

export const INITIAL_ADD_ACTIVITY_DRAFT: AddActivityDraft = {
  areaId: null,
  subcategory: null,
  name: '',
  repType: 'time',
  sessionLengthId: '45',
  goalDefinition: '1 piece',
  visibility: 'private',
};
