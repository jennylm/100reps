import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../../theme/colors';

type Props = {
  emoji: string;
  label: string;
  onPress: () => void;
};

export function AreaOptionCard({ emoji, label, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    shadowColor: 'rgba(60,40,10,1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  emoji: {
    fontSize: 18,
  },
  label: {
    flex: 1,
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: colors.text,
  },
});
