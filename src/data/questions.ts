import { Question } from '../types';

export const questions: Question[] = [
  {
    id: 'weight',
    type: 'text',
    label: 'What is your current weight? (in kg or lbs)',
  },
  {
    id: 'height',
    type: 'text',
    label: 'What is your height? (in cm or ft/in)',
  },
  {
    id: 'ideal_weight_goal',
    type: 'text',
    label: 'What is your ideal weight goal?',
  },
  {
    id: 'fitness_goal',
    type: 'multiple-choice',
    label: 'Which of the following best describes your goal?',
    options: [
      { label: 'Bulk up', value: 'Bulk up' },
      { label: 'Maintain', value: 'Maintain' },
      { label: 'Lose weight', value: 'Lose weight' },
    ],
  },
  {
    id: 'workout_frequency',
    type: 'multiple-choice',
    label: 'How often do you work out?',
    options: [
      { label: 'I don\'t work out', value: 'I don\'t work out' },
      { label: '1–3 times per week', value: '1–3 times per week' },
      { label: '4+ times per week', value: '4+ times per week' },
    ],
  },
  {
    id: 'dietary_restrictions',
    type: 'text',
    label: 'Do you have any dietary restrictions? If yes, type them. If not, type \'None\'.',
  },
  {
    id: 'allergies',
    type: 'text',
    label: 'Do you have any food allergies? If yes, type them. If not, type \'None\'.',
  },
  {
    id: 'food_dislikes',
    type: 'text',
    label: 'Are there any foods you dislike or want to avoid? If yes, type them. If not, type \'None\'.',
  },
  {
    id: 'budget_level',
    type: 'multiple-choice',
    label: 'What is your weekly budget level?',
    options: [
      { label: 'Tight budget', value: 'Tight budget' },
      { label: 'Medium / normal budget', value: 'Medium / normal budget' },
      { label: 'No budget limit', value: 'No budget limit' },
    ],
  },
  {
    id: 'country',
    type: 'text',
    label: 'What country do you live in?',
  },
  {
    id: 'city',
    type: 'text',
    label: 'What city do you live in?',
  },
  {
    id: 'cooking_skill',
    type: 'multiple-choice',
    label: 'What is your cooking skill level?',
    options: [
      { label: 'Beginner', value: 'Beginner' },
      { label: 'Intermediate', value: 'Intermediate' },
      { label: 'Advanced', value: 'Advanced' },
    ],
  },
  {
    id: 'daily_cooking_time',
    type: 'multiple-choice',
    label: 'How much time do you have available per day to cook?',
    options: [
      { label: 'Under 20 minutes', value: 'Under 20 minutes' },
      { label: '20–40 minutes', value: '20–40 minutes' },
      { label: '40+ minutes', value: '40+ minutes' },
    ],
  },
];

