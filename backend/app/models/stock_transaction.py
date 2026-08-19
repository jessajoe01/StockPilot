from app import db
from datetime import datetime

class StockTransaction(db.Model):
    """Maps to the 'stock_transactions' table. Logs every stock change (in/out/adjustment)."""
    __tablename__ = 'stock_transactions'

    transaction_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.product_id'), nullable=False)
    transaction_type = db.Column(
        db.Enum('Stock In', 'Stock Out', 'Sale', 'Cancellation Return', 'Adjustment'),
        nullable=False
    )
    quantity = db.Column(db.Integer, nullable=False)
    transaction_date = db.Column(db.TIMESTAMP, default=datetime.utcnow)
    notes = db.Column(db.String(255))

    product = db.relationship('Product', backref='stock_transactions')

    def to_dict(self):
        return {
            "transaction_id": self.transaction_id,
            "product_id": self.product_id,
            "transaction_type": self.transaction_type,
            "quantity": self.quantity,
            "transaction_date": self.transaction_date.isoformat() if self.transaction_date else None,
            "notes": self.notes
        }