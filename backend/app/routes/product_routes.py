from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.product import Product
from app.models.inventory import Inventory
from app.models.category import Category
from app.models.supplier import Supplier

product_bp = Blueprint('product', __name__, url_prefix='/api/products')


@product_bp.route('', methods=['GET'])
@jwt_required()
def get_products():
    """
    Returns products, optionally narrowed by query parameters:
    - ?search=xyz          -> matches product_name OR product_code containing 'xyz'
    - ?category_id=2       -> only products in this category
    - ?supplier_id=3       -> only products from this supplier
    - ?status=Active       -> only products with this status
    - ?low_stock=true      -> only products where quantity <= minimum_stock_level
    These can be combined, e.g.:
    /api/products?search=mouse&category_id=1&status=Active
    """
    query = Product.query

    search_term = request.args.get('search')
    if search_term:
        like_pattern = f'%{search_term}%'
        query = query.filter(
            db.or_(
                Product.product_name.ilike(like_pattern),
                Product.product_code.ilike(like_pattern)
            )
        )

    category_id = request.args.get('category_id')
    if category_id:
        query = query.filter(Product.category_id == category_id)

    supplier_id = request.args.get('supplier_id')
    if supplier_id:
        query = query.filter(Product.supplier_id == supplier_id)

    status_filter = request.args.get('status')
    if status_filter:
        query = query.filter(Product.status == status_filter)

    low_stock = request.args.get('low_stock')
    if low_stock and low_stock.lower() == 'true':
        query = query.filter(Product.quantity <= Product.minimum_stock_level)

    products = query.all()
    return jsonify([p.to_dict() for p in products]), 200


@product_bp.route('/<int:product_id>', methods=['GET'])
@jwt_required()
def get_product(product_id):
    """Returns a single product by its id."""
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    return jsonify(product.to_dict()), 200


@product_bp.route('', methods=['POST'])
@jwt_required()
def create_product():
    """
    Creates a new product AND automatically creates its matching inventory row,
    starting at the quantity provided (or 0 if not given).
    """
    data = request.get_json()

    required_fields = ['product_name', 'product_code']
    if not data or not all(data.get(field) for field in required_fields):
        return jsonify({"error": "product_name and product_code are required"}), 400

    existing = Product.query.filter_by(product_code=data['product_code']).first()
    if existing:
        return jsonify({"error": "A product with this product_code already exists"}), 409

    # Validate numeric fields
    if data.get('purchase_price', 0) < 0:
        return jsonify({"error": "purchase_price cannot be negative"}), 400

    if data.get('selling_price', 0) < 0:
        return jsonify({"error": "selling_price cannot be negative"}), 400

    if data.get('quantity', 0) < 0:
        return jsonify({"error": "quantity cannot be negative"}), 400

    if data.get('minimum_stock_level', 5) < 0:
        return jsonify({"error": "minimum_stock_level cannot be negative"}), 400

    if data.get('category_id'):
        category = Category.query.get(data['category_id'])
        if not category:
            return jsonify({"error": "Category not found"}), 404

    if data.get('supplier_id'):
        supplier = Supplier.query.get(data['supplier_id'])
        if not supplier:
            return jsonify({"error": "Supplier not found"}), 404

    starting_quantity = data.get('quantity', 0)

    new_product = Product(
        product_name=data['product_name'],
        product_code=data['product_code'],
        category_id=data.get('category_id'),
        supplier_id=data.get('supplier_id'),
        description=data.get('description'),
        purchase_price=data.get('purchase_price', 0.00),
        selling_price=data.get('selling_price', 0.00),
        quantity=starting_quantity,
        minimum_stock_level=data.get('minimum_stock_level', 5)
    )
    db.session.add(new_product)
    db.session.flush()  # lets us access new_product.product_id before committing

    # Automatically create the matching inventory row for this product
    new_inventory = Inventory(
        product_id=new_product.product_id,
        current_stock=starting_quantity,
        status='Available' if starting_quantity > new_product.minimum_stock_level else (
            'Out of Stock' if starting_quantity == 0 else 'Low Stock'
        )
    )
    db.session.add(new_inventory)
    db.session.commit()

    return jsonify({
        "message": "Product created successfully",
        "product": new_product.to_dict()
    }), 201


@product_bp.route('/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    """Updates an existing product. Only sends fields that are provided."""
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    # Validate numeric fields if they are being updated
    if 'purchase_price' in data and data['purchase_price'] < 0:
        return jsonify({"error": "purchase_price cannot be negative"}), 400

    if 'selling_price' in data and data['selling_price'] < 0:
        return jsonify({"error": "selling_price cannot be negative"}), 400

    if 'minimum_stock_level' in data and data['minimum_stock_level'] < 0:
        return jsonify({"error": "minimum_stock_level cannot be negative"}), 400

    if 'category_id' in data and data['category_id'] is not None:
        category = Category.query.get(data['category_id'])
        if not category:
            return jsonify({"error": "Category not found"}), 404

    if 'supplier_id' in data and data['supplier_id'] is not None:
        supplier = Supplier.query.get(data['supplier_id'])
        if not supplier:
            return jsonify({"error": "Supplier not found"}), 404

    updatable_fields = [
        'product_name', 'category_id', 'supplier_id', 'description',
        'purchase_price', 'selling_price', 'minimum_stock_level', 'status'
    ]
    for field in updatable_fields:
        if field in data:
            setattr(product, field, data[field])

    db.session.commit()

    return jsonify({
        "message": "Product updated successfully",
        "product": product.to_dict()
    }), 200


@product_bp.route('/<int:product_id>/toggle-status', methods=['PATCH'])
@jwt_required()
def toggle_product_status(product_id):
    """Flips a product between Active and Inactive with a single call."""
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    product.status = 'Inactive' if product.status == 'Active' else 'Active'
    db.session.commit()

    return jsonify({
        "message": f"Product status changed to {product.status}",
        "product": product.to_dict()
    }), 200


@product_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    """Deletes a product (and its inventory row, via cascade)."""
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    db.session.delete(product)
    db.session.commit()

    return jsonify({"message": "Product deleted successfully"}), 200