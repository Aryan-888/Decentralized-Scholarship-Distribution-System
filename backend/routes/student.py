from flask import Blueprint, request, jsonify
from services.auth import auth_required, validate_json, handle_errors
from services.firebase_service import FirebaseService
from services.stellar_service import StellarService
from models import ScholarshipApplication, ApplicationStatus
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

student_bp = Blueprint('student', __name__, url_prefix='/api/student')

@student_bp.route('/apply', methods=['POST'])
@auth_required
@validate_json(['student_wallet', 'student_name', 'email', 'university', 'gpa', 
               'major', 'year_of_study', 'annual_income', 'scholarship_amount_requested', 'essay'])
@handle_errors
def apply_for_scholarship():
    """Submit a new scholarship application"""
    try:
        data = request.json_data
        firebase_service = FirebaseService()
        stellar_service = StellarService()
        
        # Validate Stellar wallet address
        if not stellar_service.validate_stellar_address(data['student_wallet']):
            return jsonify({'error': 'Invalid Stellar wallet address'}), 400
        
        # Create application object
        application_data = {
            **data,
            'status': ApplicationStatus.PENDING.value,
            'applied_at': datetime.utcnow(),
            'student_uid': request.current_user['uid']
        }
        
        # Validate application data
        try:
            application = ScholarshipApplication(**application_data)
        except Exception as e:
            return jsonify({'error': f'Invalid application data: {str(e)}'}), 400
        
        # Save to Firebase
        application_id = firebase_service.create_application(application.dict())
        
        if application_id:
            logger.info(f"New application submitted: {application_id}")
            return jsonify({
                'message': 'Application submitted successfully',
                'application_id': application_id,
                'status': 'pending'
            }), 201
        else:
            return jsonify({'error': 'Failed to submit application'}), 500
            
    except Exception as e:
        logger.error(f"Error in apply_for_scholarship: {e}")
        return jsonify({'error': 'Failed to submit application'}), 500

@student_bp.route('/applications', methods=['GET'])
@auth_required
@handle_errors
def get_student_applications():
    """Get all applications for the authenticated student"""
    try:
        firebase_service = FirebaseService()
        
        # Get user data to find wallet address
        user_data = firebase_service.get_user(request.current_user['uid'])
        if not user_data:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if user has a wallet address set up
        wallet_address = user_data.get('wallet_address')
        
        if not wallet_address:
            # Return empty applications list for users without wallet setup
            return jsonify({
                'applications': [],
                'count': 0,
                'wallet_setup_required': True
            }), 200
        
        applications = firebase_service.get_applications_by_student(wallet_address)
        
        return jsonify({
            'applications': applications,
            'count': len(applications)
        }), 200
        
    except Exception as e:
        logger.error(f"Error in get_student_applications: {e}")
        return jsonify({'error': 'Failed to retrieve applications'}), 500

@student_bp.route('/applications/<application_id>', methods=['GET'])
@auth_required
@handle_errors
def get_application_details(application_id):
    """Get details of a specific application"""
    try:
        firebase_service = FirebaseService()
        application = firebase_service.get_application(application_id)
        
        if not application:
            return jsonify({'error': 'Application not found'}), 404
        
        # Verify the application belongs to the current user
        user_data = firebase_service.get_user(request.current_user['uid'])
        if not user_data or application['student_wallet'] != user_data.get('wallet_address'):
            return jsonify({'error': 'Unauthorized access to application'}), 403
        
        return jsonify(application), 200
        
    except Exception as e:
        logger.error(f"Error in get_application_details: {e}")
        return jsonify({'error': 'Failed to retrieve application'}), 500

@student_bp.route('/dashboard', methods=['GET'])
@auth_required
@handle_errors
def get_student_dashboard():
    """Get student dashboard data"""
    try:
        firebase_service = FirebaseService()
        stellar_service = StellarService()
        
        # Get user data
        user_data = firebase_service.get_user(request.current_user['uid'])
        if not user_data:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if user has a wallet address set up
        wallet_address = user_data.get('wallet_address')
        
        if not wallet_address:
            # Return empty dashboard for users without wallet setup
            dashboard_data = {
                'applications': [],
                'scholarship_history': [],
                'total_received': 0.0,
                'total_awarded': 0.0,
                # Flatten stats for direct frontend access
                'total_applications': 0,
                'pending_applications': 0,
                'approved_applications': 0,
                'rejected_applications': 0,
                # Keep nested stats for compatibility
                'stats': {
                    'total_applications': 0,
                    'pending_applications': 0,
                    'approved_applications': 0,
                    'rejected_applications': 0,
                },
                'wallet_setup_required': True
            }
            return jsonify(dashboard_data), 200
        
        wallet_address = user_data['wallet_address']
        
        # Get applications
        applications = firebase_service.get_applications_by_student(wallet_address)
        
        # Get scholarship records
        scholarship_records = firebase_service.get_scholarship_records_by_student(wallet_address)
        
        # Get total received amount from blockchain
        total_received = stellar_service.get_student_total_amount(wallet_address) or 0.0
        
        # Calculate stats
        total_applications = len(applications)
        pending_applications = len([app for app in applications if app['status'] == 'pending'])
        approved_applications = len([app for app in applications if app['status'] in ['approved', 'disbursed']])
        rejected_applications = len([app for app in applications if app['status'] == 'rejected'])
        
        dashboard_data = {
            'applications': applications,
            'recent_applications': applications[:3],  # Frontend expects this field for recent apps
            'scholarship_history': scholarship_records,
            'total_received': total_received,
            'total_awarded': total_received,  # Frontend expects this field
            # Flatten stats for direct frontend access
            'total_applications': total_applications,
            'pending_applications': pending_applications,
            'approved_applications': approved_applications,
            'rejected_applications': rejected_applications,
            # Keep nested stats for compatibility
            'stats': {
                'total_applications': total_applications,
                'pending_applications': pending_applications,
                'approved_applications': approved_applications,
                'rejected_applications': rejected_applications,
            }
        }
        
        return jsonify(dashboard_data), 200
        
    except Exception as e:
        logger.error(f"Error in get_student_dashboard: {e}")
        return jsonify({'error': 'Failed to retrieve dashboard data'}), 500

@student_bp.route('/profile', methods=['GET'])
@auth_required
@handle_errors
def get_student_profile():
    """Get student profile information"""
    try:
        firebase_service = FirebaseService()
        user_data = firebase_service.get_user(request.current_user['uid'])
        
        if not user_data:
            return jsonify({'error': 'User profile not found'}), 404
        
        # Remove sensitive information
        profile_data = {
            'uid': user_data.get('uid'),
            'email': user_data.get('email'),
            'wallet_address': user_data.get('wallet_address'),
            'created_at': user_data.get('created_at'),
            'last_login': user_data.get('last_login')
        }
        
        return jsonify(profile_data), 200
        
    except Exception as e:
        logger.error(f"Error in get_student_profile: {e}")
        return jsonify({'error': 'Failed to retrieve profile'}), 500

@student_bp.route('/profile', methods=['PUT'])
@auth_required
@validate_json(['wallet_address'])
@handle_errors
def update_student_profile():
    """Update student profile information"""
    try:
        data = request.json_data
        firebase_service = FirebaseService()
        stellar_service = StellarService()
        
        # Validate Stellar wallet address
        if not stellar_service.validate_stellar_address(data['wallet_address']):
            return jsonify({'error': 'Invalid Stellar wallet address'}), 400
        
        # Update user profile
        update_data = {
            'wallet_address': data['wallet_address'],
            'last_login': datetime.utcnow()
        }
        
        success = firebase_service.update_user(request.current_user['uid'], update_data)
        
        if success:
            return jsonify({'message': 'Profile updated successfully'}), 200
        else:
            return jsonify({'error': 'Failed to update profile'}), 500
            
    except Exception as e:
        logger.error(f"Error in update_student_profile: {e}")
        return jsonify({'error': 'Failed to update profile'}), 500