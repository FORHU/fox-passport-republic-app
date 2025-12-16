export interface Venue {
  id: string;
  title: string;
  location: string;
  province: string;
  price: number;
  rating: number;
  reviews: number;
  images: string[];
  description: string;
  category: string;
  guestCount: number;
  bedroomCount: number;
  bathroomCount: number;
  host: {
    name: string;
    avatar: string;
    isSuperhost: boolean;
    joined: string;
  };
  offers: string[];
  activities: string[];
  ratingCategories: {
    cleanliness: number;
    accuracy: number;
    checkIn: number;
    communication: number;
    location: number;
    value: number;
  };
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
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512918760513-95f1fde64203?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Experience the vibrant nightlife of Poblacion from this modern industrial loft.",
    category: "Apartment",
    guestCount: 2,
    bedroomCount: 1,
    bathroomCount: 1,
    host: { name: "Miguel", avatar: "https://i.pravatar.cc/150?u=miguel", isSuperhost: true, joined: "Joined 2019" },
    offers: ["City View", "Wifi", "Smart TV", "Gym", "Kitchen", "AC"],
    activities: ["Bar Hopping in Poblacion", "Rockwell Center Shopping", "Ayala Museum", "Salcedo Market"],
    ratingCategories: { cleanliness: 4.8, accuracy: 4.9, checkIn: 5.0, communication: 4.8, location: 4.7, value: 4.8 }
  },
  {
    id: "makati-2",
    title: "Greenbelt Garden Studio",
    location: "Makati",
    province: "Metro Manila",
    price: 4200,
    rating: 4.92,
    reviews: 85,
    images: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1484154218962-a1c002085d2f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80"
    ],
    description: "A quiet oasis right across Greenbelt mall. Perfect for business travelers.",
    category: "Condo",
    guestCount: 2,
    bedroomCount: 0,
    bathroomCount: 1,
    host: { name: "Anna", avatar: "https://i.pravatar.cc/150?u=anna", isSuperhost: false, joined: "Joined 2021" },
    offers: ["Pool", "Workspace", "Kitchen", "Wifi", "Self check-in"],
    activities: ["Greenbelt Mall", "Ayala Triangle Gardens", "Legazpi Sunday Market", "Yuchengco Museum"],
    ratingCategories: { cleanliness: 5.0, accuracy: 4.8, checkIn: 4.9, communication: 5.0, location: 5.0, value: 4.8 }
  },
  {
    id: "makati-3",
    title: "Salcedo Village Executive Suite",
    location: "Makati",
    province: "Metro Manila",
    price: 5100,
    rating: 4.8,
    reviews: 64,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1616594039964-40891a904d08?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Walk to the Saturday market from this luxurious suite.",
    category: "Suite",
    guestCount: 3,
    bedroomCount: 1,
    bathroomCount: 1,
    host: { name: "Robert", avatar: "https://i.pravatar.cc/150?u=robert", isSuperhost: true, joined: "Joined 2020" },
    offers: ["Balcony", "Washer", "Security", "Pool", "Gym"],
    activities: ["Salcedo Market", "Ayala Triangle", "Poblacion Nightlife", "Power Plant Mall"],
    ratingCategories: { cleanliness: 4.9, accuracy: 4.8, checkIn: 4.7, communication: 4.9, location: 4.9, value: 4.6 }
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
    images: [
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522771753035-10a637d5d4a1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1505693416388-b0346efee53e?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Heart of BGC. Steps away from High Street and Mind Museum.",
    category: "Condo",
    guestCount: 4,
    bedroomCount: 2,
    bathroomCount: 2,
    host: { name: "Sarah", avatar: "https://i.pravatar.cc/150?u=sarah", isSuperhost: true, joined: "Joined 2018" },
    offers: ["Pool", "Gym", "Wifi", "Kitchen", "Elevator"],
    activities: ["Bonifacio High Street", "Mind Museum", "Forbes Town Center", "Venice Grand Canal"],
    ratingCategories: { cleanliness: 4.9, accuracy: 4.9, checkIn: 4.9, communication: 5.0, location: 5.0, value: 4.7 }
  },
  {
    id: "taguig-2",
    title: "Modern Loft Near Venice Mall",
    location: "Taguig",
    province: "Metro Manila",
    price: 3200,
    rating: 4.7,
    reviews: 140,
    images: [
      "https://images.unsplash.com/photo-1505693416388-b0346efee53e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512918760513-95f1fde64203?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Cozy loft perfect for couples visiting the Grand Canal Mall.",
    category: "Loft",
    guestCount: 2,
    bedroomCount: 1,
    bathroomCount: 1,
    host: { name: "Luis", avatar: "https://i.pravatar.cc/150?u=luis", isSuperhost: false, joined: "Joined 2022" },
    offers: ["Netflix", "Kitchen", "AC", "Wifi", "Hot water"],
    activities: ["Venice Grand Canal Gondola", "SM Aura Premier", "Market! Market!", "BGC Arts Center"],
    ratingCategories: { cleanliness: 4.6, accuracy: 4.7, checkIn: 4.8, communication: 4.9, location: 4.8, value: 4.6 }
  },
  {
    id: "taguig-3",
    title: "Uptown Parksuites Lux",
    location: "Taguig",
    province: "Metro Manila",
    price: 6000,
    rating: 4.95,
    reviews: 55,
    images: [
      "https://images.unsplash.com/photo-1512918760513-95f1fde64203?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Luxury living near Uptown Mall and Palace Pool Club.",
    category: "Apartment",
    guestCount: 4,
    bedroomCount: 2,
    bathroomCount: 2,
    host: { name: "Premium Stays", avatar: "https://i.pravatar.cc/150?u=premium", isSuperhost: true, joined: "Joined 2020" },
    offers: ["Concierge", "Pool", "City View", "Gym", "Smart Home"],
    activities: ["Uptown Mall", "The Palace", "Landers Superstore", "Mitsukoshi BGC"],
    ratingCategories: { cleanliness: 5.0, accuracy: 4.9, checkIn: 5.0, communication: 4.9, location: 5.0, value: 4.8 }
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
    images: [
      "https://images.unsplash.com/photo-1522771753035-10a637d5d4a1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512918760513-95f1fde64203?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Affordable staycation in Eastwood City. Pet friendly.",
    category: "Condo",
    guestCount: 3,
    bedroomCount: 1,
    bathroomCount: 1,
    host: { name: "Jenny", avatar: "https://i.pravatar.cc/150?u=jenny", isSuperhost: false, joined: "Joined 2021" },
    offers: ["Pet Friendly", "Wifi", "Mall Access", "Pool", "Kitchen"],
    activities: ["Eastwood Mall", "City of Stars Walk", "Art in Island", "Cubao Expo"],
    ratingCategories: { cleanliness: 4.7, accuracy: 4.8, checkIn: 4.9, communication: 4.8, location: 5.0, value: 4.8 }
  },
  {
    id: "qc-2",
    title: "Katipunan Studio near Ateneo",
    location: "Quezon City",
    province: "Metro Manila",
    price: 2200,
    rating: 4.8,
    reviews: 112,
    images: [
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Perfect for students or visiting parents.",
    category: "Studio",
    guestCount: 2,
    bedroomCount: 0,
    bathroomCount: 1,
    host: { name: "Marco", avatar: "https://i.pravatar.cc/150?u=marco", isSuperhost: true, joined: "Joined 2019" },
    offers: ["Workspace", "Wifi", "Cafe Nearby", "Security", "AC"],
    activities: ["UP Diliman Campus", "Maginhawa Food Street", "Ateneo Art Gallery", "UP Town Center"],
    ratingCategories: { cleanliness: 4.8, accuracy: 4.9, checkIn: 4.8, communication: 4.9, location: 4.9, value: 4.7 }
  },
  {
    id: "qc-3",
    title: "Tomas Morato Chic Place",
    location: "Quezon City",
    province: "Metro Manila",
    price: 3000,
    rating: 4.75,
    reviews: 45,
    images: [
      "https://images.unsplash.com/photo-1556020685-ae41abfc9365?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522771753035-10a637d5d4a1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1505693416388-b0346efee53e?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Food trip haven! Surrounded by the best restaurants.",
    category: "Apartment",
    guestCount: 4,
    bedroomCount: 1,
    bathroomCount: 1,
    host: { name: "Chef Tony", avatar: "https://i.pravatar.cc/150?u=tony", isSuperhost: false, joined: "Joined 2022" },
    offers: ["Netflix", "Kitchen", "Parking", "Wifi", "Smart TV"],
    activities: ["Tomas Morato Food Trip", "Timog Nightlife", "Quezon Memorial Circle", "Ninoy Aquino Parks"],
    ratingCategories: { cleanliness: 4.8, accuracy: 4.8, checkIn: 4.8, communication: 4.9, location: 5.0, value: 4.7 }
  },

  // --- CEBU CITY ---
  {
    id: "cebu-1",
    title: "IT Park Modern Condo",
    location: "Cebu City",
    province: "Cebu",
    price: 2800,
    rating: 4.8,
    reviews: 156,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512918760513-95f1fde64203?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Modern unit right inside IT Park.",
    category: "Condo",
    guestCount: 3,
    bedroomCount: 1,
    bathroomCount: 1,
    host: { name: "Cebu Stays", avatar: "https://i.pravatar.cc/150?u=cebustays", isSuperhost: true, joined: "Joined 2019" },
    offers: ["Pool", "Wifi", "Netflix", "Kitchen", "Security"],
    activities: ["Sugbo Mercado", "Ayala Center Cebu", "Taoist Temple", "Magellan's Cross"],
    ratingCategories: { cleanliness: 4.8, accuracy: 4.8, checkIn: 4.9, communication: 4.9, location: 5.0, value: 4.7 }
  },
  {
    id: "cebu-2",
    title: "Ayala Center Luxury Suite",
    location: "Cebu City",
    province: "Cebu",
    price: 4500,
    rating: 4.9,
    reviews: 80,
    images: [
      "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512918760513-95f1fde64203?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Direct access to Ayala Mall. Premium furnishings.",
    category: "Suite",
    guestCount: 2,
    bedroomCount: 1,
    bathroomCount: 1,
    host: { name: "Elite Hosts", avatar: "https://i.pravatar.cc/150?u=elite", isSuperhost: true, joined: "Joined 2020" },
    offers: ["Gym", "Pool", "Mall Access", "Wifi", "Concierge"],
    activities: ["Shopping at Ayala", "Casa Gorordo Museum", "Fort San Pedro", "Carbon Market"],
    ratingCategories: { cleanliness: 5.0, accuracy: 4.9, checkIn: 5.0, communication: 4.9, location: 5.0, value: 4.8 }
  },
  {
    id: "cebu-3",
    title: "Busay Mountain View Home",
    location: "Cebu City",
    province: "Cebu",
    price: 7500,
    rating: 4.95,
    reviews: 45,
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Stunning night view of the city.",
    category: "House",
    guestCount: 8,
    bedroomCount: 4,
    bathroomCount: 3,
    host: { name: "Mountain Retreats", avatar: "https://i.pravatar.cc/150?u=mountain", isSuperhost: true, joined: "Joined 2017" },
    offers: ["View Deck", "Parking", "Kitchen", "BBQ Grill", "Garden"],
    activities: ["Temple of Leah", "Sirao Garden", "Tops Lookout", "La Vie in the Sky"],
    ratingCategories: { cleanliness: 4.9, accuracy: 5.0, checkIn: 4.9, communication: 5.0, location: 4.8, value: 5.0 }
  },

  // --- DAVAO ---
  {
    id: "davao-1",
    title: "Marco Polo Residences",
    location: "Davao City",
    province: "Davao del Sur",
    price: 4000,
    rating: 4.8,
    reviews: 110,
    images: [
      "https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522771753035-10a637d5d4a1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80"
    ],
    description: "High-end living in the heart of Davao.",
    category: "Apartment",
    guestCount: 3,
    bedroomCount: 2,
    bathroomCount: 2,
    host: { name: "Davao Elite", avatar: "https://i.pravatar.cc/150?u=davao", isSuperhost: false, joined: "Joined 2021" },
    offers: ["Pool", "Gym", "Concierge", "Wifi", "Parking"],
    activities: ["Philippine Eagle Center", "Mount Apo Trek", "People's Park", "Davao Crocodile Park"],
    ratingCategories: { cleanliness: 4.9, accuracy: 4.8, checkIn: 4.8, communication: 4.7, location: 4.9, value: 4.6 }
  },
  {
    id: "davao-2",
    title: "Abreeza Place Condo",
    location: "Davao City",
    province: "Davao del Sur",
    price: 3200,
    rating: 4.7,
    reviews: 140,
    images: [
      "https://images.unsplash.com/photo-1522771753035-10a637d5d4a1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512918760513-95f1fde64203?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Directly across Abreeza Mall. Very convenient.",
    category: "Condo",
    guestCount: 2,
    bedroomCount: 1,
    bathroomCount: 1,
    host: { name: "Grace", avatar: "https://i.pravatar.cc/150?u=grace", isSuperhost: true, joined: "Joined 2019" },
    offers: ["Mall Access", "Wifi", "Pool", "Gym", "Security"],
    activities: ["Abreeza Mall", "Roxas Night Market", "Samal Island Hop", "Jack's Ridge Dining"],
    ratingCategories: { cleanliness: 4.8, accuracy: 4.7, checkIn: 4.9, communication: 4.8, location: 5.0, value: 4.7 }
  },
  {
    id: "davao-3",
    title: "Jack's Ridge Hilltop Home",
    location: "Davao City",
    province: "Davao del Sur",
    price: 6000,
    rating: 4.9,
    reviews: 55,
    images: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Best view of Davao City lights at night.",
    category: "House",
    guestCount: 6,
    bedroomCount: 3,
    bathroomCount: 2,
    host: { name: "Jack", avatar: "https://i.pravatar.cc/150?u=jack", isSuperhost: true, joined: "Joined 2015" },
    offers: ["View Deck", "Garden", "Parking", "Restaurant Nearby", "Wifi"],
    activities: ["Jack's Ridge Resort", "Shrine of the Holy Infant", "Zip City", "Japanese Tunnel"],
    ratingCategories: { cleanliness: 4.9, accuracy: 4.9, checkIn: 4.8, communication: 4.8, location: 5.0, value: 4.8 }
  },

  // --- PALAWAN (EL NIDO & CORON) ---
  {
    id: "elnido-1",
    title: "Beachfront Bamboo Villa",
    location: "El Nido",
    province: "Palawan",
    price: 12000,
    rating: 4.95,
    reviews: 200,
    images: [
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1439066615861-d1fb8bc3adc5?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Wake up to the sound of waves. Private beach access in a secluded cove.",
    category: "Villa",
    guestCount: 4,
    bedroomCount: 2,
    bathroomCount: 2,
    host: { name: "Island Tours", avatar: "https://i.pravatar.cc/150?u=island", isSuperhost: true, joined: "Joined 2016" },
    offers: ["Beach Access", "Breakfast", "Kayak", "Hammock", "Wifi"],
    activities: ["Island Hopping Tour A", "Nacpan Beach", "Big Lagoon", "Taraw Cliff"],
    ratingCategories: { cleanliness: 4.9, accuracy: 5.0, checkIn: 4.8, communication: 5.0, location: 5.0, value: 4.9 }
  },
  {
    id: "coron-1",
    title: "Sunset Bay Resort",
    location: "Coron",
    province: "Palawan",
    price: 6000,
    rating: 4.7,
    reviews: 110,
    images: [
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1439066615861-d1fb8bc3adc5?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Best sunset view in Coron.",
    category: "Resort",
    guestCount: 2,
    bedroomCount: 1,
    bathroomCount: 1,
    host: { name: "Resort Mgr", avatar: "https://i.pravatar.cc/150?u=resortmgr", isSuperhost: true, joined: "Joined 2017" },
    offers: ["Pool", "Restaurant", "Dive Shop", "Wifi", "Breakfast"],
    activities: ["Kayangan Lake", "Twin Lagoon", "Maquinit Hot Spring", "Mt. Tapyas"],
    ratingCategories: { cleanliness: 4.8, accuracy: 4.7, checkIn: 4.8, communication: 4.8, location: 4.9, value: 4.6 }
  },

  // --- BAGUIO ---
  {
    id: "baguio-1",
    title: "The Pine Cabin: Cozy Mountain Retreat",
    location: "Baguio",
    province: "Benguet",
    price: 3800,
    rating: 4.95,
    reviews: 340,
    images: [
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Cozy cabin vibe with real fireplace.",
    category: "Cabin",
    guestCount: 6,
    bedroomCount: 2,
    bathroomCount: 2,
    host: { name: "Benjie", avatar: "https://i.pravatar.cc/150?u=benjie", isSuperhost: true, joined: "Joined 2020" },
    offers: ["Fireplace", "Hot Shower", "Mountain View", "Wifi", "Kitchen", "Parking"],
    activities: ["Burnham Park", "Night Market", "Camp John Hay", "Mines View Park"],
    ratingCategories: { cleanliness: 4.9, accuracy: 5.0, checkIn: 4.9, communication: 5.0, location: 4.8, value: 4.9 }
  },
  {
    id: "baguio-2",
    title: "Hilltop Transient Home",
    location: "Baguio",
    province: "Benguet",
    price: 5500,
    rating: 4.6,
    reviews: 50,
    images: [
      "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Spacious home good for large groups.",
    category: "House",
    guestCount: 10,
    bedroomCount: 4,
    bathroomCount: 3,
    host: { name: "Elena", avatar: "https://i.pravatar.cc/150?u=elena", isSuperhost: false, joined: "Joined 2021" },
    offers: ["Parking", "Kitchen", "Balcony", "Wifi", "Hot Shower"],
    activities: ["Strawberry Farm", "Tam-awan Village", "Botanical Garden", "Diplomat Hotel"],
    ratingCategories: { cleanliness: 4.6, accuracy: 4.7, checkIn: 4.8, communication: 4.9, location: 4.5, value: 4.7 }
  },
  {
    id: "baguio-3",
    title: "Session Road Studio",
    location: "Baguio",
    province: "Benguet",
    price: 2500,
    rating: 4.7,
    reviews: 200,
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512918760513-95f1fde64203?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Right in the center of town. Walk everywhere.",
    category: "Studio",
    guestCount: 2,
    bedroomCount: 0,
    bathroomCount: 1,
    host: { name: "City Host", avatar: "https://i.pravatar.cc/150?u=city", isSuperhost: true, joined: "Joined 2019" },
    offers: ["Location", "Wifi", "TV", "Security", "Hot Shower"],
    activities: ["Session Road Dining", "Burnham Park Boating", "Baguio Cathedral", "SM Baguio"],
    ratingCategories: { cleanliness: 4.7, accuracy: 4.8, checkIn: 4.9, communication: 4.9, location: 5.0, value: 4.8 }
  },

  // --- TAGAYTAY ---
  {
    id: "tagaytay-1",
    title: "Serene Lakeview Villa",
    location: "Tagaytay",
    province: "Cavite",
    price: 8500,
    rating: 4.9,
    reviews: 124,
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Breathtaking view of Taal Volcano.",
    category: "Villa",
    guestCount: 8,
    bedroomCount: 3,
    bathroomCount: 3,
    host: { name: "Maria", avatar: "https://i.pravatar.cc/150?u=maria", isSuperhost: true, joined: "Joined 2018" },
    offers: ["Lake View", "Garden", "Parking", "Hot water", "Wifi"],
    activities: ["Sky Ranch", "Picnic Grove", "People's Park", "Taal Volcano Trek"],
    ratingCategories: { cleanliness: 4.9, accuracy: 4.8, checkIn: 4.9, communication: 4.9, location: 5.0, value: 4.8 }
  },
  {
    id: "tagaytay-2",
    title: "Wind Residences Tower 1",
    location: "Tagaytay",
    province: "Cavite",
    price: 3000,
    rating: 4.6,
    reviews: 250,
    images: [
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522771753035-10a637d5d4a1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1505693416388-b0346efee53e?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Amenities galore. Indoor and outdoor pools.",
    category: "Condo",
    guestCount: 4,
    bedroomCount: 1,
    bathroomCount: 1,
    host: { name: "SM Host", avatar: "https://i.pravatar.cc/150?u=sm", isSuperhost: false, joined: "Joined 2019" },
    offers: ["Pool", "Badminton", "Lounge", "Wifi", "Parking"],
    activities: ["Sky Ranch", "Mahogany Market", "Puzzle Mansion", "Paradizoo"],
    ratingCategories: { cleanliness: 4.6, accuracy: 4.7, checkIn: 4.5, communication: 4.8, location: 4.9, value: 4.7 }
  },
  {
    id: "tagaytay-3",
    title: "Crosswinds Swiss Cabin",
    location: "Tagaytay",
    province: "Cavite",
    price: 7000,
    rating: 4.8,
    reviews: 80,
    images: [
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Feel like you are in Switzerland. Surrounded by pine trees.",
    category: "Cabin",
    guestCount: 6,
    bedroomCount: 2,
    bathroomCount: 2,
    host: { name: "Brittany", avatar: "https://i.pravatar.cc/150?u=brit", isSuperhost: true, joined: "Joined 2020" },
    offers: ["Forest View", "Cold Breeze", "Cafe", "Wifi", "Parking"],
    activities: ["Crosswinds Tagaytay", "Museo Orlina", "Ming's Garden", "Sonya's Garden"],
    ratingCategories: { cleanliness: 4.9, accuracy: 4.9, checkIn: 4.8, communication: 4.9, location: 4.7, value: 4.8 }
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
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Inside exclusive golf community. Quiet and secure.",
    category: "House",
    guestCount: 5,
    bedroomCount: 3,
    bathroomCount: 2,
    host: { name: "Golfer", avatar: "https://i.pravatar.cc/150?u=golf", isSuperhost: true, joined: "Joined 2018" },
    offers: ["Golf Access", "Quiet", "Security", "Garden", "Parking"],
    activities: ["The Orchard Golf & Country Club", "Dasmarinas Technopark", "SM Dasma Shopping"],
    ratingCategories: { cleanliness: 4.8, accuracy: 4.8, checkIn: 4.9, communication: 4.9, location: 4.6, value: 4.7 }
  },
  {
    id: "dasma-2",
    title: "University Student Pod",
    location: "Dasmarinas",
    province: "Cavite",
    price: 1500,
    rating: 4.4,
    reviews: 60,
    images: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512918760513-95f1fde64203?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Near La Salle Dasma. Perfect for students needing a quiet place to study or overnight stays.",
    category: "Pod",
    guestCount: 1,
    bedroomCount: 1,
    bathroomCount: 1,
    host: { name: "Student Host", avatar: "https://i.pravatar.cc/150?u=student", isSuperhost: false, joined: "Joined 2021" },
    offers: ["Wifi", "Study Area", "Security", "AC", "Shared Bath"],
    activities: ["DLSU Dasma Campus", "Kadiwa Park", "Museo De La Salle", "SM Dasmarinas"],
    ratingCategories: { cleanliness: 4.5, accuracy: 4.6, checkIn: 4.8, communication: 4.7, location: 5.0, value: 4.9 }
  },
  {
    id: "dasma-3",
    title: "Events Place Guesthouse",
    location: "Dasmarinas",
    province: "Cavite",
    price: 12000,
    rating: 4.8,
    reviews: 20,
    images: [
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Big house optimized for wedding preparations and family reunions. Large garden for photoshoots.",
    category: "House",
    guestCount: 15,
    bedroomCount: 5,
    bathroomCount: 4,
    host: { name: "Events Mgr", avatar: "https://i.pravatar.cc/150?u=events", isSuperhost: true, joined: "Joined 2019" },
    offers: ["Large Garden", "Parking", "5 Bedrooms", "Kitchen", "Wifi"],
    activities: ["Wedding Prep", "Photo Shoots", "Family Reunion", "Catering Setup"],
    ratingCategories: { cleanliness: 4.9, accuracy: 4.8, checkIn: 4.8, communication: 4.9, location: 4.7, value: 4.8 }
  },

  // ================= CHURCHES =================
  {
    id: "church-1",
    title: "Caleruega Church",
    location: "Nasugbu",
    province: "Batangas",
    price: 15000,
    rating: 4.9,
    reviews: 850,
    images: [
      "https://images.unsplash.com/photo-1548625361-e88c694b4cb7?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1577046848358-4623c085f0ea?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1465847899078-b14fe118028f?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "The famous 'Church on the Hill'. A spiritual and scenic sanctuary perfect for weddings. Lush gardens and brick pathways.",
    category: "Religious Organizations",
    guestCount: 200,
    bedroomCount: 0,
    bathroomCount: 4,
    host: { name: "Dominican Fathers", avatar: "https://i.pravatar.cc/150?u=church", isSuperhost: true, joined: "Joined 1995" },
    offers: ["Chapel", "Retreat House", "Gardens", "Parking", "Security"],
    activities: ["Wedding Ceremony", "Retreat", "Via Crucis", "Nature Walk"],
    ratingCategories: { cleanliness: 5.0, accuracy: 5.0, checkIn: 5.0, communication: 4.8, location: 4.7, value: 4.9 }
  },
  {
    id: "church-2",
    title: "San Agustin Church",
    location: "Intramuros",
    province: "Manila",
    price: 25000,
    rating: 4.8,
    reviews: 1200,
    images: [
      "https://images.unsplash.com/photo-1577046848358-4623c085f0ea?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1548625361-e88c694b4cb7?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1518998053901-5348d3969105?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1555529733-0e670560f7e1?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "A UNESCO World Heritage site and a favorite for classic Manila weddings. Baroque architecture at its finest.",
    category: "Religious Organizations",
    guestCount: 300,
    bedroomCount: 0,
    bathroomCount: 2,
    host: { name: "Augustinian Order", avatar: "https://i.pravatar.cc/150?u=agustin", isSuperhost: true, joined: "Joined 1607" },
    offers: ["Heritage Site", "Museum", "Choir Loft", "AC", "Parking"],
    activities: ["Historical Tour", "Wedding Mass", "Museum Visit", "Intramuros Walk"],
    ratingCategories: { cleanliness: 4.8, accuracy: 4.9, checkIn: 4.7, communication: 4.5, location: 5.0, value: 4.9 }
  },

  // --- PETS ---
  {
    id: "pet-1",
    title: "Bark Central Pet Hotel",
    location: "Mandaluyong",
    province: "Metro Manila",
    price: 1500,
    rating: 4.7,
    reviews: 88,
    images: [
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1535930749574-1399327ce78f?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "Indoor dog park and hotel. We take care of your pets while you attend events.",
    category: "Pets",
    guestCount: 1,
    bedroomCount: 1,
    bathroomCount: 1,
    host: { name: "Bark Team", avatar: "https://i.pravatar.cc/150?u=bark", isSuperhost: true, joined: "Joined 2019" },
    offers: ["Grooming", "Boarding", "Play Area", "AC", "CCTV"],
    activities: ["Dog Agility", "Pet Boarding", "Socialization", "Grooming Day"],
    ratingCategories: { cleanliness: 5.0, accuracy: 4.8, checkIn: 4.9, communication: 4.9, location: 4.8, value: 4.6 }
  },
  {
    id: "pet-2",
    title: "The Cabin Dog Resort",
    location: "Subic",
    province: "Zambales",
    price: 4500,
    rating: 4.9,
    reviews: 45,
    images: [
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1532323544230-7191fd510c59?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1544568100-847a94813693?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1522276498395-f4f68f7f8a9d?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "A vacation for you and your dog. Huge swimming pool specifically for pets.",
    category: "Pets",
    guestCount: 4,
    bedroomCount: 2,
    bathroomCount: 2,
    host: { name: "Dog Lover", avatar: "https://i.pravatar.cc/150?u=doglover", isSuperhost: true, joined: "Joined 2020" },
    offers: ["Pet Pool", "Agility Course", "Villa", "Garden", "Parking"],
    activities: ["Dog Swimming", "Off-leash Running", "Nature Hike", "Beach Trip"],
    ratingCategories: { cleanliness: 4.9, accuracy: 4.9, checkIn: 5.0, communication: 5.0, location: 4.7, value: 4.8 }
  },

  // --- HEALTH & MEDICAL ---
  {
    id: "health-1",
    title: "The Farm at San Benito",
    location: "Lipa",
    province: "Batangas",
    price: 18000,
    rating: 4.9,
    reviews: 320,
    images: [
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "Holistic medical wellness resort. Detox and rejuvenate with our world-class treatments and vegan cuisine.",
    category: "Health & Medical",
    guestCount: 2,
    bedroomCount: 1,
    bathroomCount: 1,
    host: { name: "The Farm Admin", avatar: "https://i.pravatar.cc/150?u=farm", isSuperhost: true, joined: "Joined 2010" },
    offers: ["Medical Spa", "Vegan Food", "Yoga", "Pool", "Gardens"],
    activities: ["Yoga Class", "Medical Detox", "Spa Treatment", "Nature Walk"],
    ratingCategories: { cleanliness: 5.0, accuracy: 4.9, checkIn: 5.0, communication: 5.0, location: 4.8, value: 4.7 }
  },
  {
    id: "health-2",
    title: "Luljetta's Hanging Gardens",
    location: "Antipolo",
    province: "Rizal",
    price: 2500,
    rating: 4.6,
    reviews: 500,
    images: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "The first and only hanging gardens spa in the Philippines. Relax with a view of Laguna de Bay.",
    category: "Health & Medical",
    guestCount: 2,
    bedroomCount: 0,
    bathroomCount: 2,
    host: { name: "Luljetta", avatar: "https://i.pravatar.cc/150?u=luljetta", isSuperhost: false, joined: "Joined 2015" },
    offers: ["Spa", "Infinity Pool", "Massage", "Sauna", "Cafe"],
    activities: ["Full Body Massage", "Infinity Pool Dip", "Sunset Viewing", "Sauna Session"],
    ratingCategories: { cleanliness: 4.7, accuracy: 4.6, checkIn: 4.8, communication: 4.7, location: 4.9, value: 4.8 }
  },

  // --- COFFEE & TEA ---
  {
    id: "coffee-1",
    title: "Burrow Cafe",
    location: "Taytay",
    province: "Rizal",
    price: 15000,
    rating: 4.8,
    reviews: 210,
    images: [
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1463797221720-6b07e6426c24?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1507133750069-419571604855?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "An underground cafe hidden in a forest. Perfect for intimate gatherings and rustic weddings.",
    category: "Coffee & Tea",
    guestCount: 50,
    bedroomCount: 0,
    bathroomCount: 2,
    host: { name: "Vitty", avatar: "https://i.pravatar.cc/150?u=vitty", isSuperhost: true, joined: "Joined 2018" },
    offers: ["Private Dining", "Forest View", "Coffee", "Event Space", "Parking"],
    activities: ["Breakfast Wedding", "Private Brunch", "Nature Photography", "Coffee Tasting"],
    ratingCategories: { cleanliness: 4.8, accuracy: 4.7, checkIn: 4.8, communication: 4.8, location: 4.6, value: 4.8 }
  },
  {
    id: "coffee-2",
    title: "Wildflour Cafe BGC",
    location: "Taguig",
    province: "Metro Manila",
    price: 5000,
    rating: 4.7,
    reviews: 1500,
    images: [
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1463797221720-6b07e6426c24?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1507133750069-419571604855?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "Famous for brunch and pastries. Available for private evening functions.",
    category: "Coffee & Tea",
    guestCount: 30,
    bedroomCount: 0,
    bathroomCount: 2,
    host: { name: "Wildflour Grp", avatar: "https://i.pravatar.cc/150?u=wildflour", isSuperhost: true, joined: "Joined 2013" },
    offers: ["Pastries", "Cocktails", "Function Room", "Wifi", "AC"],
    activities: ["Brunch Meeting", "Private Dinner", "Cocktail Party", "Pastry Tasting"],
    ratingCategories: { cleanliness: 4.7, accuracy: 4.8, checkIn: 4.6, communication: 4.7, location: 5.0, value: 4.5 }
  },

  // --- ARTS & ENTERTAINMENT ---
  {
    id: "art-1",
    title: "Pinto Art Museum",
    location: "Antipolo",
    province: "Rizal",
    price: 600,
    rating: 4.8,
    reviews: 2000,
    images: [
      "https://images.unsplash.com/photo-1518998053901-5348d3969105?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1577046848358-4623c085f0ea?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "Mission-style buildings filled with contemporary art amidst lush gardens. A popular pre-nup shoot location.",
    category: "Arts & Entertainment",
    guestCount: 100,
    bedroomCount: 0,
    bathroomCount: 4,
    host: { name: "Dr. Cuanang", avatar: "https://i.pravatar.cc/150?u=pinto", isSuperhost: true, joined: "Joined 2010" },
    offers: ["Pre-nup Shoot", "Gallery", "Cafe", "Gardens", "Parking"],
    activities: ["Art Appreciation", "Photography", "Garden Walk", "Dining at Cafe Rizal"],
    ratingCategories: { cleanliness: 4.8, accuracy: 4.9, checkIn: 4.8, communication: 4.7, location: 4.7, value: 4.9 }
  },
  {
    id: "art-2",
    title: "National Museum of Natural History",
    location: "Manila",
    province: "Metro Manila",
    price: 0,
    rating: 4.9,
    reviews: 5000,
    images: [
      "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1518998053901-5348d3969105?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1555529733-0e670560f7e1?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1548625361-e88c694b4cb7?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "Iconic 'Tree of Life' architecture. Great for educational tours and appreciation of Philippine biodiversity.",
    category: "Arts & Entertainment",
    guestCount: 500,
    bedroomCount: 0,
    bathroomCount: 10,
    host: { name: "Gov", avatar: "https://i.pravatar.cc/150?u=museum", isSuperhost: true, joined: "Joined 1901" },
    offers: ["Exhibits", "Tours", "Architecture", "AC", "Elevator"],
    activities: ["Museum Tour", "Educational Trip", "Photography", "History Lesson"],
    ratingCategories: { cleanliness: 5.0, accuracy: 5.0, checkIn: 4.9, communication: 4.8, location: 5.0, value: 5.0 }
  },

  // --- FINANCIAL SERVICES ---
  {
    id: "finance-1",
    title: "BDO Corporate Center",
    location: "Makati",
    province: "Metro Manila",
    price: 0,
    rating: 4.2,
    reviews: 50,
    images: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1512918760513-95f1fde64203?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "Main branch for corporate banking needs. Secure and accessible.",
    category: "Financial Services",
    guestCount: 0,
    bedroomCount: 0,
    bathroomCount: 2,
    host: { name: "BDO", avatar: "https://i.pravatar.cc/150?u=bdo", isSuperhost: false, joined: "Joined 1970" },
    offers: ["ATM", "Loans", "Investment", "AC", "Security"],
    activities: ["Banking", "Consultation", "ATM Withdrawal"],
    ratingCategories: { cleanliness: 4.5, accuracy: 4.2, checkIn: 4.0, communication: 4.1, location: 5.0, value: 4.0 }
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
    images: [
      "https://images.unsplash.com/photo-1558448835-132d782df82e?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1522771753035-10a637d5d4a1?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1512918760513-95f1fde64203?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "Government center for civil weddings, permits, and clearances. Iconic pyramid monument.",
    category: "Public Services & Government",
    guestCount: 0,
    bedroomCount: 0,
    bathroomCount: 5,
    host: { name: "LGU", avatar: "https://i.pravatar.cc/150?u=lgu", isSuperhost: false, joined: "Joined 1939" },
    offers: ["Civil Wedding", "Permits", "Park", "Security"],
    activities: ["Civil Wedding", "Business Permit", "NBI Clearance", "Park Stroll"],
    ratingCategories: { cleanliness: 3.5, accuracy: 3.8, checkIn: 3.0, communication: 3.5, location: 4.5, value: 3.5 }
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
    images: [
      "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1512918760513-95f1fde64203?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "Premium condominium showroom demonstrating the Rockwell lifestyle.",
    category: "Real Estate",
    guestCount: 0,
    bedroomCount: 0,
    bathroomCount: 1,
    host: { name: "Rockwell Land", avatar: "https://i.pravatar.cc/150?u=rockwell", isSuperhost: true, joined: "Joined 1995" },
    offers: ["Model Unit", "Inquiries", "Coffee", "Valet"],
    activities: ["View Model Unit", "Investment Inquiry", "Lifestyle Tour"],
    ratingCategories: { cleanliness: 5.0, accuracy: 5.0, checkIn: 5.0, communication: 5.0, location: 5.0, value: 4.5 }
  }
];