import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors } from '@/constants/colors';
import type { Meal, MealSlot } from '@/types';

interface MealCardProps {
  meal: Meal;
  onSwap: () => void;
  swapping?: boolean;
}

const SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

export function MealCard({ meal, onSwap, swapping = false }: MealCardProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.slot}>{SLOT_LABELS[meal.slot]}</Text>
      <Text style={styles.name}>{meal.name}</Text>
      <Text style={styles.ingredients}>{meal.ingredients.join(' · ')}</Text>
      <View style={styles.macrosRow}>
        <MacroPill label="Cal" value={meal.macros.calories} />
        <MacroPill label="P" value={meal.macros.protein} unit="g" />
        <MacroPill label="C" value={meal.macros.carbs} unit="g" />
        <MacroPill label="F" value={meal.macros.fat} unit="g" />
      </View>
      <Button
        title="Swap"
        variant="secondary"
        onPress={onSwap}
        loading={swapping}
        style={styles.swapBtn}
      />
    </Card>
  );
}

function MacroPill({
  label,
  value,
  unit = '',
}: {
  label: string;
  value: number;
  unit?: string;
}) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillLabel}>{label}</Text>
      <Text style={styles.pillValue}>
        {value}
        {unit}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  slot: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  name: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  ingredients: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 12,
  },
  macrosRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  pill: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  pillLabel: {
    color: colors.textMuted,
    fontSize: 11,
  },
  pillValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  swapBtn: {
    marginTop: 4,
  },
});
