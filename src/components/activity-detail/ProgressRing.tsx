import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../../theme/colors';

type Props = {
  reps: number;
  goal: number;
  color: string;
  size?: number;
};

export function ProgressRing({ reps, goal, color, size = 120 }: Props) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = goal > 0 ? Math.min(reps / goal, 1) : 0;
  const offset = circumference * (1 - progress);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.track}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={styles.reps}>{reps}</Text>
        <Text style={styles.goal}>/{goal}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reps: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 32,
    color: colors.text,
    lineHeight: 34,
  },
  goal: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 14,
    color: colors.muted,
    marginTop: 2,
  },
});
