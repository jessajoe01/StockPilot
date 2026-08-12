from app import db
from datetime import datetime

class Category(db.Model):
    """Maps to the 'categories' table."""
    __tablename__ = 'categories'

    category_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    category_name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.String(255))
    status = db.Column(db.Enum('Active', 'Inactive'), nullable=False, default='Active')
    created_at = db.Column(db.TIMESTAMP, default=datetime.utcnow)

    # One category can have many products (relationship)
    products = db.relationship('Product', backref='category', lazy=True)

    def to_dict(self):
        return {
            "category_id": self.category_id,
            "category_name": self.category_name,
            "description": self.description,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }