/**
 * Shared TypeScript types for Mealer domain models.
 *
 * Central definitions for meals, profiles, onboarding, and supermarkets.
 * Re-exports plan and shopping types from lib modules for convenience.
 */

/** User's primary fitness objective — drives calorie adjustment. */
export type Goal = 'lose_weight' | 'gain_muscle' | 'maintain';
/** Eating pattern used to filter meal templates. */
export type DietType = 'omnivore' | 'vegetarian' | 'vegan' | 'keto' | 'mediterranean';
/** Activity multiplier tier for TDEE calculation. */
export type ActivityLevel = 'sedentary' | 'moderate' | 'active';
/** Food allergy tags; meals declare which they exclude. */
export type Allergy = 'gluten' | 'dairy' | 'nuts' | 'eggs' | 'none';
/** Time-of-day bucket for a meal in the daily plan. */
export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';
/** Recipe complexity label shown in meal detail UI. */
export type MealDifficulty = 'Easy' | 'Medium' | 'Hard';
/** How Shopping tab ranks nearby supermarkets. */
export type SupermarketSortPreference = 'cheapest' | 'closest';

/** Macronutrient breakdown for a single meal. */
export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/** A recipe/meal entry with nutrition, ingredients, and diet metadata. */
export interface Meal {
  id: string;
  name: string;
  slot: MealSlot;
  ingredients: string[];
  macros: Macros;
  dietTypes: DietType[];
  excludesAllergies: Allergy[];
  cookingSteps?: string[];
  cookTime?: number;
  difficulty?: MealDifficulty;
}

/** User profile stored in Supabase after onboarding. */
export interface Profile {
  id: string;
  display_name: string | null;
  age: number;
  weight_kg: number;
  height_cm: number;
  goal: Goal;
  diet_type: DietType;
  allergies: string[];
  budget_weekly_eur: number;
  city: string;
  country: string;
  activity_level: ActivityLevel;
  gender: string;
  created_at?: string;
}

/** Legacy single-day meal plan row (Supabase meal_plans table). */
export interface MealPlan {
  id: string;
  user_id: string;
  date: string;
  meals: Meal[];
  created_at?: string;
}

/** Supermarket chain with price tier and supported regions. */
export interface Supermarket {
  name: string;
  priceTier: 1 | 2 | 3;
  regions: string[];
}

/** Supermarket enriched with a mock distance for ranking in Shopping. */
export interface RankedSupermarket extends Supermarket {
  estimatedDistanceKm: number;
}

/** In-progress onboarding form state (nullable until each step is answered). */
export interface OnboardingData {
  display_name: string;
  goal: Goal | null;
  gender: string | null;
  age: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  activity_level: ActivityLevel | null;
  diet_type: DietType | null;
  allergies: Allergy[];
  budget_weekly_eur: number | null;
  country: string | null;
  city: string | null;
}

/** Minimal authenticated user identity from Supabase auth. */
export interface User {
  id: string;
  email?: string;
}

export type { DayPlan, WeeklyPlan } from '@/lib/weeklyMealPlan';
export type { IngredientItem } from '@/lib/ingredientList';
