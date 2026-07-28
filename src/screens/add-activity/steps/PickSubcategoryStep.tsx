import { ScrollView, StyleSheet, View } from 'react-native';
import { ListOptionCard } from '../../../components/add-activity/ListOptionCard';
import { WizardFooter } from '../../../components/add-activity/WizardFooter';
import { WizardStepHeader } from '../../../components/add-activity/WizardStepHeader';
import { WizardStepIntro } from '../../../components/add-activity/WizardStepIntro';
import { colors } from '../../../theme/colors';

type Props = {
  subcategories: string[];
  onBack: () => void;
  onSelect: (subcategory: string) => void;
};

export function PickSubcategoryStep({ subcategories, onBack, onSelect }: Props) {
  return (
    <View style={styles.screen}>
      <WizardStepHeader step={2} progressColor={colors.brand.teal} onBack={onBack} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <WizardStepIntro
          title="Pick a subcategory"
          subtitle="Pick the closest match, or choose Other."
        />
        <View style={styles.list}>
          {subcategories.map((item) => (
            <ListOptionCard
              key={item}
              label={item}
              italic={item === 'Other'}
              onPress={() => onSelect(item)}
            />
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
  list: {
    paddingHorizontal: 20,
    gap: 12,
  },
});
