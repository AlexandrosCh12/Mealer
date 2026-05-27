import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SupermarketCard } from '@/components/SupermarketCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { rankSupermarkets } from '@/constants/supermarkets';
import { colors } from '@/constants/colors';
import { generateMealPlan } from '@/lib/mealGenerator';
import type { SupermarketSortPreference } from '@/types';

export default function ShoppingScreen() {
  const { profile } = useAuth();
  const [sortPreference, setSortPreference] =
    useState<SupermarketSortPreference>('cheapest');

  const ranked = useMemo(() => {
    if (!profile?.country) return [];
    return rankSupermarkets(profile.country, sortPreference);
  }, [profile?.country, sortPreference]);

  const shoppingList = useMemo(() => {
    if (!profile) return [];
    const plan = generateMealPlan(profile);
    const items = new Set<string>();
    plan.meals.forEach((m) => m.ingredients.forEach((i) => items.add(i)));
    return Array.from(items).sort();
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
        <Text style={styles.title}>Shopping</Text>
        <Text style={styles.subtitle}>
          Supermarkets in {profile.country}
          {/* TODO: Use expo-location + Google Places for real distances */}
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

        {ranked.length === 0 ? (
          <Card>
            <Text style={styles.empty}>
              No supermarkets found for {profile.country}. Update your country in
              profile.
            </Text>
          </Card>
        ) : (
          ranked.map((s, i) => (
            <SupermarketCard key={s.name} supermarket={s} rank={i + 1} />
          ))
        )}

        <Text style={styles.sectionTitle}>Shopping list</Text>
        <Card>
          {shoppingList.map((item) => (
            <View key={item} style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </Card>
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
  sectionTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 20,
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bullet: {
    color: colors.accent,
    marginRight: 8,
    fontSize: 16,
  },
  listText: {
    color: colors.text,
    fontSize: 15,
    flex: 1,
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
