import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import type { Rep } from '../../types';
import { RepLogItem } from './RepLogItem';

type Props = {
  reps: number;
  log: Rep[];
  accentColor: string;
  onEditRep?: (repId: string) => void;
  onDeleteRep?: (repId: string) => void;
};

export function RepLogSection({
  reps,
  log,
  accentColor,
  onEditRep,
  onDeleteRep,
}: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Rep log</Text>
      {log.length === 0 ? (
        <Text style={styles.empty}>No reps logged yet. Add your first one below.</Text>
      ) : (
        log.map((entry, index) => (
          <RepLogItem
            key={entry.id}
            repNumber={Math.max(reps - index, 1)}
            entry={entry}
            accentColor={accentColor}
            onEdit={onEditRep ? () => onEditRep(entry.id) : undefined}
            onDelete={onDeleteRep ? () => onDeleteRep(entry.id) : undefined}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
  },
  label: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 4,
  },
  empty: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: colors.muted,
    paddingVertical: 20,
  },
});
