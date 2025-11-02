from flask import Blueprint, request, jsonify
from services.auth import admin_required, validate_json, handle_errors
from services.firebase_service import FirebaseService
from services.stellar_service import StellarService
from models import ApplicationStatus
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@admin_bp.route('/applications', methods=['GET'])
@admin_required
@handle_errors
def get_all_applications():
    """Get all scholarship applications with optional filtering"""
    try:
        firebase_service = FirebaseService()
        
        # Get query parameters
        status = request.args.get('status')
        limit = int(request.args.get('limit', 50))
        
        # Validate status if provided
        if status and status not in [s.value for s in ApplicationStatus]:
            return jsonify({'error': f'Invalid status. Valid options: {[s.value for s in ApplicationStatus]}'}), 400
        
        applications = firebase_service.get_all_applications(status=status, limit=limit)
        
        return jsonify({
            'applications': applications,
            'count': len(applications),
            'filters': {
                'status': status,
                'limit': limit
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error in get_all_applications: {e}")
        return jsonify({'error': 'Failed to retrieve applications'}), 500

@admin_bp.route('/applications/<application_id>', methods=['GET'])
@admin_required
@handle_errors
def get_application_details(application_id):
    """Get detailed information about a specific application"""
    try:
        firebase_service = FirebaseService()
        application = firebase_service.get_application(application_id)
        
        if not application:
            return jsonify({'error': 'Application not found'}), 404
        
        return jsonify(application), 200
        
    except Exception as e:
        logger.error(f"Error in get_application_details: {e}")
        return jsonify({'error': 'Failed to retrieve application'}), 500

@admin_bp.route('/applications/<application_id>/approve', methods=['POST'])
@admin_required
@validate_json(['approved_amount'])
@handle_errors
def approve_application(application_id):
    """Approve an application and release scholarship funds"""
    try:
        data = request.json_data
        firebase_service = FirebaseService()
        stellar_service = StellarService()
        
        # Get application
        application = firebase_service.get_application(application_id)
        if not application:
            return jsonify({'error': 'Application not found'}), 404
        
        if application['status'] != ApplicationStatus.PENDING.value:
            return jsonify({'error': 'Application is not in pending status'}), 400
        
        approved_amount = float(data['approved_amount'])
        admin_notes = data.get('admin_notes', '')
        
        if approved_amount <= 0:
            return jsonify({'error': 'Approved amount must be positive'}), 400
        
        # Release scholarship via smart contract
        result = stellar_service.release_scholarship(
            application['student_wallet'], 
            approved_amount
        )
        
        if not result or not result.get('success'):
            error_msg = result.get('error', 'Failed to release scholarship on blockchain') if result else 'Blockchain transaction failed'
            return jsonify({'error': error_msg}), 500
        
        # Update application status
        update_data = {
            'status': ApplicationStatus.DISBURSED.value,
            'reviewed_at': datetime.utcnow(),
            'reviewed_by': request.current_user['uid'],
            'admin_notes': admin_notes,
            'disbursed_amount': approved_amount,
            'transaction_hash': result['transaction_hash']
        }
        
        success = firebase_service.update_application(application_id, update_data)
        
        if not success:
            logger.error(f"Failed to update application {application_id} after successful blockchain transaction")
            # Note: The blockchain transaction succeeded, but we failed to update our database
            # This is a critical issue that needs manual intervention
        
        # Create scholarship record
        record_data = {
            'student_wallet': application['student_wallet'],
            'amount': approved_amount,
            'transaction_hash': result['transaction_hash'],
            'timestamp': datetime.utcnow(),
            'application_id': application_id
        }
        
        firebase_service.create_scholarship_record(record_data)
        
        logger.info(f"Application {application_id} approved and scholarship disbursed: {approved_amount}")
        
        return jsonify({
            'message': 'Application approved and scholarship disbursed successfully',
            'transaction_hash': result['transaction_hash'],
            'approved_amount': approved_amount,
            'status': 'disbursed'
        }), 200
        
    except Exception as e:
        logger.error(f"Error in approve_application: {e}")
        return jsonify({'error': 'Failed to approve application'}), 500

@admin_bp.route('/applications/<application_id>/reject', methods=['POST'])
@admin_required
@validate_json()
@handle_errors
def reject_application(application_id):
    """Reject an application"""
    try:
        data = request.json_data
        firebase_service = FirebaseService()
        
        # Get application
        application = firebase_service.get_application(application_id)
        if not application:
            return jsonify({'error': 'Application not found'}), 404
        
        if application['status'] != ApplicationStatus.PENDING.value:
            return jsonify({'error': 'Application is not in pending status'}), 400
        
        admin_notes = data.get('admin_notes', '')
        
        # Update application status
        update_data = {
            'status': ApplicationStatus.REJECTED.value,
            'reviewed_at': datetime.utcnow(),
            'reviewed_by': request.current_user['uid'],
            'admin_notes': admin_notes
        }
        
        success = firebase_service.update_application(application_id, update_data)
        
        if success:
            logger.info(f"Application {application_id} rejected")
            return jsonify({
                'message': 'Application rejected successfully',
                'status': 'rejected'
            }), 200
        else:
            return jsonify({'error': 'Failed to reject application'}), 500
            
    except Exception as e:
        logger.error(f"Error in reject_application: {e}")
        return jsonify({'error': 'Failed to reject application'}), 500

@admin_bp.route('/dashboard', methods=['GET'])
@admin_required
@handle_errors
def get_admin_dashboard():
    """Get admin dashboard statistics"""
    try:
        firebase_service = FirebaseService()
        stellar_service = StellarService()
        
        # Get dashboard stats from Firebase
        stats = firebase_service.get_dashboard_stats()
        
        # Get total disbursed from blockchain for verification
        blockchain_total = stellar_service.get_total_disbursed()
        
        # Get recent applications
        recent_applications = firebase_service.get_all_applications(limit=10)
        
        dashboard_data = {
            'statistics': stats,
            'blockchain_total_disbursed': blockchain_total,
            'recent_applications': recent_applications,
            'summary': {
                'pending_review': stats['pending_applications'],
                'total_disbursed': stats['total_disbursed'],
                'students_helped': stats['total_students_helped'],
                'approval_rate': (
                    stats['approved_applications'] / stats['total_applications'] * 100
                    if stats['total_applications'] > 0 else 0
                )
            }
        }
        
        return jsonify(dashboard_data), 200
        
    except Exception as e:
        logger.error(f"Error in get_admin_dashboard: {e}")
        return jsonify({'error': 'Failed to retrieve dashboard data'}), 500

@admin_bp.route('/scholarship-records', methods=['GET'])
@admin_required
@handle_errors
def get_scholarship_records():
    """Get all scholarship disbursement records"""
    try:
        firebase_service = FirebaseService()
        
        # Get query parameters
        limit = int(request.args.get('limit', 50))
        student_wallet = request.args.get('student_wallet')
        
        if student_wallet:
            records = firebase_service.get_scholarship_records_by_student(student_wallet)
        else:
            # Get all records (this would need a new method in firebase_service)
            # For now, we'll return an empty list with a message
            records = []
        
        return jsonify({
            'records': records,
            'count': len(records),
            'filters': {
                'student_wallet': student_wallet,
                'limit': limit
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error in get_scholarship_records: {e}")
        return jsonify({'error': 'Failed to retrieve scholarship records'}), 500

@admin_bp.route('/statistics', methods=['GET'])
@admin_required
@handle_errors
def get_detailed_statistics():
    """Get detailed statistics for analytics"""
    try:
        firebase_service = FirebaseService()
        stellar_service = StellarService()
        
        # Get basic stats
        stats = firebase_service.get_dashboard_stats()
        
        # Get blockchain verification
        blockchain_total = stellar_service.get_total_disbursed()
        
        # Calculate additional metrics
        detailed_stats = {
            **stats,
            'blockchain_total_disbursed': blockchain_total,
            'data_consistency': abs(stats['total_disbursed'] - (blockchain_total or 0)) < 0.01,
            'average_scholarship_amount': (
                stats['total_disbursed'] / stats['approved_applications']
                if stats['approved_applications'] > 0 else 0
            ),
            'rejection_rate': (
                stats['rejected_applications'] / stats['total_applications'] * 100
                if stats['total_applications'] > 0 else 0
            )
        }
        
        return jsonify(detailed_stats), 200
        
    except Exception as e:
        logger.error(f"Error in get_detailed_statistics: {e}")
        return jsonify({'error': 'Failed to retrieve detailed statistics'}), 500