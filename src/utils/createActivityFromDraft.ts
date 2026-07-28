import { ACTIVITY_AREAS } from '../data/areas';
import {
  getAreaPhoto,
  getSubcategoryPhoto,
  getSubcategorySearchQuery,
} from '../data/photos';
import type { CreateActivityInput } from '../lib/db';
import { colors } from '../theme/colors';
import type { AddActivityDraft } from '../types';
import { searchUnsplashPhoto } from './unsplash';

const AREA_COLORS = [
  colors.brand.teal,
  colors.brand.amber,
  colors.brand.pink,
  colors.brand.mint,
] as const;

/**
 * Known subcategory → Unsplash search with a tuned query (curated URL fallback).
 * Other → search by activity title + area, else area photo.
 */
export async function resolveActivityPhoto(
  areaId: string,
  subcategory: string | null,
  activityName: string,
): Promise<string> {
  const area = ACTIVITY_AREAS.find((item) => item.id === areaId);
  const areaPhoto = getAreaPhoto(areaId);
  const areaLabel = area?.label;

  if (subcategory && subcategory !== 'Other') {
    const query = getSubcategorySearchQuery(subcategory) ?? subcategory;
    const fromSearch = await searchUnsplashPhoto(query, { context: areaLabel });
    return fromSearch ?? getSubcategoryPhoto(subcategory) ?? areaPhoto;
  }

  const fromSearch = await searchUnsplashPhoto(activityName, { context: areaLabel });
  return fromSearch ?? areaPhoto;
}

/** Resolve Unsplash + wizard fields into a create payload (no fake seed rep). */
export async function buildCreateActivityInput(
  draft: AddActivityDraft,
): Promise<CreateActivityInput> {
  const name = draft.name.trim() || draft.subcategory?.trim() || 'New activity';
  const areaId = draft.areaId ?? ACTIVITY_AREAS[0]?.id ?? 'fitness';
  const area = ACTIVITY_AREAS.find((item) => item.id === areaId);
  const areaIndex = ACTIVITY_AREAS.findIndex((item) => item.id === areaId);
  const color = AREA_COLORS[areaIndex >= 0 ? areaIndex % AREA_COLORS.length : 0];

  const photo = await resolveActivityPhoto(areaId, draft.subcategory, name);

  return {
    name,
    icon: area?.emoji ?? name.charAt(0).toUpperCase(),
    color,
    photoUrl: photo,
    areaId,
    subcategory: draft.subcategory,
    repType: draft.repType,
    sessionLengthId: draft.sessionLengthId,
    goalDefinition: draft.goalDefinition,
    visibility: draft.visibility,
    goal: 100,
  };
}
