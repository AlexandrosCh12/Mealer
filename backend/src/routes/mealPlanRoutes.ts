import { Router } from 'express';
import {
  generateMealPlanHandler,
  swapMealHandler,
  favoritesHandler,
  historyHandler,
  prepModeHandler,
  weeklyCostSummaryHandler,
  zeroWasteHandler,
} from '../controllers/mealPlanController';

const router = Router();

router.post('/generate-meal-plan', generateMealPlanHandler);
router.post('/swap-meal', swapMealHandler);
router.post('/favorites', favoritesHandler);
router.get('/history', historyHandler);
router.post('/prep-mode', prepModeHandler);
router.post('/weekly-cost-summary', weeklyCostSummaryHandler);
router.post('/zero-waste', zeroWasteHandler);

export default router;

