from app import db
from datetime import datetime

class Order(db.Model):
    """Maps to the 'orders' table."""
    __tablename__ = 'orders'

    order_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    order_number = db.Column(db.String(20), nullable=False, unique=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.customer_id'), nullable=False)
    order_date = db.Column(db.TIMESTAMP, default=datetime.utcnow)
    subtotal = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    discount = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    tax = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    payment_status = db.Column(
        db.Enum('Paid', 'Pending', 'Partially Paid', 'Refunded'),
        nullable=False, default='Pending'
    )
    order_status = db.Column(
        db.Enum('Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'),
        nullable=False, default='Pending'
    )
    created_by = db.Column(db.Integer, db.ForeignKey('users.user_id'))

    # One order can have many order items
    items = db.relationship('OrderItem', backref='order', lazy=True, cascade='all, delete-orphan')
    # One order can have multiple payments
    payments = db.relationship('Payment', backref='order', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            "order_id": self.order_id,
            "order_number": self.order_number,
            "customer_id": self.customer_id,
            "order_date": self.order_date.isoformat() if self.order_date else None,
            "subtotal": float(self.subtotal) if self.subtotal is not None else 0.0,
            "discount": float(self.discount) if self.discount is not None else 0.0,
            "tax": float(self.tax) if self.tax is not None else 0.0,
            "total_amount": float(self.total_amount) if self.total_amount is not None else 0.0,
            "payment_status": self.payment_status,
            "order_status": self.order_status,
            "created_by": self.created_by
        }