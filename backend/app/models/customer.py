from app import db
from datetime import datetime

class Customer(db.Model):
    """Maps to the 'customers' table."""
    __tablename__ = 'customers'

    customer_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    customer_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150))
    phone = db.Column(db.String(20))
    address = db.Column(db.String(255))
    city = db.Column(db.String(100))
    state = db.Column(db.String(100))
    pincode = db.Column(db.String(20))
    status = db.Column(db.Enum('Active', 'Inactive'), nullable=False, default='Active')
    created_at = db.Column(db.TIMESTAMP, default=datetime.utcnow)

    orders = db.relationship('Order', backref='customer', lazy=True)

    def to_dict(self):
        return {
            "customer_id": self.customer_id,
            "customer_name": self.customer_name,
            "email": self.email,
            "phone": self.phone,
            "address": self.address,
            "city": self.city,
            "state": self.state,
            "pincode": self.pincode,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }