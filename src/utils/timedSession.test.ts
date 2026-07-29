import { describe, expect, it } from 'vitest';
import {
  createTimedSession,
  elapsedActiveSeconds,
  finishTimedSession,
  pauseTimedSession,
  reconcileTimedSession,
  remainingSeconds,
  resumeTimedSession,
  snapshotTimedSession,
  withNotificationId,
} from './timedSession';

const activity = {
  id: 'activity-1',
  name: 'Piano',
  color: '#009C77',
  photo: 'https://example.com/p.jpg',
  goal: 100,
  reps: 3,
};

function sessionAt(now: Date, targetSeconds = 600) {
  return createTimedSession({
    id: 'timer-1',
    userId: 'user-1',
    activity,
    targetSeconds,
    now,
  });
}

describe('timedSession', () => {
  it('creates a running session from wall-clock timestamps', () => {
    const now = new Date('2026-07-29T12:00:00.000Z');
    const session = sessionAt(now, 1200);

    expect(session.status).toBe('running');
    expect(session.targetSeconds).toBe(1200);
    expect(session.accumulatedActiveSeconds).toBe(0);
    expect(session.runningStartedAt).toBe(now.toISOString());
    expect(session.completedAt).toBeNull();
  });

  it('counts only active elapsed time while running', () => {
    const start = new Date('2026-07-29T12:00:00.000Z');
    const session = sessionAt(start, 600);
    const later = new Date('2026-07-29T12:05:00.000Z');

    expect(elapsedActiveSeconds(session, later)).toBe(300);
    expect(remainingSeconds(session, later)).toBe(300);
  });

  it('excludes paused time from elapsed and remaining', () => {
    const start = new Date('2026-07-29T12:00:00.000Z');
    let session = sessionAt(start, 600);

    const pauseAt = new Date('2026-07-29T12:04:00.000Z');
    session = pauseTimedSession(session, pauseAt);
    expect(session.status).toBe('paused');
    expect(session.accumulatedActiveSeconds).toBe(240);
    expect(session.runningStartedAt).toBeNull();

    const stillPaused = new Date('2026-07-29T12:20:00.000Z');
    expect(elapsedActiveSeconds(session, stillPaused)).toBe(240);
    expect(remainingSeconds(session, stillPaused)).toBe(360);

    const resumeAt = new Date('2026-07-29T12:20:00.000Z');
    session = resumeTimedSession(session, resumeAt);
    expect(session.status).toBe('running');
    expect(session.runningStartedAt).toBe(resumeAt.toISOString());

    const afterResume = new Date('2026-07-29T12:22:00.000Z');
    expect(elapsedActiveSeconds(session, afterResume)).toBe(360);
    expect(remainingSeconds(session, afterResume)).toBe(240);
  });

  it('supports finishing early with affirming ready-to-confirm state', () => {
    const start = new Date('2026-07-29T12:00:00.000Z');
    let session = sessionAt(start, 1800);
    const finishAt = new Date('2026-07-29T12:18:00.000Z');
    session = finishTimedSession(session, finishAt);

    expect(session.status).toBe('readyToConfirm');
    expect(session.completedAt).toBe(finishAt.toISOString());
    expect(session.runningStartedAt).toBeNull();
    expect(session.accumulatedActiveSeconds).toBe(18 * 60);

    const snap = snapshotTimedSession(session, finishAt);
    expect(snap.elapsedActiveSeconds).toBe(18 * 60);
    expect(snap.isComplete).toBe(true);
  });

  it('moves to readyToConfirm when the target is reached while running', () => {
    const start = new Date('2026-07-29T12:00:00.000Z');
    const session = sessionAt(start, 300);
    const atTarget = new Date('2026-07-29T12:05:00.000Z');
    const reconciled = reconcileTimedSession(session, atTarget);

    expect(reconciled.status).toBe('readyToConfirm');
    expect(reconciled.accumulatedActiveSeconds).toBe(300);
    expect(reconciled.completedAt).toBe(atTarget.toISOString());
    expect(elapsedActiveSeconds(reconciled, atTarget)).toBe(300);
  });

  it('hydrates an expired running session after force-close', () => {
    const start = new Date('2026-07-29T12:00:00.000Z');
    const persisted = withNotificationId(sessionAt(start, 120), 'notif-1');
    const reopen = new Date('2026-07-29T12:10:00.000Z');
    const restored = reconcileTimedSession(persisted, reopen);

    expect(restored.status).toBe('readyToConfirm');
    expect(restored.accumulatedActiveSeconds).toBe(120);
    expect(restored.runningStartedAt).toBeNull();
    expect(restored.notificationId).toBe('notif-1');
  });

  it('keeps a paused session paused across restore', () => {
    const start = new Date('2026-07-29T12:00:00.000Z');
    let session = pauseTimedSession(sessionAt(start, 600), new Date('2026-07-29T12:03:00.000Z'));
    const restored = reconcileTimedSession(
      session,
      new Date('2026-07-29T15:00:00.000Z'),
    );

    expect(restored.status).toBe('paused');
    expect(restored.accumulatedActiveSeconds).toBe(180);
  });

  it('resumes a paused session that already reached its target straight to confirm', () => {
    const start = new Date('2026-07-29T12:00:00.000Z');
    let session = pauseTimedSession(sessionAt(start, 60), new Date('2026-07-29T12:01:00.000Z'));
    expect(session.accumulatedActiveSeconds).toBe(60);

    const resumed = resumeTimedSession(session, new Date('2026-07-29T12:05:00.000Z'));
    expect(resumed.status).toBe('readyToConfirm');
    expect(resumed.runningStartedAt).toBeNull();
  });

  it('snapshots remaining time for the banner and timer UI', () => {
    const start = new Date('2026-07-29T12:00:00.000Z');
    const session = sessionAt(start, 90);
    const snap = snapshotTimedSession(session, new Date('2026-07-29T12:00:30.000Z'));

    expect(snap.remainingSeconds).toBe(60);
    expect(snap.elapsedActiveSeconds).toBe(30);
    expect(snap.isComplete).toBe(false);
  });
});
