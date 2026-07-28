import { useEffect, useRef } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActivityCard } from '../components/ActivityCard';
import { useAuth } from '../state/AuthContext';
import { colors } from '../theme/colors';
import type { Activity } from '../types';

type Props = {
  activities: Activity[];
  onSelect: (id: string) => void;
  onAdd: () => void;
};

function formatHeaderDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function HomeScreen({ activities, onSelect, onAdd }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const { user, signOut } = useAuth();
  const total = activities.reduce((sum, item) => sum + item.reps, 0);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [activities.length]);

  const onAccountPress = () => {
    Alert.alert('Account', user?.email ?? 'Signed in', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          void signOut();
        },
      },
    ]);
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.date}>{formatHeaderDate(new Date())}</Text>
          <Pressable
            onPress={onAccountPress}
            hitSlop={8}
            style={({ pressed }) => [styles.accountBtn, pressed && styles.accountPressed]}
          >
            <Text style={styles.accountLabel}>Account</Text>
          </Pressable>
        </View>
        <View style={styles.brandRow}>
          <Text style={styles.brandNumber}>100</Text>
          <Text style={styles.brandWord}>Reps</Text>
        </View>
      </View>

      <View style={styles.summary}>
        <View style={[styles.summaryCell, styles.summaryCellLeft]}>
          <Text style={styles.summaryLabel}>Total reps</Text>
          <Text style={styles.summaryValue}>{total}</Text>
        </View>
        <View style={styles.summaryCell}>
          <Text style={styles.summaryLabel}>Activities</Text>
          <Text style={styles.summaryValue}>{activities.length}</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>Activities</Text>

      <View style={styles.grid}>
        {activities.map((item) => (
          <View key={item.id} style={styles.gridItem}>
            <ActivityCard activity={item} onSelect={() => onSelect(item.id)} />
          </View>
        ))}
      </View>

      <Pressable onPress={onAdd} style={({ pressed }) => [styles.addButton, pressed && styles.addPressed]}>
        <Text style={styles.addPlus}>+</Text>
        <Text style={styles.addLabel}>Add new activity</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 16,
  },
  header: {
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    fontFamily: 'Outfit_400Regular',
    color: colors.muted,
    letterSpacing: 0.3,
  },
  accountBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  accountPressed: {
    opacity: 0.6,
  },
  accountLabel: {
    fontSize: 12,
    fontFamily: 'Outfit_500Medium',
    color: colors.brand.teal,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
  },
  brandNumber: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 42,
    color: colors.accent,
    lineHeight: 46,
  },
  brandWord: {
    fontFamily: 'Fraunces_300Light_Italic',
    fontSize: 34,
    color: colors.text,
    lineHeight: 40,
  },
  summary: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: 'rgba(60,40,10,1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  summaryCell: {
    flex: 1,
    paddingLeft: 16,
  },
  summaryCellLeft: {
    borderRightWidth: 1,
    borderRightColor: colors.faint,
    paddingRight: 16,
    paddingLeft: 0,
  },
  summaryLabel: {
    fontSize: 11,
    fontFamily: 'Outfit_400Regular',
    color: colors.muted,
    marginBottom: 3,
  },
  summaryValue: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 26,
    color: colors.text,
    lineHeight: 28,
  },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 10,
    fontFamily: 'Outfit_500Medium',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  gridItem: {
    width: '48.5%',
  },
  addButton: {
    width: '100%',
    marginTop: 10,
    paddingVertical: 13,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.faint,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addPressed: {
    opacity: 0.7,
  },
  addPlus: {
    fontSize: 16,
    color: colors.muted,
    fontFamily: 'Outfit_400Regular',
  },
  addLabel: {
    fontSize: 13,
    color: colors.muted,
    fontFamily: 'Outfit_400Regular',
  },
});
