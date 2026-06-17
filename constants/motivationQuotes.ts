export const MOTIVATION_QUOTES = [
  {
    quote: "Take care of your body. It's the only place you have to live.",
    author: 'Jim Rohn',
  },
  {
    quote: 'The groundwork for all happiness is good health.',
    author: 'Leigh Hunt',
  },
  {
    quote: 'Let food be thy medicine and medicine be thy food.',
    author: 'Hippocrates',
  },
  { quote: 'To keep the body in good health is a duty.', author: 'Buddha' },
  {
    quote: 'A healthy outside starts from the inside.',
    author: 'Robert Urich',
  },
  { quote: 'It is health that is real wealth.', author: 'Mahatma Gandhi' },
  { quote: 'The first wealth is health.', author: 'Ralph Waldo Emerson' },
  { quote: 'Eat well, live well, be well.', author: 'Unknown' },
  {
    quote: 'Your body is a reflection of your lifestyle.',
    author: 'Unknown',
  },
  {
    quote: 'Small steps every day lead to big changes over time.',
    author: 'Unknown',
  },
  {
    quote:
      'Discipline is choosing between what you want now and what you want most.',
    author: 'Abraham Lincoln',
  },
  {
    quote: 'Every day is a new chance to make healthy choices.',
    author: 'Unknown',
  },
  {
    quote: "You don't have to be perfect. You just have to be consistent.",
    author: 'Unknown',
  },
  { quote: "Fuel your body. It's the only one you get.", author: 'Unknown' },
];

export function getDailyQuote(): { quote: string; author: string } {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      86400000
  );
  return MOTIVATION_QUOTES[dayOfYear % MOTIVATION_QUOTES.length];
}
