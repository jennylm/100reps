import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

type Props = {
  nextRepNumber: number;
  color: string;
  isTimed?: boolean;
  timedStartDisabled?: boolean;
  onLogRep: () => void;
  onStartTimedRep?: () => void;
};

export function DetailFooter({
  nextRepNumber,
  color,
  isTimed = false,
  timedStartDisabled = false,
  onLogRep,
  onStartTimedRep,
}: Props) {
  if (isTimed && onStartTimedRep) {
    return (
      <View style={styles.wrap}>
        <Pressable
          onPress={onStartTimedRep}
          disabled={timedStartDisabled}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: color },
            pressed && styles.pressed,
            timedStartDisabled && styles.disabled,
          ]}
        >
          <Text style={styles.label}>
            {timedStartDisabled
              ? 'Restoring timer…'
              : `Start timed rep ${nextRepNumber}`}
          </Text>
        </Pressable>
        <Pressable
          onPress={onLogRep}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.secondaryLabel}>Log without timer</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={onLogRep}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: color },
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.label}>+ Log Rep {nextRepNumber}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: colors.faint,
    backgroundColor: colors.screenBg,
    gap: 8,
  },
  button: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  secondaryButton: {
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryLabel: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 14,
    color: colors.muted,
  },
});
