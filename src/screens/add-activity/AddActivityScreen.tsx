import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ACTIVITY_AREAS } from '../../data/areas';
import { colors } from '../../theme/colors';
import {
  INITIAL_ADD_ACTIVITY_DRAFT,
  type ActivityVisibility,
  type AddActivityDraft,
  type RepDefinitionType,
} from '../../types';
import { ChooseAreaStep } from './steps/ChooseAreaStep';
import { DefineRepStep } from './steps/DefineRepStep';
import { NameActivityStep } from './steps/NameActivityStep';
import { PickSubcategoryStep } from './steps/PickSubcategoryStep';
import { VisibilityStep } from './steps/VisibilityStep';

type Step = 1 | 2 | 3 | 4 | 5;

type Props = {
  onCancel: () => void;
  onComplete: (draft: AddActivityDraft) => void | Promise<void>;
};

export function AddActivityScreen({ onCancel, onComplete }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<AddActivityDraft>(() => ({
    ...INITIAL_ADD_ACTIVITY_DRAFT,
  }));
  const draftRef = useRef(draft);
  draftRef.current = draft;

  const selectedArea = useMemo(
    () => ACTIVITY_AREAS.find((area) => area.id === draft.areaId) ?? null,
    [draft.areaId],
  );

  const patchDraft = (patch: Partial<AddActivityDraft>) => {
    const next = { ...draftRef.current, ...patch };
    draftRef.current = next;
    setDraft(next);
  };

  const goBack = () => {
    if (creating) return;
    if (step === 1) {
      onCancel();
      return;
    }
    setStep((prev) => (prev - 1) as Step);
  };

  const finish = async () => {
    if (creating) return;
    setCreating(true);
    try {
      await onComplete(draftRef.current);
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={styles.screen}>
      {step === 1 ? (
        <ChooseAreaStep
          onBack={goBack}
          onSelect={(areaId) => {
            patchDraft({ areaId, subcategory: null });
            setStep(2);
          }}
        />
      ) : null}

      {step === 2 && selectedArea ? (
        <PickSubcategoryStep
          subcategories={selectedArea.subcategories}
          onBack={goBack}
          onSelect={(subcategory) => {
            patchDraft({ subcategory });
            setStep(3);
          }}
        />
      ) : null}

      {step === 3 && selectedArea && draft.subcategory ? (
        <NameActivityStep
          areaLabel={selectedArea.label}
          areaEmoji={selectedArea.emoji}
          subcategory={draft.subcategory}
          name={draft.name}
          onChangeName={(name) => patchDraft({ name })}
          onBack={goBack}
          onContinue={() => setStep(4)}
        />
      ) : null}

      {step === 4 ? (
        <DefineRepStep
          repType={draft.repType}
          sessionLengthId={draft.sessionLengthId}
          goalDefinition={draft.goalDefinition}
          onChangeRepType={(repType: RepDefinitionType) => patchDraft({ repType })}
          onChangeSessionLength={(sessionLengthId) => patchDraft({ sessionLengthId })}
          onChangeGoalDefinition={(goalDefinition) => patchDraft({ goalDefinition })}
          onBack={goBack}
          onContinue={() => setStep(5)}
        />
      ) : null}

      {step === 5 ? (
        <VisibilityStep
          visibility={draft.visibility}
          busy={creating}
          onChangeVisibility={(visibility: ActivityVisibility) => {
            patchDraft({ visibility });
          }}
          onBack={goBack}
          onContinue={finish}
        />
      ) : null}

      {creating ? (
        <View style={styles.busyOverlay} pointerEvents="auto">
          <ActivityIndicator size="large" color={colors.brand.teal} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  busyOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255,246,244,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
