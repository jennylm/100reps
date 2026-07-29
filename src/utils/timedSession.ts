export type TimedSessionStatus = 'running' | 'paused' | 'readyToConfirm';

export type TimedSessionActivitySnapshot = {
  id: string;
  name: string;
  color: string;
  photo: string;
  goal: number;
  reps: number;
};

export type TimedSession = {
  id: string;
  userId: string;
  activity: TimedSessionActivitySnapshot;
  targetSeconds: number;
  /** Active practice seconds accumulated before the current running segment. */
  accumulatedActiveSeconds: number;
  /** ISO timestamp when the current running segment started; null while paused or ready. */
  runningStartedAt: string | null;
  status: TimedSessionStatus;
  /** ISO timestamp when the session became ready to confirm. */
  completedAt: string | null;
  notificationId: string | null;
  createdAt: string;
};

export type TimedSessionSnapshot = {
  session: TimedSession;
  elapsedActiveSeconds: number;
  remainingSeconds: number;
  isComplete: boolean;
};

export type TimerStartBlockReason =
  | 'no_user'
  | 'not_hydrated'
  | 'already_active';

export function timerStartBlockReason(input: {
  userId: string | null;
  hydrated: boolean;
  session: TimedSession | null;
}): TimerStartBlockReason | null {
  if (!input.userId) return 'no_user';
  if (!input.hydrated) return 'not_hydrated';
  if (input.session) return 'already_active';
  return null;
}

function clampNonNegative(value: number): number {
  return Math.max(0, value);
}

export function createTimedSession(input: {
  id: string;
  userId: string;
  activity: TimedSessionActivitySnapshot;
  targetSeconds: number;
  now?: Date;
}): TimedSession {
  const now = input.now ?? new Date();
  return {
    id: input.id,
    userId: input.userId,
    activity: input.activity,
    targetSeconds: Math.max(1, Math.floor(input.targetSeconds)),
    accumulatedActiveSeconds: 0,
    runningStartedAt: now.toISOString(),
    status: 'running',
    completedAt: null,
    notificationId: null,
    createdAt: now.toISOString(),
  };
}

export function elapsedActiveSeconds(session: TimedSession, now = new Date()): number {
  let total = session.accumulatedActiveSeconds;
  if (session.status === 'running' && session.runningStartedAt) {
    const started = new Date(session.runningStartedAt).getTime();
    if (!Number.isNaN(started)) {
      total += Math.floor((now.getTime() - started) / 1000);
    }
  }
  return clampNonNegative(Math.min(total, session.targetSeconds));
}

export function remainingSeconds(session: TimedSession, now = new Date()): number {
  return clampNonNegative(session.targetSeconds - elapsedActiveSeconds(session, now));
}

export function snapshotTimedSession(
  session: TimedSession,
  now = new Date(),
): TimedSessionSnapshot {
  const elapsed = elapsedActiveSeconds(session, now);
  const remaining = clampNonNegative(session.targetSeconds - elapsed);
  return {
    session,
    elapsedActiveSeconds: elapsed,
    remainingSeconds: remaining,
    isComplete: remaining === 0 || session.status === 'readyToConfirm',
  };
}

export function pauseTimedSession(session: TimedSession, now = new Date()): TimedSession {
  if (session.status !== 'running') return session;
  const elapsed = elapsedActiveSeconds(session, now);
  return {
    ...session,
    accumulatedActiveSeconds: elapsed,
    runningStartedAt: null,
    status: 'paused',
  };
}

export function resumeTimedSession(session: TimedSession, now = new Date()): TimedSession {
  if (session.status !== 'paused') return session;
  if (session.accumulatedActiveSeconds >= session.targetSeconds) {
    return markTimedSessionReady(session, now);
  }
  return {
    ...session,
    runningStartedAt: now.toISOString(),
    status: 'running',
    completedAt: null,
  };
}

export function markTimedSessionReady(
  session: TimedSession,
  now = new Date(),
): TimedSession {
  const elapsed = elapsedActiveSeconds(session, now);
  return {
    ...session,
    accumulatedActiveSeconds: Math.min(elapsed, session.targetSeconds),
    runningStartedAt: null,
    status: 'readyToConfirm',
    completedAt: now.toISOString(),
  };
}

/** Finish early or at target — never framed as failure. */
export function finishTimedSession(session: TimedSession, now = new Date()): TimedSession {
  if (session.status === 'readyToConfirm') return session;
  return markTimedSessionReady(session, now);
}

/**
 * Reconcile a persisted session after app restore / force-close.
 * If a running session has reached its target, move it to readyToConfirm.
 */
export function reconcileTimedSession(
  session: TimedSession,
  now = new Date(),
): TimedSession {
  if (session.status === 'readyToConfirm') {
    return {
      ...session,
      runningStartedAt: null,
      accumulatedActiveSeconds: Math.min(
        session.accumulatedActiveSeconds,
        session.targetSeconds,
      ),
    };
  }
  if (session.status === 'running' && remainingSeconds(session, now) === 0) {
    return markTimedSessionReady(session, now);
  }
  return session;
}

export function withNotificationId(
  session: TimedSession,
  notificationId: string | null,
): TimedSession {
  return { ...session, notificationId };
}
