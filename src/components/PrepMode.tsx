import React, { useState, useEffect } from 'react';
import { DayMealPlan } from '../types/meal';
import { generatePrepMode } from '../api/mealPlanApi';

interface PrepModeProps {
  weeklyPlan: DayMealPlan[];
}

export const PrepMode: React.FC<PrepModeProps> = ({ weeklyPlan }) => {
  const [prepData, setPrepData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPrepMode = async () => {
      try {
        const data = await generatePrepMode(weeklyPlan);
        setPrepData(data);
      } catch (error) {
        console.error('Failed to load prep mode:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPrepMode();
  }, [weeklyPlan]);

  if (loading) {
    return (
      <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        Loading prep mode...
      </div>
    );
  }

  if (!prepData || prepData.prep_groups.length === 0) {
    return (
      <div style={{
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: '#e7f3ff',
        borderRadius: '8px',
        border: '1px solid #b3d9ff',
      }}>
        <strong>📋 Prep Mode:</strong> No shared ingredients detected for bulk prep this week.
      </div>
    );
  }

  return (
    <div style={{
      marginBottom: '2rem',
      padding: '1.5rem',
      backgroundColor: '#e7f3ff',
      borderRadius: '8px',
      border: '1px solid #b3d9ff',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ margin: 0 }}>📋 Prep Mode</h4>
        <div style={{ fontSize: '0.9rem', color: '#004085' }}>
          ⏱️ Time saved: {prepData.total_time_saved}
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {prepData.prep_groups.map((group: any, index: number) => (
          <div
            key={index}
            style={{
              padding: '1rem',
              backgroundColor: '#fff',
              borderRadius: '6px',
              border: '1px solid #b3d9ff',
            }}
          >
            <div style={{ marginBottom: '0.75rem' }}>
              <strong>Shared ingredients:</strong> {group.shared_ingredients.join(', ')}
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <strong>Meals:</strong> {group.meals.join(', ')}
            </div>
            <div>
              <strong>Prep steps:</strong>
              <ul style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                {group.prep_steps.map((step: string, stepIndex: number) => (
                  <li key={stepIndex}>{step}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

