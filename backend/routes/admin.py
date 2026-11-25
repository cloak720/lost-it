"""Admin-only API: dashboard stats, user management, categories & locations.

Every route here is protected by the @admin_required decorator.
(Admins delete/close any item through the normal /api/items routes.)
"""
from flask import Blueprint, g, jsonify, request
from pymysql.err import IntegrityError

from auth_utils import admin_required
from db import execute, query

bp = Blueprint("admin", __name__)


# ---------- Dashboard ----------

@bp.get("/stats")
@admin_required
def dashboard():
    totals = query(
        """SELECT
             (SELECT COUNT(*) FROM users)                              AS users,
             (SELECT COUNT(*) FROM users WHERE is_active = FALSE)      AS blocked,
             (SELECT COUNT(*) FROM items)                              AS items,
             (SELECT COUNT(*) FROM items WHERE status = 'resolved')    AS resolved,
             (SELECT COUNT(*) FROM messages)                           AS messages""",
        one=True,
    )
    by_category = query(
        """SELECT c.name, c.icon,
                  COALESCE(SUM(i.type = 'lost'), 0)  AS lost,
                  COALESCE(SUM(i.type = 'found'), 0) AS found
           FROM categories c
           LEFT JOIN items i ON i.category_id = c.id
           GROUP BY c.id, c.name, c.icon
           ORDER BY COUNT(i.id) DESC, c.id"""
    )
    hotspots = query(
        """SELECT l.name, COUNT(i.id) AS total
           FROM locations l
           JOIN items i ON i.location_id = l.id
           GROUP BY l.id, l.name
           ORDER BY total DESC
           LIMIT 6"""
    )
    for row in by_category:
        row["lost"], row["found"] = int(row["lost"]), int(row["found"])
    totals = {k: int(v) for k, v in totals.items()}
    totals["return_rate"] = round(100 * totals["resolved"] / totals["items"]) if totals["items"] else 0
    return jsonify(totals=totals, by_category=by_category, hotspots=hotspots)


# ---------- Users ----------

@bp.get("/users")
@admin_required
def list_users():
    users = query(
        """SELECT u.id, u.name, u.email, u.role, u.is_active, u.created_at,
                  COUNT(i.id) AS items
           FROM users u
           LEFT JOIN items i ON i.user_id = u.id
           GROUP BY u.id
           ORDER BY u.created_at DESC, u.id DESC"""
    )
    for u in users:
        u["is_active"] = bool(u["is_active"])
        u["created_at"] = u["created_at"].isoformat()
    return jsonify(users=users)


@bp.patch("/users/<int:user_id>")
@admin_required
def update_user(user_id):
    """Block/unblock a user or change their role: {"is_active": false} or {"role": "admin"}."""
    if user_id == g.user["id"]:
        return jsonify(error="You can't change your own account here"), 400
    if not query("SELECT id FROM users WHERE id = %s", (user_id,), one=True):
        return jsonify(error="User not found"), 404

    data = request.get_json(silent=True) or {}
    if "is_active" in data:
        execute("UPDATE users SET is_active = %s WHERE id = %s", (bool(data["is_active"]), user_id))
    if "role" in data:
        if data["role"] not in ("user", "admin"):
            return jsonify(error="Role must be 'user' or 'admin'"), 400
        execute("UPDATE users SET role = %s WHERE id = %s", (data["role"], user_id))
    return jsonify(ok=True)


# ---------- Categories & locations ----------
# Both tables work the same way, so one set of helpers serves both.

TABLES = {
    "categories": ("name", "icon"),
    "locations": ("name",),
}


def clean_fields(table, data):
    values = {}
    for field in TABLES[table]:
        value = (data.get(field) or "").strip()
        if not value:
            return None, f"'{field}' is required"
        values[field] = value[:80]
    return values, None


@bp.post("/<any(categories, locations):table>")
@admin_required
def add_lookup(table):
    values, error = clean_fields(table, request.get_json(silent=True) or {})
    if error:
        return jsonify(error=error), 400
    columns = ", ".join(values)
    placeholders = ", ".join(["%s"] * len(values))
    try:
        new_id = execute(f"INSERT INTO {table} ({columns}) VALUES ({placeholders})", tuple(values.values()))
    except IntegrityError:
        return jsonify(error="That name already exists"), 409
    return jsonify(id=new_id, **values), 201


@bp.delete("/<any(categories, locations):table>/<int:row_id>")
@admin_required
def delete_lookup(table, row_id):
    column = "category_id" if table == "categories" else "location_id"
    in_use = query(f"SELECT COUNT(*) AS n FROM items WHERE {column} = %s", (row_id,), one=True)["n"]
    if in_use:
        return jsonify(error=f"Can't delete: {in_use} item(s) still use it"), 409
    execute(f"DELETE FROM {table} WHERE id = %s", (row_id,))
    return jsonify(ok=True)
