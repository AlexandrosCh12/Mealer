// Backend meal types - shared with frontend
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

export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'preWorkout';

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

