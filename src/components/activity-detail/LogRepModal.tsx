import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme/colors';
import { screenImageForSafety } from '../../utils/safeSearch';
import { formatPractisedDuration } from '../../utils/sessionDuration';

export type LogRepPayload = {
  note: string;
  imageUrl?: string;
  durationSeconds?: number;
  loggedAt?: string;
};

type Props = {
  visible: boolean;
  activityName: string;
  nextRepNumber: number;
  goal: number;
  accentColor: string;
  /** When set, this is a timed-session confirmation rather than a manual log. */
  practisedSeconds?: number | null;
  onClose: () => void;
  onSubmit: (payload: LogRepPayload) => void;
};

function formatStampLabel(date: Date): string {
  const day = date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const time = date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return `Date ${day} · ${time}`;
}

function LogRepForm({
  activityName,
  nextRepNumber,
  goal,
  accentColor,
  practisedSeconds,
  onClose,
  onSubmit,
}: Omit<Props, 'visible'>) {
  const [note, setNote] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [stampLabel] = useState(() => formatStampLabel(new Date()));
  const [screening, setScreening] = useState(false);
  const isTimedConfirm =
    practisedSeconds != null && practisedSeconds >= 0;

  const acceptScreenedPhoto = async (uri: string) => {
    setScreening(true);
    try {
      const result = await screenImageForSafety(uri);
      if (!result.ok) {
        Alert.alert('Photo not allowed', result.reason);
        return;
      }
      setImageUri(uri);
    } finally {
      setScreening(false);
    }
  };

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo library access to add evidence.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      await acceptScreenedPhoto(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow camera access to add evidence.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      await acceptScreenedPhoto(result.assets[0].uri);
    }
  };

  const choosePhoto = () => {
    if (screening) return;
    Alert.alert('Add photo evidence', undefined, [
      { text: 'Take photo', onPress: () => void takePhoto() },
      { text: 'Choose from library', onPress: () => void pickFromLibrary() },
      imageUri
        ? { text: 'Remove photo', style: 'destructive', onPress: () => setImageUri(null) }
        : null,
      { text: 'Cancel', style: 'cancel' },
    ].filter(Boolean) as {
      text: string;
      style?: 'cancel' | 'destructive';
      onPress?: () => void;
    }[]);
  };

  return (
    <>
      <View style={styles.handle} />
      <Text style={styles.title}>
        {isTimedConfirm ? 'Count this rep' : 'Log a Rep'}
      </Text>
      <Text style={styles.subtitle}>
        {activityName} ·{' '}
        <Text style={[styles.repHighlight, { color: accentColor }]}>
          Rep {nextRepNumber}
        </Text>{' '}
        of {goal}
      </Text>

      {isTimedConfirm ? (
        <View style={[styles.dateBox, styles.practisedBox]}>
          <Text style={styles.practisedLabel}>You practised for</Text>
          <Text style={[styles.practisedValue, { color: accentColor }]}>
            {formatPractisedDuration(practisedSeconds)}
          </Text>
        </View>
      ) : (
        <View style={styles.dateBox}>
          <Text style={styles.dateText}>{stampLabel}</Text>
        </View>
      )}

      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="What did you do? (optional)"
        placeholderTextColor={colors.muted}
        multiline
        style={[styles.noteInput, { borderColor: `${accentColor}55` }]}
        textAlignVertical="top"
      />

      <Pressable
        onPress={choosePhoto}
        disabled={screening}
        style={({ pressed }) => [
          styles.photoBox,
          pressed && !screening && styles.pressed,
          screening && styles.photoBoxBusy,
        ]}
      >
        {screening ? (
          <View style={styles.screeningRow}>
            <ActivityIndicator color={accentColor} />
            <Text style={styles.photoPlaceholder}>Checking photo…</Text>
          </View>
        ) : imageUri ? (
          <View style={styles.photoPreviewWrap}>
            <Image source={{ uri: imageUri }} style={styles.photoPreview} />
            <Text style={styles.photoChange}>Tap to change</Text>
          </View>
        ) : (
          <Text style={styles.photoPlaceholder}>Add photo evidence</Text>
        )}
      </Pressable>

      <Pressable
        onPress={() =>
          onSubmit({
            note: note.trim(),
            imageUrl: imageUri ?? undefined,
            durationSeconds: isTimedConfirm ? practisedSeconds : undefined,
          })
        }
        disabled={screening}
        style={({ pressed }) => [
          styles.submit,
          { backgroundColor: accentColor },
          (pressed || screening) && styles.pressed,
        ]}
      >
        <Text style={styles.submitLabel}>Count it ✓</Text>
      </Pressable>
    </>
  );
}

export function LogRepModal({
  visible,
  activityName,
  nextRepNumber,
  goal,
  accentColor,
  practisedSeconds = null,
  onClose,
  onSubmit,
}: Props) {
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
          {visible ? (
            <LogRepForm
              key={`log-${nextRepNumber}-${practisedSeconds ?? 'manual'}`}
              activityName={activityName}
              nextRepNumber={nextRepNumber}
              goal={goal}
              accentColor={accentColor}
              practisedSeconds={practisedSeconds}
              onClose={onClose}
              onSubmit={onSubmit}
            />
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(42,26,24,0.4)',
  },
  dismissArea: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 14,
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
    fontSize: 28,
    color: colors.text,
  },
  subtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    color: colors.muted,
    marginTop: -4,
  },
  repHighlight: {
    fontFamily: 'Outfit_600SemiBold',
  },
  dateBox: {
    backgroundColor: colors.controlBg,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  practisedBox: {
    gap: 4,
  },
  practisedLabel: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: colors.muted,
  },
  practisedValue: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 22,
  },
  dateText: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 14,
    color: colors.text,
  },
  noteInput: {
    minHeight: 100,
    backgroundColor: colors.screenBg,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    lineHeight: 22,
    color: colors.text,
  },
  photoBox: {
    minHeight: 88,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(42,26,24,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  photoBoxBusy: {
    opacity: 0.9,
  },
  screeningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  photoPlaceholder: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    color: colors.muted,
  },
  photoPreviewWrap: {
    width: '100%',
    alignItems: 'center',
  },
  photoPreview: {
    width: '100%',
    height: 160,
  },
  photoChange: {
    position: 'absolute',
    bottom: 10,
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  submit: {
    borderRadius: 999,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 4,
  },
  submitLabel: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.88,
  },
});
