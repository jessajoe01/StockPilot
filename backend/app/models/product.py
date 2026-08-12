from app import db
from datetime import datetime

class Product(db.Model):
    """Maps to the 'products' table."""
    __tablename__ = 'products'

    product_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    product_name = db.Column(db.String(150), nullable=False)
    product_code = db.Column(db.String(50), nullable=False, unique=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.category_id'))
    supplier_id = db.Column(db.Integer, db.ForeignKey('suppliers.supplier_id'))
    description = db.Column(db.String(500))
    purchase_price = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    selling_price = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    quantity = db.Column(db.Integer, nullable=False, default=0)
    minimum_stock_level = db.Column(db.Integer, nullable=False, default=5)
    status = db.Column(db.Enum('Active', 'Inactive'), nullable=False, default='Active')
    created_at = db.Column(db.TIMESTAMP, default=datetime.utcnow)

    def to_dict(self):
        return {
            "product_id": self.product_id,
            "product_name": self.product_name,
            "product_code": self.product_code,
            "category_id": self.category_id,
            "supplier_id": self.supplier_id,
            "description": self.description,
            "purchase_price": float(self.purchase_price) if self.purchase_price is not None else 0.0,
            "selling_price": float(self.selling_price) if self.selling_price is not None else 0.0,
            "quantity": self.quantity,
            "minimum_stock_level": self.minimum_stock_level,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }