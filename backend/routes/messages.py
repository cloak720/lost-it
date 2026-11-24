"""In-app messages so people can contact an item's owner without sharing phone numbers."""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from db import execute, query

bp = Blueprint("messages", __name__)


@bp.get("")
@jwt_required()
def my_messages():
    """All messages I sent or received, oldest first. The frontend groups them into chats."""
    me = int(get_jwt_identity())
    rows = query(
        """SELECT m.id, m.item_id, m.sender_id, m.receiver_id, m.body, m.is_read, m.created_at,
                  i.title AS item_title, i.type AS item_type,
                  s.name AS sender_name, r.name AS receiver_name
           FROM messages m
           JOIN items i ON i.id = m.item_id
           JOIN users s ON s.id = m.sender_id
           JOIN users r ON r.id = m.receiver_id
           WHERE m.sender_id = %s OR m.receiver_id = %s
           ORDER BY m.created_at, m.id""",
        (me, me),
    )
    for r in rows:
        r["created_at"] = r["created_at"].isoformat()
        r["is_read"] = bool(r["is_read"])
    return jsonify(messages=rows)


@bp.get("/unread-count")
@jwt_required()
def unread_count():
    row = query(
        "SELECT COUNT(*) AS n FROM messages WHERE receiver_id = %s AND is_read = FALSE",
        (int(get_jwt_identity()),), one=True,
    )
    return jsonify(count=row["n"])


@bp.post("")
@jwt_required()
def send_message():
    me = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    body = (data.get("body") or "").strip()
    item = query("SELECT id, user_id FROM items WHERE id = %s", (data.get("item_id"),), one=True)

    if not item:
        return jsonify(error="Item not found"), 404
    if not 1 <= len(body) <= 1000:
        return jsonify(error="Message must be 1 to 1000 characters"), 400

    if item["user_id"] != me:
        # Someone contacting the owner
        receiver_id = item["user_id"]
    else:
        # The owner replying to someone who wrote to them about this item
        receiver_id = data.get("receiver_id")
        wrote_before = query(
            "SELECT id FROM messages WHERE item_id = %s AND sender_id = %s AND receiver_id = %s LIMIT 1",
            (item["id"], receiver_id, me), one=True,
        )
        if not wrote_before:
            return jsonify(error="You can only reply to people who contacted you"), 400

    message_id = execute(
        "INSERT INTO messages (item_id, sender_id, receiver_id, body) VALUES (%s, %s, %s, %s)",
        (item["id"], me, receiver_id, body),
    )
    return jsonify(id=message_id, receiver_id=receiver_id), 201


@bp.post("/read")
@jwt_required()
def mark_read():
    data = request.get_json(silent=True) or {}
    execute(
        "UPDATE messages SET is_read = TRUE WHERE item_id = %s AND sender_id = %s AND receiver_id = %s",
        (data.get("item_id"), data.get("other_id"), int(get_jwt_identity())),
    )
    return jsonify(ok=True)
