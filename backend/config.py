import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Flask
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    
    # Firebase
    FIREBASE_CREDENTIALS_PATH = os.environ.get('FIREBASE_CREDENTIALS_PATH', 'firebase-credentials.json')
    FIREBASE_DATABASE_URL = os.environ.get('FIREBASE_DATABASE_URL')
    
    # Stellar Network
    STELLAR_NETWORK = os.environ.get('STELLAR_NETWORK', 'testnet')
    STELLAR_HORIZON_URL = os.environ.get('STELLAR_HORIZON_URL', 'https://horizon-testnet.stellar.org')
    
    # Smart Contract
    CONTRACT_ID = os.environ.get('CONTRACT_ID')
    ADMIN_SECRET_KEY = os.environ.get('ADMIN_SECRET_KEY')
    
    # CORS
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(',')
    
    # Pagination
    DEFAULT_PAGE_SIZE = int(os.environ.get('DEFAULT_PAGE_SIZE', '10'))
    MAX_PAGE_SIZE = int(os.environ.get('MAX_PAGE_SIZE', '100'))