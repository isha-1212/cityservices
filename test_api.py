import requests
import json

# Test the API endpoints
base_url = "http://localhost:8000"

print("Testing Flask API...")

try:
    # Test users endpoint
    print("\n1. Testing /users endpoint:")
    response = requests.get(f"{base_url}/users")
    print(f"Status: {response.status_code}")
    users_data = response.json()
    print(f"Response: {json.dumps(users_data, indent=2)}")
    
    if users_data.get("status") == "success" and users_data.get("user_ids"):
        # Test recommendations endpoint
        test_user = "a1497ae5-5396-42a6-8e12-4a2113a52b0e"
        print(f"\n2. Testing /recommendations/{test_user} endpoint:")
        response = requests.get(f"{base_url}/recommendations/{test_user}")
        print(f"Status: {response.status_code}")
        rec_data = response.json()
        print(f"Response: {json.dumps(rec_data, indent=2)}")
    
except requests.exceptions.ConnectionError:
    print("Error: Could not connect to Flask server. Make sure it's running on port 8000.")
except Exception as e:
    print(f"Error: {e}")