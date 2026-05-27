# Mealer

React Native meal planning app built with Expo SDK 52, Expo Router, TypeScript, and Supabase.

## Setup

1. Copy `.env.example` to `.env` and add your Supabase credentials.
2. Run the SQL in `supabase/schema.sql` in your Supabase project.
3. Install dependencies: `npm install`
4. Align Expo packages: `npx expo install --fix`
5. Add app icons to `assets/` (or run `npx expo prebuild` after adding icons).
6. Start: `npx expo start`

## Stack

- Expo SDK 52 · Expo Router ~4 · TypeScript
- Supabase Auth + Postgres
- Reanimated · Gesture Handler · SVG · AsyncStorage
