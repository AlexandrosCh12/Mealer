import { Meal } from '../types/meal';
import { UserProfile } from '../types/userProfile';
import { meals } from '../data/meals';

export const filterMeals = (userProfile: UserProfile): Meal[] => {
  let filtered = [...meals];
  
  // Filter by fitness goal
  if (userProfile.fitness_goal) {
    filtered = filtered.filter(meal => 
      meal.fitnessGoal.includes(userProfile.fitness_goal)
    );
  }
  
  // Filter by dietary restrictions
  if (userProfile.dietary_restrictions && 
      userProfile.dietary_restrictions.toLowerCase() !== 'none') {
    const restrictions = userProfile.dietary_restrictions.toLowerCase();
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
  if (userProfile.allergies && userProfile.allergies.toLowerCase() !== 'none') {
    const allergies = userProfile.allergies.toLowerCase();
    filtered = filtered.filter(meal => {
      const mealIngredients = meal.ingredients.map(i => i.name.toLowerCase()).join(' ');
      return !allergies.split(',').some(allergy => 
        mealIngredients.includes(allergy.trim())
      );
    });
  }
  
  // Filter by food dislikes
  if (userProfile.food_dislikes && userProfile.food_dislikes.toLowerCase() !== 'none') {
    const dislikes = userProfile.food_dislikes.toLowerCase();
    filtered = filtered.filter(meal => {
      const mealIngredients = meal.ingredients.map(i => i.name.toLowerCase()).join(' ');
      return !dislikes.split(',').some(dislike => 
        mealIngredients.includes(dislike.trim())
      );
    });
  }
  
  // Filter by cooking skill level
  if (userProfile.cooking_skill) {
    const skillLevels = ['Beginner', 'Intermediate', 'Advanced'];
    const userSkillIndex = skillLevels.indexOf(userProfile.cooking_skill);
    filtered = filtered.filter(meal => {
      const mealSkillIndex = skillLevels.indexOf(meal.skillLevel);
      return mealSkillIndex <= userSkillIndex + 1; // Allow one level above
    });
  }
  
  // Filter by cooking time
  if (userProfile.daily_cooking_time) {
    filtered = filtered.filter(meal => {
      if (userProfile.daily_cooking_time === 'Under 20 minutes') {
        return meal.cookingTime === 'Under 20 minutes';
      }
      if (userProfile.daily_cooking_time === '20–40 minutes') {
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

