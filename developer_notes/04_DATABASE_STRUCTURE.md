# Database Structure Analysis

## **MongoDB Collections Overview**

Based on the backend server.py analysis, the system uses MongoDB with the following collections:

### **Core Collections (Lines 77-111)**

#### **1. admin_users**
```javascript
{
  id: "UUID",
  username: "string", // Unique identifier
  email: "email@domain.com",
  password_hash: "bcrypt_hash", // Encrypted
  full_name: "Full Name",
  role: "SuperAdmin|GeneralAdmin|Manager|Supervisor",
  department: "string|null",
  is_active: true,
  created_at: "datetime",
  last_login: "datetime|null",
  permissions: ["permission1", "permission2"],
  two_factor_enabled: false
}
```

#### **2. members**
```javascript
{
  id: "UUID",
  member_number: "string", // Unique
  first_name: "string",
  last_name: "string",
  email: "email@domain.com",
  phone: "string",
  date_of_birth: "datetime",
  nationality: "string",
  nic_passport: "encrypted_string", // PDPA 2022 compliance
  tier: "Ruby|Sapphire|Diamond|VIP",
  points_balance: 0.0,
  total_points_earned: 0.0,
  lifetime_spend: 0.0,
  registration_date: "datetime",
  last_visit: "datetime|null",
  is_active: true,
  self_excluded: false,
  kyc_verified: false,
  marketing_consent: false,
  preferences: {}
}
```

#### **3. gaming_sessions**
```javascript
{
  id: "UUID",
  member_id: "UUID", // Foreign key to members
  session_start: "datetime",
  session_end: "datetime|null",
  game_type: "string",
  table_number: "string|null",
  machine_number: "string|null",
  buy_in_amount: 0.0,
  cash_out_amount: 0.0,
  net_result: 0.0, // Can be negative
  points_earned: 0.0,
  status: "active|completed|suspended"
}
```

#### **4. gaming_packages**
```javascript
{
  id: "UUID",
  name: "string",
  description: "string",
  price: 0.0,
  credits: 0.0,
  validity_hours: 0,
  tier_access: ["Ruby", "Sapphire", "Diamond", "VIP"],
  is_active: true,
  created_at: "datetime"
}
```

#### **5. rewards**
```javascript
{
  id: "UUID",
  name: "string",
  description: "string",
  category: "dining|accommodation|gaming|merchandise",
  points_required: 0.0,
  cash_value: 0.0,
  tier_access: ["Ruby", "Sapphire", "Diamond", "VIP"],
  stock_quantity: 0, // null for unlimited
  is_active: true,
  created_at: "datetime"
}
```

### **Phase 2 Collections (Lines 88-92)**

#### **6. marketing_campaigns**
```javascript
{
  id: "UUID",
  name: "string",
  description: "string",
  campaign_type: "string",
  target_audience: ["string"],
  start_date: "datetime",
  end_date: "datetime",
  budget: 0.0,
  estimated_reach: 0,
  actual_reach: 0,
  conversion_rate: 0.0,
  status: "draft|active|completed|cancelled",
  created_by: "UUID",
  created_at: "datetime"
}
```

#### **7. customer_analytics**
```javascript
{
  id: "UUID",
  member_id: "UUID",
  last_activity_date: "datetime",
  visit_frequency: 0.0,
  avg_session_duration: 0,
  avg_spend_per_visit: 0.0,
  favorite_games: ["string"],
  preferred_visit_times: ["string"],
  social_interactions: 0,
  birthday_month: 0,
  preferred_drinks: ["string"],
  dietary_preferences: ["string"],
  risk_score: 0.0,
  marketing_segments: ["string"],
  last_updated: "datetime"
}
```

#### **8. walk_in_guests**
```javascript
{
  id: "UUID",
  first_name: "string",
  last_name: "string",
  phone: "string|null",
  email: "string|null",
  nationality: "string",
  id_document: "encrypted_string", // PDPA compliance
  visit_date: "datetime",
  entry_time: "datetime",
  exit_time: "datetime|null",
  spend_amount: 0.0,
  games_played: ["string"],
  services_used: ["string"],
  converted_to_member: false,
  follow_up_required: false,
  notes: "string|null",
  marketing_consent: false
}
```

### **Phase 3 Collections (Lines 95-100)**

#### **9. staff_members**
```javascript
{
  id: "UUID",
  employee_id: "string",
  first_name: "string",
  last_name: "string",
  email: "email",
  phone: "string",
  position: "string",
  department: "Gaming|F&B|Security|Management|Maintenance",
  hire_date: "datetime",
  salary: 0.0, // Encrypted in storage
  manager_id: "UUID|null",
  employment_status: "active|inactive|terminated",
  skills: ["string"],
  certifications: ["string"],
  performance_score: 0.0, // 0-100
  commitment_score: 0.0, // 0-100
  training_completion_rate: 0.0,
  last_performance_review: "datetime|null",
  next_review_due: "datetime|null",
  emergency_contact: {},
  created_at: "datetime",
  last_updated: "datetime"
}
```

#### **10. training_courses**
```javascript
{
  id: "UUID",
  course_name: "string",
  description: "string",
  category: "safety|technical|customer_service|compliance|leadership",
  difficulty_level: "beginner|intermediate|advanced",
  duration_hours: 0,
  required_for_positions: ["string"],
  prerequisites: ["string"],
  content_modules: ["string"],
  assessment_questions: [{}],
  passing_score: 70,
  validity_months: 0, // null for permanent
  is_mandatory: false,
  created_by: "UUID",
  is_active: true,
  created_at: "datetime",
  last_updated: "datetime"
}
```

### **Phase 4 Collections (Lines 103-111)**

#### **11. notifications**
```javascript
{
  id: "UUID",
  template_id: "UUID|null",
  recipient_type: "user|admin|system",
  recipient_id: "UUID|null",
  recipient_email: "string|null",
  recipient_phone: "string|null",
  title: "string",
  content: "string",
  category: "security|compliance|marketing|system|user_activity",
  priority: "low|normal|high|critical",
  channels: ["in_app", "email", "sms", "push"],
  status: "pending|sent|delivered|failed|read",
  scheduled_at: "datetime|null",
  sent_at: "datetime|null",
  delivered_at: "datetime|null",
  read_at: "datetime|null",
  metadata: {},
  created_at: "datetime"
}
```

#### **12. notification_templates**
```javascript
{
  id: "UUID",
  name: "string",
  category: "security|compliance|marketing|system|user_activity",
  title: "string", // Can contain variables like {user_name}
  content: "string", // Can contain variables
  variables: ["user_name", "amount"], // Available variables
  channels: ["email", "sms", "push", "in_app"],
  priority: "low|normal|high|critical",
  is_active: true,
  created_by: "UUID",
  created_at: "datetime",
  updated_at: "datetime"
}
```

#### **13. compliance_reports**
```javascript
{
  id: "UUID",
  report_type: "audit_trail|data_retention|kyc_compliance|aml_report|gambling_activity",
  report_period_start: "datetime",
  report_period_end: "datetime",
  generated_by: "UUID",
  status: "draft|completed|submitted|approved",
  summary: {},
  violations: [{}],
  recommendations: ["string"],
  file_path: "string|null",
  submitted_to: "string|null", // Regulatory body
  submission_date: "datetime|null",
  compliance_score: 0.0, // 0-100
  created_at: "datetime",
  updated_at: "datetime"
}
```

#### **14. data_retention_policies**
```javascript
{
  id: "UUID",
  policy_name: "string",
  data_category: "member_data|gaming_logs|audit_logs|marketing_data",
  retention_period_days: 0,
  archive_after_days: 0,
  auto_delete: false,
  encryption_required: true,
  backup_required: true,
  legal_basis: "string", // PDPA compliance reason
  exceptions: ["string"],
  status: "active|inactive|pending_approval",
  created_by: "UUID",
  approved_by: "UUID|null",
  approval_date: "datetime|null",
  next_review_date: "datetime",
  created_at: "datetime",
  updated_at: "datetime"
}
```

## **Relationships & Foreign Keys**

### **Member Ecosystem**
```
members (1) → gaming_sessions (N)
members (1) → customer_analytics (1)
members (1) → vip_experiences (N)
```

### **Staff Ecosystem**
```
staff_members (1) → training_records (N)
staff_members (1) → performance_reviews (N)
training_courses (1) → training_records (N)
```

### **Admin & Security**
```
admin_users (1) → audit_logs (N)
admin_users (1) → notifications (N) [created_by]
```

## **Data Encryption (PDPA 2022 Compliance)**

### **Encrypted Fields**
- `members.nic_passport` - Personal identification data
- `walk_in_guests.id_document` - Guest identification
- `staff_members.salary` - Sensitive financial data

### **Encryption Implementation**
```python
# Line 607-632 in server.py
def encrypt_sensitive_data(data: str) -> str:
    return cipher_suite.encrypt(data.encode()).decode()

def decrypt_sensitive_data(encrypted_data: str) -> str:
    return cipher_suite.decrypt(encrypted_data.encode()).decode()
```

## **Indexing Strategy**

### **Critical Indexes Needed**
```javascript
// Members
db.members.createIndex({ "member_number": 1 }, { unique: true })
db.members.createIndex({ "email": 1 })
db.members.createIndex({ "tier": 1 })
db.members.createIndex({ "is_active": 1 })

// Gaming Sessions
db.gaming_sessions.createIndex({ "member_id": 1 })
db.gaming_sessions.createIndex({ "session_start": -1 })
db.gaming_sessions.createIndex({ "status": 1 })

// Admin Users
db.admin_users.createIndex({ "username": 1 }, { unique: true })
db.admin_users.createIndex({ "email": 1 }, { unique: true })

// Audit Logs
db.audit_logs.createIndex({ "timestamp": -1 })
db.audit_logs.createIndex({ "admin_user_id": 1 })

// Notifications
db.notifications.createIndex({ "recipient_id": 1 })
db.notifications.createIndex({ "status": 1 })
db.notifications.createIndex({ "created_at": -1 })
```

## **Sample Data Generation**

### **Current Status**
- ✅ Sample data endpoint: `POST /api/init/sample-data` (Line 2290-2300)
- ✅ Mock data covers basic collections
- ❌ Missing advanced Phase 4 collection data

### **Sample Data Gaps**
1. **notification_templates** - No sample data
2. **advanced_analytics** - No sample data
3. **predictive_models** - No sample data
4. **cost_optimization** - No sample data

## **Database Issues Identified**

### **1. ObjectId vs UUID**
Backend uses UUID strings instead of MongoDB ObjectIds - Good for frontend compatibility.

### **2. No Referential Integrity**
MongoDB doesn't enforce foreign key constraints - Application must handle orphaned records.

### **3. Large Collection Scalability**
Collections like `gaming_sessions` and `audit_logs` can grow very large - Need partitioning strategy.

### **4. Encryption Key Management**
Encryption key stored in environment variable - Should use proper key management service.