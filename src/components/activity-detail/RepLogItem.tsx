import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import type { Rep } from '../../types';

type Props = {
  repNumber: number;
  entry: Rep;
  accentColor: string;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function RepLogItem({
  repNumber,
  entry,
  accentColor,
  onEdit,
  onDelete,
}: Props) {
  return (
    <View style={styles.item}>
      <View style={styles.meta}>
        <View style={[styles.badge, { backgroundColor: accentColor }]}>
          <Text style={styles.badgeText}>REP {repNumber}</Text>
        </View>
        <Text style={styles.when}>
          {entry.date} · {entry.time}
        </Text>
        <View style={styles.actions}>
          <Pressable
            onPress={onEdit}
            hitSlop={8}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Text style={styles.edit}>Edit</Text>
          </Pressable>
          <Pressable
            onPress={onDelete}
            hitSlop={8}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Text style={styles.delete}>Delete</Text>
          </Pressable>
        </View>
      </View>

      {entry.imageUrl ? (
        <Image source={{ uri: entry.imageUrl }} style={styles.image} />
      ) : null}

      {entry.note ? <Text style={styles.note}>{entry.note}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.faint,
    gap: 12,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  when: {
    flex: 1,
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: colors.muted,
  },
  actions: {
    flexDirection: 'row',
    gap: 14,
  },
  edit: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
    color: colors.muted,
  },
  delete: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
    color: colors.brand.pink,
  },
  pressed: {
    opacity: 0.6,
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 14,
    backgroundColor: colors.controlBg,
  },
  note: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
});
