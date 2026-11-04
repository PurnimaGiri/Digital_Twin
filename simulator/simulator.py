
import os
import time
import random
from datetime import datetime, timezone

from dotenv import load_dotenv
from supabase import create_client

# ---------------------------------
# 1. CONFIGURATION
# ---------------------------------

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

INTERVAL = 30
EXPECTED_ROOMS = 91

REALISTIC_MODE = "realistic"
DEMO_MODE = "demo"

# Initial simulation validation limits
MIN_TEMPERATURE = 15
MAX_TEMPERATURE = 40

MIN_HUMIDITY = 20
MAX_HUMIDITY = 90

MIN_CO2 = 300
MAX_CO2 = 3000

MAX_ROOM_POWER_KW = 15

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials in simulator/.env")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


# ---------------------------------
# 2. FETCH ALL ROOMS
# ---------------------------------

def fetch_rooms():
    response = (
        supabase
        .table("Rooms")
        .select("id, room_no, floor_id, capacity")
        .order("id")
        .execute()
    )

    rooms = response.data

    if len(rooms) != EXPECTED_ROOMS:
        raise ValueError(
            f"Expected {EXPECTED_ROOMS} rooms, found {len(rooms)}"
        )

    for room in rooms:
        if not isinstance(room.get("capacity"), (int, float)):
            raise ValueError(
                f"Invalid capacity for room {room['room_no']}"
            )

        if room["capacity"] <= 0:
            raise ValueError(
                f"Non-positive capacity for room {room['room_no']}"
            )

    print(f"Successfully loaded {len(rooms)} rooms.")
    return rooms


# ---------------------------------
# 3. SIMULATE OCCUPANCY
# ---------------------------------

def generate_occupancy(capacity, current_time, mode=REALISTIC_MODE):

    capacity = int(capacity)

    weekday = current_time.weekday() < 5
    hour = current_time.hour

    if mode == REALISTIC_MODE:
        if weekday and 8 <= hour < 17:
            active_probability = 0.75
        elif weekday and (7 <= hour < 8 or 17 <= hour < 19):
            active_probability = 0.30
        elif not weekday and 9 <= hour < 17:
            active_probability = 0.20
        else:
            active_probability = 0.05

    elif mode == DEMO_MODE:
        if 8 <= hour < 17:
            active_probability = 0.95
        elif 17 <= hour < 22:
            active_probability = 0.75
        elif 6 <= hour < 8:
            active_probability = 0.50
        else:
            active_probability = 0.40

    else:
        raise ValueError(f"Invalid simulation mode: {mode}")

    if random.random() < active_probability:
        minimum = max(1, int(capacity * 0.20))
        occupancy = random.randint(minimum, capacity)
    else:
        occupancy = 0

    return occupancy


# ---------------------------------
# 4. GENERATE SENSOR READINGS
# ---------------------------------

def generate_reading(room, current_time, mode=REALISTIC_MODE):

    capacity = int(room["capacity"])

    occupancy = generate_occupancy(
        capacity,
        current_time,
        mode
    )

    temperature = round(
        random.uniform(22.0, 25.0) + occupancy * 0.025,
        2
    )

    humidity = round(random.uniform(35.0, 65.0), 2)

    co2 = int(
        420 + occupancy * 18 + random.uniform(-30, 80)
    )
    co2 = max(400, co2)

    if occupancy > 0:
        energy_kw = round(
            random.uniform(1.2, 2.0) + occupancy * 0.035,
            2
        )
    else:
        energy_kw = round(random.uniform(0.3, 1.0), 2)

    return {
        "room_id": room["id"],
        "occupancy": occupancy,
        "temperature": temperature,
        "humidity": humidity,
        "co2": co2,
        "energy_kw": energy_kw,
        "recorded_at": datetime.now(timezone.utc).isoformat()
    }


# ---------------------------------
# 5. VALIDATE SENSOR READINGS
# ---------------------------------

def validate_reading(reading, room):

    capacity = int(room["capacity"])

    checks = {
        "occupancy": (
            isinstance(reading["occupancy"], int)
            and 0 <= reading["occupancy"] <= capacity
        ),

        "temperature": (
            MIN_TEMPERATURE
            <= reading["temperature"]
            <= MAX_TEMPERATURE
        ),

        "humidity": (
            MIN_HUMIDITY
            <= reading["humidity"]
            <= MAX_HUMIDITY
        ),

        "co2": (
            MIN_CO2
            <= reading["co2"]
            <= MAX_CO2
        ),

        "energy_kw": (
            0 <= reading["energy_kw"] <= MAX_ROOM_POWER_KW
        )
    }

    invalid_fields = [
        field for field, valid in checks.items()
        if not valid
    ]

    return len(invalid_fields) == 0, invalid_fields


# ---------------------------------
# 6. INSERT VALID READINGS
# ---------------------------------

def insert_readings(rooms, mode=REALISTIC_MODE):

    current_time = datetime.now().astimezone()

    valid_readings = []
    rejected_count = 0

    for room in rooms:

        reading = generate_reading(
            room,
            current_time,
            mode
        )

        is_valid, invalid_fields = validate_reading(
            reading,
            room
        )

        if is_valid:
            valid_readings.append(reading)

        else:
            rejected_count += 1

            print(
                f"REJECTED: Room {room['room_no']} | "
                f"Invalid fields: {', '.join(invalid_fields)}"
            )

    inserted_count = 0

    if valid_readings:
        response = (
            supabase
            .table("telemetry_readings")
            .insert(valid_readings)
            .execute()
        )

        inserted_count = len(response.data or [])

    total_occupancy = sum(
        reading["occupancy"]
        for reading in valid_readings
    )

    total_energy = sum(
        reading["energy_kw"]
        for reading in valid_readings
    )

    print(
        f"\n[{current_time.strftime('%Y-%m-%d %H:%M:%S')}] "
        f"Simulation mode: {mode.upper()}"
    )

    print(f"Valid readings: {inserted_count}")
    print(f"Rejected readings: {rejected_count}")
    print(f"Total occupancy: {total_occupancy}")
    print(f"Combined power load: {total_energy:.2f} kW")
    print("-" * 50)


# ---------------------------------
# 7. CONTINUOUS SIMULATOR
# ---------------------------------

def main():

    print("=" * 50)
    print("CAMPUS TWIN ENERGYMIND")
    print("PYTHON IOT SIMULATOR")
    print("=" * 50)

    print("\nSelect Simulation Mode:")
    print("1. Realistic Mode (time-based occupancy)")
    print("2. Demo Mode (higher occupancy for presentation)")

    choice = input("\nEnter your choice (1/2): ").strip()

    if choice == "1":
        mode = REALISTIC_MODE
    elif choice == "2":
        mode = DEMO_MODE
    else:
        print("Invalid choice. Exiting simulator.")
        return

    print(f"\nSelected Mode: {mode.upper()}")

    rooms = fetch_rooms()

    print("\nSimulator started.")
    print(f"Update interval: {INTERVAL} seconds")
    print("Press CTRL + C to stop.")
    print("-" * 50)

    try:
        while True:

            start_time = time.monotonic()

            insert_readings(rooms, mode)

            elapsed = time.monotonic() - start_time
            sleep_time = max(0, INTERVAL - elapsed)

            time.sleep(sleep_time)

    except KeyboardInterrupt:
        print("\nSimulator stopped by user.")


if __name__ == "__main__":
    main()
