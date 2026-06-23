import { generateMealPlan } from './mealGenerator';
import type { Meal, Profile } from '@/types';

export interface DayPlan {
  date: string; // ISO date string YYYY-MM-DD
  meals: Meal[];
  targetCalories: number;
  actualCalories: number;
}

export interface WeeklyPlan {
  weekStart: string; // Monday ISO date
  days: DayPlan[];
  generatedAt: string;
}

export function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const dayStr = String(d.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + dayStr;
}

export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

export function generateWeeklyPlan(profile: Profile): WeeklyPlan {
  const weekStart = getWeekStart(new Date());
  const days: DayPlan[] = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    // Use the calorie-aware generator, keeping all meals (including extra snacks)
    const plan = generateMealPlan(profile);

    days.push({
      date: dateStr,
      meals: plan.meals,
      targetCalories: plan.targetCalories,
      actualCalories: plan.actualCalories,
    });
  }

  return {
    weekStart,
    days,
    generatedAt: new Date().toISOString(),
  };
}

export function getTodayPlan(weeklyPlan: WeeklyPlan): DayPlan | null {
  const today = getTodayString();
  return weeklyPlan.days.find((d) => d.date === today) ?? null;
}
