export type QuestionType = 'text' | 'multiple-choice';

export interface MultipleChoiceOption {
  label: string;
  value: string;
}

export interface Question {
  id: keyof OnboardingAnswers;
  type: QuestionType;
  label: string;
  options?: MultipleChoiceOption[];
}

export interface OnboardingAnswers {
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
}

