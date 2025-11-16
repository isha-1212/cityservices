# Google OAuth Login Fix - ERR_CONNECTION_REFUSED

## 🔴 Problem
After selecting Gmail account, you see: `ERR_CONNECTION_REFUSED` when redirecting to localhost.

## 🔍 Root Cause
Supabase Google OAuth redirects to a URL that's not in your Supabase allowed redirect URLs list.

## ✅ Solution: Configure Supabase Authentication URLs

### Step 1: Go to Supabase Dashboard

1. Visit https://supabase.com/dashboard
2. Select your project: `iecothmegflxbpvndnru`
3. Click **Authentication** (left sidebar)
4. Click **URL Configuration**

### Step 2: Add Local Development URLs

In the **"Redirect URLs"** section, add these URLs:

```
http://localhost:5000
http://localhost:5000/
http://127.0.0.1:5000
http://127.0.0.1:5000/
```

**Important**: Add ALL these variations (with and without trailing slash)

### Step 3: Site URL Configuration

Set the **"Site URL"** to:
```
http://localhost:5000
```

For production, change to:
```
https://your-app.vercel.app
```

### Step 4: Save Changes

Click **"Save"** at the bottom of the page.

### Step 5: Test Again

1. Restart your frontend: `npm run dev`
2. Try logging in with Google
3. Should now redirect properly!

## 🌐 For Production (Vercel)

When deploying to Vercel, add these redirect URLs:

```
https://your-app.vercel.app
https://your-app.vercel.app/
```

And set Site URL to:
```
https://your-app.vercel.app
```

## 🔧 Alternative Quick Fix (If above doesn't work)

If you're running on a different port, check your frontend URL and add it:

1. Look at your terminal where frontend is running
2. Find the line like: `Local: http://localhost:XXXX/`
3. Add that exact URL to Supabase redirect URLs

## 📋 Common Ports
- Vite default: `http://localhost:5173`
- Custom (your app): `http://localhost:5000`
- Alternative: `http://localhost:3000`

Make sure the port in Supabase matches your actual running port!

## ✅ Verification Steps

After configuring:

1. ✅ Supabase redirect URLs include your localhost URL
2. ✅ Site URL is set correctly
3. ✅ Frontend is running on the same port
4. ✅ Try Google login again

## 🎯 Quick Checklist

- [ ] Opened Supabase Dashboard → Authentication → URL Configuration
- [ ] Added `http://localhost:5000` to Redirect URLs
- [ ] Added `http://localhost:5000/` to Redirect URLs  
- [ ] Set Site URL to `http://localhost:5000`
- [ ] Clicked Save
- [ ] Restarted frontend (`npm run dev`)
- [ ] Tested Google login

## 💡 Why This Happens

Google OAuth flow:
1. User clicks "Sign in with Google"
2. Redirects to Google login page
3. User selects Gmail account
4. **Google redirects back to your app** ← This URL must be allowed in Supabase!
5. If URL is not in allowed list → Connection Refused

The fix ensures Supabase accepts the redirect from Google.
