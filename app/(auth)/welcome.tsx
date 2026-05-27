import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoWrap}>
          <Text style={styles.logo}>Mealer</Text>
          <Text style={styles.tagline}>Smart meal plans for your goals</Text>
        </View>
        <View style={styles.actions}>
          <Link href="/(auth)/signup" asChild>
            <Button title="Get Started" />
          </Link>
          <Link href="/(auth)/login" asChild>
            <Button title="Login" variant="secondary" style={styles.loginBtn} />
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 32,
  },
  logoWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 48,
    color: colors.accent,
    marginBottom: 12,
  },
  tagline: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
  },
  actions: {
    gap: 12,
  },
  loginBtn: {
    marginTop: 4,
  },
});
