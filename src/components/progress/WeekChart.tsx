import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import type { ProgressDay } from '../../utils/progressStats';

type Props = {
  days: ProgressDay[];
  todayReps: number;
};

export function WeekChart({ days, todayReps }: Props) {
  const maxCount = Math.max(...days.map((day) => day.count), 1);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.sectionLabel}>This week</Text>
        <Text style={styles.today}>
          {todayReps} rep{todayReps === 1 ? '' : 's'} today
        </Text>
      </View>

      <View style={styles.chart}>
        {days.map((day) => {
          const height = Math.max((day.count / maxCount) * 60, day.count > 0 ? 8 : 3);
          return (
            <View key={day.dateKey} style={styles.day}>
              <View
                style={[
                  styles.bar,
                  {
                    height,
                    backgroundColor:
                      day.isToday && day.count > 0
                        ? colors.brand.teal
                        : day.count > 0
                          ? colors.brand.amber
                          : colors.faint,
                  },
                ]}
              />
              <Text style={[styles.dayLabel, day.isToday && styles.dayLabelToday]}>
                {day.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    padding: 16,
    shadowColor: 'rgba(60,40,10,1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  sectionLabel: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  today: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: colors.muted,
  },
  chart: {
    height: 78,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  day: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 5,
  },
  bar: {
    width: '100%',
    borderRadius: 5,
  },
  dayLabel: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 9,
    color: colors.muted,
  },
  dayLabelToday: {
    color: colors.text,
  },
});
