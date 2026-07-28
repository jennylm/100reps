import { useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors } from '../../theme/colors';
import type { Rep } from '../../types';

type Props = {
  visible: boolean;
  repNumber: number;
  entry: Rep | null;
  accentColor: string;
  onClose: () => void;
  onSave: (note: string) => void;
};

export function EditRepModal({
  visible,
  repNumber,
  entry,
  accentColor,
  onClose,
  onSave,
}: Props) {
  const [note, setNote] = useState(entry?.note ?? '');

  useEffect(() => {
    if (visible && entry) {
      setNote(entry.note);
    }
  }, [visible, entry]);

  if (!entry) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.dismissArea} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Edit Rep {repNumber}</Text>
          <Text style={styles.when}>
            {entry.date} · {entry.time}
          </Text>

          {entry.imageUrl ? (
            <Image source={{ uri: entry.imageUrl }} style={styles.image} />
          ) : null}

          <Text style={styles.label}>Note</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="What did you do?"
            placeholderTextColor={colors.muted}
            multiline
            autoFocus
            style={styles.input}
            textAlignVertical="top"
          />

          <View style={styles.actions}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
            >
              <Text style={styles.secondaryLabel}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => onSave(note.trim())}
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: accentColor },
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.primaryLabel}>Save</Text>
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
  when: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: colors.muted,
    marginTop: -4,
  },
  image: {
    width: '100%',
    height: 140,
    borderRadius: 14,
    backgroundColor: colors.controlBg,
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
    minHeight: 110,
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    lineHeight: 22,
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
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
  pressed: {
    opacity: 0.85,
  },
});
