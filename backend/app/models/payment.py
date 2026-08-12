from app import db
from datetime import datetime

class Payment(db.Model):
    """Maps to the 'payments' table."""
    __tablename__ = 'payments'

    payment_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.order_id'), nullable=False)
    payment_method = db.Column(db.Enum('Cash', 'Card', 'UPI', 'Bank Transfer'), nullable=False)
    amount_paid = db.Column(db.Numeric(10, 2), nullable=False)
    payment_status = db.Column(
        db.Enum('Paid', 'Pending', 'Partially Paid', 'Refunded'),
        nullable=False, default='Pending'
    )
    payment_date = db.Column(db.TIMESTAMP, default=datetime.utcnow)

    def to_dict(self):
        return {
            "payment_id": self.payment_id,
            "order_id": self.order_id,
            "payment_method": self.payment_method,
            "amount_paid": float(self.amount_paid) if self.amount_paid is not None else 0.0,
            "payment_status": self.payment_status,
            "payment_date": self.payment_date.isoformat() if self.payment_date else None
        }