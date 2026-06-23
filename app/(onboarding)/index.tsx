/**
 * 12-step onboarding wizard — collects profile data for meal personalization.
 *
 * State: step navigation via OnboardingContext, saving/error flags locally.
 * Step transitions use Animated parallel fade+slide. Finishing calls upsertProfile
 * then refreshProfile and navigates to main tabs.
 */
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AnimatedButton from '@/components/ui/AnimatedButton';
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
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const progress = step / totalSteps;

  /** Per-step validation — Continue stays disabled until the step is complete. */
  function canContinue(): boolean {
    switch (step) {
      case 1:
        return data.display_name.trim().length > 0;
      case 2:
        return data.goal !== null;
      case 3:
        return data.gender !== null && data.gender.length > 0;
      case 4:
        return data.age !== null && data.age >= 13 && data.age <= 120;
      case 5:
        return data.weight_kg !== null && data.weight_kg >= 20 && data.weight_kg <= 400;
      case 6:
        return data.height_cm !== null && data.height_cm >= 100 && data.height_cm <= 250;
      case 7:
        return data.activity_level !== null;
      case 8:
        return data.diet_type !== null;
      case 9:
        return data.allergies.length > 0;
      case 10:
        return data.budget_weekly_eur !== null && data.budget_weekly_eur >= 5 && data.budget_weekly_eur <= 1000;
      case 11:
        return data.country !== null && data.country.length > 0;
      case 12:
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

  /** Fade out, change step, then slide+fade in — gives directional step feel. */
  function animateStepChange(changeStep: () => void) {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -30,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      changeStep();
      slideAnim.setValue(30);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }

  function handleNext() {
    if (step < totalSteps) {
      animateStepChange(() => next());
    } else {
      void handleFinish();
    }
  }

  function handleBack() {
    animateStepChange(() => back());
  }

  /** "None" is exclusive; other allergies can be multi-selected. */
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
      <LinearGradient
        colors={[...colors.backgroundGradient]}
        locations={[...colors.gradientLocations]}
        style={StyleSheet.absoluteFill}
      />
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
        <Animated.View
          style={{
            opacity: opacityAnim,
            transform: [{ translateX: slideAnim }],
          }}
        >
          {step === 1 && (
            <StepShell title="What's your name?" subtitle="We'll use it to greet you">
              <TextInput
                style={styles.textInput}
                placeholder="Your first name"
                placeholderTextColor={colors.textMuted}
                value={data.display_name}
                onChangeText={(t) => update({ display_name: t })}
              />
            </StepShell>
          )}

          {step === 2 && (
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

          {step === 3 && (
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

          {step === 4 && (
            <StepShell title="Age" subtitle="How old are you?">
              <NumericInput
                value={data.age}
                onChange={(n) => update({ age: n })}
                placeholder="e.g. 28"
                min={13}
                max={120}
              />
              <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 6 }}>
                Must be between 13 and 120
              </Text>
            </StepShell>
          )}

          {step === 5 && (
            <StepShell title="Weight" subtitle="In kilograms">
              <NumericInput
                value={data.weight_kg}
                onChange={(n) => update({ weight_kg: n })}
                placeholder="e.g. 75"
                decimal
                min={20}
                max={400}
              />
              <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 6 }}>
                Must be between 20 and 400
              </Text>
            </StepShell>
          )}

          {step === 6 && (
            <StepShell title="Height" subtitle="In centimeters">
              <NumericInput
                value={data.height_cm}
                onChange={(n) => update({ height_cm: n })}
                placeholder="e.g. 175"
                min={100}
                max={250}
              />
              <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 6 }}>
                Must be between 100 and 250
              </Text>
            </StepShell>
          )}

          {step === 7 && (
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

          {step === 8 && (
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

          {step === 9 && (
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

          {step === 10 && (
            <StepShell title="Weekly grocery budget" subtitle="In euros (€)">
              <NumericInput
                value={data.budget_weekly_eur}
                onChange={(n) => update({ budget_weekly_eur: n })}
                placeholder="e.g. 60"
                decimal
                min={5}
                max={1000}
              />
              <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 6 }}>
                Must be between 5 and 1000
              </Text>
            </StepShell>
          )}

          {step === 11 && (
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

          {step === 12 && (
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
        </Animated.View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 ? (
          <AnimatedButton
            onPress={handleBack}
            style={[styles.footerBtn, styles.backBtn]}
          >
            <Text style={styles.backBtnText}>Back</Text>
          </AnimatedButton>
        ) : (
          <View style={styles.backBtn} />
        )}
        <AnimatedButton
          onPress={handleNext}
          disabled={!canContinue() || saving}
          style={[
            styles.footerBtn,
            styles.continueBtn,
            ...((!canContinue() || saving) ? [styles.continueBtnDisabled] : []),
          ]}
        >
          {saving ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.continueBtnText}>
              {step === totalSteps ? 'Finish' : 'Continue'}
            </Text>
          )}
        </AnimatedButton>
      </View>
    </SafeAreaView>
  );
}

/** Layout wrapper for each onboarding step's title and inputs. */
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

/** Selectable pill button for single- or multi-choice onboarding steps. */
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

/** Controlled numeric TextInput with optional decimal keyboard. */
function NumericInput({
  value,
  onChange,
  placeholder,
  decimal = false,
  min,
  max,
}: {
  value: number | null;
  onChange: (n: number | null) => void;
  placeholder: string;
  decimal?: boolean;
  min?: number;
  max?: number;
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
        if (Number.isNaN(parsed)) return;
        onChange(parsed);
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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
    borderRadius: 14,
    backgroundColor: colors.surfacePlain,
    borderWidth: 1,
    borderColor: colors.surfacePlainBorder,
  },
  optionSelected: {
    borderColor: colors.accentBorder,
    backgroundColor: colors.accentTint,
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
    backgroundColor: colors.surfacePlain,
    borderWidth: 1,
    borderColor: colors.surfacePlainBorder,
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
  footerBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  backBtn: {
    flex: 0.35,
    backgroundColor: 'transparent',
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accentLight,
  },
  continueBtn: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: colors.accent,
  },
  continueBtnDisabled: {
    opacity: 0.5,
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  error: {
    color: colors.error,
    marginTop: 16,
    fontSize: 14,
  },
});
