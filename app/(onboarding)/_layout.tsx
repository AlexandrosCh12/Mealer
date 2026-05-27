import { Stack } from 'expo-router';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { colors } from '@/constants/colors';

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      />
    </OnboardingProvider>
  );
}
