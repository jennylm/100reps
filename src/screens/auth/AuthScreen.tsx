import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../state/AuthContext';
import { colors } from '../../theme/colors';

export function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !password) {
      setError('Email and password are required.');
      setInfo(null);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setInfo(null);
      return;
    }

    setBusy(true);
    setError(null);
    setInfo(null);

    try {
      const result =
        mode === 'signIn'
          ? await signIn(trimmed, password)
          : await signUp(trimmed, password);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.needsEmailConfirmation) {
        setInfo(
          'Account created. Check your email to confirm, then sign in. ' +
            'For faster local testing: Supabase → Authentication → Providers → Email → turn off “Confirm email”.',
        );
        setMode('signIn');
      }
      // If a session was created, AuthGate switches automatically.
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.brandNumber}>100</Text>
        <Text style={styles.brandWord}>Reps</Text>
        <Text style={styles.subtitle}>
          {mode === 'signIn' ? 'Sign in to sync your activities' : 'Create an account to get started'}
        </Text>

        {!isSupabaseConfigured ? (
          <Text style={styles.error}>
            Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL (https://…) and
            EXPO_PUBLIC_SUPABASE_ANON_KEY in .env, then restart Metro.
          </Text>
        ) : null}

        <TextInput
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          placeholder="Email"
          placeholderTextColor={colors.muted}
          value={email}
          onChangeText={setEmail}
          editable={!busy}
        />
        <TextInput
          style={styles.input}
          secureTextEntry
          autoComplete={mode === 'signIn' ? 'password' : 'new-password'}
          textContentType="password"
          placeholder="Password (min 6 characters)"
          placeholderTextColor={colors.muted}
          value={password}
          onChangeText={setPassword}
          editable={!busy}
          onSubmitEditing={() => {
            void onSubmit();
          }}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {info ? <Text style={styles.info}>{info}</Text> : null}

        <Pressable
          onPress={() => {
            void onSubmit();
          }}
          disabled={busy || !isSupabaseConfigured}
          style={({ pressed }) => [
            styles.primary,
            pressed && styles.pressed,
            (busy || !isSupabaseConfigured) && styles.disabled,
          ]}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryLabel}>
              {mode === 'signIn' ? 'Sign in' : 'Sign up'}
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => {
            setMode((m) => (m === 'signIn' ? 'signUp' : 'signIn'));
            setError(null);
            setInfo(null);
          }}
          disabled={busy}
          style={styles.switch}
        >
          <Text style={styles.switchText}>
            {mode === 'signIn'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.screenBg,
    justifyContent: 'center',
  },
  inner: {
    paddingHorizontal: 28,
  },
  brandNumber: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 56,
    color: colors.brand.teal,
    lineHeight: 60,
  },
  brandWord: {
    fontFamily: 'Fraunces_300Light_Italic',
    fontSize: 42,
    color: colors.text,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    color: colors.muted,
    marginBottom: 28,
  },
  input: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  error: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: colors.brand.pink,
    marginBottom: 12,
  },
  info: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: colors.brand.teal,
    marginBottom: 12,
    lineHeight: 18,
  },
  primary: {
    backgroundColor: colors.brand.teal,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryLabel: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.6,
  },
  switch: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 14,
    color: colors.brand.teal,
  },
});
