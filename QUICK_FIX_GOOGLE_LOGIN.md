# 🔧 QUICK FIX: Google Login "Connection Refused" Error

## The Problem
When you try to log in with Google, after selecting your Gmail account, you see:
```
ERR_CONNECTION_REFUSED
localhost refused to connect
```

## The Solution (5 minutes)

### 1️⃣ Open Supabase Dashboard

Go to: https://supabase.com/dashboard/project/iecothmegflxbpvndnru/auth/url-configuration

Or manually:
- Go to https://supabase.com/dashboard
- Click your project
- Click "Authentication" in sidebar
- Click "URL Configuration"

### 2️⃣ Add These URLs

**In "Redirect URLs" field, add:**
```
http://localhost:5000
http://localhost:5173
http://127.0.0.1:5000
```

**Set "Site URL" to:**
```
http://localhost:5000
```

### 3️⃣ Click "Save"

### 4️⃣ Test Again

- Refresh your app
- Try Google login
- Should work now! ✅

---

## 📸 Visual Guide

**Where to find it:**
```
Supabase Dashboard
  └── Your Project (iecothmegflxbpvndnru)
      └── Authentication (⚡ icon in sidebar)
          └── URL Configuration (tab at top)
              └── Redirect URLs (text box)
                  ├── Add: http://localhost:5000
                  └── Add: http://localhost:5173
```

**What it looks like:**

```
┌─────────────────────────────────────────┐
│ URL Configuration                       │
├─────────────────────────────────────────┤
│                                         │
│ Site URL                                │
│ ┌─────────────────────────────────────┐ │
│ │ http://localhost:5000               │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Redirect URLs (one per line)           │
│ ┌─────────────────────────────────────┐ │
│ │ http://localhost:5000               │ │
│ │ http://localhost:5173               │ │
│ │ http://127.0.0.1:5000              │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Save] button                           │
└─────────────────────────────────────────┘
```

---

## ❓ Why This Happens

**OAuth Flow:**
1. User clicks "Sign in with Google" 
2. → Redirects to Google
3. → User selects Gmail account
4. → **Google tries to redirect back to your app**
5. → Supabase checks: "Is this URL allowed?"
   - ❌ **If NO** → Connection Refused Error
   - ✅ **If YES** → Login successful!

**The fix:** Tell Supabase which URLs are safe to redirect to.

---

## 🎯 After Fixing

Once configured, Google login will:
1. ✅ Open Google account selector
2. ✅ Let you choose Gmail
3. ✅ Redirect back to your app successfully
4. ✅ Log you in automatically

---

## 🌐 For Production Deployment

When you deploy to Vercel later, also add:
```
https://your-app-name.vercel.app
```

You can add multiple URLs (local + production) at the same time!

---

## 🆘 Still Not Working?

1. **Check your port**: Look at terminal where `npm run dev` is running
   - If it says `http://localhost:3000` → add that URL instead
   - If it says `http://localhost:5173` → add that URL

2. **Clear browser cache**: 
   - Press `Ctrl + Shift + Delete`
   - Clear cached data
   - Try again

3. **Wait 30 seconds**: After saving in Supabase, wait a moment for changes to propagate

4. **Hard refresh**: Press `Ctrl + F5` to force reload the page

---

That's it! This should fix your Google login issue. 🎉
