# Host Event Creation Guide

## Overview
This guide explains how hosts can create events (venues/experiences) through the FoxPassport platform using the intuitive step-by-step wizard interface.

## Features

### 5-Step Event Creation Wizard

The event creation process is divided into 5 easy-to-follow steps with real-time validation and progress tracking.

#### Step 1: Basic Information
- **Event Title** - Give your event a catchy, descriptive name
- **Category** - Select from available categories (Food & Dining, Adventure, Cultural, etc.)
- **Description** - Detailed description of what makes your event special
- **Max Attendees** - Set capacity limits (optional)
- **Event Status** - Choose between Draft (save for later) or Active (ready to publish)

#### Step 2: Location Details
- **Location Type** - Choose between In-Person or Virtual events
- **Street Address** - Full street address (for in-person events)
- **City** - City name
- **State/Province** - State or province
- **Country** - Default is Philippines, can be changed
- **GPS Coordinates** - Optional latitude and longitude for precise map placement

#### Step 3: Schedule
- **Start Date & Time** - When your event begins
- **End Date & Time** - When your event ends
- **Duration** - Optional duration in minutes

#### Step 4: Pricing
- **Base Price** - Price per ticket/attendee
- **Currency** - Choose from PHP, USD, EUR, or GBP
- **Service Fee** - Percentage service fee (default 10%)
- **Tax** - Tax percentage (default 0%)
- **Price Preview** - See the calculated total price per ticket in real-time

#### Step 5: Final Details
- **Event Image URL** - Link to your main event image
- **Image Alt Text** - Description for accessibility
- **Requirements** - What attendees should bring or prepare
- **Cancellation Policy** - Your refund and cancellation terms
- **Publish Toggle** - Choose to publish immediately or save as draft

## How to Access

### For Hosts:
1. Log in to your FoxPassport account
2. Ensure your account has host privileges
3. Navigate to the Foxer Dashboard at `/foxer`
4. Click the "Create Event" button (usually in the navbar or sidebar)

The event creation wizard will open as a modal overlay.

## How to Use the Wizard

### Navigation
- **Next Button** - Move to the next step (enabled only when required fields are filled)
- **Back Button** - Return to previous step
- **Step Indicators** - Click on completed steps to jump directly to them
- **Close Button** - Cancel and close the wizard (your data will be lost)

### Required Fields
Fields marked with an asterisk (*) are required:
- Step 1: Title, Category, Description
- Step 2: Address, City, State (for in-person events)
- Step 3: Start Date/Time, End Date/Time
- Step 4: Base Price

### Tips for Success

**Writing Great Descriptions**
- Focus on what makes your event unique
- Mention key highlights and benefits
- Keep it engaging and informative
- Aim for 100-300 words

**Choosing the Right Category**
- Select the most relevant category
- This helps attendees discover your event
- Categories are managed by admins

**Setting Competitive Prices**
- Research similar events in your area
- Factor in your costs and time
- Consider offering early bird discounts (future feature)

**High-Quality Images**
- Use clear, high-resolution images
- Show the venue, activity, or experience
- Ensure images are properly hosted (Imgur, Cloudinary, etc.)

**Clear Cancellation Policies**
- Be specific about refund timeframes
- State any non-refundable fees
- Mention weather or emergency policies

## Data Flow

### What Happens When You Submit

1. **Validation** - All required fields are checked
2. **Authentication** - Your user ID is automatically added as the host
3. **API Request** - Data is sent to `POST /v1/events/complete`
4. **Event Creation** - Backend creates:
   - Main event record
   - Event details (location, schedule)
   - Pricing information
   - Event images
5. **Success** - You receive a confirmation toast
6. **Redirect** - Modal closes and form resets

### API Endpoint
```
POST /v1/events/complete
```

The wizard automatically constructs the complete event payload from your form data:

```json
{
  "hostId": "user-uuid-from-auth",
  "categoryId": "selected-category-id",
  "title": "Your Event Title",
  "description": "Your description",
  "status": "draft" | "active",
  "maxAttendees": 50,
  "isPublished": true,
  "details": {
    "locationAddress": "123 Main St",
    "city": "Manila",
    "state": "Metro Manila",
    "country": "Philippines",
    "startDatetime": "2026-01-15T18:00:00Z",
    "endDatetime": "2026-01-15T22:00:00Z",
    "requirements": "Bring comfortable shoes",
    "cancellationPolicy": "Full refund 24h before event"
  },
  "pricing": {
    "basePrice": 500,
    "currency": "PHP",
    "serviceFeePercent": 10,
    "taxPercent": 0
  },
  "images": [{
    "imageUrl": "https://example.com/image.jpg",
    "altText": "Event venue",
    "isPrimary": true
  }]
}
```

## Event Visibility & Discovery

### After Creating an Event

Your event will appear in:
1. **Category Listings** - Browse by category at `/categories?type=CategoryName`
2. **Search Results** - Searchable by title, description, location
3. **Host Dashboard** - Manage your events (future feature)

### Viewing Your Event

Once created, users can:
- Click on your event card from category pages
- Be redirected to `/venues/{event-id}`
- See full event details, images, pricing, schedule
- Book tickets (future feature)
- Leave reviews after attending (future feature)

## Venue Detail Page

When users click on your event, they see:

### Event Information
- Full image gallery
- Complete description
- Host profile and credentials
- Location with map
- Pricing breakdown
- Schedule and availability
- Cancellation policy
- Requirements

### Interactive Features
- Photo gallery lightbox
- Date picker for booking
- Share buttons
- Favorite/save buttons
- Review section
- Host contact button

### Booking Flow (Future)
- Date selection
- Guest count
- Price calculation
- Payment processing
- Confirmation and tickets

## Theme & Design

The wizard uses the FoxPassport design system:
- **Primary Color**: Pink (#ec4899)
- **Accent Colors**: Gradient backgrounds
- **Dark Mode**: Full support
- **Typography**: Bold headings, medium body text
- **Icons**: Lucide React icons
- **Animations**: Smooth transitions between steps

## Troubleshooting

### "Failed to create event"
- **Check Authentication**: Ensure you're logged in
- **Verify Host ID**: Your user account must exist
- **API Connection**: Backend server must be running
- **Required Fields**: All mandatory fields must be filled
- **Date Validation**: End date must be after start date

### Categories Not Loading
- Backend API must be running
- Categories must exist in database
- Check `/v1/categories` endpoint
- Look for network errors in browser console

### Images Not Displaying
- Use direct image URLs (not HTML pages)
- Ensure HTTPS URLs
- Check CORS settings on image host
- Verify image URLs are accessible

### Form Data Lost
- The wizard does not auto-save
- If you close the modal, data is lost
- Complete all steps before closing
- Future update: Draft auto-save

## Best Practices

### Event Planning
- Create events at least 1 week in advance
- Update event details as plans solidify
- Use Draft status while planning
- Switch to Active when ready for bookings

### Content Quality
- Proofread your descriptions
- Use proper capitalization
- Include all important details
- Be honest and transparent

### Pricing Strategy
- Price competitively
- Account for all costs
- Factor in service fees
- Consider your target audience

### Host Profile
- Complete your host profile
- Add a professional photo
- Include your bio and experience
- Respond to messages promptly

## Future Enhancements

Planned features:
- [ ] Auto-save drafts
- [ ] Image upload (vs URL input)
- [ ] Multiple image support
- [ ] Event templates
- [ ] Duplicate existing events
- [ ] Recurring events
- [ ] Co-host management
- [ ] Analytics dashboard
- [ ] Attendee messaging
- [ ] Custom pricing tiers
- [ ] Discount codes
- [ ] Waitlist management

## Technical Details

### Components
- `CreateEventWizard.tsx` - Main wizard component with 5-step flow
- `EventCard.tsx` - Event display card with link to detail page
- `app/venues/[id]/page.tsx` - Event detail page
- `hooks/useCreateEventModal.ts` - Modal state management

### Dependencies
- Next.js 15 (App Router)
- React 19
- Lucide React (icons)
- Sonner (toast notifications)
- Tailwind CSS (styling)

### State Management
- Local component state for form data
- Zustand for modal visibility
- React Context for auth state

### API Integration
- Axios for HTTP requests
- Automatic auth header injection
- Error handling and user feedback
- Success/error toast notifications

## Support

### Getting Help
- Check the troubleshooting section above
- Review browser console for errors
- Contact support team
- Report bugs on GitHub

### For Developers
- Backend API: `C:\Users\CLYDE\Documents\GitHub\fox-passport-republic-api`
- Frontend Code: `components/foxer/CreateEventWizard.tsx`
- API Docs: Review `/v1/events/complete` endpoint
- Database: Prisma schema at `prisma/schema.prisma`
