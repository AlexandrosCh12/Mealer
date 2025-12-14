import React, { useState } from 'react';
import { MealPlanMeal } from '../types/meal';
import './MealCard.css';

interface MealCardProps {
  meal: MealPlanMeal;
  day: string;
  mealIndex: number;
  onSwap: () => void;
  isSwapping: boolean;
}

export const MealCard: React.FC<MealCardProps> = ({
  meal,
  onSwap,
  isSwapping,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getMealTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      snack: 'Snack',
      dinner: 'Dinner',
      preworkout: 'Pre-Workout',
    };
    return labels[type] || type;
  };

  // Parse description to extract ingredients and instructions
  const parseMealDescription = (description: string) => {
    const parts = description.split('. Ingredients: ');
    const mainDescription = parts[0] || description;
    
    let ingredients: string[] = [];
    let instructions: string[] = [];
    
    if (parts.length > 1) {
      const rest = parts[1];
      const instructionParts = rest.split('. Instructions: ');
      
      if (instructionParts.length > 0) {
        // Parse ingredients
        const ingredientsText = instructionParts[0];
        ingredients = ingredientsText.split(', ').map(ing => ing.trim());
      }
      
      if (instructionParts.length > 1) {
        // Parse instructions - format is "Step 1: ... Step 2: ..."
        const instructionsText = instructionParts[1];
        // Split by "Step " to get individual step blocks
        const stepBlocks = instructionsText.split(/(?=Step\s+\d+:)/);
        
        for (const block of stepBlocks) {
          if (!block.trim()) continue;
          
          // Extract step number and instruction
          const stepMatch = block.match(/Step\s+(\d+):\s*(.+)/s);
          if (stepMatch) {
            const stepNum = parseInt(stepMatch[1]);
            let instruction = stepMatch[2].trim();
            
            // Remove any "Step X:" that might be at the end (from next step)
            instruction = instruction.replace(/\s+Step\s+\d+:.*$/, '').trim();
            // Remove any "St" at the beginning (shouldn't happen, but just in case)
            instruction = instruction.replace(/^St\s*/i, '').trim();
            
            if (instruction && !isNaN(stepNum)) {
              instructions.push({ step: stepNum, instruction });
            }
          }
        }
      }
    }
    
    return { mainDescription, ingredients, instructions };
  };

  const { mainDescription, ingredients, instructions } = parseMealDescription(meal.description);

  return (
    <div className="meal-card">
      {/* Meal Image */}
      <div className="meal-image-container">
        <div className="meal-image-placeholder">
          {meal.title.charAt(0).toUpperCase()}
        </div>
      </div>

      <div className="meal-card-content">
        <div className="meal-card-header">
          <span className="meal-type-badge">{getMealTypeLabel(meal.meal_type)}</span>
          <span className="meal-title">{meal.title}</span>
        </div>

        <div className="meal-macros">
          {meal.calories} kcal · {meal.macros.protein}g protein · {meal.macros.carbs}g carbs · {meal.macros.fats}g fat
        </div>

        <p className="meal-description">{mainDescription}</p>

        {/* Details Toggle Button */}
        <button
          className="details-toggle-button"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? '▼ Hide Details' : '▶ Show Full Details'}
        </button>

        {/* Expanded Details */}
        {showDetails && (
          <div className="meal-details-expanded">
            {ingredients.length > 0 && (
              <div className="details-section">
                <h4 className="details-section-title">Ingredients & Measurements</h4>
                <ul className="ingredients-list">
                  {ingredients.map((ingredient, index) => (
                    <li key={index} className="ingredient-item">
                      <span className="ingredient-text">{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {instructions.length > 0 && (
              <div className="details-section">
                <h4 className="details-section-title">Cooking Instructions</h4>
                <ol className="instructions-list">
                  {instructions.map((inst, index) => (
                    <li key={index} className="instruction-item">
                      {inst.instruction}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {ingredients.length === 0 && instructions.length === 0 && (
              <div className="details-section">
                <p className="full-description">{meal.description}</p>
              </div>
            )}
          </div>
        )}

        <button
          className="swap-meal-button"
          onClick={onSwap}
          disabled={isSwapping}
        >
          {isSwapping ? 'Swapping...' : 'Swap meal'}
        </button>
      </div>
    </div>
  );
};
