import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from './PrimaryButton';

type Props = {
  buttonLabel?: string;
  onContinue?: () => void;
  continueDisabled?: boolean;
};

export function WizardFooter({ buttonLabel, onContinue, continueDisabled }: Props) {
  const insets = useSafeAreaInsets();
  const showButton = Boolean(buttonLabel && onContinue);

  if (!showButton) {
    return <View style={{ height: Math.max(insets.bottom, 16) }} />;
  }

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      <PrimaryButton
        label={buttonLabel!}
        onPress={() => {
          onContinue?.();
        }}
        disabled={continueDisabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
});
