import React, { useState, useEffect } from 'react';
import { generateMealPlan, swapMeal } from '../api/mealPlanApi';
import { MealPlanResponse, DayMealPlan, MealPlanMeal } from '../types/meal';
import { DayTabs } from '../components/DayTabs';
import { MealCard } from '../components/MealCard';
import { SupermarketDrawer } from '../components/SupermarketDrawer';
import './WeeklyMealPlanPage.css';

const userProfile = {
  weight: "80",
  height: "180",
  ideal_weight_goal: "75",
  fitness_goal: "Maintain",
  workout_frequency: "1–3 times per week",
  dietary_restrictions: "None",
  allergies: "None",
  food_dislikes: "None",
  budget_level: "Medium / normal budget",
  country: "Greece",
  city: "Athens",
  cooking_skill: "Beginner",
  daily_cooking_time: "20–40 minutes"
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const WeeklyMealPlanPage: React.FC = () => {
  const [mealPlan, setMealPlan] = useState<MealPlanResponse | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [swappingMealId, setSwappingMealId] = useState<string | null>(null);
  const [showSupermarkets, setShowSupermarkets] = useState<boolean>(false);

  useEffect(() => {
    loadMealPlan();
  }, []);

  const loadMealPlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const plan = await generateMealPlan(userProfile);
      setMealPlan(plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load meal plan');
      console.error('Error loading meal plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapMeal = async (day: string, mealIndex: number) => {
    if (!mealPlan) return;

    const mealId = `${day}-${mealIndex}`;
    setSwappingMealId(mealId);

    try {
      const updatedPlan = await swapMeal(
        userProfile,
        day,
        mealIndex,
        mealPlan
      );
      setMealPlan(updatedPlan);
    } catch (err) {
      console.error('Error swapping meal:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to swap meal';
      console.error('Full error:', err);
      alert(errorMessage);
    } finally {
      setSwappingMealId(null);
    }
  };

  const selectedDayPlan = mealPlan?.weekly_meal_plan.find(
    (d: DayMealPlan) => d.day === selectedDay
  );

  if (loading) {
    return (
      <div className="weekly-meal-plan-page">
        <div className="loading-state">Loading meal plan...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weekly-meal-plan-page">
        <div className="error-state">
          <p>Error: {error}</p>
          <button onClick={loadMealPlan}>Retry</button>
        </div>
      </div>
    );
  }

  if (!mealPlan) {
    return (
      <div className="weekly-meal-plan-page">
        <div className="error-state">No meal plan available</div>
      </div>
    );
  }

  return (
    <div className="weekly-meal-plan-page">
      <header className="page-header">
        <h1>Weekly Meal Plan</h1>
        <button
          className="supermarkets-button"
          onClick={() => setShowSupermarkets(true)}
        >
          View supermarkets & prices
        </button>
      </header>

      <DayTabs
        days={DAYS}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
      />

      <div className="meals-container">
        {selectedDayPlan && selectedDayPlan.meals.length > 0 ? (
          <div className="meals-grid">
            {selectedDayPlan.meals.map((meal: MealPlanMeal, index: number) => (
              <MealCard
                key={`${selectedDay}-${index}`}
                meal={meal}
                day={selectedDay}
                mealIndex={index}
                onSwap={() => handleSwapMeal(selectedDay, index)}
                isSwapping={swappingMealId === `${selectedDay}-${index}`}
              />
            ))}
          </div>
        ) : (
          <div className="no-meals">No meals planned for {selectedDay}</div>
        )}
      </div>

      <SupermarketDrawer
        isOpen={showSupermarkets}
        onClose={() => setShowSupermarkets(false)}
        mealPlan={mealPlan}
      />
    </div>
  );
};

