"""Create the database and all tables from schema.sql.

Usage:  python init_db.py
WARNING: this drops existing Lost-It tables and starts fresh.
"""
import os

from config import BASE_DIR, Config
from db import connect


def run_schema():
    with open(os.path.join(BASE_DIR, "schema.sql"), encoding="utf-8") as f:
        lines = [line for line in f if not line.strip().startswith("--")]
    statements = [s.strip() for s in "".join(lines).split(";") if s.strip()]

    conn = connect(use_database=False)
    with conn.cursor() as cur:
        cur.execute(
            f"CREATE DATABASE IF NOT EXISTS `{Config.MYSQL_DATABASE}` "
            "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
        )
        cur.execute(f"USE `{Config.MYSQL_DATABASE}`")
        for statement in statements:
            cur.execute(statement)
    conn.close()
    print(f"Database '{Config.MYSQL_DATABASE}' is ready ({len(statements)} statements run).")


if __name__ == "__main__":
    run_schema()
