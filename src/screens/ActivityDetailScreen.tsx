import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  onBack: () => void;
  onLogRep: (payload: LogRepPayload) => void;
  onEditRep: (repId: string, note: string) => void;
  onDeleteRep: (repId: string) => void;
  onEditActivity: (payload: EditActivityPayload) => void | Promise<void>;
  onDeleteActivity: () => void;
};

export function ActivityDetailScreen({
  activity,
  onBack,
  onLogRep,
  onEditRep,
  onDeleteRep,
  onEditActivity,
  onDeleteActivity,
}: Props) {
  const accent = activity.color || colors.accent;
  const nextRep = activity.reps + 1;
  const [logging, setLogging] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingRepId, setEditingRepId] = useState<string | null>(null);

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
    Alert.alert(
      'Delete activity',
      `Delete “${activity.name}” and all of its reps? This can’t be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: onDeleteActivity,
        },
      ],
    );
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
          style={({ pressed }) => [styles.deleteActivity, pressed && styles.pressed]}
        >
          <Text style={styles.deleteActivityLabel}>Delete activity</Text>
        </Pressable>
      </ScrollView>

      <DetailFooter
        nextRepNumber={nextRep}
        color={accent}
        onLogRep={() => setLogging(true)}
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
  pressed: {
    opacity: 0.65,
  },
});
