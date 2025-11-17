# Admin Service Isolation - Testing Guide

## Overview
This feature ensures that each admin user can only see and manage the services they have personally added. Services are now associated with the `admin_id` of the user who created them.

## Implementation Summary

### 1. Database Changes
- Added `admin_id` column to the `services` table
- Created index for better performance
- Updated RLS policies for admin isolation
- Set existing services to default admin_id (for backward compatibility)

### 2. Code Changes
- Updated `AdminPanel.tsx` to filter services by current admin's ID
- Modified service creation logic to store `admin_id` of the creator
- Admin dashboard now only shows services created by the logged-in admin

## Testing Steps

### Step 1: Apply Database Changes
1. Open Supabase SQL Editor
2. Run the SQL script from `sql/add_admin_id_to_services.sql`
3. Verify the script completed successfully

### Step 2: Test Admin Isolation

#### Test Scenario A: Admin 1 Creates a Service
1. **Login as Admin User 1**
   - Go to the application
   - Login with admin credentials (e.g., admin@cityservice.com)
   - Navigate to Admin Panel

2. **Add a New Service**
   - Click "Add Service" button
   - Fill in service details (e.g., "Test Service by Admin 1")
   - Save the service
   - Verify the service appears in the admin panel

#### Test Scenario B: Admin 2 Cannot See Admin 1's Service
1. **Login as Admin User 2**
   - Logout from Admin 1 account
   - Login with different admin credentials
   - Navigate to Admin Panel

2. **Verify Isolation**
   - **Expected**: Admin 2 should NOT see "Test Service by Admin 1"
   - **Expected**: Admin 2 should only see services they created (if any)
   - **Expected**: The service count should reflect only Admin 2's services

#### Test Scenario C: Verify Each Admin Sees Their Own Services
1. **Switch back to Admin 1**
   - Logout from Admin 2 account
   - Login as Admin 1 again
   - Navigate to Admin Panel

2. **Verify Service Visibility**
   - **Expected**: Admin 1 should see "Test Service by Admin 1"
   - **Expected**: Admin 1 should see all their own services
   - **Expected**: Total service count should match Admin 1's services only

### Step 3: Test Service Management Operations

#### Test Editing
1. Login as Admin 1
2. Edit "Test Service by Admin 1"
3. Save changes
4. Verify changes are visible to Admin 1

#### Test Deleting
1. Login as Admin 1
2. Delete "Test Service by Admin 1"
3. Verify service is removed from Admin 1's view
4. Login as Admin 2 and confirm service was never visible to them

## Verification Queries

Run these queries in Supabase SQL Editor to verify the setup:

```sql
-- Check services table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'services' AND table_schema = 'public';

-- Check if admin_id column exists and has data
SELECT 
    COUNT(*) as total_services,
    COUNT(CASE WHEN admin_id IS NOT NULL THEN 1 END) as services_with_admin_id,
    COUNT(DISTINCT admin_id) as unique_admin_count
FROM services;

-- View services with admin information
SELECT 
    s.id,
    s.name,
    s.admin_id,
    p.email as admin_email,
    s.created_at
FROM services s
LEFT JOIN profiles p ON s.admin_id = p.id
ORDER BY s.created_at DESC;
```

## Expected Behavior

### ✅ Correct Behavior
- Each admin sees ONLY services they created
- Service counts are individual per admin
- Admin 1 cannot see Admin 2's services
- Admin 2 cannot see Admin 1's services
- Editing/deleting only affects the admin's own services

### ❌ Incorrect Behavior (Issues to Report)
- Admins can see other admins' services
- Service counts include all services regardless of creator
- Cross-admin service visibility
- Admin can edit/delete another admin's services

## Troubleshooting

### If Admin Isolation is Not Working

1. **Check Database Schema**
   ```sql
   -- Verify admin_id column exists
   \d services
   ```

2. **Check RLS Policies**
   ```sql
   -- View existing RLS policies
   SELECT policyname, permissive, roles, cmd, qual 
   FROM pg_policies 
   WHERE tablename = 'services';
   ```

3. **Check Service Data**
   ```sql
   -- Check if services have admin_id values
   SELECT id, name, admin_id FROM services LIMIT 10;
   ```

4. **Check User Profile**
   ```sql
   -- Verify current user is admin
   SELECT id, email, is_admin, role FROM profiles WHERE id = 'YOUR_USER_ID';
   ```

### Common Issues and Solutions

1. **Services Still Visible to All Admins**
   - Cause: Database changes not applied
   - Solution: Run the SQL migration script

2. **New Services Don't Have admin_id**
   - Cause: Frontend code not updated
   - Solution: Ensure AdminPanel.tsx includes admin_id in serviceData

3. **Admin Can't See Any Services**
   - Cause: Services don't have admin_id or admin_id doesn't match
   - Solution: Update existing services with correct admin_id

## Production Deployment

1. **Deploy Database Changes**
   - Run migration script in production Supabase
   - Verify all existing services have admin_id

2. **Deploy Code Changes**
   - Push updated AdminPanel.tsx to production
   - Deploy to Vercel

3. **Test in Production**
   - Repeat testing scenarios with production data
   - Verify admin isolation works with real admin accounts

## Security Notes

- RLS policies ensure database-level isolation
- Admin_id is stored as TEXT to match user.id format
- Index on admin_id improves query performance
- Existing services are migrated to maintain data integrity
