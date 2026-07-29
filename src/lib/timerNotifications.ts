import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { TimedSession } from '../utils/timedSession';
import { remainingSeconds } from '../utils/timedSession';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export type NotificationPermissionResult = {
  granted: boolean;
  canAskAgain: boolean;
};

export async function ensureTimerNotificationPermission(): Promise<NotificationPermissionResult> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('timed-reps', {
      name: 'Timed reps',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
    });
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return { granted: true, canAskAgain: current.canAskAgain };
  }

  if (!current.canAskAgain) {
    return { granted: false, canAskAgain: false };
  }

  const requested = await Notifications.requestPermissionsAsync();
  return {
    granted: requested.granted,
    canAskAgain: requested.canAskAgain,
  };
}

export async function cancelTimerNotification(
  notificationId: string | null | undefined,
): Promise<void> {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // Notification may already have fired or been cancelled.
  }
}

export async function scheduleTimerCompletionNotification(
  session: TimedSession,
  now = new Date(),
): Promise<string | null> {
  const remaining = remainingSeconds(session, now);
  if (remaining <= 0) return null;

  const permission = await ensureTimerNotificationPermission();
  if (!permission.granted) return null;

  await cancelTimerNotification(session.notificationId);

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time’s up',
      body: `${session.activity.name} — ready to count this rep when you are.`,
      sound: 'default',
      data: {
        type: 'timed_session_complete',
        sessionId: session.id,
        activityId: session.activity.id,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, remaining),
      channelId: Platform.OS === 'android' ? 'timed-reps' : undefined,
    },
  });

  return identifier;
}
