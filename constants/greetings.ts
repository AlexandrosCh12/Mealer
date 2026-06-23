const MORNING_GREETINGS = [
  'Good morning',
  'Rise and shine',
  'Morning',
  'Hello sunshine',
  'Top of the morning',
  'Bright and early',
];

const AFTERNOON_GREETINGS = [
  'Good afternoon',
  'Hello there',
  'Hey',
  'Hope your day is going well',
  'Afternoon',
];

const EVENING_GREETINGS = [
  'Good evening',
  'Evening',
  'Hope you had a great day',
  'Welcome back',
  'Hello',
];

const NIGHT_GREETINGS = [
  'Hey night owl',
  'Burning the midnight oil',
  'Late night cravings?',
  'Hello night owl',
];

export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  let pool: string[];
  if (hour < 5) pool = NIGHT_GREETINGS;
  else if (hour < 12) pool = MORNING_GREETINGS;
  else if (hour < 17) pool = AFTERNOON_GREETINGS;
  else if (hour < 22) pool = EVENING_GREETINGS;
  else pool = NIGHT_GREETINGS;

  const today = new Date();
  const seed =
    today.getDate() +
    today.getMonth() * 31 +
    (hour < 5 ? 0 : hour < 12 ? 1 : hour < 17 ? 2 : hour < 22 ? 3 : 4) * 1000;
  const index = seed % pool.length;
  return pool[index];
}
