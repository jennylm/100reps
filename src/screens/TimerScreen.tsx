import { useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  LogRepModal,
  type LogRepPayload,
} from '../components/activity-detail/LogRepModal';
import { useActiveTimer } from '../state/ActiveTimerContext';
import { colors } from '../theme/colors';
import {
  formatDurationLabel,
  formatPractisedDuration,
} from '../utils/sessionDuration';

type Props = {
  nextRepNumber: number;
  goal: number;
  onBack: () => void;
  onConfirmRep: (payload: LogRepPayload) => void | Promise<void>;
};

export function TimerScreen({
  nextRepNumber,
  goal,
  onBack,
  onConfirmRep,
}: Props) {
  const {
    session,
    snapshot,
    notificationPermissionDenied,
    pauseTimer,
    resumeTimer,
    finishTimer,
    discardTimer,
  } = useActiveTimer();
  const [confirming, setConfirming] = useState(false);
  const [timerActionPending, setTimerActionPending] = useState(false);
  const timerActionPendingRef = useRef(false);

  const runTimerAction = async (
    action: () => Promise<void>,
    onSuccess?: () => void,
  ) => {
    if (timerActionPendingRef.current) return;
    timerActionPendingRef.current = true;
    setTimerActionPending(true);

    try {
      await action();
    } catch (error) {
      console.warn('Timer action failed', error);
      timerActionPendingRef.current = false;
      setTimerActionPending(false);
      Alert.alert(
        'Couldn’t update the timer',
        'Please check your connection and try again.',
      );
      return;
    }

    timerActionPendingRef.current = false;
    setTimerActionPending(false);
    onSuccess?.();
  };

  if (!session || !snapshot) {
    return (
      <View style={styles.screen}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backLabel}>Back</Text>
        </Pressable>
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No active timer</Text>
          <Text style={styles.emptyBody}>Start a timed rep from an activity.</Text>
        </View>
      </View>
    );
  }

  const accent = session.activity.color || colors.accent;
  const ready = session.status === 'readyToConfirm';
  const paused = session.status === 'paused';
  const displaySeconds = ready
    ? snapshot.elapsedActiveSeconds
    : snapshot.remainingSeconds;

  const confirmDiscard = () => {
    Alert.alert(
      'Discard this session?',
      'Your practice time won’t be saved as a rep.',
      [
        { text: 'Keep going', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            void runTimerAction(discardTimer, onBack);
          },
        },
      ],
    );
  };

  const onFinishEarly = () => {
    Alert.alert(
      'Finish session?',
      `You’ve practised for ${formatPractisedDuration(snapshot.elapsedActiveSeconds)} so far. You can still count this as a rep.`,
      [
        { text: 'Keep going', style: 'cancel' },
        {
          text: 'Finish session',
          onPress: () => {
            void runTimerAction(finishTimer);
          },
        },
      ],
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backLabel}>Back</Text>
        </Pressable>
        <Pressable
          onPress={confirmDiscard}
          disabled={timerActionPending}
          style={[styles.discardBtn, timerActionPending && styles.disabled]}
        >
          <Text style={styles.discardLabel}>Discard</Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        <Text style={styles.kicker}>
          {ready ? 'Session complete' : paused ? 'Paused' : 'Timed rep'}
        </Text>
        <Text style={styles.activityName}>{session.activity.name}</Text>

        <View style={[styles.ring, { borderColor: `${accent}55` }]}>
          <Text style={[styles.time, { color: accent }]}>
            {formatDurationLabel(displaySeconds)}
          </Text>
          <Text style={styles.timeHint}>
            {ready ? 'Active practice time' : 'Remaining'}
          </Text>
        </View>

        {ready ? (
          <Text style={styles.affirmation}>
            You practised for {formatPractisedDuration(snapshot.elapsedActiveSeconds)}.
          </Text>
        ) : (
          <Text style={styles.target}>
            Target {formatDurationLabel(session.targetSeconds)}
          </Text>
        )}

        {notificationPermissionDenied && !ready ? (
          <Text style={styles.permissionNote}>
            Notifications are off, so the phone won’t alert you when time’s up —
            the timer will still finish correctly when you reopen the app.
          </Text>
        ) : null}
      </View>

      <View style={styles.footer}>
        {ready ? (
          <Pressable
            onPress={() => setConfirming(true)}
            style={({ pressed }) => [
              styles.primary,
              { backgroundColor: accent },
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.primaryLabel}>Count this rep</Text>
          </Pressable>
        ) : (
          <>
            <Pressable
              onPress={() => {
                void runTimerAction(paused ? resumeTimer : pauseTimer);
              }}
              disabled={timerActionPending}
              style={({ pressed }) => [
                styles.primary,
                { backgroundColor: accent },
                pressed && styles.pressed,
                timerActionPending && styles.disabled,
              ]}
            >
              <Text style={styles.primaryLabel}>
                {timerActionPending ? 'Updating…' : paused ? 'Resume' : 'Pause'}
              </Text>
            </Pressable>
            <Pressable
              onPress={onFinishEarly}
              disabled={timerActionPending}
              style={({ pressed }) => [
                styles.secondary,
                pressed && styles.pressed,
                timerActionPending && styles.disabled,
              ]}
            >
              <Text style={styles.secondaryLabel}>Finish session</Text>
            </Pressable>
          </>
        )}
      </View>

      <LogRepModal
        visible={confirming && ready}
        activityName={session.activity.name}
        nextRepNumber={nextRepNumber}
        goal={goal}
        accentColor={accent}
        practisedSeconds={snapshot.elapsedActiveSeconds}
        onClose={() => setConfirming(false)}
        onSubmit={(payload) => {
          setConfirming(false);
          void onConfirmRep({
            ...payload,
            durationSeconds: snapshot.elapsedActiveSeconds,
            loggedAt: session.completedAt ?? undefined,
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backLabel: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 15,
    color: colors.brand.teal,
  },
  discardBtn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  discardLabel: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 15,
    color: colors.muted,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  kicker: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 8,
  },
  activityName: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 28,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 28,
  },
  ring: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    marginBottom: 20,
  },
  time: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 44,
    lineHeight: 50,
  },
  timeHint: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
  },
  target: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    color: colors.muted,
  },
  affirmation: {
    fontFamily: 'Fraunces_300Light_Italic',
    fontSize: 20,
    lineHeight: 28,
    color: colors.text,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  permissionNote: {
    marginTop: 18,
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    lineHeight: 19,
    color: colors.muted,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 8,
    gap: 10,
  },
  primary: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryLabel: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  secondary: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryLabel: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 15,
    color: colors.text,
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.55,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 24,
    color: colors.text,
    marginBottom: 8,
  },
  emptyBody: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
  },
});
