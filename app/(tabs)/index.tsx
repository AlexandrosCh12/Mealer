import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import MealDetailModal from '@/components/MealDetailModal';
import NotificationsPanel, {
  MOCK_NOTIFICATIONS,
  type Notification,
} from '@/components/NotificationsPanel';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/constants/colors';
import { getDailyQuote } from '@/constants/motivationQuotes';
import { swapMeal } from '@/lib/mealGenerator';
import { loadOrGenerateWeeklyPlan } from '@/lib/mealPlanStorage';
import { getTodayPlan, type DayPlan, type WeeklyPlan } from '@/lib/weeklyMealPlan';
import type { Meal, MealSlot } from '@/types';

const WEEKLY_PLAN_KEY = 'current_weekly_plan';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SLOT_ORDER: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack'];
const RING_SIZE = 76;
const RING_RADIUS = 30;
const RING_CIRCUMFERENCE = 188;
const RING_CENTER = 38;

function sortMealsBySlot(meals: Meal[]): Meal[] {
  return [...meals].sort(
    (a, b) => SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot)
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getDisplayName(profile: { display_name?: string | null; email?: string | null } | null): string {
  let name = 'there';
  if (profile?.display_name?.trim()) {
    name = profile.display_name.trim();
  } else if (profile?.email) {
    name = profile.email.split('@')[0];
  }
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function formatSlot(slot: MealSlot): string {
  return slot.charAt(0).toUpperCase() + slot.slice(1);
}

export default function HomeScreen() {
  const { profile } = useAuth();
  const router = useRouter();
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [todayPlan, setTodayPlan] = useState<DayPlan | null>(null);
  const [swappingSlot, setSwappingSlot] = useState<MealSlot | null>(null);
  const [eatenIds, setEatenIds] = useState<string[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState<string[]>([]);
  const ringAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  const dailyQuote = useMemo(() => getDailyQuote(), []);

  const notifications = useMemo(
    () =>
      MOCK_NOTIFICATIONS.map((n) => ({
        ...n,
        read: n.read || readNotifIds.includes(n.id),
      })),
    [readNotifIds]
  );
  const unreadCount = notifications.filter((n) => !n.read).length;

  function handleNotificationPress(notif: Notification) {
    setReadNotifIds((prev) =>
      prev.includes(notif.id) ? prev : [...prev, notif.id]
    );
    setNotificationsVisible(false);
    if (notif.type === 'plan') {
      // already on home, just close panel
    } else if (notif.type === 'water') {
      // close panel, could show water tracker in future
    } else if (notif.type === 'streak') {
      router.push('/(tabs)/profile');
    } else if (notif.type === 'motivation') {
      // close panel, quote is already visible on home screen
    }
  }

  const persistWeeklyPlan = useCallback(async (plan: WeeklyPlan) => {
    await AsyncStorage.setItem(WEEKLY_PLAN_KEY, JSON.stringify(plan));
  }, []);

  const updateTodayMeals = useCallback(
    (newMeals: Meal[]) => {
      if (!weeklyPlan || !todayPlan) return;
      const sorted = sortMealsBySlot(newMeals);
      const actualCalories = sorted.reduce((sum, m) => sum + m.macros.calories, 0);
      const updatedDay: DayPlan = { ...todayPlan, meals: sorted, actualCalories };
      const updatedPlan: WeeklyPlan = {
        ...weeklyPlan,
        days: weeklyPlan.days.map((d) =>
          d.date === todayPlan.date ? updatedDay : d
        ),
      };
      setWeeklyPlan(updatedPlan);
      setTodayPlan(updatedDay);
      void persistWeeklyPlan(updatedPlan);
    },
    [weeklyPlan, todayPlan, persistWeeklyPlan]
  );

  const loadPlan = useCallback(async () => {
    if (!profile) return;
    const plan = await loadOrGenerateWeeklyPlan(profile.id, profile);
    const today = getTodayPlan(plan);
    setWeeklyPlan(plan);
    setTodayPlan(today);
    await persistWeeklyPlan(plan);
  }, [profile, persistWeeklyPlan]);

  useEffect(() => {
    void loadPlan();
  }, [loadPlan]);

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

  const sortedMeals = useMemo(
    () => (todayPlan ? sortMealsBySlot(todayPlan.meals) : []),
    [todayPlan]
  );
  const targetCalories = todayPlan?.targetCalories ?? 0;

  const eatenCalories = useMemo(
    () =>
      sortedMeals
        .filter((m) => eatenIds.includes(m.id))
        .reduce((sum, m) => sum + m.macros.calories, 0),
    [sortedMeals, eatenIds]
  );

  const calorieProgress =
    targetCalories > 0 ? Math.min(eatenCalories / targetCalories, 1) : 0;
  const caloriePercent =
    targetCalories > 0
      ? Math.min(100, Math.round((eatenCalories / targetCalories) * 100))
      : 0;
  const remainingCalories = Math.max(targetCalories - eatenCalories, 0);

  const currentMeal = sortedMeals.find((m) => !eatenIds.includes(m.id));
  const allEaten = sortedMeals.length > 0 && !currentMeal;
  const uneatenMeals = sortedMeals.filter((m) => !eatenIds.includes(m.id));
  const stillToGoMeals = uneatenMeals.filter((m) => m.id !== currentMeal?.id);

  const ringTarget =
    targetCalories > 0
      ? (eatenCalories / targetCalories) * RING_CIRCUMFERENCE
      : 0;

  useEffect(() => {
    Animated.timing(ringAnim, {
      toValue: ringTarget,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [ringAnim, ringTarget]);

  async function handleSwap(slot: MealSlot) {
    if (!profile || !todayPlan) return;
    setSwappingSlot(slot);
    const replacement = swapMeal(profile, todayPlan.meals, slot);
    if (replacement) {
      updateTodayMeals(
        todayPlan.meals.map((m) => (m.slot === slot ? replacement : m))
      );
    }
    setSwappingSlot(null);
  }

  function handleMarkEaten() {
    if (allEaten) {
      router.push('/(tabs)/nutrition');
      return;
    }
    if (!currentMeal) return;
    setEatenIds((prev) => [...prev, currentMeal.id]);
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[...colors.backgroundGradient]}
          locations={[...colors.gradientLocations]}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.muted}>Loading profile…</Text>
      </SafeAreaView>
    );
  }

  const displayName = getDisplayName(profile);

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
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greetingLabel}>{getGreeting()}</Text>
              <Text style={styles.displayName}>{displayName}</Text>
            </View>
            <Pressable
              style={styles.bellContainer}
              onPress={() => setNotificationsVisible(true)}
            >
              <Ionicons name="notifications-outline" size={15} color={colors.accentLight} />
              {unreadCount > 0 ? <View style={styles.bellBadge} /> : null}
            </Pressable>
          </View>

          <View style={styles.mainCard}>
            <View style={styles.statsRow}>
              <View style={styles.ringContainer}>
                <Svg width={RING_SIZE} height={RING_SIZE}>
                  <Circle
                    cx={36}
                    cy={36}
                    r={RING_RADIUS}
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth={7}
                  />
                  <AnimatedCircle
                    cx={36}
                    cy={36}
                    r={RING_RADIUS}
                    fill="none"
                    stroke={colors.accent}
                    strokeWidth={7}
                    strokeLinecap="round"
                    strokeDasharray={[ringAnim, RING_CIRCUMFERENCE]}
                    transform={`rotate(-90 ${RING_CENTER} ${RING_CENTER})`}
                  />
                </Svg>
                <View style={styles.ringCenter}>
                  <Text style={styles.ringPercent}>{caloriePercent}%</Text>
                  <Text style={styles.ringKcal}>kcal</Text>
                </View>
              </View>

              <View style={styles.intakeInfo}>
                <Text style={styles.intakeLabel}>Today&apos;s intake</Text>
                <Text style={styles.intakeValue}>{eatenCalories}</Text>
                <Text style={styles.remainingText}>
                  {remainingCalories} kcal remaining
                </Text>
                <View style={styles.thinProgressTrack}>
                  <View
                    style={[
                      styles.thinProgressFill,
                      { width: `${calorieProgress * 100}%` },
                    ]}
                  />
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionMicroLabel}>UP NEXT</Text>

            <View style={styles.nextMealRow}>
              <View style={styles.nextMealLeft}>
                {currentMeal ? (
                  <>
                    <View
                      style={[
                        styles.slotPill,
                        {
                          backgroundColor: colors.slots[currentMeal.slot].bg,
                          borderColor: colors.slots[currentMeal.slot].border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.slotPillText,
                          { color: colors.slots[currentMeal.slot].text },
                        ]}
                      >
                        {formatSlot(currentMeal.slot)}
                      </Text>
                    </View>
                    <Pressable
                      style={styles.mealDetailPressable}
                      onPress={() => {
                        setSelectedMeal(currentMeal);
                        setModalVisible(true);
                      }}
                    >
                      <View style={styles.mealDetailContent}>
                        <Text style={styles.mealName}>{currentMeal.name}</Text>
                        <Text style={styles.ingredientsText} numberOfLines={2}>
                          {currentMeal.ingredients.join(', ')}
                        </Text>
                      </View>
                      <Text style={styles.rowChevron}>›</Text>
                    </Pressable>
                  </>
                ) : (
                  <>
                    <Text style={styles.mealName}>
                      You&apos;re all done for today!
                    </Text>
                    <Text style={styles.ingredientsText}>
                      Great job hitting your goals
                    </Text>
                  </>
                )}
              </View>
              {currentMeal ? (
                <AnimatedButton
                  style={styles.swapBtn}
                  onPress={() => handleSwap(currentMeal.slot)}
                  disabled={swappingSlot === currentMeal.slot}
                >
                  <Text style={styles.swapBtnText}>
                    {swappingSlot === currentMeal.slot ? '…' : 'Swap'}
                  </Text>
                </AnimatedButton>
              ) : null}
            </View>

            {currentMeal ? (
              <View style={styles.macroChipsRow}>
                <View style={styles.macroChip}>
                  <Text style={[styles.macroChipValue, { color: colors.protein }]}>
                    {currentMeal.macros.protein}g
                  </Text>
                  <Text style={styles.macroChipLabel}>Protein</Text>
                </View>
                <View style={styles.macroChip}>
                  <Text style={[styles.macroChipValue, { color: colors.carbs }]}>
                    {currentMeal.macros.carbs}g
                  </Text>
                  <Text style={styles.macroChipLabel}>Carbs</Text>
                </View>
                <View style={styles.macroChip}>
                  <Text style={[styles.macroChipValue, { color: colors.fat }]}>
                    {currentMeal.macros.fat}g
                  </Text>
                  <Text style={styles.macroChipLabel}>Fat</Text>
                </View>
              </View>
            ) : null}

            <AnimatedButton style={styles.markEatenBtn} onPress={handleMarkEaten}>
              <Text style={styles.markEatenBtnText}>
                {allEaten ? 'See full nutrition →' : 'Mark as eaten'}
              </Text>
            </AnimatedButton>
          </View>

          {!allEaten && stillToGoMeals.length > 0 ? (
            <View style={styles.stillToGoSection}>
              <Text style={styles.stillToGoLabel}>STILL TO GO</Text>
              {stillToGoMeals.map((meal) => {
                const slotColors = colors.slots[meal.slot];
                return (
                  <Pressable
                    key={meal.id}
                    style={styles.stillToGoRow}
                    onPress={() => {
                      setSelectedMeal(meal);
                      setModalVisible(true);
                    }}
                  >
                    <View style={styles.stillToGoLeft}>
                      <View
                        style={[
                          styles.slotPillSmall,
                          {
                            backgroundColor: slotColors.bg,
                            borderColor: slotColors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[styles.slotPillTextSmall, { color: slotColors.text }]}
                        >
                          {formatSlot(meal.slot)}
                        </Text>
                      </View>
                      <Text style={styles.stillToGoName}>{meal.name}</Text>
                    </View>
                    <View style={styles.stillToGoRight}>
                      <Text style={styles.stillToGoKcal}>
                        {meal.macros.calories} kcal
                      </Text>
                      <Text style={styles.rowChevron}>›</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          <View style={styles.quoteCard}>
            <Text style={styles.quoteMark}>❝</Text>
            <Text style={styles.quoteText}>{dailyQuote.quote}</Text>
            <Text style={styles.quoteAuthor}>— {dailyQuote.author}</Text>
          </View>
        </ScrollView>
      </Animated.View>

      <View style={styles.notificationsOverlay}>
        <NotificationsPanel
          visible={notificationsVisible}
          onClose={() => setNotificationsVisible(false)}
          notifications={notifications}
          onMarkRead={(id) =>
            setReadNotifIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
          }
          onNotificationPress={handleNotificationPress}
        />
      </View>

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
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 0,
  },
  greetingLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  displayName: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.4,
    color: colors.text,
  },
  bellContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(139,92,246,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 1,
    borderColor: '#110d1f',
  },
  notificationsOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    pointerEvents: 'box-none',
  },
  mainCard: {
    marginTop: 12,
    marginHorizontal: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 20,
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 12,
  },
  ringContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    position: 'relative',
  },
  ringCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPercent: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  ringKcal: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 7,
    color: colors.textMuted,
    marginTop: 1,
  },
  intakeInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  intakeLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 9,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  intakeValue: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.5,
    color: colors.accentLight,
    marginBottom: 2,
  },
  remainingText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 8,
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
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    marginVertical: 10,
  },
  sectionMicroLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 8,
    color: colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  nextMealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nextMealLeft: {
    flex: 1,
    marginRight: 10,
  },
  mealDetailPressable: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealDetailContent: {
    flex: 1,
  },
  rowChevron: {
    fontSize: 18,
    color: 'rgba(139,92,246,0.4)',
    marginLeft: 6,
  },
  slotPill: {
    alignSelf: 'flex-start',
    fontSize: 8,
    paddingVertical: 2,
    paddingHorizontal: 9,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 5,
  },
  slotPillText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 8,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  mealName: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: -0.2,
    color: colors.text,
  },
  ingredientsText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 14,
  },
  swapBtn: {
    backgroundColor: colors.accentTint,
    borderWidth: 1,
    borderColor: colors.accentBorder,
    borderRadius: 9,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  swapBtnText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 9,
    color: colors.accentLight,
  },
  macroChipsRow: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 8,
    marginBottom: 10,
  },
  macroChip: {
    flex: 1,
    backgroundColor: colors.surfacePlain,
    borderWidth: 1,
    borderColor: colors.surfacePlainBorder,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  macroChipValue: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  macroChipLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 8,
    color: colors.textMuted,
    marginTop: 1,
    textAlign: 'center',
  },
  markEatenBtn: {
    backgroundColor: colors.accent,
    borderRadius: 11,
    paddingVertical: 10,
    marginTop: 2,
  },
  markEatenBtnText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  stillToGoSection: {
    marginTop: 0,
  },
  stillToGoLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 8,
    color: colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 10,
    marginBottom: 6,
    marginHorizontal: 14,
  },
  stillToGoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfacePlain,
    borderWidth: 1,
    borderColor: colors.surfacePlainBorder,
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 13,
    marginBottom: 6,
    marginHorizontal: 14,
  },
  stillToGoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  slotPillSmall: {
    paddingVertical: 2,
    paddingHorizontal: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  slotPillTextSmall: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 8,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  stillToGoName: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: colors.text,
    flexShrink: 1,
  },
  stillToGoRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stillToGoKcal: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    color: colors.textMuted,
  },
  quoteCard: {
    marginHorizontal: 14,
    marginTop: 8,
    backgroundColor: 'rgba(139,92,246,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.12)',
    borderRadius: 16,
    padding: 14,
  },
  quoteMark: {
    color: colors.accent,
    fontSize: 22,
    lineHeight: 22,
    marginBottom: 4,
  },
  quoteText: {
    color: colors.text,
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 20,
    fontFamily: 'DMSans_400Regular',
  },
  quoteAuthor: {
    color: colors.accentLight,
    fontSize: 11,
    marginTop: 6,
    fontFamily: 'DMSans_400Regular',
  },
  muted: {
    color: colors.textMuted,
    padding: 24,
  },
});
