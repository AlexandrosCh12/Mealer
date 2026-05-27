import { StyleSheet, View } from 'react-native';
import { colors } from '@/constants/colors';

interface ProgressBarProps {
  progress: number;
  height?: number;
}

export function ProgressBar({ progress, height = 6 }: ProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, progress));

  return (
    <View style={[styles.track, { height }]}>
      <View style={[styles.fill, { width: `${clamped * 100}%`, height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 999,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    backgroundColor: colors.accent,
    borderRadius: 999,
  },
});
