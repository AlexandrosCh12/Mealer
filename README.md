# Mealer - Onboarding Flow

A TypeScript React SPA for collecting user onboarding information through a step-by-step questionnaire.

## Tech Stack

- React 18
- TypeScript
- Vite
- Functional components with hooks

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Features

- Step-by-step onboarding flow with 13 questions
- Progress indicator showing current question number
- Text input questions for open-ended answers
- Multiple-choice questions with button selection
- Validation to prevent skipping questions
- Final summary screen displaying all answers as JSON

## Project Structure

```
src/
  ├── components/
  │   ├── OnboardingWizard.tsx    # Main wizard component
  │   ├── TextQuestion.tsx         # Text input question component
  │   ├── MultipleChoiceQuestion.tsx # Multiple choice question component
  │   └── Summary.tsx              # Final summary screen
  ├── data/
  │   └── questions.ts             # Question configuration array
  ├── types.ts                     # TypeScript type definitions
  ├── App.tsx                      # Main app component
  ├── main.tsx                     # Entry point
  ├── App.css                      # Component styles
  └── index.css                    # Global styles
```

## Questions Flow

The onboarding collects the following information:
1. Current weight
2. Height
3. Ideal weight goal
4. Fitness goal (multiple choice)
5. Workout frequency (multiple choice)
6. Dietary restrictions
7. Food allergies
8. Food dislikes
9. Weekly budget level (multiple choice)
10. Country
11. City
12. Cooking skill level (multiple choice)
13. Daily cooking time (multiple choice)

