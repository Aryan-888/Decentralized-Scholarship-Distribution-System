from functools import wraps
from flask import request, jsonify, current_app
import jwt
from services.firebase_service import FirebaseService
import logging

logger = logging.getLogger(__name__)

def auth_required(f):
    """Decorator to require authentication for API endpoints"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        
        # Check for Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({'error': 'Invalid authorization header format'}), 401
        
        if not token:
            return jsonify({'error': 'Authentication token required'}), 401
        
        try:
            firebase_service = FirebaseService()
            decoded_token = firebase_service.verify_token(token)
            
            if not decoded_token:
                return jsonify({'error': 'Invalid or expired token'}), 401
            
            # Add user info to request context
            request.current_user = decoded_token
            
        except Exception as e:
            logger.error(f"Authentication error: {e}")
            return jsonify({'error': 'Authentication failed'}), 401
        
        return f(*args, **kwargs)
    
    return decorated_function

def admin_required(f):
    """Decorator to require admin role"""
    @wraps(f)
    @auth_required
    def decorated_function(*args, **kwargs):
        try:
            firebase_service = FirebaseService()
            user_data = firebase_service.get_user(request.current_user['uid'])
            
            if not user_data or user_data.get('role') != 'admin':
                return jsonify({'error': 'Admin access required'}), 403
            
            request.current_user_data = user_data
            
        except Exception as e:
            logger.error(f"Admin check error: {e}")
            return jsonify({'error': 'Authorization failed'}), 403
        
        return f(*args, **kwargs)
    
    return decorated_function

def validate_json(required_fields=None):
    """Decorator to validate JSON request data"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not request.is_json:
                return jsonify({'error': 'Content-Type must be application/json'}), 400
            
            data = request.get_json()
            if not data:
                return jsonify({'error': 'No JSON data provided'}), 400
            
            if required_fields:
                missing_fields = [field for field in required_fields if field not in data]
                if missing_fields:
                    return jsonify({
                        'error': 'Missing required fields',
                        'missing_fields': missing_fields
                    }), 400
            
            request.json_data = data
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator

def handle_errors(f):
    """Decorator to handle common errors"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except ValueError as e:
            return jsonify({'error': f'Invalid input: {str(e)}'}), 400
        except Exception as e:
            logger.error(f"Unexpected error in {f.__name__}: {e}")
            return jsonify({'error': 'Internal server error'}), 500
    
    return decorated_function