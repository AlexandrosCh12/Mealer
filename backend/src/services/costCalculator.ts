import { WeeklyIngredient, RecommendedSupermarket, WeeklyCostSummary } from '../types';
import { UserProfile } from '../types/userProfile';
import { getStoresForLocation } from '../data/stores';

/**
 * Calculate weekly cost summary for a meal plan
 */
export const calculateWeeklyCost = (
  ingredientsList: WeeklyIngredient[],
  userProfile: UserProfile
): WeeklyCostSummary => {
  const locationStores = getStoresForLocation(userProfile.country, userProfile.city);
  
  // Calculate total cost per supermarket
  const supermarketCosts: Map<string, number> = new Map();
  
  ingredientsList.forEach(ingredient => {
    ingredient.supermarket_options.forEach(option => {
      const cost = parseFloat(option.portion_cost_estimate.replace(/[^\d.]/g, '')) || 0;
      const current = supermarketCosts.get(option.supermarket) || 0;
      supermarketCosts.set(option.supermarket, current + cost);
    });
  });
  
  // Find cheapest and premium options
  let cheapest = { name: '', cost: Infinity };
  let premium = { name: '', cost: 0 };
  
  supermarketCosts.forEach((cost, name) => {
    if (cost < cheapest.cost) {
      cheapest = { name, cost };
    }
    if (cost > premium.cost) {
      premium = { name, cost };
    }
  });
  
  const savings = premium.cost - cheapest.cost;
  
  // Format currency based on country (simplified)
  const currency = getCurrencyForCountry(userProfile.country);
  
  return {
    cheapest_option: cheapest.name || 'Local Supermarket',
    estimated_total: `${currency}${cheapest.cost.toFixed(2)}`,
    savings_vs_premium: `${currency}${savings.toFixed(2)}`,
  };
};

/**
 * Get recommended supermarkets based on budget and location
 */
export const getRecommendedSupermarkets = (
  userProfile: UserProfile,
  ingredientsList: WeeklyIngredient[]
): RecommendedSupermarket[] => {
  const locationStores = getStoresForLocation(userProfile.country, userProfile.city);
  
  // Calculate costs per supermarket
  const supermarketCosts: Map<string, number> = new Map();
  const supermarketReasons: Map<string, string> = new Map();
  
  ingredientsList.forEach(ingredient => {
    ingredient.supermarket_options.forEach(option => {
      const cost = parseFloat(option.portion_cost_estimate.replace(/[^\d.]/g, '')) || 0;
      const current = supermarketCosts.get(option.supermarket) || 0;
      supermarketCosts.set(option.supermarket, current + cost);
      
      if (!supermarketReasons.has(option.supermarket)) {
        const store = locationStores.find(s => s.name === option.supermarket);
        if (store) {
          if (store.budgetLevel === userProfile.budget_level) {
            supermarketReasons.set(option.supermarket, `Matches your ${userProfile.budget_level} preference`);
          } else if (store.budgetLevel === 'Tight budget') {
            supermarketReasons.set(option.supermarket, 'Best value for money');
          } else {
            supermarketReasons.set(option.supermarket, 'Premium quality options available');
          }
        }
      }
    });
  });
  
  // Sort by cost and budget match
  const sorted = Array.from(supermarketCosts.entries())
    .map(([name, cost]) => ({
      name,
      cost,
      reason: supermarketReasons.get(name) || 'Good selection available',
      budgetMatch: locationStores.find(s => s.name === name)?.budgetLevel === userProfile.budget_level,
    }))
    .sort((a, b) => {
      // Prioritize budget match, then by cost
      if (a.budgetMatch && !b.budgetMatch) return -1;
      if (!a.budgetMatch && b.budgetMatch) return 1;
      return a.cost - b.cost;
    })
    .slice(0, 5)
    .map((item, index) => ({
      rank: index + 1,
      name: item.name,
      reason: item.reason,
    }));
  
  return sorted;
};

/**
 * Get currency symbol for country
 */
function getCurrencyForCountry(country: string): string {
  const countryLower = country.toLowerCase();
  if (countryLower.includes('greece') || countryLower.includes('euro')) {
    return '€';
  }
  if (countryLower.includes('uk') || countryLower.includes('britain')) {
    return '£';
  }
  if (countryLower.includes('usa') || countryLower.includes('united states')) {
    return '$';
  }
  return '€'; // Default to Euro
}

