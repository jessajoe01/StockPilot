import os
from dotenv import load_dotenv
from sqlalchemy import URL

# Load variables from the .env file into the environment
load_dotenv()

class Config:
    """
    Central configuration for the Flask app.
    All sensitive values are read from the .env file, never hardcoded.
    """

    # Secret keys (used for sessions and JWT token signing)
    SECRET_KEY = os.getenv('SECRET_KEY')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')

    # Database credentials, read from .env
    DB_HOST = os.getenv('DB_HOST')
    DB_USER = os.getenv('DB_USER')
    DB_PASSWORD = os.getenv('DB_PASSWORD')
    DB_NAME = os.getenv('DB_NAME')

    # SQLAlchemy database connection
    SQLALCHEMY_DATABASE_URI = URL.create(
        drivername="mysql+pymysql",
        username=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        database=DB_NAME
    )

    # Disable unnecessary modification tracking
    SQLALCHEMY_TRACK_MODIFICATIONS = False