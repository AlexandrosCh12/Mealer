import { OnboardingAnswers } from '../types';
import { MealPlanResponse, DayMealPlan } from '../types/meal';

const API_BASE_URL =
  (typeof import.meta !== 'undefined' &&
    (import.meta as any).env &&
    (import.meta as any).env.VITE_API_URL) ||
  'http://localhost:5000';

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
      currentWeeklyPlan,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to swap meal' }));
    throw new Error(error.error || 'Failed to swap meal');
  }

  return response.json();
};

/**
 * Add or remove a favorite meal
 */
export const toggleFavorite = async (
  action: 'add' | 'remove',
  mealTitle: string,
  mealType?: string
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/favorites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, mealTitle, mealType }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to update favorites' }));
    throw new Error(error.error || 'Failed to update favorites');
  }
};

/**
 * Get favorites list
 */
export const getFavorites = async (): Promise<any[]> => {
  const response = await fetch(`${API_BASE_URL}/favorites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'get' }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to get favorites' }));
    throw new Error(error.error || 'Failed to get favorites');
  }

  const data = await response.json();
  return data.favorites || [];
};

/**
 * Get meal history
 */
export const getHistory = async (): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/history`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to get history' }));
    throw new Error(error.error || 'Failed to get history');
  }

  return response.json();
};

/**
 * Generate prep mode
 */
export const generatePrepMode = async (
  weeklyMealPlan: DayMealPlan[]
): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/prep-mode`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ weekly_meal_plan: weeklyMealPlan }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to generate prep mode' }));
    throw new Error(error.error || 'Failed to generate prep mode');
  }

  return response.json();
};

/**
 * Get zero-waste insights
 */
export const getZeroWasteInsights = async (
  weeklyMealPlan: DayMealPlan[]
): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/zero-waste`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ weekly_meal_plan: weeklyMealPlan }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to get zero-waste insights' }));
    throw new Error(error.error || 'Failed to get zero-waste insights');
  }

  return response.json();
};

