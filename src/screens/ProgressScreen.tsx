import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ProgressNarrativeCard } from '../components/progress/ProgressNarrativeCard';
import { ProgressStatGrid } from '../components/progress/ProgressStatGrid';
import { RecentRepsList } from '../components/progress/RecentRepsList';
import { WeekChart } from '../components/progress/WeekChart';
import { useCurrentDay } from '../hooks/useCurrentDay';
import { colors } from '../theme/colors';
import type { Activity } from '../types';
import { calculateProgressStats } from '../utils/progressStats';

type Props = {
  activities: Activity[];
  onSelectActivity: (activityId: string) => void;
};

export function ProgressScreen({ activities, onSelectActivity }: Props) {
  const currentDay = useCurrentDay();
  const stats = useMemo(
    () => calculateProgressStats(activities, currentDay),
    [activities, currentDay],
  );

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ProgressNarrativeCard
        narrative={stats.narrative}
        totalReps={stats.totalReps}
      />

      <WeekChart days={stats.days} todayReps={stats.todayReps} />

      <ProgressStatGrid cards={stats.cards} />

      {stats.totalReps === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            Log your first rep and your story will start taking shape here.
          </Text>
        </View>
      ) : (
        <RecentRepsList
          reps={stats.recentReps}
          onSelectActivity={onSelectActivity}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 24,
    gap: 16,
  },
  empty: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  emptyText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    lineHeight: 22,
    color: colors.muted,
    textAlign: 'center',
  },
});
