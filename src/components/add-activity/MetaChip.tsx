import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

type Props = {
  label: string;
  emoji?: string;
  selected?: boolean;
};

export function MetaChip({ label, emoji, selected }: Props) {
  return (
    <View style={[styles.chip, selected ? styles.selected : styles.muted]}>
      {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
      <Text style={[styles.label, selected ? styles.labelSelected : styles.labelMuted]}>
        {label}
      </Text>
    </View>
  );
}

type DurationProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function DurationChip({ label, selected, onPress }: DurationProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.duration,
        selected ? styles.durationSelected : styles.durationIdle,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.durationLabel, selected && styles.durationLabelSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  selected: {
    backgroundColor: colors.selectedFill,
  },
  muted: {
    backgroundColor: colors.chipBg,
  },
  emoji: {
    fontSize: 13,
  },
  label: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
  },
  labelSelected: {
    color: colors.brand.teal,
  },
  labelMuted: {
    color: colors.text,
  },
  duration: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  durationIdle: {
    backgroundColor: colors.card,
  },
  durationSelected: {
    backgroundColor: colors.brand.teal,
  },
  durationLabel: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
    color: colors.text,
  },
  durationLabelSelected: {
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.8,
  },
});
