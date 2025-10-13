import pandas as pd
import numpy as np
import json
from supabase_client import supabase  # your supabase client instance

# Market Basket Analysis imports
from mlxtend.frequent_patterns import apriori, association_rules
from mlxtend.preprocessing import TransactionEncoder
import time
from functools import lru_cache

# Global cache for association rules
_cached_rules = None
_cache_timestamp = None
_cache_duration = 300  # 5 minutes cache

# ------------------ LOAD SERVICE DATA ------------------
def _load_df(path: str) -> pd.DataFrame:
    """Load pickle file with service_id column already added"""
    df = pd.read_pickle(path)
    return df.copy()

# Load preprocessed PKL files (now with service_id columns)
accommodation_raw = _load_df("AI/accom.pkl")
food_raw = _load_df("AI/food.pkl") 
tiffin_raw = _load_df("AI/tif.pkl")

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
def generate_association_rules(wishlist_df: pd.DataFrame, min_support=0.01, min_confidence=0.1):
    """Generate association rules from user bookmarking patterns"""
    if wishlist_df.empty or len(wishlist_df["user_id"].unique()) < 2:
        print("Not enough data for association rules")
        return pd.DataFrame()
    
    # Create user-service matrix (transactions)
    user_service_matrix = wishlist_df.groupby('user_id')['service_id'].apply(list).reset_index()
    transactions = user_service_matrix['service_id'].tolist()
    
    # Filter out users with too few bookmarks (less than 2)
    transactions = [t for t in transactions if len(t) >= 2]
    
    if len(transactions) < 2:
        print("Not enough valid transactions for association rules")
        return pd.DataFrame()
    
    print(f"Processing {len(transactions)} transactions for association rules")
    
    try:
        # Create binary matrix using TransactionEncoder
        te = TransactionEncoder()
        te_ary = te.fit(transactions).transform(transactions)
        df_encoded = pd.DataFrame(te_ary, columns=te.columns_)
        
        # Find frequent itemsets using Apriori algorithm
        frequent_itemsets = apriori(df_encoded, min_support=min_support, use_colnames=True)
        
        if frequent_itemsets.empty:
            print(f"No frequent itemsets found with min_support={min_support}")
            return pd.DataFrame()
        
        print(f"Found {len(frequent_itemsets)} frequent itemsets")
        
        # Generate association rules
        rules = association_rules(frequent_itemsets, metric="confidence", min_threshold=min_confidence)
        
        if rules.empty:
            print(f"No association rules found with min_confidence={min_confidence}")
            return pd.DataFrame()
        
        print(f"Generated {len(rules)} association rules")
        return rules
        
    except Exception as e:
        print(f"Error generating association rules: {e}")
        return pd.DataFrame()

def get_association_recommendations(user_id: str, wishlist_df: pd.DataFrame, rules_df: pd.DataFrame, top_k: int = 5):
    """Get recommendations based on association rules"""
    if rules_df.empty:
        return []
    
    # Get user's current bookmarks
    user_bookmarks = set(wishlist_df[wishlist_df["user_id"] == user_id]["service_id"].tolist())
    
    if not user_bookmarks:
        return []
    
    # Find applicable rules where antecedents are subset of user's bookmarks
    applicable_rules = []
    
    for _, rule in rules_df.iterrows():
        antecedents = set(rule['antecedents'])
        consequents = set(rule['consequents'])
        
        # Check if antecedents are subset of user bookmarks
        # and consequents are not already bookmarked
        if (antecedents.issubset(user_bookmarks) and 
            not consequents.intersection(user_bookmarks)):
            
            for consequent in consequents:
                applicable_rules.append({
                    'service_id': consequent,
                    'confidence': rule['confidence'],
                    'lift': rule['lift'],
                    'support': rule['support'],
                    'antecedents': list(antecedents),
                    'rule_strength': rule['confidence'] * rule['lift']  # Combined score
                })
    
    # Sort by rule strength (confidence * lift) and get top recommendations
    applicable_rules.sort(key=lambda x: x['rule_strength'], reverse=True)
    
    recommendations = []
    seen_services = set()
    
    for rule in applicable_rules:
        service_id = rule['service_id']
        if service_id not in seen_services:
            rec = _service_to_block(service_id)
            if rec:
                rec['association_confidence'] = round(rule['confidence'], 3)
                rec['association_lift'] = round(rule['lift'], 3)
                rec['association_support'] = round(rule['support'], 3)
                rec['rule_strength'] = round(rule['rule_strength'], 3)
                rec['based_on_services'] = rule['antecedents']
                recommendations.append(rec)
                seen_services.add(service_id)
        
        if len(recommendations) >= top_k:
            break
    
    return recommendations

# ------------------ HYBRID RECOMMENDATION ------------------
def recommend_for_user(user_id: str, wishlist_df: pd.DataFrame, top_k: int = 5):
    """Hybrid recommendations: Association Rules + Popularity-based + Random fallback"""
    user_rows = wishlist_df[wishlist_df["user_id"] == user_id]
    user_bookmarks = set(user_rows["service_id"].tolist())

    print(f"\n🔍 Generating recommendations for user: {user_id}")
    print(f"User has {len(user_bookmarks)} bookmarks")

    # Generate association rules from all user data
    print("\n📊 Generating association rules...")
    rules_df = generate_association_rules(wishlist_df, min_support=0.02, min_confidence=0.1)
    
    recommendations = []
    
    # 1. First, try association rules recommendations
    if not rules_df.empty and user_bookmarks:
        print("🧠 Getting association rules recommendations...")
        association_recs = get_association_recommendations(user_id, wishlist_df, rules_df, top_k)
        recommendations.extend(association_recs)
        print(f"Found {len(association_recs)} association-based recommendations")

    # 2. Fill remaining slots with popularity-based recommendations
    remaining_slots = top_k - len(recommendations)
    if remaining_slots > 0:
        print(f"📈 Getting {remaining_slots} popularity-based recommendations...")
        popularity_recs = get_popularity_recommendations(user_id, wishlist_df, remaining_slots)
        
        # Filter out services already recommended
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

    # Sort by recommendation type priority: association rules > popularity > random
    def get_priority(rec):
        if 'association_confidence' in rec:
            return (0, rec.get('rule_strength', 0))  # Highest priority
        elif 'bookmarked_by_users' in rec and rec['bookmarked_by_users'] > 0:
            return (1, rec.get('bookmarked_by_users', 0))  # Medium priority
        else:
            return (2, rec.get('rating', 0))  # Lowest priority (random)

    recommendations.sort(key=get_priority)
    return recommendations[:top_k]

def get_popularity_recommendations(user_id: str, wishlist_df: pd.DataFrame, top_k: int = 5):
    """Get popularity-based recommendations (extracted from original function)"""
    user_rows = wishlist_df[wishlist_df["user_id"] == user_id]
    user_bookmarks = set(user_rows["service_id"].tolist())

    # Get all services bookmarked by other users (exclude current user's bookmarks)
    other_users_data = wishlist_df[wishlist_df["user_id"] != user_id]
    
    if other_users_data.empty:
        return []

    # Count how many times each service has been bookmarked by different users
    service_popularity = other_users_data["service_id"].value_counts()
    
    # Filter out services already bookmarked by current user
    popular_services = service_popularity[~service_popularity.index.isin(user_bookmarks)]
    
    if popular_services.empty:
        return []

    # Get top_k most popular services and convert to recommendations
    recommendations = []
    for service_id, bookmark_count in popular_services.head(top_k * 2).items():  # Get extra in case some don't exist
        rec = _service_to_block(service_id)
        if rec:
            # Add popularity score to the recommendation
            rec["popularity_score"] = int(bookmark_count)
            rec["bookmarked_by_users"] = int(bookmark_count)
            recommendations.append(rec)
        if len(recommendations) >= top_k:
            break

    return recommendations

def _service_to_block(service_id: str):
    """Find service by real service_id across all DataFrames"""
    # Search in all service DataFrames for the real service_id
    row = service_df[service_df["service_id"] == service_id]
    if row.empty:
        return None
    s = row.iloc[0]
    return {
        "id": s["service_id"],
        "name": s.get("name", ""),
        "category": s.get("category", ""),
        "area": s.get("area", ""),
        "rating": float(s.get("rating", 0.0)),
        "price": str(s.get("price", 0.0)),
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
            "popularity_score": 0,  # Random recommendations get 0 popularity
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
    
    # Fetch initial wishlist
    wishlist_df = fetch_wishlist()
    print(f"\nWishlist rows: {len(wishlist_df)}")

    # Show popularity statistics
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

    # Example recommendations for the real user you specified
    test_user_id = "a1497ae5-5396-42a6-8e12-4a2113a52b0e"
    
    if not wishlist_df.empty:
        user_bookmarks = wishlist_df[wishlist_df["user_id"] == test_user_id]["service_id"].tolist()
        print(f"\n👤 User {test_user_id} has {len(user_bookmarks)} bookmarks:")
        for bookmark in user_bookmarks[:5]:  # Show first 5
            print(f"  - {bookmark}")
    
    print(f"\n🎯 HYBRID RECOMMENDATIONS (Association Rules + Popularity + Random) for user: {test_user_id}")
    recs = recommend_for_user(test_user_id, wishlist_df, top_k=5)
    for i, rec in enumerate(recs, 1):
        rec_type = ""
        if 'association_confidence' in rec:
            rec_type = f" (🧠 Association: {rec['association_confidence']:.2f} confidence, {rec['association_lift']:.2f} lift)"
        elif rec.get('bookmarked_by_users', 0) > 0:
            rec_type = f" (📈 Popular: {rec['bookmarked_by_users']} users)"
        else:
            rec_type = " (🎲 Random fallback)"
        
        print(f"{i}. {rec['name']} - {rec['category']} - ⭐{rec['rating']} - ₹{rec['price']}{rec_type}")
        
        if 'based_on_services' in rec:
            print(f"   └─ Based on your bookmarks: {', '.join(rec['based_on_services'][:3])}...")
    
    print(f"\nFull JSON response:")
    print(json.dumps(recs, indent=2))
