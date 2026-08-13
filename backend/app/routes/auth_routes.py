from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from app import db
from app.models.user import User

# A "Blueprint" is Flask's way of grouping related routes together.
# All routes here will start with /api/auth/...
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Creates a new user.
    Expects JSON body: { "name": "...", "email": "...", "password": "...", "role": "Admin" }
    """
    data = request.get_json()

    # Basic validation: make sure required fields were actually sent
    if not data or not data.get('name') or not data.get('email') or not data.get('password'):
        return jsonify({"error": "name, email, and password are required"}), 400

    # Check if a user with this email already exists
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({"error": "A user with this email already exists"}), 409

    # Hash the password before storing it — we NEVER store plain-text passwords
    hashed_password = generate_password_hash(data['password'])

    new_user = User(
        name=data['name'],
        email=data['email'],
        password_hash=hashed_password,
        role=data.get('role', 'Staff')  # defaults to 'Staff' if not provided
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "message": "User registered successfully",
        "user": new_user.to_dict()
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Logs a user in.
    Expects JSON body: { "email": "...", "password": "..." }
    Returns a JWT access token if credentials are correct.
    """
    data = request.get_json()

    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "email and password are required"}), 400

    user = User.query.filter_by(email=data['email']).first()

    # Check both: does the user exist, AND does the password match the stored hash
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({"error": "Invalid email or password"}), 401

    if user.status == 'Inactive':
        return jsonify({"error": "This account has been deactivated"}), 403

    # Create a JWT token. We store the user's id and role inside it,
    # so later routes can check "who is this?" and "what are they allowed to do?"
    access_token = create_access_token(
        identity=str(user.user_id),
        additional_claims={"role": user.role, "name": user.name}
    )

    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": user.to_dict()
    }), 200