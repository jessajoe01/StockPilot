# This file makes sure every model is loaded when the app starts,
# so SQLAlchemy knows about all tables and their relationships.

from app.models.user import User
from app.models.category import Category
from app.models.supplier import Supplier
from app.models.customer import Customer
from app.models.product import Product
from app.models.inventory import Inventory
from app.models.stock_transaction import StockTransaction
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.payment import Payment