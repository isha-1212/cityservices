import pandas as pd
import numpy as np
import json
from supabase_client import supabase  # your supabase client instance

# Market Basket Analysis imports
# from mlxtend.frequent_patterns import apriori, association_rules
# from mlxtend.preprocessing import TransactionEncoder
import time
from functools import lru_cache

# ------------------ IMAGE MAPPING ------------------
def _get_mock_image(category: str) -> str:
    """Get a mock image URL based on service category"""
    image_map = {
        'accommodation': 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
        'food': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
        'tiffin': 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=400',
        'transport': 'https://images.pexels.com/photos/385998/pexels-photo-385998.jpeg?auto=compress&cs=tinysrgb&w=400',
        'coworking': 'https://images.pexels.com/photos/7147649/pexels-photo-7147649.jpeg?auto=compress&cs=tinysrgb&w=400',
        'utilities': 'https://images.pexels.com/photos/3847490/pexels-photo-3847490.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
    return image_map.get(category.lower(), 'https://via.placeholder.com/400x300')

# Global cache for association rules
# _cached_rules = None
# _cache_timestamp = None
# _cache_duration = 300  # 5 minutes cache

# ------------------ LOAD SERVICE DATA ------------------
def _load_df(path: str) -> pd.DataFrame:
    """Load pickle file with service_id column already added"""
    df = pd.read_pickle(path)
    return df.copy()

# Get the directory where this script is located
import os
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Load preprocessed PKL files (now with service_id columns)
<<<<<<< HEAD
accommodation_raw = _load_df("accom.pkl")
food_raw = _load_df("food.pkl") 
tiffin_raw = _load_df("tif.pkl")
=======
accommodation_raw = _load_df(os.path.join(SCRIPT_DIR, "accom.pkl"))
food_raw = _load_df(os.path.join(SCRIPT_DIR, "food.pkl")) 
tiffin_raw = _load_df(os.path.join(SCRIPT_DIR, "tif.pkl"))
>>>>>>> 1363ac7e340820ea08840696b6947f21036cd610

print(f"Loaded pickle files:")
print(f"- Accommodation: {len(accommodation_raw)} entries")
print(f"- Food: {len(food_raw)} entries") 
print(f"- Tiffin: {len(tiffin_raw)} entries")

# ------------------ NORMALIZATION ------------------
def _num(s):
    return pd.to_numeric(s, errors="coerce")

def _clean_area(s: pd.Series) -> pd.Series:
    return s.astype(str).str.strip().replace({"nan": ""}, regex=False).fillna("")

def _normalize_accommodation(df):
    """Normalize accommodation data using existing service_id column"""
    out = pd.DataFrame({
        "service_id": df.get("service_id"),  # Use existing service_id
        "name": df.get("Project/Owner Name", ""),
        "category": "accommodation",
        "area": df.get("Locality / Area", df.get("City", "")),
        "rating": _num(df.get("Rating", np.nan)).fillna(0).clip(0, 5),
        "price": _num(df.get("Rent Price", np.nan)).fillna(0)
    })
    
    out["area"] = _clean_area(out["area"])
    out["price"] = out["price"].astype(float)
    
    # Keep only rows that have valid service_ids  
    out = out.dropna(subset=["service_id"])
    return out

def _normalize_food(df):
    """Normalize food data using existing service_id column"""
    out = pd.DataFrame({
        "service_id": df.get("service_id"),  # Use existing service_id
        "name": df.get("restaurant_name", ""),
        "category": "food",
        "area": df.get("city", df.get("location", "")),
        "rating": _num(df.get("rating", np.nan)).fillna(0).clip(0, 5),
        "price": _num(df.get("price", np.nan)).fillna(0)
    })
    
    out["area"] = _clean_area(out["area"])
    out["price"] = out["price"].astype(float)
    
    # Keep only rows that have valid service_ids
    out = out.dropna(subset=["service_id"])
    return out

def _normalize_tiffin(df):
    """Normalize tiffin data using existing service_id column"""
    price_series = df.get("Estimated_Price_Per_Tiffin_INR", df.get("price", np.nan))
    out = pd.DataFrame({
        "service_id": df.get("service_id"),  # Use existing service_id
        "name": df.get("Name", ""),
        "category": "tiffin",
        "area": df.get("City", df.get("city", "")),
        "rating": _num(df.get("Rating", np.nan)).fillna(0).clip(0, 5),
        "price": _num(price_series).fillna(0)
    })
    
    out["area"] = _clean_area(out["area"])
    out["price"] = out["price"].astype(float)
    
    # Keep only rows that have valid service_ids
    out = out.dropna(subset=["service_id"])
    return out

accommodation_df = _normalize_accommodation(accommodation_raw)
food_df = _normalize_food(food_raw)
tiffin_df = _normalize_tiffin(tiffin_raw)
service_df = pd.concat([accommodation_df, food_df, tiffin_df], ignore_index=True)

# ------------------ FETCH WISHLIST ------------------
def fetch_wishlist() -> pd.DataFrame:
    """Fetch wishlist table from Supabase"""
    resp = supabase.table("wishlists").select("*").execute()
    if resp.data:
        return pd.DataFrame(resp.data)
    return pd.DataFrame(columns=["id", "user_id", "service_id", "service_data"])

# ------------------ ASSOCIATION RULES ANALYSIS ------------------
"""
def generate_association_rules(wishlist_df: pd.DataFrame, min_support=0.01, min_confidence=0.1):
    # Generate association rules from user bookmarking patterns
    ...
def get_association_recommendations(user_id: str, wishlist_df: pd.DataFrame, rules_df: pd.DataFrame, top_k: int = 5):
    # Get recommendations based on association rules
    ...
"""

# ------------------ HYBRID RECOMMENDATION ------------------
def recommend_for_user(user_id: str, wishlist_df: pd.DataFrame, top_k: int = 5):
    """Hybrid recommendations: Popularity-based + Random fallback (Association rules commented out)"""
    user_rows = wishlist_df[wishlist_df["user_id"] == user_id]
    user_bookmarks = set(user_rows["service_id"].tolist())

    print(f"\n🔍 Generating recommendations for user: {user_id}")
    print(f"User has {len(user_bookmarks)} bookmarks")

    recommendations = []

    # 1. Association rules recommendation commented out
    # print("\n📊 Generating association rules...")
    # rules_df = generate_association_rules(wishlist_df, min_support=0.02, min_confidence=0.1)
    # if not rules_df.empty and user_bookmarks:
    #     association_recs = get_association_recommendations(user_id, wishlist_df, rules_df, top_k)
    #     recommendations.extend(association_recs)

    # 2. Fill remaining slots with popularity-based recommendations
    remaining_slots = top_k - len(recommendations)
    if remaining_slots > 0:
        print(f"📈 Getting {remaining_slots} popularity-based recommendations...")
        popularity_recs = get_popularity_recommendations(user_id, wishlist_df, remaining_slots)
        
        already_recommended = set(r["id"] for r in recommendations)
        filtered_popularity = [r for r in popularity_recs if r["id"] not in already_recommended]
        recommendations.extend(filtered_popularity[:remaining_slots])

    # 3. Fill any remaining slots with random recommendations
    remaining_slots = top_k - len(recommendations)
    if remaining_slots > 0:
        print(f"🎲 Getting {remaining_slots} random recommendations...")
        already_ids = set(r["id"] for r in recommendations) | user_bookmarks
        random_recs = _random_recs(already_ids, remaining_slots)
        recommendations.extend(random_recs)

    # Sort by recommendation type priority: popularity > random
    def get_priority(rec):
        if rec.get('bookmarked_by_users', 0) > 0:
            return (1, rec.get('bookmarked_by_users', 0))
        else:
            return (2, 0)
    recommendations.sort(key=get_priority)
    return recommendations[:top_k]

def get_popularity_recommendations(user_id: str, wishlist_df: pd.DataFrame, top_k: int = 5):
    """Get popularity-based recommendations"""
    user_rows = wishlist_df[wishlist_df["user_id"] == user_id]
    user_bookmarks = set(user_rows["service_id"].tolist())

    other_users_data = wishlist_df[wishlist_df["user_id"] != user_id]
    
    if other_users_data.empty:
        return []

    service_popularity = other_users_data["service_id"].value_counts()
    popular_services = service_popularity[~service_popularity.index.isin(user_bookmarks)]
    
    if popular_services.empty:
        return []

    recommendations = []
    for service_id, bookmark_count in popular_services.head(top_k * 2).items():
        rec = _service_to_block(service_id)
        if rec:
            rec["popularity_score"] = int(bookmark_count)
            rec["bookmarked_by_users"] = int(bookmark_count)
            recommendations.append(rec)
        if len(recommendations) >= top_k:
            break

    return recommendations

def _service_to_block(service_id: str):
    """Find service by real service_id across all DataFrames"""
    row = service_df[service_df["service_id"] == service_id]
    if row.empty:
        return None
    s = row.iloc[0]
    category = s.get("category", "")
    return {
        "id": s["service_id"],
        "name": s.get("name", ""),
        "category": category,
        "area": s.get("area", ""),
        "rating": float(s.get("rating", 0.0)),
        "price": str(s.get("price", 0.0)),
        "image": _get_mock_image(category)  # Add mock image based on category
    }

def _random_recs(exclude_ids: set, n: int):
    pool = service_df[~service_df["service_id"].isin(list(exclude_ids))]
    if pool.empty or n <= 0:
        return []
    sample = pool.sample(min(n, len(pool)), random_state=42)
    out = []
    for _, s in sample.iterrows():
        out.append({
            "id": s["service_id"],
            "name": s.get("name", ""),
            "category": s.get("category", ""),
            "area": s.get("area", ""),
            "rating": float(s.get("rating", 0.0)),
            "price": str(s.get("price", 0.0)),
            "popularity_score": 0,
            "bookmarked_by_users": 0
        })
    return out

def get_popularity_stats(wishlist_df: pd.DataFrame):
    """Get statistics about service popularity"""
    if wishlist_df.empty:
        return {}
    
    service_counts = wishlist_df["service_id"].value_counts()
    return {
        "total_bookmarks": len(wishlist_df),
        "unique_services": len(service_counts),
        "most_popular_service": service_counts.index[0] if len(service_counts) > 0 else None,
        "max_bookmarks": service_counts.iloc[0] if len(service_counts) > 0 else 0,
        "top_10_popular": service_counts.head(10).to_dict()
    }

# ------------------ TEST ------------------
if __name__ == "__main__":
    print(f"Service DataFrame sizes:")
    print(f"- Accommodation: {len(accommodation_df)} rows")
    print(f"- Food: {len(food_df)} rows")
    print(f"- Tiffin: {len(tiffin_df)} rows")
    print(f"- Combined: {len(service_df)} rows")
    
    wishlist_df = fetch_wishlist()
    print(f"\nWishlist rows: {len(wishlist_df)}")

    popularity_stats = get_popularity_stats(wishlist_df)
    print(f"\n📊 POPULARITY STATISTICS:")
    print(f"- Total bookmarks: {popularity_stats.get('total_bookmarks', 0)}")
    print(f"- Unique services bookmarked: {popularity_stats.get('unique_services', 0)}")
    print(f"- Most popular service: {popularity_stats.get('most_popular_service', 'None')}")
    print(f"- Max bookmarks for one service: {popularity_stats.get('max_bookmarks', 0)}")
    print(f"\n🔥 TOP 10 MOST POPULAR SERVICES:")
    for service_id, count in list(popularity_stats.get('top_10_popular', {}).items())[:10]:
        service_info = _service_to_block(service_id)
        if service_info:
            print(f"  {count}x - {service_info['name']} ({service_info['category']}) - {service_id}")

    test_user_id = "a1497ae5-5396-42a6-8e12-4a2113a52b0e"
    
    if not wishlist_df.empty:
        user_bookmarks = wishlist_df[wishlist_df["user_id"] == test_user_id]["service_id"].tolist()
        print(f"\n👤 User {test_user_id} has {len(user_bookmarks)} bookmarks:")
        for bookmark in user_bookmarks[:5]:
            print(f"  - {bookmark}")
    
    print(f"\n🎯 HYBRID RECOMMENDATIONS (Popularity + Random) for user: {test_user_id}")
    recs = recommend_for_user(test_user_id, wishlist_df, top_k=5)
    for i, rec in enumerate(recs, 1):
        rec_type = ""
        if rec.get('bookmarked_by_users', 0) > 0:
            rec_type = f" (📈 Popular: {rec['bookmarked_by_users']} users)"
        else:
            rec_type = " (🎲 Random fallback)"
        
        print(f"{i}. {rec['name']} - {rec['category']} - ⭐{rec['rating']} - ₹{rec['price']}{rec_type}")
    
    print(f"\nFull JSON response:")
    print(json.dumps(recs, indent=2))
