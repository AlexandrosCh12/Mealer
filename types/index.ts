export type Goal = 'lose_weight' | 'gain_muscle' | 'maintain';
export type DietType = 'omnivore' | 'vegetarian' | 'vegan' | 'keto' | 'mediterranean';
export type ActivityLevel = 'sedentary' | 'moderate' | 'active';
export type Allergy = 'gluten' | 'dairy' | 'nuts' | 'eggs' | 'none';
export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type SupermarketSortPreference = 'cheapest' | 'closest';

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  name: string;
  slot: MealSlot;
  ingredients: string[];
  macros: Macros;
  dietTypes: DietType[];
  excludesAllergies: Allergy[];
}

export interface Profile {
  id: string;
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

export interface MealPlan {
  id: string;
  user_id: string;
  date: string;
  meals: Meal[];
  created_at?: string;
}

export interface Supermarket {
  name: string;
  priceTier: 1 | 2 | 3;
  regions: string[];
}

export interface RankedSupermarket extends Supermarket {
  estimatedDistanceKm: number;
}

export interface OnboardingData {
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

export interface User {
  id: string;
  email?: string;
}
