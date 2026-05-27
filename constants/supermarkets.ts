import type { RankedSupermarket, Supermarket, SupermarketSortPreference } from '@/types';

export const supermarkets: Supermarket[] = [
  { name: 'Lidl', priceTier: 1, regions: ['Greece', 'UK', 'Germany'] },
  { name: 'AB Vassilopoulos', priceTier: 3, regions: ['Greece'] },
  { name: 'Sklavenitis', priceTier: 2, regions: ['Greece'] },
  { name: 'MyMarket', priceTier: 2, regions: ['Greece'] },
  { name: 'Masoutis', priceTier: 2, regions: ['Greece'] },
  { name: 'Tesco', priceTier: 2, regions: ['UK'] },
  { name: 'ASDA', priceTier: 1, regions: ['UK'] },
  { name: "Sainsbury's", priceTier: 3, regions: ['UK'] },
  { name: 'Aldi', priceTier: 1, regions: ['UK', 'Germany'] },
];

/** TODO: Replace random distance with expo-location + Google Places API */
function mockDistanceKm(): number {
  return Math.round((Math.random() * 4.5 + 0.5) * 10) / 10;
}

export function filterSupermarketsByCountry(country: string): Supermarket[] {
  return supermarkets.filter((s) =>
    s.regions.some((r) => r.toLowerCase() === country.toLowerCase())
  );
}

export function rankSupermarkets(
  country: string,
  preference: SupermarketSortPreference
): RankedSupermarket[] {
  const filtered = filterSupermarketsByCountry(country).map((s) => ({
    ...s,
    estimatedDistanceKm: mockDistanceKm(),
  }));

  if (preference === 'cheapest') {
    return [...filtered].sort((a, b) => a.priceTier - b.priceTier);
  }

  return [...filtered].sort((a, b) => a.estimatedDistanceKm - b.estimatedDistanceKm);
}

export function priceTierLabel(tier: 1 | 2 | 3): string {
  switch (tier) {
    case 1:
      return 'Budget';
    case 2:
      return 'Mid-range';
    case 3:
      return 'Premium';
  }
}
