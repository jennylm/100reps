import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

const DOTS = [
  colors.brand.amber,
  colors.brand.teal,
  colors.brand.pink,
  colors.brand.mint,
] as const;

type Props = {
  narrative: string;
  totalReps: number;
};

export function ProgressNarrativeCard({ narrative, totalReps }: Props) {
  return (
    <LinearGradient
      colors={[colors.brand.blush, colors.pageBg, 'rgba(130,207,197,0.10)']}
      locations={[0, 0.48, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.dots}>
        {DOTS.map((color) => (
          <View key={color} style={[styles.dot, { backgroundColor: color }]} />
        ))}
      </View>

      <Text style={styles.narrative}>{narrative}</Text>

      {totalReps > 0 ? (
        <View style={styles.totalRow}>
          <Text style={styles.total}>{totalReps}</Text>
          <Text style={styles.totalLabel}>
            rep{totalReps === 1 ? '' : 's'} and counting
          </Text>
        </View>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 22,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  dots: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 14,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    opacity: 0.7,
  },
  narrative: {
    fontFamily: 'Fraunces_300Light_Italic',
    fontSize: 19,
    lineHeight: 29,
    color: colors.text,
    marginBottom: 14,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 7,
  },
  total: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 28,
    lineHeight: 30,
    color: colors.text,
  },
  totalLabel: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: colors.muted,
  },
});
