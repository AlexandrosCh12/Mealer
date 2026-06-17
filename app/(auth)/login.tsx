import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
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

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError(null);
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    router.replace('/');
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
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

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
            placeholder="Password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button title="Login" onPress={handleLogin} loading={loading} />

          <Link href="/(auth)/signup" asChild>
            <Pressable style={styles.linkWrap}>
              <Text style={styles.link}>
                No account? <Text style={styles.linkAccent}>Sign up</Text>
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
