import React from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import type { IngredientItem } from '@/lib/ingredientList';

interface Props {
  item: IngredientItem;
  onToggle: (id: string) => void;
}

export default function IngredientListItem({ item, onToggle }: Props) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  function handlePress() {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 200,
        friction: 10,
      }),
    ]).start();
    onToggle(item.id);
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable style={styles.row} onPress={handlePress}>
        <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
          {item.checked ? <Text style={styles.checkmark}>✓</Text> : null}
        </View>
        <Text style={[styles.name, item.checked && styles.nameChecked]}>
          {item.name}
        </Text>
        <Text style={[styles.cost, item.checked && styles.costChecked]}>
          €{item.estimatedCost.toFixed(2)}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(139,92,246,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  name: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
  },
  nameChecked: {
    color: 'rgba(255,255,255,0.3)',
    textDecorationLine: 'line-through',
  },
  cost: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
    fontWeight: '500',
  },
  costChecked: {
    color: 'rgba(255,255,255,0.15)',
  },
});
