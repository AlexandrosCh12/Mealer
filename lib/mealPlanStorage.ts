/**
 * Weekly meal plan persistence — load, generate, and save plans in Supabase.
 *
 * One plan per user per calendar week (keyed by Monday `week_start`).
 * Falls back to generateWeeklyPlan when no valid cached plan exists.
 * Home screen also mirrors plans to AsyncStorage for offline tab access.
 */
/*
  Run in Supabase SQL Editor:

  alter table meal_plans add column if not exists week_start date;
  update meal_plans set week_start = date where week_start is null;
  alter table meal_plans drop constraint if exists meal_plans_user_id_date_key;
  alter table meal_plans add constraint meal_plans_user_id_week_start_key
    unique (user_id, week_start);
*/

import { supabase } from './supabase';
import { generateWeeklyPlan, getWeekStart, type WeeklyPlan } from './weeklyMealPlan';
import type { Profile } from '@/types';

/**
 * Upserts a weekly plan after local edits (e.g. meal swap on Home).
 *
 * @param userId - Owner's Supabase auth id.
 * @param weeklyPlan - Full week structure including all day plans.
 */
export async function saveWeeklyPlan(
  userId: string,
  weeklyPlan: WeeklyPlan
): Promise<void> {
  const weekStart = weeklyPlan.weekStart;
  const { error } = await supabase
    .from('meal_plans')
    .upsert(
      {
        user_id: userId,
        week_start: weekStart,
        date: weekStart,
        meals: weeklyPlan,
      },
      { onConflict: 'user_id,week_start' }
    );
  if (error) {
    console.error('Failed to save plan after swap:', error.message);
  }
}

/**
 * Returns the current week's plan from Supabase, or generates a new one.
 *
 * Parses stored JSON safely; corrupt or legacy rows trigger regeneration.
 *
 * @param userId - Owner's Supabase auth id.
 * @param profile - Used to generate a fresh plan when none is stored.
 * @returns WeeklyPlan for the week containing today.
 */
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
      const parsed =
        typeof data.meals === 'string' ? JSON.parse(data.meals) : data.meals;
      if (parsed && parsed.days && parsed.weekStart) {
        return parsed as WeeklyPlan;
      }
    } catch {
      // Fall through to regenerate
    }
  }

  // Generate new weekly plan
  const weeklyPlan = generateWeeklyPlan(profile);

  const { error: upsertError } = await supabase
    .from('meal_plans')
    .upsert(
      {
        user_id: userId,
        week_start: weekStart,
        date: weekStart,
        meals: weeklyPlan,
      },
      { onConflict: 'user_id,week_start' }
    );

  if (upsertError) {
    console.error('Failed to save weekly plan:', upsertError.message);
  }

  return weeklyPlan;
}
