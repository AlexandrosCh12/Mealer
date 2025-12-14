import React, { useState } from 'react';
import { MealPlanResponse, MealPlanMeal, DayMealPlan } from '../types/meal';
import { MealCard } from './MealCard';
import { OnboardingAnswers } from '../types';
import { swapMeal as swapMealApi } from '../api/mealPlanApi';
import { WeeklyCostSummary } from './WeeklyCostSummary';
import { ZeroWasteInsights } from './ZeroWasteInsights';
import { PrepMode } from './PrepMode';

interface MealPlanProps {
  mealPlanResponse: MealPlanResponse;
  userProfile: OnboardingAnswers;
  onMealPlanUpdate?: (updatedPlan: MealPlanResponse) => void;
}

export const MealPlan: React.FC<MealPlanProps> = ({ 
  mealPlanResponse, 
  userProfile,
  onMealPlanUpdate 
}) => {
  const [swappingMeal, setSwappingMeal] = useState<{ day: string; mealIndex: number } | null>(null);
  const [currentPlan, setCurrentPlan] = useState<MealPlanResponse>(mealPlanResponse);
  const [showPrepMode, setShowPrepMode] = useState(false);

  const handleSwap = async (day: string, mealIndex: number) => {
    setSwappingMeal({ day, mealIndex });
    
    try {
      const updatedPlan = await swapMealApi(
        userProfile,
        day,
        mealIndex,
        currentPlan
      );
      
      setCurrentPlan(updatedPlan);
      if (onMealPlanUpdate) {
        onMealPlanUpdate(updatedPlan);
      }
    } catch (error) {
      console.error('Failed to swap meal:', error);
      alert(error instanceof Error ? error.message : 'Failed to swap meal');
    } finally {
      setSwappingMeal(null);
    }
  };

  const isMealSwapping = (day: string, mealIndex: number) => {
    return swappingMeal?.day === day && swappingMeal?.mealIndex === mealIndex;
  };

  return (
    <div className="meal-plan-container">
      <div className="meal-plan-header">
        <h2 className="meal-plan-title">Your Weekly Meal Plan</h2>
        <p className="meal-plan-subtitle">{currentPlan.next_action_to_take}</p>
      </div>

      {/* Weekly Cost Summary */}
      <WeeklyCostSummary costSummary={currentPlan.weekly_cost_summary} />

      {/* Zero Waste Insights */}
      <ZeroWasteInsights weeklyPlan={currentPlan.weekly_meal_plan} />

      {/* Prep Mode Toggle */}
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <label>
          <input
            type="checkbox"
            checked={showPrepMode}
            onChange={(e) => setShowPrepMode(e.target.checked)}
          />
          {' '}Show Prep Mode
        </label>
      </div>

      {/* Prep Mode View */}
      {showPrepMode && (
        <PrepMode weeklyPlan={currentPlan.weekly_meal_plan} />
      )}

      {/* Weekly Meals */}
      <div className="weekly-meals">
        {currentPlan.weekly_meal_plan.map((dayPlan: DayMealPlan, dayIndex: number) => (
          <div key={dayIndex} className="day-meals">
            <h3 className="day-name">{dayPlan.day}</h3>
            <div className="meals-grid">
              {dayPlan.meals.map((meal: MealPlanMeal, mealIndex: number) => (
                <MealCard
                  key={`${dayPlan.day}-${mealIndex}`}
                  meal={meal}
                  day={dayPlan.day}
                  mealIndex={mealIndex}
                  onSwap={handleSwap}
                  isSwapping={isMealSwapping(dayPlan.day, mealIndex)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Ingredients List */}
      <div className="ingredients-section">
        <h3>Weekly Ingredients List</h3>
        <div className="ingredients-list">
          {currentPlan.weekly_ingredients_list.map((ingredient, index) => (
            <div key={index} className="ingredient-item">
              <div className="ingredient-header">
                <strong>{ingredient.ingredient}</strong>
                <span className="ingredient-amount">{ingredient.total_weekly_portion_needed}</span>
              </div>
              <div className="supermarket-options">
                {ingredient.supermarket_options.map((option, optIndex) => (
                  <div key={optIndex} className="supermarket-option">
                    <div className="option-header">
                      <span className="supermarket-name">{option.supermarket}</span>
                      <span className="package-price">{option.package_price}</span>
                    </div>
                    <div className="option-details">
                      <span className="sold-package">{option.sold_package}</span>
                      <span className="portion-cost">Portion: {option.portion_cost_estimate}</span>
                    </div>
                    {option.notes && (
                      <div className="option-notes">{option.notes}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Supermarkets */}
      <div className="supermarkets-section">
        <h3>Recommended Supermarkets</h3>
        <div className="supermarkets-list">
          {currentPlan.recommended_supermarkets.map((supermarket) => (
            <div key={supermarket.rank} className="supermarket-recommendation">
              <div className="supermarket-rank">#{supermarket.rank}</div>
              <div className="supermarket-info">
                <div className="supermarket-name">{supermarket.name}</div>
                <div className="supermarket-reason">{supermarket.reason}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
