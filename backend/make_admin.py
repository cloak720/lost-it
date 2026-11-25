"""Promote an existing account to admin.

Usage:  python make_admin.py someone@campus.edu
"""
import sys

from db import connect


def make_admin(email):
    conn = connect()
    with conn.cursor() as cur:
        updated = cur.execute("UPDATE users SET role = 'admin' WHERE email = %s", (email.strip().lower(),))
    conn.close()
    if updated:
        print(f"{email} is now an admin. Log out and back in to see the Admin page.")
    else:
        print(f"No account found for {email} (or it is already an admin).")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python make_admin.py someone@campus.edu")
        sys.exit(1)
    make_admin(sys.argv[1])
