import { UserProfile } from '../types/userProfile';
import { Meal } from '../types/meal';
import { meals } from '../data/meals';
import { getStoresForLocation } from '../data/stores';
import { filterMeals } from './mealFilters';
import { getPrioritizedMeals, getSkippedMeals } from './favoritesService';
import {
  MealPlanResponse,
  DayMealPlan,
  MealPlanMeal,
  WeeklyIngredient,
  MealType,
} from '../types';
import { calculateWeeklyCost, getRecommendedSupermarkets } from './costCalculator';

/**
 * Generate a weekly meal plan in the exact schema format
 */
export const generateMealPlan = (userProfile: UserProfile): MealPlanResponse => {
  const filteredMeals = filterMeals(userProfile);
  const prioritizedMeals = getPrioritizedMeals();
  const skippedMeals = getSkippedMeals();
  
  // Filter out skipped meals
  const availableMeals = filteredMeals.filter(m => !skippedMeals.includes(m.name));
  
  // Prioritize previously liked meals
  const sortedMeals = [
    ...availableMeals.filter(m => prioritizedMeals.includes(m.name)),
    ...availableMeals.filter(m => !prioritizedMeals.includes(m.name)),
  ];
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const locationStores = getStoresForLocation(userProfile.country, userProfile.city);
  
  // Generate weekly meal plan
  const weeklyMealPlan: DayMealPlan[] = days.map(day => {
    const dayMeals: MealPlanMeal[] = [];
    const usedMealNames = new Set<string>();
    
    // Breakfast (always include)
    const breakfastMeals = sortedMeals.filter(m => 
      m.cookingTime === 'Under 20 minutes' || 
      (userProfile.daily_cooking_time && m.cookingTime === userProfile.daily_cooking_time)
    );
    if (breakfastMeals.length > 0) {
      const breakfast = selectMeal(breakfastMeals, usedMealNames, 'breakfast');
      if (breakfast) {
        dayMeals.push(convertMealToPlanMeal(breakfast, 'breakfast'));
      }
    }
    
    // Lunch
    const lunchMeals = sortedMeals.filter(m => 
      m.skillLevel === userProfile.cooking_skill ||
      m.skillLevel === 'Beginner' ||
      m.skillLevel === 'Intermediate'
    );
    if (lunchMeals.length > 0) {
      const lunch = selectMeal(lunchMeals, usedMealNames, 'lunch');
      if (lunch) {
        dayMeals.push(convertMealToPlanMeal(lunch, 'lunch'));
      }
    }
    
    // Snack
    const snackMeals = sortedMeals.filter(m =>
      (m.calories < 300 && m.calories > 100) ||
      m.id.includes('snack') ||
      m.name.toLowerCase().includes('snack') ||
      m.name.toLowerCase().includes('yogurt') ||
      m.name.toLowerCase().includes('bar') ||
      m.name.toLowerCase().includes('apple')
    );
    if (snackMeals.length > 0) {
      const snack = selectMeal(snackMeals, usedMealNames, 'snack');
      if (snack) {
        dayMeals.push(convertMealToPlanMeal(snack, 'snack'));
      }
    }
    
    // Dinner
    const dinnerMeals = sortedMeals.filter(m => 
      m.calories > 300 && 
      !breakfastMeals.includes(m)
    );
    if (dinnerMeals.length > 0) {
      const dinner = selectMeal(dinnerMeals, usedMealNames, 'dinner');
      if (dinner) {
        dayMeals.push(convertMealToPlanMeal(dinner, 'dinner'));
      }
    }
    
    // Pre-workout (always include if workout frequency > 0)
    if (userProfile.workout_frequency && userProfile.workout_frequency !== 'I don\'t work out') {
      const preWorkoutMeals = sortedMeals.filter(m =>
        m.id.includes('preworkout') ||
        m.id.includes('pre-workout') ||
        m.name.toLowerCase().includes('pre-workout') ||
        m.name.toLowerCase().includes('pre workout') ||
        (m.name.toLowerCase().includes('banana') && m.carbs > 30 && m.calories < 300) ||
        (m.carbs > 30 && m.fats < 10 && m.calories < 300 && m.protein < 15)
      );
      if (preWorkoutMeals.length > 0) {
        const preworkout = selectMeal(preWorkoutMeals, usedMealNames, 'preworkout');
        if (preworkout) {
          dayMeals.push(convertMealToPlanMeal(preworkout, 'preworkout'));
        }
      }
    }
    
    return {
      day,
      meals: dayMeals,
    };
  });
  
  // Generate ingredients list with supermarket options
  const weeklyIngredientsList = generateIngredientsList(weeklyMealPlan, locationStores, userProfile);
  
  // Calculate cost summary
  const weeklyCostSummary = calculateWeeklyCost(weeklyIngredientsList, userProfile);
  
  // Get recommended supermarkets
  const recommendedSupermarkets = getRecommendedSupermarkets(userProfile, weeklyIngredientsList);
  
  return {
    weekly_meal_plan: weeklyMealPlan,
    weekly_ingredients_list: weeklyIngredientsList,
    recommended_supermarkets: recommendedSupermarkets,
    weekly_cost_summary: weeklyCostSummary,
    next_action_to_take: 'Review your meal plan and start shopping!',
  };
};

/**
 * Select a meal from candidates, avoiding duplicates
 */
function selectMeal(
  candidates: Meal[],
  usedNames: Set<string>,
  mealType: MealType
): Meal | null {
  const available = candidates.filter(m => !usedNames.has(m.name.toLowerCase()));
  if (available.length === 0) {
    // Fallback to any candidate if all are used
    const fallback = candidates[Math.floor(Math.random() * candidates.length)];
    return fallback || null;
  }
  const selected = available[Math.floor(Math.random() * available.length)];
  usedNames.add(selected.name.toLowerCase());
  return selected;
}

/**
 * Convert Meal to MealPlanMeal format
 */
function convertMealToPlanMeal(meal: Meal, mealType: MealType): MealPlanMeal {
  // Create detailed description with measurements and steps
  const ingredientsText = meal.ingredients
    .map(ing => `${ing.amount} ${ing.unit} ${ing.name}`)
    .join(', ');
  
  const stepsText = meal.instructions
    .map(inst => `Step ${inst.step}: ${inst.instruction}`)
    .join(' ');
  
  const description = `${meal.description}. Ingredients: ${ingredientsText}. Instructions: ${stepsText}`;
  
  return {
    title: meal.name,
    meal_type: mealType,
    calories: meal.calories,
    macros: {
      protein: meal.protein,
      carbs: meal.carbs,
      fats: meal.fats,
    },
    description,
  };
}

/**
 * Generate weekly ingredients list with supermarket options
 */
function generateIngredientsList(
  weeklyPlan: DayMealPlan[],
  locationStores: any[],
  userProfile: UserProfile
): WeeklyIngredient[] {
  // Aggregate ingredients across all meals
  const ingredientMap = new Map<string, {
    totalAmount: number;
    unit: string;
    meals: string[];
  }>();
  
  // Collect all meals to extract ingredients
  const allMeals: Meal[] = [];
  weeklyPlan.forEach(day => {
    day.meals.forEach(mealPlanMeal => {
      // Find the original meal object
      const originalMeal = meals.find(m => m.name === mealPlanMeal.title);
      if (originalMeal) {
        allMeals.push(originalMeal);
      }
    });
  });
  
  // Aggregate ingredients
  allMeals.forEach(meal => {
    meal.ingredients.forEach(ing => {
      const key = ing.name.toLowerCase();
      const existing = ingredientMap.get(key);
      
      if (existing) {
        const existingAmount = parseFloat(existing.totalAmount.toString()) || 0;
        const newAmount = parseFloat(ing.amount) || 0;
        existing.totalAmount = existingAmount + newAmount;
        if (!existing.meals.includes(meal.name)) {
          existing.meals.push(meal.name);
        }
      } else {
        ingredientMap.set(key, {
          totalAmount: parseFloat(ing.amount) || 0,
          unit: ing.unit,
          meals: [meal.name],
        });
      }
    });
  });
  
  // Convert to WeeklyIngredient format with supermarket options
  const currency = getCurrencyForCountry(userProfile.country);
  
  return Array.from(ingredientMap.entries()).map(([name, data]) => {
    const ingredientName = name.charAt(0).toUpperCase() + name.slice(1);
    
    // Generate supermarket options with realistic pricing
    const supermarketOptions = locationStores.slice(0, 3).map(store => {
      // Generate realistic package sizes and prices
      const packageSize = generatePackageSize(data.unit, data.totalAmount);
      const packagePrice = generatePackagePrice(ingredientName, packageSize, store.budgetLevel, currency);
      const portionCost = (parseFloat(packagePrice.replace(/[^\d.]/g, '')) / packageSize.amount * data.totalAmount).toFixed(2);
      
      return {
        supermarket: store.name,
        sold_package: packageSize.description,
        package_price: packagePrice,
        portion_cost_estimate: `${currency}${portionCost}`,
        notes: `Available at ${store.name}. ${getIngredientNotes(ingredientName)}`,
      };
    });
    
    return {
      ingredient: ingredientName,
      total_weekly_portion_needed: `${data.totalAmount} ${data.unit}`,
      supermarket_options: supermarketOptions,
    };
  });
}

/**
 * Generate realistic package size for ingredient
 */
function generatePackageSize(unit: string, totalAmount: number): { amount: number; description: string } {
  // Simplified logic - in production, use real supermarket data
  if (unit === 'g' || unit === 'kg') {
    if (totalAmount < 500) {
      return { amount: 500, description: '500g package' };
    } else if (totalAmount < 1000) {
      return { amount: 1000, description: '1kg package' };
    } else {
      return { amount: 2000, description: '2kg package' };
    }
  }
  if (unit === 'cup') {
    return { amount: 1, description: '1 cup package' };
  }
  if (unit === 'medium' || unit === 'piece') {
    return { amount: 1, description: '1 piece' };
  }
  if (unit === 'tbsp' || unit === 'tsp') {
    return { amount: 250, description: '250ml bottle' };
  }
  return { amount: 1, description: `1 ${unit} package` };
}

/**
 * Generate realistic price based on ingredient and budget level
 */
function generatePackagePrice(
  ingredient: string,
  packageSize: { amount: number; description: string },
  budgetLevel: string,
  currency: string
): string {
  // Base prices (simplified - in production, use real data)
  const basePrices: Record<string, number> = {
    'chicken': 8,
    'salmon': 12,
    'rice': 3,
    'quinoa': 5,
    'broccoli': 2,
    'spinach': 2.5,
    'eggs': 4,
    'oatmeal': 2,
    'banana': 1.5,
    'tomato': 2,
    'onion': 1,
    'garlic': 1.5,
    'olive oil': 6,
  };
  
  const ingredientLower = ingredient.toLowerCase();
  let basePrice = 3; // Default
  
  for (const [key, price] of Object.entries(basePrices)) {
    if (ingredientLower.includes(key)) {
      basePrice = price;
      break;
    }
  }
  
  // Adjust for budget level
  let multiplier = 1;
  if (budgetLevel === 'Tight budget') {
    multiplier = 0.8;
  } else if (budgetLevel === 'No budget limit') {
    multiplier = 1.3;
  }
  
  const finalPrice = (basePrice * multiplier).toFixed(2);
  return `${currency}${finalPrice}`;
}

/**
 * Get currency for country
 */
function getCurrencyForCountry(country: string): string {
  const countryLower = country.toLowerCase();
  if (countryLower.includes('greece') || countryLower.includes('euro')) {
    return '€';
  }
  if (countryLower.includes('uk') || countryLower.includes('britain')) {
    return '£';
  }
  if (countryLower.includes('usa') || countryLower.includes('united states')) {
    return '$';
  }
  return '€';
}

/**
 * Get ingredient-specific notes
 */
function getIngredientNotes(ingredient: string): string {
  const notes: Record<string, string> = {
    'chicken': 'Look for fresh cuts or frozen options',
    'salmon': 'Fresh or frozen fillets available',
    'eggs': 'Sold in packs of 6, 10, or 12',
    'spinach': 'Available fresh or frozen',
    'rice': 'Multiple package sizes available',
  };
  
  const ingredientLower = ingredient.toLowerCase();
  for (const [key, note] of Object.entries(notes)) {
    if (ingredientLower.includes(key)) {
      return note;
    }
  }
  
  return 'Check availability in produce section';
}

/**
 * Swap a meal in the weekly plan
 */
export const swapMeal = (
  userProfile: UserProfile,
  day: string,
  mealIndex: number,
  currentWeeklyPlan: MealPlanResponse
): MealPlanResponse => {
  // Find the day in the plan
  const dayIndex = currentWeeklyPlan.weekly_meal_plan.findIndex(
    d => d.day.toLowerCase() === day.toLowerCase()
  );
  
  if (dayIndex === -1) {
    throw new Error(`Day "${day}" not found in meal plan.`);
  }
  
  const dayPlan = currentWeeklyPlan.weekly_meal_plan[dayIndex];
  if (mealIndex < 0 || mealIndex >= dayPlan.meals.length) {
    throw new Error(`Invalid mealIndex: ${mealIndex}`);
  }
  
  const currentMeal = dayPlan.meals[mealIndex];
  const mealType = currentMeal.meal_type;
  
  // Get all existing meal titles to avoid duplicates
  const existingMealTitles = new Set<string>();
  currentWeeklyPlan.weekly_meal_plan.forEach(day => {
    day.meals.forEach(meal => {
      existingMealTitles.add(meal.title.toLowerCase());
    });
  });
  
  // Filter meals for swap
  const filteredMeals = filterMeals(userProfile);
  const skippedMeals = getSkippedMeals();
  const candidates = filteredMeals
    .filter(m => !skippedMeals.includes(m.name))
    .filter(m => {
      // Match meal type characteristics
      if (mealType === 'breakfast') {
        return m.cookingTime === 'Under 20 minutes' || 
               (userProfile.daily_cooking_time && m.cookingTime === userProfile.daily_cooking_time);
      }
      if (mealType === 'lunch') {
        return m.skillLevel === userProfile.cooking_skill ||
               m.skillLevel === 'Beginner' ||
               m.skillLevel === 'Intermediate';
      }
      if (mealType === 'snack') {
        return (m.calories < 300 && m.calories > 100) ||
               m.id.includes('snack') ||
               m.name.toLowerCase().includes('snack');
      }
      if (mealType === 'dinner') {
        return m.calories > 300;
      }
      if (mealType === 'preworkout') {
        return m.carbs > 30 && m.fats < 10 && m.calories < 300;
      }
      return true;
    })
    .filter(m => {
      // Similar calories (±15%)
      const calorieRange = {
        min: currentMeal.calories * 0.85,
        max: currentMeal.calories * 1.15,
      };
      return m.calories >= calorieRange.min && m.calories <= calorieRange.max;
    })
    .filter(m => !existingMealTitles.has(m.name.toLowerCase()));
  
  if (candidates.length === 0) {
    throw new Error(`No suitable replacement meal found for ${mealType} on ${day}`);
  }
  
  // Select a random candidate
  const newMeal = candidates[Math.floor(Math.random() * candidates.length)];
  const newPlanMeal = convertMealToPlanMeal(newMeal, mealType);
  
  // Update the plan
  const updatedWeeklyPlan = [...currentWeeklyPlan.weekly_meal_plan];
  updatedWeeklyPlan[dayIndex] = {
    ...dayPlan,
    meals: [
      ...dayPlan.meals.slice(0, mealIndex),
      newPlanMeal,
      ...dayPlan.meals.slice(mealIndex + 1),
    ],
  };
  
  // Regenerate ingredients and costs
  const locationStores = getStoresForLocation(userProfile.country, userProfile.city);
  const weeklyIngredientsList = generateIngredientsList(updatedWeeklyPlan, locationStores, userProfile);
  const weeklyCostSummary = calculateWeeklyCost(weeklyIngredientsList, userProfile);
  const recommendedSupermarkets = getRecommendedSupermarkets(userProfile, weeklyIngredientsList);
  
  return {
    weekly_meal_plan: updatedWeeklyPlan,
    weekly_ingredients_list: weeklyIngredientsList,
    recommended_supermarkets: recommendedSupermarkets,
    weekly_cost_summary: weeklyCostSummary,
    next_action_to_take: 'Meal swapped successfully! Review updated plan.',
  };
};
