import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cancelTimerNotification,
  scheduleTimerCompletionNotification,
} from '../lib/timerNotifications';
import { createTimedSession, pauseTimedSession } from './timedSession';

const {
  getPermissionsAsync,
  requestPermissionsAsync,
  setNotificationChannelAsync,
  scheduleNotificationAsync,
  cancelScheduledNotificationAsync,
  setNotificationHandler,
} = vi.hoisted(() => ({
  getPermissionsAsync: vi.fn(),
  requestPermissionsAsync: vi.fn(),
  setNotificationChannelAsync: vi.fn(),
  scheduleNotificationAsync: vi.fn(),
  cancelScheduledNotificationAsync: vi.fn(),
  setNotificationHandler: vi.fn(),
}));

vi.mock('expo-notifications', () => ({
  AndroidImportance: { HIGH: 4 },
  SchedulableTriggerInputTypes: { TIME_INTERVAL: 'timeInterval' },
  setNotificationHandler,
  getPermissionsAsync,
  requestPermissionsAsync,
  setNotificationChannelAsync,
  scheduleNotificationAsync,
  cancelScheduledNotificationAsync,
}));

vi.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

const activity = {
  id: 'activity-1',
  name: 'Yoga',
  color: '#FAA151',
  photo: 'https://example.com/y.jpg',
  goal: 100,
  reps: 1,
};

describe('timerNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPermissionsAsync.mockResolvedValue({ granted: true, canAskAgain: true });
    requestPermissionsAsync.mockResolvedValue({ granted: true, canAskAgain: true });
    scheduleNotificationAsync.mockResolvedValue('notif-123');
    cancelScheduledNotificationAsync.mockResolvedValue(undefined);
  });

  it('schedules a completion notification for the remaining active time', async () => {
    const now = new Date('2026-07-29T12:00:00.000Z');
    const session = createTimedSession({
      id: 'timer-1',
      userId: 'user-1',
      activity,
      targetSeconds: 300,
      now,
    });

    const id = await scheduleTimerCompletionNotification(
      session,
      new Date('2026-07-29T12:01:00.000Z'),
    );

    expect(id).toBe('notif-123');
    expect(scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        trigger: expect.objectContaining({
          seconds: 240,
        }),
      }),
    );
  });

  it('cancels an existing notification when rescheduling', async () => {
    const now = new Date('2026-07-29T12:00:00.000Z');
    const session = {
      ...createTimedSession({
        id: 'timer-1',
        userId: 'user-1',
        activity,
        targetSeconds: 300,
        now,
      }),
      notificationId: 'old-notif',
    };

    await scheduleTimerCompletionNotification(session, now);

    expect(cancelScheduledNotificationAsync).toHaveBeenCalledWith('old-notif');
  });

  it('returns null and skips scheduling when permission is denied', async () => {
    getPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: false });

    const now = new Date('2026-07-29T12:00:00.000Z');
    const session = createTimedSession({
      id: 'timer-1',
      userId: 'user-1',
      activity,
      targetSeconds: 300,
      now,
    });

    const id = await scheduleTimerCompletionNotification(session, now);
    expect(id).toBeNull();
    expect(scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('cancels scheduled notifications on pause/finish/discard paths', async () => {
    await cancelTimerNotification('notif-abc');
    expect(cancelScheduledNotificationAsync).toHaveBeenCalledWith('notif-abc');

    await cancelTimerNotification(null);
    expect(cancelScheduledNotificationAsync).toHaveBeenCalledTimes(1);
  });

  it('does not schedule when a paused session has no remaining time', async () => {
    const start = new Date('2026-07-29T12:00:00.000Z');
    const running = createTimedSession({
      id: 'timer-1',
      userId: 'user-1',
      activity,
      targetSeconds: 60,
      now: start,
    });
    const paused = pauseTimedSession(running, new Date('2026-07-29T12:01:00.000Z'));

    const id = await scheduleTimerCompletionNotification(paused, new Date());
    expect(id).toBeNull();
    expect(scheduleNotificationAsync).not.toHaveBeenCalled();
  });
});
