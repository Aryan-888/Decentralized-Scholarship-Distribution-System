from flask import Blueprint, request, jsonify
from services.auth import auth_required, validate_json, handle_errors
from services.firebase_service import FirebaseService
from services.stellar_service import StellarService
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/login', methods=['POST'])
@validate_json(['id_token'])
@handle_errors
def login():
    """Authenticate user with Firebase ID token"""
    try:
        data = request.json_data
        firebase_service = FirebaseService()
        
        # Verify the ID token
        decoded_token = firebase_service.verify_token(data['id_token'])
        
        if not decoded_token:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        uid = decoded_token['uid']
        email = decoded_token.get('email')
        
        # Get or create user in Firestore
        user_data = firebase_service.get_user(uid)
        
        if not user_data:
            # Create new user
            new_user_data = {
                'uid': uid,
                'email': email,
                'role': 'student',  # Default role
                'created_at': datetime.utcnow(),
                'last_login': datetime.utcnow()
            }
            
            success = firebase_service.create_user(uid, new_user_data)
            if success:
                user_data = new_user_data
            else:
                return jsonify({'error': 'Failed to create user profile'}), 500
        else:
            # Update last login
            firebase_service.update_user(uid, {'last_login': datetime.utcnow()})
        
        # Return user info (excluding sensitive data)
        response_data = {
            'user': {
                'uid': user_data['uid'],
                'email': user_data['email'],
                'role': user_data['role'],
                'wallet_address': user_data.get('wallet_address'),
                'created_at': user_data.get('created_at')
            },
            'message': 'Login successful'
        }
        
        logger.info(f"User {uid} logged in successfully")
        return jsonify(response_data), 200
        
    except Exception as e:
        logger.error(f"Error in login: {e}")
        return jsonify({'error': 'Login failed'}), 500

@auth_bp.route('/profile', methods=['GET'])
@auth_required
@handle_errors
def get_profile():
    """Get current user profile"""
    try:
        firebase_service = FirebaseService()
        user_data = firebase_service.get_user(request.current_user['uid'])
        
        if not user_data:
            return jsonify({'error': 'User profile not found'}), 404
        
        # Return user info (excluding sensitive data)
        profile_data = {
            'uid': user_data['uid'],
            'email': user_data['email'],
            'role': user_data['role'],
            'wallet_address': user_data.get('wallet_address'),
            'created_at': user_data.get('created_at'),
            'last_login': user_data.get('last_login')
        }
        
        return jsonify(profile_data), 200
        
    except Exception as e:
        logger.error(f"Error in get_profile: {e}")
        return jsonify({'error': 'Failed to retrieve profile'}), 500

@auth_bp.route('/wallet', methods=['PUT'])
@auth_required
@validate_json(['wallet_address'])
@handle_errors
def update_wallet():
    """Update user's wallet address"""
    try:
        data = request.json_data
        firebase_service = FirebaseService()
        stellar_service = StellarService()
        
        wallet_address = data['wallet_address']
        
        # Validate Stellar wallet address
        if not stellar_service.validate_stellar_address(wallet_address):
            return jsonify({'error': 'Invalid Stellar wallet address'}), 400
        
        # Update user's wallet address
        update_data = {
            'wallet_address': wallet_address,
            'last_login': datetime.utcnow()
        }
        
        success = firebase_service.update_user(request.current_user['uid'], update_data)
        
        if success:
            logger.info(f"Wallet address updated for user {request.current_user['uid']}")
            return jsonify({'message': 'Wallet address updated successfully'}), 200
        else:
            return jsonify({'error': 'Failed to update wallet address'}), 500
            
    except Exception as e:
        logger.error(f"Error in update_wallet: {e}")
        return jsonify({'error': 'Failed to update wallet address'}), 500

@auth_bp.route('/verify', methods=['POST'])
@auth_required
@handle_errors
def verify_token():
    """Verify if the current token is valid"""
    try:
        firebase_service = FirebaseService()
        user_data = firebase_service.get_user(request.current_user['uid'])
        
        if not user_data:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'valid': True,
            'user': {
                'uid': user_data['uid'],
                'email': user_data['email'],
                'role': user_data['role'],
                'wallet_address': user_data.get('wallet_address')
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error in verify_token: {e}")
        return jsonify({'error': 'Token verification failed'}), 500