"""Register, log in, and fetch the current user."""
import re

from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from werkzeug.security import check_password_hash, generate_password_hash

from db import execute, query

bp = Blueprint("auth", __name__)

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def public_user(user):
    return {"id": user["id"], "name": user["name"], "email": user["email"], "phone": user["phone"]}


def token_response(user, status=200):
    token = create_access_token(identity=str(user["id"]))
    return jsonify(token=token, user=public_user(user)), status


@bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    phone = (data.get("phone") or "").strip() or None

    if len(name) < 2:
        return jsonify(error="Please enter your name"), 400
    if not EMAIL_RE.match(email):
        return jsonify(error="Please enter a valid email"), 400
    if len(password) < 6:
        return jsonify(error="Password must be at least 6 characters"), 400
    if query("SELECT id FROM users WHERE email = %s", (email,), one=True):
        return jsonify(error="An account with this email already exists"), 409

    user_id = execute(
        "INSERT INTO users (name, email, password_hash, phone) VALUES (%s, %s, %s, %s)",
        (name, email, generate_password_hash(password), phone),
    )
    user = query("SELECT * FROM users WHERE id = %s", (user_id,), one=True)
    return token_response(user, 201)


@bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = query("SELECT * FROM users WHERE email = %s", (email,), one=True)
    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify(error="Wrong email or password"), 401
    return token_response(user)


@bp.get("/me")
@jwt_required()
def me():
    user = query("SELECT * FROM users WHERE id = %s", (int(get_jwt_identity()),), one=True)
    if not user:
        return jsonify(error="User not found"), 404
    return jsonify(user=public_user(user))
