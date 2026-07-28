import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../../theme/colors';

type Props = {
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
  /** Side-by-side cards use compact layout */
  compact?: boolean;
};

export function SelectionOptionCard({
  title,
  description,
  selected,
  onPress,
  compact,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        compact && styles.compact,
        selected ? styles.selected : styles.unselected,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderWidth: 1.5,
  },
  compact: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  selected: {
    backgroundColor: colors.selectedFill,
    borderColor: colors.brand.teal,
  },
  unselected: {
    backgroundColor: colors.card,
    borderColor: 'transparent',
    shadowColor: 'rgba(60,40,10,1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  pressed: {
    opacity: 0.85,
  },
  title: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: colors.text,
    marginBottom: 6,
  },
  description: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
});
