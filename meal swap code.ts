import { OnboardingAnswers } from '../types';
import { Meal, MealPlanResponse } from '../types/meal';

const API_BASE_URL =
  (typeof import.meta !== 'undefined' &&
    (import.meta as any).env &&
    (import.meta as any).env.VITE_API_URL) ||
  'http://localhost:3001/api';

/**
 * Generate a meal plan from user profile
 */
export const generateMealPlan = async (
  userProfile: OnboardingAnswers
): Promise<MealPlanResponse> => {
  const response = await fetch(`${API_BASE_URL}/generate-meal-plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userProfile),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to generate meal plan' }));
    throw new Error(error.error || 'Failed to generate meal plan');
  }

  return response.json();
};

/**
 * Swap a meal in the weekly plan
 */
export const swapMeal = async (
  userProfile: OnboardingAnswers,
  day: string,
  mealIndex: number,
  currentMeal: Meal,
  currentWeeklyPlan: MealPlanResponse
): Promise<MealPlanResponse> => {
  const response = await fetch(`${API_BASE_URL}/swap-meal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userProfile,
      day,
      mealIndex,
      currentMeal,
      currentWeeklyPlan,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to swap meal' }));
    throw new Error(error.error || 'Failed to swap meal');
  }

  return response.json();
};

