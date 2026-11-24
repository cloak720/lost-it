"""Tiny MySQL helper built on PyMySQL.

Every request gets its own connection (stored on Flask's `g`),
which is closed automatically when the request ends.
"""
import pymysql
from flask import g

from config import Config


def connect(use_database=True):
    """Open a new MySQL connection that returns rows as dictionaries."""
    return pymysql.connect(
        host=Config.MYSQL_HOST,
        port=Config.MYSQL_PORT,
        user=Config.MYSQL_USER,
        password=Config.MYSQL_PASSWORD,
        database=Config.MYSQL_DATABASE if use_database else None,
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True,
    )


def get_db():
    if "db" not in g:
        g.db = connect()
    return g.db


def query(sql, args=(), one=False):
    """Run a SELECT and return a list of rows (or a single row if one=True)."""
    with get_db().cursor() as cur:
        cur.execute(sql, args)
        rows = cur.fetchall()
    if one:
        return rows[0] if rows else None
    return rows


def execute(sql, args=()):
    """Run an INSERT / UPDATE / DELETE and return the new row id."""
    with get_db().cursor() as cur:
        cur.execute(sql, args)
        return cur.lastrowid


def close_db(_exc=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_app(app):
    app.teardown_appcontext(close_db)
