/**
 * Bottom sheet modal showing full meal details (macros, ingredients, steps).
 *
 * Slides up from the bottom using Animated.spring on open and timing on close.
 * Renders nothing when meal is null. Slot pill color comes from colors.slots.
 */
import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { colors } from '@/constants/colors';
import type { Meal } from '@/types';

interface Props {
  meal: Meal | null;
  visible: boolean;
  onClose: () => void;
}

const { height } = Dimensions.get('window');

/** Meal detail bottom sheet — ingredients, macros, optional cooking steps. */
export default function MealDetailModal({ meal, visible, onClose }: Props) {
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

  if (!meal) return null;

  const slotColors =
    colors.slots[meal.slot as keyof typeof colors.slots] ?? colors.slots.snack;

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
      animationType="none"
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.backdropInner} />
      </Pressable>

      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
      >
        <View style={styles.handle} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View
            style={[
              styles.slotPill,
              {
                backgroundColor: slotColors.bg,
                borderColor: slotColors.border,
              },
            ]}
          >
            <Text style={[styles.slotText, { color: slotColors.text }]}>
              {meal.slot.charAt(0).toUpperCase() + meal.slot.slice(1)}
            </Text>
          </View>
          <Text style={styles.mealName}>{meal.name}</Text>

          <View style={styles.macroRow}>
            <View style={styles.macroBox}>
              <Text style={[styles.macroVal, { color: '#ffffff' }]}>
                {meal.macros.calories}
              </Text>
              <Text style={styles.macroLbl}>kcal</Text>
            </View>
            <View style={styles.macroBox}>
              <Text style={[styles.macroVal, { color: colors.protein }]}>
                {meal.macros.protein}g
              </Text>
              <Text style={styles.macroLbl}>protein</Text>
            </View>
            <View style={styles.macroBox}>
              <Text style={[styles.macroVal, { color: colors.carbs }]}>
                {meal.macros.carbs}g
              </Text>
              <Text style={styles.macroLbl}>carbs</Text>
            </View>
            <View style={styles.macroBox}>
              <Text style={[styles.macroVal, { color: colors.fat }]}>
                {meal.macros.fat}g
              </Text>
              <Text style={styles.macroLbl}>fat</Text>
            </View>
          </View>

          {meal.cookTime ? (
            <View style={styles.metaRow}>
              <View style={styles.metaChip}>
                <Text style={styles.metaText}>⏱ {meal.cookTime} min</Text>
              </View>
              {meal.difficulty ? (
                <View style={styles.metaChip}>
                  <Text style={styles.metaText}>
                    {meal.difficulty === 'Easy'
                      ? '🟢'
                      : meal.difficulty === 'Medium'
                        ? '🟡'
                        : '🔴'}{' '}
                    {meal.difficulty}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

          <Text style={styles.sectionLabel}>INGREDIENTS</Text>
          <View style={styles.ingredientsCard}>
            {meal.ingredients.map((ing, i) => (
              <View
                key={i}
                style={[
                  styles.ingRow,
                  i < meal.ingredients.length - 1 && styles.ingBorder,
                ]}
              >
                <View style={styles.ingDot} />
                <Text style={styles.ingText}>
                  {ing.charAt(0).toUpperCase() + ing.slice(1)}
                </Text>
              </View>
            ))}
          </View>

          {meal.cookingSteps && meal.cookingSteps.length > 0 ? (
            <>
              <Text style={styles.sectionLabel}>HOW TO MAKE IT</Text>
              <View style={styles.stepsCard}>
                {meal.cookingSteps.map((step, i) => (
                  <View
                    key={i}
                    style={[
                      styles.stepRow,
                      i < meal.cookingSteps!.length - 1 && styles.stepBorder,
                    ]}
                  >
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{i + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          <View style={styles.bottomSpacer} />
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
  },
  backdropInner: {
    flex: 1,
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
    borderColor: 'rgba(139,92,246,0.2)',
    maxHeight: '88%',
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
  scrollContent: {
    paddingHorizontal: 20,
  },
  slotPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 8,
  },
  slotText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  mealName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  macroRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  macroBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  macroVal: {
    fontSize: 16,
    fontWeight: '600',
  },
  macroLbl: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 9,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  metaChip: {
    backgroundColor: 'rgba(139,92,246,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.18)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  metaText: {
    color: '#a78bfa',
    fontSize: 12,
    fontWeight: '500',
  },
  sectionLabel: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 10,
    fontWeight: '600',
  },
  ingredientsCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  ingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
    gap: 10,
  },
  ingBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  ingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8b5cf6',
  },
  ingText: {
    color: '#ffffff',
    fontSize: 14,
  },
  stepsCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 13,
    paddingHorizontal: 14,
    gap: 12,
  },
  stepBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(139,92,246,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  stepNumberText: {
    color: '#a78bfa',
    fontSize: 11,
    fontWeight: '600',
  },
  stepText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 21,
    flex: 1,
  },
  bottomSpacer: {
    height: 32,
  },
  closeButton: {
    margin: 16,
    marginTop: 8,
    backgroundColor: 'rgba(139,92,246,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.2)',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#a78bfa',
    fontSize: 15,
    fontWeight: '600',
  },
});
