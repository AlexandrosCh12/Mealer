import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/constants/colors';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const { session, profile } = useAuth();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await supabase.auth.signOut();
    setLoggingOut(false);
    router.replace('/(auth)/welcome');
  }

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
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.email}>{session?.user.email}</Text>

        <Card style={styles.card}>
          <ProfileRow label="Goal" value={formatGoal(profile.goal)} />
          <ProfileRow label="Diet" value={profile.diet_type} />
          <ProfileRow label="Activity" value={profile.activity_level} />
          <ProfileRow label="Age" value={String(profile.age)} />
          <ProfileRow label="Weight" value={`${profile.weight_kg} kg`} />
          <ProfileRow label="Height" value={`${profile.height_cm} cm`} />
          <ProfileRow
            label="Allergies"
            value={profile.allergies.join(', ')}
          />
          <ProfileRow
            label="Budget"
            value={`€${profile.budget_weekly_eur}/week`}
          />
          <ProfileRow label="Location" value={`${profile.city}, ${profile.country}`} />
        </Card>

        <Text style={styles.hint}>
          {/* TODO: Add edit preferences flow — navigate back to onboarding with pre-filled data */}
          To update preferences, re-run onboarding (coming soon).
        </Text>

        <Button
          title="Log out"
          variant="secondary"
          onPress={handleLogout}
          loading={loggingOut}
          style={styles.logoutBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function formatGoal(goal: string): string {
  return goal.replace(/_/g, ' ');
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
  email: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 20,
  },
  card: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: {
    color: colors.textMuted,
    fontSize: 14,
  },
  rowValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  hint: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 24,
  },
  logoutBtn: {
    marginTop: 8,
  },
  muted: {
    color: colors.textMuted,
    padding: 24,
  },
});
