# Quick Start Guide - Recommendation Backend

## ✅ FIXED Issues

1. **Supabase Key Error** - Changed from `service_role_key` to `SUPABASE_ANON_KEY`
2. **File Path Error** - Fixed pickle file paths to work from AI directory
3. **Port Mismatch** - Updated frontend to connect to port 8000

## 🚀 Start the Backend (Local)

### Option 1: Using Full Path (Recommended for Windows)
```powershell
cd "c:\Documents\isha's 5th august latest\cityservices\AI"
python server.py
```

### Option 2: From Project Root
```powershell
cd cityservices
cd AI
python server.py
```

## ✅ Verify Backend is Running

You should see:
```
Supabase client initialized successfully.
Loaded pickle files:
- Accommodation: 1151 entries
- Food: 10685 entries
- Tiffin: 66 entries
Starting Flask server...
 * Running on http://127.0.0.1:8000
```

**Test in browser:** http://localhost:8000/

Expected response:
```json
{"status":"ok","message":"Flask server is running"}
```

## 🎯 Start Frontend

In a **new terminal**:
```powershell
cd "c:\Documents\isha's 5th august latest\cityservices"
npm run dev
```

## 📋 Files Changed

- ✅ `AI/supabase_client.py` - Fixed to use `SUPABASE_ANON_KEY`
- ✅ `AI/recommender.py` - Fixed pickle file paths
- ✅ `src/config/api.ts` - Changed port 4000 → 8000
- ✅ `.env` - Updated `VITE_API_BASE_URL` to port 8000
- ✅ `AI/requirements.txt` - Added all dependencies

## 🔧 Troubleshooting

**"ModuleNotFoundError: No module named 'flask'"**
```powershell
cd AI
pip install -r requirements.txt
```

**"FileNotFoundError: accom.pkl"**
- Make sure you're running from the `AI` directory
- The pkl files must be in: `cityservices/AI/`

**"Error initializing Supabase client"**
- Check `.env` file exists at project root
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set

## 📦 Dependencies Installed

- flask
- flask-cors
- pandas
- supabase
- python-dotenv
- numpy
- scikit-learn
