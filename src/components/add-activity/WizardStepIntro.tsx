import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

type Props = {
  title: string;
  subtitle: string;
};

export function WizardStepIntro({ title, subtitle }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 8,
  },
  title: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 32,
    lineHeight: 38,
    color: colors.text,
  },
  subtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
  },
});
