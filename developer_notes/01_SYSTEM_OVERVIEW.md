# Bally's Casino Admin Dashboard - System Overview

## Project Status: **CRITICAL RUNTIME ERRORS PERSISTING**

### **System Architecture**
- **Frontend**: React 18 + Tailwind CSS + Chart.js
- **Backend**: FastAPI + MongoDB + JWT Authentication
- **Environment**: Kubernetes container with Supervisor process management
- **Theme**: Adaptive dark/light mode casino theme

### **Current Critical Issues**
1. **Persistent Runtime Errors**: Multiple components experiencing `.map()` and `.filter()` errors
2. **Data Structure Mismatches**: Mock data structure not matching component expectations
3. **Service Instability**: Frontend service restart loops and port conflicts
4. **Authentication Bypass**: Using temporary mock tokens due to login issues

### **Technology Stack**

#### Frontend Dependencies
```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "tailwindcss": "^3.3.5",
  "chart.js": "^4.4.0",
  "react-chartjs-2": "^5.2.0",
  "axios": "^1.6.2",
  "react-hot-toast": "^2.5.2",
  "@heroicons/react": "^2.0.18",
  "@headlessui/react": "^1.7.17"
}
```

#### Backend Dependencies
```python
fastapi==0.104.1
uvicorn==0.24.0
pymongo==4.6.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
cryptography==45.0.6
motor==3.3.2
```

### **Architecture Patterns**
- **Authentication**: JWT-based with role-based access control (RBAC)
- **Database**: MongoDB with encrypted sensitive data (PDPA 2022 compliance)
- **API Design**: RESTful with `/api` prefix for Kubernetes ingress routing
- **State Management**: React Context for theming, local state for components
- **Error Handling**: Comprehensive logging and audit trails
- **Security**: CORS hardening, rate limiting, input validation

### **Environment Configuration**
- **Frontend URL**: `https://278d5cb3-1990-4612-af40-7935ae311bb8.preview.emergentagent.com`
- **Backend Internal**: `http://localhost:8001`
- **Database**: `mongodb://localhost:27017/ballys_casino_admin`
- **Proxy Setup**: `/api` routes → port 8001, frontend → port 3000

### **Compliance Standards**
- **PDPA 2022** (Sri Lankan Personal Data Protection Act)
- **AML/CFT** (Anti-Money Laundering/Combating Financing of Terrorism)
- **Online Safety Act 2024**
- **Gambling Regulatory Authority Act 2025**

### **Service Architecture**
```
Kubernetes Ingress
├── Frontend (React) - Port 3000
├── Backend (FastAPI) - Port 8001  
├── Database (MongoDB) - Port 27017
└── Supervisor (Process Manager)
    ├── frontend.conf
    └── backend management
```

### **Critical Path Issues**
1. **Mock Data Coverage**: Incomplete endpoint coverage causing undefined errors
2. **Component Error Boundaries**: Missing null safety checks
3. **Service Stability**: Port conflicts and restart loops
4. **Data Flow**: Mismatch between API responses and component expectations