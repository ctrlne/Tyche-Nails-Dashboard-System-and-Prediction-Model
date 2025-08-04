# CODE FOR: Python (save as generate_data.py)
# This script populates your database with mock data.
# Make sure to install the required libraries: pip install psycopg2-binary Faker

import psycopg2 # type: ignore
from faker import Faker # type: ignore
import random
from datetime import datetime, timedelta

# --- IMPORTANT: REPLACE WITH YOUR DATABASE CREDENTIALS ---
DB_HOST = "localhost"
DB_NAME = "salon_db"
DB_USER = "postgres"
DB_PASS = "Aug081978"
# ---------------------------------------------------------

# --- Configuration ---
NUM_CLIENTS = 150
NUM_APPOINTMENTS = 2500
SERVICES = [("Manicure", 500), ("Pedicure", 600), ("Gel Manicure", 1200), ("Full Set Acrylic", 2000), ("Haircut & Style", 800)]
STAFF = ["Anna", "Maria", "Isabel", "Sofia", "Bea"]
APPOINTMENT_STATUSES = ["Completed", "Completed", "Completed", "Completed", "Cancelled", "No-Show"] # Weighted for more completed

def create_connection():
    """Create a database connection."""
    conn = None
    try:
        conn = psycopg2.connect(host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASS)
        print("Database connection successful.")
    except psycopg2.OperationalError as e:
        print(f"Could not connect to the database: {e}")
    return conn

def generate_data():
    conn = create_connection()
    if not conn:
        return

    cur = conn.cursor()
    fake = Faker()

    # 1. Generate Clients
    client_ids = []
    print(f"Generating {NUM_CLIENTS} clients...")
    for _ in range(NUM_CLIENTS):
        client_name = fake.name()
        first_visit = datetime.now() - timedelta(days=random.randint(30, 730))
        cur.execute(
            "INSERT INTO clients (client_name, first_visit_date) VALUES (%s, %s) RETURNING client_id;",
            (client_name, first_visit)
        )
        client_id = cur.fetchone()[0]
        client_ids.append(client_id)
    print("Clients generated.")

    # 2. Generate Appointments
    print(f"Generating {NUM_APPOINTMENTS} appointments...")
    for _ in range(NUM_APPOINTMENTS):
        client_id = random.choice(client_ids)
        service, price = random.choice(SERVICES)
        staff = random.choice(STAFF)
        status = random.choice(APPOINTMENT_STATUSES)

        # Generate realistic appointment and booking times
        appointment_date = datetime.now() - timedelta(days=random.randint(0, 365))
        appointment_hour = random.randint(9, 18) # 9 AM to 6 PM
        appointment_time = appointment_date.replace(hour=appointment_hour, minute=0, second=0, microsecond=0)
        booking_time = appointment_time - timedelta(days=random.randint(1, 30))

        cur.execute(
            """
            INSERT INTO appointments (client_id, service, staff, appointment_time, booking_time, status, price)
            VALUES (%s, %s, %s, %s, %s, %s, %s);
            """,
            (client_id, service, staff, appointment_time, booking_time, status, price)
        )
    print("Appointments generated.")

    # Commit changes and close connection
    conn.commit()
    cur.close()
    conn.close()
    print("Data generation complete and connection closed.")

if __name__ == '__main__':
    generate_data()