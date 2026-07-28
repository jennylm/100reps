import { ScrollView, StyleSheet, View } from 'react-native';
import { ACTIVITY_AREAS } from '../../../data/areas';
import { AreaOptionCard } from '../../../components/add-activity/AreaOptionCard';
import { WizardFooter } from '../../../components/add-activity/WizardFooter';
import { WizardStepHeader } from '../../../components/add-activity/WizardStepHeader';
import { WizardStepIntro } from '../../../components/add-activity/WizardStepIntro';
import { colors } from '../../../theme/colors';

type Props = {
  onBack: () => void;
  onSelect: (areaId: string) => void;
};

export function ChooseAreaStep({ onBack, onSelect }: Props) {
  return (
    <View style={styles.screen}>
      <WizardStepHeader step={1} progressColor={colors.accent} onBack={onBack} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <WizardStepIntro
          title="Choose an area"
          subtitle="What broad area does this activity belong to?"
        />
        <View style={styles.grid}>
          {ACTIVITY_AREAS.map((area) => (
            <View key={area.id} style={styles.gridItem}>
              <AreaOptionCard
                emoji={area.emoji}
                label={area.label}
                onPress={() => onSelect(area.id)}
              />
            </View>
          ))}
        </View>
      </ScrollView>
      <WizardFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 24,
  },
  grid: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  gridItem: {
    width: '48.5%',
  },
});
