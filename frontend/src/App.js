import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Context
import { ThemeProvider } from './contexts/ThemeContext';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import MemberManagement from './components/MemberManagement';
import GamingManagement from './components/GamingManagement';
import RewardsManagement from './components/RewardsManagement';
import MarketingIntelligence from './components/MarketingIntelligence';
import TravelManagement from './components/TravelManagement';
import StaffManagement from './components/StaffManagement';
import AdvancedAnalytics from './components/AdvancedAnalytics';
import Analytics from './components/Analytics';
import EnterpriseDashboard from './components/EnterpriseDashboard';
import NotificationsManagement from './components/NotificationsManagement';
import ComplianceDashboard from './components/ComplianceDashboard';
import Settings from './components/Settings';

// Services
import authService from './services/authService';
import { toast, Toaster } from 'react-hot-toast';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user_data');
      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      setUser(response.user_info);
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('user_data', JSON.stringify(response.user_info));
      toast.success(`Welcome back, ${response.user_info.full_name}!`);
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      toast.error(error.message || 'Login failed. Please check your credentials.');
      return { success: false, error: error.message };
    }
  };

  // TEMPORARY: Direct access without authentication
  const handleDirectAccess = (role) => {
    const mockUser = role === 'SuperAdmin' ? {
      id: 'temp-superadmin-id',
      username: 'superadmin',
      full_name: 'Super Administrator',
      role: 'SuperAdmin',
      permissions: ['*']
    } : {
      id: 'temp-manager-id',
      username: 'manager',
      full_name: 'Casino Manager',
      role: 'GeneralAdmin',
      permissions: ['members:read', 'members:write', 'gaming:read', 'gaming:write', 'reports:read']
    };
    
    setUser(mockUser);
    localStorage.setItem('user_data', JSON.stringify(mockUser));
    localStorage.setItem('access_token', 'temp-mock-token');
    toast.success(`🎰 Direct access granted! Welcome, ${mockUser.full_name}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    setUser(null);
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-adaptive-bg flex items-center justify-center">
        <div className="text-center">
          <div className="casino-spinner w-12 h-12 mx-auto mb-4"></div>
          <p className="text-adaptive-text font-medium">Loading Bally's Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-adaptive-bg">
          {!user ? (
            <>
              <Login onLogin={handleLogin} onDirectAccess={handleDirectAccess} />
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  className: '',
                  style: {
                    background: 'rgb(var(--color-surface))',
                    color: 'rgb(var(--color-text))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgb(var(--color-border))',
                  },
                }}
              />
            </>
          ) : (
            <div className="flex h-screen">
              <Sidebar 
                isOpen={sidebarOpen} 
                onToggle={() => setSidebarOpen(!sidebarOpen)}
                user={user}
              />
              
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                  user={user} 
                  onLogout={handleLogout}
                  onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
                />
                
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-adaptive-bg">
                  <div className="container mx-auto px-6 py-8">
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard user={user} />} />
                      <Route path="/members" element={<MemberManagement user={user} />} />
                      <Route path="/gaming" element={<GamingManagement user={user} />} />
                      <Route path="/rewards" element={<RewardsManagement user={user} />} />
                      <Route path="/marketing" element={<MarketingIntelligence user={user} />} />
                      <Route path="/travel" element={<TravelManagement user={user} />} />
                      <Route path="/staff" element={<StaffManagement user={user} />} />
                      <Route path="/advanced-analytics" element={<AdvancedAnalytics user={user} />} />
                      <Route path="/analytics" element={<Analytics user={user} />} />
                      <Route path="/enterprise" element={<EnterpriseDashboard user={user} />} />
                      <Route path="/notifications" element={<NotificationsManagement user={user} />} />
                      <Route path="/compliance" element={<ComplianceDashboard user={user} />} />
                      <Route path="/settings" element={<Settings user={user} />} />
                      <Route path="/" element={<Navigate to="/dashboard" />} />
                    </Routes>
                  </div>
                </main>
              </div>
            </div>
          )}
          
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: '',
              style: {
                background: 'rgb(var(--color-surface))',
                color: 'rgb(var(--color-text))',
                borderRadius: '8px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                border: '1px solid rgb(var(--color-border))',
              },
            }}
          />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;