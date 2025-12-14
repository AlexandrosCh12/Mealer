// Backend types - shared with frontend where applicable
import { UserProfile } from './types/userProfile';
import { Meal, Store } from './types/meal';

export type { UserProfile };

// Exact schema types matching requirements
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

// Request/Response types for swap meal endpoint
export interface SwapMealRequest {
  userProfile: UserProfile;
  day: string;
  mealIndex: number; // index in meals array
  currentWeeklyPlan: MealPlanResponse;
}

export interface SwapMealResponse extends MealPlanResponse {}

// Favorites & History types
export interface FavoriteMeal {
  mealTitle: string;
  mealType: MealType;
  likedAt: number;
  timesUsed: number;
}

export interface MealHistory {
  liked: string[]; // meal titles
  swapped: string[]; // meal titles
  skipped: string[]; // meal titles
}

// Prep Mode types
export interface PrepGroup {
  shared_ingredients: string[];
  meals: string[];
  prep_steps: string[];
}

export interface PrepModeResponse {
  prep_groups: PrepGroup[];
  total_time_saved: string;
}

