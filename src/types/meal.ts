export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

export interface CookingStep {
  step: number;
  instruction: string;
}

export interface Store {
  name: string;
  budgetLevel: 'Tight budget' | 'Medium / normal budget' | 'No budget limit';
  address?: string;
  website?: string;
}

export interface Meal {
  id: string;
  name: string;
  description: string;
  cookingTime: string; // e.g., "20-40 minutes"
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fats: number; // grams
  ingredients: Ingredient[];
  instructions: CookingStep[];
  dietaryTags: string[]; // e.g., ["vegetarian", "gluten-free"]
  fitnessGoal: string[]; // e.g., ["Bulk up", "Lose weight", "Maintain"]
  stores: Store[];
}

// Legacy types for backward compatibility (if needed)
export type LegacyMealType = 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'preWorkout';

export interface WeeklyMealPlan {
  week: string;
  meals: {
    day: string;
    breakfast: Meal | null;
    lunch: Meal | null;
    snack: Meal | null;
    dinner: Meal | null;
    preWorkout: Meal | null;
  }[];
}

export interface MealPlanContext {
  answers: import('../types').OnboardingAnswers;
  mealPlan: WeeklyMealPlan;
}

// API Response types - matching backend exact schema
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'preworkout';

export interface MealPlanMeal {
  title: string;
  meal_type: MealType;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  description: string;
}

export interface DayMealPlan {
  day: string;
  meals: MealPlanMeal[];
}

export interface SupermarketOption {
  supermarket: string;
  sold_package: string;
  package_price: string;
  portion_cost_estimate: string;
  notes: string;
}

export interface WeeklyIngredient {
  ingredient: string;
  total_weekly_portion_needed: string;
  supermarket_options: SupermarketOption[];
}

export interface RecommendedSupermarket {
  rank: number;
  name: string;
  reason: string;
}

export interface WeeklyCostSummary {
  cheapest_option: string;
  estimated_total: string;
  savings_vs_premium: string;
}

export interface MealPlanResponse {
  weekly_meal_plan: DayMealPlan[];
  weekly_ingredients_list: WeeklyIngredient[];
  recommended_supermarkets: RecommendedSupermarket[];
  weekly_cost_summary: WeeklyCostSummary;
  next_action_to_take: string;
}

// Legacy types for backward compatibility (if needed)
export interface WeeklyMealPlan {
  week: string;
  meals: {
    day: string;
    breakfast: Meal | null;
    lunch: Meal | null;
    snack: Meal | null;
    dinner: Meal | null;
    preWorkout: Meal | null;
  }[];
}

