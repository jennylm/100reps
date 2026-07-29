import { useEffect, useMemo, useState } from 'react';
import { AppState, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ProgressNarrativeCard } from '../components/progress/ProgressNarrativeCard';
import { ProgressStatGrid } from '../components/progress/ProgressStatGrid';
import { RecentRepsList } from '../components/progress/RecentRepsList';
import { WeekChart } from '../components/progress/WeekChart';
import { colors } from '../theme/colors';
import type { Activity } from '../types';
import { calculateProgressStats } from '../utils/progressStats';

type Props = {
  activities: Activity[];
  onSelectActivity: (activityId: string) => void;
};

function localDayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function useCurrentDay(): Date {
  const [currentDay, setCurrentDay] = useState(() => new Date());

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const refreshIfDayChanged = () => {
      const now = new Date();
      setCurrentDay((previous) =>
        localDayKey(previous) === localDayKey(now) ? previous : now,
      );
    };

    const scheduleMidnightRefresh = () => {
      if (timer) clearTimeout(timer);
      const now = new Date();
      const nextDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        1,
      );
      timer = setTimeout(() => {
        refreshIfDayChanged();
        scheduleMidnightRefresh();
      }, nextDay.getTime() - now.getTime());
    };

    scheduleMidnightRefresh();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refreshIfDayChanged();
        scheduleMidnightRefresh();
      }
    });

    return () => {
      if (timer) clearTimeout(timer);
      subscription.remove();
    };
  }, []);

  return currentDay;
}

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
