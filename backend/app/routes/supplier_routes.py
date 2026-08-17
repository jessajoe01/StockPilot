from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.supplier import Supplier
from app.models.product import Product
from app.models.stock_transaction import StockTransaction

supplier_bp = Blueprint('supplier', __name__, url_prefix='/api/suppliers')


@supplier_bp.route('', methods=['GET'])
@jwt_required()
def get_suppliers():
    """
    Returns suppliers, optionally filtered:
    - ?search=xyz    -> matches supplier_name OR company_name containing 'xyz'
    - ?status=Active -> only suppliers with this status
    """
    query = Supplier.query

    search_term = request.args.get('search')
    if search_term:
        like_pattern = f'%{search_term}%'
        query = query.filter(
            db.or_(
                Supplier.supplier_name.ilike(like_pattern),
                Supplier.company_name.ilike(like_pattern)
            )
        )

    status_filter = request.args.get('status')
    if status_filter:
        query = query.filter(Supplier.status == status_filter)

    suppliers = query.all()
    return jsonify([s.to_dict() for s in suppliers]), 200


@supplier_bp.route('/<int:supplier_id>', methods=['GET'])
@jwt_required()
def get_supplier(supplier_id):
    """Returns a single supplier by its id."""
    supplier = Supplier.query.get(supplier_id)
    if not supplier:
        return jsonify({"error": "Supplier not found"}), 404
    return jsonify(supplier.to_dict()), 200


@supplier_bp.route('', methods=['POST'])
@jwt_required()
def create_supplier():
    """Creates a new supplier. Only supplier_name is required."""
    data = request.get_json()

    if not data or not data.get('supplier_name'):
        return jsonify({"error": "supplier_name is required"}), 400

    new_supplier = Supplier(
        supplier_name=data['supplier_name'],
        company_name=data.get('company_name'),
        email=data.get('email'),
        phone=data.get('phone'),
        address=data.get('address'),
        gst_number=data.get('gst_number')
    )
    db.session.add(new_supplier)
    db.session.commit()

    return jsonify({
        "message": "Supplier created successfully",
        "supplier": new_supplier.to_dict()
    }), 201


@supplier_bp.route('/<int:supplier_id>', methods=['PUT'])
@jwt_required()
def update_supplier(supplier_id):
    """Updates an existing supplier. Only sends fields that are provided."""
    supplier = Supplier.query.get(supplier_id)
    if not supplier:
        return jsonify({"error": "Supplier not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    updatable_fields = ['supplier_name', 'company_name', 'email', 'phone', 'address', 'gst_number', 'status']
    for field in updatable_fields:
        if field in data:
            setattr(supplier, field, data[field])

    db.session.commit()

    return jsonify({
        "message": "Supplier updated successfully",
        "supplier": supplier.to_dict()
    }), 200


@supplier_bp.route('/<int:supplier_id>/toggle-status', methods=['PATCH'])
@jwt_required()
def toggle_supplier_status(supplier_id):
    """Flips a supplier between Active and Inactive."""
    supplier = Supplier.query.get(supplier_id)
    if not supplier:
        return jsonify({"error": "Supplier not found"}), 404

    supplier.status = 'Inactive' if supplier.status == 'Active' else 'Active'
    db.session.commit()

    return jsonify({
        "message": f"Supplier status changed to {supplier.status}",
        "supplier": supplier.to_dict()
    }), 200


@supplier_bp.route('/<int:supplier_id>/products', methods=['GET'])
@jwt_required()
def get_supplier_products(supplier_id):
    """Returns every product sourced from this supplier."""
    supplier = Supplier.query.get(supplier_id)
    if not supplier:
        return jsonify({"error": "Supplier not found"}), 404

    products = Product.query.filter_by(supplier_id=supplier_id).all()
    return jsonify([p.to_dict() for p in products]), 200


@supplier_bp.route('/<int:supplier_id>/history', methods=['GET'])
@jwt_required()
def get_supplier_history(supplier_id):
    """
    Returns the Stock History (per Section 13.5 of the doc) for every product
    sourced from this supplier - i.e. every stock transaction tied to their products.
    """
    supplier = Supplier.query.get(supplier_id)
    if not supplier:
        return jsonify({"error": "Supplier not found"}), 404

    transactions = (
        StockTransaction.query
        .join(Product, StockTransaction.product_id == Product.product_id)
        .filter(Product.supplier_id == supplier_id)
        .order_by(StockTransaction.transaction_date.desc())
        .all()
    )

    history = []
    for t in transactions:
        entry = t.to_dict()
        entry['product_name'] = t.product.product_name
        history.append(entry)

    return jsonify(history), 200


@supplier_bp.route('/<int:supplier_id>', methods=['DELETE'])
@jwt_required()
def delete_supplier(supplier_id):
    """Deletes a supplier. Products referencing it will have supplier_id set to NULL."""
    supplier = Supplier.query.get(supplier_id)
    if not supplier:
        return jsonify({"error": "Supplier not found"}), 404

    db.session.delete(supplier)
    db.session.commit()

    return jsonify({"message": "Supplier deleted successfully"}), 200