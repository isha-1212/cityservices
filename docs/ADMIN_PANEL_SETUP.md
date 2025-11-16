# Admin Panel Setup Guide

## Overview
The Admin Panel allows authorized administrators to manage services (accommodation, food, transport, tiffin) that are displayed to users throughout the application.

## Database Setup

### 1. Run the Admin Services Schema

Execute the SQL schema to create the necessary tables and policies:

```sql
-- Run this in your Supabase SQL Editor
-- File location: sql/admin_services_schema.sql
```

This will create:
- `services` table with all necessary columns
- Row Level Security (RLS) policies
- Indexes for better query performance
- Triggers for automatic timestamp updates

### 2. Grant Admin Access to Users

To make a user an admin, update their profile in the `profiles` table:

```sql
-- Option 1: Set is_admin flag
UPDATE profiles 
SET is_admin = TRUE 
WHERE email = 'admin@example.com';

-- Option 2: Set role
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

You can run this directly in Supabase SQL Editor or Table Editor.

## Features

### Admin Capabilities

1. **Add Services**
   - Fill out a comprehensive form with service details
   - Set category, location, pricing, and rating
   - Add amenities and images
   - All fields are validated

2. **Edit Services**
   - Click the edit icon on any service
   - Update any field
   - Changes are saved immediately to the database

3. **Delete Services**
   - Remove services with confirmation prompt
   - Permanently deletes from database

4. **Search & Filter**
   - Search by service name or city
   - Filter by category (accommodation, food, transport, tiffin)
   - Real-time results

5. **View Statistics**
   - Total services count
   - Filtered results count
   - Number of categories

### Service Schema

```typescript
{
  id: string;              // Unique identifier
  name: string;            // Service name (required)
  type: string;            // Category: accommodation, food, transport, tiffin (required)
  city: string;            // City location (required)
  area?: string;           // Specific area/locality
  price?: number;          // Monthly price in ₹
  rating?: number;         // Rating (0-5)
  description?: string;    // Detailed description
  address?: string;        // Full address
  contact?: string;        // Phone number
  email?: string;          // Email address
  website?: string;        // Website URL
  amenities?: string[];    // List of amenities/features
  image?: string;          // Image URL
  created_at: timestamp;   // Auto-generated
  updated_at: timestamp;   // Auto-updated on changes
}
```

## Security

### Row Level Security (RLS)

The services table has RLS enabled with the following policies:

- **SELECT**: Everyone can view services (public access)
- **INSERT**: Only admins can add new services
- **UPDATE**: Only admins can edit services
- **DELETE**: Only admins can remove services

Admin status is checked via:
```sql
profiles.is_admin = TRUE OR profiles.role = 'admin'
```

## Accessing the Admin Panel

1. **Login** as an admin user
2. **Navigate** to the Admin panel from the navigation menu
3. **Manage** services using the interface

Non-admin users will see an "Access Denied" message.

## Integration with User Interface

Services added through the Admin Panel are automatically:

1. **Visible in Search** - Appear in the main service search/listing
2. **Available for Booking** - Users can add them to wishlists
3. **Used in Calculator** - Included in cost calculations
4. **Real-time Updates** - Changes reflect immediately without page refresh

## Data Flow

```
Admin adds service → Supabase DB → Real-time subscription → User sees new service
```

The application uses Supabase real-time subscriptions to automatically update the service list when changes are made.

## Troubleshooting

### "Access Denied" Message
- Verify the user's `is_admin` or `role` field in the `profiles` table
- Ensure RLS policies are properly configured

### Services Not Appearing
- Check browser console for errors
- Verify the services table exists and has data
- Ensure RLS policies allow SELECT for everyone

### Can't Add/Edit/Delete
- Confirm admin status in database
- Check RLS policies are properly set
- Verify authentication is working

## Best Practices

1. **Images**: Use publicly accessible URLs (CDN, cloud storage)
2. **Pricing**: Enter monthly prices for consistency
3. **Categories**: Stick to the predefined types for proper filtering
4. **Descriptions**: Provide clear, helpful information for users
5. **Validation**: Double-check all entries before saving

## Future Enhancements

- Bulk import/export functionality
- Image upload directly to Supabase Storage
- Service approval workflow
- Analytics and reporting
- Service popularity tracking
- User feedback integration
