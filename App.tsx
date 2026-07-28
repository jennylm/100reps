import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
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
import {
  createActivity,
  deleteActivity,
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
  onCreated,
  onLogRep,
  onEditRep,
  onDeleteRep,
  onEditActivity,
  onDeleteActivity,
}: ShellProps) {
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = activities.find((item) => item.id === selectedId) ?? null;
  const hideNav = screen === 'add';

  const goHome = () => {
    setSelectedId(null);
    setScreen('home');
  };

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
            onBack={goHome}
            onLogRep={(payload) => onLogRep(selected.id, payload)}
            onEditRep={(repId, note) => onEditRep(selected.id, repId, note)}
            onDeleteRep={(repId) => onDeleteRep(selected.id, repId)}
            onEditActivity={(payload) => onEditActivity(selected.id, payload)}
            onDeleteActivity={() => {
              void onDeleteActivity(selected.id);
              goHome();
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
      </View>
      {!hideNav && !loadingActivities ? (
        <BottomNav screen={screen} setScreen={setScreen} />
      ) : null}
    </>
  );
}

function FontGate({ children }: { children: ReactNode }) {
  const [fontsLoaded] = useFonts({
    Fraunces_300Light_Italic,
    Fraunces_400Regular,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    DMMono_500Medium,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']} onLayout={onLayoutRootView}>
      {children}
    </SafeAreaView>
  );
}

function AuthenticatedApp() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setActivities([]);
      setLoadingActivities(false);
      return;
    }

    setLoadingActivities(true);
    listActivities()
      .then((rows) => {
        if (!cancelled) setActivities(rows);
      })
      .catch((err) => {
        console.warn('Failed to load activities', err);
        if (!cancelled) setActivities([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingActivities(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

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
      if (payload.imageUrl) {
        imagePath = await uploadRepEvidence(user.id, activityId, payload.imageUrl);
      }
      const entry = await insertRep({
        userId: user.id,
        activityId,
        note: payload.note,
        imagePath,
      });
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
    <AppShell
      activities={activities}
      loadingActivities={loadingActivities}
      onCreated={handleCreated}
      onLogRep={handleLogRep}
      onEditRep={handleEditRep}
      onDeleteRep={handleDeleteRep}
      onEditActivity={handleEditActivity}
      onDeleteActivity={handleDeleteActivity}
    />
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
    <SafeAreaProvider>
      <AuthProvider>
        <FontGate>
          <AuthGate />
        </FontGate>
      </AuthProvider>
    </SafeAreaProvider>
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
