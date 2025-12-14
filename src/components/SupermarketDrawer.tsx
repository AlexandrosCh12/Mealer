import React from 'react';
import { MealPlanResponse } from '../types/meal';
import './SupermarketDrawer.css';

interface SupermarketDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  mealPlan: MealPlanResponse;
}

export const SupermarketDrawer: React.FC<SupermarketDrawerProps> = ({
  isOpen,
  onClose,
  mealPlan,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-header">
          <h2>Supermarkets & Prices</h2>
          <button className="drawer-close" onClick={onClose}>×</button>
        </div>

        <div className="drawer-content">
          <section className="supermarkets-section">
            <h3>Recommended Supermarkets</h3>
            <div className="supermarkets-list">
              {mealPlan.recommended_supermarkets.map((supermarket) => (
                <div key={supermarket.rank} className="supermarket-item">
                  <div className="supermarket-rank">#{supermarket.rank}</div>
                  <div className="supermarket-info">
                    <div className="supermarket-name">{supermarket.name}</div>
                    <div className="supermarket-reason">{supermarket.reason}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="ingredients-section">
            <h3>Weekly Ingredients List</h3>
            <div className="ingredients-list">
              {mealPlan.weekly_ingredients_list.map((ingredient, index) => (
                <div key={index} className="ingredient-item">
                  <div className="ingredient-header">
                    <strong>{ingredient.ingredient}</strong>
                    <span className="ingredient-portion">{ingredient.total_weekly_portion_needed}</span>
                  </div>
                  <div className="supermarket-options">
                    {ingredient.supermarket_options.map((option, optIndex) => (
                      <div key={optIndex} className="supermarket-option">
                        <div className="option-line">
                          <span className="option-supermarket">{option.supermarket}</span>
                          <span className="option-separator">·</span>
                          <span className="option-package">{option.sold_package}</span>
                          <span className="option-separator">·</span>
                          <span className="option-price">{option.package_price}</span>
                          {option.notes.toLowerCase().includes('best') && (
                            <span className="option-badge">Best budget option</span>
                          )}
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
          </section>
        </div>
      </div>
    </>
  );
};

