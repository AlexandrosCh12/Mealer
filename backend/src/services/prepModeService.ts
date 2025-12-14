import { DayMealPlan, PrepGroup, PrepModeResponse } from '../types';

/**
 * Generate prep mode groups for meal preparation
 */
export const generatePrepMode = (weeklyPlan: DayMealPlan[]): PrepModeResponse => {
  const prepGroups: PrepGroup[] = [];
  
  // Group meals by shared ingredients
  const ingredientToMeals: Map<string, string[]> = new Map();
  
  weeklyPlan.forEach(day => {
    day.meals.forEach(meal => {
      const ingredients = extractIngredientsFromMeal(meal);
      ingredients.forEach(ing => {
        const key = ing.toLowerCase();
        const existing = ingredientToMeals.get(key) || [];
        if (!existing.includes(meal.title)) {
          existing.push(meal.title);
          ingredientToMeals.set(key, existing);
        }
      });
    });
  });
  
  // Find ingredients used in 3+ meals (good for prep)
  const sharedIngredients: string[] = [];
  ingredientToMeals.forEach((meals, ingredient) => {
    if (meals.length >= 3) {
      sharedIngredients.push(ingredient);
    }
  });
  
  // Create prep groups
  if (sharedIngredients.length > 0) {
    // Group 1: Protein prep (chicken, beef, etc.)
    const proteins = sharedIngredients.filter(ing => 
      ['chicken', 'beef', 'turkey', 'pork', 'salmon', 'fish'].includes(ing.toLowerCase())
    );
    if (proteins.length > 0) {
      const proteinMeals = new Set<string>();
      proteins.forEach(protein => {
        ingredientToMeals.get(protein)?.forEach(meal => proteinMeals.add(meal));
      });
      
      prepGroups.push({
        shared_ingredients: proteins,
        meals: Array.from(proteinMeals),
        prep_steps: [
          `Cook ${proteins[0]} once → use in ${proteinMeals.size} meals`,
          'Store in airtight containers, refrigerate',
          'Reheat as needed throughout the week',
        ],
      });
    }
    
    // Group 2: Vegetable prep
    const vegetables = sharedIngredients.filter(ing => 
      ['spinach', 'broccoli', 'carrot', 'onion', 'garlic', 'tomato', 'cucumber'].includes(ing.toLowerCase())
    );
    if (vegetables.length > 0) {
      const vegMeals = new Set<string>();
      vegetables.forEach(veg => {
        ingredientToMeals.get(veg)?.forEach(meal => vegMeals.add(meal));
      });
      
      prepGroups.push({
        shared_ingredients: vegetables,
        meals: Array.from(vegMeals),
        prep_steps: [
          `Chop ${vegetables[0]} once → use in ${vegMeals.size} meals`,
          'Store in containers with paper towels to absorb moisture',
          'Use within 3-4 days for best freshness',
        ],
      });
    }
    
    // Group 3: Grain/Starch prep
    const grains = sharedIngredients.filter(ing => 
      ['rice', 'quinoa', 'pasta', 'potato'].includes(ing.toLowerCase())
    );
    if (grains.length > 0) {
      const grainMeals = new Set<string>();
      grains.forEach(grain => {
        ingredientToMeals.get(grain)?.forEach(meal => grainMeals.add(meal));
      });
      
      prepGroups.push({
        shared_ingredients: grains,
        meals: Array.from(grainMeals),
        prep_steps: [
          `Cook ${grains[0]} in bulk → use in ${grainMeals.size} meals`,
          'Store in refrigerator, reheat with a splash of water',
          'Keeps well for 4-5 days',
        ],
      });
    }
  }
  
  // Calculate time saved (simplified)
  const totalTimeSaved = prepGroups.length * 20; // ~20 min per prep group
  
  return {
    prep_groups: prepGroups,
    total_time_saved: `${totalTimeSaved} minutes`,
  };
};

/**
 * Extract ingredients from meal (simplified)
 */
function extractIngredientsFromMeal(meal: { description: string }): string[] {
  const commonIngredients = [
    'chicken', 'rice', 'spinach', 'tomato', 'onion', 'garlic', 'olive oil',
    'broccoli', 'quinoa', 'salmon', 'eggs', 'banana', 'oatmeal', 'yogurt',
    'cheese', 'bread', 'pasta', 'lettuce', 'cucumber', 'carrot', 'potato',
    'beef', 'pork', 'turkey', 'fish', 'shrimp', 'tofu', 'beans', 'lentils',
  ];
  
  const found: string[] = [];
  const descLower = meal.description.toLowerCase();
  
  commonIngredients.forEach(ing => {
    if (descLower.includes(ing)) {
      found.push(ing);
    }
  });
  
  return found;
}

