import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { formatDurationLabel } from '../../utils/sessionDuration';
import type { TimedSessionSnapshot } from '../../utils/timedSession';

type Props = {
  snapshot: TimedSessionSnapshot;
  onPress: () => void;
};

export function ActiveTimerBanner({ snapshot, onPress }: Props) {
  const { session, remainingSeconds } = snapshot;
  const statusLabel =
    session.status === 'paused'
      ? 'Paused'
      : session.status === 'readyToConfirm'
        ? 'Ready to count'
        : 'In progress';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.banner, pressed && styles.pressed]}
    >
      <View style={[styles.dot, { backgroundColor: session.activity.color }]} />
      <View style={styles.copy}>
        <Text numberOfLines={1} style={styles.title}>
          {session.activity.name}
        </Text>
        <Text style={styles.meta}>{statusLabel}</Text>
      </View>
      <Text style={styles.time}>
        {session.status === 'readyToConfirm'
          ? 'Done'
          : formatDurationLabel(remainingSeconds)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: 'rgba(60,40,10,1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  pressed: {
    opacity: 0.85,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: colors.text,
  },
  meta: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: colors.muted,
    marginTop: 1,
  },
  time: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 16,
    color: colors.text,
  },
});
