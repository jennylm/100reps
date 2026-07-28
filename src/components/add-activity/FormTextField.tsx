import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors } from '../../theme/colors';

type Props = TextInputProps & {
  label?: string;
};

export function FormTextField({ label, style, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.muted}
        style={[styles.input, style]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  label: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 18,
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    color: colors.text,
  },
});
