// src/data/locations.ts

export type LocationItem = {
  id: string;
  name: string;      // Municipality name
  province: string;
  region: string;
  searchTerms: string; // Pre-computed string for faster searching
};

// A helper to create locations easily
const createLoc = (name: string, province: string, region: string): LocationItem => ({
  id: `${name.toLowerCase().replace(/\s+/g, '-')}-${province.toLowerCase().replace(/\s+/g, '-')}`,
  name,
  province,
  region,
  searchTerms: `${name} ${province} ${region}`.toLowerCase()
});

export const ALL_LOCATIONS: LocationItem[] = [
  // Metro Manila
  createLoc("Makati", "Metro Manila", "NCR"),
  createLoc("Taguig", "Metro Manila", "NCR"),
  createLoc("Quezon City", "Metro Manila", "NCR"),
  createLoc("Manila", "Metro Manila", "NCR"),
  createLoc("Pasig", "Metro Manila", "NCR"),
  createLoc("Paranaque", "Metro Manila", "NCR"),
  
  // Cebu
  createLoc("Cebu City", "Cebu", "Central Visayas"),
  createLoc("Mandaue", "Cebu", "Central Visayas"),
  createLoc("Lapu-Lapu", "Cebu", "Central Visayas"),
  
  // Davao
  createLoc("Davao City", "Davao del Sur", "Davao Region"),
  createLoc("Samal", "Davao del Norte", "Davao Region"),

  // Palawan
  createLoc("El Nido", "Palawan", "MIMAROPA"),
  createLoc("Coron", "Palawan", "MIMAROPA"),
  createLoc("Puerto Princesa", "Palawan", "MIMAROPA"),

  // Boracay / Aklan
  createLoc("Malay (Boracay)", "Aklan", "Western Visayas"),
  createLoc("Kalibo", "Aklan", "Western Visayas"),

  // Pampanga
  createLoc("Angeles", "Pampanga", "Central Luzon"),
  createLoc("San Fernando", "Pampanga", "Central Luzon"),
  
  // Tagaytay / Cavite
  createLoc("Tagaytay", "Cavite", "CALABARZON"),
  createLoc("Dasmarinas", "Cavite", "CALABARZON"),
  
  // Baguio
  createLoc("Baguio", "Benguet", "CAR"),
];