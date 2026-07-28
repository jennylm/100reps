import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  SESSION_LENGTHS,
  sessionLengthChipSelection,
} from '../../../data/areas';
import { DurationChip } from '../../../components/add-activity/MetaChip';
import { FormTextField } from '../../../components/add-activity/FormTextField';
import { SelectionOptionCard } from '../../../components/add-activity/SelectionOptionCard';
import { WizardFooter } from '../../../components/add-activity/WizardFooter';
import { WizardStepHeader } from '../../../components/add-activity/WizardStepHeader';
import { WizardStepIntro } from '../../../components/add-activity/WizardStepIntro';
import { colors } from '../../../theme/colors';
import type { RepDefinitionType } from '../../../types';

type Props = {
  repType: RepDefinitionType;
  sessionLengthId: string | null;
  goalDefinition: string;
  onChangeRepType: (type: RepDefinitionType) => void;
  onChangeSessionLength: (id: string) => void;
  onChangeGoalDefinition: (value: string) => void;
  onBack: () => void;
  onContinue: () => void;
};

export function DefineRepStep({
  repType,
  sessionLengthId,
  goalDefinition,
  onChangeRepType,
  onChangeSessionLength,
  onChangeGoalDefinition,
  onBack,
  onContinue,
}: Props) {
  const { selectedId, customValue } = sessionLengthChipSelection(sessionLengthId);

  const selectLength = (id: string) => {
    if (id === 'other') {
      onChangeSessionLength(customValue.trim() || 'other');
      return;
    }
    onChangeSessionLength(id);
  };

  const onCustomChange = (value: string) => {
    onChangeSessionLength(value.trim() || 'other');
  };

  const timeReady =
    selectedId === 'other' ? customValue.trim().length > 0 : Boolean(selectedId);

  const canContinue =
    repType === 'time' ? timeReady : goalDefinition.trim().length > 0;

  return (
    <View style={styles.screen}>
      <WizardStepHeader step={4} progressColor={colors.brand.teal} onBack={onBack} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <WizardStepIntro
          title="Define a rep"
          subtitle="What does completing one rep mean for this activity?"
        />

        <View style={styles.typeRow}>
          <SelectionOptionCard
            compact
            title="Time-based"
            description="A rep is a session of a set duration"
            selected={repType === 'time'}
            onPress={() => onChangeRepType('time')}
          />
          <SelectionOptionCard
            compact
            title="Goal-based"
            description="A rep is reaching a specific target"
            selected={repType === 'goal'}
            onPress={() => onChangeRepType('goal')}
          />
        </View>

        {repType === 'time' ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Session length</Text>
            <View style={styles.durations}>
              {SESSION_LENGTHS.map((item) => (
                <DurationChip
                  key={item.id}
                  label={item.label}
                  selected={selectedId === item.id}
                  onPress={() => selectLength(item.id)}
                />
              ))}
            </View>
            {selectedId === 'other' ? (
              <View style={styles.otherField}>
                <FormTextField
                  label="Custom length"
                  value={customValue}
                  onChangeText={onCustomChange}
                  placeholder="e.g. 25 minutes"
                  autoFocus
                />
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.section}>
            <FormTextField
              label="What counts as one rep?"
              value={goalDefinition}
              onChangeText={onChangeGoalDefinition}
              placeholder="e.g. 1 piece"
            />
          </View>
        )}
      </ScrollView>
      <WizardFooter
        buttonLabel="Continue"
        onContinue={onContinue}
        continueDisabled={!canContinue}
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
  typeRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionLabel: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 12,
  },
  durations: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  otherField: {
    marginTop: 16,
  },
});
