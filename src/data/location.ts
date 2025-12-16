// src/data/locations.ts
export type LocationItem = {
  id: string;
  name: string;     
  province: string;
  region: string;
  searchTerms: string; 
};

const createLoc = (name: string, province: string, region: string): LocationItem => ({
  id: `${name.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-')}-${province.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-')}`,
  name,
  province,
  region,
  searchTerms: `${name} ${province} ${region}`.toLowerCase()
});

export const ALL_LOCATIONS: LocationItem[] = [
  // --- NATIONAL CAPITAL REGION (NCR) ---
  createLoc("Manila", "Metro Manila", "NCR"),
  createLoc("Quezon City", "Metro Manila", "NCR"),
  createLoc("Caloocan", "Metro Manila", "NCR"),
  createLoc("Las Piñas", "Metro Manila", "NCR"),
  createLoc("Makati", "Metro Manila", "NCR"),
  createLoc("Malabon", "Metro Manila", "NCR"),
  createLoc("Mandaluyong", "Metro Manila", "NCR"),
  createLoc("Marikina", "Metro Manila", "NCR"),
  createLoc("Muntinlupa", "Metro Manila", "NCR"),
  createLoc("Navotas", "Metro Manila", "NCR"),
  createLoc("Parañaque", "Metro Manila", "NCR"),
  createLoc("Pasay", "Metro Manila", "NCR"),
  createLoc("Pasig", "Metro Manila", "NCR"),
  createLoc("Pateros", "Metro Manila", "NCR"),
  createLoc("San Juan", "Metro Manila", "NCR"),
  createLoc("Taguig", "Metro Manila", "NCR"),
  createLoc("Valenzuela", "Metro Manila", "NCR"),

  // --- CORDILLERA ADMINISTRATIVE REGION (CAR) ---
  createLoc("Baguio", "Benguet", "CAR"),
  createLoc("La Trinidad", "Benguet", "CAR"),
  createLoc("Bangued", "Abra", "CAR"),
  createLoc("Tabuk", "Kalinga", "CAR"),
  createLoc("Bontoc", "Mountain Province", "CAR"),
  createLoc("Sagada", "Mountain Province", "CAR"),
  createLoc("Lagawe", "Ifugao", "CAR"),
  createLoc("Banaue", "Ifugao", "CAR"),
  createLoc("Kabugao", "Apayao", "CAR"),

  // --- REGION I (Ilocos Region) ---
  createLoc("Laoag", "Ilocos Norte", "Region I"),
  createLoc("Pagudpud", "Ilocos Norte", "Region I"),
  createLoc("Vigan", "Ilocos Sur", "Region I"),
  createLoc("Candon", "Ilocos Sur", "Region I"),
  createLoc("San Fernando", "La Union", "Region I"),
  createLoc("Bauang", "La Union", "Region I"),
  createLoc("Lingayen", "Pangasinan", "Region I"),
  createLoc("Dagupan", "Pangasinan", "Region I"),
  createLoc("Alaminos", "Pangasinan", "Region I"),
  createLoc("Bolinao", "Pangasinan", "Region I"),

  // --- REGION II (Cagayan Valley) ---
  createLoc("Tuguegarao", "Cagayan", "Region II"),
  createLoc("Santa Ana", "Cagayan", "Region II"),
  createLoc("Ilagan", "Isabela", "Region II"),
  createLoc("Santiago", "Isabela", "Region II"),
  createLoc("Cauayan", "Isabela", "Region II"),
  createLoc("Bayombong", "Nueva Vizcaya", "Region II"),
  createLoc("Cabarroguis", "Quirino", "Region II"),
  createLoc("Basco", "Batanes", "Region II"),

  // --- REGION III (Central Luzon) ---
  createLoc("San Fernando", "Pampanga", "Region III"),
  createLoc("Angeles", "Pampanga", "Region III"),
  createLoc("Mabalacat", "Pampanga", "Region III"),
  createLoc("Malolos", "Bulacan", "Region III"),
  createLoc("Meycauayan", "Bulacan", "Region III"),
  createLoc("San Jose del Monte", "Bulacan", "Region III"),
  createLoc("Balanga", "Bataan", "Region III"),
  createLoc("Mariveles", "Bataan", "Region III"),
  createLoc("Tarlac City", "Tarlac", "Region III"),
  createLoc("Cabanatuan", "Nueva Ecija", "Region III"),
  createLoc("Palayan", "Nueva Ecija", "Region III"),
  createLoc("Olongapo", "Zambales", "Region III"),
  createLoc("Subic", "Zambales", "Region III"),
  createLoc("Iba", "Zambales", "Region III"),
  createLoc("Baler", "Aurora", "Region III"),

  // --- REGION IV-A (CALABARZON) ---
  createLoc("Antipolo", "Rizal", "Region IV-A"),
  createLoc("Tanay", "Rizal", "Region IV-A"),
  createLoc("Tagaytay", "Cavite", "Region IV-A"),
  createLoc("Dasmarinas", "Cavite", "Region IV-A"),
  createLoc("Bacoor", "Cavite", "Region IV-A"),
  createLoc("Imus", "Cavite", "Region IV-A"),
  createLoc("Kawit", "Cavite", "Region IV-A"),
  createLoc("Batangas City", "Batangas", "Region IV-A"),
  createLoc("Lipa", "Batangas", "Region IV-A"),
  createLoc("Nasugbu", "Batangas", "Region IV-A"), 
  createLoc("Calatagan", "Batangas", "Region IV-A"),
  createLoc("Calamba", "Laguna", "Region IV-A"),
  createLoc("San Pablo", "Laguna", "Region IV-A"),
  createLoc("Santa Rosa", "Laguna", "Region IV-A"),
  createLoc("Lucena", "Quezon", "Region IV-A"),
  createLoc("Tayabas", "Quezon", "Region IV-A"),

  // --- MIMAROPA (Region IV-B) ---
  createLoc("Puerto Princesa", "Palawan", "MIMAROPA"),
  createLoc("El Nido", "Palawan", "MIMAROPA"),
  createLoc("Coron", "Palawan", "MIMAROPA"),
  createLoc("San Vicente", "Palawan", "MIMAROPA"),
  createLoc("Calapan", "Oriental Mindoro", "MIMAROPA"),
  createLoc("Puerto Galera", "Oriental Mindoro", "MIMAROPA"),
  createLoc("Mamburao", "Occidental Mindoro", "MIMAROPA"),
  createLoc("San Jose", "Occidental Mindoro", "MIMAROPA"),
  createLoc("Boac", "Marinduque", "MIMAROPA"),
  createLoc("Romblon", "Romblon", "MIMAROPA"),

  // --- REGION V (Bicol Region) ---
  createLoc("Legazpi", "Albay", "Region V"),
  createLoc("Naga", "Camarines Sur", "Region V"),
  createLoc("Pili", "Camarines Sur", "Region V"),
  createLoc("Iriga", "Camarines Sur", "Region V"),
  createLoc("Caramoan", "Camarines Sur", "Region V"),
  createLoc("Daet", "Camarines Norte", "Region V"),
  createLoc("Sorsogon City", "Sorsogon", "Region V"),
  createLoc("Donsol", "Sorsogon", "Region V"),
  createLoc("Masbate City", "Masbate", "Region V"),
  createLoc("Virac", "Catanduanes", "Region V"),

  // --- REGION VI (Western Visayas) ---
  createLoc("Iloilo City", "Iloilo", "Region VI"),
  createLoc("Bacolod", "Negros Occidental", "Region VI"),
  createLoc("Silay", "Negros Occidental", "Region VI"),
  createLoc("Sipalay", "Negros Occidental", "Region VI"),
  createLoc("Roxas City", "Capiz", "Region VI"),
  createLoc("Kalibo", "Aklan", "Region VI"),
  createLoc("Malay", "Aklan", "Region VI"), 
  createLoc("Boracay", "Aklan", "Region VI"), 
  createLoc("San Jose de Buenavista", "Antique", "Region VI"),
  createLoc("Jordan", "Guimaras", "Region VI"),

  // --- REGION VII (Central Visayas) ---
  createLoc("Cebu City", "Cebu", "Region VII"),
  createLoc("Lapu-Lapu", "Cebu", "Region VII"),
  createLoc("Mandaue", "Cebu", "Region VII"),
  createLoc("Moalboal", "Cebu", "Region VII"),
  createLoc("Bantayan", "Cebu", "Region VII"),
  createLoc("Tagbilaran", "Bohol", "Region VII"),
  createLoc("Panglao", "Bohol", "Region VII"),
  createLoc("Dumaguete", "Negros Oriental", "Region VII"),
  createLoc("Bais", "Negros Oriental", "Region VII"),
  createLoc("Siquijor", "Siquijor", "Region VII"),
  createLoc("Larena", "Siquijor", "Region VII"),

  // --- REGION VIII (Eastern Visayas) ---
  createLoc("Tacloban", "Leyte", "Region VIII"),
  createLoc("Ormoc", "Leyte", "Region VIII"),
  createLoc("Maasin", "Southern Leyte", "Region VIII"),
  createLoc("Catbalogan", "Samar", "Region VIII"),
  createLoc("Calbayog", "Samar", "Region VIII"),
  createLoc("Borongan", "Eastern Samar", "Region VIII"),
  createLoc("Guiuan", "Eastern Samar", "Region VIII"), 
  createLoc("Catarman", "Northern Samar", "Region VIII"),
  createLoc("Naval", "Biliran", "Region VIII"),

  // --- REGION IX (Zamboanga Peninsula) ---
  createLoc("Zamboanga City", "Zamboanga del Sur", "Region IX"),
  createLoc("Pagadian", "Zamboanga del Sur", "Region IX"),
  createLoc("Dipolog", "Zamboanga del Norte", "Region IX"),
  createLoc("Dapitan", "Zamboanga del Norte", "Region IX"),
  createLoc("Ipil", "Zamboanga Sibugay", "Region IX"),

  // --- REGION X (Northern Mindanao) ---
  createLoc("Cagayan de Oro", "Misamis Oriental", "Region X"),
  createLoc("Gingoog", "Misamis Oriental", "Region X"),
  createLoc("Malaybalay", "Bukidnon", "Region X"),
  createLoc("Valencia", "Bukidnon", "Region X"),
  createLoc("Iligan", "Lanao del Norte", "Region X"),
  createLoc("Oroquieta", "Misamis Occidental", "Region X"),
  createLoc("Ozamiz", "Misamis Occidental", "Region X"),
  createLoc("Tangub", "Misamis Occidental", "Region X"),
  createLoc("Mambajao", "Camiguin", "Region X"),

  // --- REGION XI (Davao Region) ---
  createLoc("Davao City", "Davao del Sur", "Region XI"),
  createLoc("Digos", "Davao del Sur", "Region XI"),
  createLoc("Tagum", "Davao del Norte", "Region XI"),
  createLoc("Panabo", "Davao del Norte", "Region XI"),
  createLoc("Samal", "Davao del Norte", "Region XI"),
  createLoc("Mati", "Davao Oriental", "Region XI"),
  createLoc("Nabunturan", "Davao de Oro", "Region XI"),
  createLoc("Malita", "Davao Occidental", "Region XI"),

  // --- REGION XII (SOCCSKSARGEN) ---
  createLoc("General Santos", "South Cotabato", "Region XII"),
  createLoc("Koronadal", "South Cotabato", "Region XII"),
  createLoc("Kidapawan", "Cotabato", "Region XII"),
  createLoc("Tacurong", "Sultan Kudarat", "Region XII"),
  createLoc("Isulan", "Sultan Kudarat", "Region XII"),
  createLoc("Alabel", "Sarangani", "Region XII"),
  createLoc("Glan", "Sarangani", "Region XII"), 

  // --- REGION XIII (Caraga) ---
  createLoc("Butuan", "Agusan del Norte", "Region XIII"),
  createLoc("Cabadbaran", "Agusan del Norte", "Region XIII"),
  createLoc("Prosperidad", "Agusan del Sur", "Region XIII"),
  createLoc("Surigao City", "Surigao del Norte", "Region XIII"),
  createLoc("General Luna", "Surigao del Norte", "Region XIII"), 
  createLoc("Del Carmen", "Surigao del Norte", "Region XIII"), 
  createLoc("Tandag", "Surigao del Sur", "Region XIII"),
  createLoc("Bislig", "Surigao del Sur", "Region XIII"),
  createLoc("San Jose", "Dinagat Islands", "Region XIII"),

  // --- BARMM (Bangsamoro) ---
  createLoc("Cotabato City", "Maguindanao", "BARMM"),
  createLoc("Marawi", "Lanao del Sur", "BARMM"),
  createLoc("Lamitan", "Basilan", "BARMM"),
  createLoc("Jolo", "Sulu", "BARMM"),
  createLoc("Bongao", "Tawi-Tawi", "BARMM"),
];