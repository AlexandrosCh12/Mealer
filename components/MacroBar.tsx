import { StyleSheet, Text, View } from 'react-native';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { colors } from '@/constants/colors';

interface MacroBarProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
}

export function MacroBar({ label, current, target, unit = 'g' }: MacroBarProps) {
  const progress = target > 0 ? current / target : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.values}>
          {Math.round(current)}
          {unit} / {Math.round(target)}
          {unit}
        </Text>
      </View>
      <ProgressBar progress={progress} height={8} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  values: {
    color: colors.textMuted,
    fontSize: 13,
  },
});
