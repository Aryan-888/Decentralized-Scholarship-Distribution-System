from stellar_sdk import Keypair, Network, Server, TransactionBuilder, Asset
from stellar_sdk.exceptions import SdkError
import logging
from typing import Optional, Dict, Any
from config import Config
from datetime import datetime

logger = logging.getLogger(__name__)

class StellarService:
    def __init__(self):
        self.network = Network.TESTNET_NETWORK_PASSPHRASE
        self.server = Server(Config.STELLAR_HORIZON_URL)
        self.contract_id = Config.CONTRACT_ID
        
        if Config.ADMIN_SECRET_KEY:
            self.admin_keypair = Keypair.from_secret(Config.ADMIN_SECRET_KEY)
        else:
            logger.warning("Admin secret key not configured")
            self.admin_keypair = None

    def get_account_info(self, public_key: str) -> Optional[Dict[str, Any]]:
        """Get account information from Stellar network"""
        try:
            account = self.server.load_account(public_key)
            return {
                'account_id': account.account_id,
                'sequence': account.sequence,
                'balances': [
                    {
                        'asset_type': balance.asset_type,
                        'asset_code': getattr(balance, 'asset_code', None),
                        'balance': balance.balance
                    }
                    for balance in account.balances
                ]
            }
        except Exception as e:
            logger.error(f"Failed to get account info for {public_key}: {e}")
            return None

    def invoke_contract_function(self, function_name: str, params: list) -> Optional[Dict[str, Any]]:
        """Smart contract simulation with database tracking"""
        if not self.admin_keypair:
            logger.error("Admin keypair not configured")
            return None

        try:
            logger.info(f"Processing smart contract function: {function_name} with params: {params}")
            
            # Handle different contract functions
            if function_name == 'release_scholarship':
                return self._handle_release_scholarship(params)
            elif function_name == 'get_student_amount':
                return self._handle_get_student_amount(params)
            elif function_name == 'get_total_disbursed':
                return self._handle_get_total_disbursed()
            elif function_name == 'get_contract_stats':
                return self._handle_get_contract_stats()
            elif function_name == 'get_student_scholarship_count':
                return self._handle_get_student_scholarship_count(params)
            else:
                logger.warning(f"Unknown contract function: {function_name}")
                return {
                    'success': False,
                    'error': f'Unknown contract function: {function_name}'
                }
                
        except Exception as e:
            logger.error(f"Error in contract function {function_name}: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def _handle_release_scholarship(self, params: list) -> Dict[str, Any]:
        """Handle scholarship release with real Stellar payment + database tracking"""
        try:
            if len(params) < 3:
                return {'success': False, 'error': 'Invalid parameters for release_scholarship'}
            
            admin_address = params[0]
            student_address = params[1]
            amount_scaled = params[2]  # Amount in contract format (10^7)
            
            # Convert to real amount
            amount = float(amount_scaled) / 10**7
            
            logger.info(f"Smart contract release: {amount} XLM to {student_address}")
            
            # Execute real Stellar payment
            payment_result = self.transfer_xlm(student_address, amount)
            
            if not payment_result or not payment_result.get('success'):
                return {
                    'success': False,
                    'error': payment_result.get('error', 'Payment failed') if payment_result else 'Payment failed'
                }
            
            # Store scholarship record in Firebase (simulating smart contract storage)
            # NOTE: Record creation is now handled by the admin route to avoid duplicates
            from services.firebase_service import FirebaseService
            firebase_service = FirebaseService()
            
            # Generate scholarship ID
            scholarship_id = self._generate_scholarship_id()
            
            # Create scholarship record - COMMENTED OUT to prevent duplicates
            # The admin route (routes/admin.py) handles scholarship record creation
            # scholarship_record = {
            #     'scholarship_id': scholarship_id,
            #     'student_wallet': student_address,  # Use student_wallet to match query
            #     'student_address': student_address,  # Keep both for compatibility
            #     'admin_address': admin_address,
            #     'amount': amount,
            #     'amount_scaled': amount_scaled,
            #     'timestamp': datetime.utcnow(),
            #     'transaction_hash': payment_result['transaction_hash'],
            #     'contract_function': 'release_scholarship'
            # }
            
            # Store the record - COMMENTED OUT to prevent duplicates
            # firebase_service.create_scholarship_record(scholarship_record)
            
            # Update student profile
            self._update_student_profile(student_address, amount)
            
            # Update contract stats
            self._update_contract_stats(amount, student_address)
            
            logger.info(f"Smart contract simulation complete: Scholarship #{scholarship_id}")
            
            return {
                'success': True,
                'transaction_hash': payment_result['transaction_hash'],
                'scholarship_id': scholarship_id,
                'result': {
                    'value': scholarship_id,
                    'method': 'hybrid_smart_contract'
                }
            }
            
        except Exception as e:
            logger.error(f"Error in release_scholarship: {e}")
            return {'success': False, 'error': str(e)}

    def _generate_scholarship_id(self) -> int:
        """Generate unique scholarship ID"""
        import time
        return int(time.time() * 1000) % 1000000  # Use timestamp as ID

    def _update_student_profile(self, student_address: str, amount: float):
        """Update student profile with new scholarship"""
        try:
            from services.firebase_service import FirebaseService
            firebase_service = FirebaseService()
            
            # Get existing profile or create new one
            profile = firebase_service.get_student_profile(student_address) or {
                'address': student_address,
                'total_received': 0,
                'scholarship_count': 0,
                'last_scholarship_date': None
            }
            
            # Update profile
            profile['total_received'] = profile.get('total_received', 0) + amount
            profile['scholarship_count'] = profile.get('scholarship_count', 0) + 1
            profile['last_scholarship_date'] = datetime.utcnow()
            
            # Save updated profile
            firebase_service.update_student_profile(student_address, profile)
            
        except Exception as e:
            logger.error(f"Error updating student profile: {e}")

    def _update_contract_stats(self, amount: float, student_address: str):
        """Update global contract statistics"""
        try:
            from services.firebase_service import FirebaseService
            firebase_service = FirebaseService()
            
            # Get existing stats
            stats = firebase_service.get_contract_stats() or {
                'total_disbursed': 0,
                'total_students': 0,
                'total_scholarships': 0,
                'last_scholarship_id': 0
            }
            
            # Check if this is a new student
            is_new_student = not firebase_service.get_student_profile(student_address)
            
            # Update stats
            stats['total_disbursed'] = stats.get('total_disbursed', 0) + amount
            stats['total_scholarships'] = stats.get('total_scholarships', 0) + 1
            if is_new_student:
                stats['total_students'] = stats.get('total_students', 0) + 1
            stats['last_updated'] = datetime.utcnow()
            
            # Save updated stats
            firebase_service.update_contract_stats(stats)
            
        except Exception as e:
            logger.error(f"Error updating contract stats: {e}")

    def _handle_get_student_amount(self, params: list) -> Dict[str, Any]:
        """Get total amount received by student"""
        try:
            if len(params) < 1:
                return {'success': False, 'error': 'Missing student address parameter'}
            
            student_address = params[0]
            
            from services.firebase_service import FirebaseService
            firebase_service = FirebaseService()
            
            profile = firebase_service.get_student_profile(student_address)
            amount = profile.get('total_received', 0) if profile else 0
            
            return {
                'success': True,
                'result': {'value': int(amount * 10**7)}  # Convert to contract format
            }
            
        except Exception as e:
            logger.error(f"Error getting student amount: {e}")
            return {'success': False, 'error': str(e)}

    def _handle_get_total_disbursed(self) -> Dict[str, Any]:
        """Get total amount disbursed by contract"""
        try:
            from services.firebase_service import FirebaseService
            firebase_service = FirebaseService()
            
            stats = firebase_service.get_contract_stats()
            total = stats.get('total_disbursed', 0) if stats else 0
            
            return {
                'success': True,
                'result': {'value': int(total * 10**7)}  # Convert to contract format
            }
            
        except Exception as e:
            logger.error(f"Error getting total disbursed: {e}")
            return {'success': False, 'error': str(e)}

    def _handle_get_contract_stats(self) -> Dict[str, Any]:
        """Get comprehensive contract statistics"""
        try:
            from services.firebase_service import FirebaseService
            firebase_service = FirebaseService()
            
            stats = firebase_service.get_contract_stats() or {}
            
            return {
                'success': True,
                'result': {
                    'total_disbursed': int(stats.get('total_disbursed', 0) * 10**7),
                    'total_students': stats.get('total_students', 0),
                    'total_scholarships': stats.get('total_scholarships', 0),
                    'last_scholarship_id': stats.get('last_scholarship_id', 0)
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting contract stats: {e}")
            return {'success': False, 'error': str(e)}

    def _handle_get_student_scholarship_count(self, params: list) -> Dict[str, Any]:
        """Get number of scholarships received by student"""
        try:
            if len(params) < 1:
                return {'success': False, 'error': 'Missing student address parameter'}
            
            student_address = params[0]
            
            from services.firebase_service import FirebaseService
            firebase_service = FirebaseService()
            
            profile = firebase_service.get_student_profile(student_address)
            count = profile.get('scholarship_count', 0) if profile else 0
            
            return {
                'success': True,
                'result': {'value': count}
            }
            
        except Exception as e:
            logger.error(f"Error getting student scholarship count: {e}")
            return {'success': False, 'error': str(e)}

    def transfer_xlm(self, destination_address: str, amount: float) -> Optional[Dict[str, Any]]:
        """Transfer XLM directly to student's wallet address"""
        if not self.admin_keypair:
            logger.error("Admin keypair not configured for XLM transfer")
            return {
                'success': False,
                'error': 'Admin wallet not configured. XLM transfer cannot proceed.'
            }

        try:
            logger.info(f"Attempting to transfer {amount} XLM to {destination_address}")
            
            # Validate destination address
            if not self.validate_stellar_address(destination_address):
                return {
                    'success': False,
                    'error': f'Invalid destination address: {destination_address}'
                }
            
            # Load admin account
            admin_account = self.server.load_account(self.admin_keypair.public_key)
            logger.info(f"Admin account loaded successfully: {self.admin_keypair.public_key}")
            
            # Build payment transaction
            transaction = (
                TransactionBuilder(
                    source_account=admin_account,
                    network_passphrase=self.network,
                    base_fee=100
                )
                .append_payment_op(
                    destination=destination_address,
                    asset=Asset.native(),  # XLM
                    amount=str(amount)
                )
                .set_timeout(30)
                .build()
            )
            
            # Sign and submit transaction
            transaction.sign(self.admin_keypair)
            response = self.server.submit_transaction(transaction)
            
            logger.info(f"Successfully transferred {amount} XLM to {destination_address}")
            logger.info(f"Transaction hash: {response['hash']}")
            
            return {
                'transaction_hash': response['hash'],
                'success': True,
                'amount': amount,
                'destination': destination_address,
                'result': response
            }
            
        except Exception as e:
            logger.error(f"Failed to transfer XLM to {destination_address}: {e}")
            
            # For development/testing, provide more detailed error info
            error_details = str(e)
            if "account not found" in error_details.lower():
                error_details = f"Destination account {destination_address} not found on Stellar network. Account may need to be created first."
            elif "insufficient balance" in error_details.lower():
                error_details = f"Admin account has insufficient XLM balance to transfer {amount} XLM."
            
            return {
                'success': False,
                'error': error_details
            }

    def release_scholarship(self, student_address: str, amount: float) -> Optional[Dict[str, Any]]:
        """Release scholarship to student via smart contract"""
        try:
            logger.info(f"Releasing scholarship of {amount} to {student_address} via smart contract")
            
            # Convert amount to contract format (7 decimal places for precision)
            contract_amount = int(amount * 10**7)
            
            # Prepare parameters for smart contract
            params = [
                self.admin_keypair.public_key,  # admin address
                student_address,                # student address  
                contract_amount                 # amount in contract format
            ]
            
            # Invoke smart contract function
            result = self.invoke_contract_function('release_scholarship', params)
            
            if result and result.get('success'):
                logger.info(f"Smart contract scholarship release successful: {amount} to {student_address}")
                return {
                    'success': True,
                    'transaction_hash': result['transaction_hash'],
                    'amount': amount,
                    'student_address': student_address,
                    'method': 'smart_contract'
                }
            else:
                logger.error(f"Smart contract release failed: {result.get('error', 'Unknown error')}")
                return {
                    'success': False,
                    'error': result.get('error', 'Failed to release scholarship via smart contract')
                }
                
        except Exception as e:
            logger.error(f"Error in smart contract scholarship release: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def get_student_total_amount(self, student_address: str) -> Optional[float]:
        """Get total scholarship amount received by student from smart contract"""
        try:
            params = [student_address]
            result = self.invoke_contract_function('get_student_amount', params)
            
            if result and result.get('success'):
                # Extract amount from contract result and convert from contract format
                contract_amount = result.get('result', {}).get('value', 0)
                return contract_amount / 10**7 if contract_amount else 0.0
            
            return 0.0
            
        except Exception as e:
            logger.error(f"Error getting student amount from contract: {e}")
            return None

    def get_total_disbursed(self) -> Optional[float]:
        """Get total amount disbursed by the smart contract"""
        try:
            result = self.invoke_contract_function('get_total_disbursed', [])
            
            if result and result.get('success'):
                # Extract amount from contract result and convert from contract format
                contract_amount = result.get('result', {}).get('value', 0)
                return contract_amount / 10**7 if contract_amount else 0.0
            
            return 0.0
            
        except Exception as e:
            logger.error(f"Error getting total disbursed from contract: {e}")
            return None

    def get_contract_stats(self) -> Optional[Dict[str, Any]]:
        """Get comprehensive statistics from the smart contract"""
        try:
            result = self.invoke_contract_function('get_contract_stats', [])
            
            if result and result.get('success'):
                # Extract stats from contract result
                stats = result.get('result', {})
                return {
                    'total_disbursed': stats.get('total_disbursed', 0) / 10**7,
                    'total_students': stats.get('total_students', 0),
                    'total_scholarships': stats.get('total_scholarships', 0),
                    'last_scholarship_id': stats.get('last_scholarship_id', 0)
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting contract stats: {e}")
            return None

    def get_student_scholarship_count(self, student_address: str) -> Optional[int]:
        """Get number of scholarships received by student"""
        try:
            params = [student_address]
            result = self.invoke_contract_function('get_student_scholarship_count', params)
            
            if result and result.get('success'):
                return result.get('result', {}).get('value', 0)
            
            return 0
            
        except Exception as e:
            logger.error(f"Error getting student scholarship count: {e}")
            return None

    def validate_stellar_address(self, address: str) -> bool:
        """Validate if the given string is a valid Stellar address"""
        try:
            Keypair.from_public_key(address)
            return True
        except Exception:
            return False

    def get_transaction_details(self, transaction_hash: str) -> Optional[Dict[str, Any]]:
        """Get transaction details from Stellar network"""
        try:
            transaction = self.server.transactions().transaction(transaction_hash).call()
            return {
                'hash': transaction['hash'],
                'ledger': transaction['ledger'],
                'created_at': transaction['created_at'],
                'source_account': transaction['source_account'],
                'fee_charged': transaction['fee_charged'],
                'successful': transaction['successful'],
                'operation_count': transaction['operation_count']
            }
        except Exception as e:
            logger.error(f"Failed to get transaction details for {transaction_hash}: {e}")
            return None

    def fund_account(self, public_key: str) -> bool:
        """Fund account using Friendbot (for testnet only)"""
        try:
            if Config.STELLAR_NETWORK == 'testnet':
                import requests
                response = requests.get(f"https://friendbot.stellar.org?addr={public_key}")
                if response.status_code == 200:
                    logger.info(f"Account {public_key} funded successfully")
                    return True
            elif Config.STELLAR_NETWORK == 'futurenet':
                import requests
                response = requests.get(f"https://friendbot-futurenet.stellar.org?addr={public_key}")
                if response.status_code == 200:
                    logger.info(f"Account {public_key} funded successfully")
                    return True
            return False
        except Exception as e:
            logger.error(f"Failed to fund account {public_key}: {e}")
            return False