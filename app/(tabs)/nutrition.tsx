import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MacroBar } from '@/components/MacroBar';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/constants/colors';
import { calculateDailyCalorieTarget } from '@/lib/calories';
import { generateMealPlan } from '@/lib/mealGenerator';

export default function NutritionScreen() {
  const { profile } = useAuth();

  const { totals, targets } = useMemo(() => {
    if (!profile) {
      return {
        totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        targets: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      };
    }
    const plan = generateMealPlan(profile);
    const totals = plan.meals.reduce(
      (acc, m) => ({
        calories: acc.calories + m.macros.calories,
        protein: acc.protein + m.macros.protein,
        carbs: acc.carbs + m.macros.carbs,
        fat: acc.fat + m.macros.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
    const calTarget = calculateDailyCalorieTarget(profile);
    const proteinTarget = Math.round((profile.weight_kg ?? 70) * 1.8);
    const fatTarget = Math.round((calTarget * 0.25) / 9);
    const carbsTarget = Math.round(
      (calTarget - proteinTarget * 4 - fatTarget * 9) / 4
    );
    return {
      totals,
      targets: {
        calories: calTarget,
        protein: proteinTarget,
        carbs: Math.max(carbsTarget, 0),
        fat: fatTarget,
      },
    };
  }, [profile]);

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.muted}>Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Nutrition</Text>
        <Text style={styles.subtitle}>Today&apos;s macro progress</Text>

        <Card style={styles.card}>
          <MacroBar
            label="Calories"
            current={totals.calories}
            target={targets.calories}
            unit=""
          />
          <MacroBar label="Protein" current={totals.protein} target={targets.protein} />
          <MacroBar label="Carbs" current={totals.carbs} target={targets.carbs} />
          <MacroBar label="Fat" current={totals.fat} target={targets.fat} />
        </Card>

        <Text style={styles.note}>
          {/* TODO: Sync with logged meals from database when tracking is implemented */}
          Based on today&apos;s generated meal plan
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: 20,
  },
  title: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 28,
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 20,
  },
  card: {
    marginBottom: 16,
  },
  note: {
    color: colors.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
  },
  muted: {
    color: colors.textMuted,
    padding: 24,
  },
});
