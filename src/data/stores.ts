import { Store } from '../types/meal';

export interface LocationStores {
  country: string;
  city: string;
  stores: Store[];
}

export const locationStores: LocationStores[] = [
  {
    country: 'Greece',
    city: 'Thessaloniki',
    stores: [
      {
        name: 'AB Vassilopoulos',
        budgetLevel: 'Medium / normal budget',
        address: 'Multiple locations in Thessaloniki',
        website: 'https://www.ab.gr',
      },
      {
        name: 'Lidl',
        budgetLevel: 'Tight budget',
        address: 'Multiple locations in Thessaloniki',
        website: 'https://www.lidl.gr',
      },
      {
        name: 'Sklavenitis',
        budgetLevel: 'Medium / normal budget',
        address: 'Multiple locations in Thessaloniki',
        website: 'https://www.sklavenitis.gr',
      },
      {
        name: 'Metro',
        budgetLevel: 'No budget limit',
        address: 'Multiple locations in Thessaloniki',
        website: 'https://www.metro.gr',
      },
      {
        name: 'Local Farmers Market',
        budgetLevel: 'Tight budget',
        address: 'Various locations',
      },
    ],
  },
  // Add more locations as needed - for now using a default fallback
];

export const getStoresForLocation = (country: string, city: string): Store[] => {
  const location = locationStores.find(
    (loc) => loc.country.toLowerCase() === country.toLowerCase() && 
             loc.city.toLowerCase() === city.toLowerCase()
  );
  
  if (location) {
    return location.stores;
  }
  
  // Default stores for any location
  return [
    {
      name: 'Local Supermarket',
      budgetLevel: 'Medium / normal budget',
      address: 'Various locations',
    },
    {
      name: 'Budget Grocery Store',
      budgetLevel: 'Tight budget',
      address: 'Various locations',
    },
    {
      name: 'Premium Grocery',
      budgetLevel: 'No budget limit',
      address: 'Various locations',
    },
    {
      name: 'Farmers Market',
      budgetLevel: 'Tight budget',
      address: 'City center',
    },
  ];
};

