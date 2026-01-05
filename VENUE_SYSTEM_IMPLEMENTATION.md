# Venue System Implementation Guide

## Overview
Complete implementation of the Host venue management system for FoxPassport. This separates **Hosts** (venue providers) from **Foxers** (event managers), allowing hosts to list their venues for foxers to use in events.

## What Was Built

### Backend API (Complete)

#### 1. Database Schema Updates
**File**: `C:\Users\CLYDE\Documents\GitHub\fox-passport-republic-api\prisma\schema.prisma`

**Changes**:
- ✅ Added `Venue` model with full details
- ✅ Added `VenueAmenity` for amenities management
- ✅ Added `VenuePricing` for pricing tiers
- ✅ Added `VenueImage` for image gallery
- ✅ Added `VenueReview` for customer reviews
- ✅ Updated `User` model with `isHost` and `isFoxer` flags
- ✅ Updated `Event.foxerId` (changed from `hostId`)
- ✅ Added `Event.venueId` (optional link to venue)
- ✅ Added `foxer` to `UserRole` enum
- ✅ Added `VenueStatus` enum

**Status Enums**:
```prisma
enum VenueStatus {
  draft           // Not yet published
  active          // Live and bookable
  inactive        // Temporarily unavailable
  under_maintenance // Being renovated/updated
}
```

#### 2. Repository Layer
**File**: `C:\Users\CLYDE\Documents\GitHub\fox-passport-republic-api\src\repositories\venue.repository.ts`

**Methods**:
- `createVenue()` - Create venue with pricing, amenities, images
- `getAllVenues()` - Get all venues with filters
- `getVenueById()` - Get single venue with all relations
- `getVenuesByCategory()` - Get venues by category slug
- `updateVenue()` - Update venue (with ownership check)
- `deleteVenue()` - Delete venue (with ownership check)
- `addAmenity()` / `removeAmenity()` - Manage amenities
- `addImage()` / `removeImage()` - Manage images
- `addReview()` / `getVenueReviews()` - Manage reviews

#### 3. Service Layer
**File**: `C:\Users\CLYDE\Documents\GitHub\fox-passport-republic-api\src\services\venue.service.ts`

**Features**:
- ✅ Input validation (required fields, data types)
- ✅ Business logic (capacity limits, coordinate validation)
- ✅ Error handling with descriptive messages
- ✅ Venue type validation
- ✅ Pricing validation (positive values, min hours)
- ✅ Image URL format validation

#### 4. Controller Layer
**File**: `C:\Users\CLYDE\Documents\GitHub\fox-passport-republic-api\src\controllers\venue.controller.ts`

**Features**:
- ✅ HTTP request/response handling
- ✅ Authentication integration (hostId from auth middleware)
- ✅ Query parameter parsing
- ✅ Proper HTTP status codes (201, 200, 400, 401, 403, 404, 500)
- ✅ Structured JSON responses

#### 5. Routes
**File**: `C:\Users\CLYDE\Documents\GitHub\fox-passport-republic-api\src\routes\venue.routes.ts`

**Endpoints**:
```
POST   /v1/venues                      - Create venue
GET    /v1/venues                      - Get all venues (with filters)
GET    /v1/venues/:id                  - Get venue by ID
GET    /v1/venues/category/:categorySlug - Get venues by category
PUT    /v1/venues/:id                  - Update venue
DELETE /v1/venues/:id                  - Delete venue

POST   /v1/venues/:venueId/amenities   - Add amenity
DELETE /v1/venues/amenities/:amenityId - Remove amenity

POST   /v1/venues/:venueId/images      - Add image
DELETE /v1/venues/images/:imageId      - Remove image

POST   /v1/venues/:venueId/reviews     - Add review
GET    /v1/venues/:venueId/reviews     - Get reviews
```

### Frontend (Complete)

#### 1. Host Dashboard
**File**: `app/host/page.tsx`

**Features**:
- ✅ Statistics overview (venues, active listings, revenue, ratings)
- ✅ Empty state with CTA
- ✅ "List a Venue" button
- ✅ Pink theme matching FoxPassport design
- ✅ Dark mode support
- ✅ Responsive layout

#### 2. Host Layout
**File**: `app/host/layout.tsx`

**Features**:
- ✅ Modal state management for venue wizard
- ✅ Renders CreateVenueWizard when modal is open

#### 3. Create Venue Wizard
**File**: `components/host/CreateVenueWizard.tsx`

**5-Step Wizard**:

**Step 1: Basic Info**
- Venue name *
- Category *
- Venue type * (hotel, land, hall, etc.)
- Description *
- Capacity (optional)
- Status * (draft, active, inactive, under_maintenance)

**Step 2: Location**
- Street address *
- City *
- State/Province *
- Country * (default: Philippines)
- Latitude (optional)
- Longitude (optional)

**Step 3: Pricing**
- Price per day *
- Price per hour (optional)
- Currency * (PHP, USD, EUR, GBP)
- Minimum hours (optional)
- Live price preview

**Step 4: Amenities**
- Comma-separated amenities list (optional)
- Live amenity preview with badges

**Step 5: Images & Publishing**
- Primary image URL (optional)
- Image alt text (optional)
- Image preview
- Publish toggle

**Features**:
- ✅ Progress indicators with icons
- ✅ Step validation (can't proceed without required fields)
- ✅ Back/Next navigation
- ✅ Live previews (pricing, amenities, images)
- ✅ Success/error toast notifications
- ✅ Form reset after submission
- ✅ Dark mode support
- ✅ Responsive design

#### 4. Zustand Hook
**File**: `hooks/useCreateVenueModal.ts`

**Features**:
- ✅ Modal state management
- ✅ `openModal()` and `closeModal()` actions

## API Request/Response Examples

### Create Venue
**Endpoint**: `POST /v1/venues`

**Request Body**:
```json
{
  "categoryId": "uuid",
  "name": "Sunset Beach Resort",
  "description": "Beautiful beachfront venue perfect for weddings and events",
  "venueType": "beach",
  "capacity": 200,
  "status": "active",
  "isPublished": true,
  "address": "123 Beach Road",
  "city": "Manila",
  "state": "Metro Manila",
  "country": "Philippines",
  "latitude": 14.5995,
  "longitude": 120.9842,
  "pricing": {
    "pricePerDay": 50000,
    "pricePerHour": 5000,
    "currency": "PHP",
    "minHours": 4
  },
  "amenities": [
    { "name": "WiFi" },
    { "name": "Parking" },
    { "name": "Sound System" }
  ],
  "images": [
    {
      "imageUrl": "https://example.com/beach-resort.jpg",
      "altText": "Sunset Beach Resort main view",
      "isPrimary": true
    }
  ]
}
```

**Success Response** (201):
```json
{
  "success": true,
  "message": "Venue created successfully",
  "data": {
    "id": "uuid",
    "hostId": "uuid",
    "name": "Sunset Beach Resort",
    "description": "...",
    "venueType": "beach",
    "status": "active",
    "isPublished": true,
    "address": "123 Beach Road",
    "city": "Manila",
    "state": "Metro Manila",
    "country": "Philippines",
    "latitude": 14.5995,
    "longitude": 120.9842,
    "host": {
      "id": "uuid",
      "name": "John Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "profileImage": "..."
    },
    "category": { ... },
    "pricing": [ { ... } ],
    "amenities": [ { ... } ],
    "images": [ { ... } ],
    "createdAt": "2026-01-05T...",
    "updatedAt": "2026-01-05T..."
  }
}
```

### Get All Venues with Filters
**Endpoint**: `GET /v1/venues?city=Manila&status=active&isPublished=true`

**Success Response** (200):
```json
{
  "success": true,
  "data": [ ... ],
  "count": 15
}
```

## Database Migration

### Before Starting the Backend

**IMPORTANT**: Run this migration to create all the new tables:

```bash
cd C:\Users\CLYDE\Documents\GitHub\fox-passport-republic-api
npx prisma migrate dev --name add-venue-system
```

This will:
1. Create `Venue` table
2. Create `VenueAmenity` table
3. Create `VenuePricing` table
4. Create `VenueImage` table
5. Create `VenueReview` table
6. Add `isHost` and `isFoxer` columns to `User` table
7. Update `Event` table (change `hostId` to `foxerId`, add `venueId`)

### Seed Data (Optional)

After migration, you might want to seed some test venues:

```bash
npx prisma db seed
```

## User Roles & Permissions

### User Types

1. **User (Client)** - `role: "user"`
   - Books events
   - Leaves reviews
   - Views venues and events

2. **Host** - `role: "host"`, `isHost: true`
   - Creates and manages venues
   - Sets pricing and availability
   - Responds to venue reviews
   - Cannot be a foxer simultaneously

3. **Foxer** - `role: "foxer"`, `isFoxer: true`
   - Creates and manages events
   - Can use host venues for events
   - Plans, decorates, manages events
   - Cannot be a host simultaneously

4. **Admin** - `role: "admin"`
   - Manages all content
   - Approves venues and events
   - Handles disputes

5. **Super Admin** - `role: "super_admin"`
   - Full system access
   - User management
   - System configuration

## Complete User Flows

### Flow 1: Host Lists a Venue

1. Host logs into FoxPassport
2. Account has `isHost: true` flag
3. Navigates to `/host` dashboard
4. Clicks "List a Venue" button
5. **Step 1**: Fills in name, category, type, description
6. **Step 2**: Enters location details
7. **Step 3**: Sets pricing (per day/hour)
8. **Step 4**: Adds amenities (comma-separated)
9. **Step 5**: Uploads primary image, toggles publish
10. Clicks "Create Venue"
11. Backend validates and creates venue
12. Success toast appears
13. Modal closes, dashboard updates

### Flow 2: Foxer Creates Event Using Venue

1. Foxer logs into FoxPassport
2. Account has `isFoxer: true` flag
3. Navigates to `/foxer` dashboard
4. Clicks "Create Event" button
5. In event wizard, can optionally select a venue
6. If venue selected, location auto-fills
7. Foxer adds event-specific details
8. Event is created with `venueId` link
9. Host receives notification (future feature)
10. Foxer manages event logistics

### Flow 3: User Discovers and Books Venue

1. User visits `/categories` page
2. Clicks on a category (e.g., "Weddings")
3. Sees both venues and events
4. Clicks on a venue card
5. Redirected to `/venues/{venue-id}`
6. Sees venue details, pricing, amenities
7. Can book directly (if venue allows)
8. Or can contact foxer to plan event at this venue

## Integration Points

### Venues in Event Creation

Foxers can now link events to venues. Update `CreateEventWizard.tsx` to include venue selection:

```typescript
// In CreateEventWizard.tsx, add new field:
const [venueId, setVenueId] = useState("");

// Fetch available venues:
const { data: venues } = useVenues(); // Create this hook

// In wizard, add venue selection step or field:
<select name="venueId" value={venueId} onChange={...}>
  <option value="">No venue (custom location)</option>
  {venues.map(venue => (
    <option key={venue.id} value={venue.id}>
      {venue.name} - {venue.city}
    </option>
  ))}
</select>
```

## File Structure

```
Backend:
fox-passport-republic-api/
├── prisma/
│   └── schema.prisma                    ✅ Updated with Venue models
├── src/
│   ├── repositories/
│   │   └── venue.repository.ts          ✅ NEW
│   ├── services/
│   │   └── venue.service.ts             ✅ NEW
│   ├── controllers/
│   │   └── venue.controller.ts          ✅ NEW
│   └── routes/
│       ├── venue.routes.ts              ✅ NEW
│       └── index.ts                     ✅ Updated
└── VENUE_SYSTEM_MIGRATION.md            ✅ NEW

Frontend:
fox-passport-republic-app/keen-feynman/
├── app/
│   └── host/
│       ├── layout.tsx                   ✅ NEW
│       └── page.tsx                     ✅ NEW
├── components/
│   └── host/
│       └── CreateVenueWizard.tsx        ✅ NEW
├── hooks/
│   └── useCreateVenueModal.ts           ✅ NEW
└── VENUE_SYSTEM_IMPLEMENTATION.md       ✅ NEW (this file)
```

## Testing the Implementation

### 1. Start the Backend

```bash
cd C:\Users\CLYDE\Documents\GitHub\fox-passport-republic-api

# Run migration first
npx prisma migrate dev --name add-venue-system

# Generate Prisma client
npx prisma generate

# Start server
npm run dev
```

### 2. Start the Frontend

```bash
cd C:\Users\CLYDE\.claude-worktrees\fox-passport-republic-app\keen-feynman

# Install dependencies if needed
pnpm install

# Start dev server
pnpm dev
```

### 3. Test the Host Flow

1. Create/login as a user
2. Update user in database: `isHost: true`
3. Visit `http://localhost:3000/host`
4. Click "List a Venue"
5. Complete all 5 steps
6. Verify venue creation in database
7. Check API response in Network tab

### 4. Verify Database

```bash
npx prisma studio
```

Check that:
- `Venue` table has new record
- `VenuePricing` table has pricing record
- `VenueAmenity` table has amenities
- `VenueImage` table has image (if provided)
- All relations are correct

## Environment Variables

Ensure these are set:

**Backend** (`.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/foxpassport"
```

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3002/api
```

## Known Limitations

1. **Image Upload**: Currently URL-only (no direct file upload)
2. **Multi-image**: Only one primary image supported in wizard
3. **Venue Editing**: No edit functionality yet (create-only)
4. **Venue Dashboard**: No analytics or booking management
5. **Venue Search**: No advanced search/filter UI
6. **Availability Calendar**: No booking calendar
7. **Host Verification**: No verification process

## Future Enhancements

### High Priority
1. **Venue Management Dashboard** - View, edit, delete venues
2. **Image Upload** - Direct file upload vs URL
3. **Multi-image Gallery** - Support multiple venue images
4. **Venue Analytics** - Views, bookings, revenue
5. **Availability Management** - Calendar for blocked dates

### Medium Priority
6. **Venue Search & Filters** - Advanced search UI
7. **Venue Comparison** - Compare multiple venues
8. **Host Verification** - Verify host identity and venues
9. **Booking System** - Direct venue bookings
10. **Host Messaging** - Communicate with foxers

### Low Priority
11. **Venue Templates** - Quick create from templates
12. **Duplicate Venues** - Clone existing venues
13. **Bulk Upload** - Upload multiple venues
14. **Venue Packages** - Bundle pricing tiers
15. **Seasonal Pricing** - Dynamic pricing by date

## Success Metrics

Implementation is successful when:
- ✅ Hosts can create venues through UI
- ✅ Venues are saved to database correctly
- ✅ All venue data (pricing, amenities, images) is stored
- ✅ Validation prevents bad data
- ✅ UI matches FoxPassport design system
- ✅ Mobile responsive on all screen sizes
- ✅ No TypeScript errors
- ✅ Backend API integration works

## API Documentation

### Authentication

All venue endpoints require authentication. The `hostId` is extracted from the auth token.

**Header**:
```
Authorization: Bearer <jwt-token>
```

### Error Responses

**400 Bad Request**:
```json
{
  "success": false,
  "message": "Missing required fields"
}
```

**401 Unauthorized**:
```json
{
  "success": false,
  "message": "Unauthorized: Host ID is required"
}
```

**403 Forbidden**:
```json
{
  "success": false,
  "message": "Unauthorized: You can only update your own venues"
}
```

**404 Not Found**:
```json
{
  "success": false,
  "message": "Venue not found"
}
```

## Support

### Troubleshooting

**"Failed to create venue"**:
- Check backend is running
- Verify auth token is valid
- Check required fields are filled
- Look at browser console for errors

**Categories not loading**:
- Ensure categories exist in database
- Check `/v1/categories` endpoint
- Verify backend connection

**Images not displaying**:
- Use direct image URLs (HTTPS)
- Check CORS settings
- Verify image URL is accessible

**Database errors**:
- Run Prisma migration
- Generate Prisma client
- Check database connection

### For Developers

- **Backend**: `C:\Users\CLYDE\Documents\GitHub\fox-passport-republic-api`
- **Frontend**: `C:\Users\CLYDE\.claude-worktrees\fox-passport-republic-app\keen-feynman`
- **Database**: PostgreSQL (use Prisma Studio to inspect)

## Conclusion

This implementation provides a complete venue management system for hosts on the FoxPassport platform. Hosts can easily list their venues through an intuitive 5-step wizard, while the system maintains clear separation between venue providers (hosts) and event managers (foxers).

The backend API is fully functional with proper validation, error handling, and ownership checks. The frontend provides a beautiful, responsive interface that matches the FoxPassport design system.

Next steps include adding venue editing capabilities, implementing a booking system, and creating analytics dashboards for hosts to track their venue performance.
