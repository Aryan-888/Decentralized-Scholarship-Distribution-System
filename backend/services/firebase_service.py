import firebase_admin
from firebase_admin import credentials, firestore, auth
from typing import Optional, List, Dict, Any
import logging
from config import Config

logger = logging.getLogger(__name__)

class FirebaseService:
    def __init__(self):
        if not firebase_admin._apps:
            try:
                cred = credentials.Certificate(Config.FIREBASE_CREDENTIALS_PATH)
                firebase_admin.initialize_app(cred, {
                    'databaseURL': Config.FIREBASE_DATABASE_URL
                })
                logger.info("Firebase initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Firebase: {e}")
                raise

        self.db = firestore.client()

    def verify_token(self, id_token: str) -> Optional[Dict[str, Any]]:
        """Verify Firebase ID token and return decoded token"""
        try:
            decoded_token = auth.verify_id_token(id_token)
            return decoded_token
        except Exception as e:
            logger.error(f"Token verification failed: {e}")
            return None

    def get_user(self, uid: str) -> Optional[Dict[str, Any]]:
        """Get user data from Firestore"""
        try:
            # First try user_profiles collection (new format)
            doc_ref = self.db.collection('user_profiles').document(uid)
            doc = doc_ref.get()
            if doc.exists:
                return doc.to_dict()
            
            # Fallback to users collection (old format)
            doc_ref = self.db.collection('users').document(uid)
            doc = doc_ref.get()
            if doc.exists:
                return doc.to_dict()
                
            return None
        except Exception as e:
            logger.error(f"Failed to get user {uid}: {e}")
            return None

    def create_user(self, uid: str, user_data: Dict[str, Any]) -> bool:
        """Create new user in Firestore"""
        try:
            self.db.collection('users').document(uid).set(user_data)
            logger.info(f"User {uid} created successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to create user {uid}: {e}")
            return False

    def update_user(self, uid: str, update_data: Dict[str, Any]) -> bool:
        """Update user data in Firestore"""
        try:
            self.db.collection('users').document(uid).update(update_data)
            logger.info(f"User {uid} updated successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to update user {uid}: {e}")
            return False

    def create_application(self, application_data: Dict[str, Any]) -> Optional[str]:
        """Create new scholarship application"""
        try:
            doc_ref = self.db.collection('applications').add(application_data)
            application_id = doc_ref[1].id
            logger.info(f"Application {application_id} created successfully")
            return application_id
        except Exception as e:
            logger.error(f"Failed to create application: {e}")
            return None

    def get_application(self, application_id: str) -> Optional[Dict[str, Any]]:
        """Get application by ID"""
        try:
            doc_ref = self.db.collection('applications').document(application_id)
            doc = doc_ref.get()
            if doc.exists:
                data = doc.to_dict()
                data['id'] = doc.id
                return data
            return None
        except Exception as e:
            logger.error(f"Failed to get application {application_id}: {e}")
            return None

    def update_application(self, application_id: str, update_data: Dict[str, Any]) -> bool:
        """Update application"""
        try:
            self.db.collection('applications').document(application_id).update(update_data)
            logger.info(f"Application {application_id} updated successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to update application {application_id}: {e}")
            return False

    def get_applications_by_student(self, student_wallet: str) -> List[Dict[str, Any]]:
        """Get all applications by student wallet address"""
        try:
            query = self.db.collection('applications').where('student_wallet', '==', student_wallet)
            docs = query.stream()
            applications = []
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                applications.append(data)
            return applications
        except Exception as e:
            logger.error(f"Failed to get applications for student {student_wallet}: {e}")
            return []

    def get_all_applications(self, status: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
        """Get all applications, optionally filtered by status"""
        try:
            query = self.db.collection('applications')
            
            if status:
                query = query.where('status', '==', status)
            
            query = query.order_by('applied_at', direction=firestore.Query.DESCENDING).limit(limit)
            
            docs = query.stream()
            applications = []
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                applications.append(data)
            return applications
        except Exception as e:
            logger.error(f"Failed to get applications: {e}")
            return []

    def create_scholarship_record(self, record_data: Dict[str, Any]) -> Optional[str]:
        """Create scholarship disbursement record"""
        try:
            doc_ref = self.db.collection('scholarship_records').add(record_data)
            record_id = doc_ref[1].id
            logger.info(f"Scholarship record {record_id} created successfully")
            return record_id
        except Exception as e:
            logger.error(f"Failed to create scholarship record: {e}")
            return None

    def get_scholarship_records_by_student(self, student_wallet: str) -> List[Dict[str, Any]]:
        """Get scholarship records for a student"""
        try:
            query = self.db.collection('scholarship_records').where('student_wallet', '==', student_wallet)
            query = query.order_by('timestamp', direction=firestore.Query.DESCENDING)
            
            docs = query.stream()
            records = []
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                records.append(data)
            return records
        except Exception as e:
            logger.error(f"Failed to get scholarship records for {student_wallet}: {e}")
            return []

    def get_dashboard_stats(self) -> Dict[str, Any]:
        """Get dashboard statistics"""
        try:
            stats = {
                'total_applications': 0,
                'pending_applications': 0,
                'approved_applications': 0,
                'rejected_applications': 0,
                'total_disbursed': 0.0,
                'total_students_helped': 0
            }

            # Count applications by status
            applications = self.db.collection('applications').stream()
            student_wallets = set()
            
            for doc in applications:
                data = doc.to_dict()
                stats['total_applications'] += 1
                
                status = data.get('status', 'pending')
                if status == 'pending':
                    stats['pending_applications'] += 1
                elif status in ['approved', 'disbursed']:  # Count both approved and disbursed as approved
                    stats['approved_applications'] += 1
                elif status == 'rejected':
                    stats['rejected_applications'] += 1
                
                if status in ['approved', 'disbursed']:
                    student_wallets.add(data.get('student_wallet'))

            # Calculate total disbursed from scholarship records
            records = self.db.collection('scholarship_records').stream()
            for doc in records:
                data = doc.to_dict()
                stats['total_disbursed'] += data.get('amount', 0)

            stats['total_students_helped'] = len(student_wallets)
            
            return stats
        except Exception as e:
            logger.error(f"Failed to get dashboard stats: {e}")
            return {
                'total_applications': 0,
                'pending_applications': 0,
                'approved_applications': 0,
                'rejected_applications': 0,
                'total_disbursed': 0.0,
                'total_students_helped': 0
            }

    def get_student_profile(self, student_address: str) -> Optional[Dict[str, Any]]:
        """Get student profile from smart contract simulation"""
        try:
            doc_ref = self.db.collection('student_profiles').document(student_address)
            doc = doc_ref.get()
            if doc.exists:
                return doc.to_dict()
            return None
        except Exception as e:
            logger.error(f"Failed to get student profile {student_address}: {e}")
            return None

    def update_student_profile(self, student_address: str, profile_data: Dict[str, Any]) -> bool:
        """Update student profile for smart contract simulation"""
        try:
            self.db.collection('student_profiles').document(student_address).set(profile_data, merge=True)
            logger.info(f"Student profile updated for {student_address}")
            return True
        except Exception as e:
            logger.error(f"Failed to update student profile {student_address}: {e}")
            return False

    def get_contract_stats(self) -> Optional[Dict[str, Any]]:
        """Get contract statistics from smart contract simulation"""
        try:
            doc_ref = self.db.collection('contract_data').document('global_stats')
            doc = doc_ref.get()
            if doc.exists:
                return doc.to_dict()
            return None
        except Exception as e:
            logger.error(f"Failed to get contract stats: {e}")
            return None

    def update_contract_stats(self, stats_data: Dict[str, Any]) -> bool:
        """Update contract statistics for smart contract simulation"""
        try:
            self.db.collection('contract_data').document('global_stats').set(stats_data, merge=True)
            logger.info("Contract stats updated")
            return True
        except Exception as e:
            logger.error(f"Failed to update contract stats: {e}")
            return False