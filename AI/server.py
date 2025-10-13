from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import traceback
from supabase_client import supabase
from recommender import recommend_for_user

app = Flask(__name__)
CORS(app)

# Add error handler
@app.errorhandler(Exception)
def handle_error(error):
    print(f"Error occurred: {error}")
    print(f"Traceback: {traceback.format_exc()}")
    return jsonify({
        "status": "error", 
        "message": str(error)
    }), 500


@app.route("/", methods=["GET"])
def index():
    return jsonify({"status": "ok", "message": "Flask server is running"})

@app.route("/users", methods=["GET"])
def get_users():
    try:
        if not supabase:
            return jsonify({"status": "error", "message": "Supabase client not initialized"}), 500
        
        # Fetch distinct user IDs from wishlists table
        result = supabase.table("wishlists").select("user_id").execute()
        if hasattr(result, "error") and result.error:
            raise Exception(f"Supabase select error: {result.error.message}")
        
        user_ids = list({row["user_id"] for row in result.data})
        return jsonify({"status": "success", "user_ids": user_ids, "count": len(user_ids)}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/recommendations/<user_id>", methods=["GET"])
def get_recommendations(user_id):
    """Fetch real-time recommendations for a specific user"""
    try:
        if not supabase:
            return jsonify({"status": "error", "message": "Supabase client not initialized"}), 500

        # ✅ Always fetch the latest wishlist table
        result = supabase.table("wishlists").select("*").execute()
        df = pd.DataFrame(result.data)
        print(df.head(10))
        print(df.groupby("user_id")["service_id"].apply(list))
        if hasattr(result, "error") and result.error:
            raise Exception(f"Supabase select error: {result.error.message}")

        wishlist_df = pd.DataFrame(result.data)

        if wishlist_df.empty:
            return jsonify({
                "status": "success",
                "user_id": user_id,
                "recommendations": []
            }), 200

        # Get number of recommendations from query params, default 5
        n_recommendations = int(request.args.get("n", 5))

        # Generate personalized recommendations
        recommendations = recommend_for_user(user_id, wishlist_df, top_k=n_recommendations)

        return jsonify({
            "status": "success",
            "user_id": user_id,
            "recommendations": recommendations
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == "__main__":
    print("Starting Flask server...")
    try:
        app.run(host="0.0.0.0", port=8000, debug=False, use_reloader=False)
    except Exception as e:
        print(f"Server error: {e}")
        input("Press Enter to exit...")
