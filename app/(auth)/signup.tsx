/**
 * Signup screen — creates auth user and initial profile row.
 *
 * State: firstName, email, password, error, loading.
 * Also upserts display_name into profiles so onboarding can skip re-entering name.
 */
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { supabase } from '@/lib/supabase';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const COMMON_PASSWORDS = [
  'password',
  'password1',
  '12345678',
  'qwerty123',
  '11111111',
  'letmein1',
  'admin123',
  'iloveyou',
];

function isCommonPassword(pw: string): boolean {
  return COMMON_PASSWORDS.includes(pw.toLowerCase());
}

/** Signup form screen. */
export default function SignupScreen() {
  const router = useRouter();
  const isProcessingRef = useRef(false);
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (isProcessingRef.current) return;
    setError(null);
    if (!isValidEmail(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (isCommonPassword(password)) {
      setError('This password is too common. Please choose a stronger one.');
      return;
    }
    isProcessingRef.current = true;
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (authError) {
        setError(authError.message);
        return;
      }
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: data.user.id,
          display_name: firstName.trim(),
        });
        if (profileError) {
          console.error('Failed to create profile:', profileError.message);
          setError('Account created but profile setup failed. Please try logging in.');
          return;
        }
      }
      router.replace('/');
    } finally {
      isProcessingRef.current = false;
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[...colors.backgroundGradient]}
        locations={[...colors.gradientLocations]}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.inner}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Start your personalized meal journey</Text>

          <TextInput
            style={styles.input}
            placeholder="First name"
            placeholderTextColor={colors.textMuted}
            value={firstName}
            onChangeText={setFirstName}
            maxLength={30}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password (at least 8 characters)"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button title="Sign Up" onPress={handleSignup} loading={loading} />

          <Link href="/(auth)/login" asChild>
            <Pressable style={styles.linkWrap}>
              <Text style={styles.link}>
                Already have an account? <Text style={styles.linkAccent}>Login</Text>
              </Text>
            </Pressable>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  flex: {
    flex: 1,
  },
  inner: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 28,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  input: {
    backgroundColor: colors.surfacePlain,
    borderWidth: 1,
    borderColor: colors.surfacePlainBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.text,
    fontSize: 16,
    marginBottom: 12,
    fontFamily: 'DMSans_400Regular',
  },
  error: {
    color: colors.error,
    marginBottom: 12,
    fontSize: 14,
  },
  linkWrap: {
    marginTop: 24,
    alignItems: 'center',
  },
  link: {
    color: colors.textMuted,
    fontSize: 14,
  },
  linkAccent: {
    color: colors.accentLight,
    fontWeight: '600',
  },
});
