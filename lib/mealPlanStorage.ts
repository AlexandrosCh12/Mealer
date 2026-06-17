/*
  Run in Supabase SQL Editor before using this file:

  alter table meal_plans add column if not exists week_start date;

  update meal_plans set week_start = date where week_start is null;
*/

import { supabase } from './supabase';
import { generateWeeklyPlan, getWeekStart, type WeeklyPlan } from './weeklyMealPlan';
import type { Profile } from '@/types';

export async function loadOrGenerateWeeklyPlan(
  userId: string,
  profile: Profile
): Promise<WeeklyPlan> {
  const weekStart = getWeekStart(new Date());

  const { data, error } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .maybeSingle();

  if (data && !error) {
    try {
      return JSON.parse(
        typeof data.meals === 'string' ? data.meals : JSON.stringify(data.meals)
      ) as WeeklyPlan;
    } catch {
      // Fall through to regenerate
    }
  }

  // Generate new weekly plan
  const weeklyPlan = generateWeeklyPlan(profile);

  await supabase.from('meal_plans').upsert({
    user_id: userId,
    week_start: weekStart,
    date: weekStart,
    meals: JSON.stringify(weeklyPlan),
  });

  return weeklyPlan;
}
