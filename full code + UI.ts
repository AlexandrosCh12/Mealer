import type { DayMealPlan, WeeklyIngredient } from './src/types/meal';

/**
 * Detect overlapping ingredients and calculate waste reduction
 */
export interface ZeroWasteInsight {
  reused_ingredients: string[];
  meals_using_ingredient: Map<string, string[]>;
  waste_reduction_percentage: number;
  message: string;
}

export const analyzeZeroWaste = (
  weeklyPlan: DayMealPlan[],
  ingredientsList: WeeklyIngredient[]
): ZeroWasteInsight => {
  // Find ingredients used in multiple meals
  const ingredientUsage: Map<string, string[]> = new Map();
  
  weeklyPlan.forEach(day => {
    day.meals.forEach(meal => {
      // Extract ingredient names from meal description (simplified)
      // In production, this would parse the actual ingredients
      const mealIngredients = extractIngredientsFromDescription(meal.description);
      mealIngredients.forEach(ing => {
        const key = ing.toLowerCase();
        const existing = ingredientUsage.get(key) || [];
        if (!existing.includes(meal.title)) {
          existing.push(meal.title);
          ingredientUsage.set(key, existing);
        }
      });
    });
  });
  
  // Find ingredients used in 2+ meals
  const reusedIngredients: string[] = [];
  const mealsUsingIngredient: Map<string, string[]> = new Map();
  
  ingredientUsage.forEach((meals, ingredient) => {
    if (meals.length >= 2) {
      reusedIngredients.push(ingredient);
      mealsUsingIngredient.set(ingredient, meals);
    }
  });
  
  // Calculate waste reduction (simplified)
  const totalIngredients = ingredientsList.length;
  const reusedCount = reusedIngredients.length;
  const wasteReduction = totalIngredients > 0 
    ? Math.round((reusedCount / totalIngredients) * 30) // Up to 30% reduction
    : 0;
  
  let message = '';
  if (reusedIngredients.length > 0) {
    const topReused = reusedIngredients.slice(0, 3).join(', ');
    message = `This week you reduced food waste by reusing ${topReused} across multiple meals.`;
  } else {
    message = 'Consider meal prep to reduce food waste by reusing ingredients.';
  }
  
  return {
    reused_ingredients: reusedIngredients,
    meals_using_ingredient: mealsUsingIngredient,
    waste_reduction_percentage: wasteReduction,
    message,
  };
};

/**
 * Extract ingredient names from meal description (simplified parser)
 */
function extractIngredientsFromDescription(description: string): string[] {
  // Common ingredients to look for
  const commonIngredients = [
    'chicken', 'rice', 'spinach', 'tomato', 'onion', 'garlic', 'olive oil',
    'broccoli', 'quinoa', 'salmon', 'eggs', 'banana', 'oatmeal', 'yogurt',
    'cheese', 'bread', 'pasta', 'lettuce', 'cucumber', 'carrot', 'potato',
    'beef', 'pork', 'turkey', 'fish', 'shrimp', 'tofu', 'beans', 'lentils',
  ];
  
  const found: string[] = [];
  const descLower = description.toLowerCase();
  
  commonIngredients.forEach(ing => {
    if (descLower.includes(ing)) {
      found.push(ing);
    }
  });
  
  return found;
}

