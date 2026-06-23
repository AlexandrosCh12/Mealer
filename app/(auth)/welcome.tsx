/**
 * Auth welcome / landing screen.
 *
 * First screen for unauthenticated users. Offers paths to signup or login.
 * No local state — purely navigational.
 */
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';

/** Welcome landing with Get Started and Login actions. */
export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[...colors.backgroundGradient]}
        locations={[...colors.gradientLocations]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <View style={styles.logoWrap}>
          <Text style={styles.logo}>Mealer</Text>
          <Text style={styles.tagline}>Smart meal plans for your goals</Text>
        </View>
        <View style={styles.actions}>
          <Link href="/(auth)/signup" asChild>
            <Pressable style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Get Started</Text>
            </Pressable>
          </Link>
          <Link href="/(auth)/login" asChild>
            <Pressable style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>Login</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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
    fontWeight: '600',
    color: colors.accent,
    marginBottom: 12,
  },
  tagline: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.accentBorder,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 16,
    fontWeight: '600',
    color: colors.accentLight,
  },
});
