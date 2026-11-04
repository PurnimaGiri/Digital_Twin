
import os
from dotenv import load_dotenv
from supabase import create_client

# Load Python environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase credentials are missing from simulator/.env")

# Connect to Supabase
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("Connected to Supabase!")

# Fetch all rooms
response = (
    supabase
    .table("Rooms")
    .select("id, room_no, floor_id, capacity")
    .order("id")
    .execute()
)

rooms = response.data

print(f"\nTotal rooms fetched: {len(rooms)}")

for room in rooms:
    print(
        f"Room: {room['room_no']} | "
        f"Room ID: {room['id']} | "
        f"Floor ID: {room['floor_id']}"
    )

if len(rooms) == 91:
    print("\nSUCCESS: All 91 rooms fetched!")
else:
    print(f"\nWARNING: Expected 91 rooms, received {len(rooms)}.")
