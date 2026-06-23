/**
 * Shopping tab — store rankings, map, and weekly ingredient checklist.
 *
 * State: sort preference, selected store (drives price multiplier), ingredient
 * checkboxes persisted to AsyncStorage, map modal visibility.
 * Ingredient costs rebuild when store tier changes.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import SupermarketMapModal from '@/components/SupermarketMapModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import IngredientListItem from '@/components/IngredientListItem';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { rankSupermarkets } from '@/constants/supermarkets';
import { colors } from '@/constants/colors';
import {
  buildWeeklyIngredientList,
  getTotalCost,
  type IngredientItem,
} from '@/lib/ingredientList';
import type { WeeklyPlan } from '@/lib/weeklyMealPlan';
import type { RankedSupermarket, SupermarketSortPreference } from '@/types';

const WEEKLY_PLAN_KEY = 'current_weekly_plan';
const CHECKED_STATE_KEY = 'ingredient_checked_state';

function priceTierSymbol(tier: 1 | 2 | 3): { symbol: string; color: string } {
  switch (tier) {
    case 1:
      return { symbol: '€', color: colors.accentLight };
    case 2:
      return { symbol: '€€', color: colors.warning };
    case 3:
      return { symbol: '€€€', color: colors.error };
  }
}

function estimateCost(tier: 1 | 2 | 3, budgetWeeklyEur: number): number {
  return tier === 1 ? budgetWeeklyEur * 0.63 : budgetWeeklyEur * 0.78;
}

function getMultiplier(priceTier: number): number {
  if (priceTier === 1) return 1.0;
  if (priceTier === 2) return 1.22;
  return 1.45;
}

function tierCostColor(tier: 1 | 2 | 3): string {
  if (tier === 1) return '#4ade80';
  if (tier === 2) return '#f59e0b';
  return '#f87171';
}

function SelectedChip() {
  return (
    <View style={styles.selectedChip}>
      <Text style={styles.selectedChipText}>✓ Selected</Text>
    </View>
  );
}

function MapIconButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={styles.mapIconBtn}
    >
      <Text style={styles.mapIconText}>📍</Text>
    </Pressable>
  );
}

function TopStoreCard({
  supermarket,
  budgetWeeklyEur,
  selected,
  onSelect,
  onMapPress,
}: {
  supermarket: RankedSupermarket;
  budgetWeeklyEur: number;
  selected: boolean;
  onSelect: () => void;
  onMapPress: () => void;
}) {
  const estimatedCost = estimateCost(supermarket.priceTier, budgetWeeklyEur);
  const savings = Math.round(budgetWeeklyEur - estimatedCost);
  const tier = priceTierSymbol(supermarket.priceTier);

  return (
    <Pressable
      onPress={onSelect}
      style={({ pressed }) => [
        styles.topStoreCard,
        selected && styles.selectedCard,
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
      ]}
    >
      <View style={styles.storeRow}>
        <View style={styles.rankBadgeTop}>
          <Text style={styles.rankTextTop}>#1</Text>
        </View>
        <View style={styles.storeInfo}>
          <View style={styles.storeNameRow}>
            <Text style={styles.storeName}>{supermarket.name}</Text>
            {selected ? (
              <View style={styles.checkBadge}>
                <Text style={styles.checkBadgeText}>✓</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.storeDistance}>
            {supermarket.estimatedDistanceKm.toFixed(1)} km away
          </Text>
          {selected ? <SelectedChip /> : null}
        </View>
        <View style={styles.storeRight}>
          <Text style={[styles.priceTier, { color: tier.color }]}>{tier.symbol}</Text>
          <Text style={styles.estCost}>~€{Math.round(estimatedCost)}/wk</Text>
        </View>
        <MapIconButton onPress={onMapPress} />
      </View>
      <View style={styles.insightRow}>
        <Text style={styles.insightText}>
          Best match · saves ~€{savings} vs your budget
        </Text>
      </View>
    </Pressable>
  );
}

function StoreCard({
  supermarket,
  rank,
  budgetWeeklyEur,
  selected,
  onSelect,
  onMapPress,
}: {
  supermarket: RankedSupermarket;
  rank: number;
  budgetWeeklyEur: number;
  selected: boolean;
  onSelect: () => void;
  onMapPress: () => void;
}) {
  const estimatedCost = estimateCost(supermarket.priceTier, budgetWeeklyEur);
  const tier = priceTierSymbol(supermarket.priceTier);

  return (
    <Pressable
      onPress={onSelect}
      style={({ pressed }) => [
        styles.storeCard,
        selected && styles.selectedCard,
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
      ]}
    >
      <View style={styles.storeRow}>
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>#{rank}</Text>
        </View>
        <View style={styles.storeInfo}>
          <View style={styles.storeNameRow}>
            <Text style={styles.storeName}>{supermarket.name}</Text>
            {selected ? (
              <View style={styles.checkBadge}>
                <Text style={styles.checkBadgeText}>✓</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.storeDistance}>
            {supermarket.estimatedDistanceKm.toFixed(1)} km away
          </Text>
          {selected ? <SelectedChip /> : null}
        </View>
        <View style={styles.storeRight}>
          <Text style={[styles.priceTier, { color: tier.color }]}>{tier.symbol}</Text>
          <Text style={styles.estCost}>~€{Math.round(estimatedCost)}/wk</Text>
        </View>
        <MapIconButton onPress={onMapPress} />
      </View>
    </Pressable>
  );
}

/** Shopping screen with ranked stores and interactive grocery list. */
export default function ShoppingScreen() {
  const { profile } = useAuth();
  const [sortPreference, setSortPreference] =
    useState<SupermarketSortPreference>('cheapest');
  const [ingredientItems, setIngredientItems] = useState<IngredientItem[]>([]);
  const [mapVisible, setMapVisible] = useState(false);
  const [selectedStore, setSelectedStore] = useState('');
  const [selectedStoreName, setSelectedStoreName] = useState<string>('');
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [planLoaded, setPlanLoaded] = useState(false);
  const checkedMapRef = useRef<Record<string, boolean>>({});
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  const rankedStores = useMemo(() => {
    if (!profile?.country) return [];
    return rankSupermarkets(profile.country, sortPreference);
  }, [profile?.country, sortPreference]);

  const selectedStoreData = useMemo(
    () => rankedStores.find((s) => s.name === selectedStoreName) ?? null,
    [rankedStores, selectedStoreName]
  );

  const totalCost = useMemo(
    () => getTotalCost(ingredientItems),
    [ingredientItems]
  );

  const checkedCost = useMemo(
    () =>
      ingredientItems
        .filter((item) => item.checked)
        .reduce((sum, item) => sum + item.estimatedCost, 0),
    [ingredientItems]
  );

  const checkedCount = useMemo(
    () => ingredientItems.filter((item) => item.checked).length,
    [ingredientItems]
  );

  const totalCount = ingredientItems.length;
  const progressRatio = totalCount > 0 ? checkedCount / totalCount : 0;

  const persistCheckedState = useCallback(async (items: IngredientItem[]) => {
    const checkedMap: Record<string, boolean> = {};
    for (const item of items) {
      if (item.checked) checkedMap[item.id] = true;
    }
    await AsyncStorage.setItem(CHECKED_STATE_KEY, JSON.stringify(checkedMap));
  }, []);

  function handleStorePress(storeName: string) {
    setSelectedStore(storeName);
    setMapVisible(true);
  }

  const toggleIngredient = useCallback(
    (id: string) => {
      setIngredientItems((prev) => {
        const next = prev.map((item) =>
          item.id === id ? { ...item, checked: !item.checked } : item
        );
        const checkedMap: Record<string, boolean> = {};
        for (const item of next) {
          if (item.checked) checkedMap[item.id] = true;
        }
        checkedMapRef.current = checkedMap;
        void persistCheckedState(next);
        return next;
      });
    },
    [persistCheckedState]
  );

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

  useEffect(() => {
    if (!profile) return;

    async function loadStoredPlan() {
      const checkedRaw = await AsyncStorage.getItem(CHECKED_STATE_KEY);
      if (checkedRaw) {
        try {
          checkedMapRef.current = JSON.parse(checkedRaw) as Record<string, boolean>;
        } catch {
          checkedMapRef.current = {};
        }
      }

      const stored = await AsyncStorage.getItem(WEEKLY_PLAN_KEY);
      if (!stored) {
        setWeeklyPlan(null);
        setPlanLoaded(true);
        return;
      }
      try {
        setWeeklyPlan(JSON.parse(stored) as WeeklyPlan);
      } catch {
        setWeeklyPlan(null);
      }
      setPlanLoaded(true);
    }

    void loadStoredPlan();
  }, [profile]);

  // Auto-select the #1 ranked store by default on load
  useEffect(() => {
    if (rankedStores.length > 0 && !selectedStoreName) {
      setSelectedStoreName(rankedStores[0].name);
    }
  }, [rankedStores, selectedStoreName]);

  // Rebuild the ingredient list whenever the selected store changes
  useEffect(() => {
    if (!weeklyPlan || !profile) return;
    const store = rankedStores.find((s) => s.name === selectedStoreName);
    const multiplier = store ? getMultiplier(store.priceTier) : 1.0;
    const items = buildWeeklyIngredientList(
      weeklyPlan,
      profile.budget_weekly_eur ?? 60,
      multiplier
    );
    const checkedMap = checkedMapRef.current;
    setIngredientItems(
      items.map((item) => ({
        ...item,
        checked: checkedMap[item.id] ?? false,
      }))
    );
  }, [selectedStoreName, weeklyPlan, profile, rankedStores]);

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

  if (!weeklyPlan) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[...colors.backgroundGradient]}
          locations={[...colors.gradientLocations]}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.muted}>
          Open the Home tab first to load your weekly shopping list.
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
          <Text style={styles.title}>Shopping</Text>
          <Text style={styles.subtitle}>
            {profile.city} · €{profile.budget_weekly_eur}/week
          </Text>

          <View style={styles.sortRow}>
            <Button
              title="Cheapest"
              variant={sortPreference === 'cheapest' ? 'primary' : 'secondary'}
              onPress={() => setSortPreference('cheapest')}
              style={styles.sortBtn}
            />
            <Button
              title="Closest"
              variant={sortPreference === 'closest' ? 'primary' : 'secondary'}
              onPress={() => setSortPreference('closest')}
              style={styles.sortBtn}
            />
          </View>

          <Text style={styles.sectionLabel}>BEST STORES FOR YOU</Text>
          <Text style={styles.storeTapHint}>
            Tap a store to set it for pricing · tap 📍 for the map
          </Text>

          {rankedStores.length === 0 ? (
            <Card>
              <Text style={styles.empty}>
                No supermarkets found for {profile.country}. Update your country in
                profile.
              </Text>
            </Card>
          ) : (
            <>
              <TopStoreCard
                supermarket={rankedStores[0]}
                budgetWeeklyEur={profile.budget_weekly_eur}
                selected={rankedStores[0].name === selectedStoreName}
                onSelect={() => setSelectedStoreName(rankedStores[0].name)}
                onMapPress={() => handleStorePress(rankedStores[0].name)}
              />
              {rankedStores.slice(1).map((s, i) => (
                <StoreCard
                  key={s.name}
                  supermarket={s}
                  rank={i + 2}
                  budgetWeeklyEur={profile.budget_weekly_eur}
                  selected={s.name === selectedStoreName}
                  onSelect={() => setSelectedStoreName(s.name)}
                  onMapPress={() => handleStorePress(s.name)}
                />
              ))}
            </>
          )}

          <View style={styles.listHeader}>
            <Text style={styles.listSectionLabel}>WEEKLY SHOPPING LIST</Text>
            <Text
              style={[
                styles.listCostText,
                selectedStoreData
                  ? { color: tierCostColor(selectedStoreData.priceTier) }
                  : null,
              ]}
            >
              €{checkedCost.toFixed(2)} / €{totalCost.toFixed(2)}
            </Text>
          </View>

          {selectedStoreName ? (
            <Text style={styles.shoppingForText}>
              Shopping list for {selectedStoreName}
            </Text>
          ) : null}

          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${progressRatio * 100}%` }]}
            />
          </View>

          <View style={styles.ingredientCard}>
            {ingredientItems.map((item) => (
              <IngredientListItem
                key={item.id}
                item={item}
                onToggle={toggleIngredient}
              />
            ))}
          </View>
        </ScrollView>
      </Animated.View>

      <SupermarketMapModal
        visible={mapVisible}
        onClose={() => setMapVisible(false)}
        supermarketName={selectedStore}
        city={profile?.city ?? 'Thessaloniki'}
        country={profile?.country ?? 'Greece'}
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
  sortRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  sortBtn: {
    flex: 1,
    minHeight: 44,
    paddingVertical: 10,
  },
  sectionLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 8,
    color: colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  storeTapHint: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 11,
    marginBottom: 10,
    marginTop: -4,
  },
  topStoreCard: {
    backgroundColor: colors.accentTint,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.25)',
    borderRadius: 16,
    padding: 13,
    marginBottom: 7,
  },
  storeCard: {
    backgroundColor: colors.surfacePlain,
    borderWidth: 1,
    borderColor: colors.surfacePlainBorder,
    borderRadius: 14,
    padding: 13,
    marginBottom: 7,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedCard: {
    borderColor: 'rgba(139,92,246,0.4)',
  },
  storeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4ade80',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadgeText: {
    color: '#0a0a0a',
    fontSize: 10,
    fontWeight: '700',
  },
  selectedChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(139,92,246,0.15)',
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 7,
    marginTop: 4,
  },
  selectedChipText: {
    color: '#a78bfa',
    fontSize: 9,
  },
  mapIconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(139,92,246,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.2)',
    marginLeft: 10,
  },
  mapIconText: {
    fontSize: 14,
  },
  shoppingForText: {
    color: colors.accentLight,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  rankBadgeTop: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankTextTop: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfacePlain,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 14,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  storeDistance: {
    color: colors.textMuted,
    fontSize: 10,
  },
  storeRight: {
    alignItems: 'flex-end',
  },
  priceTier: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  estCost: {
    color: colors.textMuted,
    fontSize: 9,
  },
  insightRow: {
    backgroundColor: 'rgba(139,92,246,0.1)',
    borderRadius: 7,
    paddingVertical: 5,
    paddingHorizontal: 9,
    marginTop: 8,
  },
  insightText: {
    color: colors.accentLight,
    fontSize: 10,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 10,
  },
  listSectionLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 8,
    color: colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  listCostText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: colors.accentLight,
    fontWeight: '500',
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 2,
  },
  ingredientCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  empty: {
    color: colors.textMuted,
    fontSize: 14,
  },
  muted: {
    color: colors.textMuted,
    padding: 24,
  },
});
