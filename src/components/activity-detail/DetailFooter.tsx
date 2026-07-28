import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

type Props = {
  nextRepNumber: number;
  color: string;
  onLogRep: () => void;
};

export function DetailFooter({ nextRepNumber, color, onLogRep }: Props) {
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
  label: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
