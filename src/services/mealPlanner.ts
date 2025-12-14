import { OnboardingAnswers } from '../types';
import { Meal, WeeklyMealPlan } from '../types/meal';
import { meals } from '../data/meals';
import { getStoresForLocation } from '../data/stores';

export const generateMealPlan = (answers: OnboardingAnswers): WeeklyMealPlan => {
  // Filter meals based on user preferences
  const filteredMeals = filterMeals(answers);
  
  // Get stores for user's location
  const locationStores = getStoresForLocation(answers.country, answers.city);
  
  // Add location-specific stores to meals, prioritizing user's budget level
  const mealsWithStores = filteredMeals.map(meal => {
    // Find stores matching user's budget level first
    const budgetMatchedStores = locationStores.filter(
      s => s.budgetLevel === answers.budget_level
    );
    
    // If no exact match, get stores that are close to budget level
    const fallbackStores = budgetMatchedStores.length > 0 
      ? budgetMatchedStores 
      : locationStores;
    
    // Prioritize stores matching budget, then add others
    const prioritizedStores = [
      ...budgetMatchedStores,
      ...fallbackStores.filter(s => !budgetMatchedStores.includes(s)),
    ].slice(0, 3); // Limit to 3 stores per meal
    
    return {
      ...meal,
      stores: prioritizedStores.length > 0 ? prioritizedStores : meal.stores,
    };
  });
  
  // Generate weekly plan
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Separate meals by type
  const breakfastMeals = mealsWithStores.filter(m => 
    m.cookingTime === 'Under 20 minutes' || 
    (answers.daily_cooking_time && m.cookingTime === answers.daily_cooking_time)
  );
  
  const lunchMeals = mealsWithStores.filter(m => 
    m.skillLevel === answers.cooking_skill || 
    m.skillLevel === 'Beginner' ||
    m.skillLevel === 'Intermediate'
  );
  
  const snackMeals = mealsWithStores.filter(m => 
    (m.calories < 300 && m.calories > 100) ||
    m.id.includes('snack') ||
    m.name.toLowerCase().includes('snack') || 
    m.name.toLowerCase().includes('yogurt') || 
    m.name.toLowerCase().includes('bar') ||
    m.name.toLowerCase().includes('apple') ||
    m.name.toLowerCase().includes('hummus')
  );
  
  const dinnerMeals = mealsWithStores.filter(m => 
    m.calories > 300 && 
    !breakfastMeals.includes(m)
  );
  
  // Pre-workout meals (high carb, moderate protein, low fat)
  const preWorkoutMeals = mealsWithStores.filter(m => 
    m.id.includes('preworkout') ||
    m.id.includes('pre-workout') ||
    m.name.toLowerCase().includes('pre-workout') ||
    m.name.toLowerCase().includes('pre workout') ||
    (m.name.toLowerCase().includes('banana') && m.carbs > 30 && m.calories < 300) ||
    (m.name.toLowerCase().includes('rice cake') && m.carbs > 30) ||
    (m.carbs > 30 && m.fats < 10 && m.calories < 300 && m.protein < 15)
  );
  
  const weeklyMeals = days.map((day, index) => {
    return {
      day,
      breakfast: breakfastMeals[index % breakfastMeals.length] || breakfastMeals[0] || null,
      lunch: lunchMeals[index % lunchMeals.length] || lunchMeals[0] || null,
      snack: snackMeals[index % snackMeals.length] || snackMeals[0] || null,
      dinner: dinnerMeals[index % dinnerMeals.length] || dinnerMeals[0] || null,
      preWorkout: preWorkoutMeals[index % preWorkoutMeals.length] || preWorkoutMeals[0] || null,
    };
  });
  
  return {
    week: `Week of ${new Date().toLocaleDateString()}`,
    meals: weeklyMeals,
  };
};

const filterMeals = (answers: OnboardingAnswers): Meal[] => {
  let filtered = [...meals];
  
  // Filter by fitness goal
  if (answers.fitness_goal) {
    filtered = filtered.filter(meal => 
      meal.fitnessGoal.includes(answers.fitness_goal)
    );
  }
  
  // Filter by dietary restrictions
  if (answers.dietary_restrictions && 
      answers.dietary_restrictions.toLowerCase() !== 'none') {
    const restrictions = answers.dietary_restrictions.toLowerCase();
    // Simple keyword matching - can be enhanced
    if (restrictions.includes('vegetarian')) {
      filtered = filtered.filter(meal => 
        meal.dietaryTags.includes('vegetarian') || meal.dietaryTags.includes('vegan')
      );
    }
    if (restrictions.includes('vegan')) {
      filtered = filtered.filter(meal => meal.dietaryTags.includes('vegan'));
    }
  }
  
  // Filter by allergies
  if (answers.allergies && answers.allergies.toLowerCase() !== 'none') {
    const allergies = answers.allergies.toLowerCase();
    filtered = filtered.filter(meal => {
      // Check if meal ingredients contain allergens
      const mealIngredients = meal.ingredients.map(i => i.name.toLowerCase()).join(' ');
      return !allergies.split(',').some(allergy => 
        mealIngredients.includes(allergy.trim())
      );
    });
  }
  
  // Filter by food dislikes
  if (answers.food_dislikes && answers.food_dislikes.toLowerCase() !== 'none') {
    const dislikes = answers.food_dislikes.toLowerCase();
    filtered = filtered.filter(meal => {
      const mealIngredients = meal.ingredients.map(i => i.name.toLowerCase()).join(' ');
      return !dislikes.split(',').some(dislike => 
        mealIngredients.includes(dislike.trim())
      );
    });
  }
  
  // Filter by cooking skill level
  if (answers.cooking_skill) {
    const skillLevels = ['Beginner', 'Intermediate', 'Advanced'];
    const userSkillIndex = skillLevels.indexOf(answers.cooking_skill);
    filtered = filtered.filter(meal => {
      const mealSkillIndex = skillLevels.indexOf(meal.skillLevel);
      return mealSkillIndex <= userSkillIndex + 1; // Allow one level above
    });
  }
  
  // Filter by cooking time
  if (answers.daily_cooking_time) {
    filtered = filtered.filter(meal => {
      if (answers.daily_cooking_time === 'Under 20 minutes') {
        return meal.cookingTime === 'Under 20 minutes';
      }
      if (answers.daily_cooking_time === '20–40 minutes') {
        return meal.cookingTime === 'Under 20 minutes' || meal.cookingTime === '20-40 minutes';
      }
      return true; // 40+ minutes allows all
    });
  }
  
  // If no meals match, return at least some meals
  if (filtered.length === 0) {
    return meals.slice(0, 5);
  }
  
  return filtered;
};

