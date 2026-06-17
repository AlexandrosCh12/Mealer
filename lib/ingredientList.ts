import type { WeeklyPlan } from './weeklyMealPlan';

export interface IngredientItem {
  id: string;
  name: string;
  checked: boolean;
  estimatedCost: number;
}

// Realistic Greek supermarket package prices in euros (checkout price per standard package)
const INGREDIENT_COSTS: Record<string, number> = {
  // Meat & Fish (per package)
  'chicken breast': 5.5, // ~500g pack
  salmon: 7.9, // ~300g fillet pack
  'salmon fillet': 7.9,
  tuna: 2.5, // 160g can
  shrimp: 8.5, // 300g frozen pack
  'minced beef': 6.2, // 500g pack
  'minced turkey': 5.5, // 500g pack
  turkey: 5.5,

  // Eggs & Dairy
  eggs: 3.2, // 10-pack
  'boiled eggs': 3.2,
  'Greek yogurt': 2.5, // 500g tub (Chobani/Fage style)
  'feta cheese': 2.8, // 200g block
  feta: 2.8,
  milk: 1.6, // 1L full fat
  'whey protein': 3.5, // per ~2 serving estimate
  'protein powder': 3.5,
  cheddar: 3.2, // 200g sliced pack

  // Bread & Grains
  oats: 2.2, // 500g pack (Quaker etc)
  'brown rice': 1.8, // 500g pack
  quinoa: 3.8, // 400g pack
  pasta: 1.4, // 500g pack (De Cecco etc)
  'pita bread': 2.2, // pack of 6-8
  'sourdough bread': 3.2, // artisan loaf
  'whole wheat bread': 2.2, // standard loaf
  'rice cakes': 2.5, // pack of 10-12
  crackers: 2.2, // pack
  bread: 2.2, // standard loaf
  flour: 1.4, // 1kg bag

  // Fresh Produce (priced as you would buy them)
  avocado: 1.5, // each (ripe)
  banana: 1.8, // bunch of ~5-6
  'mixed berries': 3.8, // 300g punnet (frozen or fresh)
  'cherry tomatoes': 2.2, // 250g punnet
  tomatoes: 1.5, // 500g loose/bag
  spinach: 1.8, // 200g bag (baby spinach)
  broccoli: 1.5, // 1 head ~400g
  cucumber: 0.9, // 1 large
  lettuce: 1.4, // 1 head
  'bell peppers': 1.8, // each (red/yellow)
  eggplant: 1.2, // 1 large
  'green beans': 2.0, // 400g fresh or frozen
  'carrot sticks': 1.5, // bag pre-cut
  carrots: 1.2, // bunch/bag
  asparagus: 3.2, // bunch ~300g
  zucchini: 1.0, // 1 piece
  lemon: 0.6, // each
  garlic: 1.0, // bulb or small pack
  onion: 0.8, // each medium
  'red onion': 0.9, // each
  parsley: 1.0, // bunch fresh
  mint: 1.0, // bunch fresh
  celery: 1.5, // head/bunch

  // Canned & Legumes
  lentils: 1.8, // 500g dry pack
  chickpeas: 1.4, // 400g can (Kyknos etc)
  hummus: 2.2, // 200g tub (Sabra/store brand)
  olives: 2.5, // 200g jar pitted

  // Plant Proteins
  tofu: 2.8, // 400g block (Taifun etc)

  // Oils & Condiments
  'olive oil': 5.5, // 750ml bottle (Minerva etc)
  honey: 4.5, // 450g jar Greek honey
  'almond butter': 5.8, // 340g jar
  'peanut butter': 3.5, // 400g jar (Skippy/store brand)
  tahini: 3.8, // 300g jar
  tzatziki: 2.5, // 200g tub
  'basil pesto': 3.2, // 190g jar (Barilla etc)
  'lemon juice': 1.5, // bottle
  cinnamon: 2.2, // jar ~30g
  'chili flakes': 1.8, // jar
  'vanilla extract': 3.5, // small bottle
  sesame: 2.0, // 100g pack

  // Nuts & Seeds
  almonds: 4.2, // 200g bag
  walnuts: 4.5, // 200g bag
  'almond milk': 2.8, // 1L carton (Alpro etc)
  'chia seeds': 4.2, // 250g pack
  'dark chocolate chips': 3.2, // 200g bag (Callebaut etc)
  'dried cranberries': 3.0, // 150g pack

  // Sauces & Extras
  'soy sauce': 2.2,
  'rice noodles': 2.5, // 250g pack
  apple: 2.0, // bag of 4-6
};

export function buildWeeklyIngredientList(
  weeklyPlan: WeeklyPlan,
  budgetEur: number,
  priceMultiplier: number = 1.0
): IngredientItem[] {
  const ingredientSet = new Set<string>();

  for (const day of weeklyPlan.days) {
    for (const meal of day.meals) {
      for (const ingredient of meal.ingredients) {
        ingredientSet.add(ingredient.toLowerCase().trim());
      }
    }
  }

  const items: IngredientItem[] = [];
  let totalCost = 0;

  for (const name of ingredientSet) {
    const unitCost = INGREDIENT_COSTS[name] ?? 1.0;
    const cost = Math.round(unitCost * priceMultiplier * 100) / 100;
    totalCost += cost;
    items.push({
      id: name.replace(/\s+/g, '_'),
      name: name.charAt(0).toUpperCase() + name.slice(1),
      checked: false,
      estimatedCost: cost,
    });
  }

  // Scale costs to fit budget if over
  if (totalCost > budgetEur) {
    const scale = budgetEur / totalCost;
    return items
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((item) => ({
        ...item,
        estimatedCost: Math.round(item.estimatedCost * scale * 100) / 100,
      }));
  }

  return items.sort((a, b) => a.name.localeCompare(b.name));
}

export function getTotalCost(items: IngredientItem[]): number {
  return (
    Math.round(items.reduce((sum, item) => sum + item.estimatedCost, 0) * 100) /
    100
  );
}
