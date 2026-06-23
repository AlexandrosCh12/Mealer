/**
 * Pressable wrapper with spring scale feedback on press in/out.
 *
 * Used across Home, onboarding, and profile for primary actions.
 * Scales to 0.96 while pressed via useNativeDriver spring.
 */
import React from 'react';
import { Animated, Pressable, ViewStyle } from 'react-native';

interface Props {
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];
  children: React.ReactNode;
  disabled?: boolean;
}

/** Reusable button shell with press-in scale animation. */
export default function AnimatedButton({
  onPress,
  style,
  children,
  disabled,
}: Props) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  }

  function handlePressOut() {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={style}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
