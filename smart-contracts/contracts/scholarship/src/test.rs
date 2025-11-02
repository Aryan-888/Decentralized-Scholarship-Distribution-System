#[cfg(test)]
mod test {
    use soroban_sdk::{testutils::{Address as _, Ledger}, Address, Env};
    use crate::{ScholarshipContract, ScholarshipContractClient};

    #[test]
    fn test_initialization() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, ScholarshipContract);
        let client = ScholarshipContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);

        // Test initialization
        client.init(&admin);
        assert_eq!(client.get_admin(), Some(admin.clone()));
        
        let stats = client.get_contract_stats();
        assert_eq!(stats.total_disbursed, 0);
        assert_eq!(stats.total_students, 0);
        assert_eq!(stats.total_scholarships, 0);
        
        assert!(client.is_initialized());
    }

    #[test]
    fn test_scholarship_release() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, ScholarshipContract);
        let client = ScholarshipContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let student = Address::generate(&env);

        // Initialize contract
        client.init(&admin);

        // Release scholarship
        let scholarship_id = client.release_scholarship(&admin, &student, &1000);
        assert_eq!(scholarship_id, 1);

        // Verify amounts and stats
        assert_eq!(client.get_student_amount(&student), 1000);
        assert_eq!(client.get_total_disbursed(), 1000);
        assert_eq!(client.get_student_scholarship_count(&student), 1);
        
        let stats = client.get_contract_stats();
        assert_eq!(stats.total_disbursed, 1000);
        assert_eq!(stats.total_students, 1);
        assert_eq!(stats.total_scholarships, 1);
        assert_eq!(stats.last_scholarship_id, 1);

        // Verify scholarship record
        let record = client.get_scholarship_record(&1);
        assert!(record.is_some());
        let record = record.unwrap();
        assert_eq!(record.student, student);
        assert_eq!(record.amount, 1000);
        assert_eq!(record.scholarship_id, 1);
    }

    #[test]
    fn test_multiple_scholarships() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, ScholarshipContract);
        let client = ScholarshipContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let student1 = Address::generate(&env);
        let student2 = Address::generate(&env);

        // Initialize contract
        client.init(&admin);

        // Release multiple scholarships
        let id1 = client.release_scholarship(&admin, &student1, &1000);
        let id2 = client.release_scholarship(&admin, &student2, &1500);
        let id3 = client.release_scholarship(&admin, &student1, &500);

        assert_eq!(id1, 1);
        assert_eq!(id2, 2);
        assert_eq!(id3, 3);

        // Verify amounts
        assert_eq!(client.get_student_amount(&student1), 1500);
        assert_eq!(client.get_student_amount(&student2), 1500);
        assert_eq!(client.get_total_disbursed(), 3000);
        assert_eq!(client.get_student_scholarship_count(&student1), 2);
        assert_eq!(client.get_student_scholarship_count(&student2), 1);

        // Verify stats
        let stats = client.get_contract_stats();
        assert_eq!(stats.total_disbursed, 3000);
        assert_eq!(stats.total_students, 2);
        assert_eq!(stats.total_scholarships, 3);
        assert_eq!(stats.last_scholarship_id, 3);
    }

    #[test]
    fn test_admin_update() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, ScholarshipContract);
        let client = ScholarshipContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let new_admin = Address::generate(&env);

        // Initialize contract
        client.init(&admin);
        assert_eq!(client.get_admin(), Some(admin.clone()));

        // Update admin
        client.update_admin(&admin, &new_admin);
        assert_eq!(client.get_admin(), Some(new_admin.clone()));
    }

    #[test]
    fn test_student_profile() {
        let env = Env::default();
        env.mock_all_auths();
        
        // Set a mock timestamp
        env.ledger().with_mut(|li| {
            li.timestamp = 1234567890;
        });
        
        let contract_id = env.register_contract(None, ScholarshipContract);
        let client = ScholarshipContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let student = Address::generate(&env);

        // Initialize contract
        client.init(&admin);

        // Initially no profile
        assert_eq!(client.get_student_profile(&student), None);

        // Release scholarship
        client.release_scholarship(&admin, &student, &1000);

        // Check profile
        let profile = client.get_student_profile(&student).unwrap();
        assert_eq!(profile.address, student);
        assert_eq!(profile.total_received, 1000);
        assert_eq!(profile.scholarship_count, 1);
        assert!(profile.last_scholarship_date > 0);
    }

    #[test]
    fn test_contract_stats() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, ScholarshipContract);
        let client = ScholarshipContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let student1 = Address::generate(&env);
        let student2 = Address::generate(&env);

        // Initialize contract
        client.init(&admin);

        // Initial stats
        let stats = client.get_contract_stats();
        assert_eq!(stats.total_disbursed, 0);
        assert_eq!(stats.total_students, 0);
        assert_eq!(stats.total_scholarships, 0);
        assert_eq!(stats.last_scholarship_id, 0);

        // Release scholarships
        client.release_scholarship(&admin, &student1, &1000);
        client.release_scholarship(&admin, &student2, &2000);
        client.release_scholarship(&admin, &student1, &500);

        // Final stats
        let stats = client.get_contract_stats();
        assert_eq!(stats.total_disbursed, 3500);
        assert_eq!(stats.total_students, 2);
        assert_eq!(stats.total_scholarships, 3);
        assert_eq!(stats.last_scholarship_id, 3);
    }

    #[test]
    fn test_recent_scholarships() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, ScholarshipContract);
        let client = ScholarshipContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let student1 = Address::generate(&env);
        let student2 = Address::generate(&env);

        // Initialize contract
        client.init(&admin);

        // Release scholarships
        client.release_scholarship(&admin, &student1, &1000);
        client.release_scholarship(&admin, &student2, &2000);
        client.release_scholarship(&admin, &student1, &500);

        // Get recent scholarships
        let recent = client.get_recent_scholarships(&2);
        assert_eq!(recent.len(), 2);
        
        // Should get scholarships 2 and 3 (most recent)
        assert_eq!(recent.get(0).unwrap().scholarship_id, 2);
        assert_eq!(recent.get(1).unwrap().scholarship_id, 3);
        assert_eq!(recent.get(0).unwrap().amount, 2000);
        assert_eq!(recent.get(1).unwrap().amount, 500);
    }
}