import type { Allergy, DietType, Meal, MealSlot } from '@/types';

export const MEAL_TEMPLATES: Meal[] = [
  {
    id: 'b1',
    name: 'Greek Yogurt & Berries',
    slot: 'breakfast',
    ingredients: ['Greek yogurt', 'mixed berries', 'honey'],
    macros: { calories: 320, protein: 22, carbs: 38, fat: 8 },
    dietTypes: ['omnivore', 'vegetarian', 'mediterranean'],
    excludesAllergies: ['gluten', 'nuts'],
  },
  {
    id: 'b2',
    name: 'Oatmeal with Banana',
    slot: 'breakfast',
    ingredients: ['oats', 'banana', 'almond milk'],
    macros: { calories: 380, protein: 12, carbs: 68, fat: 7 },
    dietTypes: ['omnivore', 'vegetarian', 'vegan', 'mediterranean'],
    excludesAllergies: ['dairy', 'eggs', 'gluten'],
  },
  {
    id: 'b3',
    name: 'Scrambled Eggs & Toast',
    slot: 'breakfast',
    ingredients: ['eggs', 'whole wheat bread', 'spinach'],
    macros: { calories: 420, protein: 28, carbs: 32, fat: 18 },
    dietTypes: ['omnivore', 'mediterranean'],
    excludesAllergies: ['dairy', 'nuts'],
  },
  {
    id: 'b4',
    name: 'Keto Avocado Eggs',
    slot: 'breakfast',
    ingredients: ['eggs', 'avocado', 'olive oil'],
    macros: { calories: 450, protein: 24, carbs: 6, fat: 38 },
    dietTypes: ['omnivore', 'keto'],
    excludesAllergies: ['gluten', 'dairy', 'nuts'],
  },
  {
    id: 'l1',
    name: 'Grilled Chicken Salad',
    slot: 'lunch',
    ingredients: ['chicken breast', 'lettuce', 'tomato', 'olive oil'],
    macros: { calories: 480, protein: 42, carbs: 18, fat: 26 },
    dietTypes: ['omnivore', 'keto', 'mediterranean'],
    excludesAllergies: ['gluten', 'dairy', 'nuts', 'eggs'],
  },
  {
    id: 'l2',
    name: 'Lentil Soup & Bread',
    slot: 'lunch',
    ingredients: ['lentils', 'carrots', 'celery', 'bread'],
    macros: { calories: 520, protein: 22, carbs: 78, fat: 10 },
    dietTypes: ['omnivore', 'vegetarian', 'vegan', 'mediterranean'],
    excludesAllergies: ['dairy', 'nuts', 'eggs'],
  },
  {
    id: 'l3',
    name: 'Tofu Buddha Bowl',
    slot: 'lunch',
    ingredients: ['tofu', 'brown rice', 'broccoli', 'sesame'],
    macros: { calories: 540, protein: 28, carbs: 62, fat: 18 },
    dietTypes: ['vegetarian', 'vegan'],
    excludesAllergies: ['dairy', 'eggs', 'gluten'],
  },
  {
    id: 'l4',
    name: 'Salmon & Quinoa',
    slot: 'lunch',
    ingredients: ['salmon', 'quinoa', 'asparagus'],
    macros: { calories: 580, protein: 38, carbs: 42, fat: 28 },
    dietTypes: ['omnivore', 'mediterranean'],
    excludesAllergies: ['gluten', 'dairy', 'nuts', 'eggs'],
  },
  {
    id: 'd1',
    name: 'Turkey Stir-Fry',
    slot: 'dinner',
    ingredients: ['turkey', 'peppers', 'rice noodles'],
    macros: { calories: 520, protein: 36, carbs: 58, fat: 14 },
    dietTypes: ['omnivore'],
    excludesAllergies: ['dairy', 'nuts', 'eggs'],
  },
  {
    id: 'd2',
    name: 'Mediterranean Chickpea Bowl',
    slot: 'dinner',
    ingredients: ['chickpeas', 'cucumber', 'feta', 'olive oil'],
    macros: { calories: 490, protein: 18, carbs: 52, fat: 22 },
    dietTypes: ['omnivore', 'vegetarian', 'mediterranean'],
    excludesAllergies: ['gluten', 'nuts', 'eggs'],
  },
  {
    id: 'd3',
    name: 'Zucchini Noodles & Pesto',
    slot: 'dinner',
    ingredients: ['zucchini', 'basil pesto', 'cherry tomatoes'],
    macros: { calories: 380, protein: 12, carbs: 24, fat: 28 },
    dietTypes: ['vegetarian', 'keto', 'mediterranean'],
    excludesAllergies: ['gluten', 'dairy', 'eggs'],
  },
  {
    id: 'd4',
    name: 'Beef & Sweet Potato',
    slot: 'dinner',
    ingredients: ['lean beef', 'sweet potato', 'green beans'],
    macros: { calories: 620, protein: 44, carbs: 48, fat: 26 },
    dietTypes: ['omnivore', 'keto'],
    excludesAllergies: ['gluten', 'dairy', 'nuts', 'eggs'],
  },
  {
    id: 's1',
    name: 'Apple & Almond Butter',
    slot: 'snack',
    ingredients: ['apple', 'almond butter'],
    macros: { calories: 220, protein: 6, carbs: 28, fat: 12 },
    dietTypes: ['omnivore', 'vegetarian', 'vegan', 'mediterranean'],
    excludesAllergies: ['gluten', 'dairy', 'eggs'],
  },
  {
    id: 's2',
    name: 'Protein Shake',
    slot: 'snack',
    ingredients: ['whey protein', 'banana', 'milk'],
    macros: { calories: 280, protein: 32, carbs: 30, fat: 4 },
    dietTypes: ['omnivore'],
    excludesAllergies: ['gluten', 'nuts', 'eggs'],
  },
  {
    id: 's3',
    name: 'Hummus & Carrots',
    slot: 'snack',
    ingredients: ['hummus', 'carrot sticks'],
    macros: { calories: 180, protein: 6, carbs: 22, fat: 8 },
    dietTypes: ['omnivore', 'vegetarian', 'vegan', 'mediterranean', 'keto'],
    excludesAllergies: ['gluten', 'dairy', 'eggs', 'nuts'],
  },
  {
    id: 's4',
    name: 'Cheese & Crackers',
    slot: 'snack',
    ingredients: ['cheddar', 'crackers'],
    macros: { calories: 240, protein: 10, carbs: 18, fat: 14 },
    dietTypes: ['omnivore', 'vegetarian', 'mediterranean'],
    excludesAllergies: ['nuts', 'eggs', 'gluten'],
  },
];

export function filterTemplates(
  dietType: DietType,
  allergies: string[]
): Meal[] {
  const activeAllergies = (allergies ?? []).filter((a) => a !== 'none');

  return MEAL_TEMPLATES.filter((meal) => {
    if (!meal.dietTypes.includes(dietType)) return false;
    if (activeAllergies.length === 0) return true;
    return !activeAllergies.some((allergy) =>
      meal.excludesAllergies.includes(allergy as Allergy)
    );
  });
}

export function pickMealForSlot(
  pool: Meal[],
  slot: MealSlot,
  excludeIds: string[] = []
): Meal | null {
  const candidates = pool.filter(
    (m) => m.slot === slot && !excludeIds.includes(m.id)
  );
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}
