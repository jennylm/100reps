import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import type { ProgressStatCard } from '../../utils/progressStats';

const ACCENTS = [
  colors.brand.amber,
  colors.brand.teal,
  colors.brand.pink,
  colors.brand.mint,
] as const;

type Props = {
  cards: ProgressStatCard[];
};

export function ProgressStatGrid({ cards }: Props) {
  if (cards.length === 0) return null;

  return (
    <View style={styles.grid}>
      {cards.map((card, index) => (
        <View
          key={`${card.label}-${card.value}`}
          style={[styles.card, { borderTopColor: ACCENTS[index % ACCENTS.length] }]}
        >
          <Text style={styles.label}>{card.label}</Text>
          <Text style={styles.value}>{card.value}</Text>
          <Text style={styles.supporting}>{card.supportingText}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  card: {
    width: '48.5%',
    minHeight: 112,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderTopWidth: 3,
    borderRadius: 16,
    padding: 14,
    shadowColor: 'rgba(60,40,10,1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  label: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 6,
  },
  value: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 16,
    lineHeight: 20,
    color: colors.text,
    marginBottom: 5,
  },
  supporting: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 10,
    lineHeight: 14,
    color: colors.muted,
  },
});
