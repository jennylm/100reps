import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../theme/colors';

type IconProps = {
  active: boolean;
};

export function HomeIcon({ active }: IconProps) {
  const stroke = active ? colors.text : colors.muted;
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 12L12 3l9 9"
        stroke={stroke}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9"
        stroke={stroke}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ProgressIcon({ active }: IconProps) {
  const stroke = active ? colors.text : colors.muted;
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 20V4"
        stroke={stroke}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <Path
        d="M3 20h18"
        stroke={stroke}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <Path
        d="M6 16l4-5 4 3 5-8"
        stroke={stroke}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={19} cy={6} r={1.4} fill={stroke} />
    </Svg>
  );
}

export function PeopleIcon({ active }: IconProps) {
  const stroke = active ? colors.text : colors.muted;
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
        stroke={stroke}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={9} cy={7} r={4} stroke={stroke} strokeWidth={1.6} />
      <Path
        d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
        stroke={stroke}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
