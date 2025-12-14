import React, { useState, useEffect } from 'react';
import { DayMealPlan } from '../types/meal';
import { getZeroWasteInsights } from '../api/mealPlanApi';

interface ZeroWasteInsightsProps {
  weeklyPlan: DayMealPlan[];
}

export const ZeroWasteInsights: React.FC<ZeroWasteInsightsProps> = ({ weeklyPlan }) => {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        const data = await getZeroWasteInsights(weeklyPlan);
        setInsights(data);
      } catch (error) {
        console.error('Failed to load zero-waste insights:', error);
      } finally {
        setLoading(false);
      }
    };
    loadInsights();
  }, [weeklyPlan]);

  if (loading) {
    return (
      <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        Loading zero-waste insights...
      </div>
    );
  }

  if (!insights || insights.reused_ingredients.length === 0) {
    return (
      <div style={{
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: '#fff3cd',
        borderRadius: '8px',
        border: '1px solid #ffc107',
      }}>
        <strong>💡 Zero-Waste Tip:</strong> {insights?.message || 'Consider meal prep to reduce food waste by reusing ingredients.'}
      </div>
    );
  }

  return (
    <div style={{
      marginBottom: '2rem',
      padding: '1.5rem',
      backgroundColor: '#d1ecf1',
      borderRadius: '8px',
      border: '1px solid #bee5eb',
    }}>
      <h4 style={{ marginTop: 0, marginBottom: '1rem' }}>🌱 Zero-Waste Insights</h4>
      <div style={{ marginBottom: '1rem' }}>
        <strong>{insights.message}</strong>
      </div>
      {insights.reused_ingredients.length > 0 && (
        <div>
          <strong>Reused ingredients:</strong>
          <ul style={{ marginTop: '0.5rem', marginBottom: 0 }}>
            {insights.reused_ingredients.slice(0, 5).map((ing: string, index: number) => {
              const meals = Array.from(insights.meals_using_ingredient.get(ing) || []);
              return (
                <li key={index}>
                  <strong>{ing}</strong> - used in {meals.length} meals: {meals.join(', ')}
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {insights.waste_reduction_percentage > 0 && (
        <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#0c5460' }}>
          Estimated waste reduction: {insights.waste_reduction_percentage}%
        </div>
      )}
    </div>
  );
};

