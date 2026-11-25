"""Lost & found items: browse, post, view, match, resolve, delete."""
import os
import uuid
from datetime import date

from flask import Blueprint, current_app, g, jsonify, request

from auth_utils import is_admin, user_required
from db import execute, query
from routes.matching import rank_matches

bp = Blueprint("items", __name__)

ITEM_SELECT = """
    SELECT i.id, i.type, i.title, i.description, i.item_date, i.image, i.reward, i.status,
           i.created_at, i.user_id, u.name AS owner_name,
           c.id AS category_id, c.name AS category, c.icon AS category_icon,
           l.id AS location_id, l.name AS location
    FROM items i
    JOIN users u      ON u.id = i.user_id
    JOIN categories c ON c.id = i.category_id
    JOIN locations l  ON l.id = i.location_id
"""


def to_json(row):
    """Convert a DB row into JSON-friendly data."""
    data = dict(row)
    data["item_date"] = row["item_date"].isoformat()
    data["created_at"] = row["created_at"].isoformat()
    data["image_url"] = f"/uploads/{row['image']}" if row["image"] else None
    data.pop("image")
    return data


def get_item(item_id):
    return query(ITEM_SELECT + " WHERE i.id = %s", (item_id,), one=True)


def can_manage(item):
    """The person who posted an item, or any admin, may close or delete it."""
    return item["user_id"] == g.user["id"] or is_admin()


def save_image(file):
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in current_app.config["ALLOWED_EXTENSIONS"]:
        return None
    filename = f"{uuid.uuid4().hex}.{ext}"
    file.save(os.path.join(current_app.config["UPLOAD_FOLDER"], filename))
    return filename


@bp.get("")
def list_items():
    """Browse items with optional filters: ?type=&category=&location=&q=&status="""
    where, args = [], []

    status = request.args.get("status", "open")
    if status in ("open", "resolved"):
        where.append("i.status = %s")
        args.append(status)

    item_type = request.args.get("type")
    if item_type in ("lost", "found"):
        where.append("i.type = %s")
        args.append(item_type)

    for param, column in (("category", "i.category_id"), ("location", "i.location_id")):
        value = request.args.get(param, type=int)
        if value:
            where.append(f"{column} = %s")
            args.append(value)

    search = (request.args.get("q") or "").strip()
    if search:
        where.append("(i.title LIKE %s OR i.description LIKE %s)")
        args += [f"%{search}%", f"%{search}%"]

    limit = min(request.args.get("limit", 60, type=int), 200)
    sql = ITEM_SELECT
    if where:
        sql += " WHERE " + " AND ".join(where)
    sql += " ORDER BY i.created_at DESC, i.id DESC LIMIT %s"
    rows = query(sql, (*args, limit))
    return jsonify(items=[to_json(r) for r in rows])


@bp.get("/mine")
@user_required
def my_items():
    rows = query(ITEM_SELECT + " WHERE i.user_id = %s ORDER BY i.created_at DESC, i.id DESC",
                 (g.user["id"],))
    return jsonify(items=[to_json(r) for r in rows])


@bp.get("/<int:item_id>")
def item_detail(item_id):
    item = get_item(item_id)
    if not item:
        return jsonify(error="Item not found"), 404
    return jsonify(item=to_json(item))


@bp.get("/<int:item_id>/matches")
def item_matches(item_id):
    item = get_item(item_id)
    if not item:
        return jsonify(error="Item not found"), 404

    opposite = "found" if item["type"] == "lost" else "lost"
    candidates = query(
        ITEM_SELECT
        + """ WHERE i.type = %s AND i.category_id = %s AND i.status = 'open'
              AND i.user_id <> %s
              AND i.item_date BETWEEN %s - INTERVAL 30 DAY AND %s + INTERVAL 30 DAY""",
        (opposite, item["category_id"], item["user_id"], item["item_date"], item["item_date"]),
    )
    matches = rank_matches(item, candidates)
    for m in matches:
        m["item"] = to_json(m["item"])
    return jsonify(matches=matches)


@bp.post("")
@user_required
def create_item():
    form = request.form
    item_type = form.get("type")
    title = (form.get("title") or "").strip()
    description = (form.get("description") or "").strip()
    reward = (form.get("reward") or "").strip() or None
    category_id = form.get("category_id", type=int)
    location_id = form.get("location_id", type=int)

    if item_type not in ("lost", "found"):
        return jsonify(error="Choose whether you lost or found the item"), 400
    if not 3 <= len(title) <= 120:
        return jsonify(error="Title must be 3 to 120 characters"), 400
    if not query("SELECT id FROM categories WHERE id = %s", (category_id,), one=True):
        return jsonify(error="Choose a category"), 400
    if not query("SELECT id FROM locations WHERE id = %s", (location_id,), one=True):
        return jsonify(error="Choose a location"), 400
    try:
        item_date = date.fromisoformat(form.get("item_date", ""))
    except ValueError:
        return jsonify(error="Enter a valid date"), 400
    if item_date > date.today():
        return jsonify(error="Date cannot be in the future"), 400
    if item_type == "found":
        reward = None  # only lost items carry a reward
    elif reward and len(reward) > 60:
        return jsonify(error="Keep the reward under 60 characters"), 400

    image = None
    file = request.files.get("image")
    if file and file.filename:
        image = save_image(file)
        if not image:
            return jsonify(error="Image must be PNG, JPG, GIF or WEBP"), 400

    item_id = execute(
        """INSERT INTO items (user_id, type, title, description, category_id, location_id, item_date, image, reward)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
        (g.user["id"], item_type, title, description, category_id, location_id, item_date, image, reward),
    )
    return jsonify(item=to_json(get_item(item_id))), 201


@bp.patch("/<int:item_id>/status")
@user_required
def update_status(item_id):
    item = get_item(item_id)
    if not item:
        return jsonify(error="Item not found"), 404
    if not can_manage(item):
        return jsonify(error="Only the owner or an admin can change this item"), 403

    status = (request.get_json(silent=True) or {}).get("status")
    if status not in ("open", "resolved"):
        return jsonify(error="Status must be 'open' or 'resolved'"), 400
    execute("UPDATE items SET status = %s WHERE id = %s", (status, item_id))
    return jsonify(item=to_json(get_item(item_id)))


@bp.delete("/<int:item_id>")
@user_required
def delete_item(item_id):
    item = get_item(item_id)
    if not item:
        return jsonify(error="Item not found"), 404
    if not can_manage(item):
        return jsonify(error="Only the owner or an admin can delete this item"), 403

    execute("DELETE FROM items WHERE id = %s", (item_id,))
    if item["image"]:
        path = os.path.join(current_app.config["UPLOAD_FOLDER"], item["image"])
        if os.path.exists(path):
            os.remove(path)
    return jsonify(ok=True)
