import type {
  ActivityVisibility,
  Category,
  Rep,
  RepDefinitionType,
} from '../types';
import { supabase } from './supabase';

const EVIDENCE_BUCKET = 'rep-evidence';
const SIGNED_URL_TTL_SEC = 60 * 60 * 24; // 24h

export type ActivityRow = {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  color: string;
  photo_url: string;
  area_id: string | null;
  subcategory: string | null;
  rep_type: RepDefinitionType | null;
  session_length_id: string | null;
  goal_definition: string | null;
  visibility: ActivityVisibility;
  goal: number;
  created_at: string;
  updated_at: string;
  reps?: RepRow[];
};

export type RepRow = {
  id: string;
  activity_id: string;
  user_id: string;
  note: string;
  image_path: string | null;
  logged_at: string;
  created_at: string;
};

export type CreateActivityInput = {
  name: string;
  icon: string;
  color: string;
  photoUrl: string;
  areaId: string | null;
  subcategory: string | null;
  repType: RepDefinitionType;
  sessionLengthId: string | null;
  goalDefinition: string;
  visibility: ActivityVisibility;
  goal?: number;
};

function formatLoggedAt(iso: string): Pick<Rep, 'date' | 'time'> {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  };
}

async function signedUrlForPath(path: string | null | undefined): Promise<string | undefined> {
  if (!path) return undefined;
  const { data, error } = await supabase.storage
    .from(EVIDENCE_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SEC);
  if (error || !data?.signedUrl) return undefined;
  return data.signedUrl;
}

async function mapRep(row: RepRow): Promise<Rep> {
  const stamp = formatLoggedAt(row.logged_at);
  const imageUrl = await signedUrlForPath(row.image_path);
  return {
    id: row.id,
    date: stamp.date,
    time: stamp.time,
    note: row.note ?? '',
    imageUrl,
    imagePath: row.image_path ?? undefined,
  };
}

async function mapActivity(row: ActivityRow): Promise<Category> {
  const repRows = [...(row.reps ?? [])].sort(
    (a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime(),
  );
  const log = await Promise.all(repRows.map(mapRep));
  return {
    id: row.id,
    name: row.name,
    icon: row.icon ?? row.name.charAt(0).toUpperCase(),
    color: row.color,
    photo: row.photo_url,
    reps: log.length,
    goal: row.goal,
    log,
    areaId: row.area_id ?? undefined,
    subcategory: row.subcategory ?? undefined,
    repType: row.rep_type ?? undefined,
    sessionLengthId: row.session_length_id ?? undefined,
    goalDefinition: row.goal_definition ?? undefined,
    visibility: row.visibility,
  };
}

export async function listActivities(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('*, reps(*)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  const rows = (data ?? []) as ActivityRow[];
  return Promise.all(rows.map(mapActivity));
}

export async function createActivity(
  userId: string,
  input: CreateActivityInput,
): Promise<Category> {
  const { data, error } = await supabase
    .from('activities')
    .insert({
      user_id: userId,
      name: input.name,
      icon: input.icon,
      color: input.color,
      photo_url: input.photoUrl,
      area_id: input.areaId,
      subcategory: input.subcategory,
      rep_type: input.repType,
      session_length_id: input.sessionLengthId,
      goal_definition: input.goalDefinition,
      visibility: input.visibility,
      goal: input.goal ?? 100,
    })
    .select('*, reps(*)')
    .single();

  if (error) throw error;
  return mapActivity(data as ActivityRow);
}

export type UpdateActivityInput = {
  name: string;
  repType: RepDefinitionType;
  sessionLengthId: string | null;
  goalDefinition: string;
};

export async function updateActivity(
  id: string,
  input: UpdateActivityInput,
): Promise<void> {
  const { error } = await supabase
    .from('activities')
    .update({
      name: input.name,
      rep_type: input.repType,
      session_length_id: input.sessionLengthId,
      goal_definition: input.goalDefinition,
    })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteActivity(id: string): Promise<void> {
  const { error } = await supabase.from('activities').delete().eq('id', id);
  if (error) throw error;
}

export async function uploadRepEvidence(
  userId: string,
  activityId: string,
  localUri: string,
): Promise<string> {
  const extMatch = localUri.match(/\.(\w+)(?:\?|$)/);
  const ext = (extMatch?.[1] ?? 'jpg').toLowerCase();
  const contentType =
    ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  const path = `${userId}/${activityId}/${Date.now()}.${ext}`;

  const response = await fetch(localUri);
  const arrayBuffer = await response.arrayBuffer();

  const { error } = await supabase.storage.from(EVIDENCE_BUCKET).upload(path, arrayBuffer, {
    contentType,
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export async function insertRep(input: {
  userId: string;
  activityId: string;
  note: string;
  imagePath?: string | null;
}): Promise<Rep> {
  const { data, error } = await supabase
    .from('reps')
    .insert({
      user_id: input.userId,
      activity_id: input.activityId,
      note: input.note,
      image_path: input.imagePath ?? null,
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapRep(data as RepRow);
}

export async function updateRepNote(repId: string, note: string): Promise<void> {
  const { error } = await supabase.from('reps').update({ note }).eq('id', repId);
  if (error) throw error;
}

export async function deleteRep(repId: string): Promise<void> {
  const { data: row } = await supabase
    .from('reps')
    .select('image_path')
    .eq('id', repId)
    .maybeSingle();

  const { error } = await supabase.from('reps').delete().eq('id', repId);
  if (error) throw error;

  const path = (row as { image_path?: string | null } | null)?.image_path;
  if (path) {
    await supabase.storage.from(EVIDENCE_BUCKET).remove([path]);
  }
}
