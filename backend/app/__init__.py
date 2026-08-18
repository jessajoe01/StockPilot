from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .config import Config

# db is created here, but not yet attached to any app.
# This lets our models/ files import "db" without circular import issues.
db = SQLAlchemy()

def create_app():
    """
    Application factory: builds and configures the Flask app.
    We use this pattern (instead of a global app) because it's the
    standard, scalable way to structure a Flask project.
    """
    app = Flask(__name__)
    app.config.from_object(Config)

    # Connect our db object to this specific app
    db.init_app(app)

    # Import all models so SQLAlchemy knows about every table.
    # This must happen AFTER db.init_app(app) and INSIDE this function
    # to avoid circular import errors.
    with app.app_context():
        from app import models

    # Allow the React frontend (running on a different port) to call this API
    CORS(app)

    # Set up JWT authentication (used later in the Auth module)
    JWTManager(app)

    # Register the auth routes (register/login) under /api/auth/...
    from app.routes.auth_routes import auth_bp
    app.register_blueprint(auth_bp)

    # Register the category routes under /api/categories/...
    from app.routes.category_routes import category_bp
    app.register_blueprint(category_bp)

    # Register the product routes under /api/products/...
    from app.routes.product_routes import product_bp
    app.register_blueprint(product_bp)

    # Register the supplier routes under /api/suppliers/...
    from app.routes.supplier_routes import supplier_bp
    app.register_blueprint(supplier_bp)

    # Register the customer routes under /api/customers/...
    from app.routes.customer_routes import customer_bp
    app.register_blueprint(customer_bp)

    # Simple test route to confirm the server is alive
    @app.route('/api/health')
    def health_check():
        return {"status": "StockPilot backend is running"}, 200

    return app