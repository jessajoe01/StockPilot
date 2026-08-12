from app import db
from datetime import datetime

class Supplier(db.Model):
    """Maps to the 'suppliers' table."""
    __tablename__ = 'suppliers'

    supplier_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    supplier_name = db.Column(db.String(100), nullable=False)
    company_name = db.Column(db.String(150))
    email = db.Column(db.String(150))
    phone = db.Column(db.String(20))
    address = db.Column(db.String(255))
    gst_number = db.Column(db.String(50))
    status = db.Column(db.Enum('Active', 'Inactive'), nullable=False, default='Active')
    created_at = db.Column(db.TIMESTAMP, default=datetime.utcnow)

    products = db.relationship('Product', backref='supplier', lazy=True)

    def to_dict(self):
        return {
            "supplier_id": self.supplier_id,
            "supplier_name": self.supplier_name,
            "company_name": self.company_name,
            "email": self.email,
            "phone": self.phone,
            "address": self.address,
            "gst_number": self.gst_number,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }