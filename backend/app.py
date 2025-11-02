from flask import Flask, jsonify, request
from flask_cors import CORS
from config import Config
import logging
from datetime import datetime

# Import route blueprints
from routes.auth import auth_bp
from routes.student import student_bp
from routes.admin import admin_bp

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

def create_app():
    """Application factory pattern"""
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize CORS
    CORS(app, origins=Config.CORS_ORIGINS)
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(admin_bp)
    
    # Health check endpoint
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'service': 'scholarship-backend'
        }), 200
    
    # API info endpoint
    @app.route('/api', methods=['GET'])
    def api_info():
        return jsonify({
            'name': 'Scholarship Distribution API',
            'version': '1.0.0',
            'description': 'Backend API for decentralized scholarship distribution system',
            'endpoints': {
                'auth': {
                    'POST /api/auth/login': 'Authenticate with Firebase token',
                    'GET /api/auth/profile': 'Get user profile',
                    'PUT /api/auth/wallet': 'Update wallet address',
                    'POST /api/auth/verify': 'Verify token validity'
                },
                'student': {
                    'POST /api/student/apply': 'Submit scholarship application',
                    'GET /api/student/applications': 'Get user applications',
                    'GET /api/student/applications/<id>': 'Get application details',
                    'GET /api/student/dashboard': 'Get student dashboard',
                    'GET /api/student/profile': 'Get student profile',
                    'PUT /api/student/profile': 'Update student profile'
                },
                'admin': {
                    'GET /api/admin/applications': 'Get all applications',
                    'GET /api/admin/applications/<id>': 'Get application details',
                    'POST /api/admin/applications/<id>/approve': 'Approve application',
                    'POST /api/admin/applications/<id>/reject': 'Reject application',
                    'GET /api/admin/dashboard': 'Get admin dashboard',
                    'GET /api/admin/scholarship-records': 'Get scholarship records',
                    'GET /api/admin/statistics': 'Get detailed statistics'
                }
            },
            'documentation': 'https://github.com/your-repo/scholarship-dapp/docs'
        }), 200
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        # Log the requested URL for debugging
        logger.warning(f"404 Error - Endpoint not found: {request.method} {request.url}")
        return jsonify({
            'error': 'Endpoint not found',
            'method': request.method,
            'path': request.path,
            'available_endpoints': {
                'auth': ['/api/auth/login', '/api/auth/profile', '/api/auth/wallet', '/api/auth/verify'],
                'student': ['/api/student/dashboard', '/api/student/applications', '/api/student/profile', '/api/student/apply'],
                'admin': ['/api/admin/dashboard', '/api/admin/applications', '/api/admin/statistics'],
                'health': ['/health', '/api']
            }
        }), 404
    
    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({'error': 'Method not allowed'}), 405
    
    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"Internal server error: {error}")
        return jsonify({'error': 'Internal server error'}), 500
    
    # Flask 3.x compatibility - use before_request instead of before_first_request
    @app.before_request
    def startup():
        if not hasattr(app, '_startup_done'):
            app._startup_done = True
            logger.info("Scholarship Distribution API starting up...")
            logger.info(f"Environment: {'Development' if Config.DEBUG else 'Production'}")
            logger.info(f"Stellar Network: {Config.STELLAR_NETWORK}")
    
    return app

if __name__ == '__main__':
    app = create_app()
    
    # Run the application
    port = 5000
    debug = Config.DEBUG
    
    logger.info(f"Starting Flask server on port {port} (debug={debug})")
    app.run(host='0.0.0.0', port=port, debug=debug)