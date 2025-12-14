import { Request, Response } from 'express';
import { SwapMealRequest, MealPlanResponse } from '../types';
import { swapMeal, generateMealPlan } from '../services/mealPlanner';
import { addFavorite, removeFavorite, getFavorites, getHistory, trackSwap, trackSkip } from '../services/favoritesService';
import { generatePrepMode } from '../services/prepModeService';
import { analyzeZeroWaste } from '../services/zeroWasteService';
import { calculateWeeklyCost } from '../services/costCalculator';

/**
 * POST /generate-meal-plan
 */
export const generateMealPlanHandler = async (req: Request, res: Response) => {
  try {
    const userProfile = req.body;
    
    if (!userProfile) {
      return res.status(400).json({ error: 'User profile is required' });
    }
    
    // Generate full meal plan response
    const response = generateMealPlan(userProfile);
    
    res.json(response);
  } catch (error) {
    console.error('Error generating meal plan:', error);
    res.status(500).json({ error: 'Failed to generate meal plan' });
  }
};

/**
 * POST /swap-meal
 */
export const swapMealHandler = async (req: Request, res: Response) => {
  try {
    const { userProfile, day, mealIndex, currentWeeklyPlan }: SwapMealRequest = req.body;
    
    // Validation
    if (!userProfile) {
      return res.status(400).json({ error: 'userProfile is required' });
    }
    if (!day) {
      return res.status(400).json({ error: 'day is required' });
    }
    if (typeof mealIndex !== 'number' || mealIndex < 0) {
      return res.status(400).json({ error: 'mealIndex must be a non-negative number' });
    }
    if (!currentWeeklyPlan) {
      return res.status(400).json({ error: 'currentWeeklyPlan is required' });
    }
    
    // Validate day exists in plan
    const dayExists = currentWeeklyPlan.weekly_meal_plan.some(
      d => d.day.toLowerCase() === day.toLowerCase()
    );
    if (!dayExists) {
      return res.status(400).json({ error: `Day "${day}" not found in meal plan` });
    }
    
    // Get current meal title for tracking
    const dayPlan = currentWeeklyPlan.weekly_meal_plan.find(
      d => d.day.toLowerCase() === day.toLowerCase()
    );
    if (dayPlan && dayPlan.meals[mealIndex]) {
      trackSwap(dayPlan.meals[mealIndex].title);
    }
    
    // Perform swap
    const updatedPlan = swapMeal(userProfile, day, mealIndex, currentWeeklyPlan);
    
    res.json(updatedPlan);
  } catch (error) {
    console.error('Error swapping meal:', error);
    if (error instanceof Error) {
      const errorMessage = error.message;
      console.error('Error details:', errorMessage);
      if (errorMessage.includes('not found') || errorMessage.includes('Invalid') || errorMessage.includes('No suitable')) {
        return res.status(400).json({ error: errorMessage });
      }
      return res.status(500).json({ error: `Failed to swap meal: ${errorMessage}` });
    }
    res.status(500).json({ error: 'Failed to swap meal: Unknown error' });
  }
};

/**
 * POST /favorites
 * Add or remove a favorite meal
 */
export const favoritesHandler = async (req: Request, res: Response) => {
  try {
    const { action, mealTitle, mealType } = req.body;
    
    if (!action || !mealTitle) {
      return res.status(400).json({ error: 'action and mealTitle are required' });
    }
    
    if (action === 'add') {
      addFavorite(mealTitle, mealType || 'dinner');
      res.json({ success: true, message: 'Meal added to favorites' });
    } else if (action === 'remove') {
      removeFavorite(mealTitle);
      res.json({ success: true, message: 'Meal removed from favorites' });
    } else if (action === 'get') {
      const favorites = getFavorites();
      res.json({ favorites });
    } else {
      return res.status(400).json({ error: 'Invalid action. Use "add", "remove", or "get"' });
    }
  } catch (error) {
    console.error('Error handling favorites:', error);
    res.status(500).json({ error: 'Failed to handle favorites' });
  }
};

/**
 * GET /history
 * Get meal history (liked, swapped, skipped)
 */
export const historyHandler = async (req: Request, res: Response) => {
  try {
    const history = getHistory();
    res.json(history);
  } catch (error) {
    console.error('Error getting history:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
};

/**
 * POST /prep-mode
 * Generate prep mode groups for a meal plan
 */
export const prepModeHandler = async (req: Request, res: Response) => {
  try {
    const { weekly_meal_plan } = req.body;
    
    if (!weekly_meal_plan || !Array.isArray(weekly_meal_plan)) {
      return res.status(400).json({ error: 'weekly_meal_plan is required' });
    }
    
    const prepMode = generatePrepMode(weekly_meal_plan);
    res.json(prepMode);
  } catch (error) {
    console.error('Error generating prep mode:', error);
    res.status(500).json({ error: 'Failed to generate prep mode' });
  }
};

/**
 * POST /weekly-cost-summary
 * Calculate weekly cost summary (can also be included in meal plan response)
 */
export const weeklyCostSummaryHandler = async (req: Request, res: Response) => {
  try {
    const { weekly_ingredients_list, userProfile } = req.body;
    
    if (!weekly_ingredients_list || !userProfile) {
      return res.status(400).json({ error: 'weekly_ingredients_list and userProfile are required' });
    }
    
    const costSummary = calculateWeeklyCost(weekly_ingredients_list, userProfile);
    
    res.json(costSummary);
  } catch (error) {
    console.error('Error calculating cost summary:', error);
    res.status(500).json({ error: 'Failed to calculate cost summary' });
  }
};

/**
 * POST /zero-waste
 * Analyze zero-waste insights for a meal plan
 */
export const zeroWasteHandler = async (req: Request, res: Response) => {
  try {
    const { weekly_meal_plan } = req.body;
    
    if (!weekly_meal_plan || !Array.isArray(weekly_meal_plan)) {
      return res.status(400).json({ error: 'weekly_meal_plan is required' });
    }
    
    const insight = analyzeZeroWaste(weekly_meal_plan, []);
    res.json(insight);
  } catch (error) {
    console.error('Error analyzing zero waste:', error);
    res.status(500).json({ error: 'Failed to analyze zero waste' });
  }
};

