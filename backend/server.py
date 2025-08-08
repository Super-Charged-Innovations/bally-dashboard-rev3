from fastapi import FastAPI, HTTPException, Depends, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pymongo import MongoClient
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
import json
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field
from passlib.context import CryptContext
from jose import JWTError, jwt
from cryptography.fernet import Fernet
import hashlib
import uuid
import asyncio
from bson import ObjectId
import logging

load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Bally's Casino Admin Dashboard API",
    description="Enterprise Casino Management Platform - Sri Lanka Compliant",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security Configuration
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Environment Variables
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "ballys_casino_admin")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")

# Initialize encryption
if ENCRYPTION_KEY:
    cipher_suite = Fernet(ENCRYPTION_KEY.encode())
else:
    cipher_suite = Fernet(Fernet.generate_key())

# Database connection
client = MongoClient(MONGO_URL)
db = client[DATABASE_NAME]

# Collections
admin_users_col = db.admin_users
members_col = db.members
gaming_sessions_col = db.gaming_sessions
gaming_packages_col = db.gaming_packages
rewards_col = db.rewards
audit_logs_col = db.audit_logs
system_settings_col = db.system_settings
marketing_campaigns_col = db.marketing_campaigns
travel_itineraries_col = db.travel_itineraries
staff_col = db.staff
compliance_logs_col = db.compliance_logs
# Phase 2 Collections
customer_analytics_col = db.customer_analytics
walk_in_guests_col = db.walk_in_guests
vip_experiences_col = db.vip_experiences
group_bookings_col = db.group_bookings
birthday_calendar_col = db.birthday_calendar
# Phase 3 Collections
staff_members_col = db.staff_members
training_courses_col = db.training_courses
training_records_col = db.training_records
performance_reviews_col = db.performance_reviews
advanced_analytics_col = db.advanced_analytics
cost_optimization_col = db.cost_optimization
predictive_models_col = db.predictive_models

# Phase 4 Collections - Enterprise Features
notifications_col = db.notifications
notification_templates_col = db.notification_templates
compliance_reports_col = db.compliance_reports
system_integrations_col = db.system_integrations
user_activity_tracking_col = db.user_activity_tracking
real_time_events_col = db.real_time_events
data_retention_policies_col = db.data_retention_policies

# Pydantic Models
class AdminUser(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: EmailStr
    full_name: str
    role: str  # SuperAdmin, GeneralAdmin, Manager, Supervisor
    department: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    permissions: List[str] = []
    two_factor_enabled: bool = False

class AdminUserCreate(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    role: str
    department: Optional[str] = None
    password: str
    permissions: List[str] = []

class Member(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    member_number: str
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    date_of_birth: datetime
    nationality: str
    nic_passport: str  # Encrypted
    tier: str  # Ruby, Sapphire, Diamond, VIP
    points_balance: float = 0.0
    total_points_earned: float = 0.0
    lifetime_spend: float = 0.0
    registration_date: datetime = Field(default_factory=datetime.utcnow)
    last_visit: Optional[datetime] = None
    is_active: bool = True
    self_excluded: bool = False
    kyc_verified: bool = False
    marketing_consent: bool = False
    preferences: Dict[str, Any] = {}

class GamingSession(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    member_id: str
    session_start: datetime = Field(default_factory=datetime.utcnow)
    session_end: Optional[datetime] = None
    game_type: str
    table_number: Optional[str] = None
    machine_number: Optional[str] = None
    buy_in_amount: float
    cash_out_amount: Optional[float] = None
    net_result: Optional[float] = None
    points_earned: float = 0.0
    status: str = "active"  # active, completed, suspended

class GamingPackage(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    credits: float
    validity_hours: int
    tier_access: List[str] = ["Ruby", "Sapphire", "Diamond", "VIP"]
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class RewardItem(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    category: str  # dining, accommodation, gaming, merchandise
    points_required: float
    cash_value: float
    tier_access: List[str] = ["Ruby", "Sapphire", "Diamond", "VIP"]
    stock_quantity: Optional[int] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AuditLog(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    admin_user_id: str
    admin_username: str
    action: str
    resource: str
    resource_id: Optional[str] = None
    details: Dict[str, Any] = {}
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user_info: Dict[str, Any]

class DashboardMetrics(BaseModel):
    total_members: int
    members_by_tier: Dict[str, int]
    active_sessions: int
    daily_revenue: float
    weekly_revenue: float
    monthly_revenue: float
    top_games: List[Dict[str, Any]]
    recent_registrations: int

# Phase 2 Models - Marketing Intelligence & Travel Management

class MarketingCampaign(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    campaign_type: str  # birthday, inactive, vip, general
    target_audience: List[str]  # tier restrictions or criteria
    start_date: datetime
    end_date: datetime
    budget: float
    estimated_reach: int
    actual_reach: Optional[int] = 0
    conversion_rate: Optional[float] = 0.0
    status: str = "draft"  # draft, active, completed, paused
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CustomerAnalytics(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    member_id: str
    last_activity_date: datetime
    visit_frequency: float  # visits per month
    avg_session_duration: float  # minutes
    avg_spend_per_visit: float
    favorite_games: List[str]
    preferred_visit_times: List[str]  # morning, afternoon, evening, late_night
    social_interactions: int  # likes, comments, posts
    birthday_month: int
    preferred_drinks: List[str]
    dietary_preferences: List[str]
    risk_score: float  # churn prediction score
    marketing_segments: List[str]
    last_updated: datetime = Field(default_factory=datetime.utcnow)

class WalkInGuest(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    first_name: str
    last_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    nationality: str
    id_document: str  # encrypted
    visit_date: datetime = Field(default_factory=datetime.utcnow)
    entry_time: datetime = Field(default_factory=datetime.utcnow)
    exit_time: Optional[datetime] = None
    spend_amount: Optional[float] = None
    games_played: List[str] = []
    services_used: List[str] = []
    converted_to_member: bool = False
    follow_up_required: bool = False
    notes: Optional[str] = None
    marketing_consent: bool = False

class VIPExperience(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    member_id: str
    experience_type: str  # arrival, gaming, dining, entertainment, departure
    scheduled_date: datetime
    actual_date: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    services_included: List[str]
    special_requests: List[str] = []
    assigned_staff: List[str] = []
    cost: float = 0.0
    satisfaction_score: Optional[int] = None  # 1-10 scale
    feedback: Optional[str] = None
    status: str = "planned"  # planned, in_progress, completed, cancelled
    created_at: datetime = Field(default_factory=datetime.utcnow)

class GroupBooking(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    group_name: str
    contact_person: str
    contact_email: str
    contact_phone: str
    group_size: int
    group_type: str  # corporate, celebration, tournament, leisure
    booking_date: datetime
    arrival_date: datetime
    departure_date: datetime
    special_requirements: List[str] = []
    budget_range: str  # low, medium, high, premium
    services_requested: List[str] = []
    assigned_coordinator: Optional[str] = None
    total_estimated_value: float = 0.0
    actual_value: Optional[float] = None
    status: str = "inquiry"  # inquiry, confirmed, in_progress, completed, cancelled
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BirthdayCalendar(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    member_id: str
    member_name: str
    email: str
    phone: str
    tier: str
    birthday_date: datetime
    birth_month: int
    birth_day: int
    preferred_celebration_type: Optional[str] = None  # dining, gaming, entertainment
    gift_preferences: List[str] = []
    notification_sent: bool = False
    campaign_id: Optional[str] = None
    response_received: bool = False
    celebration_booked: bool = False
    last_birthday_spend: Optional[float] = None

# Phase 4 Models - Enterprise Features

class NotificationTemplate(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str  # security, compliance, marketing, system, user_activity
    title: str
    content: str
    variables: List[str] = []  # Placeholder variables like {user_name}, {amount}
    channels: List[str] = []  # email, sms, push, in_app
    priority: str = "normal"  # low, normal, high, critical
    is_active: bool = True
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Notification(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    template_id: Optional[str] = None
    recipient_type: str  # user, admin, system
    recipient_id: Optional[str] = None  # User ID or Admin ID
    recipient_email: Optional[str] = None
    recipient_phone: Optional[str] = None
    title: str
    content: str
    category: str
    priority: str = "normal"
    channels: List[str] = ["in_app"]
    status: str = "pending"  # pending, sent, delivered, failed, read
    scheduled_at: Optional[datetime] = None
    sent_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    read_at: Optional[datetime] = None
    metadata: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ComplianceReport(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    report_type: str  # audit_trail, data_retention, kyc_compliance, aml_report, gambling_activity
    report_period_start: datetime
    report_period_end: datetime
    generated_by: str
    status: str = "draft"  # draft, completed, submitted, approved
    summary: Dict[str, Any] = {}
    violations: List[Dict[str, Any]] = []
    recommendations: List[str] = []
    file_path: Optional[str] = None  # Path to generated report file
    submitted_to: Optional[str] = None  # Regulatory body
    submission_date: Optional[datetime] = None
    compliance_score: Optional[float] = None  # 0-100
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class SystemIntegration(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    integration_type: str  # payment_gateway, analytics_service, regulatory_api, email_service
    provider: str  # stripe, sendgrid, google_analytics, etc
    endpoint_url: Optional[str] = None
    api_key_encrypted: Optional[str] = None  # Encrypted API keys
    webhook_url: Optional[str] = None
    configuration: Dict[str, Any] = {}
    status: str = "active"  # active, inactive, error, testing
    last_sync: Optional[datetime] = None
    sync_frequency: str = "hourly"  # realtime, hourly, daily, weekly
    error_count: int = 0
    last_error: Optional[str] = None
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserActivityTracking(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    user_type: str  # member, admin, guest
    user_id: str
    session_id: str
    activity_type: str  # page_view, action, transaction, login, logout
    page_url: Optional[str] = None
    action_name: Optional[str] = None
    duration_seconds: Optional[int] = None
    device_type: str  # desktop, mobile, tablet
    browser: Optional[str] = None
    ip_address: str
    location: Optional[Dict[str, Any]] = None  # city, country, coordinates
    referrer: Optional[str] = None
    metadata: Dict[str, Any] = {}
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class RealTimeEvent(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    event_type: str  # user_action, system_alert, security_incident, compliance_violation
    severity: str = "info"  # info, warning, error, critical
    source: str  # system component that generated the event
    user_id: Optional[str] = None
    admin_id: Optional[str] = None
    title: str
    description: str
    data: Dict[str, Any] = {}
    requires_action: bool = False
    action_taken: bool = False
    action_by: Optional[str] = None
    action_notes: Optional[str] = None
    resolved: bool = False
    resolved_by: Optional[str] = None
    resolved_at: Optional[datetime] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class DataRetentionPolicy(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    policy_name: str
    data_category: str  # member_data, gaming_logs, audit_logs, marketing_data
    retention_period_days: int
    archive_after_days: Optional[int] = None
    auto_delete: bool = False
    encryption_required: bool = True
    backup_required: bool = True
    legal_basis: str  # PDPA compliance reason
    exceptions: List[str] = []
    status: str = "active"  # active, inactive, pending_approval
    created_by: str
    approved_by: Optional[str] = None
    approval_date: Optional[datetime] = None
    next_review_date: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class StaffMember(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    employee_id: str
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    position: str
    department: str  # Gaming, F&B, Security, Management, Maintenance
    hire_date: datetime
    salary: float  # Encrypted in storage
    manager_id: Optional[str] = None
    employment_status: str = "active"  # active, inactive, terminated
    skills: List[str] = []
    certifications: List[str] = []
    performance_score: float = 0.0  # 0-100 scale
    commitment_score: float = 0.0  # 0-100 scale based on attendance, tasks, etc.
    training_completion_rate: float = 0.0
    last_performance_review: Optional[datetime] = None
    next_review_due: Optional[datetime] = None
    emergency_contact: Dict[str, str] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_updated: datetime = Field(default_factory=datetime.utcnow)

class TrainingCourse(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    course_name: str
    description: str
    category: str  # safety, technical, customer_service, compliance, leadership
    difficulty_level: str = "beginner"  # beginner, intermediate, advanced
    duration_hours: int
    required_for_positions: List[str] = []
    prerequisites: List[str] = []
    content_modules: List[str] = []
    assessment_questions: List[Dict[str, Any]] = []
    passing_score: int = 70
    validity_months: Optional[int] = None  # Course expiry for certifications
    is_mandatory: bool = False
    created_by: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_updated: datetime = Field(default_factory=datetime.utcnow)

class TrainingRecord(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    staff_id: str
    course_id: str
    enrollment_date: datetime = Field(default_factory=datetime.utcnow)
    start_date: Optional[datetime] = None
    completion_date: Optional[datetime] = None
    score: Optional[int] = None
    status: str = "enrolled"  # enrolled, in_progress, completed, failed, expired
    attempt_number: int = 1
    time_spent_minutes: int = 0
    modules_completed: List[str] = []
    certificate_issued: bool = False
    certificate_expiry: Optional[datetime] = None
    feedback: Optional[str] = None
    instructor_notes: Optional[str] = None

class PerformanceReview(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    staff_id: str
    reviewer_id: str
    review_period_start: datetime
    review_period_end: datetime
    overall_rating: int  # 1-5 scale
    performance_areas: Dict[str, int] = {}  # area_name: rating
    achievements: List[str] = []
    areas_for_improvement: List[str] = []
    goals_set: List[str] = []
    training_recommendations: List[str] = []
    salary_adjustment: Optional[float] = None
    promotion_recommended: bool = False
    disciplinary_actions: List[str] = []
    employee_comments: Optional[str] = None
    reviewer_comments: Optional[str] = None
    review_status: str = "draft"  # draft, completed, approved
    created_at: datetime = Field(default_factory=datetime.utcnow)
    approved_by: Optional[str] = None
    approval_date: Optional[datetime] = None

class AdvancedAnalytics(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    analysis_type: str  # customer_ltv, churn_prediction, revenue_forecast, operational_efficiency
    analysis_date: datetime = Field(default_factory=datetime.utcnow)
    time_period: str  # daily, weekly, monthly, quarterly, yearly
    data_points: Dict[str, Any] = {}
    insights: List[str] = []
    recommendations: List[str] = []
    confidence_score: float = 0.0  # 0-100 model confidence
    created_by: str
    is_active: bool = True

class CostOptimization(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    optimization_area: str  # staffing, energy, inventory, marketing, operations
    current_cost: float
    projected_savings: float
    implementation_cost: float
    roi_percentage: float
    timeline_weeks: int
    implementation_status: str = "proposed"  # proposed, approved, in_progress, completed, rejected
    priority_level: str = "medium"  # low, medium, high, critical
    responsible_department: str
    success_metrics: List[str] = []
    risks: List[str] = []
    mitigation_strategies: List[str] = []
    actual_savings: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class PredictiveModel(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    model_name: str
    model_type: str  # churn_prediction, demand_forecasting, price_optimization, staff_scheduling
    description: str
    input_features: List[str] = []
    target_variable: str
    algorithm_used: str
    training_data_size: int
    accuracy_score: float
    precision_score: float
    recall_score: float
    last_trained: datetime = Field(default_factory=datetime.utcnow)
    model_version: str = "1.0"
    is_production: bool = False
    predictions_made: int = 0
    success_rate: float = 0.0
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Utility Functions
def encrypt_sensitive_data(data: str) -> str:
    """Encrypt sensitive personal data for PDPA compliance"""
    try:
        return cipher_suite.encrypt(data.encode()).decode()
    except Exception as e:
        logging.error(f"Encryption error: {e}")
        return data

def decrypt_sensitive_data(encrypted_data: str) -> str:
    """Decrypt sensitive personal data"""
    try:
        return cipher_suite.decrypt(encrypted_data.encode()).decode()
    except Exception as e:
        logging.error(f"Decryption error: {e}")
        return encrypted_data

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

async def log_admin_action(admin_user_id: str, admin_username: str, action: str, 
                          resource: str, resource_id: str = None, details: dict = None,
                          ip_address: str = None):
    """Log admin actions for audit trail"""
    audit_log = AuditLog(
        admin_user_id=admin_user_id,
        admin_username=admin_username,
        action=action,
        resource=resource,
        resource_id=resource_id,
        details=details or {},
        ip_address=ip_address
    )
    audit_logs_col.insert_one(audit_log.dict())

# Authentication Routes
@app.post("/api/auth/login", response_model=TokenResponse)
async def login(login_request: LoginRequest):
    """Admin user login with role-based access"""
    admin_user = admin_users_col.find_one({"username": login_request.username})
    
    if not admin_user or not pwd_context.verify(login_request.password, admin_user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    if not admin_user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )
    
    # Update last login
    admin_users_col.update_one(
        {"_id": admin_user["_id"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": admin_user["username"], "role": admin_user["role"], "user_id": admin_user["id"]},
        expires_delta=access_token_expires
    )
    
    # Create refresh token (longer expiry)
    refresh_token = create_access_token(
        data={"sub": admin_user["username"], "type": "refresh"},
        expires_delta=timedelta(days=7)
    )
    
    # Log login action
    await log_admin_action(
        admin_user["id"], admin_user["username"], 
        "login", "auth", details={"role": admin_user["role"]}
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user_info={
            "id": admin_user["id"],
            "username": admin_user["username"],
            "full_name": admin_user["full_name"],
            "role": admin_user["role"],
            "permissions": admin_user.get("permissions", [])
        }
    )

@app.get("/api/auth/me")
async def get_current_user(token_payload: dict = Depends(verify_token)):
    """Get current admin user info"""
    admin_user = admin_users_col.find_one({"username": token_payload["sub"]})
    if not admin_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": admin_user["id"],
        "username": admin_user["username"],
        "full_name": admin_user["full_name"],
        "role": admin_user["role"],
        "permissions": admin_user.get("permissions", []),
        "last_login": admin_user.get("last_login")
    }

# Dashboard Routes
@app.get("/api/dashboard/metrics", response_model=DashboardMetrics)
async def get_dashboard_metrics(token_payload: dict = Depends(verify_token)):
    """Get real-time dashboard metrics"""
    
    # Total members
    total_members = members_col.count_documents({"is_active": True})
    
    # Members by tier
    members_by_tier = {}
    for tier in ["Ruby", "Sapphire", "Diamond", "VIP"]:
        count = members_col.count_documents({"tier": tier, "is_active": True})
        members_by_tier[tier] = count
    
    # Active gaming sessions
    active_sessions = gaming_sessions_col.count_documents({"status": "active"})
    
    # Revenue calculations
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today - timedelta(days=today.weekday())
    month_start = today.replace(day=1)
    
    # Daily revenue from completed sessions
    daily_sessions = gaming_sessions_col.find({
        "session_start": {"$gte": today},
        "status": "completed",
        "net_result": {"$exists": True}
    })
    daily_revenue = sum(abs(session.get("net_result", 0)) for session in daily_sessions)
    
    # Weekly revenue
    weekly_sessions = gaming_sessions_col.find({
        "session_start": {"$gte": week_start},
        "status": "completed",
        "net_result": {"$exists": True}
    })
    weekly_revenue = sum(abs(session.get("net_result", 0)) for session in weekly_sessions)
    
    # Monthly revenue
    monthly_sessions = gaming_sessions_col.find({
        "session_start": {"$gte": month_start},
        "status": "completed",
        "net_result": {"$exists": True}
    })
    monthly_revenue = sum(abs(session.get("net_result", 0)) for session in monthly_sessions)
    
    # Top games
    pipeline = [
        {"$match": {"status": "completed"}},
        {"$group": {"_id": "$game_type", "total_sessions": {"$sum": 1}, "total_revenue": {"$sum": "$net_result"}}},
        {"$sort": {"total_sessions": -1}},
        {"$limit": 5}
    ]
    top_games_cursor = gaming_sessions_col.aggregate(pipeline)
    top_games = [
        {
            "game_type": game["_id"],
            "sessions": game["total_sessions"],
            "revenue": abs(game["total_revenue"]) if game["total_revenue"] else 0
        }
        for game in top_games_cursor
    ]
    
    # Recent registrations (last 24 hours)
    recent_registrations = members_col.count_documents({
        "registration_date": {"$gte": today}
    })
    
    return DashboardMetrics(
        total_members=total_members,
        members_by_tier=members_by_tier,
        active_sessions=active_sessions,
        daily_revenue=daily_revenue,
        weekly_revenue=weekly_revenue,
        monthly_revenue=monthly_revenue,
        top_games=top_games,
        recent_registrations=recent_registrations
    )

# Member Management Routes
@app.get("/api/members")
async def get_members(
    skip: int = 0, 
    limit: int = 50, 
    tier: Optional[str] = None,
    search: Optional[str] = None,
    token_payload: dict = Depends(verify_token)
):
    """Get paginated list of members with search and filter"""
    query = {"is_active": True}
    
    if tier:
        query["tier"] = tier
    
    if search:
        query["$or"] = [
            {"first_name": {"$regex": search, "$options": "i"}},
            {"last_name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"member_number": {"$regex": search, "$options": "i"}}
        ]
    
    members = list(members_col.find(query).skip(skip).limit(limit))
    total = members_col.count_documents(query)
    
    # Remove sensitive data and decrypt necessary fields for display
    for member in members:
        member.pop("_id", None)
        # Decrypt sensitive fields for authorized viewing
        if member.get("nic_passport"):
            member["nic_passport"] = "***ENCRYPTED***"  # Show as encrypted to maintain privacy
    
    return {
        "members": members,
        "total": total,
        "page": skip // limit + 1,
        "pages": (total + limit - 1) // limit
    }

@app.get("/api/members/{member_id}")
async def get_member(member_id: str, token_payload: dict = Depends(verify_token)):
    """Get detailed member information"""
    member = members_col.find_one({"id": member_id})
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    member.pop("_id", None)
    
    # Log member access for audit trail
    await log_admin_action(
        token_payload["user_id"], token_payload["sub"],
        "view", "member", member_id,
        details={"member_name": f"{member['first_name']} {member['last_name']}"}
    )
    
    return member

# Gaming Management Routes
@app.get("/api/gaming/sessions")
async def get_gaming_sessions(
    skip: int = 0, 
    limit: int = 50,
    status: Optional[str] = None,
    token_payload: dict = Depends(verify_token)
):
    """Get gaming sessions with pagination"""
    query = {}
    if status:
        query["status"] = status
    
    sessions = list(gaming_sessions_col.find(query).sort("session_start", -1).skip(skip).limit(limit))
    total = gaming_sessions_col.count_documents(query)
    
    for session in sessions:
        session.pop("_id", None)
        # Add member name for display
        member = members_col.find_one({"id": session["member_id"]})
        if member:
            session["member_name"] = f"{member['first_name']} {member['last_name']}"
    
    return {
        "sessions": sessions,
        "total": total,
        "page": skip // limit + 1,
        "pages": (total + limit - 1) // limit
    }

@app.get("/api/gaming/packages")
async def get_gaming_packages(token_payload: dict = Depends(verify_token)):
    """Get all gaming packages"""
    packages = list(gaming_packages_col.find({"is_active": True}))
    for package in packages:
        package.pop("_id", None)
    return packages

@app.post("/api/gaming/packages")
async def create_gaming_package(package: GamingPackage, token_payload: dict = Depends(verify_token)):
    """Create new gaming package"""
    # Check permissions (only managers and above can create packages)
    if token_payload["role"] not in ["SuperAdmin", "GeneralAdmin", "Manager"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    package_dict = package.dict()
    result = gaming_packages_col.insert_one(package_dict)
    
    # Log package creation
    await log_admin_action(
        token_payload["user_id"], token_payload["sub"],
        "create", "gaming_package", package.id,
        details={"package_name": package.name, "price": package.price}
    )
    
    return {"id": package.id, "message": "Gaming package created successfully"}

# Phase 2 Routes - Marketing Intelligence & Travel Management

# Marketing Intelligence Routes
@app.get("/api/marketing/dashboard")
async def get_marketing_dashboard(token_payload: dict = Depends(verify_token)):
    """Get marketing intelligence dashboard data"""
    
    # Birthday members this month
    current_month = datetime.utcnow().month
    birthday_members = list(birthday_calendar_col.find({
        "birth_month": current_month,
        "notification_sent": False
    }).limit(10))
    
    # Inactive members (no visit in 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    inactive_members = list(members_col.find({
        "last_visit": {"$lt": thirty_days_ago},
        "is_active": True
    }).limit(20))
    
    # Walk-in guests today
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    walk_in_today = list(walk_in_guests_col.find({
        "visit_date": {"$gte": today}
    }))
    
    # Marketing campaigns
    active_campaigns = list(marketing_campaigns_col.find({
        "status": "active"
    }))
    
    # Customer segments analysis
    segments = {}
    for tier in ["Ruby", "Sapphire", "Diamond", "VIP"]:
        count = members_col.count_documents({"tier": tier, "is_active": True})
        segments[tier] = count
    
    return {
        "birthday_members": [{"id": member["id"], "member_id": member["member_id"], 
                             "member_name": member["member_name"], "tier": member["tier"],
                             "birthday_date": member["birthday_date"]} for member in birthday_members],
        "inactive_members": [{"id": member["id"], "first_name": member["first_name"],
                             "last_name": member["last_name"], "tier": member["tier"],
                             "last_visit": member.get("last_visit")} for member in inactive_members],
        "walk_in_today": len(walk_in_today),
        "walk_in_conversion_rate": len([g for g in walk_in_today if g.get("converted_to_member")]) / len(walk_in_today) * 100 if walk_in_today else 0,
        "active_campaigns": len(active_campaigns),
        "customer_segments": segments
    }

@app.get("/api/marketing/birthday-calendar")
async def get_birthday_calendar(
    month: Optional[int] = None,
    skip: int = 0,
    limit: int = 50,
    token_payload: dict = Depends(verify_token)
):
    """Get birthday calendar for marketing campaigns"""
    query = {}
    if month:
        query["birth_month"] = month
    
    birthdays = list(birthday_calendar_col.find(query).skip(skip).limit(limit))
    total = birthday_calendar_col.count_documents(query)
    
    for birthday in birthdays:
        birthday.pop("_id", None)
    
    return {
        "birthdays": birthdays,
        "total": total,
        "page": skip // limit + 1,
        "pages": (total + limit - 1) // limit
    }

@app.get("/api/marketing/inactive-customers")
async def get_inactive_customers(
    days: int = 30,
    skip: int = 0,
    limit: int = 50,
    token_payload: dict = Depends(verify_token)
):
    """Get inactive customers for re-engagement campaigns"""
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    query = {
        "last_visit": {"$lt": cutoff_date},
        "is_active": True
    }
    
    inactive_members = list(members_col.find(query).skip(skip).limit(limit))
    total = members_col.count_documents(query)
    
    # Add analytics data
    for member in inactive_members:
        member.pop("_id", None)
        analytics = customer_analytics_col.find_one({"member_id": member["id"]})
        if analytics:
            member["risk_score"] = analytics.get("risk_score", 0.5)
            member["avg_spend"] = analytics.get("avg_spend_per_visit", 0)
            member["favorite_games"] = analytics.get("favorite_games", [])
    
    return {
        "inactive_members": inactive_members,
        "total": total,
        "page": skip // limit + 1,
        "pages": (total + limit - 1) // limit
    }

@app.get("/api/marketing/walk-in-guests")
async def get_walk_in_guests(
    date: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    token_payload: dict = Depends(verify_token)
):
    """Get walk-in guests data"""
    query = {}
    if date:
        target_date = datetime.fromisoformat(date.replace('Z', '+00:00')).replace(tzinfo=None)
        query["visit_date"] = {
            "$gte": target_date.replace(hour=0, minute=0, second=0, microsecond=0),
            "$lt": target_date.replace(hour=23, minute=59, second=59, microsecond=999999)
        }
    
    guests = list(walk_in_guests_col.find(query).skip(skip).limit(limit))
    total = walk_in_guests_col.count_documents(query)
    
    for guest in guests:
        guest.pop("_id", None)
        guest["id_document"] = "***ENCRYPTED***"  # Hide sensitive data
    
    return {
        "guests": guests,
        "total": total,
        "page": skip // limit + 1,
        "pages": (total + limit - 1) // limit
    }

@app.post("/api/marketing/campaigns")
async def create_marketing_campaign(campaign: MarketingCampaign, token_payload: dict = Depends(verify_token)):
    """Create a new marketing campaign"""
    if token_payload["role"] not in ["SuperAdmin", "GeneralAdmin", "Manager"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    campaign.created_by = token_payload["user_id"]
    campaign_dict = campaign.dict()
    result = marketing_campaigns_col.insert_one(campaign_dict)
    
    await log_admin_action(
        token_payload["user_id"], token_payload["sub"],
        "create", "marketing_campaign", campaign.id,
        details={"campaign_name": campaign.name, "campaign_type": campaign.campaign_type}
    )
    
    return {"id": campaign.id, "message": "Marketing campaign created successfully"}

@app.get("/api/marketing/campaigns")
async def get_marketing_campaigns(
    status: Optional[str] = None,
    campaign_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    token_payload: dict = Depends(verify_token)
):
    """Get marketing campaigns"""
    query = {}
    if status:
        query["status"] = status
    if campaign_type:
        query["campaign_type"] = campaign_type
    
    campaigns = list(marketing_campaigns_col.find(query).skip(skip).limit(limit))
    total = marketing_campaigns_col.count_documents(query)
    
    for campaign in campaigns:
        campaign.pop("_id", None)
    
    return {
        "campaigns": campaigns,
        "total": total,
        "page": skip // limit + 1,
        "pages": (total + limit - 1) // limit
    }

# Travel Itinerary & VIP Management Routes
@app.get("/api/travel/vip-dashboard")
async def get_vip_travel_dashboard(token_payload: dict = Depends(verify_token)):
    """Get VIP travel management dashboard"""
    
    # Upcoming VIP arrivals (next 7 days)
    next_week = datetime.utcnow() + timedelta(days=7)
    upcoming_vip = list(vip_experiences_col.find({
        "scheduled_date": {"$gte": datetime.utcnow(), "$lte": next_week},
        "status": {"$in": ["planned", "confirmed"]}
    }))
    
    # Active group bookings
    active_groups = list(group_bookings_col.find({
        "status": {"$in": ["confirmed", "in_progress"]}
    }))
    
    # VIP satisfaction scores
    completed_experiences = list(vip_experiences_col.find({
        "status": "completed",
        "satisfaction_score": {"$exists": True}
    }))
    
    avg_satisfaction = sum(exp.get("satisfaction_score") or 0 for exp in completed_experiences) / len(completed_experiences) if completed_experiences else 0
    
    return {
        "upcoming_vip_experiences": len(upcoming_vip),
        "active_group_bookings": len(active_groups),
        "avg_vip_satisfaction": round(avg_satisfaction, 2),
        "vip_revenue_this_month": sum(exp.get("cost", 0) for exp in completed_experiences),
        "upcoming_arrivals": [
            {
                "member_id": exp["member_id"],
                "experience_type": exp["experience_type"],
                "scheduled_date": exp["scheduled_date"],
                "services_included": exp["services_included"]
            } for exp in upcoming_vip[:10]
        ]
    }

@app.get("/api/travel/vip-experiences")
async def get_vip_experiences(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    token_payload: dict = Depends(verify_token)
):
    """Get VIP experiences"""
    query = {}
    if status:
        query["status"] = status
    
    experiences = list(vip_experiences_col.find(query).sort("scheduled_date", -1).skip(skip).limit(limit))
    total = vip_experiences_col.count_documents(query)
    
    # Add member details
    for experience in experiences:
        experience.pop("_id", None)
        member = members_col.find_one({"id": experience["member_id"]})
        if member:
            experience["member_name"] = f"{member['first_name']} {member['last_name']}"
            experience["member_tier"] = member["tier"]
    
    return {
        "experiences": experiences,
        "total": total,
        "page": skip // limit + 1,
        "pages": (total + limit - 1) // limit
    }

@app.post("/api/travel/vip-experiences")
async def create_vip_experience(experience: VIPExperience, token_payload: dict = Depends(verify_token)):
    """Create a new VIP experience"""
    if token_payload["role"] not in ["SuperAdmin", "GeneralAdmin", "Manager"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Verify member exists and is VIP
    member = members_col.find_one({"id": experience.member_id})
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    experience_dict = experience.dict()
    result = vip_experiences_col.insert_one(experience_dict)
    
    await log_admin_action(
        token_payload["user_id"], token_payload["sub"],
        "create", "vip_experience", experience.id,
        details={"member_id": experience.member_id, "experience_type": experience.experience_type}
    )
    
    return {"id": experience.id, "message": "VIP experience created successfully"}

@app.get("/api/travel/group-bookings")
async def get_group_bookings(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    token_payload: dict = Depends(verify_token)
):
    """Get group bookings"""
    query = {}
    if status:
        query["status"] = status
    
    bookings = list(group_bookings_col.find(query).sort("booking_date", -1).skip(skip).limit(limit))
    total = group_bookings_col.count_documents(query)
    
    for booking in bookings:
        booking.pop("_id", None)
    
    return {
        "bookings": bookings,
        "total": total,
        "page": skip // limit + 1,
        "pages": (total + limit - 1) // limit
    }

@app.post("/api/travel/group-bookings")
async def create_group_booking(booking: GroupBooking, token_payload: dict = Depends(verify_token)):
    """Create a new group booking"""
    if token_payload["role"] not in ["SuperAdmin", "GeneralAdmin", "Manager"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    booking_dict = booking.dict()
    result = group_bookings_col.insert_one(booking_dict)
    
    await log_admin_action(
        token_payload["user_id"], token_payload["sub"],
        "create", "group_booking", booking.id,
        details={"group_name": booking.group_name, "group_size": booking.group_size}
    )
    
    return {"id": booking.id, "message": "Group booking created successfully"}

# Phase 3 Routes - Staff Management & Advanced Analytics

# Staff Management Routes
@app.get("/api/staff/dashboard")
async def get_staff_dashboard(token_payload: dict = Depends(verify_token)):
    """Get staff management dashboard data"""
    
    # Total active staff
    total_staff = staff_members_col.count_documents({"employment_status": "active"})
    
    # Staff by department
    departments = ["Gaming", "F&B", "Security", "Management", "Maintenance"]
    staff_by_dept = {}
    for dept in departments:
        count = staff_members_col.count_documents({"department": dept, "employment_status": "active"})
        staff_by_dept[dept] = count
    
    # Training completion rates
    total_training_records = training_records_col.count_documents({})
    completed_training = training_records_col.count_documents({"status": "completed"})
    overall_completion_rate = (completed_training / total_training_records * 100) if total_training_records > 0 else 0
    
    # Performance metrics
    staff_with_reviews = list(staff_members_col.find({"performance_score": {"$gt": 0}}))
    avg_performance = sum(staff["performance_score"] for staff in staff_with_reviews) / len(staff_with_reviews) if staff_with_reviews else 0
    
    # Upcoming reviews
    next_month = datetime.utcnow() + timedelta(days=30)
    upcoming_reviews = staff_members_col.count_documents({
        "next_review_due": {"$lte": next_month},
        "employment_status": "active"
    })
    
    # Recent training activity
    recent_training = list(training_records_col.find({
        "enrollment_date": {"$gte": datetime.utcnow() - timedelta(days=7)}
    }).limit(10))
    
    return {
        "total_staff": total_staff,
        "staff_by_department": staff_by_dept,
        "training_completion_rate": round(overall_completion_rate, 1),
        "average_performance_score": round(avg_performance, 1),
        "upcoming_reviews": upcoming_reviews,
        "recent_training_enrollments": len(recent_training),
        "training_stats": {
            "total_courses": training_courses_col.count_documents({"is_active": True}),
            "total_enrollments": total_training_records,
            "completed_this_month": training_records_col.count_documents({
                "completion_date": {"$gte": datetime.utcnow().replace(day=1)},
                "status": "completed"
            })
        }
    }

@app.get("/api/staff/members")
async def get_staff_members(
    skip: int = 0,
    limit: int = 50,
    department: Optional[str] = None,
    search: Optional[str] = None,
    token_payload: dict = Depends(verify_token)
):
    """Get staff members with filtering"""
    query = {"employment_status": "active"}
    
    if department:
        query["department"] = department
    
    if search:
        query["$or"] = [
            {"first_name": {"$regex": search, "$options": "i"}},
            {"last_name": {"$regex": search, "$options": "i"}},
            {"employee_id": {"$regex": search, "$options": "i"}},
            {"position": {"$regex": search, "$options": "i"}}
        ]
    
    staff_members = list(staff_members_col.find(query).skip(skip).limit(limit))
    total = staff_members_col.count_documents(query)
    
    for staff in staff_members:
        staff.pop("_id", None)
        staff.pop("salary", None)  # Remove sensitive salary data
    
    return {
        "staff_members": staff_members,
        "total": total,
        "page": skip // limit + 1,
        "pages": (total + limit - 1) // limit
    }

@app.get("/api/staff/training/courses")
async def get_training_courses(
    category: Optional[str] = None,
    token_payload: dict = Depends(verify_token)
):
    """Get training courses"""
    query = {"is_active": True}
    if category:
        query["category"] = category
    
    courses = list(training_courses_col.find(query))
    for course in courses:
        course.pop("_id", None)
    
    return courses

@app.post("/api/staff/training/courses")
async def create_training_course(course: TrainingCourse, token_payload: dict = Depends(verify_token)):
    """Create new training course"""
    if token_payload["role"] not in ["SuperAdmin", "GeneralAdmin", "Manager"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    course.created_by = token_payload["user_id"]
    course_dict = course.dict()
    result = training_courses_col.insert_one(course_dict)
    
    await log_admin_action(
        token_payload["user_id"], token_payload["sub"],
        "create", "training_course", course.id,
        details={"course_name": course.course_name, "category": course.category}
    )
    
    return {"id": course.id, "message": "Training course created successfully"}

@app.get("/api/staff/training/records")
async def get_training_records(
    staff_id: Optional[str] = None,
    course_id: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    token_payload: dict = Depends(verify_token)
):
    """Get training records"""
    query = {}
    if staff_id:
        query["staff_id"] = staff_id
    if course_id:
        query["course_id"] = course_id
    if status:
        query["status"] = status
    
    records = list(training_records_col.find(query).skip(skip).limit(limit))
    total = training_records_col.count_documents(query)
    
    # Add staff and course names for display
    for record in records:
        record.pop("_id", None)
        staff = staff_members_col.find_one({"id": record["staff_id"]})
        course = training_courses_col.find_one({"id": record["course_id"]})
        if staff:
            record["staff_name"] = f"{staff['first_name']} {staff['last_name']}"
        if course:
            record["course_name"] = course["course_name"]
    
    return {
        "training_records": records,
        "total": total,
        "page": skip // limit + 1,
        "pages": (total + limit - 1) // limit
    }

@app.post("/api/staff/performance/reviews")
async def create_performance_review(review: PerformanceReview, token_payload: dict = Depends(verify_token)):
    """Create performance review"""
    if token_payload["role"] not in ["SuperAdmin", "GeneralAdmin", "Manager"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    review.reviewer_id = token_payload["user_id"]
    review_dict = review.dict()
    result = performance_reviews_col.insert_one(review_dict)
    
    await log_admin_action(
        token_payload["user_id"], token_payload["sub"],
        "create", "performance_review", review.id,
        details={"staff_id": review.staff_id, "overall_rating": review.overall_rating}
    )
    
    return {"id": review.id, "message": "Performance review created successfully"}

# Advanced Analytics Routes
@app.get("/api/analytics/advanced")
async def get_advanced_analytics(
    analysis_type: Optional[str] = None,
    time_period: Optional[str] = None,
    token_payload: dict = Depends(verify_token)
):
    """Get advanced analytics data"""
    query = {"is_active": True}
    if analysis_type:
        query["analysis_type"] = analysis_type
    if time_period:
        query["time_period"] = time_period
    
    analytics = list(advanced_analytics_col.find(query).sort("analysis_date", -1))
    for analysis in analytics:
        analysis.pop("_id", None)
    
    return analytics

@app.post("/api/analytics/generate")
async def generate_analytics_report(
    request: dict,
    token_payload: dict = Depends(verify_token)
):
    """Generate advanced analytics report"""
    if token_payload["role"] not in ["SuperAdmin", "GeneralAdmin"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    analysis_type = request.get("analysis_type")
    time_period = request.get("time_period", "monthly")
    
    # Generate mock analytics based on type
    insights = []
    recommendations = []
    data_points = {}
    confidence = 85.0
    
    if analysis_type == "customer_ltv":
        insights = [
            "VIP customers have 5x higher lifetime value than Ruby tier",
            "Gaming revenue comprises 70% of customer lifetime value",
            "Birthday campaign participants show 25% higher retention"
        ]
        recommendations = [
            "Focus VIP acquisition programs",
            "Enhance gaming experience for mid-tier customers",
            "Expand birthday celebration offerings"
        ]
        data_points = {
            "avg_ltv_vip": 15000,
            "avg_ltv_diamond": 8000,
            "avg_ltv_sapphire": 4500,
            "avg_ltv_ruby": 2200,
            "retention_rate": 0.75
        }
    
    elif analysis_type == "churn_prediction":
        insights = [
            "Members inactive for 45+ days have 80% churn probability",
            "Declining gaming frequency is strongest churn predictor",
            "Social engagement reduces churn risk by 40%"
        ]
        recommendations = [
            "Implement 30-day re-engagement campaign",
            "Create gaming frequency alerts for managers",
            "Boost social features and community events"
        ]
        data_points = {
            "high_risk_members": 45,
            "medium_risk_members": 120,
            "predicted_monthly_churn": 25,
            "intervention_success_rate": 0.65
        }
    
    elif analysis_type == "operational_efficiency":
        insights = [
            "Peak hours show 40% staff utilization gap",
            "F&B service times exceed target by 15 minutes",
            "Gaming floor capacity utilization at 85%"
        ]
        recommendations = [
            "Optimize shift scheduling for peak periods",
            "Implement kitchen workflow automation",
            "Add 2 gaming tables during weekend evenings"
        ]
        data_points = {
            "avg_service_time": 25,
            "target_service_time": 15,
            "staff_utilization": 0.75,
            "customer_satisfaction": 4.2
        }
    
    # Create analytics record
    analytics_record = AdvancedAnalytics(
        analysis_type=analysis_type,
        time_period=time_period,
        data_points=data_points,
        insights=insights,
        recommendations=recommendations,
        confidence_score=confidence,
        created_by=token_payload["user_id"]
    )
    
    advanced_analytics_col.insert_one(analytics_record.dict())
    
    await log_admin_action(
        token_payload["user_id"], token_payload["sub"],
        "create", "advanced_analytics", analytics_record.id,
        details={"analysis_type": analysis_type, "confidence": confidence}
    )
    
    return {
        "id": analytics_record.id,
        "analysis": analytics_record.dict(),
        "message": f"Advanced analytics report generated for {analysis_type}"
    }

# Cost Optimization Routes
@app.get("/api/optimization/cost-savings")
async def get_cost_optimization_opportunities(
    area: Optional[str] = None,
    status: Optional[str] = None,
    token_payload: dict = Depends(verify_token)
):
    """Get cost optimization opportunities"""
    query = {}
    if area:
        query["optimization_area"] = area
    if status:
        query["implementation_status"] = status
    
    opportunities = list(cost_optimization_col.find(query).sort("roi_percentage", -1))
    for opp in opportunities:
        opp.pop("_id", None)
    
    return opportunities

@app.post("/api/optimization/opportunities")
async def create_cost_optimization(optimization: CostOptimization, token_payload: dict = Depends(verify_token)):
    """Create cost optimization opportunity"""
    if token_payload["role"] not in ["SuperAdmin", "GeneralAdmin", "Manager"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    optimization_dict = optimization.dict()
    result = cost_optimization_col.insert_one(optimization_dict)
    
    await log_admin_action(
        token_payload["user_id"], token_payload["sub"],
        "create", "cost_optimization", optimization.id,
        details={"area": optimization.optimization_area, "projected_savings": optimization.projected_savings}
    )
    
    return {"id": optimization.id, "message": "Cost optimization opportunity created successfully"}

# Predictive Models Routes
@app.get("/api/predictive/models")
async def get_predictive_models(
    model_type: Optional[str] = None,
    is_production: Optional[bool] = None,
    token_payload: dict = Depends(verify_token)
):
    """Get predictive models"""
    query = {}
    if model_type:
        query["model_type"] = model_type
    if is_production is not None:
        query["is_production"] = is_production
    
    models = list(predictive_models_col.find(query))
    for model in models:
        model.pop("_id", None)
    
    return models

@app.post("/api/predictive/models")
async def create_predictive_model(model: PredictiveModel, token_payload: dict = Depends(verify_token)):
    """Create predictive model"""
    if token_payload["role"] not in ["SuperAdmin", "GeneralAdmin"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    model.created_by = token_payload["user_id"]
    model_dict = model.dict()
    result = predictive_models_col.insert_one(model_dict)
    
    await log_admin_action(
        token_payload["user_id"], token_payload["sub"],
        "create", "predictive_model", model.id,
        details={"model_name": model.model_name, "model_type": model.model_type, "accuracy": model.accuracy_score}
    )
    
    return {"id": model.id, "message": "Predictive model created successfully"}

# Phase 4 Routes - Enterprise Features

# Notification System Routes
@app.get("/api/notifications")
async def get_notifications(
    recipient_id: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    token_payload: dict = Depends(verify_token)
):
    """Get notifications with filtering"""
    query = {}
    if recipient_id:
        query["recipient_id"] = recipient_id
    if category:
        query["category"] = category
    if status:
        query["status"] = status
    if priority:
        query["priority"] = priority
    
    # Admin can see all notifications, users see only their own
    if token_payload.get("role") not in ["SuperAdmin", "GeneralAdmin"]:
        query["recipient_id"] = token_payload["user_id"]
    
    notifications = list(notifications_col.find(query).sort("created_at", -1).skip(skip).limit(limit))
    total = notifications_col.count_documents(query)
    
    for notification in notifications:
        notification.pop("_id", None)
    
    return {
        "notifications": notifications,
        "total": total,
        "page": skip // limit + 1,
        "pages": (total + limit - 1) // limit
    }

@app.post("/api/notifications")
async def create_notification(notification: Notification, token_payload: dict = Depends(verify_token)):
    """Create new notification"""
    if token_payload["role"] not in ["SuperAdmin", "GeneralAdmin", "Manager"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    notification_dict = notification.dict()
    result = notifications_col.insert_one(notification_dict)
    
    # Log notification creation
    await log_admin_action(
        token_payload["user_id"], token_payload["sub"],
        "create", "notification", notification.id,
        details={"category": notification.category, "priority": notification.priority}
    )
    
    return {"id": notification.id, "message": "Notification created successfully"}

@app.patch("/api/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, token_payload: dict = Depends(verify_token)):
    """Mark notification as read"""
    notification = notifications_col.find_one({"id": notification_id})
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    # Users can only mark their own notifications as read
    if notification["recipient_id"] != token_payload["user_id"] and token_payload.get("role") not in ["SuperAdmin", "GeneralAdmin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    notifications_col.update_one(
        {"id": notification_id},
        {"$set": {"status": "read", "read_at": datetime.utcnow()}}
    )
    
    return {"message": "Notification marked as read"}

@app.get("/api/notifications/templates")
async def get_notification_templates(
    category: Optional[str] = None,
    is_active: bool = True,
    token_payload: dict = Depends(verify_token)
):
    """Get notification templates"""
    query = {"is_active": is_active}
    if category:
        query["category"] = category
    
    templates = list(notification_templates_col.find(query))
    for template in templates:
        template.pop("_id", None)
    
    return templates

@app.post("/api/notifications/templates")
async def create_notification_template(template: NotificationTemplate, token_payload: dict = Depends(verify_token)):
    """Create notification template"""
    if token_payload["role"] not in ["SuperAdmin", "GeneralAdmin"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    template.created_by = token_payload["user_id"]
    template_dict = template.dict()
    result = notification_templates_col.insert_one(template_dict)
    
    await log_admin_action(
        token_payload["user_id"], token_payload["sub"],
        "create", "notification_template", template.id,
        details={"template_name": template.name, "category": template.category}
    )
    
    return {"id": template.id, "message": "Notification template created successfully"}

# Compliance and Audit Routes
@app.get("/api/compliance/reports")
async def get_compliance_reports(
    report_type: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    token_payload: dict = Depends(verify_token)
):
    """Get compliance reports"""
    if token_payload["role"] not in ["SuperAdmin", "GeneralAdmin", "Manager"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    query = {}
    if report_type:
        query["report_type"] = report_type
    if status:
        query["status"] = status
    
    reports = list(compliance_reports_col.find(query).sort("created_at", -1).skip(skip).limit(limit))
    total = compliance_reports_col.count_documents(query)
    
    for report in reports:
        report.pop("_id", None)
    
    return {
        "reports": reports,
        "total": total,
        "page": skip // limit + 1,
        "pages": (total + limit - 1) // limit
    }

@app.post("/api/compliance/reports/generate")
async def generate_compliance_report(
    request: dict,
    token_payload: dict = Depends(verify_token)
):
    """Generate compliance report"""
    if token_payload["role"] not in ["SuperAdmin", "GeneralAdmin"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    report_type = request.get("report_type")
    start_date = datetime.fromisoformat(request.get("start_date"))
    end_date = datetime.fromisoformat(request.get("end_date"))
    
    # Generate mock compliance data based on type
    summary = {}
    violations = []
    recommendations = []
    compliance_score = 95.0
    
    if report_type == "audit_trail":
        # Audit trail analysis
        audit_count = audit_logs_col.count_documents({
            "timestamp": {"$gte": start_date, "$lte": end_date}
        })
        
        summary = {
            "total_audit_entries": audit_count,
            "admin_actions": audit_count,
            "data_access_events": int(audit_count * 0.6),
            "security_events": int(audit_count * 0.1)
        }
        
        if audit_count > 1000:
            violations.append({
                "type": "high_activity_volume",
                "description": f"High volume of admin activities: {audit_count} entries",
                "severity": "medium",
                "recommendation": "Review admin access patterns and implement activity limits"
            })
        
        recommendations = [
            "Implement automated monitoring for suspicious activity patterns",
            "Regular review of admin access logs",
            "Enhance audit trail data retention policies"
        ]
    
    elif report_type == "kyc_compliance":
        # KYC compliance check
        total_members = members_col.count_documents({"is_active": True})
        verified_members = members_col.count_documents({"kyc_verified": True, "is_active": True})
        verification_rate = (verified_members / total_members) * 100 if total_members > 0 else 0
        
        summary = {
            "total_active_members": total_members,
            "kyc_verified_members": verified_members,
            "verification_rate": round(verification_rate, 2),
            "pending_verification": total_members - verified_members
        }
        
        if verification_rate < 90:
            violations.append({
                "type": "low_kyc_verification",
                "description": f"KYC verification rate below 90%: {verification_rate:.1f}%",
                "severity": "high",
                "recommendation": "Implement mandatory KYC verification for all new members"
            })
            compliance_score = 80.0
        
        recommendations = [
            "Automated KYC verification reminders",
            "Streamlined KYC process for better user experience",
            "Regular compliance training for staff"
        ]
    
    elif report_type == "data_retention":
        # Data retention policy compliance
        policies_count = data_retention_policies_col.count_documents({"status": "active"})
        
        summary = {
            "active_retention_policies": policies_count,
            "data_categories_covered": ["member_data", "gaming_logs", "audit_logs", "marketing_data"],
            "avg_retention_period": 365,  # days
            "auto_deletion_enabled": policies_count > 0
        }
        
        if policies_count == 0:
            violations.append({
                "type": "no_retention_policies",
                "description": "No active data retention policies found",
                "severity": "critical",
                "recommendation": "Implement comprehensive data retention policies immediately"
            })
            compliance_score = 60.0
        
        recommendations = [
            "Define clear data retention policies for all data categories",
            "Implement automated data archiving and deletion",
            "Regular review and update of retention policies"
        ]
    
    # Create compliance report
    report = ComplianceReport(
        report_type=report_type,
        report_period_start=start_date,
        report_period_end=end_date,
        generated_by=token_payload["user_id"],
        summary=summary,
        violations=violations,
        recommendations=recommendations,
        compliance_score=compliance_score,
        status="completed"
    )
    
    compliance_reports_col.insert_one(report.dict())
    
    await log_admin_action(
        token_payload["user_id"], token_payload["sub"],
        "create", "compliance_report", report.id,
        details={"report_type": report_type, "compliance_score": compliance_score}
    )
    
    return {
        "id": report.id,
        "report": report.dict(),
        "message": f"Compliance report generated for {report_type}"
    }

@app.get("/api/audit/enhanced")
async def get_enhanced_audit_logs(
    admin_user_id: Optional[str] = None,
    action: Optional[str] = None,
    resource: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    token_payload: dict = Depends(verify_token)
):
    """Get enhanced audit logs with advanced filtering"""
    if token_payload["role"] not in ["SuperAdmin", "GeneralAdmin"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    query = {}
    if admin_user_id:
        query["admin_user_id"] = admin_user_id
    if action:
        query["action"] = action
    if resource:
        query["resource"] = resource
    
    if start_date and end_date:
        start_dt = datetime.fromisoformat(start_date)
        end_dt = datetime.fromisoformat(end_date)
        query["timestamp"] = {"$gte": start_dt, "$lte": end_dt}
    
    audit_logs = list(audit_logs_col.find(query).sort("timestamp", -1).skip(skip).limit(limit))
    total = audit_logs_col.count_documents(query)
    
    # Enhanced audit log processing
    for log in audit_logs:
        log.pop("_id", None)
        
        # Add risk scoring
        risk_score = 0
        if log.get("action") in ["delete", "update_sensitive", "export_data"]:
            risk_score += 3
        if log.get("resource") in ["member", "admin_user", "audit_log"]:
            risk_score += 2
        if log.get("details", {}).get("bulk_operation"):
            risk_score += 2
        
        log["risk_score"] = min(risk_score, 5)  # Max 5
        log["risk_level"] = "low" if risk_score <= 1 else "medium" if risk_score <= 3 else "high"
    
    # Generate audit summary
    actions_summary = {}
    resources_summary = {}
    admins_summary = {}
    
    for log in audit_logs:
        action = log.get("action", "unknown")
        resource = log.get("resource", "unknown")
        admin = log.get("admin_username", "unknown")
        
        actions_summary[action] = actions_summary.get(action, 0) + 1
        resources_summary[resource] = resources_summary.get(resource, 0) + 1
        admins_summary[admin] = admins_summary.get(admin, 0) + 1
    
    return {
        "audit_logs": audit_logs,
        "total": total,
        "page": skip // limit + 1,
        "pages": (total + limit - 1) // limit,
        "summary": {
            "actions_breakdown": actions_summary,
            "resources_breakdown": resources_summary,
            "admin_activity": admins_summary,
            "high_risk_activities": len([log for log in audit_logs if log.get("risk_level") == "high"])
        }
    }

# System Integrations Routes
@app.get("/api/integrations")
async def get_system_integrations(
    integration_type: Optional[str] = None,
    status: Optional[str] = None,
    token_payload: dict = Depends(verify_token)
):
    """Get system integrations"""
    if token_payload["role"] not in ["SuperAdmin", "GeneralAdmin"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    query = {}
    if integration_type:
        query["integration_type"] = integration_type
    if status:
        query["status"] = status
    
    integrations = list(system_integrations_col.find(query).sort("created_at", -1))
    
    # Remove sensitive data
    for integration in integrations:
        integration.pop("_id", None)
        integration.pop("api_key_encrypted", None)  # Hide encrypted keys
    
    return integrations

@app.post("/api/integrations")
async def create_system_integration(integration: SystemIntegration, token_payload: dict = Depends(verify_token)):
    """Create system integration"""
    if token_payload["role"] not in ["SuperAdmin"]:
        raise HTTPException(status_code=403, detail="Only SuperAdmin can create integrations")
    
    integration.created_by = token_payload["user_id"]
    
    # Encrypt API key if provided
    if integration.api_key_encrypted:
        integration.api_key_encrypted = encrypt_sensitive_data(integration.api_key_encrypted)
    
    integration_dict = integration.dict()
    result = system_integrations_col.insert_one(integration_dict)
    
    await log_admin_action(
        token_payload["user_id"], token_payload["sub"],
        "create", "system_integration", integration.id,
        details={"integration_name": integration.name, "integration_type": integration.integration_type}
    )
    
    return {"id": integration.id, "message": "System integration created successfully"}

@app.patch("/api/integrations/{integration_id}/sync")
async def sync_integration(integration_id: str, token_payload: dict = Depends(verify_token)):
    """Manually sync integration"""
    if token_payload["role"] not in ["SuperAdmin", "GeneralAdmin"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    integration = system_integrations_col.find_one({"id": integration_id})
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    # Simulate sync process
    sync_success = True  # In real implementation, perform actual sync
    
    update_data = {
        "last_sync": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    if not sync_success:
        update_data["error_count"] = integration.get("error_count", 0) + 1
        update_data["last_error"] = "Sync failed - connection timeout"
        update_data["status"] = "error"
    else:
        update_data["error_count"] = 0
        update_data["last_error"] = None
        update_data["status"] = "active"
    
    system_integrations_col.update_one({"id": integration_id}, {"$set": update_data})
    
    return {"message": "Integration sync completed", "success": sync_success}

# Enhanced User Analytics Routes
@app.get("/api/analytics/user-activity")
async def get_user_activity_analytics(
    user_type: Optional[str] = None,
    activity_type: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    token_payload: dict = Depends(verify_token)
):
    """Get user activity analytics"""
    if token_payload["role"] not in ["SuperAdmin", "GeneralAdmin", "Manager"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    query = {}
    if user_type:
        query["user_type"] = user_type
    if activity_type:
        query["activity_type"] = activity_type
    
    if date_from and date_to:
        start_dt = datetime.fromisoformat(date_from)
        end_dt = datetime.fromisoformat(date_to)
        query["timestamp"] = {"$gte": start_dt, "$lte": end_dt}
    
    activities = list(user_activity_tracking_col.find(query).sort("timestamp", -1).limit(1000))
    
    # Process analytics
    analytics = {
        "total_activities": len(activities),
        "unique_users": len(set(activity["user_id"] for activity in activities)),
        "activity_by_type": {},
        "activity_by_hour": {},
        "device_breakdown": {},
        "top_pages": {},
        "user_engagement": {}
    }
    
    for activity in activities:
        activity.pop("_id", None)
        
        # Activity type breakdown
        act_type = activity.get("activity_type", "unknown")
        analytics["activity_by_type"][act_type] = analytics["activity_by_type"].get(act_type, 0) + 1
        
        # Activity by hour
        hour = activity["timestamp"].hour
        analytics["activity_by_hour"][str(hour)] = analytics["activity_by_hour"].get(str(hour), 0) + 1
        
        # Device breakdown
        device = activity.get("device_type", "unknown")
        analytics["device_breakdown"][device] = analytics["device_breakdown"].get(device, 0) + 1
        
        # Top pages
        if activity.get("page_url"):
            page = activity["page_url"]
            analytics["top_pages"][page] = analytics["top_pages"].get(page, 0) + 1
    
    # Calculate engagement metrics
    user_sessions = {}
    for activity in activities:
        user_id = activity["user_id"]
        session_id = activity["session_id"]
        
        if user_id not in user_sessions:
            user_sessions[user_id] = {}
        if session_id not in user_sessions[user_id]:
            user_sessions[user_id][session_id] = []
        
        user_sessions[user_id][session_id].append(activity)
    
    # Calculate average session duration and pages per session
    session_durations = []
    pages_per_session = []
    
    for user_id, sessions in user_sessions.items():
        for session_id, session_activities in sessions.items():
            if len(session_activities) > 1:
                start_time = min(activity["timestamp"] for activity in session_activities)
                end_time = max(activity["timestamp"] for activity in session_activities)
                duration = (end_time - start_time).total_seconds() / 60  # minutes
                session_durations.append(duration)
            
            pages_per_session.append(len(session_activities))
    
    analytics["user_engagement"] = {
        "avg_session_duration_minutes": round(sum(session_durations) / len(session_durations), 2) if session_durations else 0,
        "avg_pages_per_session": round(sum(pages_per_session) / len(pages_per_session), 2) if pages_per_session else 0,
        "total_sessions": len(pages_per_session)
    }
    
    return analytics

@app.get("/api/analytics/real-time-events")
async def get_real_time_events(
    event_type: Optional[str] = None,
    severity: Optional[str] = None,
    requires_action: Optional[bool] = None,
    resolved: Optional[bool] = None,
    skip: int = 0,
    limit: int = 50,
    token_payload: dict = Depends(verify_token)
):
    """Get real-time events"""
    if token_payload["role"] not in ["SuperAdmin", "GeneralAdmin", "Manager"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    query = {}
    if event_type:
        query["event_type"] = event_type
    if severity:
        query["severity"] = severity
    if requires_action is not None:
        query["requires_action"] = requires_action
    if resolved is not None:
        query["resolved"] = resolved
    
    events = list(real_time_events_col.find(query).sort("timestamp", -1).skip(skip).limit(limit))
    total = real_time_events_col.count_documents(query)
    
    for event in events:
        event.pop("_id", None)
    
    return {
        "events": events,
        "total": total,
        "page": skip // limit + 1,
        "pages": (total + limit - 1) // limit
    }

@app.post("/api/analytics/real-time-events")
async def create_real_time_event(event: RealTimeEvent, token_payload: dict = Depends(verify_token)):
    """Create real-time event"""
    event_dict = event.dict()
    result = real_time_events_col.insert_one(event_dict)
    
    # Auto-create notification for critical events
    if event.severity == "critical" or event.requires_action:
        notification = Notification(
            category="system",
            recipient_type="admin",
            title=f"Critical Event: {event.title}",
            content=f"Event: {event.description}\nSource: {event.source}",
            priority="high" if event.severity == "critical" else "normal",
            channels=["in_app", "email"]
        )
        
        notifications_col.insert_one(notification.dict())
    
    return {"id": event.id, "message": "Real-time event created successfully"}

# Data Retention Policy Routes
@app.get("/api/data-retention/policies")
async def get_data_retention_policies(
    data_category: Optional[str] = None,
    status: Optional[str] = None,
    token_payload: dict = Depends(verify_token)
):
    """Get data retention policies"""
    if token_payload["role"] not in ["SuperAdmin", "GeneralAdmin"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    query = {}
    if data_category:
        query["data_category"] = data_category
    if status:
        query["status"] = status
    
    policies = list(data_retention_policies_col.find(query).sort("created_at", -1))
    
    for policy in policies:
        policy.pop("_id", None)
    
    return policies

@app.post("/api/data-retention/policies")
async def create_data_retention_policy(policy: DataRetentionPolicy, token_payload: dict = Depends(verify_token)):
    """Create data retention policy"""
    if token_payload["role"] not in ["SuperAdmin"]:
        raise HTTPException(status_code=403, detail="Only SuperAdmin can create retention policies")
    
    policy.created_by = token_payload["user_id"]
    policy_dict = policy.dict()
    result = data_retention_policies_col.insert_one(policy_dict)
    
    await log_admin_action(
        token_payload["user_id"], token_payload["sub"],
        "create", "data_retention_policy", policy.id,
        details={"policy_name": policy.policy_name, "data_category": policy.data_category, "retention_days": policy.retention_period_days}
    )
    
    return {"id": policy.id, "message": "Data retention policy created successfully"}

# System Initialization Route
@app.post("/api/init/sample-data")
async def initialize_sample_data():
    """Initialize sample data for testing (REMOVE IN PRODUCTION)"""
    try:
        # Create admin users
        admin_users = [
            {
                "id": str(uuid.uuid4()),
                "username": "superadmin",
                "email": "superadmin@ballys.lk",
                "full_name": "Super Administrator",
                "role": "SuperAdmin",
                "department": "IT",
                "password_hash": pwd_context.hash("admin123"),
                "is_active": True,
                "created_at": datetime.utcnow(),
                "permissions": ["*"]  # All permissions
            },
            {
                "id": str(uuid.uuid4()),
                "username": "manager",
                "email": "manager@ballys.lk",
                "full_name": "Casino Manager",
                "role": "GeneralAdmin",
                "department": "Operations",
                "password_hash": pwd_context.hash("manager123"),
                "is_active": True,
                "created_at": datetime.utcnow(),
                "permissions": ["members:read", "members:write", "gaming:read", "gaming:write", "reports:read"]
            }
        ]
        
        # Clear existing admin users and insert new ones
        admin_users_col.delete_many({})
        admin_users_col.insert_many(admin_users)
        
        # Create sample members
        sample_members = []
        for i in range(100):
            member = Member(
                member_number=f"MB{10001 + i}",
                first_name=f"Member{i}",
                last_name=f"LastName{i}",
                email=f"member{i}@example.com",
                phone=f"07712345{i:03d}",
                date_of_birth=datetime(1980 + (i % 40), (i % 12) + 1, (i % 28) + 1),
                nationality="Sri Lankan",
                nic_passport=encrypt_sensitive_data(f"199{i:07d}V"),
                tier=["Ruby", "Sapphire", "Diamond", "VIP"][i % 4],
                points_balance=float(i * 100),
                total_points_earned=float(i * 150),
                lifetime_spend=float(i * 500),
                kyc_verified=True,
                marketing_consent=i % 2 == 0,
                preferences={"favorite_game": ["Blackjack", "Roulette", "Poker", "Slots"][i % 4]}
            )
            sample_members.append(member.dict())
        
        members_col.delete_many({})
        members_col.insert_many(sample_members)
        
        # Create gaming packages
        gaming_packages_data = [
            GamingPackage(
                name="Ruby Starter",
                description="Entry-level gaming package for Ruby members",
                price=50.00,
                credits=75.00,
                validity_hours=4,
                tier_access=["Ruby", "Sapphire", "Diamond", "VIP"]
            ),
            GamingPackage(
                name="Sapphire Experience",
                description="Enhanced gaming package for Sapphire members and above",
                price=150.00,
                credits=200.00,
                validity_hours=8,
                tier_access=["Sapphire", "Diamond", "VIP"]
            ),
            GamingPackage(
                name="Diamond Elite",
                description="Premium gaming package for Diamond members and VIP",
                price=500.00,
                credits=750.00,
                validity_hours=12,
                tier_access=["Diamond", "VIP"]
            ),
            GamingPackage(
                name="VIP Ultimate",
                description="Exclusive gaming package for VIP members only",
                price=1000.00,
                credits=1500.00,
                validity_hours=24,
                tier_access=["VIP"]
            )
        ]
        
        gaming_packages_col.delete_many({})
        gaming_packages_col.insert_many([pkg.dict() for pkg in gaming_packages_data])
        
        # Create sample gaming sessions
        sample_sessions = []
        for i in range(50):
            member_id = sample_members[i]["id"]
            session = GamingSession(
                member_id=member_id,
                game_type=["Blackjack", "Roulette", "Poker", "Baccarat", "Slots"][i % 5],
                table_number=f"T{(i % 20) + 1}" if i % 5 != 4 else None,
                machine_number=f"M{(i % 50) + 1}" if i % 5 == 4 else None,
                buy_in_amount=100.0 + (i * 10),
                cash_out_amount=80.0 + (i * 8) if i % 3 == 0 else None,
                net_result=(80.0 + (i * 8)) - (100.0 + (i * 10)) if i % 3 == 0 else None,
                points_earned=float(i * 2),
                status="completed" if i % 3 == 0 else "active"
            )
            sample_sessions.append(session.dict())
        
        gaming_sessions_col.delete_many({})
        gaming_sessions_col.insert_many(sample_sessions)
        
        # Create rewards catalog
        rewards_data = [
            RewardItem(
                name="Complimentary Dinner",
                description="Free dinner for two at our signature restaurant",
                category="dining",
                points_required=500.0,
                cash_value=75.0,
                tier_access=["Ruby", "Sapphire", "Diamond", "VIP"]
            ),
            RewardItem(
                name="Weekend Getaway",
                description="Two-night stay at our luxury hotel",
                category="accommodation",
                points_required=2000.0,
                cash_value=300.0,
                tier_access=["Sapphire", "Diamond", "VIP"]
            ),
            RewardItem(
                name="VIP Gaming Credits",
                description="$500 gaming credits for VIP members",
                category="gaming",
                points_required=5000.0,
                cash_value=500.0,
                tier_access=["VIP"]
            ),
            RewardItem(
                name="Branded Merchandise",
                description="Bally's Casino luxury merchandise package",
                category="merchandise",
                points_required=200.0,
                cash_value=50.0,
                tier_access=["Ruby", "Sapphire", "Diamond", "VIP"]
            )
        ]
        
        rewards_col.delete_many({})
        rewards_col.insert_many([reward.dict() for reward in rewards_data])
        
        # Phase 2 Sample Data - Marketing Intelligence & Travel Management
        
        # Generate customer analytics for all members
        analytics_data = []
        for i, member in enumerate(sample_members):
            analytics = CustomerAnalytics(
                member_id=member["id"],
                last_activity_date=datetime.utcnow() - timedelta(days=i % 60),
                visit_frequency=round(4.0 - (i % 8) * 0.5, 2),  # 0.5 to 4 visits per month
                avg_session_duration=120 + (i % 240),  # 2-6 hours
                avg_spend_per_visit=200 + (i % 800),  # $200-$1000
                favorite_games=["Blackjack", "Roulette", "Poker", "Baccarat", "Slots"][i % 5:i % 5 + 2],
                preferred_visit_times=["evening", "late_night"][i % 2:i % 2 + 1],
                social_interactions=i % 20,
                birthday_month=member["date_of_birth"].month,
                preferred_drinks=["Whiskey", "Wine", "Champagne", "Cocktails", "Beer"][i % 5:i % 5 + 2],
                dietary_preferences=["None", "Vegetarian", "Halal", "Gluten-Free"][i % 4:i % 4 + 1],
                risk_score=round((i % 100) / 100.0, 2),  # 0-1 churn risk
                marketing_segments=["High-Value", "Regular", "Casual", "VIP"][i % 4:i % 4 + 1]
            )
            analytics_data.append(analytics.dict())
        
        customer_analytics_col.delete_many({})
        customer_analytics_col.insert_many(analytics_data)
        
        # Generate birthday calendar
        birthday_data = []
        for member in sample_members:
            birthday = BirthdayCalendar(
                member_id=member["id"],
                member_name=f"{member['first_name']} {member['last_name']}",
                email=member["email"],
                phone=member["phone"],
                tier=member["tier"],
                birthday_date=member["date_of_birth"],
                birth_month=member["date_of_birth"].month,
                birth_day=member["date_of_birth"].day,
                preferred_celebration_type=["dining", "gaming", "entertainment"][hash(member["id"]) % 3],
                gift_preferences=["Dining Voucher", "Gaming Credits", "Merchandise", "Spa Treatment"][hash(member["id"]) % 4:hash(member["id"]) % 4 + 2],
                notification_sent=hash(member["id"]) % 4 == 0,
                last_birthday_spend=float((hash(member["id"]) % 500) + 100)
            )
            birthday_data.append(birthday.dict())
        
        birthday_calendar_col.delete_many({})
        birthday_calendar_col.insert_many(birthday_data)
        
        # Generate walk-in guests data
        walk_in_data = []
        for i in range(30):  # 30 walk-in guests
            guest = WalkInGuest(
                first_name=f"WalkIn{i}",
                last_name=f"Guest{i}",
                phone=f"077123{i:04d}",
                nationality="Sri Lankan",
                id_document=encrypt_sensitive_data(f"200{i:07d}V"),
                visit_date=datetime.utcnow() - timedelta(days=i % 7),
                entry_time=datetime.utcnow() - timedelta(days=i % 7, hours=i % 12),
                exit_time=datetime.utcnow() - timedelta(days=i % 7, hours=(i % 12) - 3) if i % 4 == 0 else None,
                spend_amount=50 + (i * 25) if i % 3 == 0 else None,
                games_played=["Slots", "Blackjack", "Roulette"][i % 3:i % 3 + 1],
                converted_to_member=i % 5 == 0,
                follow_up_required=i % 4 == 0,
                marketing_consent=i % 3 == 0
            )
            walk_in_data.append(guest.dict())
        
        walk_in_guests_col.delete_many({})
        walk_in_guests_col.insert_many(walk_in_data)
        
        # Generate VIP experiences
        vip_experiences_data = []
        vip_members = [m for m in sample_members if m["tier"] == "VIP"][:10]
        for i, member in enumerate(vip_members):
            experience = VIPExperience(
                member_id=member["id"],
                experience_type=["arrival", "gaming", "dining", "entertainment"][i % 4],
                scheduled_date=datetime.utcnow() + timedelta(days=i % 30),
                services_included=["Personal Host", "VIP Lounge", "Premium Dining", "Luxury Transport"][i % 4:i % 4 + 2],
                special_requests=[f"Special request {i}"],
                cost=500.0 + (i * 100),
                satisfaction_score=8 + (i % 3) if i % 2 == 0 else None,
                status=["planned", "completed", "in_progress"][i % 3]
            )
            vip_experiences_data.append(experience.dict())
        
        vip_experiences_col.delete_many({})
        vip_experiences_col.insert_many(vip_experiences_data)
        
        # Generate group bookings
        group_bookings_data = []
        for i in range(15):  # 15 group bookings
            booking = GroupBooking(
                group_name=f"Group Event {i + 1}",
                contact_person=f"Contact Person {i}",
                contact_email=f"contact{i}@example.com",
                contact_phone=f"077123{i:04d}",
                group_size=10 + (i * 5),
                group_type=["corporate", "celebration", "tournament", "leisure"][i % 4],
                booking_date=datetime.utcnow() - timedelta(days=i),
                arrival_date=datetime.utcnow() + timedelta(days=i % 60),
                departure_date=datetime.utcnow() + timedelta(days=(i % 60) + 2),
                special_requirements=[f"Special requirement {i}"],
                budget_range=["low", "medium", "high", "premium"][i % 4],
                services_requested=["Dining", "Gaming", "Entertainment", "Transport"][i % 4:i % 4 + 2],
                total_estimated_value=1000.0 + (i * 500),
                status=["inquiry", "confirmed", "completed"][i % 3]
            )
            group_bookings_data.append(booking.dict())
        
        group_bookings_col.delete_many({})
        group_bookings_col.insert_many(group_bookings_data)
        
        # Generate marketing campaigns
        campaigns_data = [
            MarketingCampaign(
                name="Birthday Celebration Campaign",
                description="Monthly birthday promotions for all tiers",
                campaign_type="birthday",
                target_audience=["Ruby", "Sapphire", "Diamond", "VIP"],
                start_date=datetime.utcnow(),
                end_date=datetime.utcnow() + timedelta(days=30),
                budget=5000.0,
                estimated_reach=100,
                actual_reach=75,
                conversion_rate=15.5,
                status="active",
                created_by=admin_users[0]["id"]
            ),
            MarketingCampaign(
                name="Inactive Member Re-engagement",
                description="Bring back members who haven't visited in 60+ days",
                campaign_type="inactive",
                target_audience=["Sapphire", "Diamond", "VIP"],
                start_date=datetime.utcnow() - timedelta(days=15),
                end_date=datetime.utcnow() + timedelta(days=15),
                budget=3000.0,
                estimated_reach=50,
                actual_reach=35,
                conversion_rate=8.2,
                status="active",
                created_by=admin_users[1]["id"]
            ),
            MarketingCampaign(
                name="VIP Exclusive Experience",
                description="Special VIP-only events and experiences",
                campaign_type="vip",
                target_audience=["VIP"],
                start_date=datetime.utcnow() + timedelta(days=7),
                end_date=datetime.utcnow() + timedelta(days=37),
                budget=10000.0,
                estimated_reach=25,
                actual_reach=0,
                conversion_rate=0.0,
                status="draft",
                created_by=admin_users[0]["id"]
            )
        ]
        
        marketing_campaigns_col.delete_many({})
        marketing_campaigns_col.insert_many([campaign.dict() for campaign in campaigns_data])
        
        # Phase 3 Sample Data - Staff Management & Advanced Analytics
        
        # Generate staff members
        staff_data = []
        departments = ["Gaming", "F&B", "Security", "Management", "Maintenance"]
        positions = {
            "Gaming": ["Dealer", "Floor Supervisor", "Gaming Manager", "Pit Boss"],
            "F&B": ["Server", "Bartender", "Chef", "Restaurant Manager"],
            "Security": ["Security Guard", "Security Supervisor", "Head of Security"],
            "Management": ["Assistant Manager", "Department Head", "Operations Manager"],
            "Maintenance": ["Technician", "Maintenance Supervisor", "Facilities Manager"]
        }
        
        for i in range(50):  # 50 staff members
            dept = departments[i % 5]
            position_list = positions[dept]
            staff = StaffMember(
                employee_id=f"EMP{1000 + i}",
                first_name=f"Staff{i}",
                last_name=f"Member{i}",
                email=f"staff{i}@ballys.lk",
                phone=f"077987{i:04d}",
                position=position_list[i % len(position_list)],
                department=dept,
                hire_date=datetime.utcnow() - timedelta(days=30 + (i * 10)),
                salary=30000 + (i * 1000),  # 30k-80k salary range
                performance_score=60.0 + (i % 40),  # 60-100 performance range
                commitment_score=70.0 + (i % 30),  # 70-100 commitment range
                training_completion_rate=50.0 + (i % 50),  # 50-100% completion
                skills=[f"Skill{j}" for j in range((i % 5) + 1)],
                certifications=[f"Cert{j}" for j in range((i % 3) + 1)] if i % 3 == 0 else [],
                next_review_due=datetime.utcnow() + timedelta(days=30 + (i % 90))
            )
            staff_data.append(staff.dict())
        
        staff_members_col.delete_many({})
        staff_members_col.insert_many(staff_data)
        
        # Generate training courses
        courses_data = [
            TrainingCourse(
                course_name="Casino Safety Protocols",
                description="Essential safety procedures for casino operations",
                category="safety",
                difficulty_level="beginner",
                duration_hours=4,
                required_for_positions=["Dealer", "Floor Supervisor", "Security Guard"],
                is_mandatory=True,
                created_by=admin_users[0]["id"]
            ),
            TrainingCourse(
                course_name="Customer Service Excellence",
                description="Advanced customer service skills for gaming industry",
                category="customer_service",
                difficulty_level="intermediate",
                duration_hours=8,
                required_for_positions=["Server", "Bartender", "Dealer"],
                created_by=admin_users[1]["id"]
            ),
            TrainingCourse(
                course_name="Gaming Regulations Compliance",
                description="Sri Lankan gaming laws and compliance requirements",
                category="compliance",
                difficulty_level="advanced",
                duration_hours=12,
                required_for_positions=["Gaming Manager", "Pit Boss", "Floor Supervisor"],
                is_mandatory=True,
                validity_months=12,
                created_by=admin_users[0]["id"]
            ),
            TrainingCourse(
                course_name="Leadership Development",
                description="Management and leadership skills for supervisory roles",
                category="leadership",
                difficulty_level="advanced",
                duration_hours=16,
                required_for_positions=["Gaming Manager", "Restaurant Manager", "Head of Security"],
                created_by=admin_users[0]["id"]
            )
        ]
        
        training_courses_col.delete_many({})
        training_courses_col.insert_many([course.dict() for course in courses_data])
        
        # Generate training records
        training_records_data = []
        for i in range(100):  # 100 training records
            staff_member = staff_data[i % 50]
            course = courses_data[i % 4]
            
            record = TrainingRecord(
                staff_id=staff_member["id"],
                course_id=course.id,
                enrollment_date=datetime.utcnow() - timedelta(days=i % 30),
                start_date=datetime.utcnow() - timedelta(days=(i % 30) - 5) if i % 3 == 0 else None,
                completion_date=datetime.utcnow() - timedelta(days=(i % 30) - 10) if i % 4 == 0 else None,
                score=75 + (i % 25) if i % 4 == 0 else None,
                status=["enrolled", "in_progress", "completed", "completed"][i % 4],
                time_spent_minutes=course.duration_hours * 60 + (i % 120)
            )
            training_records_data.append(record.dict())
        
        training_records_col.delete_many({})
        training_records_col.insert_many(training_records_data)
        
        # Generate performance reviews
        performance_data = []
        for i in range(25):  # 25 performance reviews
            staff_member = staff_data[i * 2]  # Every other staff member
            review = PerformanceReview(
                staff_id=staff_member["id"],
                reviewer_id=admin_users[i % 2]["id"],
                review_period_start=datetime.utcnow() - timedelta(days=90),
                review_period_end=datetime.utcnow() - timedelta(days=1),
                overall_rating=3 + (i % 3),  # 3-5 rating
                performance_areas={
                    "Communication": 3 + (i % 3),
                    "Teamwork": 3 + ((i + 1) % 3),
                    "Technical Skills": 3 + ((i + 2) % 3),
                    "Customer Service": 4 + (i % 2)
                },
                achievements=[f"Achievement {i + 1}", f"Goal completion {i + 1}"],
                areas_for_improvement=[f"Improvement area {i + 1}"],
                goals_set=[f"Goal {i + 1} for next period"],
                review_status="completed"
            )
            performance_data.append(review.dict())
        
        performance_reviews_col.delete_many({})
        performance_reviews_col.insert_many(performance_data)
        
        # Generate advanced analytics
        analytics_data = [
            AdvancedAnalytics(
                analysis_type="customer_ltv",
                time_period="monthly",
                data_points={
                    "avg_ltv_vip": 15000,
                    "avg_ltv_diamond": 8000,
                    "avg_ltv_sapphire": 4500,
                    "avg_ltv_ruby": 2200,
                    "retention_rate": 0.75
                },
                insights=[
                    "VIP customers have 5x higher lifetime value than Ruby tier",
                    "Gaming revenue comprises 70% of customer lifetime value"
                ],
                recommendations=[
                    "Focus VIP acquisition programs",
                    "Enhance gaming experience for mid-tier customers"
                ],
                confidence_score=87.5,
                created_by=admin_users[0]["id"]
            ),
            AdvancedAnalytics(
                analysis_type="churn_prediction",
                time_period="weekly",
                data_points={
                    "high_risk_members": 45,
                    "medium_risk_members": 120,
                    "predicted_monthly_churn": 25
                },
                insights=[
                    "Members inactive for 45+ days have 80% churn probability",
                    "Declining gaming frequency is strongest churn predictor"
                ],
                recommendations=[
                    "Implement 30-day re-engagement campaign",
                    "Create gaming frequency alerts for managers"
                ],
                confidence_score=92.3,
                created_by=admin_users[0]["id"]
            )
        ]
        
        advanced_analytics_col.delete_many({})
        advanced_analytics_col.insert_many([analytics.dict() for analytics in analytics_data])
        
        # Generate cost optimization opportunities
        cost_optimization_data = [
            CostOptimization(
                optimization_area="staffing",
                current_cost=50000,
                projected_savings=8000,
                implementation_cost=2000,
                roi_percentage=400,
                timeline_weeks=4,
                implementation_status="proposed",
                priority_level="high",
                responsible_department="Management",
                success_metrics=["Staff utilization +15%", "Overtime costs -20%"],
                risks=["Initial training period productivity dip"],
                mitigation_strategies=["Gradual rollout", "Additional training support"]
            ),
            CostOptimization(
                optimization_area="energy",
                current_cost=15000,
                projected_savings=3000,
                implementation_cost=5000,
                roi_percentage=200,
                timeline_weeks=8,
                implementation_status="approved",
                priority_level="medium",
                responsible_department="Maintenance",
                success_metrics=["Energy consumption -20%", "Monthly utility savings $500"],
                risks=["Equipment downtime during installation"],
                mitigation_strategies=["Schedule during low-traffic hours", "Backup systems ready"]
            )
        ]
        
        cost_optimization_col.delete_many({})
        cost_optimization_col.insert_many([opt.dict() for opt in cost_optimization_data])
        
        # Generate predictive models
        models_data = [
            PredictiveModel(
                model_name="Customer Churn Predictor",
                model_type="churn_prediction",
                description="Predicts likelihood of customer churn based on gaming patterns",
                input_features=["visit_frequency", "avg_spend", "days_since_last_visit", "tier_level"],
                target_variable="will_churn_30_days",
                algorithm_used="Random Forest",
                training_data_size=5000,
                accuracy_score=0.89,
                precision_score=0.85,
                recall_score=0.82,
                is_production=True,
                predictions_made=1250,
                success_rate=0.87,
                created_by=admin_users[0]["id"]
            ),
            PredictiveModel(
                model_name="Revenue Forecaster",
                model_type="demand_forecasting",
                description="Forecasts daily gaming revenue based on historical patterns",
                input_features=["day_of_week", "month", "weather", "events", "promotions"],
                target_variable="daily_gaming_revenue",
                algorithm_used="LSTM Neural Network",
                training_data_size=2000,
                accuracy_score=0.76,
                precision_score=0.78,
                recall_score=0.74,
                is_production=False,
                predictions_made=450,
                success_rate=0.73,
                created_by=admin_users[0]["id"]
            )
        ]
        
        predictive_models_col.delete_many({})
        predictive_models_col.insert_many([model.dict() for model in models_data])
        
        return {"message": "Sample data initialized successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error initializing data: {str(e)}")

# Health check route
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow(), "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8001, reload=True)