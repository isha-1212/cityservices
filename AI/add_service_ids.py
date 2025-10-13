#!/usr/bin/env python3
"""
Create unique service_ids and add them to both pickle files and Supabase
"""
import pandas as pd
import numpy as np
import uuid
from supabase_client import supabase

def generate_unique_service_id(category: str, index: int) -> str:
    """Generate a unique service_id"""
    return f"{category}_{index:04d}_{str(uuid.uuid4())[:8]}"

def clear_existing_wishlists():
    """Clear existing wishlists table (optional - be careful!)"""
    response = input("Do you want to clear existing wishlists table? (yes/no): ")
    if response.lower() == "yes":
        try:
            # Delete all existing records
            supabase.table("wishlists").delete().neq("id", "").execute()
            print("Existing wishlists cleared.")
        except Exception as e:
            print(f"Error clearing wishlists: {e}")
    else:
        print("Keeping existing wishlists.")

def add_service_ids_to_accommodation():
    """Add new unique service_ids to accommodation pickle and upload to Supabase"""
    print("Processing accommodation.pkl...")
    df = pd.read_pickle("AI/accom.pkl")
    print(f"Accommodation columns: {df.columns.tolist()}")
    print(f"Total accommodation entries: {len(df)}")
    
    # Generate unique service_ids
    df["service_id"] = [generate_unique_service_id("accommodation", i) for i in range(len(df))]
    
    # Prepare data for Supabase  
    system_user_id = str(uuid.uuid4())  # Single UUID for all system entries
    supabase_records = []
    for index, row in df.iterrows():
        service_data = {
            "name": str(row.get("Project/Owner Name", "")),
            "city": str(row.get("City", "")),
            "area": str(row.get("Locality / Area", "")),
            "property_type": str(row.get("Property Type", "")),
            "bedrooms": str(row.get("Bedrooms", "")),
            "rent_price": str(row.get("Rent Price", "")),
            "rating": float(row.get("Rating", 0)),
            "category": "accommodation"
        }
        
        supabase_records.append({
            "user_id": system_user_id,  # Use UUID for system entries
            "service_id": row["service_id"],
            "service_data": service_data
        })
    
    # Upload to Supabase in batches
    batch_size = 100
    uploaded_count = 0
    
    for i in range(0, len(supabase_records), batch_size):
        batch = supabase_records[i:i+batch_size]
        try:
            supabase.table("wishlists").insert(batch).execute()
            uploaded_count += len(batch)
            print(f"Uploaded batch {i//batch_size + 1}: {uploaded_count}/{len(supabase_records)} records")
        except Exception as e:
            print(f"Error uploading batch {i//batch_size + 1}: {e}")
    
    # Save updated pickle
    df.to_pickle("AI/accom.pkl")
    print(f"Updated accommodation pickle saved with {len(df)} service_ids")
    return df

def add_service_ids_to_food():
    """Add new unique service_ids to food pickle and upload to Supabase"""
    print("\nProcessing food.pkl...")
    df = pd.read_pickle("AI/food.pkl")
    print(f"Food columns: {df.columns.tolist()}")
    print(f"Total food entries: {len(df)}")
    
    # Generate unique service_ids
    df["service_id"] = [generate_unique_service_id("food", i) for i in range(len(df))]
    
    # Prepare data for Supabase
    system_user_id = str(uuid.uuid4())  # Single UUID for all system entries
    supabase_records = []
    for index, row in df.iterrows():
        service_data = {
            "name": str(row.get("restaurant_name", "")),
            "city": str(row.get("city", "")),
            "platform": str(row.get("platform", "")),
            "cuisine": str(row.get("cuisine", "")),
            "dish": str(row.get("dish", "")),
            "price": float(row.get("price", 0)),
            "rating": float(row.get("rating", 0)),
            "category": "food"
        }
        
        supabase_records.append({
            "user_id": system_user_id,  # Use UUID for system entries
            "service_id": row["service_id"],
            "service_data": service_data
        })
    
    # Upload to Supabase in batches
    batch_size = 100
    uploaded_count = 0
    
    for i in range(0, len(supabase_records), batch_size):
        batch = supabase_records[i:i+batch_size]
        try:
            supabase.table("wishlists").insert(batch).execute()
            uploaded_count += len(batch)
            print(f"Uploaded batch {i//batch_size + 1}: {uploaded_count}/{len(supabase_records)} records")
        except Exception as e:
            print(f"Error uploading batch {i//batch_size + 1}: {e}")
    
    # Save updated pickle
    df.to_pickle("AI/food.pkl")
    print(f"Updated food pickle saved with {len(df)} service_ids")
    return df

def add_service_ids_to_tiffin():
    """Add new unique service_ids to tiffin pickle and upload to Supabase"""
    print("\nProcessing tiffin.pkl...")
    df = pd.read_pickle("AI/tif.pkl")
    print(f"Tiffin columns: {df.columns.tolist()}")
    print(f"Total tiffin entries: {len(df)}")
    
    # Generate unique service_ids
    df["service_id"] = [generate_unique_service_id("tiffin", i) for i in range(len(df))]
    
    # Prepare data for Supabase
    system_user_id = str(uuid.uuid4())  # Single UUID for all system entries
    supabase_records = []
    for index, row in df.iterrows():
        # Handle price conversion safely
        try:
            estimated_price = float(row.get("Estimated_Price_Per_Tiffin_INR", 0))
        except (ValueError, TypeError):
            # Handle cases like '₹70 - ₹120' 
            price_str = str(row.get("Estimated_Price_Per_Tiffin_INR", "0"))
            # Extract first number from price string
            import re
            numbers = re.findall(r'\d+', price_str)
            estimated_price = float(numbers[0]) if numbers else 0
            
        service_data = {
            "name": str(row.get("Name", "")),
            "city": str(row.get("City", "")),
            "rating": float(row.get("Rating", 0)),
            "reviews": str(row.get("Reviews", "")),
            "type": str(row.get("Type", "")),
            "estimated_price": estimated_price,
            "address": str(row.get("Address", "")),
            "hours": str(row.get("Hours", "")),
            "category": "tiffin"
        }
        
        supabase_records.append({
            "user_id": system_user_id,  # Use UUID for system entries
            "service_id": row["service_id"],
            "service_data": service_data
        })
    
    # Upload to Supabase in batches
    batch_size = 100
    uploaded_count = 0
    
    for i in range(0, len(supabase_records), batch_size):
        batch = supabase_records[i:i+batch_size]
        try:
            supabase.table("wishlists").insert(batch).execute()
            uploaded_count += len(batch)
            print(f"Uploaded batch {i//batch_size + 1}: {uploaded_count}/{len(supabase_records)} records")
        except Exception as e:
            print(f"Error uploading batch {i//batch_size + 1}: {e}")
    
    # Save updated pickle
    df.to_pickle("AI/tif.pkl")
    print(f"Updated tiffin pickle saved with {len(df)} service_ids")
    return df

if __name__ == "__main__":
    print("Creating unique service_ids and uploading to Supabase...\n")
    
    try:
        # Optional: clear existing wishlists
        clear_existing_wishlists()
        
        # Process each pickle file and upload to Supabase
        print("\nProcessing pickle files...")
        accom_df = add_service_ids_to_accommodation()
        food_df = add_service_ids_to_food()
        tiffin_df = add_service_ids_to_tiffin()
        
        print("\n" + "="*60)
        print("SUMMARY:")
        print(f"Accommodation: {len(accom_df)} entries with unique service_ids")
        print(f"Food: {len(food_df)} entries with unique service_ids")
        print(f"Tiffin: {len(tiffin_df)} entries with unique service_ids")
        print(f"Total: {len(accom_df) + len(food_df) + len(tiffin_df)} services added to Supabase")
        print("All pickle files updated and uploaded to Supabase!")
        
    except Exception as e:
        print(f"Error: {e}")