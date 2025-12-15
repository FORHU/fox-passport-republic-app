export interface Venue {
  id: string; // Changed from number to string to match your new data (e.g. "makati-1")
  title: string;
  location: string; 
  province: string;
  price: number;
  rating: number;
  reviews: number;
  images: string[];
  description: string;
  host: string;
  offers: string[];
  category: string;
}

export const HARDCODED_VENUES: Venue[] = [
  // ================= METRO MANILA =================

  // --- MAKATI ---
  {
    id: "makati-1",
    title: "Skyline Loft in Poblacion",
    location: "Makati",
    province: "Metro Manila",
    price: 3500,
    rating: 4.85,
    reviews: 120,
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"],
    description: "Experience the vibrant nightlife of Poblacion from this modern industrial loft. Features floor-to-ceiling windows.",
    host: "Miguel",
    offers: ["City View", "WiFi", "Smart TV", "Gym"],
    category: "Apartment"
  },
  {
    id: "makati-2",
    title: "Greenbelt Garden Studio",
    location: "Makati",
    province: "Metro Manila",
    price: 4200,
    rating: 4.92,
    reviews: 85,
    images: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80"],
    description: "A quiet oasis right across Greenbelt mall. Perfect for business travelers.",
    host: "Anna",
    offers: ["Pool", "Workspace", "Kitchen"],
    category: "Condo"
  },
  {
    id: "makati-3",
    title: "Salcedo Village Executive Suite",
    location: "Makati",
    province: "Metro Manila",
    price: 5100,
    rating: 4.8,
    reviews: 64,
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"],
    description: "Walk to the Saturday market. Luxurious suite with balcony.",
    host: "Robert",
    offers: ["Balcony", "Washer", "Security"],
    category: "Suite"
  },

  // --- TAGUIG (BGC) ---
  {
    id: "taguig-1",
    title: "BGC High Street Condo",
    location: "Taguig",
    province: "Metro Manila",
    price: 4500,
    rating: 4.9,
    reviews: 210,
    images: ["https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80"],
    description: "Heart of BGC. Steps away from High Street and Mind Museum.",
    host: "Sarah",
    offers: ["Pool", "Gym", "WiFi"],
    category: "Condo"
  },
  {
    id: "taguig-2",
    title: "Modern Loft Near Venice Mall",
    location: "Taguig",
    province: "Metro Manila",
    price: 3200,
    rating: 4.7,
    reviews: 140,
    images: ["https://images.unsplash.com/photo-1505693416388-b0346efee53e?auto=format&fit=crop&w=800&q=80"],
    description: "Cozy loft perfect for couples visiting the Grand Canal Mall.",
    host: "Luis",
    offers: ["Netflix", "Kitchen", "AC"],
    category: "Loft"
  },
  {
    id: "taguig-3",
    title: "Uptown Parksuites Lux",
    location: "Taguig",
    province: "Metro Manila",
    price: 6000,
    rating: 4.95,
    reviews: 55,
    images: ["https://images.unsplash.com/photo-1512918760513-95f1fde64203?auto=format&fit=crop&w=800&q=80"],
    description: "Luxury living near Uptown Mall and Palace Pool Club.",
    host: "Premium Stays",
    offers: ["Concierge", "Pool", "City View"],
    category: "Apartment"
  },

  // --- QUEZON CITY ---
  {
    id: "qc-1",
    title: "Eastwood City View Unit",
    location: "Quezon City",
    province: "Metro Manila",
    price: 2500,
    rating: 4.6,
    reviews: 88,
    images: ["https://images.unsplash.com/photo-1522771753035-10a637d5d4a1?auto=format&fit=crop&w=800&q=80"],
    description: "Affordable staycation in Eastwood City. Pet friendly.",
    host: "Jenny",
    offers: ["Pet Friendly", "WiFi", "Mall Access"],
    category: "Condo"
  },
  {
    id: "qc-2",
    title: "Katipunan Studio near Ateneo",
    location: "Quezon City",
    province: "Metro Manila",
    price: 2200,
    rating: 4.8,
    reviews: 112,
    images: ["https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80"],
    description: "Perfect for students or visiting parents. Study desk included.",
    host: "Marco",
    offers: ["Workspace", "WiFi", "Cafe Nearby"],
    category: "Studio"
  },
  {
    id: "qc-3",
    title: "Tomas Morato Chic Place",
    location: "Quezon City",
    province: "Metro Manila",
    price: 3000,
    rating: 4.75,
    reviews: 45,
    images: ["https://images.unsplash.com/photo-1556020685-ae41abfc9365?auto=format&fit=crop&w=800&q=80"],
    description: "Food trip haven! Surrounded by the best restaurants in QC.",
    host: "Chef Tony",
    offers: ["Netflix", "Kitchen", "Parking"],
    category: "Apartment"
  },

  // --- MANILA ---
  {
    id: "manila-1",
    title: "Historic Intramuros Suite",
    location: "Manila",
    province: "Metro Manila",
    price: 3500,
    rating: 4.9,
    reviews: 200,
    images: ["https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80"],
    description: "Stay inside the Walled City. Old world charm with modern amenities.",
    host: "Carlos",
    offers: ["Heritage View", "AC", "Tour Guide"],
    category: "Suite"
  },
  {
    id: "manila-2",
    title: "Malate Bayview Condo",
    location: "Manila",
    province: "Metro Manila",
    price: 2800,
    rating: 4.5,
    reviews: 150,
    images: ["https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80"],
    description: "Sunset views of Manila Bay. Near nightlife and restaurants.",
    host: "Riza",
    offers: ["Sea View", "Pool", "Gym"],
    category: "Condo"
  },
  {
    id: "manila-3",
    title: "University Belt Dormitel",
    location: "Manila",
    province: "Metro Manila",
    price: 1500,
    rating: 4.3,
    reviews: 300,
    images: ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"],
    description: "Budget friendly stay near UST and FEU.",
    host: "Dorm King",
    offers: ["Bunk Bed", "Study Area", "WiFi"],
    category: "Room"
  },

  // --- PASIG ---
  {
    id: "pasig-1",
    title: "Ortigas Center Business Suite",
    location: "Pasig",
    province: "Metro Manila",
    price: 3800,
    rating: 4.8,
    reviews: 95,
    images: ["https://images.unsplash.com/photo-1486304873000-235643847519?auto=format&fit=crop&w=800&q=80"],
    description: "Walk to your office in Ortigas. Premium amenities.",
    host: "BizStays",
    offers: ["Workspace", "Pool", "Concierge"],
    category: "Suite"
  },
  {
    id: "pasig-2",
    title: "Kapitolyo Foodie Hub",
    location: "Pasig",
    province: "Metro Manila",
    price: 2600,
    rating: 4.7,
    reviews: 120,
    images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80"],
    description: "Located in the gastro-hub of Pasig. Hip and trendy interiors.",
    host: "Bea",
    offers: ["Kitchen", "Netflix", "Pet Friendly"],
    category: "Apartment"
  },
  {
    id: "pasig-3",
    title: "The Grove Resort Living",
    location: "Pasig",
    province: "Metro Manila",
    price: 4500,
    rating: 4.9,
    reviews: 60,
    images: ["https://images.unsplash.com/photo-1574643156929-51fa098b0394?auto=format&fit=crop&w=800&q=80"],
    description: "Resort-style amenities in the city. Great lawn and pools.",
    host: "Rockwell",
    offers: ["Large Pool", "Garden", "Gym"],
    category: "Condo"
  },

  // --- PARANAQUE ---
  {
    id: "paranaque-1",
    title: "Azure Urban Resort Beach",
    location: "Paranaque",
    province: "Metro Manila",
    price: 3500,
    rating: 4.6,
    reviews: 450,
    images: ["https://images.unsplash.com/photo-1532323544230-7191fd510c59?auto=format&fit=crop&w=800&q=80"],
    description: "Staycation with man-made beach and wave pool access.",
    host: "Azure Host",
    offers: ["Wave Pool", "Beach", "Balcony"],
    category: "Condo"
  },
  {
    id: "paranaque-2",
    title: "Airport Transit Hotel",
    location: "Paranaque",
    province: "Metro Manila",
    price: 2200,
    rating: 4.4,
    reviews: 320,
    images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"],
    description: "5 minutes from NAIA Terminal 3. Perfect for layovers.",
    host: "Transit King",
    offers: ["Shuttle", "24/7 Check-in", "Breakfast"],
    category: "Room"
  },
  {
    id: "paranaque-3",
    title: "BF Homes Bungalow",
    location: "Paranaque",
    province: "Metro Manila",
    price: 5000,
    rating: 4.8,
    reviews: 40,
    images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80"],
    description: "Spacious house for families in the south.",
    host: "Tita Maricris",
    offers: ["Garage", "Garden", "Full Kitchen"],
    category: "House"
  },

  // ================= CEBU =================

  // --- CEBU CITY ---
  {
    id: "cebu-1",
    title: "IT Park Modern Condo",
    location: "Cebu City",
    province: "Cebu",
    price: 2800,
    rating: 4.8,
    reviews: 156,
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"],
    description: "Modern unit right inside IT Park. Close to Sugbo Mercado.",
    host: "Cebu Stays",
    offers: ["Pool", "WiFi", "Netflix"],
    category: "Condo"
  },
  {
    id: "cebu-2",
    title: "Ayala Center Luxury Suite",
    location: "Cebu City",
    province: "Cebu",
    price: 4500,
    rating: 4.9,
    reviews: 80,
    images: ["https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=800&q=80"],
    description: "Direct access to Ayala Mall. Premium furnishings.",
    host: "Elite Hosts",
    offers: ["Gym", "Pool", "Mall Access"],
    category: "Suite"
  },
  {
    id: "cebu-3",
    title: "Busay Mountain View Home",
    location: "Cebu City",
    province: "Cebu",
    price: 7500,
    rating: 4.95,
    reviews: 45,
    images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"],
    description: "Stunning night view of the city. Cool breeze near Temple of Leah.",
    host: "Mountain Retreats",
    offers: ["View Deck", "Parking", "Kitchen"],
    category: "House"
  },

  // --- MANDAUE ---
  {
    id: "mandaue-1",
    title: "Industrial Loft near Airport",
    location: "Mandaue",
    province: "Cebu",
    price: 2200,
    rating: 4.6,
    reviews: 70,
    images: ["https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=800&q=80"],
    description: "Convenient location between Cebu City and Mactan.",
    host: "Jojo",
    offers: ["WiFi", "Kitchenette", "Security"],
    category: "Loft"
  },
  {
    id: "mandaue-2",
    title: "Family Condo with Pool",
    location: "Mandaue",
    province: "Cebu",
    price: 3000,
    rating: 4.7,
    reviews: 95,
    images: ["https://images.unsplash.com/photo-1584622050111-993a426fbf0a?auto=format&fit=crop&w=800&q=80"],
    description: "Great for families. Close to Parkmall.",
    host: "Teresa",
    offers: ["Pool", "Playground", "2 Bedrooms"],
    category: "Condo"
  },
  {
    id: "mandaue-3",
    title: "Budget Transient Room",
    location: "Mandaue",
    province: "Cebu",
    price: 1200,
    rating: 4.3,
    reviews: 120,
    images: ["https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80"],
    description: "Clean and affordable room for backpackers.",
    host: "Backpacker Hub",
    offers: ["AC", "Shared Bath", "WiFi"],
    category: "Room"
  },

  // --- LAPU-LAPU ---
  {
    id: "lapu-1",
    title: "Mactan Newtown Beach Condo",
    location: "Lapu-Lapu",
    province: "Cebu",
    price: 3500,
    rating: 4.8,
    reviews: 200,
    images: ["https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80"],
    description: "Access to private beach club. Near historical sites.",
    host: "Newtown Host",
    offers: ["Beach Access", "Pool", "Gym"],
    category: "Condo"
  },
  {
    id: "lapu-2",
    title: "Private Pool Villa Mactan",
    location: "Lapu-Lapu",
    province: "Cebu",
    price: 15000,
    rating: 5.0,
    reviews: 30,
    images: ["https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80"],
    description: "Exclusive villa with own pool. Perfect for parties.",
    host: "Luxury Cebu",
    offers: ["Private Pool", "BBQ", "Karaoke"],
    category: "Villa"
  },
  {
    id: "lapu-3",
    title: "Diver's Lodge near Beach",
    location: "Lapu-Lapu",
    province: "Cebu",
    price: 2500,
    rating: 4.5,
    reviews: 88,
    images: ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80"],
    description: "Stay near the best dive spots in Mactan.",
    host: "Dive Master",
    offers: ["Gear Rental", "Breakfast", "AC"],
    category: "Room"
  },

  // ================= DAVAO =================

  // --- DAVAO CITY ---
  {
    id: "davao-1",
    title: "Marco Polo Residences",
    location: "Davao City",
    province: "Davao del Sur",
    price: 4000,
    rating: 4.8,
    reviews: 110,
    images: ["https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?auto=format&fit=crop&w=800&q=80"],
    description: "High-end living in the heart of Davao.",
    host: "Davao Elite",
    offers: ["Pool", "Gym", "Concierge"],
    category: "Apartment"
  },
  {
    id: "davao-2",
    title: "Abreeza Place Condo",
    location: "Davao City",
    province: "Davao del Sur",
    price: 3200,
    rating: 4.7,
    reviews: 140,
    images: ["https://images.unsplash.com/photo-1522771753035-10a637d5d4a1?auto=format&fit=crop&w=800&q=80"],
    description: "Directly across Abreeza Mall. Very convenient.",
    host: "Grace",
    offers: ["Mall Access", "WiFi", "Pool"],
    category: "Condo"
  },
  {
    id: "davao-3",
    title: "Jack's Ridge Hilltop Home",
    location: "Davao City",
    province: "Davao del Sur",
    price: 6000,
    rating: 4.9,
    reviews: 55,
    images: ["https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80"],
    description: "Best view of Davao City lights at night.",
    host: "Jack",
    offers: ["View Deck", "Garden", "Parking"],
    category: "House"
  },

  // --- SAMAL ---
  {
    id: "samal-1",
    title: "Samal Island Beach House",
    location: "Samal",
    province: "Davao del Norte",
    price: 8000,
    rating: 4.8,
    reviews: 65,
    images: ["https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80"],
    description: "Private beachfront house on Samal Island.",
    host: "Island Life",
    offers: ["Beach Front", "Kitchen", "Hammock"],
    category: "House"
  },
  {
    id: "samal-2",
    title: "Pearl Farm Villa",
    location: "Samal",
    province: "Davao del Norte",
    price: 15000,
    rating: 5.0,
    reviews: 40,
    images: ["https://images.unsplash.com/photo-1439066615861-d1fb8bc3adc5?auto=format&fit=crop&w=800&q=80"],
    description: "Luxurious water villa experience.",
    host: "Pearl Resort",
    offers: ["Water Villa", "Breakfast", "Spa"],
    category: "Villa"
  },
  {
    id: "samal-3",
    title: "Backpacker Bamboo Hut",
    location: "Samal",
    province: "Davao del Norte",
    price: 1500,
    rating: 4.5,
    reviews: 90,
    images: ["https://images.unsplash.com/photo-1590523278135-25aa7296333e?auto=format&fit=crop&w=800&q=80"],
    description: "Simple hut steps from the ocean.",
    host: "Local Host",
    offers: ["Fan", "Mosquito Net", "Shared Bath"],
    category: "Hut"
  },

  // ================= PALAWAN =================

  // --- EL NIDO ---
  {
    id: "elnido-1",
    title: "Beachfront Bamboo Villa",
    location: "El Nido",
    province: "Palawan",
    price: 12000,
    rating: 4.95,
    reviews: 200,
    images: ["https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80"],
    description: "Wake up to the sound of waves. Private beach access.",
    host: "Island Tours",
    offers: ["Beach Access", "Breakfast", "Kayak"],
    category: "Villa"
  },
  {
    id: "elnido-2",
    title: "Limestone View Glamping",
    location: "El Nido",
    province: "Palawan",
    price: 4500,
    rating: 4.8,
    reviews: 120,
    images: ["https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=80"],
    description: "Luxury tents with views of the limestone cliffs.",
    host: "Glamp PH",
    offers: ["AC Tent", "Bonfire", "Breakfast"],
    category: "Glamping"
  },
  {
    id: "elnido-3",
    title: "Town Center Hostel",
    location: "El Nido",
    province: "Palawan",
    price: 1000,
    rating: 4.4,
    reviews: 350,
    images: ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"],
    description: "Party hostel in the middle of town. Meet travelers.",
    host: "Party Host",
    offers: ["Bar", "WiFi", "Tours"],
    category: "Hostel"
  },

  // --- CORON ---
  {
    id: "coron-1",
    title: "Sunset Bay Resort",
    location: "Coron",
    province: "Palawan",
    price: 6000,
    rating: 4.7,
    reviews: 110,
    images: ["https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80"],
    description: "Best sunset view in Coron.",
    host: "Resort Mgr",
    offers: ["Pool", "Restaurant", "Dive Shop"],
    category: "Resort"
  },
  {
    id: "coron-2",
    title: "Busuanga Island Home",
    location: "Coron",
    province: "Palawan",
    price: 3500,
    rating: 4.6,
    reviews: 80,
    images: ["https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80"],
    description: "Quiet home away from the town noise.",
    host: "Local Family",
    offers: ["Garden", "Home Cooked Meals", "Tours"],
    category: "House"
  },
  {
    id: "coron-3",
    title: "Dockside Overwater Room",
    location: "Coron",
    province: "Palawan",
    price: 2800,
    rating: 4.5,
    reviews: 130,
    images: ["https://images.unsplash.com/photo-1439066615861-d1fb8bc3adc5?auto=format&fit=crop&w=800&q=80"],
    description: "Room on stilts over the water.",
    host: "Captain",
    offers: ["Sea Breeze", "Simple Living", "Boat Access"],
    category: "Room"
  },

  // --- PUERTO PRINCESA ---
  {
    id: "puerto-1",
    title: "City Center Garden Inn",
    location: "Puerto Princesa",
    province: "Palawan",
    price: 2000,
    rating: 4.5,
    reviews: 210,
    images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"],
    description: "Green oasis in the city center. Near airport.",
    host: "Innkeeper",
    offers: ["Garden", "Breakfast", "Airport Transfer"],
    category: "Inn"
  },
  {
    id: "puerto-2",
    title: "Honda Bay Villa",
    location: "Puerto Princesa",
    province: "Palawan",
    price: 7000,
    rating: 4.8,
    reviews: 60,
    images: ["https://images.unsplash.com/photo-1473116763249-56381a34a984?auto=format&fit=crop&w=800&q=80"],
    description: "Jump off point for island hopping.",
    host: "Villa Maria",
    offers: ["Pool", "Beach Access", "Boat Rental"],
    category: "Villa"
  },
  {
    id: "puerto-3",
    title: "Microtel Beachfront",
    location: "Puerto Princesa",
    province: "Palawan",
    price: 4500,
    rating: 4.6,
    reviews: 150,
    images: ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80"],
    description: "Only beachfront hotel in the city proper.",
    host: "Microtel",
    offers: ["Beach", "Pool", "Restaurant"],
    category: "Hotel"
  },

  // ================= AKLAN (BORACAY) =================

  // --- MALAY (BORACAY) ---
  {
    id: "boracay-1",
    title: "Station 1 White Beach Resort",
    location: "Malay (Boracay)",
    province: "Aklan",
    price: 9000,
    rating: 4.9,
    reviews: 400,
    images: ["https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80"],
    description: "Best spot on White Beach. Powdery sand right outside.",
    host: "Resort Group",
    offers: ["Beachfront", "Pool", "Spa", "Bar"],
    category: "Resort"
  },
  {
    id: "boracay-2",
    title: "Bulabog Kitesurf Loft",
    location: "Malay (Boracay)",
    province: "Aklan",
    price: 3500,
    rating: 4.7,
    reviews: 120,
    images: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80"],
    description: "Windy side of the island. Perfect for kitesurfers.",
    host: "Kite School",
    offers: ["Gear Storage", "Kitchen", "View"],
    category: "Loft"
  },
  {
    id: "boracay-3",
    title: "Diniwid Private Villa",
    location: "Malay (Boracay)",
    province: "Aklan",
    price: 15000,
    rating: 5.0,
    reviews: 45,
    images: ["https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80"],
    description: "Exclusive villa on a quiet cove. Away from the crowds.",
    host: "Villa Host",
    offers: ["Private Pool", "Chef", "Secluded Beach"],
    category: "Villa"
  },

  // --- KALIBO ---
  {
    id: "kalibo-1",
    title: "Ati-Atihan Family Home",
    location: "Kalibo",
    province: "Aklan",
    price: 2500,
    rating: 4.6,
    reviews: 40,
    images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80"],
    description: "Great base for the festival. Spacious family home.",
    host: "Cruz Family",
    offers: ["Parking", "Kitchen", "3 Bedrooms"],
    category: "House"
  },
  {
    id: "kalibo-2",
    title: "Airport Transit Inn",
    location: "Kalibo",
    province: "Aklan",
    price: 1500,
    rating: 4.3,
    reviews: 90,
    images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"],
    description: "Close to Kalibo International Airport.",
    host: "Innkeeper",
    offers: ["Shuttle", "Breakfast", "WiFi"],
    category: "Inn"
  },
  {
    id: "kalibo-3",
    title: "Mangrove Eco Lodge",
    location: "Kalibo",
    province: "Aklan",
    price: 1800,
    rating: 4.5,
    reviews: 30,
    images: ["https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80"],
    description: "Stay near the Bakhawan Eco-park.",
    host: "Eco Host",
    offers: ["Nature View", "Simple Living", "Tours"],
    category: "Lodge"
  },

  // ================= PAMPANGA =================

  // --- ANGELES ---
  {
    id: "angeles-1",
    title: "Clark Freeport Villa",
    location: "Angeles",
    province: "Pampanga",
    price: 6500,
    rating: 4.8,
    reviews: 75,
    images: ["https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=800&q=80"],
    description: "Inside Clark. Secure and peaceful.",
    host: "Clark Host",
    offers: ["Garage", "Garden", "Security"],
    category: "House"
  },
  {
    id: "angeles-2",
    title: "Modern Condo near Walking Street",
    location: "Angeles",
    province: "Pampanga",
    price: 2800,
    rating: 4.5,
    reviews: 140,
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"],
    description: "Close to nightlife and restaurants.",
    host: "City Host",
    offers: ["WiFi", "AC", "Security"],
    category: "Condo"
  },
  {
    id: "angeles-3",
    title: "Korean Town Apartment",
    location: "Angeles",
    province: "Pampanga",
    price: 2000,
    rating: 4.6,
    reviews: 90,
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"],
    description: "Surrounded by authentic Korean restaurants.",
    host: "Kim",
    offers: ["Kitchen", "WiFi", "Parking"],
    category: "Apartment"
  },

  // --- SAN FERNANDO ---
  {
    id: "sanfernando-1",
    title: "Capital Town Condo",
    location: "San Fernando",
    province: "Pampanga",
    price: 3200,
    rating: 4.7,
    reviews: 50,
    images: ["https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80"],
    description: "New condo in Capital Town.",
    host: "Megaworld",
    offers: ["Pool", "Gym", "View"],
    category: "Condo"
  },
  {
    id: "sanfernando-2",
    title: "Azure North Resort",
    location: "San Fernando",
    province: "Pampanga",
    price: 3500,
    rating: 4.5,
    reviews: 100,
    images: ["https://images.unsplash.com/photo-1532323544230-7191fd510c59?auto=format&fit=crop&w=800&q=80"],
    description: "Man-made beach in Pampanga.",
    host: "Azure Host",
    offers: ["Wave Pool", "Beach", "Balcony"],
    category: "Condo"
  },
  {
    id: "sanfernando-3",
    title: "Ancestral House Heritage Stay",
    location: "San Fernando",
    province: "Pampanga",
    price: 4000,
    rating: 4.8,
    reviews: 30,
    images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"],
    description: "Experience living in a preserved heritage house.",
    host: "Heritage PH",
    offers: ["History", "Garden", "Breakfast"],
    category: "House"
  },

  // ================= CAVITE =================

  // --- TAGAYTAY ---
  {
    id: "tagaytay-1",
    title: "Serene Lakeview Villa",
    location: "Tagaytay",
    province: "Cavite",
    price: 8500,
    rating: 4.9,
    reviews: 124,
    images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"],
    description: "Breathtaking view of Taal Volcano.",
    host: "Maria",
    offers: ["Lake View", "Garden", "Parking"],
    category: "Villa"
  },
  {
    id: "tagaytay-2",
    title: "Wind Residences Tower 1",
    location: "Tagaytay",
    province: "Cavite",
    price: 3000,
    rating: 4.6,
    reviews: 250,
    images: ["https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80"],
    description: "Amenities galore. Indoor and outdoor pools.",
    host: "SM Host",
    offers: ["Pool", "Badminton", "Lounge"],
    category: "Condo"
  },
  {
    id: "tagaytay-3",
    title: "Crosswinds Swiss Cabin",
    location: "Tagaytay",
    province: "Cavite",
    price: 7000,
    rating: 4.8,
    reviews: 80,
    images: ["https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80"],
    description: "Feel like you are in Switzerland. Surrounded by pine trees.",
    host: "Brittany",
    offers: ["Forest View", "Cold Breeze", "Cafe"],
    category: "Cabin"
  },

  // --- DASMARINAS ---
  {
    id: "dasma-1",
    title: "Orchard Golf Villa",
    location: "Dasmarinas",
    province: "Cavite",
    price: 6000,
    rating: 4.7,
    reviews: 40,
    images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80"],
    description: "Inside exclusive golf community.",
    host: "Golfer",
    offers: ["Golf Access", "Quiet", "Security"],
    category: "House"
  },
  {
    id: "dasma-2",
    title: "University Student Pod",
    location: "Dasmarinas",
    province: "Cavite",
    price: 1500,
    rating: 4.4,
    reviews: 60,
    images: ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"],
    description: "Near La Salle Dasma.",
    host: "Student Host",
    offers: ["WiFi", "Study Area", "Security"],
    category: "Pod"
  },
  {
    id: "dasma-3",
    title: "Events Place Guesthouse",
    location: "Dasmarinas",
    province: "Cavite",
    price: 12000,
    rating: 4.8,
    reviews: 20,
    images: ["https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80"],
    description: "Big house for wedding preparations.",
    host: "Events Mgr",
    offers: ["Large Garden", "Parking", "5 Bedrooms"],
    category: "House"
  },

  // ================= BENGUET (BAGUIO) =================
  
  // --- BAGUIO ---
  {
    id: "baguio-1",
    title: "The Pine Cabin",
    location: "Baguio",
    province: "Benguet",
    price: 3800,
    rating: 4.95,
    reviews: 340,
    images: ["https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80"],
    description: "Cozy cabin vibe with real fireplace.",
    host: "Benjie",
    offers: ["Fireplace", "Hot Shower", "Mountain View"],
    category: "Cabin"
  },
  {
    id: "baguio-2",
    title: "Hilltop Transient Home",
    location: "Baguio",
    province: "Benguet",
    price: 5500,
    rating: 4.6,
    reviews: 50,
    images: ["https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=800&q=80"],
    description: "Spacious home good for large groups.",
    host: "Elena",
    offers: ["Parking", "Kitchen", "Balcony"],
    category: "House"
  },
  {
    id: "baguio-3",
    title: "Session Road Studio",
    location: "Baguio",
    province: "Benguet",
    price: 2500,
    rating: 4.7,
    reviews: 200,
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"],
    description: "Right in the center of town. Walk everywhere.",
    host: "City Host",
    offers: ["Location", "WiFi", "TV"],
    category: "Studio"
  }, {
    id: "church-1",
    title: "Caleruega Church",
    location: "Nasugbu",
    province: "Batangas",
    price: 15000,
    rating: 4.9,
    reviews: 850,
    images: ["https://images.unsplash.com/photo-1548625361-e88c694b4cb7?auto=format&fit=crop&w=1000&q=80"], // Generic church/chapel image
    description: "The famous 'Church on the Hill'. A spiritual and scenic sanctuary perfect for weddings.",
    host: "Dominican Fathers",
    offers: ["Chapel", "Retreat House", "Gardens"],
    category: "Religious Organizations"
  },
  {
    id: "church-2",
    title: "San Agustin Church",
    location: "Intramuros",
    province: "Manila",
    price: 25000,
    rating: 4.8,
    reviews: 1200,
    images: ["https://images.unsplash.com/photo-1577046848358-4623c085f0ea?auto=format&fit=crop&w=1000&q=80"],
    description: "A UNESCO World Heritage site and a favorite for classic Manila weddings.",
    host: "Augustinian Order",
    offers: ["Heritage Site", "Museum", "Choir Loft"],
    category: "Religious Organizations"
  },

  // --- PETS (Pet Hotels / Pet Friendly Venues) ---
  {
    id: "pet-1",
    title: "Bark Central Pet Hotel",
    location: "Mandaluyong",
    province: "Metro Manila",
    price: 1500,
    rating: 4.7,
    reviews: 88,
    images: ["https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1000&q=80"],
    description: "Indoor dog park and hotel. We take care of your pets while you attend events.",
    host: "Bark Team",
    offers: ["Grooming", "Boarding", "Play Area"],
    category: "Pets"
  },
  {
    id: "pet-2",
    title: "The Cabin Dog Resort",
    location: "Subic",
    province: "Zambales",
    price: 4500,
    rating: 4.9,
    reviews: 45,
    images: ["https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1000&q=80"],
    description: "A vacation for you and your dog. Huge swimming pool for pets.",
    host: "Dog Lover",
    offers: ["Pet Pool", "Agility Course", "Villa"],
    category: "Pets"
  },

  // --- HEALTH & MEDICAL (Wellness Retreats) ---
  {
    id: "health-1",
    title: "The Farm at San Benito",
    location: "Lipa",
    province: "Batangas",
    price: 18000,
    rating: 4.9,
    reviews: 320,
    images: ["https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1000&q=80"],
    description: "Holistic medical wellness resort. Detox and rejuvenate.",
    host: "The Farm Admin",
    offers: ["Medical Spa", "Vegan Food", "Yoga"],
    category: "Health & Medical"
  },
  {
    id: "health-2",
    title: "Luljetta's Hanging Gardens",
    location: "Antipolo",
    province: "Rizal",
    price: 2500,
    rating: 4.6,
    reviews: 500,
    images: ["https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80"],
    description: "The first and only hanging gardens spa in the Philippines.",
    host: "Luljetta",
    offers: ["Spa", "Infinity Pool", "Massage"],
    category: "Health & Medical"
  },

  // --- COFFEE & TEA (Cafes with Event Spaces) ---
  {
    id: "coffee-1",
    title: "Burrow Cafe",
    location: "Taytay",
    province: "Rizal",
    price: 15000,
    rating: 4.8,
    reviews: 210,
    images: ["https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1000&q=80"],
    description: "An underground cafe hidden in a forest. Perfect for intimate gatherings.",
    host: "Vitty",
    offers: ["Private Dining", "Forest View", "Coffee"],
    category: "Coffee & Tea"
  },
  {
    id: "coffee-2",
    title: "Wildflour Cafe BGC",
    location: "Taguig",
    province: "Metro Manila",
    price: 5000,
    rating: 4.7,
    reviews: 1500,
    images: ["https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=80"],
    description: "Famous for brunch and pastries. Available for private evening functions.",
    host: "Wildflour Grp",
    offers: ["Pastries", "Cocktails", "Function Room"],
    category: "Coffee & Tea"
  },

  // --- ARTS & ENTERTAINMENT (Museums / Galleries) ---
  {
    id: "art-1",
    title: "Pinto Art Museum",
    location: "Antipolo",
    province: "Rizal",
    price: 600,
    rating: 4.8,
    reviews: 2000,
    images: ["https://images.unsplash.com/photo-1518998053901-5348d3969105?auto=format&fit=crop&w=1000&q=80"],
    description: "Mission-style buildings filled with contemporary art amidst gardens.",
    host: "Dr. Cuanang",
    offers: ["Pre-nup Shoot", "Gallery", "Cafe"],
    category: "Arts & Entertainment"
  },
  {
    id: "art-2",
    title: "National Museum of Natural History",
    location: "Manila",
    province: "Metro Manila",
    price: 0,
    rating: 4.9,
    reviews: 5000,
    images: ["https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=1000&q=80"],
    description: "Iconic 'Tree of Life' architecture. Great for educational tours.",
    host: "Gov",
    offers: ["Exhibits", "Tours", "Architecture"],
    category: "Arts & Entertainment"
  },

  // --- FINANCIAL SERVICES (Banks/Centers - just placeholders to show logic works) ---
  {
    id: "finance-1",
    title: "BDO Corporate Center",
    location: "Makati",
    province: "Metro Manila",
    price: 0,
    rating: 4.2,
    reviews: 50,
    images: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80"],
    description: "Main branch for corporate banking needs.",
    host: "BDO",
    offers: ["ATM", "Loans", "Investment"],
    category: "Financial Services"
  },

  // --- PUBLIC SERVICES ---
  {
    id: "gov-1",
    title: "Quezon City Hall",
    location: "Quezon City",
    province: "Metro Manila",
    price: 0,
    rating: 3.5,
    reviews: 200,
    images: ["https://images.unsplash.com/photo-1558448835-132d782df82e?auto=format&fit=crop&w=1000&q=80"],
    description: "Government center for civil weddings and permits.",
    host: "LGU",
    offers: ["Civil Wedding", "Permits", "Park"],
    category: "Public Services & Government"
  },

  // --- REAL ESTATE ---
  {
    id: "realestate-1",
    title: "Rockwell Center Showroom",
    location: "Makati",
    province: "Metro Manila",
    price: 0,
    rating: 4.8,
    reviews: 20,
    images: ["https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1000&q=80"],
    description: "Premium condominium showroom.",
    host: "Rockwell Land",
    offers: ["Model Unit", "Inquiries", "Coffee"],
    category: "Real Estate"
  }
];