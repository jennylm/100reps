import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';
import {
  clearTimedSession,
  loadTimedSession,
  saveTimedSession,
} from '../lib/timedSessionStorage';
import {
  cancelTimerNotification,
  scheduleTimerCompletionNotification,
} from '../lib/timerNotifications';
import type { Activity } from '../types';
import { parseSessionSeconds } from '../utils/sessionDuration';
import {
  createTimedSession,
  finishTimedSession,
  pauseTimedSession,
  reconcileTimedSession,
  resumeTimedSession,
  snapshotTimedSession,
  withNotificationId,
  type TimedSession,
  type TimedSessionSnapshot,
} from '../utils/timedSession';
import { useAuth } from './AuthContext';

type StartResult =
  | { ok: true; session: TimedSession }
  | { ok: false; reason: 'no_user' | 'invalid_duration' | 'already_active'; existing?: TimedSession };

type ActiveTimerContextValue = {
  session: TimedSession | null;
  snapshot: TimedSessionSnapshot | null;
  hydrated: boolean;
  notificationPermissionDenied: boolean;
  startTimer: (activity: Activity) => Promise<StartResult>;
  pauseTimer: () => Promise<void>;
  resumeTimer: () => Promise<void>;
  finishTimer: () => Promise<void>;
  discardTimer: () => Promise<void>;
  clearAfterConfirm: () => Promise<void>;
  tickNow: Date;
};

const ActiveTimerContext = createContext<ActiveTimerContextValue | null>(null);

function createSessionId(): string {
  return `timer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ActiveTimerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return (
    <ActiveTimerProviderInner key={user?.id ?? 'signed-out'} userId={user?.id ?? null}>
      {children}
    </ActiveTimerProviderInner>
  );
}

function ActiveTimerProviderInner({
  children,
  userId,
}: {
  children: ReactNode;
  userId: string | null;
}) {
  const [session, setSession] = useState<TimedSession | null>(null);
  const [hydrated, setHydrated] = useState(!userId);
  const [tickNow, setTickNow] = useState(() => new Date());
  const [notificationPermissionDenied, setNotificationPermissionDenied] =
    useState(false);

  const persist = useCallback(async (next: TimedSession | null, id: string) => {
    if (!next) {
      await clearTimedSession(id);
      return;
    }
    await saveTimedSession(next);
  }, []);

  const applySession = useCallback(
    async (next: TimedSession | null) => {
      if (!userId) return;
      setSession(next);
      await persist(next, userId);
    },
    [persist, userId],
  );

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    loadTimedSession(userId)
      .then(async (loaded) => {
        if (cancelled) return;
        if (!loaded) {
          setSession(null);
          setHydrated(true);
          return;
        }
        const reconciled = reconcileTimedSession(loaded);
        setSession(reconciled);
        if (reconciled.status !== loaded.status || reconciled.completedAt !== loaded.completedAt) {
          await saveTimedSession(reconciled);
          if (loaded.notificationId) {
            await cancelTimerNotification(loaded.notificationId);
          }
        }
        setHydrated(true);
      })
      .catch(() => {
        if (!cancelled) {
          setSession(null);
          setHydrated(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    const refresh = () => {
      const now = new Date();
      setTickNow(now);
      setSession((current) => {
        if (!current || current.status !== 'running') return current;
        const reconciled = reconcileTimedSession(current, now);
        if (reconciled.status === current.status) return current;
        if (userId) {
          void persist(reconciled, userId);
          if (current.notificationId) {
            void cancelTimerNotification(current.notificationId);
          }
        }
        return withNotificationId(reconciled, null);
      });
    };

    refresh();
    const interval = setInterval(refresh, 1000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [persist, userId]);

  const startTimer = useCallback(
    async (activity: Activity): Promise<StartResult> => {
      if (!userId) return { ok: false, reason: 'no_user' };
      if (session) return { ok: false, reason: 'already_active', existing: session };

      const targetSeconds = parseSessionSeconds(activity.sessionLengthId);
      if (targetSeconds <= 0) return { ok: false, reason: 'invalid_duration' };

      const created = createTimedSession({
        id: createSessionId(),
        userId,
        activity: {
          id: activity.id,
          name: activity.name,
          color: activity.color,
          photo: activity.photo,
          goal: activity.goal,
          reps: activity.reps,
        },
        targetSeconds,
      });

      const notificationId = await scheduleTimerCompletionNotification(created);
      setNotificationPermissionDenied(notificationId == null);
      const withNotification = withNotificationId(created, notificationId);
      await applySession(withNotification);
      setTickNow(new Date());
      return { ok: true, session: withNotification };
    },
    [applySession, session, userId],
  );

  const pauseTimer = useCallback(async () => {
    if (!session || session.status !== 'running') return;
    const paused = pauseTimedSession(session);
    await cancelTimerNotification(session.notificationId);
    await applySession(withNotificationId(paused, null));
    setTickNow(new Date());
  }, [applySession, session]);

  const resumeTimer = useCallback(async () => {
    if (!session || session.status !== 'paused') return;
    const resumed = resumeTimedSession(session);
    if (resumed.status === 'readyToConfirm') {
      await cancelTimerNotification(session.notificationId);
      await applySession(withNotificationId(resumed, null));
      setTickNow(new Date());
      return;
    }
    const notificationId = await scheduleTimerCompletionNotification(resumed);
    setNotificationPermissionDenied(notificationId == null);
    await applySession(withNotificationId(resumed, notificationId));
    setTickNow(new Date());
  }, [applySession, session]);

  const finishTimer = useCallback(async () => {
    if (!session || session.status === 'readyToConfirm') return;
    const finished = finishTimedSession(session);
    await cancelTimerNotification(session.notificationId);
    await applySession(withNotificationId(finished, null));
    setTickNow(new Date());
  }, [applySession, session]);

  const discardTimer = useCallback(async () => {
    if (!session || !userId) return;
    await cancelTimerNotification(session.notificationId);
    await applySession(null);
    setTickNow(new Date());
  }, [applySession, session, userId]);

  const clearAfterConfirm = useCallback(async () => {
    if (!userId) return;
    if (session?.notificationId) {
      await cancelTimerNotification(session.notificationId);
    }
    await applySession(null);
    setTickNow(new Date());
  }, [applySession, session, userId]);

  const snapshot = useMemo(
    () => (session ? snapshotTimedSession(session, tickNow) : null),
    [session, tickNow],
  );

  const value = useMemo<ActiveTimerContextValue>(
    () => ({
      session,
      snapshot,
      hydrated,
      notificationPermissionDenied,
      startTimer,
      pauseTimer,
      resumeTimer,
      finishTimer,
      discardTimer,
      clearAfterConfirm,
      tickNow,
    }),
    [
      session,
      snapshot,
      hydrated,
      notificationPermissionDenied,
      startTimer,
      pauseTimer,
      resumeTimer,
      finishTimer,
      discardTimer,
      clearAfterConfirm,
      tickNow,
    ],
  );

  return (
    <ActiveTimerContext.Provider value={value}>{children}</ActiveTimerContext.Provider>
  );
}

export function useActiveTimer(): ActiveTimerContextValue {
  const value = useContext(ActiveTimerContext);
  if (!value) {
    throw new Error('useActiveTimer must be used within ActiveTimerProvider');
  }
  return value;
}
