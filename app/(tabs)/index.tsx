import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MealCard } from '@/components/MealCard';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/constants/colors';
import { generateMealPlan, swapMeal } from '@/lib/mealGenerator';
import { supabase } from '@/lib/supabase';
import type { Meal, MealSlot } from '@/types';

export default function HomeScreen() {
  const { profile } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [targetCalories, setTargetCalories] = useState(0);
  const [actualCalories, setActualCalories] = useState(0);
  const [swappingSlot, setSwappingSlot] = useState<MealSlot | null>(null);

  const loadPlan = useCallback(() => {
    if (!profile) return;
    const plan = generateMealPlan(profile);
    setMeals(plan.meals);
    setTargetCalories(plan.targetCalories);
    setActualCalories(plan.actualCalories);
  }, [profile]);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  useEffect(() => {
    if (!profile || meals.length === 0) return;

    const today = new Date().toISOString().split('T')[0];
    // TODO: Fetch existing meal_plans from Supabase instead of always regenerating locally
    void supabase.from('meal_plans').upsert(
      {
        user_id: profile.id,
        date: today,
        meals,
      },
      { onConflict: 'user_id,date' }
    );
  }, [profile, meals]);

  async function handleSwap(slot: MealSlot) {
    if (!profile) return;
    setSwappingSlot(slot);
    const replacement = swapMeal(profile, meals, slot);
    if (replacement) {
      setMeals((prev) => prev.map((m) => (m.slot === slot ? replacement : m)));
      setActualCalories((prev) => {
        const old = meals.find((m) => m.slot === slot);
        if (!old) return prev;
        return prev - old.macros.calories + replacement.macros.calories;
      });
    }
    setSwappingSlot(null);
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.muted}>Loading profile…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.greeting}>Today&apos;s plan</Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Calories</Text>
          <Text style={styles.summaryValue}>
            {actualCalories}{' '}
            <Text style={styles.summaryTarget}>/ {targetCalories} kcal</Text>
          </Text>
        </View>

        {meals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            onSwap={() => handleSwap(meal.slot)}
            swapping={swappingSlot === meal.slot}
          />
        ))}
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
    paddingBottom: 32,
  },
  greeting: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 28,
    color: colors.text,
    marginBottom: 4,
  },
  date: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 4,
  },
  summaryValue: {
    color: colors.accent,
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
  },
  summaryTarget: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '400',
  },
  muted: {
    color: colors.textMuted,
    padding: 24,
  },
});
