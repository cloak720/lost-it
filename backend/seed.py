"""Add demo users, items and messages so the app looks alive during a demo,
and create (or update) the admin account from the values in .env.

Usage:  python seed.py   (run after init_db.py)
Demo student accounts use the password:  demo1234
The admin's name, email and password come from ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD in .env
"""
from datetime import date, timedelta

from werkzeug.security import generate_password_hash

from config import Config
from db import connect

DEMO_PASSWORD = "demo1234"

# (name, email, phone)
STUDENTS = [
    ("Asha Menon", "asha@campus.edu", "9800000001"),
    ("Rahul Nair", "rahul@campus.edu", "9800000002"),
    ("Fathima K", "fathima@campus.edu", "9800000003"),
    ("Arjun Das", "arjun@campus.edu", None),
]

# (student index, type, title, description, category, location, days ago, status, reward)
ITEMS = [
    (0, "lost", "Black JBL wireless earphones", "Black JBL earbuds in a small black case. Left them on a reading table.", "Electronics", "Main Library", 2, "open", "₹500"),
    (1, "found", "Black wireless earbuds in case", "Found black earbuds with a charging case on a table near the window.", "Electronics", "Main Library", 1, "open", None),
    (2, "lost", "Student ID card - MCA 1st year", "Blue lanyard with my college ID card. Name: Fathima K.", "ID Cards & Documents", "Central Canteen", 3, "open", "A canteen meal"),
    (3, "found", "ID card with blue lanyard", "College ID card on a blue lanyard, found under a canteen table.", "ID Cards & Documents", "Central Canteen", 2, "open", None),
    (1, "lost", "Bike keys with red keychain", "Honda key with a red rubber keychain and one small locker key.", "Keys", "Parking Area", 4, "open", "₹200"),
    (0, "found", "Set of keys", "Two keys on a red keychain, found near the bike stand.", "Keys", "Parking Area", 3, "open", None),
    (3, "lost", "Grey Wildcraft backpack", "Grey backpack with a laptop charger and a DBMS notebook inside.", "Bags", "Auditorium", 6, "open", "₹1,000"),
    (2, "found", "Steel water bottle", "Silver Milton steel bottle left on the bench.", "Bottles & Lunch Boxes", "Sports Ground", 1, "open", None),
    (0, "lost", "Python programming textbook", "Python Crash Course book with my name written on the first page.", "Books & Notes", "Computer Lab", 5, "open", None),
    (1, "found", "Brown leather wallet", "Brown wallet with some cash, no ID inside. Handed to the admin office.", "Wallets & Money", "Bus Stop", 8, "open", None),
    (3, "lost", "Casio digital watch", "Black Casio watch, lost during football practice.", "Accessories", "Sports Ground", 10, "resolved", "₹300"),
    (2, "lost", "Navy blue hoodie", "Navy hoodie with the college logo, size M.", "Clothing", "Classroom Block", 7, "open", "Eternal gratitude"),
    (3, "found", "Black umbrella", "Foldable black umbrella left in the corridor.", "Other", "Classroom Block", 2, "open", None),
    (0, "found", "Scientific calculator", "Casio fx-991ES calculator found after the maths exam.", "Electronics", "Classroom Block", 4, "open", None),
    (2, "found", "Grey cotton jacket", "Grey zip-up jacket left on a chair.", "Clothing", "Auditorium", 3, "open", None),
    (1, "found", "Lab record notebook", "Physics lab record, blue cover, no name on the front.", "Books & Notes", "Computer Lab", 2, "open", None),
]

MESSAGES = [
    # (item index, sender index, receiver index, body)
    (1, 0, 1, "Hi! I think those are my JBL earbuds. Is there a small scratch on the case?"),
    (1, 1, 0, "Yes, there is a scratch on the lid. You can collect them from the library desk."),
]


def seed_demo_data(cur):
    cur.execute("SELECT id FROM users WHERE email = %s", (STUDENTS[0][1],))
    if cur.fetchone():
        print("Demo students already exist, skipping demo data. (Run init_db.py first to reset.)")
        return

    cur.execute("SELECT id, name FROM categories")
    categories = {r["name"]: r["id"] for r in cur.fetchall()}
    cur.execute("SELECT id, name FROM locations")
    locations = {r["name"]: r["id"] for r in cur.fetchall()}

    password = generate_password_hash(DEMO_PASSWORD)
    user_ids = []
    for name, email, phone in STUDENTS:
        cur.execute(
            "INSERT INTO users (name, email, password_hash, phone) VALUES (%s, %s, %s, %s)",
            (name, email, password, phone),
        )
        user_ids.append(cur.lastrowid)

    item_ids = []
    for user, kind, title, desc, cat, loc, days_ago, status, reward in ITEMS:
        cur.execute(
            """INSERT INTO items (user_id, type, title, description, category_id, location_id,
                                  item_date, status, reward)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (user_ids[user], kind, title, desc, categories[cat], locations[loc],
             date.today() - timedelta(days=days_ago), status, reward),
        )
        item_ids.append(cur.lastrowid)

    for item, sender, receiver, body in MESSAGES:
        cur.execute(
            "INSERT INTO messages (item_id, sender_id, receiver_id, body) VALUES (%s, %s, %s, %s)",
            (item_ids[item], user_ids[sender], user_ids[receiver], body),
        )
    print(f"Added {len(STUDENTS)} students, {len(ITEMS)} items and {len(MESSAGES)} messages "
          f"(student password: {DEMO_PASSWORD}).")


def ensure_admin(cur):
    """Create the admin from .env, or update its name/password if it already exists."""
    if len(Config.ADMIN_PASSWORD) < 6:
        print("ADMIN_PASSWORD is missing (or shorter than 6 characters) in .env, so no admin was created.")
        return

    password_hash = generate_password_hash(Config.ADMIN_PASSWORD)
    cur.execute("SELECT id FROM users WHERE email = %s", (Config.ADMIN_EMAIL,))
    existing = cur.fetchone()
    if existing:
        cur.execute(
            "UPDATE users SET name = %s, password_hash = %s, role = 'admin', is_active = TRUE WHERE id = %s",
            (Config.ADMIN_NAME, password_hash, existing["id"]),
        )
        print(f"Updated admin '{Config.ADMIN_NAME}' <{Config.ADMIN_EMAIL}>.")
    else:
        cur.execute(
            "INSERT INTO users (name, email, password_hash, role) VALUES (%s, %s, %s, 'admin')",
            (Config.ADMIN_NAME, Config.ADMIN_EMAIL, password_hash),
        )
        print(f"Created admin '{Config.ADMIN_NAME}' <{Config.ADMIN_EMAIL}>.")


if __name__ == "__main__":
    conn = connect()
    with conn.cursor() as cursor:
        seed_demo_data(cursor)
        ensure_admin(cursor)
    conn.close()
