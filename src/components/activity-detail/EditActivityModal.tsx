import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SESSION_LENGTHS, sessionLengthChipSelection } from '../../data/areas';
import { DurationChip } from '../add-activity/MetaChip';
import { colors } from '../../theme/colors';
import type { Category, RepDefinitionType } from '../../types';

export type EditActivityPayload = {
  name: string;
  repType: RepDefinitionType;
  sessionLengthId: string | null;
  goalDefinition: string;
};

type Props = {
  visible: boolean;
  category: Category;
  accentColor: string;
  onClose: () => void;
  onSave: (payload: EditActivityPayload) => void | Promise<void>;
};

export function EditActivityModal({
  visible,
  category,
  accentColor,
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState(category.name);
  const [repType, setRepType] = useState<RepDefinitionType>(category.repType ?? 'time');
  const [selectedLengthId, setSelectedLengthId] = useState('45');
  const [customLength, setCustomLength] = useState('');
  const [goalDefinition, setGoalDefinition] = useState(category.goalDefinition ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    const length = sessionLengthChipSelection(category.sessionLengthId);
    setName(category.name);
    setRepType(category.repType ?? 'time');
    setSelectedLengthId(length.selectedId);
    setCustomLength(length.customValue);
    setGoalDefinition(category.goalDefinition ?? '');
    setBusy(false);
    setError(null);
  }, [visible, category]);

  const resolvedSessionLength =
    selectedLengthId === 'other' ? customLength.trim() : selectedLengthId;

  const canSave =
    name.trim().length > 0 &&
    (repType === 'time'
      ? Boolean(resolvedSessionLength) && resolvedSessionLength !== 'other'
      : goalDefinition.trim().length > 0);

  const handleSave = async () => {
    if (!canSave || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onSave({
        name: name.trim(),
        repType,
        sessionLengthId: repType === 'time' ? resolvedSessionLength : null,
        goalDefinition: repType === 'goal' ? goalDefinition.trim() : '',
      });
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save activity.';
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.dismissArea} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Edit activity</Text>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.label}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Activity name"
              placeholderTextColor={colors.muted}
              style={styles.input}
              editable={!busy}
            />

            <Text style={styles.label}>What counts as one rep</Text>
            <View style={styles.typeRow}>
              <Pressable
                onPress={() => setRepType('time')}
                disabled={busy}
                style={({ pressed }) => [
                  styles.typeChip,
                  repType === 'time' && styles.typeChipSelected,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.typeChipLabel,
                    repType === 'time' && styles.typeChipLabelSelected,
                  ]}
                >
                  Time-based
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setRepType('goal')}
                disabled={busy}
                style={({ pressed }) => [
                  styles.typeChip,
                  repType === 'goal' && styles.typeChipSelected,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.typeChipLabel,
                    repType === 'goal' && styles.typeChipLabelSelected,
                  ]}
                >
                  Goal-based
                </Text>
              </Pressable>
            </View>

            {repType === 'time' ? (
              <>
                <Text style={styles.label}>Session length</Text>
                <View style={styles.durations}>
                  {SESSION_LENGTHS.map((item) => (
                    <DurationChip
                      key={item.id}
                      label={item.label}
                      selected={selectedLengthId === item.id}
                      onPress={() => {
                        setSelectedLengthId(item.id);
                        if (item.id !== 'other') setCustomLength('');
                      }}
                    />
                  ))}
                </View>
                {selectedLengthId === 'other' ? (
                  <>
                    <Text style={styles.label}>Custom length</Text>
                    <TextInput
                      value={customLength}
                      onChangeText={setCustomLength}
                      placeholder="e.g. 25 minutes"
                      placeholderTextColor={colors.muted}
                      style={styles.input}
                      editable={!busy}
                    />
                  </>
                ) : null}
              </>
            ) : (
              <>
                <Text style={styles.label}>Goal</Text>
                <TextInput
                  value={goalDefinition}
                  onChangeText={setGoalDefinition}
                  placeholder="e.g. 1 piece"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  editable={!busy}
                />
              </>
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </ScrollView>

          <View style={styles.actions}>
            <Pressable
              onPress={onClose}
              disabled={busy}
              style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
            >
              <Text style={styles.secondaryLabel}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                void handleSave();
              }}
              disabled={!canSave || busy}
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: accentColor },
                (!canSave || busy) && styles.disabled,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.primaryLabel}>{busy ? 'Saving…' : 'Save'}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(42,26,24,0.35)',
  },
  dismissArea: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.screenBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    maxHeight: '88%',
    gap: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.faint,
    marginBottom: 8,
  },
  title: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 24,
    color: colors.text,
  },
  scrollContent: {
    paddingBottom: 8,
    gap: 10,
  },
  label: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: colors.muted,
    marginTop: 4,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    color: colors.text,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeChip: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  typeChipSelected: {
    backgroundColor: colors.selectedFill,
  },
  typeChipLabel: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
    color: colors.text,
  },
  typeChipLabelSelected: {
    color: colors.brand.teal,
  },
  durations: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  error: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: colors.brand.pink,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  secondaryBtn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: colors.controlBg,
  },
  secondaryLabel: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 15,
    color: colors.text,
  },
  primaryBtn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryLabel: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.85,
  },
});
