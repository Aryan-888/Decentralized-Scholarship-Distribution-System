#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, contractmeta, Address, Env, Vec, log
};

#[cfg(test)]
mod test;

// Contract metadata for better identification
contractmeta!(
    key = "Description",
    val = "Stellar Scholarship Distribution Smart Contract"
);

// Data structures for storing scholarship information
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ScholarshipRecord {
    pub student: Address,
    pub amount: i128,
    pub timestamp: u64,
    pub scholarship_id: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct StudentProfile {
    pub address: Address,
    pub total_received: i128,
    pub scholarship_count: u32,
    pub last_scholarship_date: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ContractStats {
    pub total_disbursed: i128,
    pub total_students: u32,
    pub total_scholarships: u32,
    pub last_scholarship_id: u64,
}

// Storage keys for contract data
// Following Stellar's storage best practices
#[contracttype]
pub enum DataKey {
    // Instance storage - persists across contract upgrades
    Admin,
    IsInitialized,
    ContractStats,
    
    // Persistent storage - for long-term data
    StudentProfile(Address),
    ScholarshipRecord(u64), // scholarship_id -> record
    
    // Temporary storage - for short-term data (automatically cleaned up)
    LastActivity,
}

#[contract]
pub struct ScholarshipContract;

#[contractimpl]
impl ScholarshipContract {
    /// Initialize the contract with an admin address
    /// Can only be called once
    pub fn init(env: Env, admin: Address) {
        // Check if already initialized
        if env.storage().instance().has(&DataKey::IsInitialized) {
            panic!("Contract already initialized");
        }

        // Require admin authorization
        admin.require_auth();

        // Set admin and mark as initialized (instance storage)
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::IsInitialized, &true);
        
        // Initialize contract stats (instance storage)
        let stats = ContractStats {
            total_disbursed: 0,
            total_students: 0,
            total_scholarships: 0,
            last_scholarship_id: 0,
        };
        env.storage().instance().set(&DataKey::ContractStats, &stats);

        // Log initialization event
        log!(&env, "Contract initialized with admin: {}", admin);
    }

    /// Release scholarship amount to a student
    /// Only callable by admin
    pub fn release_scholarship(
        env: Env, 
        admin: Address, 
        student: Address, 
        amount: i128
    ) -> u64 {
        // Verify contract is initialized
        if !env.storage().instance().has(&DataKey::IsInitialized) {
            panic!("Contract not initialized");
        }

        // Verify admin authorization
        admin.require_auth();

        // Get stored admin address
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin)
            .unwrap_or_else(|| panic!("Admin not set"));

        // Verify caller is admin
        if admin != stored_admin {
            panic!("Only admin can release scholarships");
        }

        // Validate amount
        if amount <= 0 {
            panic!("Amount must be positive");
        }

        // Get current contract stats
        let mut stats: ContractStats = env.storage().instance()
            .get(&DataKey::ContractStats)
            .unwrap_or(ContractStats {
                total_disbursed: 0,
                total_students: 0,
                total_scholarships: 0,
                last_scholarship_id: 0,
            });

        // Generate new scholarship ID
        let scholarship_id = stats.last_scholarship_id + 1;
        
        // Get or create student profile (persistent storage)
        let is_new_student = !env.storage().persistent().has(&DataKey::StudentProfile(student.clone()));
        let mut student_profile: StudentProfile = env.storage().persistent()
            .get(&DataKey::StudentProfile(student.clone()))
            .unwrap_or(StudentProfile {
                address: student.clone(),
                total_received: 0,
                scholarship_count: 0,
                last_scholarship_date: 0,
            });

        // Update student profile
        student_profile.total_received += amount;
        student_profile.scholarship_count += 1;
        student_profile.last_scholarship_date = env.ledger().timestamp();

        // Create scholarship record
        let record = ScholarshipRecord {
            student: student.clone(),
            amount,
            timestamp: env.ledger().timestamp(),
            scholarship_id,
        };

        // Store scholarship record (persistent storage)
        env.storage().persistent().set(&DataKey::ScholarshipRecord(scholarship_id), &record);
        
        // Store updated student profile
        env.storage().persistent().set(&DataKey::StudentProfile(student.clone()), &student_profile);

        // Update contract stats
        stats.total_disbursed += amount;
        stats.total_scholarships += 1;
        if is_new_student {
            stats.total_students += 1;
        }
        stats.last_scholarship_id = scholarship_id;

        // Store updated stats (instance storage)
        env.storage().instance().set(&DataKey::ContractStats, &stats);

        // Update last activity (temporary storage)
        env.storage().temporary().set(&DataKey::LastActivity, &env.ledger().timestamp());

        // Log scholarship release event
        log!(&env, "Scholarship #{} released: {} tokens to student {}", scholarship_id, amount, student);

        scholarship_id
    }

    /// Get total amount received by a specific student
    pub fn get_student_amount(env: Env, student: Address) -> i128 {
        let profile: StudentProfile = env.storage().persistent()
            .get(&DataKey::StudentProfile(student.clone()))
            .unwrap_or(StudentProfile {
                address: student,
                total_received: 0,
                scholarship_count: 0,
                last_scholarship_date: 0,
            });
        profile.total_received
    }

    /// Get student profile information
    pub fn get_student_profile(env: Env, student: Address) -> Option<StudentProfile> {
        env.storage().persistent().get(&DataKey::StudentProfile(student))
    }

    /// Get a specific scholarship record by ID
    pub fn get_scholarship_record(env: Env, scholarship_id: u64) -> Option<ScholarshipRecord> {
        env.storage().persistent().get(&DataKey::ScholarshipRecord(scholarship_id))
    }

    /// Get contract statistics
    pub fn get_contract_stats(env: Env) -> ContractStats {
        env.storage().instance()
            .get(&DataKey::ContractStats)
            .unwrap_or(ContractStats {
                total_disbursed: 0,
                total_students: 0,
                total_scholarships: 0,
                last_scholarship_id: 0,
            })
    }

    /// Get total amount disbursed by the contract
    pub fn get_total_disbursed(env: Env) -> i128 {
        let stats = Self::get_contract_stats(env);
        stats.total_disbursed
    }

    /// Get the admin address
    pub fn get_admin(env: Env) -> Option<Address> {
        env.storage().instance().get(&DataKey::Admin)
    }

    /// Get recent scholarship records (by IDs)
    pub fn get_recent_scholarships(env: Env, count: u32) -> Vec<ScholarshipRecord> {
        let stats = Self::get_contract_stats(env.clone());
        let mut result = Vec::new(&env);
        
        let start_id = if stats.last_scholarship_id >= count as u64 {
            stats.last_scholarship_id - count as u64 + 1
        } else {
            1
        };

        for id in start_id..=stats.last_scholarship_id {
            if let Some(record) = env.storage().persistent().get(&DataKey::ScholarshipRecord(id)) {
                result.push_back(record);
            }
        }

        result
    }

    /// Get scholarship count for a student
    pub fn get_student_scholarship_count(env: Env, student: Address) -> u32 {
        let profile: StudentProfile = env.storage().persistent()
            .get(&DataKey::StudentProfile(student.clone()))
            .unwrap_or(StudentProfile {
                address: student,
                total_received: 0,
                scholarship_count: 0,
                last_scholarship_date: 0,
            });
        profile.scholarship_count
    }

    /// Check if contract is initialized
    pub fn is_initialized(env: Env) -> bool {
        env.storage().instance().has(&DataKey::IsInitialized)
    }

    /// Get last activity timestamp (from temporary storage)
    pub fn get_last_activity(env: Env) -> Option<u64> {
        env.storage().temporary().get(&DataKey::LastActivity)
    }

    /// Update admin (only current admin can do this)
    pub fn update_admin(env: Env, current_admin: Address, new_admin: Address) {
        // Verify authorization
        current_admin.require_auth();

        // Get stored admin
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin)
            .unwrap_or_else(|| panic!("No admin set"));

        // Verify caller is current admin
        if current_admin != stored_admin {
            panic!("Only current admin can update admin");
        }

        // Update admin
        env.storage().instance().set(&DataKey::Admin, &new_admin);

        log!(&env, "Admin updated from {} to {}", current_admin, new_admin);
    }
}