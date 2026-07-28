import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { MilestoneBar, nextMilestone } from './MilestoneBar';
import { ProgressRing } from './ProgressRing';

type Props = {
  reps: number;
  goal: number;
  color: string;
};

export function ProgressOverview({ reps, goal, color }: Props) {
  const remaining = Math.max(goal - reps, 0);
  const milestone = nextMilestone(reps);

  return (
    <View style={styles.wrap}>
      <View style={styles.top}>
        <ProgressRing reps={reps} goal={goal} color={color} />
        <View style={styles.stats}>
          <Text style={styles.remaining}>
            {remaining === 0 ? 'Goal reached' : `${remaining} reps remaining`}
          </Text>
          {milestone != null ? (
            <Text style={[styles.milestone, { color }]}>
              Next milestone: {milestone}
            </Text>
          ) : (
            <Text style={[styles.milestone, { color }]}>All milestones done</Text>
          )}
        </View>
      </View>
      <MilestoneBar reps={reps} goal={goal} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    marginBottom: 28,
    gap: 20,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  stats: {
    flex: 1,
    gap: 6,
  },
  remaining: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    color: colors.muted,
  },
  milestone: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 15,
  },
});
