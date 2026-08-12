from app import db
from datetime import datetime

class User(db.Model):
    """
    Maps to the 'users' table.
    Represents anyone who logs into StockPilot (Admin, Manager, Sales, etc.)
    """
    __tablename__ = 'users'

    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), nullable=False, unique=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(
        db.Enum('Admin', 'Manager', 'Sales', 'Inventory', 'Accounts', 'Staff'),
        nullable=False,
        default='Staff'
    )
    status = db.Column(db.Enum('Active', 'Inactive'), nullable=False, default='Active')
    created_at = db.Column(db.TIMESTAMP, default=datetime.utcnow)

    def to_dict(self):
        """Converts this row into a plain dictionary, so Flask can send it as JSON."""
        return {
            "user_id": self.user_id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }