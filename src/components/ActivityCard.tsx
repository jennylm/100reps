import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Activity } from '../types';

type Props = {
  activity: Activity;
  onSelect: () => void;
};

export function ActivityCard({ activity, onSelect }: Props) {
  const [imageFailed, setImageFailed] = useState(false);
  const pct = activity.goal > 0 ? activity.reps / activity.goal : 0;

  return (
    <Pressable
      onPress={onSelect}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={[styles.fallback, { backgroundColor: activity.color }]} />
      {!imageFailed ? (
        <Image
          source={{ uri: activity.photo }}
          style={styles.photo}
          onError={() => setImageFailed(true)}
        />
      ) : null}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.72)']}
        locations={[0, 0.45, 1]}
        style={styles.gradient}
      />
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${pct * 100}%`, backgroundColor: activity.color },
          ]}
        />
      </View>
      <View style={styles.overlay}>
        <Text style={styles.name}>{activity.name}</Text>
        <Text style={styles.reps}>{activity.reps}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 200,
    width: '100%',
    backgroundColor: '#E8E2D8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  fallback: {
    ...StyleSheet.absoluteFill,
    opacity: 0.85,
  },
  photo: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  track: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  fill: {
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 3,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  name: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 16,
    color: '#fff',
    lineHeight: 18,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    flex: 1,
    marginRight: 8,
  },
  reps: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 20,
    color: '#fff',
    lineHeight: 22,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
