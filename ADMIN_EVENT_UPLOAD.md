# Admin Event Upload Feature

## Overview
This feature provides a comprehensive UI for creating and managing events (experiences) through the admin dashboard, eliminating the need to use Postman for manual data entry.

## Features

### Event Creation Form
A complete form interface that allows admins to create events with all necessary details:

- **Basic Information**
  - Host ID (UUID of the event host)
  - Category selection (dropdown from available categories)
  - Event title
  - Description
  - Status (draft, active, cancelled, completed)
  - Max attendees
  - Publish toggle

- **Location Details**
  - Street address
  - City, State, Country
  - Latitude & Longitude (optional)

- **Schedule**
  - Start date & time
  - End date & time
  - Duration in minutes

- **Pricing**
  - Base price
  - Currency (USD, EUR, GBP, PHP)
  - Service fee percentage
  - Tax percentage

- **Additional Details**
  - Requirements
  - Cancellation policy
  - Itinerary (JSON format)

- **Event Image**
  - Image URL
  - Alt text for accessibility

## How to Access

1. Navigate to the admin dashboard at `/admin`
2. Click on "Experiences" in the sidebar menu
3. Click "Create New Event" button

## How to Use

### Creating a New Event

1. **Fill in Basic Information**
   - Enter the Host ID (UUID of the user creating the event)
   - Select a category from the dropdown
   - Provide a compelling title and description
   - Choose the event status
   - Set max attendees (optional)
   - Toggle publish status if ready to go live

2. **Add Location Details**
   - Enter the full address
   - Provide city, state, and country
   - Optionally add coordinates for map display

3. **Set Schedule**
   - Select start date and time
   - Select end date and time
   - Optionally specify duration in minutes

4. **Configure Pricing**
   - Set the base price
   - Choose currency
   - Configure service fee and tax percentages

5. **Additional Information**
   - Add any requirements attendees should know
   - Specify your cancellation policy
   - Add itinerary in JSON format (optional)

6. **Add Image**
   - Provide a URL to the event image
   - Add descriptive alt text

7. **Submit**
   - Click "Create Event" button
   - Wait for success confirmation
   - Form will reset automatically

## API Endpoint Used

The form submits to:
```
POST /v1/events/complete
```

This creates a complete event with all related data (details, pricing, images) in a single transaction.

## Theme & Styling

The UI follows the existing FoxPassport admin dashboard theme:
- **Primary Color**: Pink (#ec4899)
- **Background**: Light slate
- **Cards**: White with subtle borders
- **Icons**: Material Symbols Outlined
- **Typography**: Bold headings, semibold labels
- **Inputs**: Rounded corners (rounded-xl), pink focus rings

## Form Validation

- Required fields are marked with a red asterisk (*)
- Client-side validation ensures:
  - All required fields are filled
  - Email format is valid (if applicable)
  - Numbers are within valid ranges
  - Dates are properly formatted
  - End date is after start date

## Error Handling

- Success messages display in green
- Error messages display in red
- Form shows loading state during submission
- Network errors are caught and displayed to the user

## Future Enhancements

Potential improvements for this feature:
- [ ] Event listing with edit/delete capabilities
- [ ] Image upload functionality (instead of URL input)
- [ ] Bulk event import
- [ ] Event duplication feature
- [ ] Draft auto-save
- [ ] Rich text editor for description
- [ ] Multi-image support
- [ ] Event preview before publishing

## Technical Details

### Components
- `EventForm.tsx` - Main form component
- `EventsManagement.tsx` - Management page wrapper
- Updated `app/admin/page.tsx` - Added routing to Events Management

### Dependencies
- React Hook Form (for form management)
- Axios (for API calls)
- Material Symbols (for icons)
- Tailwind CSS (for styling)

### File Structure
```
components/admin/
├── EventForm.tsx          # Event creation form
├── EventsManagement.tsx   # Events management page
└── index.ts              # Updated exports

app/admin/
└── page.tsx              # Updated with Events routing
```

## Troubleshooting

### "Failed to create event" error
- Verify the Host ID is a valid UUID
- Check that the API is running at the configured URL
- Ensure all required fields are filled
- Check browser console for detailed error messages

### Categories not loading
- Verify the categories API endpoint is working
- Check network tab for failed requests
- Ensure API_URL environment variable is set correctly

### Form submission hangs
- Check API server status
- Verify network connectivity
- Look for CORS issues in browser console

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify API server is running
3. Check network requests in browser DevTools
4. Review the backend logs for API errors
