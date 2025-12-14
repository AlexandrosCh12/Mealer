import { FavoriteMeal, MealHistory } from '../types';

// In-memory storage for favorites and history
const favorites: Map<string, FavoriteMeal> = new Map(); // key: mealTitle
const history: MealHistory = {
  liked: [],
  swapped: [],
  skipped: [],
};

/**
 * Add a meal to favorites
 */
export const addFavorite = (mealTitle: string, mealType: string): void => {
  const existing = favorites.get(mealTitle);
  if (existing) {
    existing.timesUsed += 1;
  } else {
    favorites.set(mealTitle, {
      mealTitle,
      mealType: mealType as any,
      likedAt: Date.now(),
      timesUsed: 1,
    });
  }
  
  if (!history.liked.includes(mealTitle)) {
    history.liked.push(mealTitle);
  }
};

/**
 * Remove a meal from favorites
 */
export const removeFavorite = (mealTitle: string): void => {
  favorites.delete(mealTitle);
  const index = history.liked.indexOf(mealTitle);
  if (index > -1) {
    history.liked.splice(index, 1);
  }
};

/**
 * Track a swapped meal
 */
export const trackSwap = (mealTitle: string): void => {
  if (!history.swapped.includes(mealTitle)) {
    history.swapped.push(mealTitle);
  }
};

/**
 * Track a skipped meal
 */
export const trackSkip = (mealTitle: string): void => {
  if (!history.skipped.includes(mealTitle)) {
    history.skipped.push(mealTitle);
  }
};

/**
 * Get all favorites
 */
export const getFavorites = (): FavoriteMeal[] => {
  return Array.from(favorites.values());
};

/**
 * Get meal history
 */
export const getHistory = (): MealHistory => {
  return { ...history };
};

/**
 * Check if a meal is favorited
 */
export const isFavorite = (mealTitle: string): boolean => {
  return favorites.has(mealTitle);
};

/**
 * Check if a meal was previously liked (used 2+ times)
 */
export const wasPreviouslyLiked = (mealTitle: string): boolean => {
  const favorite = favorites.get(mealTitle);
  return favorite ? favorite.timesUsed >= 2 : false;
};

/**
 * Get meals that should be prioritized (liked 2-3+ times)
 */
export const getPrioritizedMeals = (): string[] => {
  return Array.from(favorites.values())
    .filter(f => f.timesUsed >= 2)
    .map(f => f.mealTitle);
};

/**
 * Get meals that should never be repeated (in skipped list)
 */
export const getSkippedMeals = (): string[] => {
  return [...history.skipped];
};

