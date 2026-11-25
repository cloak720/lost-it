"""Lost-It: campus lost & found portal (Flask REST API)."""
import os

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager

import db
from config import Config
from routes.admin import bp as admin_bp
from routes.auth import bp as auth_bp
from routes.items import bp as items_bp
from routes.messages import bp as messages_bp
from routes.meta import bp as meta_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    CORS(app)
    JWTManager(app)
    db.init_app(app)

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(items_bp, url_prefix="/api/items")
    app.register_blueprint(messages_bp, url_prefix="/api/messages")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(meta_bp, url_prefix="/api")

    @app.get("/uploads/<path:filename>")
    def uploaded_file(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    @app.errorhandler(404)
    def not_found(_e):
        return jsonify(error="Not found"), 404

    @app.errorhandler(413)
    def too_large(_e):
        return jsonify(error="Image is too large (max 5 MB)"), 413

    return app


if __name__ == "__main__":
    create_app().run(debug=True, port=5000)
