import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { DetailFooter } from '../components/activity-detail/DetailFooter';
import { DetailHeader } from '../components/activity-detail/DetailHeader';
import {
  EditActivityModal,
  type EditActivityPayload,
} from '../components/activity-detail/EditActivityModal';
import { EditRepModal } from '../components/activity-detail/EditRepModal';
import {
  LogRepModal,
  type LogRepPayload,
} from '../components/activity-detail/LogRepModal';
import { ProgressOverview } from '../components/activity-detail/ProgressOverview';
import { RepLogSection } from '../components/activity-detail/RepLogSection';
import { colors } from '../theme/colors';
import type { Activity } from '../types';

type Props = {
  activity: Activity;
  hasActiveTimer?: boolean;
  timerHydrated?: boolean;
  activeTimerActivityId?: string | null;
  onBack: () => void;
  onLogRep: (payload: LogRepPayload) => void;
  onStartTimedRep: () => void;
  onOpenActiveTimer: () => void;
  onEditRep: (repId: string, note: string) => void;
  onDeleteRep: (repId: string) => void;
  onEditActivity: (payload: EditActivityPayload) => void | Promise<void>;
  onDeleteActivity: () => void | Promise<void>;
};

export function ActivityDetailScreen({
  activity,
  hasActiveTimer = false,
  timerHydrated = true,
  activeTimerActivityId = null,
  onBack,
  onLogRep,
  onStartTimedRep,
  onOpenActiveTimer,
  onEditRep,
  onDeleteRep,
  onEditActivity,
  onDeleteActivity,
}: Props) {
  const accent = activity.color || colors.accent;
  const nextRep = activity.reps + 1;
  const isTimed = activity.repType === 'time';
  const [logging, setLogging] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingRepId, setEditingRepId] = useState<string | null>(null);
  const [deletingActivity, setDeletingActivity] = useState(false);

  const editingEntry = useMemo(
    () => activity.log.find((entry) => entry.id === editingRepId) ?? null,
    [activity.log, editingRepId],
  );

  const editingRepNumber = useMemo(() => {
    if (editingRepId == null) return 0;
    const index = activity.log.findIndex((entry) => entry.id === editingRepId);
    if (index < 0) return 0;
    return Math.max(activity.reps - index, 1);
  }, [activity.log, activity.reps, editingRepId]);

  const confirmDeleteActivity = () => {
    if (deletingActivity) return;

    if (hasActiveTimer && activeTimerActivityId === activity.id) {
      Alert.alert(
        'Timer still running',
        'Discard or finish the timed session for this activity before deleting it.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open timer', onPress: onOpenActiveTimer },
        ],
      );
      return;
    }

    Alert.alert(
      'Delete activity',
      `Delete “${activity.name}” and all of its reps? This can’t be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setDeletingActivity(true);
            void Promise.resolve(onDeleteActivity())
              .catch((error) => {
                console.warn('Failed to delete activity', error);
                Alert.alert(
                  'Couldn’t delete this activity',
                  'Please check your connection and try again.',
                );
              })
              .finally(() => {
                setDeletingActivity(false);
              });
          },
        },
      ],
    );
  };

  const handleStartTimedRep = () => {
    if (hasActiveTimer) {
      Alert.alert(
        'A timer is already running',
        activeTimerActivityId === activity.id
          ? 'Open the active session to continue.'
          : 'You can only run one timed session at a time. Open the active timer, or finish it first.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open timer', onPress: onOpenActiveTimer },
        ],
      );
      return;
    }
    onStartTimedRep();
  };

  return (
    <View style={styles.screen}>
      <DetailHeader title={activity.name} onBack={onBack} onClose={onBack} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ProgressOverview
          reps={activity.reps}
          goal={activity.goal}
          color={accent}
        />
        <RepLogSection
          reps={activity.reps}
          log={activity.log}
          accentColor={accent}
          onEditRep={(repId) => setEditingRepId(repId)}
          onDeleteRep={(repId) => {
            Alert.alert('Delete rep', 'Remove this rep from your log?', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => onDeleteRep(repId),
              },
            ]);
          }}
        />

        <Pressable
          onPress={() => setEditing(true)}
          style={({ pressed }) => [styles.editActivity, pressed && styles.pressed]}
        >
          <Text style={styles.editActivityLabel}>Edit activity</Text>
        </Pressable>

        <Pressable
          onPress={confirmDeleteActivity}
          disabled={deletingActivity}
          style={({ pressed }) => [
            styles.deleteActivity,
            pressed && styles.pressed,
            deletingActivity && styles.disabled,
          ]}
        >
          {deletingActivity ? (
            <View style={styles.deleteActivityProgress}>
              <ActivityIndicator size="small" color={colors.brand.pink} />
              <Text style={styles.deleteActivityLabel}>Deleting…</Text>
            </View>
          ) : (
            <Text style={styles.deleteActivityLabel}>Delete activity</Text>
          )}
        </Pressable>
      </ScrollView>

      <DetailFooter
        nextRepNumber={nextRep}
        color={accent}
        isTimed={isTimed}
        timedStartDisabled={isTimed && !timerHydrated}
        onLogRep={() => setLogging(true)}
        onStartTimedRep={isTimed ? handleStartTimedRep : undefined}
      />

      <LogRepModal
        visible={logging}
        activityName={activity.name}
        nextRepNumber={nextRep}
        goal={activity.goal}
        accentColor={accent}
        onClose={() => setLogging(false)}
        onSubmit={(payload) => {
          onLogRep(payload);
          setLogging(false);
        }}
      />

      <EditActivityModal
        visible={editing}
        activity={activity}
        accentColor={accent}
        onClose={() => setEditing(false)}
        onSave={onEditActivity}
      />

      <EditRepModal
        visible={editingRepId != null && editingEntry != null}
        repNumber={editingRepNumber}
        entry={editingEntry}
        accentColor={accent}
        onClose={() => setEditingRepId(null)}
        onSave={(note) => {
          if (editingRepId != null) {
            onEditRep(editingRepId, note);
          }
          setEditingRepId(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 24,
  },
  editActivity: {
    marginTop: 28,
    marginHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: colors.controlBg,
  },
  editActivityLabel: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 15,
    color: colors.text,
  },
  deleteActivity: {
    marginTop: 8,
    marginHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteActivityLabel: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 15,
    color: colors.brand.pink,
  },
  deleteActivityProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  disabled: {
    opacity: 0.65,
  },
  pressed: {
    opacity: 0.65,
  },
});
