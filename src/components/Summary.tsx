import React, { useState, useEffect } from 'react';
import { OnboardingAnswers } from '../types';
import { questions } from '../data/questions';
import { generateMealPlan as generateMealPlanApi } from '../api/mealPlanApi';
import { MealPlanResponse } from '../types/meal';
import { MealPlan } from './MealPlan';

interface SummaryProps {
  answers: OnboardingAnswers;
}

export const Summary: React.FC<SummaryProps> = ({ answers }) => {
  const [mealPlanResponse, setMealPlanResponse] = useState<MealPlanResponse | null>(null);
  const [showAnswers, setShowAnswers] = useState(false); // Default to meal plan view
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMealPlan = async () => {
      setLoading(true);
      setError(null);
      try {
        const plan = await generateMealPlanApi(answers);
        setMealPlanResponse(plan);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load meal plan');
        console.error('Failed to load meal plan:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadMealPlan();
  }, [answers]);

  return (
    <div className="summary-container">
      <h2 className="summary-title">Onboarding Complete!</h2>
      
      <div className="summary-tabs">
        <button
          className={`tab-button ${showAnswers ? 'active' : ''}`}
          onClick={() => setShowAnswers(true)}
        >
          Your Answers
        </button>
        <button
          className={`tab-button ${!showAnswers ? 'active' : ''}`}
          onClick={() => setShowAnswers(false)}
        >
          Meal Plan
        </button>
      </div>

      {showAnswers ? (
        <>
          <p className="summary-subtitle">Here are your answers:</p>
          <div className="answers-board">
            {questions.map((question) => (
              <div key={question.id} className="answer-item">
                <div className="answer-label">{question.label}</div>
                <div className="answer-value">{answers[question.id] || 'Not answered'}</div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {loading && <p style={{ textAlign: 'center', padding: '2rem' }}>Loading meal plan...</p>}
          {error && (
            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#f8d7da', 
              color: '#721c24', 
              borderRadius: '4px',
              margin: '1rem',
            }}>
              Error: {error}
            </div>
          )}
          {mealPlanResponse && !loading && (
            <MealPlan 
              mealPlanResponse={mealPlanResponse} 
              userProfile={answers}
              onMealPlanUpdate={setMealPlanResponse}
            />
          )}
        </>
      )}
    </div>
  );
};

