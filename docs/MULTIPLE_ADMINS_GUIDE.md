# Multiple Admins Setup Guide

## 🔐 How to Set Up Multiple Admins

### Step 1: Run SQL Setup (Support Multiple Admins)

```sql
-- Execute this in Supabase SQL Editor

-- 1. Create services table
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  city TEXT NOT NULL,
  area TEXT,
  price NUMERIC DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  description TEXT,
  address TEXT,
  contact TEXT,
  email TEXT,
  website TEXT,
  amenities TEXT[],
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add admin columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_services_type ON services(type);
CREATE INDEX IF NOT EXISTS idx_services_city ON services(city);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = TRUE;

-- 4. Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- 5. Create policies
DROP POLICY IF EXISTS "Services are viewable by everyone" ON services;
CREATE POLICY "Services are viewable by everyone" 
  ON services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can insert services" ON services;
CREATE POLICY "Only admins can insert services" 
  ON services FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.is_admin = true OR profiles.role = 'admin')
    )
  );

DROP POLICY IF EXISTS "Only admins can update services" ON services;
CREATE POLICY "Only admins can update services" 
  ON services FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.is_admin = true OR profiles.role = 'admin')
    )
  );

DROP POLICY IF EXISTS "Only admins can delete services" ON services;
CREATE POLICY "Only admins can delete services" 
  ON services FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.is_admin = true OR profiles.role = 'admin')
    )
  );

-- 6. Grant permissions
GRANT SELECT ON services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON services TO authenticated;
```

### Step 2: Add Multiple Admins

```sql
-- Method 1: Add multiple admins at once (RECOMMENDED)
UPDATE profiles 
SET is_admin = TRUE 
WHERE email IN (
  'admin1@yourcompany.com',
  'admin2@yourcompany.com', 
  'manager@yourcompany.com',
  'support@yourcompany.com'
);

-- Method 2: Add admins one by one
UPDATE profiles SET is_admin = TRUE WHERE email = 'user1@example.com';
UPDATE profiles SET is_admin = TRUE WHERE email = 'user2@example.com';
UPDATE profiles SET is_admin = TRUE WHERE email = 'user3@example.com';

-- Method 3: Use role instead of is_admin flag
UPDATE profiles 
SET role = 'admin' 
WHERE email IN (
  'admin1@yourcompany.com',
  'admin2@yourcompany.com'
);
```

### Step 3: Verify Multiple Admins

```sql
-- Check all current admins
SELECT id, email, name, is_admin, role, created_at 
FROM profiles 
WHERE is_admin = true OR role = 'admin'
ORDER BY created_at;

-- Count total admins
SELECT COUNT(*) as total_admins 
FROM profiles 
WHERE is_admin = true OR role = 'admin';

-- Check specific user's admin status
SELECT email, is_admin, role 
FROM profiles 
WHERE email = 'specific-user@example.com';
```

## 👑 How Users See Admin Status

### 1. Admin Badge in Profile
- Admins see a golden "⭐ Admin" badge instead of "Premium Member"
- Non-admins see regular "Premium Member" badge

### 2. Admin Menu Access
- Only admins see the "Admin" menu item in navigation
- Menu item automatically appears/disappears based on admin status

### 3. Visual Indicators
- **Profile Page**: Golden gradient admin badge
- **Navigation**: Admin menu item with shield icon
- **Admin Panel**: Full access to service management

## 📱 User Experience Examples

### For Regular Users:
```
Navigation: Dashboard | Find Services | Calculator | Wishlist | Profile
Profile Badge: "Premium Member" (gray)
Admin Panel: Not accessible (hidden menu)
```

### For Admin Users:
```
Navigation: Dashboard | Find Services | Calculator | Wishlist | Admin | Profile
Profile Badge: "⭐ Admin" (golden gradient)
Admin Panel: Full access to manage services
```

## 🔄 How to Add/Remove Admins

### Add Admin Access:
```sql
-- Single user
UPDATE profiles SET is_admin = TRUE WHERE email = 'newadmin@example.com';

-- Multiple users
UPDATE profiles SET is_admin = TRUE WHERE email IN (
  'user1@example.com',
  'user2@example.com'
);
```

### Remove Admin Access:
```sql
-- Single user
UPDATE profiles SET is_admin = FALSE WHERE email = 'oldadmin@example.com';

-- Multiple users  
UPDATE profiles SET is_admin = FALSE WHERE email IN (
  'user1@example.com',
  'user2@example.com'
);
```

### Check Who's Admin:
```sql
-- List all admins with details
SELECT 
  email,
  name,
  is_admin,
  role,
  created_at,
  CASE 
    WHEN is_admin = TRUE THEN 'Admin (Flag)'
    WHEN role = 'admin' THEN 'Admin (Role)'
    ELSE 'Regular User'
  END as status
FROM profiles 
ORDER BY is_admin DESC, role DESC, created_at DESC;
```

## 🛡️ Admin Management Features

### Current Implementation:
1. **Profile Badge**: Shows admin status visually
2. **Menu Control**: Admin menu only for admins
3. **Database Policies**: RLS ensures security
4. **Multiple Admin Support**: Unlimited number of admins

### How It Works:
1. **Login**: User authenticates
2. **Status Check**: System checks `profiles.is_admin` or `profiles.role`
3. **UI Update**: Badge and menu appear/disappear automatically
4. **Access Control**: Database policies enforce permissions

## 🔧 Troubleshooting

### Admin Menu Not Showing:
1. Check admin status: `SELECT is_admin, role FROM profiles WHERE email = 'your@email.com'`
2. Restart frontend: Stop and run `npm run dev`
3. Clear browser cache: Ctrl+Shift+R
4. Check console for errors

### Can't Access Admin Panel:
1. Verify you're logged in
2. Check database policies are created
3. Ensure RLS is enabled on services table
4. Verify your user has admin flag set

### Multiple Admins Not Working:
1. Each admin needs individual database entry
2. Update profiles table for each admin user
3. System supports unlimited admins simultaneously
4. All admins have equal access to admin panel

## ✅ Quick Setup Checklist

- [ ] Execute SQL schema in Supabase
- [ ] Add admin users to profiles table  
- [ ] Verify admin status in database
- [ ] Test login with admin account
- [ ] Confirm admin menu appears
- [ ] Test adding a service
- [ ] Verify service appears to users
- [ ] Test with non-admin account (menu hidden)

## 📊 Admin Status Summary

| User Type | Profile Badge | Admin Menu | Can Manage Services |
|-----------|---------------|------------|-------------------|
| Regular User | "Premium Member" (gray) | ❌ Hidden | ❌ No |
| Admin User | "⭐ Admin" (golden) | ✅ Visible | ✅ Yes |

The system automatically detects admin status and shows appropriate UI elements!