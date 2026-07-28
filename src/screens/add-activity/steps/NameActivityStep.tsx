import { ScrollView, StyleSheet, View } from 'react-native';
import { FormTextField } from '../../../components/add-activity/FormTextField';
import { MetaChip } from '../../../components/add-activity/MetaChip';
import { WizardFooter } from '../../../components/add-activity/WizardFooter';
import { WizardStepHeader } from '../../../components/add-activity/WizardStepHeader';
import { WizardStepIntro } from '../../../components/add-activity/WizardStepIntro';
import { colors } from '../../../theme/colors';

type Props = {
  areaLabel: string;
  areaEmoji: string;
  subcategory: string;
  name: string;
  onChangeName: (name: string) => void;
  onBack: () => void;
  onContinue: () => void;
};

export function NameActivityStep({
  areaLabel,
  areaEmoji,
  subcategory,
  name,
  onChangeName,
  onBack,
  onContinue,
}: Props) {
  return (
    <View style={styles.screen}>
      <WizardStepHeader step={3} progressColor={colors.brand.teal} onBack={onBack} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <WizardStepIntro
          title="Name your activity"
          subtitle="Whatever you'll recognise on your home screen — a craft, a practice, a project."
        />
        <View style={styles.chips}>
          <MetaChip emoji={areaEmoji} label={areaLabel} selected />
          <MetaChip label={subcategory} />
        </View>
        <View style={styles.field}>
          <FormTextField
            value={name}
            onChangeText={onChangeName}
            placeholder="e.g. Piano practice 40 mins"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={() => {
              if (name.trim()) onContinue();
            }}
          />
        </View>
      </ScrollView>
      <WizardFooter
        buttonLabel="Continue"
        onContinue={onContinue}
        continueDisabled={!name.trim()}
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
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  field: {
    paddingHorizontal: 20,
  },
});
