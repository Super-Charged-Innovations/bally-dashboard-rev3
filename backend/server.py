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
    
    avg_satisfaction = sum(exp.get("satisfaction_score", 0) for exp in completed_experiences) / len(completed_experiences) if completed_experiences else 0
    
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