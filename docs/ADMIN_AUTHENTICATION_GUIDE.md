# Admin Authentication Guide

## How to Login/Signup as Admin

### Method 1: Admin Signup (New Users)
1. **Go to the Auth Page** (Login/Signup page)
2. **Click "Signup Now"** to switch to signup mode
3. **Select "Admin User"** toggle button (instead of Regular User)
4. **Fill in your details**:
   - Username
   - Email 
   - Password
   - Confirm Password
   - **Admin Secret Key**: `ADMIN2024`
5. **Click "SIGN UP"**
6. Your account will be created with admin privileges automatically

### Method 2: Promote Existing User to Admin
1. **Login normally** with your existing account
2. **Go to Profile page**
3. **Click "Become Admin"** button (next to Premium Member badge)
4. **Enter Admin Secret Key**: `ADMIN2024`
5. **Click "Become Admin"**
6. Page will refresh and you'll have admin access

### Method 3: Manual Database Update (For Developers)
```sql
UPDATE profiles 
SET is_admin = true, role = 'admin' 
WHERE email = 'your-email@example.com';
```

## Admin Features Access
Once you're an admin:
- **Admin Panel**: Accessible from the main navigation menu
- **Add Services**: Create new services for users
- **Edit Services**: Modify existing service details  
- **Delete Services**: Remove services
- **Manage Users**: View user profiles with admin badges

## Admin Secret Key
- **Current Key**: `ADMIN2024`
- **Security Note**: Change this in production by updating:
  - `AuthPage.tsx` line with `adminKey === 'ADMIN2024'`
  - `AdminPromotion.tsx` line with `adminKey !== 'ADMIN2024'`

## Troubleshooting
- **Can't access admin features?** Check if your profile has `is_admin = true` in database
- **Admin button not showing?** Make sure you're logged in and on Profile page
- **Secret key not working?** Verify you're using exactly: `ADMIN2024`

## Database Schema
The admin system uses these database fields:
```sql
profiles table:
- is_admin: BOOLEAN (true for admins)
- role: TEXT ('admin' or 'user')
```