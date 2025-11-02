from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum

class ApplicationStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    DISBURSED = "disbursed"

class ScholarshipApplication(BaseModel):
    id: Optional[str] = None
    student_wallet: str = Field(..., description="Student's Stellar wallet address")
    student_name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., description="Student's email address")
    university: str = Field(..., min_length=2, max_length=200)
    gpa: float = Field(..., ge=0.0, le=10.0, description="GPA on 10.0 scale")
    major: str = Field(..., min_length=2, max_length=100)
    year_of_study: int = Field(..., ge=1, le=8, description="Current year of study")
    annual_income: float = Field(..., ge=0, description="Annual family income in USD")
    scholarship_amount_requested: float = Field(..., gt=0, description="Requested scholarship amount")
    essay: str = Field(..., min_length=100, max_length=2000, description="Scholarship essay")
    documents: List[str] = Field(default=[], description="URLs/paths to uploaded documents")
    status: ApplicationStatus = Field(default=ApplicationStatus.PENDING)
    applied_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None
    admin_notes: Optional[str] = None
    transaction_hash: Optional[str] = None
    disbursed_amount: Optional[float] = None
    
    class Config:
        use_enum_values = True

class User(BaseModel):
    uid: str
    email: str
    wallet_address: Optional[str] = None
    role: str = Field(default="student", description="User role: student or admin")
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

class ScholarshipRecord(BaseModel):
    student_wallet: str
    amount: float
    transaction_hash: str
    timestamp: datetime
    application_id: Optional[str] = None

class DashboardStats(BaseModel):
    total_applications: int
    pending_applications: int
    approved_applications: int
    rejected_applications: int
    total_disbursed: float
    total_students_helped: int

class StudentDashboard(BaseModel):
    applications: List[ScholarshipApplication]
    total_received: float
    scholarship_history: List[ScholarshipRecord]