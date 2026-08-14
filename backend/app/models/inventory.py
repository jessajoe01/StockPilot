from app import db
from datetime import datetime

class Inventory(db.Model):
    """Maps to the 'inventory' table. Tracks live stock levels per product."""
    __tablename__ = 'inventory'

    inventory_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.product_id', ondelete='CASCADE'), nullable=False, unique=True)
    current_stock = db.Column(db.Integer, nullable=False, default=0)
    status = db.Column(db.Enum('Available', 'Low Stock', 'Out of Stock'), nullable=False, default='Available')
    last_updated = db.Column(db.TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)

    # One inventory record belongs to one product
    product = db.relationship('Product', backref=db.backref('inventory', uselist=False, passive_deletes=True))

    def to_dict(self):
        return {
            "inventory_id": self.inventory_id,
            "product_id": self.product_id,
            "current_stock": self.current_stock,
            "status": self.status,
            "last_updated": self.last_updated.isoformat() if self.last_updated else None
        }