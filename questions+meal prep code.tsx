import React, { useState } from 'react';

type OnboardingAnswers = {
  weight: string;
  height: string;
  ideal_weight_goal: string;
  fitness_goal: string;
  workout_frequency: string;
  dietary_restrictions: string;
  allergies: string;
  food_dislikes: string;
  budget_level: string;
  country: string;
  city: string;
  cooking_skill: string;
  daily_cooking_time: string;
};

const initialAnswers: OnboardingAnswers = {
  weight: '',
  height: '',
  ideal_weight_goal: '',
  fitness_goal: '',
  workout_frequency: '',
  dietary_restrictions: '',
  allergies: '',
  food_dislikes: '',
  budget_level: '',
  country: '',
  city: '',
  cooking_skill: '',
  daily_cooking_time: '',
};

export const OnboardingWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>(initialAnswers);

  const questions = [
    { id: 'weight', label: 'What is your current weight?', type: 'text' },
    { id: 'height', label: 'What is your height?', type: 'text' },
    { id: 'ideal_weight_goal', label: 'What is your ideal weight goal?', type: 'text' },
    { id: 'fitness_goal', label: 'What is your main fitness goal?', type: 'multiple', options: ['Lose weight', 'Build muscle', 'Maintain', 'Other'] },
    { id: 'workout_frequency', label: 'How many times do you work out per week?', type: 'multiple', options: ['0', '1-2', '3-4', '5+'] },
    { id: 'dietary_restrictions', label: 'Do you have any dietary restrictions?', type: 'text' },
    { id: 'allergies', label: 'Any food allergies?', type: 'text' },
    { id: 'food_dislikes', label: 'Foods you dislike?', type: 'text' },
    { id: 'budget_level', label: 'What is your food budget level?', type: 'multiple', options: ['Low', 'Medium', 'High'] },
    { id: 'country', label: 'Which country do you live in?', type: 'text' },
    { id: 'city', label: 'Which city do you live in?', type: 'text' },
    { id: 'cooking_skill', label: 'How would you rate your cooking skills?', type: 'multiple', options: ['Beginner', 'Intermediate', 'Expert'] },
    { id: 'daily_cooking_time', label: 'How much time can you spend cooking daily?', type: 'multiple', options: ['<15 min', '15-30 min', '30-60 min', '60+ min'] },
  ];

  const currentQuestion = questions[currentStep];
  const isLastQuestion = currentStep === questions.length - 1;
  const isComplete = currentStep >= questions.length;

  const handleAnswerChange = (value: string) => {
    setAnswers((prev: OnboardingAnswers) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleNext = () => {
    if (currentQuestion && answers[currentQuestion.id]) {
      if (isLastQuestion) {
        setCurrentStep((prev: number) => prev + 1);
      } else {
        setCurrentStep((prev: number) => prev + 1);
      }
    }
  };

  const canProceed = () => {
    if (!currentQuestion) return false;
    return !!answers[currentQuestion.id];
  };

  if (isComplete) {
    // To fix "Cannot find name 'Summary'", temporarily render a basic summary fallback:
    return (
      <div className="summary">
        <h2>Summary</h2>
        <pre>{JSON.stringify(answers, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div className="wizard-container">
      <div className="progress-indicator">
        Question {currentStep + 1} of {questions.length}
      </div>

      <div className="question-wrapper">
        {currentQuestion.type === 'text' ? (
          <input
            type="text"
            className="text-question"
            placeholder={currentQuestion.label}
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
          />
        ) : (
          // @ts-ignore: MultipleChoiceQuestion may not be defined yet
          <div>
            <label>{currentQuestion.label}</label>
            {(currentQuestion.options || []).map((option: string) => (
              <div key={option}>
                <label>
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    value={option}
                    checked={answers[currentQuestion.id] === option}
                    onChange={() => handleAnswerChange(option)}
                  />
                  {option}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="navigation-container">
        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed()}
          className="next-button"
        >
          {isLastQuestion ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
};

