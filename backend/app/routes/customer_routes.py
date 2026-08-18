from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.customer import Customer

customer_bp = Blueprint('customer', __name__, url_prefix='/api/customers')


@customer_bp.route('', methods=['GET'])
@jwt_required()
def get_customers():
    """
    Returns customers, optionally filtered:
    - ?search=xyz    -> matches customer_name, email, or phone containing 'xyz'
    - ?status=Active -> only customers with this status
    """
    query = Customer.query

    search_term = request.args.get('search')
    if search_term:
        like_pattern = f'%{search_term}%'
        query = query.filter(
            db.or_(
                Customer.customer_name.ilike(like_pattern),
                Customer.email.ilike(like_pattern),
                Customer.phone.ilike(like_pattern)
            )
        )

    status_filter = request.args.get('status')
    if status_filter:
        query = query.filter(Customer.status == status_filter)

    customers = query.all()
    return jsonify([c.to_dict() for c in customers]), 200


@customer_bp.route('/<int:customer_id>', methods=['GET'])
@jwt_required()
def get_customer(customer_id):
    """Returns a single customer by its id."""
    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({"error": "Customer not found"}), 404
    return jsonify(customer.to_dict()), 200


@customer_bp.route('', methods=['POST'])
@jwt_required()
def create_customer():
    """Creates a new customer. Only customer_name is required."""
    data = request.get_json()

    if not data or not data.get('customer_name'):
        return jsonify({"error": "customer_name is required"}), 400

    new_customer = Customer(
        customer_name=data['customer_name'],
        email=data.get('email'),
        phone=data.get('phone'),
        address=data.get('address'),
        city=data.get('city'),
        state=data.get('state'),
        pincode=data.get('pincode')
    )
    db.session.add(new_customer)
    db.session.commit()

    return jsonify({
        "message": "Customer created successfully",
        "customer": new_customer.to_dict()
    }), 201


@customer_bp.route('/<int:customer_id>', methods=['PUT'])
@jwt_required()
def update_customer(customer_id):
    """Updates an existing customer. Only sends fields that are provided."""
    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({"error": "Customer not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    updatable_fields = ['customer_name', 'email', 'phone', 'address', 'city', 'state', 'pincode', 'status']
    for field in updatable_fields:
        if field in data:
            setattr(customer, field, data[field])

    db.session.commit()

    return jsonify({
        "message": "Customer updated successfully",
        "customer": customer.to_dict()
    }), 200


@customer_bp.route('/<int:customer_id>/toggle-status', methods=['PATCH'])
@jwt_required()
def toggle_customer_status(customer_id):
    """Flips a customer between Active and Inactive."""
    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({"error": "Customer not found"}), 404

    customer.status = 'Inactive' if customer.status == 'Active' else 'Active'
    db.session.commit()

    return jsonify({
        "message": f"Customer status changed to {customer.status}",
        "customer": customer.to_dict()
    }), 200


@customer_bp.route('/<int:customer_id>', methods=['DELETE'])
@jwt_required()
def delete_customer(customer_id):
    """Deletes a customer."""
    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({"error": "Customer not found"}), 404

    db.session.delete(customer)
    db.session.commit()

    return jsonify({"message": "Customer deleted successfully"}), 200


# NOTE: "View customer orders" and "View customer payment history" (per the
# document's Customer Management Module) will be added here once the Orders
# and Payments modules are built - they depend on tables that don't exist yet.