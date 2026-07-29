import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { formatRepWhen } from '../../utils/formatRepWhen';
import type { ProgressRep } from '../../utils/progressStats';

type Props = {
  reps: ProgressRep[];
  onSelectActivity: (activityId: string) => void;
};

export function RecentRepsList({ reps, onSelectActivity }: Props) {
  if (reps.length === 0) return null;

  return (
    <View>
      <Text style={styles.sectionLabel}>Recent reps</Text>
      <View style={styles.list}>
        {reps.map((rep) => (
          <Pressable
            key={`${rep.activityId}-${rep.id}`}
            onPress={() => onSelectActivity(rep.activityId)}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <View style={[styles.imageFallback, { backgroundColor: rep.activityColor }]}>
              <Image source={{ uri: rep.activityPhoto }} style={styles.image} />
              <View style={[styles.tint, { backgroundColor: `${rep.activityColor}22` }]} />
            </View>
            <View style={styles.content}>
              <View style={styles.meta}>
                <Text numberOfLines={1} style={styles.activity}>
                  {rep.activityName}
                </Text>
                <Text style={styles.when}>{formatRepWhen(rep.loggedAt)}</Text>
              </View>
              <Text numberOfLines={2} style={styles.note}>
                {rep.note || 'Rep logged'}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 10,
  },
  list: {
    gap: 10,
  },
  card: {
    minHeight: 78,
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: 'rgba(60,40,10,1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 1,
  },
  pressed: {
    opacity: 0.75,
  },
  imageFallback: {
    width: 58,
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  tint: {
    ...StyleSheet.absoluteFill,
  },
  content: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 13,
    paddingLeft: 12,
    paddingRight: 14,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 4,
  },
  activity: {
    flex: 1,
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    color: colors.text,
  },
  when: {
    flexShrink: 0,
    fontFamily: 'DMMono_500Medium',
    fontSize: 9,
    color: colors.muted,
  },
  note: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    lineHeight: 19,
    color: colors.muted,
  },
});
