import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

export const MILESTONES = [10, 25, 50, 75, 100] as const;

type Props = {
  reps: number;
  goal?: number;
  color: string;
};

/** Segmented milestone track with labels under 10 / 25 / 50 / 75 / 100. */
export function MilestoneBar({ reps, goal = 100, color }: Props) {
  const clamped = Math.max(0, Math.min(reps, goal));

  return (
    <View style={styles.wrap}>
      <View style={styles.trackRow}>
        {MILESTONES.map((milestone, index) => {
          const start = index === 0 ? 0 : MILESTONES[index - 1];
          const span = milestone - start;
          const filled = Math.max(0, Math.min(clamped - start, span));
          const pct = span > 0 ? filled / span : 0;

          return (
            <View key={milestone} style={styles.segment}>
              <View style={styles.segmentTrack}>
                <View
                  style={[
                    styles.segmentFill,
                    { width: `${pct * 100}%`, backgroundColor: color },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
      <View style={styles.labels}>
        {MILESTONES.map((milestone) => {
          const reached = clamped >= milestone;
          return (
            <Text
              key={milestone}
              style={[styles.label, reached && { color }]}
            >
              {milestone}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

export function nextMilestone(reps: number): number | null {
  return MILESTONES.find((m) => reps < m) ?? null;
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  trackRow: {
    flexDirection: 'row',
    gap: 4,
  },
  segment: {
    flex: 1,
  },
  segmentTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  segmentFill: {
    height: '100%',
    borderRadius: 3,
  },
  labels: {
    flexDirection: 'row',
  },
  label: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'DMMono_500Medium',
    fontSize: 11,
    color: colors.muted,
  },
});
