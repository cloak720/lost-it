"""Role-based access control using custom Python decorators.

    @user_required   -> must be logged in AND not blocked
    @admin_required  -> must be logged in, not blocked, AND have role 'admin'

The user's role and status are read from the database on every request
(not trusted from the token), so blocking or demoting someone works instantly.
The logged-in user is stored in flask.g.user for the route to use.
"""
from functools import wraps

from flask import g, jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

from db import query


def load_current_user():
    return query(
        "SELECT id, name, email, phone, role, is_active FROM users WHERE id = %s",
        (int(get_jwt_identity()),),
        one=True,
    )


def user_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()  # 401 if the token is missing or invalid
        user = load_current_user()
        if not user:
            return jsonify(error="Account not found"), 401
        if not user["is_active"]:
            return jsonify(error="Your account has been blocked by an admin"), 403
        g.user = user
        return fn(*args, **kwargs)

    return wrapper


def admin_required(fn):
    @wraps(fn)
    @user_required
    def wrapper(*args, **kwargs):
        if g.user["role"] != "admin":
            return jsonify(error="Admins only"), 403
        return fn(*args, **kwargs)

    return wrapper


def is_admin():
    return g.get("user") is not None and g.user["role"] == "admin"
