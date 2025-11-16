# AI/supabase_client.py
import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client
import pandas as pd

# Load .env from project root
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

# Initialize Supabase client
if not SUPABASE_URL or not SUPABASE_KEY:
    print("Warning: SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env file")
    supabase = None
else:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("Supabase client initialized successfully.")
    except Exception as e:
        print(f"Error initializing Supabase client: {e}")
        supabase = None

def get_all_wishlist_data():
    """Fetch all wishlist data from Supabase"""
    try:
        if not supabase:
            return pd.DataFrame()
        response = supabase.table("bookmarks").select("*").execute()
        return pd.DataFrame(response.data)
    except Exception as e:
        print(f"Error fetching wishlist data: {e}")
        return pd.DataFrame()

def get_user_wishlist(user_id):
    """Fetch wishlist data for a specific user"""
    try:
        if not supabase:
            return pd.DataFrame()
        response = supabase.table("bookmarks").select("*").eq("user_id", user_id).execute()
        return pd.DataFrame(response.data)
    except Exception as e:
        print(f"Error fetching user wishlist: {e}")
        return pd.DataFrame()

def get_service_details(service_ids):
    """Fetch service details for given service IDs"""
    try:
        if not supabase:
            return pd.DataFrame()
        response = supabase.table("wishlist")\
            .select("service_id,category,area,rating")\
            .in_("service_id", service_ids)\
            .execute()
        return pd.DataFrame(response.data)
    except Exception as e:
        print(f"Error fetching service details: {e}")
        return pd.DataFrame()