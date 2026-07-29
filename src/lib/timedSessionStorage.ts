import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TimedSession } from '../utils/timedSession';
import { reconcileTimedSession } from '../utils/timedSession';

const STORAGE_KEY_PREFIX = '@100reps/active_timed_session:';

function storageKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

export async function loadTimedSession(
  userId: string,
  now = new Date(),
): Promise<TimedSession | null> {
  const raw = await AsyncStorage.getItem(storageKey(userId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as TimedSession;
    if (!parsed?.id || !parsed.activity?.id) return null;
    return reconcileTimedSession(parsed, now);
  } catch {
    return null;
  }
}

export async function saveTimedSession(session: TimedSession): Promise<void> {
  await AsyncStorage.setItem(storageKey(session.userId), JSON.stringify(session));
}

export async function clearTimedSession(userId: string): Promise<void> {
  await AsyncStorage.removeItem(storageKey(userId));
}
