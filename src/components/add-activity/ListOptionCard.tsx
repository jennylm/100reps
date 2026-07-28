import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../../theme/colors';

type Props = {
  label: string;
  onPress: () => void;
  italic?: boolean;
};

export function ListOptionCard({ label, onPress, italic }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Text style={[styles.label, italic && styles.italic]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 18,
    shadowColor: 'rgba(60,40,10,1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
  label: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 16,
    color: colors.text,
  },
  italic: {
    fontFamily: 'Outfit_400Regular',
    fontStyle: 'italic',
    color: colors.muted,
  },
});
