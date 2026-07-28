import { ScrollView, StyleSheet, View } from 'react-native';
import { SelectionOptionCard } from '../../../components/add-activity/SelectionOptionCard';
import { WizardFooter } from '../../../components/add-activity/WizardFooter';
import { WizardStepHeader } from '../../../components/add-activity/WizardStepHeader';
import { WizardStepIntro } from '../../../components/add-activity/WizardStepIntro';
import { colors } from '../../../theme/colors';
import type { ActivityVisibility } from '../../../types';

type Props = {
  visibility: ActivityVisibility;
  busy?: boolean;
  onChangeVisibility: (visibility: ActivityVisibility) => void;
  onBack: () => void;
  onContinue: () => void;
};

export function VisibilityStep({
  visibility,
  busy,
  onChangeVisibility,
  onBack,
  onContinue,
}: Props) {
  const choose = (next: ActivityVisibility) => {
    if (busy) return;
    onChangeVisibility(next);
    onContinue();
  };

  return (
    <View style={styles.screen}>
      <WizardStepHeader step={5} progressColor={colors.brand.teal} onBack={onBack} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <WizardStepIntro
          title="Who can see this?"
          subtitle="Public activities can be celebrated by the community."
        />
        <View style={styles.list}>
          <SelectionOptionCard
            title="Public"
            description="Your milestones are shared with the community. Others can cheer you on."
            selected={visibility === 'public'}
            onPress={() => choose('public')}
          />
          <SelectionOptionCard
            title="Private"
            description="Only you can see this activity and your reps."
            selected={visibility === 'private'}
            onPress={() => choose('private')}
          />
        </View>
      </ScrollView>
      <WizardFooter
        buttonLabel={busy ? 'Finding photo…' : 'Create activity'}
        onContinue={onContinue}
        continueDisabled={busy}
      />
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
