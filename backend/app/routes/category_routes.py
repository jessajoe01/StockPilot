from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.category import Category

category_bp = Blueprint('category', __name__, url_prefix='/api/categories')


@category_bp.route('', methods=['GET'])
@jwt_required()
def get_categories():
    """
    Returns categories, optionally filtered by query parameters:
    - ?search=xyz       -> matches category_name containing 'xyz' (case-insensitive)
    - ?status=Active    -> only categories with this status
    Example: /api/categories?search=elec&status=Active
    """
    query = Category.query

    search_term = request.args.get('search')
    if search_term:
        query = query.filter(Category.category_name.ilike(f'%{search_term}%'))

    status_filter = request.args.get('status')
    if status_filter:
        query = query.filter(Category.status == status_filter)

    categories = query.all()
    return jsonify([c.to_dict() for c in categories]), 200


@category_bp.route('/<int:category_id>', methods=['GET'])
@jwt_required()
def get_category(category_id):
    """Returns a single category by its id."""
    category = Category.query.get(category_id)
    if not category:
        return jsonify({"error": "Category not found"}), 404
    return jsonify(category.to_dict()), 200


@category_bp.route('', methods=['POST'])
@jwt_required()
def create_category():
    """Creates a new category. Expects JSON: { "category_name": "...", "description": "..." }"""
    data = request.get_json()

    if not data or not data.get('category_name'):
        return jsonify({"error": "category_name is required"}), 400

    existing = Category.query.filter(Category.category_name.ilike(data['category_name'])).first()
    if existing:
        return jsonify({"error": "A category with this name already exists"}), 409

    new_category = Category(
        category_name=data['category_name'],
        description=data.get('description')
    )
    db.session.add(new_category)
    db.session.commit()

    return jsonify({
        "message": "Category created successfully",
        "category": new_category.to_dict()
    }), 201


@category_bp.route('/<int:category_id>', methods=['PUT'])
@jwt_required()
def update_category(category_id):
    """Updates an existing category. Only sends fields that are provided."""
    category = Category.query.get(category_id)
    if not category:
        return jsonify({"error": "Category not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    if 'category_name' in data:
        category.category_name = data['category_name']
    if 'description' in data:
        category.description = data['description']
    if 'status' in data:
        category.status = data['status']

    db.session.commit()

    return jsonify({
        "message": "Category updated successfully",
        "category": category.to_dict()
    }), 200


@category_bp.route('/<int:category_id>/toggle-status', methods=['PATCH'])
@jwt_required()
def toggle_category_status(category_id):
    """
    Flips a category between Active and Inactive with a single call —
    no need to know or send the current status, it just switches.
    """
    category = Category.query.get(category_id)
    if not category:
        return jsonify({"error": "Category not found"}), 404

    category.status = 'Inactive' if category.status == 'Active' else 'Active'
    db.session.commit()

    return jsonify({
        "message": f"Category status changed to {category.status}",
        "category": category.to_dict()
    }), 200


@category_bp.route('/<int:category_id>', methods=['DELETE'])
@jwt_required()
def delete_category(category_id):
    """Deletes a category. Products under it will have category_id set to NULL (per our schema)."""
    category = Category.query.get(category_id)
    if not category:
        return jsonify({"error": "Category not found"}), 404

    db.session.delete(category)
    db.session.commit()

    return jsonify({"message": "Category deleted successfully"}), 200