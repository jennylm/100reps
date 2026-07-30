import {
  Component,
  Fragment,
  type ErrorInfo,
  type ReactNode,
} from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { colors } from '../theme/colors';

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
  retryKey: number;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    error: null,
    retryKey: 0,
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught app error', error, errorInfo.componentStack);

    // A failure can happen before FontGate dismisses the native splash screen.
    // Ensure the recovery UI is visible rather than leaving the splash in place.
    SplashScreen.hideAsync().catch((splashError) => {
      console.warn('Failed to hide splash screen after app error', splashError);
    });
  }

  private retry = () => {
    this.setState((state) => ({
      error: null,
      retryKey: state.retryKey + 1,
    }));
  };

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.body}>
            100 Reps ran into an unexpected problem. Your saved data has not
            been deleted.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={this.retry}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonText}>Try again</Text>
          </Pressable>
          <Text style={styles.hint}>
            If the problem continues, close the app completely and reopen it.
          </Text>
        </View>
      );
    }

    return (
      <Fragment key={this.state.retryKey}>{this.props.children}</Fragment>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
    backgroundColor: colors.screenBg,
  },
  title: {
    fontSize: 25,
    lineHeight: 32,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  body: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 23,
    color: colors.muted,
    textAlign: 'center',
  },
  button: {
    minWidth: 132,
    marginTop: 24,
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 14,
    backgroundColor: colors.brand.teal,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  hint: {
    marginTop: 18,
    fontSize: 13,
    lineHeight: 19,
    color: colors.muted,
    textAlign: 'center',
  },
});
