# Category Integration Guide

This document explains how categories are now integrated between frontend and backend.

## What Changed

### Frontend Changes
1. **New Service Layer**: `services/category.service.ts` - Handles all API calls for categories
2. **New Hooks**: `hooks/useCategories.ts` - React hooks for fetching category data
3. **Icon Mapping**: `lib/categoryIcons.ts` - Maps category slugs to Lucide icons
4. **Updated Components**:
   - `components/landing/CategoryGrid.tsx` - Now fetches from API
   - `app/categories/page.tsx` - Now fetches from API

### How It Works
1. Frontend fetches categories from `http://localhost:3002/api/categories`
2. Categories are displayed with icons based on their `slug` field
3. Loading states and error handling are built in
4. Categories show event counts from the backend

## Adding Categories to Backend

### Option 1: Using API Endpoints (Recommended)

You can use tools like Postman, Thunder Client, or curl to add categories via the API:

```bash
# Create a category
curl -X POST http://localhost:3002/api/categories/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Food & Dining",
    "slug": "food-dining",
    "description": "Restaurants, cafes, and dining experiences"
  }'
```

### Option 2: Sample Categories Data

Here are the default categories that match your current frontend design. You can add these to your backend:

```json
[
  {
    "name": "Food & Dining",
    "slug": "food-dining",
    "description": "Restaurants, cafes, and culinary experiences"
  },
  {
    "name": "Adventures",
    "slug": "adventures",
    "description": "Outdoor activities, hiking, and adventure sports"
  },
  {
    "name": "Camping",
    "slug": "camping",
    "description": "Camping sites, glamping, and outdoor stays"
  },
  {
    "name": "Music & Arts",
    "slug": "music-arts",
    "description": "Concerts, galleries, and cultural events"
  },
  {
    "name": "Venues",
    "slug": "venues",
    "description": "Event spaces, halls, and meeting venues"
  },
  {
    "name": "Nightlife",
    "slug": "nightlife",
    "description": "Bars, clubs, and nighttime entertainment"
  },
  {
    "name": "Wellness",
    "slug": "wellness",
    "description": "Spas, fitness centers, and wellness retreats"
  },
  {
    "name": "Hotels & Travel",
    "slug": "hotels",
    "description": "Accommodations and travel experiences"
  }
]
```

### Option 3: Create a Seed Script

In your backend (`fox-passport-republic-api`), create a file `prisma/seed-categories.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  {
    name: "Food & Dining",
    slug: "food-dining",
    description: "Restaurants, cafes, and culinary experiences"
  },
  {
    name: "Adventures",
    slug: "adventures",
    description: "Outdoor activities, hiking, and adventure sports"
  },
  {
    name: "Camping",
    slug: "camping",
    description: "Camping sites, glamping, and outdoor stays"
  },
  {
    name: "Music & Arts",
    slug: "music-arts",
    description: "Concerts, galleries, and cultural events"
  },
  {
    name: "Venues",
    slug: "venues",
    description: "Event spaces, halls, and meeting venues"
  },
  {
    name: "Nightlife",
    slug: "nightlife",
    description: "Bars, clubs, and nighttime entertainment"
  },
  {
    name: "Wellness",
    slug: "wellness",
    description: "Spas, fitness centers, and wellness retreats"
  },
  {
    name: "Hotels & Travel",
    slug: "hotels",
    description: "Accommodations and travel experiences"
  }
];

async function seedCategories() {
  console.log('Starting category seed...');

  for (const category of categories) {
    const result = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
    console.log(`✓ Created/verified category: ${result.name}`);
  }

  console.log('Category seed completed!');
}

seedCategories()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Then run:
```bash
cd ../fox-passport-republic-api
npx ts-node prisma/seed-categories.ts
```

## Testing the Integration

1. **Start Backend**:
   ```bash
   cd ../fox-passport-republic-api
   npm run dev
   # Backend should run on http://localhost:3002
   ```

2. **Start Frontend**:
   ```bash
   npm run dev
   # Frontend should run on http://localhost:3000
   ```

3. **Check the Integration**:
   - Visit http://localhost:3000
   - You should see categories loaded from the backend
   - Check browser console for any API errors
   - Categories should display with icons

## Icon Mapping

Icons are automatically mapped based on category slugs. Supported slugs:

- `food`, `food-dining`, `dining`, `restaurant`, `cafe` → Utensils icon
- `adventure`, `adventures`, `hiking` → Mountain icon
- `camping`, `camp`, `glamping` → Tent icon
- `music`, `music-arts`, `arts` → Music icon
- `venue`, `venues`, `event`, `events` → Building icon
- `nightlife`, `bar`, `club` → Party Popper icon
- `wellness`, `spa`, `health` → Sparkles icon
- `hotel`, `hotels`, `travel`, `resort` → Hotel/Plane icon

Any slug not found defaults to the "More" icon (MoreHorizontal).

## API Endpoints Available

Your backend already has these endpoints:

- `GET /api/categories` - Get all categories
- `GET /api/categories/top-level` - Get top-level categories (no parent)
- `GET /api/categories/:id` - Get category by ID
- `GET /api/categories/slug/:slug` - Get category by slug
- `POST /api/categories/create` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

## Troubleshooting

### Categories not loading?
1. Check if backend is running on http://localhost:3002
2. Check browser console for CORS errors
3. Verify `NEXT_PUBLIC_API_URL` in frontend `.env` file
4. Check if categories exist in database

### Icons not showing correctly?
1. Check category `slug` field in database
2. Add mapping in `lib/categoryIcons.ts` if needed
3. Slugs should be lowercase and kebab-case

### CORS errors?
Your backend is already configured for CORS with origin `http://localhost:3000`, so this should work out of the box.
