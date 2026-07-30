import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  Fraunces_300Light_Italic,
  Fraunces_400Regular,
} from '@expo-google-fonts/fraunces';
import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
} from '@expo-google-fonts/outfit';
import { DMMono_500Medium } from '@expo-google-fonts/dm-mono';
import { BottomNav } from './src/components/BottomNav';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { ActiveTimerBanner } from './src/components/timer/ActiveTimerBanner';
import {
  createActivity,
  deleteActivity,
  deleteUploadedEvidence,
  deleteRep,
  insertRep,
  listActivities,
  updateActivity,
  updateRepNote,
  uploadRepEvidence,
} from './src/lib/db';
import { ActivityDetailScreen } from './src/screens/ActivityDetailScreen';
import { AddActivityScreen } from './src/screens/add-activity/AddActivityScreen';
import { AuthScreen } from './src/screens/auth/AuthScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { ProgressScreen } from './src/screens/ProgressScreen';
import { TimerScreen } from './src/screens/TimerScreen';
import {
  ActiveTimerProvider,
  useActiveTimer,
} from './src/state/ActiveTimerContext';
import { AuthProvider, useAuth } from './src/state/AuthContext';
import { colors } from './src/theme/colors';
import type { Activity, AddActivityDraft, Screen } from './src/types';
import { buildCreateActivityInput } from './src/utils/createActivityFromDraft';
import type { LogRepPayload } from './src/components/activity-detail/LogRepModal';
import type { EditActivityPayload } from './src/components/activity-detail/EditActivityModal';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

type ShellProps = {
  activities: Activity[];
  loadingActivities: boolean;
  activitiesLoadFailed: boolean;
  onRetryActivities: () => void;
  onCreated: (draft: AddActivityDraft) => void | Promise<void>;
  onLogRep: (activityId: string, payload: LogRepPayload) => void | Promise<void>;
  onEditRep: (activityId: string, repId: string, note: string) => void | Promise<void>;
  onDeleteRep: (activityId: string, repId: string) => void | Promise<void>;
  onEditActivity: (activityId: string, payload: EditActivityPayload) => void | Promise<void>;
  onDeleteActivity: (activityId: string) => void | Promise<void>;
};

function AppShell({
  activities,
  loadingActivities,
  activitiesLoadFailed,
  onRetryActivities,
  onCreated,
  onLogRep,
  onEditRep,
  onDeleteRep,
  onEditActivity,
  onDeleteActivity,
}: ShellProps) {
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const {
    session,
    snapshot,
    hydrated: timerHydrated,
    startTimer,
    clearAfterConfirm,
  } = useActiveTimer();

  const selected = activities.find((item) => item.id === selectedId) ?? null;
  const timerActivity =
    activities.find((item) => item.id === session?.activity.id) ?? null;
  const hideNav = screen === 'add' || screen === 'timer';
  const showTimerBanner =
    !loadingActivities && Boolean(session && snapshot) && screen !== 'timer';

  const goHome = () => {
    setSelectedId(null);
    setScreen('home');
  };

  const openTimer = () => setScreen('timer');

  const handleStartTimedRep = async (activity: Activity) => {
    const result = await startTimer(activity);
    if (result.ok) {
      setSelectedId(activity.id);
      setScreen('timer');
      return;
    }
    if (result.reason === 'not_hydrated') {
      Alert.alert(
        'Restoring your timer',
        'Please wait a moment while your saved timed session is restored.',
      );
      return;
    }
    if (result.reason === 'already_active') {
      Alert.alert(
        'A timer is already running',
        'You can only run one timed session at a time.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open timer', onPress: openTimer },
        ],
      );
      return;
    }
    if (result.reason === 'invalid_duration') {
      Alert.alert(
        'Set a session length',
        'Edit this activity and choose how long a timed rep should last.',
      );
    }
  };

  const handleConfirmTimedRep = async (payload: LogRepPayload) => {
    if (!session) return;
    const activityId = session.activity.id;
    try {
      await onLogRep(activityId, payload);
      await clearAfterConfirm();
      setSelectedId(activityId);
      setScreen('detail');
    } catch (err) {
      console.warn('Failed to confirm timed rep', err);
      Alert.alert(
        'Couldn’t save this rep',
        'Your timer is still here — try counting it again.',
      );
    }
  };

  if (loadingActivities) {
    return (
      <>
        <StatusBar style="dark" />
        <View style={styles.loading}>
          <ActivityIndicator color={colors.brand.teal} />
        </View>
      </>
    );
  }

  if (activitiesLoadFailed) {
    return (
      <>
        <StatusBar style="dark" />
        <View style={styles.loadError}>
          <Text style={styles.loadErrorTitle}>
            We couldn’t load your activities.
          </Text>
          <Text style={styles.loadErrorBody}>
            Your data is still stored online.
          </Text>
          <Pressable
            onPress={onRetryActivities}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.retryButtonPressed,
            ]}
          >
            <Text style={styles.retryButtonLabel}>Try again</Text>
          </Pressable>
        </View>
      </>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <View style={styles.shell}>
        {loadingActivities ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.brand.teal} />
          </View>
        ) : null}

        {!loadingActivities && screen === 'home' ? (
          <HomeScreen
            activities={activities}
            onSelect={(id) => {
              setSelectedId(id);
              setScreen('detail');
            }}
            onAdd={() => setScreen('add')}
          />
        ) : null}

        {!loadingActivities && screen === 'detail' && selected ? (
          <ActivityDetailScreen
            activity={selected}
            hasActiveTimer={Boolean(session)}
            timerHydrated={timerHydrated}
            activeTimerActivityId={session?.activity.id ?? null}
            onBack={goHome}
            onLogRep={(payload) => onLogRep(selected.id, payload)}
            onStartTimedRep={() => {
              void handleStartTimedRep(selected);
            }}
            onOpenActiveTimer={openTimer}
            onEditRep={(repId, note) => onEditRep(selected.id, repId, note)}
            onDeleteRep={(repId) => onDeleteRep(selected.id, repId)}
            onEditActivity={(payload) => onEditActivity(selected.id, payload)}
            onDeleteActivity={async () => {
              await onDeleteActivity(selected.id);
              goHome();
            }}
          />
        ) : null}

        {!loadingActivities && screen === 'progress' ? (
          <ProgressScreen
            activities={activities}
            onSelectActivity={(id) => {
              setSelectedId(id);
              setScreen('detail');
            }}
          />
        ) : null}

        {!loadingActivities && screen === 'community' ? (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderTitle}>Community</Text>
            <Text style={styles.placeholderBody}>Coming next from the Figma prototype.</Text>
          </View>
        ) : null}

        {!loadingActivities && screen === 'add' ? (
          <AddActivityScreen
            onCancel={() => setScreen('home')}
            onComplete={async (draft) => {
              await onCreated(draft);
              setScreen('home');
            }}
          />
        ) : null}

        {!loadingActivities && screen === 'timer' ? (
          <TimerScreen
            nextRepNumber={(timerActivity?.reps ?? session?.activity.reps ?? 0) + 1}
            goal={timerActivity?.goal ?? session?.activity.goal ?? 100}
            onBack={() => {
              if (session) {
                setSelectedId(session.activity.id);
                setScreen('detail');
                return;
              }
              goHome();
            }}
            onConfirmRep={handleConfirmTimedRep}
          />
        ) : null}
      </View>
      {showTimerBanner && snapshot ? (
        <ActiveTimerBanner snapshot={snapshot} onPress={openTimer} />
      ) : null}
      {!hideNav && !loadingActivities ? (
        <BottomNav screen={screen} setScreen={setScreen} />
      ) : null}
    </>
  );
}

function FontGate({ children }: { children: ReactNode }) {
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_300Light_Italic,
    Fraunces_400Regular,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    DMMono_500Medium,
  });
  const [fontWaitExpired, setFontWaitExpired] = useState(false);
  const fontGateReady = fontsLoaded || Boolean(fontError) || fontWaitExpired;

  useEffect(() => {
    if (fontGateReady) return;

    const timeout = setTimeout(() => setFontWaitExpired(true), 8000);
    return () => clearTimeout(timeout);
  }, [fontGateReady]);

  useEffect(() => {
    if (!fontGateReady) return;

    if (fontError) {
      console.warn('Failed to load custom fonts; using system fallbacks', fontError);
    } else if (fontWaitExpired && !fontsLoaded) {
      console.warn('Custom font loading timed out; using system fallbacks');
    }

    SplashScreen.hideAsync().catch((error) => {
      console.warn('Failed to hide splash screen', error);
    });
  }, [fontError, fontGateReady, fontsLoaded, fontWaitExpired]);

  if (!fontGateReady) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {children}
    </SafeAreaView>
  );
}

function AuthenticatedApp() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [activitiesLoadFailed, setActivitiesLoadFailed] = useState(false);
  const [activitiesLoadAttempt, setActivitiesLoadAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setActivities([]);
      setActivitiesLoadFailed(false);
      setLoadingActivities(false);
      return;
    }

    setActivitiesLoadFailed(false);
    setLoadingActivities(true);
    listActivities()
      .then((rows) => {
        if (!cancelled) {
          setActivities(rows);
          setActivitiesLoadFailed(false);
        }
      })
      .catch((err) => {
        console.warn('Failed to load activities', err);
        if (!cancelled) setActivitiesLoadFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoadingActivities(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activitiesLoadAttempt, user?.id]);

  const handleCreated = useCallback(
    async (draft: AddActivityDraft) => {
      if (!user) return;
      const input = await buildCreateActivityInput(draft);
      const created = await createActivity(user.id, input);
      setActivities((prev) => [created, ...prev]);
    },
    [user],
  );

  const handleLogRep = useCallback(
    async (activityId: string, payload: LogRepPayload) => {
      if (!user) return;
      let imagePath: string | null = null;
      let entry: Awaited<ReturnType<typeof insertRep>>;
      try {
        if (payload.imageUrl) {
          imagePath = await uploadRepEvidence(user.id, activityId, payload.imageUrl);
        }
        entry = await insertRep({
          userId: user.id,
          activityId,
          note: payload.note,
          imagePath,
          durationSeconds: payload.durationSeconds ?? null,
          loggedAt: payload.loggedAt ?? null,
        });
      } catch (error) {
        if (imagePath) {
          try {
            await deleteUploadedEvidence(imagePath);
          } catch (cleanupError) {
            console.warn('Failed to clean up uploaded rep evidence', cleanupError);
          }
        }
        throw error;
      }
      setActivities((prev) =>
        prev.map((item) => {
          if (item.id !== activityId) return item;
          return {
            ...item,
            reps: item.reps + 1,
            log: [entry, ...item.log],
          };
        }),
      );
    },
    [user],
  );

  const handleDeleteRep = useCallback(async (activityId: string, repId: string) => {
    await deleteRep(repId);
    setActivities((prev) =>
      prev.map((item) => {
        if (item.id !== activityId) return item;
        const nextLog = item.log.filter((entry) => entry.id !== repId);
        if (nextLog.length === item.log.length) return item;
        return {
          ...item,
          reps: Math.max(0, item.reps - 1),
          log: nextLog,
        };
      }),
    );
  }, []);

  const handleEditRep = useCallback(async (activityId: string, repId: string, note: string) => {
    await updateRepNote(repId, note);
    setActivities((prev) =>
      prev.map((item) => {
        if (item.id !== activityId) return item;
        return {
          ...item,
          log: item.log.map((entry) =>
            entry.id === repId ? { ...entry, note } : entry,
          ),
        };
      }),
    );
  }, []);

  const handleEditActivity = useCallback(
    async (activityId: string, payload: EditActivityPayload) => {
      await updateActivity(activityId, payload);
      setActivities((prev) =>
        prev.map((item) => {
          if (item.id !== activityId) return item;
          return {
            ...item,
            name: payload.name,
            repType: payload.repType,
            sessionLengthId: payload.sessionLengthId ?? undefined,
            goalDefinition: payload.goalDefinition || undefined,
          };
        }),
      );
    },
    [],
  );

  const handleDeleteActivity = useCallback(async (activityId: string) => {
    await deleteActivity(activityId);
    setActivities((prev) => prev.filter((item) => item.id !== activityId));
  }, []);

  return (
    <ActiveTimerProvider>
      <AppShell
        activities={activities}
        loadingActivities={loadingActivities}
        activitiesLoadFailed={activitiesLoadFailed}
        onRetryActivities={() => {
          setActivitiesLoadAttempt((attempt) => attempt + 1);
        }}
        onCreated={handleCreated}
        onLogRep={handleLogRep}
        onEditRep={handleEditRep}
        onDeleteRep={handleDeleteRep}
        onEditActivity={handleEditActivity}
        onDeleteActivity={handleDeleteActivity}
      />
    </ActiveTimerProvider>
  );
}

function AuthGate() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.brand.teal} />
      </View>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  return <AuthenticatedApp />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <FontGate>
            <AuthGate />
          </FontGate>
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  shell: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.screenBg,
  },
  loadError: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: colors.screenBg,
  },
  loadErrorTitle: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 25,
    lineHeight: 32,
    color: colors.text,
    textAlign: 'center',
  },
  loadErrorBody: {
    marginTop: 10,
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    minWidth: 132,
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.brand.teal,
  },
  retryButtonPressed: {
    opacity: 0.82,
  },
  retryButtonLabel: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  placeholderTitle: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 26,
    color: colors.text,
    marginBottom: 8,
  },
  placeholderBody: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
  },
});
