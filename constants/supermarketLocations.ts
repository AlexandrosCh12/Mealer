/**
 * Static supermarket store coordinates for map modals.
 *
 * Thessaloniki is the primary dataset; Athens has a smaller fallback set.
 * getStoreLocations picks the dataset based on the user's city string.
 */
export interface StoreLocation {
  name: string;
  address: string;
  area: string;
  lat: number;
  lon: number;
}

export const SUPERMARKET_LOCATIONS: Record<string, StoreLocation[]> = {
  'Lidl': [
    { name: 'Lidl Κάτω Τούμπα', address: 'Παπαναστασίου Αλέξανδρου 102', area: 'Κάτω Τούμπα', lat: 40.6231, lon: 22.9789 },
    { name: 'Lidl Πεύκα', address: 'Παπανικολάου Γεώργιου', area: 'Πεύκα', lat: 40.6608, lon: 23.0119 },
    { name: 'Lidl Χαριλάου', address: 'Σταύρου Αλεξάνδρου 15Α', area: 'Χαριλάου', lat: 40.6244, lon: 22.9656 },
    { name: 'Lidl Εύοσμος', address: 'Καραολή & Δημητρίου 149', area: 'Εύοσμος', lat: 40.6608, lon: 22.9192 },
    { name: 'Lidl Καλαμαριά Κέντρο', address: 'Πόντου - Γεννηματά', area: 'Καλαμαριά', lat: 40.5733, lon: 22.9536 },
    { name: 'Lidl Καλαμαριά Κηφισιά', address: 'Εθνικής Αντιστάσεως 11', area: 'Καλαμαριά', lat: 40.5694, lon: 22.9583 },
    { name: 'Lidl Θέρμη', address: 'Στρατάρχη Παπάγου Αλεξάνδρου', area: 'Θέρμη', lat: 40.5394, lon: 23.0153 },
    { name: 'Lidl Πανόραμα', address: 'Πανοράματος 2, Άνω Πανόραμα', area: 'Πανόραμα', lat: 40.6111, lon: 23.0306 },
    { name: 'Lidl Περαία', address: '20ο χλμ Θεσσαλονίκης - Μηχανιώνας', area: 'Περαία', lat: 40.4936, lon: 22.9508 },
    { name: 'Lidl Ωραιόκαστρο', address: '4ο χλμ Ωραιοκάστρου - Θεσσαλονίκης', area: 'Ωραιόκαστρο', lat: 40.6917, lon: 22.9117 },
  ],
  'Sklavenitis': [
    { name: 'Σκλαβενίτης One Salonica', address: 'Γιαννιτσών & Κωλέττη', area: 'Κέντρο', lat: 40.6536, lon: 22.9019 },
    { name: 'Σκλαβενίτης Άνω Τούμπα', address: 'Πανταζίδου Ιωάννη 4 & Μανδηλαρά Νικηφόρου', area: 'Άνω Τούμπα', lat: 40.6306, lon: 22.9844 },
    { name: 'Σκλαβενίτης Κέντρο', address: 'Σβώλου Α. 33 & Γούναρη Δημητρίου', area: 'Κέντρο', lat: 40.6311, lon: 22.9461 },
    { name: 'Σκλαβενίτης Άνω Πόλη', address: 'Κωνσταντινουπόλεως 55 & Ψαρών', area: 'Άνω Πόλη', lat: 40.6403, lon: 22.9522 },
    { name: 'Σκλαβενίτης Φάληρο', address: 'Βασιλίσσης Όλγας 9', area: 'Φάληρο', lat: 40.6228, lon: 22.9508 },
    { name: 'Σκλαβενίτης Χαριλάου', address: 'Νάτσινα Θεοδοσίου 52', area: 'Χαριλάου', lat: 40.6261, lon: 22.9683 },
    { name: 'Σκλαβενίτης Εύοσμος', address: 'Εθνικής Αντιστάσεως & Λαμπράκη Γρηγορίου', area: 'Εύοσμος', lat: 40.6622, lon: 22.9189 },
    { name: 'Σκλαβενίτης Νικόπολη', address: 'Λεωφόρος Αναγεννήσεως 156', area: 'Νικόπολη', lat: 40.6483, lon: 22.9908 },
    { name: 'Σκλαβενίτης Περαία', address: 'Λεωφόρος Ανθέων 55 & Φλέμινγκ 9', area: 'Περαία', lat: 40.4944, lon: 22.9489 },
    { name: 'Σκλαβενίτης Ελευθέριο', address: 'Νέα Μονστηρίου & Καραμανλή Κωνσταντίνου', area: 'Ελευθέριο', lat: 40.6789, lon: 22.8964 },
  ],
  'AB Vassilopoulos': [
    { name: 'ΑΒ Βασιλόπουλος Κέντρο', address: 'Τσιμισκή 56', area: 'Κέντρο', lat: 40.6325, lon: 22.9472 },
    { name: 'ΑΒ Βασιλόπουλος Καλαμαριά', address: 'Κομνηνών 26', area: 'Καλαμαριά', lat: 40.5733, lon: 22.9536 },
    { name: 'ΑΒ Βασιλόπουλος Άνω Τούμπα', address: 'Παπαναστασίου Αλέξανδρου 180', area: 'Άνω Τούμπα', lat: 40.6286, lon: 22.9856 },
    { name: 'ΑΒ Βασιλόπουλος Πανόραμα', address: 'Αναπαύσεως 12', area: 'Πανόραμα', lat: 40.6111, lon: 23.0306 },
    { name: 'ΑΒ Βασιλόπουλος Νέα Κρήνη', address: 'Πλαστήρα Νικολάου 100', area: 'Νέα Κρήνη', lat: 40.5806, lon: 22.9722 },
    { name: 'ΑΒ Βασιλόπουλος Σταυρούπολη', address: 'Παύλου Μελά 95', area: 'Σταυρούπολη', lat: 40.6644, lon: 22.9486 },
  ],
  'MyMarket': [
    { name: 'My Market Κέντρο', address: 'Παπαναστασίου Αλεξάνδρου 63 & Πριάμου', area: 'Κέντρο', lat: 40.6253, lon: 22.9722 },
    { name: 'My Market Σταυρούπολη', address: 'Λαμπράκη Γρηγορίου 19 & Γληνού Δημητρίου', area: 'Σταυρούπολη', lat: 40.6644, lon: 22.9486 },
    { name: 'My Market Εύοσμος', address: 'Καραολή και Δημητρίου 192', area: 'Εύοσμος', lat: 40.6608, lon: 22.9192 },
    { name: 'Market In Κέντρο', address: 'Λεωφόρος Βασιλέως Γεωργίου 20', area: 'Φάληρο', lat: 40.6228, lon: 22.9508 },
  ],
  'Masoutis': [
    { name: 'Μασούτης Κέντρο', address: 'Αγίας Σοφίας 30', area: 'Κέντρο', lat: 40.6336, lon: 22.9447 },
    { name: 'Μασούτης Νέα Ελβετία', address: 'Μαρτίου 25ης 88', area: 'Νέα Ελβετία', lat: 40.6033, lon: 22.9619 },
    { name: 'Μασούτης Χαριλάου', address: 'Βασ. Γεωργίου Α 70', area: 'Χαριλάου', lat: 40.6228, lon: 22.9619 },
    { name: 'Μασούτης Καλαμαριά', address: 'Μεταμορφώσεως 30', area: 'Καλαμαριά', lat: 40.5694, lon: 22.9583 },
    { name: 'Μασούτης Σταυρούπολη', address: 'Λαγκαδά 220', area: 'Σταυρούπολη', lat: 40.6708, lon: 22.9417 },
  ],
  'Aldi': [
    { name: 'Aldi Κέντρο', address: 'Λαγκαδά 90', area: 'Κέντρο', lat: 40.6444, lon: 22.9367 },
    { name: 'Aldi Καλαμαριά', address: 'Εθνικής Αντιστάσεως 80', area: 'Καλαμαριά', lat: 40.5722, lon: 22.9528 },
    { name: 'Aldi Εύοσμος', address: 'Μ. Αλεξάνδρου 100', area: 'Εύοσμος', lat: 40.6608, lon: 22.9192 },
  ],
};

// Athens fallback locations (for users in Athens)
export const SUPERMARKET_LOCATIONS_ATHENS: Record<string, StoreLocation[]> = {
  'Lidl': [
    { name: 'Lidl Κέντρο Αθήνας', address: 'Πειραιώς 90', area: 'Κέντρο', lat: 37.9645, lon: 23.7167 },
    { name: 'Lidl Νέα Σμύρνη', address: 'Ελ. Βενιζέλου 120', area: 'Νέα Σμύρνη', lat: 37.9472, lon: 23.7144 },
    { name: 'Lidl Γλυφάδα', address: 'Βουλιαγμένης 45', area: 'Γλυφάδα', lat: 37.8694, lon: 23.7531 },
  ],
  'Sklavenitis': [
    { name: 'Σκλαβενίτης Σύνταγμα', address: 'Ερμού 30', area: 'Σύνταγμα', lat: 37.9756, lon: 23.7322 },
    { name: 'Σκλαβενίτης Κηφισιά', address: 'Κηφισίας 280', area: 'Κηφισιά', lat: 38.0744, lon: 23.8092 },
  ],
  'AB Vassilopoulos': [
    { name: 'ΑΒ Βασιλόπουλος Κολωνάκι', address: 'Πατριάρχου Ιωακείμ 22', area: 'Κολωνάκι', lat: 37.9778, lon: 23.7461 },
  ],
  'MyMarket': [
    { name: 'My Market Παγκράτι', address: 'Υμηττού 100', area: 'Παγκράτι', lat: 37.9656, lon: 23.7472 },
  ],
  'Masoutis': [
    { name: 'Μασούτης Νίκαια', address: 'Π. Τσαλδάρη 50', area: 'Νίκαια', lat: 37.9656, lon: 23.6472 },
  ],
  'Aldi': [
    { name: 'Aldi Περιστέρι', address: 'Παναγή Τσαλδάρη 88', area: 'Περιστέρι', lat: 38.0167, lon: 23.6917 },
  ],
};

/**
 * Resolves brick-and-mortar locations for a chain in the user's city.
 *
 * @param storeName - Chain name key (e.g. "Lidl", "Sklavenitis").
 * @param city - User's city; Athens triggers the Athens dataset.
 * @returns StoreLocation array, or empty if chain unknown in that dataset.
 */
export function getStoreLocations(
  storeName: string,
  city: string
): StoreLocation[] {
  const isAthens = city.toLowerCase().includes('athen') ||
                    city.toLowerCase().includes('αθην');
  const dataset = isAthens
    ? SUPERMARKET_LOCATIONS_ATHENS
    : SUPERMARKET_LOCATIONS;
  return dataset[storeName] || [];
}
