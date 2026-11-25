"""Lookup lists for forms, home page stats, and the Found Room shelves."""
from flask import Blueprint, jsonify

from db import query
from routes.items import ITEM_SELECT, to_json

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


@bp.get("/found-room")
def found_room():
    """One box per category: how many open found items it holds + a few to peek at."""
    boxes = query(
        """SELECT c.id, c.name, c.icon, COUNT(i.id) AS count
           FROM categories c
           LEFT JOIN items i
                  ON i.category_id = c.id AND i.type = 'found' AND i.status = 'open'
           GROUP BY c.id, c.name, c.icon
           ORDER BY count DESC, c.id"""
    )
    found = query(ITEM_SELECT + " WHERE i.type = 'found' AND i.status = 'open' ORDER BY i.created_at DESC")
    for box in boxes:
        box["count"] = int(box["count"])
        box["previews"] = [to_json(r) for r in found if r["category_id"] == box["id"]][:3]
    return jsonify(boxes=boxes)
