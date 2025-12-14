# Mealer Backend API

Express + TypeScript backend for the Mealer meal planning application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The server will run on `http://localhost:3001` by default.

## API Endpoints

### POST /api/generate-meal-plan
Generates a weekly meal plan based on user profile.

**Request Body:**
```json
{
  "weight": "70",
  "height": "175",
  "ideal_weight_goal": "75",
  "fitness_goal": "Bulk up",
  "workout_frequency": "4-5 times per week",
  "dietary_restrictions": "none",
  "allergies": "none",
  "food_dislikes": "none",
  "budget_level": "Medium / normal budget",
  "country": "Greece",
  "city": "Thessaloniki",
  "cooking_skill": "Intermediate",
  "daily_cooking_time": "20–40 minutes"
}
```

**Response:**
```json
{
  "weekly_meal_plan": { ... },
  "weekly_ingredients_list": [ ... ],
  "recommended_supermarkets": [ ... ],
  "next_action_to_take": "..."
}
```

### POST /api/swap-meal
Swaps a single meal in the weekly plan.

**Request Body:**
```json
{
  "userProfile": { ... },
  "day": "Monday",
  "mealIndex": 0,
  "currentMeal": { ... },
  "currentWeeklyPlan": { ... }
}
```

**Response:**
Returns updated `MealPlanResponse` with the swapped meal and regenerated ingredients list.

## Project Structure

```
backend/
├── src/
│   ├── controllers/    # Request handlers
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── types/          # TypeScript types
│   └── data/           # Meal and store data
└── package.json
```

