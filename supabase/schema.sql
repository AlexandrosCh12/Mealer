-- Mealer Supabase schema
-- Run in Supabase SQL Editor (Dashboard → SQL → New query)

-- Profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  age int not null,
  weight_kg float not null,
  height_cm float not null,
  goal text not null check (goal in ('lose_weight', 'gain_muscle', 'maintain')),
  diet_type text not null check (
    diet_type in ('omnivore', 'vegetarian', 'vegan', 'keto', 'mediterranean')
  ),
  allergies text[] not null default '{}',
  budget_weekly_eur float not null,
  city text not null,
  country text not null,
  activity_level text not null check (
    activity_level in ('sedentary', 'moderate', 'active')
  ),
  gender text not null,
  created_at timestamptz not null default now()
);

-- Meal plans table
create table if not exists public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  date date not null,
  meals jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.meal_plans enable row level security;

-- Profiles policies: users can read/insert/update their own row
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Meal plans policies
create policy "Users can view own meal plans"
  on public.meal_plans for select
  using (auth.uid() = user_id);

create policy "Users can insert own meal plans"
  on public.meal_plans for insert
  with check (auth.uid() = user_id);

create policy "Users can update own meal plans"
  on public.meal_plans for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own meal plans"
  on public.meal_plans for delete
  using (auth.uid() = user_id);

-- Indexes
create index if not exists meal_plans_user_date_idx
  on public.meal_plans (user_id, date desc);
