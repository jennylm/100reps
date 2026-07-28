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
import type { AddActivityDraft, Category, Screen } from './src/types';
import { buildCreateActivityInput } from './src/utils/createCategoryFromDraft';
import type { LogRepPayload } from './src/components/activity-detail/LogRepModal';
import type { EditActivityPayload } from './src/components/activity-detail/EditActivityModal';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

type ShellProps = {
  cats: Category[];
  loadingCats: boolean;
  onCreated: (draft: AddActivityDraft) => void | Promise<void>;
  onLogRep: (categoryId: string, payload: LogRepPayload) => void | Promise<void>;
  onEditRep: (categoryId: string, repId: string, note: string) => void | Promise<void>;
  onDeleteRep: (categoryId: string, repId: string) => void | Promise<void>;
  onEditCategory: (categoryId: string, payload: EditActivityPayload) => void | Promise<void>;
  onDeleteCategory: (categoryId: string) => void | Promise<void>;
};

function AppShell({
  cats,
  loadingCats,
  onCreated,
  onLogRep,
  onEditRep,
  onDeleteRep,
  onEditCategory,
  onDeleteCategory,
}: ShellProps) {
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = cats.find((cat) => cat.id === selectedId) ?? null;
  const hideNav = screen === 'add';

  const goHome = () => {
    setSelectedId(null);
    setScreen('home');
  };

  return (
    <>
      <StatusBar style="dark" />
      <View style={styles.shell}>
        {loadingCats ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.brand.teal} />
          </View>
        ) : null}

        {!loadingCats && screen === 'home' ? (
          <HomeScreen
            cats={cats}
            onSelect={(id) => {
              setSelectedId(id);
              setScreen('detail');
            }}
            onAdd={() => setScreen('add')}
          />
        ) : null}

        {!loadingCats && screen === 'detail' && selected ? (
          <ActivityDetailScreen
            category={selected}
            onBack={goHome}
            onLogRep={(payload) => onLogRep(selected.id, payload)}
            onEditRep={(repId, note) => onEditRep(selected.id, repId, note)}
            onDeleteRep={(repId) => onDeleteRep(selected.id, repId)}
            onEditCategory={(payload) => onEditCategory(selected.id, payload)}
            onDeleteCategory={() => {
              void onDeleteCategory(selected.id);
              goHome();
            }}
          />
        ) : null}

        {!loadingCats && screen === 'community' ? (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderTitle}>Community</Text>
            <Text style={styles.placeholderBody}>Coming next from the Figma prototype.</Text>
          </View>
        ) : null}

        {!loadingCats && screen === 'add' ? (
          <AddActivityScreen
            onCancel={() => setScreen('home')}
            onComplete={async (draft) => {
              await onCreated(draft);
              setScreen('home');
            }}
          />
        ) : null}
      </View>
      {!hideNav && !loadingCats ? <BottomNav screen={screen} setScreen={setScreen} /> : null}
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
  const [cats, setCats] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setCats([]);
      setLoadingCats(false);
      return;
    }

    setLoadingCats(true);
    listActivities()
      .then((rows) => {
        if (!cancelled) setCats(rows);
      })
      .catch((err) => {
        console.warn('Failed to load activities', err);
        if (!cancelled) setCats([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingCats(false);
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
      setCats((prev) => [created, ...prev]);
    },
    [user],
  );

  const handleLogRep = useCallback(
    async (categoryId: string, payload: LogRepPayload) => {
      if (!user) return;
      let imagePath: string | null = null;
      if (payload.imageUrl) {
        imagePath = await uploadRepEvidence(user.id, categoryId, payload.imageUrl);
      }
      const entry = await insertRep({
        userId: user.id,
        activityId: categoryId,
        note: payload.note,
        imagePath,
      });
      setCats((prev) =>
        prev.map((cat) => {
          if (cat.id !== categoryId) return cat;
          return {
            ...cat,
            reps: cat.reps + 1,
            log: [entry, ...cat.log],
          };
        }),
      );
    },
    [user],
  );

  const handleDeleteRep = useCallback(async (categoryId: string, repId: string) => {
    await deleteRep(repId);
    setCats((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        const nextLog = cat.log.filter((entry) => entry.id !== repId);
        if (nextLog.length === cat.log.length) return cat;
        return {
          ...cat,
          reps: Math.max(0, cat.reps - 1),
          log: nextLog,
        };
      }),
    );
  }, []);

  const handleEditRep = useCallback(async (categoryId: string, repId: string, note: string) => {
    await updateRepNote(repId, note);
    setCats((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          log: cat.log.map((entry) =>
            entry.id === repId ? { ...entry, note } : entry,
          ),
        };
      }),
    );
  }, []);

  const handleEditCategory = useCallback(
    async (categoryId: string, payload: EditActivityPayload) => {
      await updateActivity(categoryId, payload);
      setCats((prev) =>
        prev.map((cat) => {
          if (cat.id !== categoryId) return cat;
          return {
            ...cat,
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

  const handleDeleteCategory = useCallback(async (categoryId: string) => {
    await deleteActivity(categoryId);
    setCats((prev) => prev.filter((cat) => cat.id !== categoryId));
  }, []);

  return (
    <AppShell
      cats={cats}
      loadingCats={loadingCats}
      onCreated={handleCreated}
      onLogRep={handleLogRep}
      onEditRep={handleEditRep}
      onDeleteRep={handleDeleteRep}
      onEditCategory={handleEditCategory}
      onDeleteCategory={handleDeleteCategory}
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
