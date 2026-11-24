"""Lookup lists for forms and simple stats for the home page."""
from flask import Blueprint, jsonify

from db import query

bp = Blueprint("meta", __name__)


@bp.get("/meta")
def meta():
    return jsonify(
        categories=query("SELECT id, name, icon FROM categories ORDER BY id"),
        locations=query("SELECT id, name FROM locations ORDER BY id"),
    )


@bp.get("/stats")
def stats():
    row = query(
        """SELECT COUNT(*) AS total,
                  COALESCE(SUM(type = 'lost' AND status = 'open'), 0)  AS lost,
                  COALESCE(SUM(type = 'found' AND status = 'open'), 0) AS found,
                  COALESCE(SUM(status = 'resolved'), 0)                AS resolved
           FROM items""",
        one=True,
    )
    users = query("SELECT COUNT(*) AS n FROM users", one=True)["n"]
    return jsonify(
        total=int(row["total"]),
        lost=int(row["lost"]),
        found=int(row["found"]),
        resolved=int(row["resolved"]),
        users=users,
    )
