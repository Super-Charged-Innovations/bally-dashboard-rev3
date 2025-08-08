import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

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
      if (token) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (credentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      setUser(response.user_info);
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      toast.success(`Welcome back, ${response.user_info.full_name}!`);
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Login failed. Please check your credentials.');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-12 h-12 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Bally's Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Login onLogin={handleLogin} loading={loading} />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#374151',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </div>
    );
  }

  return (
    <Router>
      <div className="flex h-screen bg-gray-50 dashboard-container">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#374151',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />

        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 ease-in-out flex-shrink-0`}>
          <Sidebar 
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            user={user}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            user={user} 
            onLogout={handleLogout}
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          />
          
          <main className="flex-1 overflow-auto p-6">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard user={user} />} />
              <Route path="/members" element={<MemberManagement user={user} />} />
              <Route path="/gaming" element={<GamingManagement user={user} />} />
              <Route path="/rewards" element={<RewardsManagement user={user} />} />
              <Route path="/marketing" element={<MarketingIntelligence user={user} />} />
              <Route path="/travel" element={<TravelManagement user={user} />} />
              <Route path="/analytics" element={<Analytics user={user} />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;