# 🎓 Decentralized Scholarship Distribution System

A comprehensive decentralized application (DApp) for scholarship management built on the Stellar blockchain using Soroban smart contracts. This platform enables transparent, secure, and automated scholarship distribution between educational institutions and students.

## 🌟 Features

- **🎓 Student Portal**: Apply for scholarships, track application status, and manage received funds
- **👨‍💼 Admin Dashboard**: Review applications, approve/reject candidates, and distribute scholarships
- **🔗 Blockchain Integration**: All transactions recorded immutably on Stellar blockchain
- **👛 Wallet Integration**: Seamless integration with Freighter wallet for Stellar network
- **🔍 Transparency**: Complete auditability and tracking of scholarship funds
- **🔐 Secure Authentication**: Firebase-based authentication system
- **📱 Responsive Design**: Mobile-friendly interface built with modern React and TailwindCSS

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │ Smart Contract  │
│   (Next.js)     │◄──►│    (Flask)      │◄──►│   (Soroban)     │
│                 │    │                 │    │                 │
│ • React UI      │    │ • REST API      │    │ • Scholarship   │
│ • Freighter     │    │ • Firebase Auth │    │ • Fund Transfer │
│ • TailwindCSS   │    │ • Stellar SDK   │    │ • State Mgmt    │
│ • Stellar SDK   │    │ • CORS Support  │    │ • Access Control│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Firebase     │    │   Local Dev     │    │ Stellar Network │
│   Firestore     │    │   Environment   │    │   (Futurenet)   │
│                 │    │                 │    │                 │
│ • User Data     │    │ • Hot Reload    │    │ • Live Contracts│
│ • Auth Tokens   │    │ • Dev Server    │    │ • Transaction   │
│ • Session Mgmt  │    │ • Debug Mode    │    │ • History       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start Guide

### Prerequisites

Before running this project, ensure you have:

- **Node.js** (v18.0.0 or higher)
- **Python** (v3.9 or higher)
- **Rust** (latest stable version)
- **Stellar CLI** (for smart contract deployment)
- **Git** (for version control)
- **Freighter Wallet** browser extension

### 🔧 Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Aryan-888/Decentralized-Scholarship-Distribution-System.git
   cd Decentralized-Scholarship-Distribution-System
   ```

2. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env with your configuration
   # Add Firebase credentials, Stellar network settings, etc.
   ```

3. **Smart Contract Deployment**
   ```bash
   cd smart-contracts
   
   # Build the contract
   stellar contract build
   
   # Deploy to Futurenet (replace with your network preference)
   stellar contract deploy \
     --wasm target/wasm32-unknown-unknown/release/scholarship.wasm \
     --network futurenet \
     --source YOUR_SECRET_KEY
   ```

4. **Backend Setup**
   ```bash
   cd backend
   
   # Create virtual environment (recommended)
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Start the Flask server
   python app.py
   ```
   *Backend will run on `http://localhost:5000`*

5. **Frontend Setup**
   ```bash
   cd frontend
   
   # Install dependencies
   npm install
   
   # Start development server
   npm run dev
   ```
   *Frontend will run on `http://localhost:3000`*

## 📁 Project Structure

```
scholarship-dapp/
├── .env                      # Environment variables
├── README.md                # Project documentation
│
├── frontend/                # Next.js React Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css  # Global styles
│   │   │   ├── layout.js    # Root layout component
│   │   │   └── page.js      # Homepage
│   │   ├── components/
│   │   │   ├── LoginPage.jsx # Authentication component
│   │   │   ├── Navbar.jsx   # Navigation component
│   │   │   └── ui/          # Reusable UI components
│   │   │       ├── button.jsx
│   │   │       ├── card.jsx
│   │   │       └── input.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js   # Authentication hook
│   │   │   └── useWallet.js # Wallet integration hook
│   │   └── lib/
│   │       ├── api.js       # API client functions
│   │       ├── config.js    # App configuration
│   │       ├── firebase.js  # Firebase setup
│   │       ├── utils.js     # Utility functions
│   │       └── wallet.js    # Wallet utilities
│   ├── public/              # Static assets
│   ├── Dockerfile          # Docker container config
│   ├── package.json        # Dependencies and scripts
│   ├── next.config.js      # Next.js configuration
│   ├── postcss.config.mjs  # PostCSS configuration
│   ├── eslint.config.mjs   # ESLint configuration
│   └── jsconfig.json       # JavaScript configuration
│
├── backend/                 # Flask API Server
│   ├── app.py              # Main Flask application
│   ├── config.py           # Server configuration
│   ├── requirements.txt    # Python dependencies
│   ├── Dockerfile          # Docker container config
│   ├── firebase-credentials.json # Firebase service key
│   ├── models/
│   │   └── __init__.py     # Data models
│   ├── routes/
│   │   ├── admin.py        # Admin API endpoints
│   │   ├── auth.py         # Authentication endpoints
│   │   └── student.py      # Student API endpoints
│   └── services/
│       ├── auth.py         # Authentication service
│       ├── firebase_service.py # Firebase integration
│       └── stellar_service.py  # Stellar blockchain service
│
└── smart-contracts/         # Soroban Smart Contracts
    ├── Cargo.toml          # Workspace configuration
    ├── contracts/
    │   └── scholarship/
    │       ├── Cargo.toml  # Contract dependencies
    │       ├── Makefile    # Build automation
    │       └── src/
    │           ├── lib.rs  # Main contract logic
    │           └── test.rs # Contract tests
    └── target/             # Compiled contract artifacts
        └── wasm32-unknown-unknown/
            └── release/
                └── scholarship.wasm # Compiled contract
```

## �️ Technology Stack

### Frontend
- **Framework**: Next.js 16.0.1 (React 19.2.0)
- **Styling**: TailwindCSS with custom components
- **State Management**: React Hooks (useState, useEffect, custom hooks)
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Blockchain**: Stellar SDK + Freighter Wallet API
- **Authentication**: Firebase Authentication

### Backend
- **Framework**: Flask 2.3.3
- **CORS**: Flask-CORS 4.0.0
- **Database**: Firebase Firestore (via firebase-admin 6.2.0)
- **Blockchain**: Stellar SDK 13.1.0
- **Authentication**: PyJWT 2.8.0
- **Environment**: Python-dotenv 1.0.0
- **Production Server**: Gunicorn 21.2.0
- **Data Validation**: Pydantic 2.4.2

### Smart Contracts
- **Language**: Rust
- **Framework**: Soroban SDK 21.0.0
- **Build Target**: wasm32-unknown-unknown
- **Optimization**: Release profile with maximum optimization

### Development & Deployment
- **Containerization**: Docker (frontend & backend)
- **Version Control**: Git
- **Blockchain Network**: Stellar Futurenet (testnet)
- **Package Managers**: npm (frontend), pip (backend), cargo (contracts)

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STELLAR_NETWORK=futurenet
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address_here

# Backend Configuration
FLASK_ENV=development
FLASK_DEBUG=true
STELLAR_NETWORK=futurenet
CONTRACT_ADDRESS=your_contract_address_here

# Firebase Configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
```

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Enable Authentication (Email/Password)
4. Generate a service account key
5. Download the JSON key and place it as `firebase-credentials.json` in the backend directory

### Admin User Setup

**Important**: The project does not have an automated admin registration system. Admin users must be created manually.

#### Creating Your First Admin User

**Method 1: Using Firebase Console (Recommended)**

1. Register a regular user account through the application login page
2. Go to [Firebase Console](https://console.firebase.google.com/)
3. Select your project
4. Navigate to **Firestore Database**
5. Find the `users` collection
6. Locate your user document by UID (visible after login)
7. Click on the document and edit it
8. Change the `role` field from `"student"` to `"admin"`
9. Save the changes
10. Log out and log back in to access the admin panel

**Method 2: Using Python Script**

Create a file `create_admin.py` in the backend directory:

```python
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase
cred = credentials.Certificate('firebase-credentials.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

# Set user as admin (replace with your user's UID)
user_uid = 'YOUR_USER_UID_HERE'  # Get this from Firebase Console after user registers

db.collection('users').document(user_uid).update({
    'role': 'admin'
})

print(f"✅ User {user_uid} is now an admin!")
```

Run the script:
```bash
cd backend
python create_admin.py
```

#### User Roles in the System

- **`student`** (default): Can apply for scholarships, view application status, and manage their profile
- **`admin`**: Can review applications, approve/reject scholarships, view statistics, and access the admin dashboard

#### How Authentication Works

1. Users log in via Firebase Authentication (Google/Email)
2. On first login, a user profile is automatically created with `role: 'student'`
3. The backend validates user role using the `@admin_required` decorator for admin endpoints
4. Frontend checks `user.role === 'admin'` to show/hide admin navigation

#### Security Note

⚠️ **Never hardcode admin credentials in your application**. Always assign admin roles through the Firebase Console or a secure backend script with proper authentication.

## 🧪 Development Workflow

### Running the Development Environment

1. **Start Backend**:
   ```bash
   cd backend
   python app.py  # Runs on http://localhost:5000
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev    # Runs on http://localhost:3000
   ```

3. **Deploy Smart Contract** (if changes made):
   ```bash
   cd smart-contracts
   stellar contract build
   stellar contract deploy --wasm target/wasm32-unknown-unknown/release/scholarship.wasm --network futurenet
   ```

### Available Scripts

**Frontend**:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

**Smart Contracts**:
- `stellar contract build` - Compile contracts
- `stellar contract test` - Run contract tests
- `cargo test` - Run Rust tests

## 🐳 Docker Deployment

### Build and Run with Docker

1. **Backend**:
   ```bash
   cd backend
   docker build -t scholarship-backend .
   docker run -p 5000:5000 --env-file ../.env scholarship-backend
   ```

2. **Frontend**:
   ```bash
   cd frontend
   docker build -t scholarship-frontend .
   docker run -p 3000:3000 scholarship-frontend
   ```

### Docker Compose (Optional)

Create a `docker-compose.yml` in the root directory for orchestrated deployment:

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    env_file:
      - .env
    
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

Then run: `docker-compose up --build`

## 📜 Smart Contract Documentation

### Overview

The Decentralized Scholarship Distribution System smart contract is the backbone of our scholarship ecosystem, built on the Stellar blockchain using Soroban SDK. It manages the entire scholarship lifecycle from approval to fund disbursement while maintaining comprehensive records and ensuring transparency.

**Contract ID**: `GCCJH255L2DOTQNRZDBT7KKLBDWGNKTE3FR6QZTTT64O4SDWV3ZI4UDN`
![alt text](<Screenshot 2025-11-02 150338.png>)

### Core Features

#### 🛡️ **Secure Fund Management**
- **Multi-signature Security**: Advanced cryptographic security ensuring only authorized personnel can distribute scholarships
- **Immutable Records**: All transactions permanently recorded on the Stellar blockchain for complete audit trails
- **Access Control**: Role-based permissions ensuring only administrators can release funds while maintaining transparency
- **Admin-only Distribution**: Contract functions restricted to verified administrator addresses with proper authentication

#### 📈 **Comprehensive Analytics**
- **Real-time Statistics**: Live tracking of total disbursements, student counts, and scholarship distribution metrics
- **Student Profiles**: Detailed records of individual student scholarship history and achievements
- **Performance Metrics**: Contract-level statistics for monitoring system efficiency and impact measurement
- **Activity Tracking**: Comprehensive logging of all contract interactions and state changes

#### 🌐 **Blockchain Integration**
- **Stellar Network**: Built on Stellar's fast, low-cost, and environmentally friendly blockchain
- **WASM Optimization**: Compiled to WebAssembly for optimal performance and cross-platform compatibility
- **Soroban SDK 21.0.0**: Leveraging Stellar's advanced smart contract framework for reliability and security
- **Storage Efficiency**: Optimized storage patterns using instance, persistent, and temporary storage tiers

### Smart Contract Functions

#### Core Administrative Functions
```rust
// Initialize the contract with an administrator
pub fn init(admin: Address) -> Result<(), Error>

// Transfer administrator role to a new address
pub fn update_admin(new_admin: Address) -> Result<(), Error>
```

#### Scholarship Management
```rust
// Release scholarship funds to a student
pub fn release_scholarship(
    student: Address, 
    amount: i128, 
    scholarship_id: String
) -> Result<(), Error>

// Get comprehensive student profile and scholarship history
pub fn get_student_profile(student: Address) -> Result<StudentProfile, Error>

// Get real-time contract statistics
pub fn get_contract_stats() -> Result<ContractStats, Error>
```

#### Data Structures
```rust
pub struct StudentProfile {
    pub total_received: i128,
    pub scholarship_count: u32,
    pub last_scholarship_date: u64,
    pub scholarships: Vec<ScholarshipRecord>,
}

pub struct ContractStats {
    pub total_disbursed: i128,
    pub total_students: u32,
    pub total_scholarships: u32,
    pub admin: Address,
}

pub struct ScholarshipRecord {
    pub amount: i128,
    pub scholarship_id: String,
    pub timestamp: u64,
}
```

### Contract Deployment

#### Build the Contract
```bash
cd smart-contracts
stellar contract build
```

#### Deploy to Stellar Network
```bash
# Deploy to Futurenet (testnet)
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/scholarship.wasm \
  --network futurenet \
  --source YOUR_SECRET_KEY

# Deploy to Mainnet (production)
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/scholarship.wasm \
  --network mainnet \
  --source YOUR_SECRET_KEY
```

#### Initialize the Contract
```bash
stellar contract invoke \
  --id CONTRACT_ID \
  --source-account ADMIN_SECRET_KEY \
  --network futurenet \
  -- init \
  --admin ADMIN_PUBLIC_KEY
```

### Security Considerations

#### Access Control
- Only the designated administrator can release scholarship funds
- Admin role can be transferred to a new address if needed
- All critical functions require proper authentication

#### Data Integrity
- All scholarship distributions are permanently recorded on the blockchain
- Student profiles and contract statistics are tamper-proof
- Comprehensive audit trails for all transactions

#### Financial Security
- Funds are only released through authenticated admin transactions
- No arbitrary fund withdrawals or unauthorized access
- Built-in protection against common smart contract vulnerabilities

### Performance Optimizations

#### Storage Efficiency
- **Instance Storage**: Contract configuration and admin data
- **Persistent Storage**: Long-term student profiles and scholarship records
- **Temporary Storage**: Intermediate calculations and validations

#### Gas Optimization
- Efficient data structures to minimize storage costs
- Optimized function calls to reduce transaction fees
- Batch operations support for multiple scholarship distributions

### Future Enhancements

#### Immediate Roadmap (6-12 months)
- **Conditional Payments**: Milestone-based scholarship releases tied to academic performance
- **Multi-institutional Support**: Support for multiple educational institutions
- **Batch Processing**: Enhanced batch operations for hundreds of scholarships
- **Emergency Controls**: Admin pause functionality for security concerns

#### Long-term Vision (1-3 years)
- **Cross-chain Compatibility**: Extension to Ethereum, Polygon, and other networks
- **DeFi Integration**: Yield generation on scholarship pools
- **Oracle Integration**: Real-world data feeds for performance verification
- **Zero-Knowledge Privacy**: Enhanced privacy while maintaining transparency

### Testing and Verification

#### Unit Tests
```bash
cd smart-contracts
cargo test
```

#### Integration Tests
```bash
stellar contract test --network futurenet
```

#### Contract Verification
The contract source code is open-source and can be verified against the deployed bytecode. All functions are thoroughly tested and audited for security vulnerabilities.

### Error Handling

#### Common Error Codes
- `NotAuthorized`: Caller is not the contract administrator
- `StudentNotFound`: Student address not found in records
- `InvalidAmount`: Scholarship amount must be positive
- `ContractNotInitialized`: Contract must be initialized before use

#### Best Practices
- Always check function return values for errors
- Implement proper error handling in client applications
- Use try-catch blocks when calling contract functions
- Validate input parameters before making contract calls

## � API Documentation

### Backend Endpoints

**Authentication**
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout

**Student Routes**
- `GET /student/profile` - Get student profile
- `PUT /student/profile` - Update student profile
- `POST /student/apply` - Submit scholarship application
- `GET /student/applications` - Get student's applications

**Admin Routes**
- `GET /admin/applications` - Get all applications
- `PUT /admin/applications/:id/approve` - Approve application
- `PUT /admin/applications/:id/reject` - Reject application
- `POST /admin/disburse` - Disburse scholarship funds

### Smart Contract Functions

**Core Functions**
- `init(admin: Address)` - One-time contract initialization with administrator setup
- `release_scholarship(student: Address, amount: i128, scholarship_id: String)` - Secure scholarship distribution to verified students
- `get_student_profile(student: Address)` - Retrieve comprehensive student scholarship history and profile
- `get_contract_stats()` - Access real-time contract performance and distribution statistics
- `update_admin(new_admin: Address)` - Secure administrator role transfer functionality

## 🔍 Testing

### Frontend Testing
```bash
cd frontend
npm test                 # Run unit tests
npm run test:e2e        # Run end-to-end tests (if configured)
```

### Backend Testing
```bash
cd backend
python -m pytest tests/ # Run Python tests
python -m pytest tests/ --cov=. # Run with coverage
```

### Smart Contract Testing
```bash
cd smart-contracts
cargo test              # Run Rust tests
stellar contract test   # Run Soroban tests
```

## 🔒 Security Considerations

- **Private Keys**: Never commit private keys or sensitive credentials
- **Environment Variables**: Use `.env` files for configuration
- **CORS**: Properly configured for production domains
- **Authentication**: JWT tokens with expiration
- **Smart Contract**: Input validation and access control implemented
- **Firebase Rules**: Secure database access rules configured

## 🚧 Troubleshooting

### Common Issues

**Freighter Wallet Connection**
- Ensure Freighter extension is installed and unlocked
- Switch to Futurenet in Freighter settings
- Clear browser cache if connection fails

**Smart Contract Deployment**
- Verify Stellar CLI is properly installed
- Check network configuration in Stellar CLI
- Ensure sufficient testnet funds for deployment

**Backend Issues**
- Check Python version compatibility (3.9+)
- Verify Firebase credentials are properly configured
- Ensure all required environment variables are set

**Frontend Issues**
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version compatibility (18+)

### Getting Help

- Check the [Issues](https://github.com/Aryan-888/Decentralized-Scholarship-Distribution-System/issues) section for known problems
- Review the [Stellar Documentation](https://developers.stellar.org/)
- Visit [Soroban Documentation](https://soroban.stellar.org/)

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Process

1. **Fork the Repository**
   ```bash
   git fork https://github.com/Aryan-888/Decentralized-Scholarship-Distribution-System.git
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**
   - Follow existing code style and conventions
   - Add tests for new functionality
   - Update documentation as needed

4. **Test Your Changes**
   ```bash
   # Run all tests
   npm test                    # Frontend tests
   python -m pytest          # Backend tests
   cargo test                 # Smart contract tests
   ```

5. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Provide clear description of changes
   - Reference any related issues
   - Include screenshots for UI changes

### Code Style Guidelines

- **Frontend**: Follow ESLint configuration
- **Backend**: Follow PEP 8 Python style guide
- **Smart Contracts**: Follow Rust formatting with `cargo fmt`
- **Commits**: Use conventional commit messages

### Reporting Issues

When reporting issues, please include:
- Operating system and version
- Node.js and Python versions
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots or error logs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## � Contact & Support

- **Project Maintainer**: [Aryan](https://github.com/Aryan-888)
- **GitHub Repository**: [https://github.com/Aryan-888/Decentralized-Scholarship-Distribution-System](https://github.com/Aryan-888/Decentralized-Scholarship-Distribution-System)
- **Issues & Bug Reports**: [GitHub Issues](https://github.com/Aryan-888/Decentralized-Scholarship-Distribution-System/issues)
- **Documentation**: [Project Wiki](https://github.com/Aryan-888/Decentralized-Scholarship-Distribution-System/wiki) (if available)

## �🙏 Acknowledgments

- **Stellar Development Foundation** for the Soroban smart contract platform
- **Firebase** for authentication and database services
- **Next.js Team** for the excellent React framework
- **TailwindCSS** for the utility-first CSS framework
- **Open Source Community** for the amazing tools and libraries

---

**Built with ❤️ for transparent and accessible education funding**