import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { colors } from '@/constants/colors';
import type { Meal } from '@/types';

interface Props {
  visible: boolean;
  onClose: () => void;
  meals: Meal[];
  eatenIds: string[];
  onMealPress: (meal: Meal) => void;
}

const { height } = Dimensions.get('window');

export default function DayPlanModal({
  visible,
  onClose,
  meals,
  eatenIds,
  onMealPress,
}: Props) {
  const slideAnim = React.useRef(new Animated.Value(height)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 280,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
      animationType="none"
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
      >
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>Today&apos;s full plan</Text>
          <Text style={styles.subtitle}>
            {meals.length} meals ·{' '}
            {meals.reduce((s, m) => s + m.macros.calories, 0)} kcal
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {meals.map((meal, i) => {
            const eaten = eatenIds.includes(meal.id);
            const slotColors =
              colors.slots[meal.slot as keyof typeof colors.slots] ??
              colors.slots.snack;

            return (
              <Pressable
                key={meal.id + i}
                onPress={() => onMealPress(meal)}
                style={({ pressed }) => [
                  styles.mealCard,
                  eaten && styles.mealCardEaten,
                  pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] },
                ]}
              >
                <View style={styles.mealRow}>
                  <View style={styles.mealLeft}>
                    <View
                      style={[
                        styles.slotPill,
                        {
                          backgroundColor: slotColors.bg,
                          borderColor: slotColors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[styles.slotText, { color: slotColors.text }]}
                      >
                        {meal.slot.charAt(0).toUpperCase() + meal.slot.slice(1)}
                      </Text>
                    </View>
                    <Text
                      style={[styles.mealName, eaten && styles.mealNameEaten]}
                    >
                      {meal.name}
                    </Text>
                    <Text style={styles.mealMacros}>
                      P{meal.macros.protein} · C{meal.macros.carbs} · F
                      {meal.macros.fat}
                    </Text>
                  </View>
                  <View style={styles.mealRight}>
                    {eaten ? <Text style={styles.eatenCheck}>✓</Text> : null}
                    <Text
                      style={[styles.mealKcal, eaten && styles.mealKcalEaten]}
                    >
                      {meal.macros.calories}
                    </Text>
                    <Text style={styles.mealKcalLbl}>kcal</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        <Pressable style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#110d1f',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.2)',
    maxHeight: '85%',
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(96,165,250,0.1)',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: 3,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  mealCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  mealCardEaten: {
    backgroundColor: 'rgba(74,222,128,0.04)',
    borderColor: 'rgba(74,222,128,0.15)',
  },
  mealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  mealLeft: {
    flex: 1,
  },
  slotPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 6,
  },
  slotText: {
    fontSize: 9,
    fontWeight: '600',
  },
  mealName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 3,
  },
  mealNameEaten: {
    color: 'rgba(255,255,255,0.5)',
    textDecorationLine: 'line-through',
  },
  mealMacros: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
  },
  mealRight: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  eatenCheck: {
    color: '#4ade80',
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '700',
  },
  mealKcal: {
    color: '#a78bfa',
    fontSize: 16,
    fontWeight: '600',
  },
  mealKcalEaten: {
    color: 'rgba(167,139,250,0.5)',
  },
  mealKcalLbl: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 9,
  },
  closeButton: {
    margin: 16,
    marginTop: 8,
    backgroundColor: 'rgba(96,165,250,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.2)',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#60a5fa',
    fontSize: 15,
    fontWeight: '600',
  },
});
