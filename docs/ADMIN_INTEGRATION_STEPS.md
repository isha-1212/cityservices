# Admin Panel Integration Guide

## Step-by-Step Setup Instructions

### Step 1: Execute SQL Schema in Supabase

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `cityservices`
3. **Navigate to SQL Editor** (left sidebar)
4. **Create a new query**
5. **Copy and paste the SQL from**: `sql/admin_services_schema.sql`
6. **Click "Run"** to execute

This creates:
- `services` table
- RLS policies
- Admin permissions
- Indexes and triggers

### Step 2: Make Your User an Admin

**Option A: Using Table Editor**
1. Go to **Table Editor** in Supabase
2. Find the `profiles` table
3. Locate your user row (by email)
4. Click to edit the row
5. Set `is_admin` column to `TRUE` (or check the box)
6. Save changes

**Option B: Using SQL Editor**
```sql
-- Replace with your actual email
UPDATE profiles 
SET is_admin = TRUE 
WHERE email = 'your-email@example.com';
```

**Option C: Add admin column if it doesn't exist**
```sql
-- First, check if column exists, if not add it
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Then update your user
UPDATE profiles 
SET is_admin = TRUE 
WHERE email = 'your-email@example.com';
```

### Step 3: Verify Integration

**Check if everything is connected:**

1. **Frontend is running**: `npm run dev`
2. **Environment variables are set** in `.env`:
   ```env
   VITE_SUPABASE_URL=https://iecothmegflxbpvndnru.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```
3. **Login to your application**
4. **You should see "Admin" in the menu** (after logging in as admin)
5. **Click "Admin"** to access the panel

### Step 4: Test Adding a Service

1. Click **"Add Service"** button
2. Fill in the form:
   - **Name**: Test Hotel
   - **Category**: Accommodation
   - **City**: Ahmedabad
   - **Area**: Satellite
   - **Price**: 5000
   - **Rating**: 4.5
   - **Description**: A nice test hotel
   - **Contact**: 9876543210
   - **Email**: test@hotel.com
   - **Amenities**: WiFi, AC, Parking
   - **Image URL**: https://example.com/image.jpg

3. Click **"Add Service"**
4. The service should appear in the table

### Step 5: Verify User Can See the Service

1. **Navigate to "Find Services"** (Search page)
2. The service should appear in the list
3. Users can now:
   - Search for it
   - View details
   - Add to wishlist
   - Include in cost calculator

## Common Issues and Solutions

### Issue 1: "Access Denied" Even Though I'm Admin

**Solution:**
```sql
-- Check your admin status
SELECT id, email, is_admin, role FROM profiles WHERE email = 'your-email@example.com';

-- If is_admin is false or NULL
UPDATE profiles SET is_admin = TRUE WHERE email = 'your-email@example.com';

-- Or set role
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

### Issue 2: Services Table Doesn't Exist

**Solution:**
Run the complete SQL schema from `sql/admin_services_schema.sql` in Supabase SQL Editor.

### Issue 3: Can't See Admin Menu

**Possible causes:**
1. Not logged in → Login first
2. Not marked as admin → Update profiles table
3. Browser cache → Clear cache and reload
4. Frontend not restarted after .env changes → Restart `npm run dev`

### Issue 4: Services Not Appearing in Search

**Solution:**
```sql
-- Check if services exist
SELECT * FROM services;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'services';

-- Ensure SELECT policy allows everyone
CREATE POLICY "Services are viewable by everyone" 
  ON services FOR SELECT 
  USING (true);
```

### Issue 5: "Error loading services from database"

**Check:**
1. Supabase connection is working
2. `.env` file has correct credentials
3. Services table exists
4. RLS policies are configured

**Debug in browser console:**
```javascript
// Check Supabase connection
console.log(import.meta.env.VITE_SUPABASE_URL);
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY);
```

## Verification Checklist

- [ ] SQL schema executed in Supabase
- [ ] Services table exists
- [ ] Profiles table has `is_admin` column
- [ ] Your user is marked as admin
- [ ] Frontend is running with correct .env
- [ ] Logged in to the application
- [ ] Admin menu item is visible
- [ ] Can access Admin Panel
- [ ] Can add a test service
- [ ] Service appears in admin table
- [ ] Service appears in search/listing
- [ ] Users can interact with the service

## Quick Test Commands

**Test in Supabase SQL Editor:**

```sql
-- 1. Check if services table exists
SELECT COUNT(*) FROM services;

-- 2. Check your admin status
SELECT email, is_admin, role FROM profiles WHERE email = 'your-email@example.com';

-- 3. Add a test service manually
INSERT INTO services (id, name, type, city, price, rating) 
VALUES ('test-1', 'Test Service', 'accommodation', 'Ahmedabad', 5000, 4.5);

-- 4. Verify it was added
SELECT * FROM services WHERE id = 'test-1';

-- 5. Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'services';
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                  Admin Panel UI                      │
│  (Only visible to admin users)                       │
│  - Add/Edit/Delete Services                          │
│  - Search & Filter                                   │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│              Supabase Database                       │
│  ┌──────────────────────────────────────────────┐  │
│  │ services table                                │  │
│  │ - id, name, type, city, price, rating, etc.  │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │ profiles table                                │  │
│  │ - id, email, is_admin, role                  │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  RLS Policies:                                      │
│  ✓ Everyone can SELECT (view services)              │
│  ✓ Only admins can INSERT/UPDATE/DELETE             │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│              User Interface                          │
│  - Service Search (shows all services)               │
│  - Service Details                                   │
│  - Wishlist (can bookmark services)                  │
│  - Cost Calculator (includes all services)           │
└─────────────────────────────────────────────────────┘
```

## Data Flow

1. **Admin adds service** → Saved to Supabase `services` table
2. **Real-time subscription** → Frontend receives update
3. **Service appears** in search results automatically
4. **Users can interact** with the service (view, bookmark, calculate)

## Next Steps After Integration

1. **Add sample services** for different categories
2. **Test from user perspective** (non-admin account)
3. **Add service images** (upload to cloud storage, use URLs)
4. **Populate all cities** you want to support
5. **Monitor usage** and adjust as needed

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Supabase logs in dashboard
3. Verify SQL policies are correct
4. Ensure environment variables are loaded
5. Restart frontend after any .env changes

## Current Implementation Status

✅ Admin Panel Component created
✅ Database schema ready
✅ Navigation integration complete
✅ Access control implemented
✅ Real-time updates configured
✅ User interface integration done

**You just need to execute the SQL and mark your user as admin!**
