import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { colors } from '@/constants/colors';
import { upsertProfile } from '@/lib/profile';
import type {
  ActivityLevel,
  Allergy,
  DietType,
  Goal,
} from '@/types';

const GOAL_OPTIONS: { value: Goal; label: string }[] = [
  { value: 'lose_weight', label: 'Lose weight' },
  { value: 'gain_muscle', label: 'Gain muscle' },
  { value: 'maintain', label: 'Maintain' },
];

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string }[] = [
  { value: 'sedentary', label: 'Sedentary' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'active', label: 'Active' },
];

const DIET_OPTIONS: { value: DietType; label: string }[] = [
  { value: 'omnivore', label: 'Omnivore' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'keto', label: 'Keto' },
  { value: 'mediterranean', label: 'Mediterranean' },
];

const ALLERGY_OPTIONS: { value: Allergy; label: string }[] = [
  { value: 'gluten', label: 'Gluten' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'nuts', label: 'Nuts' },
  { value: 'eggs', label: 'Eggs' },
  { value: 'none', label: 'None' },
];

const COUNTRY_OPTIONS = ['Greece', 'UK', 'Germany'];

export default function OnboardingScreen() {
  const router = useRouter();
  const { session, refreshProfile } = useAuth();
  const { data, step, totalSteps, update, next, back } = useOnboarding();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const progress = step / totalSteps;

  function canContinue(): boolean {
    switch (step) {
      case 1:
        return data.goal !== null;
      case 2:
        return data.gender !== null && data.gender.length > 0;
      case 3:
        return data.age !== null && data.age > 0;
      case 4:
        return data.weight_kg !== null && data.weight_kg > 0;
      case 5:
        return data.height_cm !== null && data.height_cm > 0;
      case 6:
        return data.activity_level !== null;
      case 7:
        return data.diet_type !== null;
      case 8:
        return data.allergies.length > 0;
      case 9:
        return data.budget_weekly_eur !== null && data.budget_weekly_eur > 0;
      case 10:
        return data.country !== null && data.country.length > 0;
      case 11:
        return data.city !== null && data.city.trim().length > 0;
      default:
        return false;
    }
  }

  async function handleFinish() {
    if (!session?.user.id) return;
    setSaving(true);
    setError(null);
    const { error: saveError } = await upsertProfile(session.user.id, data);
    setSaving(false);
    if (saveError) {
      setError(saveError);
      return;
    }
    await refreshProfile();
    router.replace('/(tabs)');
  }

  function handleNext() {
    if (step < totalSteps) {
      next();
    } else {
      void handleFinish();
    }
  }

  function toggleAllergy(allergy: Allergy) {
    if (allergy === 'none') {
      update({ allergies: ['none'] });
      return;
    }
    const withoutNone = data.allergies.filter((a) => a !== 'none');
    if (withoutNone.includes(allergy)) {
      update({ allergies: withoutNone.filter((a) => a !== allergy) });
    } else {
      update({ allergies: [...withoutNone, allergy] });
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>
          Step {step} of {totalSteps}
        </Text>
        <ProgressBar progress={progress} height={4} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {step === 1 && (
          <StepShell title="What is your goal?" subtitle="We'll tailor your meal plan">
            {GOAL_OPTIONS.map((opt) => (
              <OptionButton
                key={opt.value}
                label={opt.label}
                selected={data.goal === opt.value}
                onPress={() => update({ goal: opt.value })}
              />
            ))}
          </StepShell>
        )}

        {step === 2 && (
          <StepShell title="Gender" subtitle="Used for calorie calculations">
            {GENDER_OPTIONS.map((g) => (
              <OptionButton
                key={g}
                label={g}
                selected={data.gender === g}
                onPress={() => update({ gender: g })}
              />
            ))}
          </StepShell>
        )}

        {step === 3 && (
          <StepShell title="Age" subtitle="How old are you?">
            <NumericInput
              value={data.age}
              onChange={(n) => update({ age: n })}
              placeholder="e.g. 28"
            />
          </StepShell>
        )}

        {step === 4 && (
          <StepShell title="Weight" subtitle="In kilograms">
            <NumericInput
              value={data.weight_kg}
              onChange={(n) => update({ weight_kg: n })}
              placeholder="e.g. 75"
              decimal
            />
          </StepShell>
        )}

        {step === 5 && (
          <StepShell title="Height" subtitle="In centimeters">
            <NumericInput
              value={data.height_cm}
              onChange={(n) => update({ height_cm: n })}
              placeholder="e.g. 175"
            />
          </StepShell>
        )}

        {step === 6 && (
          <StepShell title="Activity level" subtitle="How active is your lifestyle?">
            {ACTIVITY_OPTIONS.map((opt) => (
              <OptionButton
                key={opt.value}
                label={opt.label}
                selected={data.activity_level === opt.value}
                onPress={() => update({ activity_level: opt.value })}
              />
            ))}
          </StepShell>
        )}

        {step === 7 && (
          <StepShell title="Diet type" subtitle="Choose your eating style">
            {DIET_OPTIONS.map((opt) => (
              <OptionButton
                key={opt.value}
                label={opt.label}
                selected={data.diet_type === opt.value}
                onPress={() => update({ diet_type: opt.value })}
              />
            ))}
          </StepShell>
        )}

        {step === 8 && (
          <StepShell title="Any allergies?" subtitle="Select all that apply">
            {ALLERGY_OPTIONS.map((opt) => (
              <OptionButton
                key={opt.value}
                label={opt.label}
                selected={data.allergies.includes(opt.value)}
                onPress={() => toggleAllergy(opt.value)}
              />
            ))}
          </StepShell>
        )}

        {step === 9 && (
          <StepShell title="Weekly grocery budget" subtitle="In euros (€)">
            <NumericInput
              value={data.budget_weekly_eur}
              onChange={(n) => update({ budget_weekly_eur: n })}
              placeholder="e.g. 60"
              decimal
            />
          </StepShell>
        )}

        {step === 10 && (
          <StepShell title="Country" subtitle="For supermarket recommendations">
            {COUNTRY_OPTIONS.map((c) => (
              <OptionButton
                key={c}
                label={c}
                selected={data.country === c}
                onPress={() => update({ country: c })}
              />
            ))}
          </StepShell>
        )}

        {step === 11 && (
          <StepShell title="City" subtitle="Where do you shop?">
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Athens"
              placeholderTextColor={colors.textMuted}
              value={data.city ?? ''}
              onChangeText={(t) => update({ city: t })}
            />
          </StepShell>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 ? (
          <Button title="Back" variant="ghost" onPress={back} style={styles.backBtn} />
        ) : (
          <View style={styles.backBtn} />
        )}
        <Button
          title={step === totalSteps ? 'Finish' : 'Continue'}
          onPress={handleNext}
          disabled={!canContinue()}
          loading={saving}
          style={styles.continueBtn}
        />
      </View>
    </SafeAreaView>
  );
}

function StepShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.options}>{children}</View>
    </View>
  );
}

function OptionButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.option, selected && styles.optionSelected]}
      onPress={onPress}
    >
      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

function NumericInput({
  value,
  onChange,
  placeholder,
  decimal = false,
}: {
  value: number | null;
  onChange: (n: number | null) => void;
  placeholder: string;
  decimal?: boolean;
}) {
  return (
    <TextInput
      style={styles.textInput}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      keyboardType={decimal ? 'decimal-pad' : 'number-pad'}
      value={value !== null ? String(value) : ''}
      onChangeText={(t) => {
        if (t === '') {
          onChange(null);
          return;
        }
        const parsed = decimal ? parseFloat(t) : parseInt(t, 10);
        if (!Number.isNaN(parsed)) onChange(parsed);
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
  },
  stepLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontFamily: 'DMSans_500Medium',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  title: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 26,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: 24,
  },
  options: {
    gap: 10,
  },
  option: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceElevated,
  },
  optionText: {
    color: colors.text,
    fontSize: 16,
    fontFamily: 'DMSans_500Medium',
  },
  optionTextSelected: {
    color: colors.accent,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: colors.text,
    fontSize: 18,
    fontFamily: 'DMSans_400Regular',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 12,
    alignItems: 'center',
  },
  backBtn: {
    flex: 0.35,
  },
  continueBtn: {
    flex: 1,
  },
  error: {
    color: colors.error,
    marginTop: 16,
    fontSize: 14,
  },
});
