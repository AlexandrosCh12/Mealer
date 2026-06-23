import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/constants/colors';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

const PROFILE_ROWS: {
  label: string;
  getValue: (profile: Profile) => string;
}[] = [
  { label: 'Goal', getValue: (p) => formatGoal(p.goal) },
  { label: 'Diet', getValue: (p) => p.diet_type ?? '' },
  { label: 'Activity', getValue: (p) => p.activity_level ?? '' },
  { label: 'Age', getValue: (p) => String(p.age) },
  { label: 'Weight', getValue: (p) => `${p.weight_kg} kg` },
  { label: 'Height', getValue: (p) => `${p.height_cm} cm` },
  { label: 'Allergies', getValue: (p) => p.allergies.join(', ') },
  { label: 'Budget', getValue: (p) => `€${p.budget_weekly_eur}/week` },
  { label: 'Location', getValue: (p) => `${p.city}, ${p.country}` },
];

export default function ProfileScreen() {
  const { session, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(profile?.display_name ?? '');
  const [saving, setSaving] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    setNameValue(profile?.display_name ?? '');
  }, [profile?.display_name]);

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

  async function handleSaveName() {
    if (!session?.user.id) return;
    setSaving(true);
    await supabase
      .from('profiles')
      .update({ display_name: nameValue.trim() })
      .eq('id', session.user.id);
    await refreshProfile();
    setEditingName(false);
    setSaving(false);
  }

  async function handleLogout() {
    setLoggingOut(true);
    await supabase.auth.signOut();
    setLoggingOut(false);
    router.replace('/(auth)/welcome');
  }

  async function handleReset() {
    Alert.alert(
      'Reset Profile',
      'This will clear your meal plan and setup answers. You will be asked to set up again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              const userId = session?.user.id;
              if (!userId) return;
              await supabase.from('meal_plans').delete().eq('user_id', userId);
              await AsyncStorage.removeItem('current_weekly_plan');
              const allKeys = await AsyncStorage.getAllKeys();
              const eatenKeys = allKeys.filter((k) => k.startsWith('eaten_ids_'));
              await AsyncStorage.multiRemove(eatenKeys);
              await supabase.from('profiles').update({
                goal: null,
                gender: null,
                age: null,
                weight_kg: null,
                height_cm: null,
                activity_level: null,
                diet_type: null,
                allergies: null,
                budget_weekly_eur: null,
                country: null,
                city: null,
              }).eq('id', userId);
              await refreshProfile();
              await AsyncStorage.clear();
              router.replace('/(onboarding)');
            } catch (e) {
              Alert.alert('Error', 'Something went wrong. Try again.');
            }
          },
        },
      ]
    );
  }

  async function handleDeleteAccount() {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const userId = session?.user.id;
              if (!userId) return;
              await supabase.from('meal_plans').delete().eq('user_id', userId);
              await supabase.from('profiles').delete().eq('id', userId);
              await supabase.rpc('delete_own_account');
              await AsyncStorage.clear();
              router.replace('/(auth)/welcome');
            } catch (e) {
              Alert.alert('Error', 'Something went wrong. Try again.');
            }
          },
        },
      ]
    );
  }

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
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.email}>{session?.user.email}</Text>

          <View style={styles.infoCard}>
            {editingName ? (
              <View style={styles.nameEditRow}>
                <TextInput
                  style={styles.nameInput}
                  value={nameValue}
                  onChangeText={setNameValue}
                  autoFocus
                />
                <Pressable
                  style={styles.nameSaveBtn}
                  onPress={() => void handleSaveName()}
                  disabled={saving}
                >
                  <Text style={styles.nameSaveBtnText}>{saving ? '…' : 'Save'}</Text>
                </Pressable>
                <Pressable
                  style={styles.nameCancelBtn}
                  onPress={() => {
                    setNameValue(profile.display_name ?? '');
                    setEditingName(false);
                  }}
                >
                  <Text style={styles.nameCancelBtnText}>Cancel</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.row} onPress={() => setEditingName(true)}>
                <Text style={styles.rowLabel}>Name</Text>
                <View style={styles.nameDisplayRow}>
                  <Text style={styles.rowValue}>
                    {profile.display_name?.trim() || 'Not set'}
                  </Text>
                  <Text style={styles.editIcon}>✎</Text>
                </View>
              </Pressable>
            )}
            {PROFILE_ROWS.map((row, index) => (
              <ProfileRow
                key={row.label}
                label={row.label}
                value={row.getValue(profile)}
                isLast={index === PROFILE_ROWS.length - 1}
              />
            ))}
          </View>

          <View style={styles.actions}>
            <AnimatedButton
              style={styles.logoutBtn}
              onPress={handleLogout}
              disabled={loggingOut}
            >
              <View style={styles.actionBtnInner}>
                <Text style={styles.logoutBtnText}>
                  {loggingOut ? 'Logging out…' : 'Log out'}
                </Text>
                <Ionicons name="log-out-outline" size={18} color={colors.textMuted} />
              </View>
            </AnimatedButton>

            <AnimatedButton style={styles.resetBtn} onPress={handleReset}>
              <View style={styles.actionBtnInner}>
                <Text style={styles.resetBtnText}>Reset Profile</Text>
                <Ionicons name="refresh-outline" size={18} color={colors.warning} />
              </View>
            </AnimatedButton>

            <AnimatedButton style={styles.deleteBtn} onPress={handleDeleteAccount}>
              <View style={styles.actionBtnInner}>
                <Text style={styles.deleteBtnText}>Delete Account</Text>
                <Ionicons name="trash-outline" size={18} color={colors.error} />
              </View>
            </AnimatedButton>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

function ProfileRow({
  label,
  value,
  isLast,
}: {
  label: string;
  value: string;
  isLast: boolean;
}) {
  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function formatGoal(goal: string | null): string {
  if (!goal) return 'Not set';
  return goal.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
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
  email: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 0,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
  },
  rowValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'DMSans_500Medium',
    textTransform: 'capitalize',
  },
  nameDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editIcon: {
    color: colors.textMuted,
    fontSize: 12,
  },
  nameEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    gap: 8,
  },
  nameInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: colors.text,
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
  },
  nameSaveBtn: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  nameSaveBtnText: {
    color: colors.text,
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
  },
  nameCancelBtn: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  nameCancelBtnText: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
  },
  actions: {
    marginTop: 12,
    gap: 8,
  },
  actionBtnInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  logoutBtn: {
    backgroundColor: colors.surfacePlain,
    borderWidth: 1,
    borderColor: colors.surfacePlainBorder,
    borderRadius: 12,
    padding: 14,
  },
  logoutBtnText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'DMSans_500Medium',
  },
  resetBtn: {
    backgroundColor: 'rgba(245,158,11,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.2)',
    borderRadius: 12,
    padding: 14,
  },
  resetBtnText: {
    color: colors.warning,
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'DMSans_500Medium',
  },
  deleteBtn: {
    backgroundColor: 'rgba(248,113,113,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.2)',
    borderRadius: 12,
    padding: 14,
  },
  deleteBtnText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'DMSans_500Medium',
  },
  muted: {
    color: colors.textMuted,
    padding: 24,
  },
});
