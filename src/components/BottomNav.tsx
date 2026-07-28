import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import type { Screen } from '../types';
import { HomeIcon, PeopleIcon } from './NavIcons';

type Props = {
  screen: Screen;
  setScreen: (screen: Screen) => void;
};

const TABS = [
  { id: 'home' as const, label: 'My Reps', Icon: HomeIcon },
  { id: 'community' as const, label: 'Community', Icon: PeopleIcon },
];

export function BottomNav({ screen, setScreen }: Props) {
  const insets = useSafeAreaInsets();
  const isHome = screen === 'home' || screen === 'detail';

  return (
    <View style={[styles.nav, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {TABS.map(({ id, label, Icon }) => {
        const active = id === 'home' ? isHome : screen === id;
        return (
          <Pressable
            key={id}
            onPress={() => setScreen(id)}
            style={styles.tab}
          >
            <Icon active={active} />
            <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
            {active ? <View style={styles.indicator} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    minHeight: 60,
    backgroundColor: colors.navBg,
    borderTopWidth: 1,
    borderTopColor: colors.faint,
    flexDirection: 'row',
    flexShrink: 0,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    position: 'relative',
    paddingBottom: 4,
  },
  label: {
    fontSize: 10,
    fontFamily: 'Outfit_400Regular',
    color: colors.muted,
  },
  labelActive: {
    fontFamily: 'Outfit_600SemiBold',
    color: colors.text,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    width: 24,
    height: 2,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
});
