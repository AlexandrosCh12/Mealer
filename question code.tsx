import React, { useState } from 'react';
import { questions } from '../data/questions';
import { OnboardingAnswers } from '../types';
import { TextQuestion } from './TextQuestion';
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion';
import { Summary } from './Summary';

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
    return <Summary answers={answers} />;
  }

  return (
    <div className="wizard-container">
      <div className="progress-indicator">
        Question {currentStep + 1} of {questions.length}
      </div>

      <div className="question-wrapper">
        {currentQuestion.type === 'text' ? (
          <TextQuestion
            label={currentQuestion.label}
            value={answers[currentQuestion.id]}
            onChange={handleAnswerChange}
          />
        ) : (
          <MultipleChoiceQuestion
            label={currentQuestion.label}
            options={currentQuestion.options || []}
            value={answers[currentQuestion.id]}
            onChange={handleAnswerChange}
          />
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

