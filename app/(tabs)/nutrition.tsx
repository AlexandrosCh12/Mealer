/**
 * Nutrition tab — macro rings and logged meals for today.
 *
 * State: todayMeals and eatenIds from AsyncStorage (synced when Home marks eaten).
 * Macro targets derive from calorie target via 30/45/25 protein/carbs/fat split.
 * MacroRing sub-component staggers ring animations with delay prop.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import MealDetailModal from '@/components/MealDetailModal';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/constants/colors';
import { calculateDailyCalorieTarget } from '@/lib/calories';
import { getTodayPlan, type WeeklyPlan } from '@/lib/weeklyMealPlan';
import type { Meal } from '@/types';

const EATEN_IDS_KEY = 'eaten_ids_';
const WEEKLY_PLAN_KEY = 'current_weekly_plan';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RING_SIZE = 62;
const RING_RADIUS = 23;
const RING_CENTER = 31;
const RING_CIRCUMFERENCE = 145;

interface MacroRingProps {
  color: string;
  progress: number;
  label: string;
  current: number;
  target: number;
  delay: number;
}

/** Animated SVG ring showing progress toward one macro target. */
function MacroRing({
  color,
  progress,
  label,
  current,
  target,
  delay,
}: MacroRingProps) {
  const ringAnim = useRef(new Animated.Value(0)).current;
  const percent = Math.round(progress * 100);

  useEffect(() => {
    ringAnim.setValue(0);
    Animated.timing(ringAnim, {
      toValue: 1,
      duration: 900,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [ringAnim, progress, delay]);

  const animatedDash = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, progress * RING_CIRCUMFERENCE],
  });

  return (
    <View style={styles.macroRingWrapper}>
      <View style={styles.macroRingSvgWrap}>
        <Svg width={RING_SIZE} height={RING_SIZE}>
          <Circle
            cx={RING_CENTER}
            cy={RING_CENTER}
            r={RING_RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={6}
          />
          <AnimatedCircle
            cx={RING_CENTER}
            cy={RING_CENTER}
            r={RING_RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={[animatedDash, RING_CIRCUMFERENCE]}
            transform={`rotate(-90 ${RING_CENTER} ${RING_CENTER})`}
          />
        </Svg>
        <Text style={styles.ringPercentText}>{percent}%</Text>
      </View>
      <Text style={[styles.ringLabel, { color }]}>{label}</Text>
      <Text style={styles.ringAmount}>
        {current}g / {target}g
      </Text>
    </View>
  );
}

function formatSlot(slot: string): string {
  return slot.charAt(0).toUpperCase() + slot.slice(1);
}

function formatTodayDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function isValidWeeklyPlan(obj: unknown): obj is WeeklyPlan {
  return (
    !!obj &&
    typeof obj === 'object' &&
    typeof (obj as WeeklyPlan).weekStart === 'string' &&
    Array.isArray((obj as WeeklyPlan).days) &&
    (obj as WeeklyPlan).days.every(
      (d) => typeof d.date === 'string' && Array.isArray(d.meals)
    )
  );
}

function isValidEatenIds(obj: unknown): obj is string[] {
  return Array.isArray(obj) && obj.every((id) => typeof id === 'string');
}

/** Nutrition summary screen with macro rings and eaten-meal log. */
export default function NutritionScreen() {
  const { profile } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;
  const [todayMeals, setTodayMeals] = useState<Meal[]>([]);
  const [eatenIds, setEatenIds] = useState<string[]>([]);
  const [planLoaded, setPlanLoaded] = useState(false);
  const [planMissing, setPlanMissing] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const loadData = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];

    const eatenKey = EATEN_IDS_KEY + today;
    const eatenStored = await AsyncStorage.getItem(eatenKey);
    if (eatenStored) {
      try {
        const parsed = JSON.parse(eatenStored);
        if (isValidEatenIds(parsed)) {
          setEatenIds(parsed);
        } else {
          await AsyncStorage.removeItem(eatenKey);
          setEatenIds([]);
        }
      } catch {
        await AsyncStorage.removeItem(eatenKey);
        setEatenIds([]);
      }
    } else {
      setEatenIds([]);
    }

    const planStored = await AsyncStorage.getItem(WEEKLY_PLAN_KEY);
    if (planStored) {
      try {
        const weeklyPlan = JSON.parse(planStored);
        if (!isValidWeeklyPlan(weeklyPlan)) {
          await AsyncStorage.removeItem(WEEKLY_PLAN_KEY);
          setTodayMeals([]);
          setPlanMissing(true);
          setPlanLoaded(true);
          return;
        }
        const todayPlan = getTodayPlan(weeklyPlan);
        if (todayPlan && todayPlan.meals.length > 0) {
          setTodayMeals(todayPlan.meals);
          setPlanMissing(false);
          setPlanLoaded(true);
          return;
        }
      } catch {
        await AsyncStorage.removeItem(WEEKLY_PLAN_KEY);
      }
    }
    setTodayMeals([]);
    setPlanMissing(true);
    setPlanLoaded(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData])
  );

  const { totals, targets, eatenMeals } = useMemo(() => {
    if (!profile) {
      return {
        totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        targets: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        eatenMeals: [] as Meal[],
      };
    }
    const eatenMeals = todayMeals.filter((m) => eatenIds.includes(m.id));
    const totals = eatenMeals.reduce(
      (acc, m) => ({
        calories: acc.calories + m.macros.calories,
        protein: acc.protein + m.macros.protein,
        carbs: acc.carbs + m.macros.carbs,
        fat: acc.fat + m.macros.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
    const calTarget = calculateDailyCalorieTarget(profile);
    // Standard macro split: 30% protein, 45% carbs, 25% fat (4/4/9 kcal per g).
    const proteinTarget = Math.round((calTarget * 0.3) / 4);
    const carbsTarget = Math.round((calTarget * 0.45) / 4);
    const fatTarget = Math.round((calTarget * 0.25) / 9);
    return {
      totals,
      targets: {
        calories: calTarget,
        protein: proteinTarget,
        carbs: carbsTarget,
        fat: fatTarget,
      },
      eatenMeals,
    };
  }, [profile, todayMeals, eatenIds]);

  const calorieProgress =
    targets.calories > 0
      ? Math.min(totals.calories / targets.calories, 1)
      : 0;

  const proteinProgress =
    targets.protein > 0 ? Math.min(totals.protein / targets.protein, 1) : 0;
  const carbsProgress =
    targets.carbs > 0 ? Math.min(totals.carbs / targets.carbs, 1) : 0;
  const fatProgress =
    targets.fat > 0 ? Math.min(totals.fat / targets.fat, 1) : 0;

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[...colors.backgroundGradient]}
          locations={[...colors.gradientLocations]}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.muted}>Loading…</Text>
      </SafeAreaView>
    );
  }

  if (!planLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[...colors.backgroundGradient]}
          locations={[...colors.gradientLocations]}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.muted}>Loading…</Text>
      </SafeAreaView>
    );
  }

  if (planMissing) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[...colors.backgroundGradient]}
          locations={[...colors.gradientLocations]}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.muted}>
          Open the Home tab first to generate your plan.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[...colors.backgroundGradient]}
        locations={[...colors.gradientLocations]}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          flex: 1,
        }}
      >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Nutrition</Text>
        <Text style={styles.subtitle}>{formatTodayDate()}</Text>

        <View style={styles.mainCard}>
          <View style={styles.ringsRow}>
            <MacroRing
              color={colors.protein}
              progress={proteinProgress}
              label="Protein"
              current={totals.protein}
              target={targets.protein}
              delay={0}
            />
            <MacroRing
              color={colors.carbs}
              progress={carbsProgress}
              label="Carbs"
              current={totals.carbs}
              target={targets.carbs}
              delay={150}
            />
            <MacroRing
              color={colors.fat}
              progress={fatProgress}
              label="Fat"
              current={totals.fat}
              target={targets.fat}
              delay={300}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.calorieRow}>
            <Text style={styles.calorieLabel}>Total calories</Text>
            <Text style={styles.calorieValues}>
              <Text style={styles.calorieEaten}>{totals.calories}</Text>
              <Text style={styles.calorieTarget}>
                {' '}
                / {targets.calories}
              </Text>
            </Text>
          </View>
          <View style={styles.thinProgressTrack}>
            <View
              style={[
                styles.thinProgressFill,
                { width: `${calorieProgress * 100}%` },
              ]}
            />
          </View>
        </View>

        <Text style={styles.mealsLoggedLabel}>EATEN TODAY</Text>
        {eatenMeals.length === 0 ? (
          <Text style={styles.emptyState}>
            Nothing logged yet. Mark meals as eaten on Home to see your nutrition
            progress.
          </Text>
        ) : (
          eatenMeals.map((meal) => (
            <Pressable
              key={meal.id}
              onPress={() => {
                setSelectedMeal(meal);
                setModalVisible(true);
              }}
              style={({ pressed }) => [
                styles.mealLogCard,
                pressed && { opacity: 0.8, transform: [{ scale: 0.99 }] },
              ]}
            >
              <View style={styles.mealRowLeft}>
                <Text style={styles.mealRowName}>{meal.name}</Text>
                <Text style={styles.mealRowSlot}>{formatSlot(meal.slot)}</Text>
              </View>
              <View style={styles.mealRowRight}>
                <Text style={styles.mealRowKcal}>
                  {meal.macros.calories} kcal
                </Text>
                <Text style={styles.mealRowMacros}>
                  P{meal.macros.protein} · C{meal.macros.carbs} · F
                  {meal.macros.fat}
                </Text>
              </View>
              <Text style={styles.mealLogChevron}>›</Text>
            </Pressable>
          ))
        )}
      </ScrollView>
      </Animated.View>

      <MealDetailModal
        meal={selectedMeal}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scroll: {
    padding: 20,
    paddingBottom: 32,
  },
  title: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 16,
  },
  mainCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 16,
  },
  ringsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 14,
  },
  macroRingWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  macroRingSvgWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPercentText: {
    position: 'absolute',
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  ringLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 3,
    textAlign: 'center',
  },
  ringAmount: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 1,
    textAlign: 'center',
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    marginVertical: 10,
  },
  calorieRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calorieLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    color: colors.textSecondary,
  },
  calorieValues: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  calorieEaten: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  calorieTarget: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: colors.textMuted,
  },
  thinProgressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  thinProgressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  mealsLoggedLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 8,
    color: colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  mealLogCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfacePlain,
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: colors.surfacePlainBorder,
    marginBottom: 6,
  },
  mealLogChevron: {
    color: 'rgba(139,92,246,0.4)',
    fontSize: 20,
    marginLeft: 8,
  },
  mealRowLeft: {
    flex: 1,
    marginRight: 12,
  },
  mealRowName: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  mealRowSlot: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  mealRowRight: {
    alignItems: 'flex-end',
  },
  mealRowKcal: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    fontWeight: '500',
    color: colors.accentLight,
    marginBottom: 2,
  },
  mealRowMacros: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 9,
    color: colors.textMuted,
  },
  muted: {
    color: colors.textMuted,
    padding: 24,
  },
  emptyState: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    padding: 24,
  },
});
