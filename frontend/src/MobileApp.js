import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';

// Mobile components
import MobileLogin from './components/mobile/MobileLogin';
import MobileLayout from './components/mobile/MobileLayout';
import MobileDashboard from './components/mobile/MobileDashboard';
import MobileCasinoFloor from './components/mobile/MobileCasinoFloor';

// Regular desktop components (with mobile responsiveness)
import GamingManagement from './components/GamingManagement';
import MemberManagement from './components/MemberManagement';
import AdvancedAnalytics from './components/AdvancedAnalytics';
import RewardsManagement from './components/RewardsManagement';
import StaffManagement from './components/StaffManagement';
import Settings from './components/Settings';

// Utils
import { isMobileDevice, shouldRedirectToMobile, redirectToMobile } from './utils/mobileUtils';

function MobileApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user should be redirected to mobile
    const currentPath = window.location.pathname;
    if (shouldRedirectToMobile() && !currentPath.startsWith('/m/')) {
      redirectToMobile();
      return;
    }

    // Check for existing login
    checkExistingLogin();
  }, []);

  const checkExistingLogin = () => {
    try {
      const token = localStorage.getItem('casino_mobile_token');
      const userData = localStorage.getItem('casino_mobile_user');
      
      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Failed to check existing login:', error);
      localStorage.removeItem('casino_mobile_token');
      localStorage.removeItem('casino_mobile_user');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (userData) => {
    try {
      // Generate a mock token
      const token = `mobile_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store login data
      localStorage.setItem('casino_mobile_token', token);
      localStorage.setItem('casino_mobile_user', JSON.stringify(userData));
      
      setUser(userData);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('casino_mobile_token');
    localStorage.removeItem('casino_mobile_user');
    setUser(null);
    window.location.href = '/m/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading Bally's Casino...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1f2937',
                color: '#ffffff',
                borderRadius: '12px',
                padding: '12px 16px',
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

          {!user ? (
            <Routes>
              <Route path="/m/*" element={<MobileLogin onLogin={handleLogin} />} />
              <Route path="*" element={<Navigate to="/m/" />} />
            </Routes>
          ) : (
            <MobileLayout user={user} onLogout={handleLogout}>
              <Routes>
                {/* Mobile-specific routes */}
                <Route path="/m/dashboard" element={<MobileDashboard user={user} />} />
                <Route path="/m/casino-floor" element={<MobileCasinoFloor user={user} />} />
                
                {/* Desktop components adapted for mobile */}
                <Route path="/m/gaming" element={
                  <div className="mobile-responsive-wrapper">
                    <GamingManagement user={user} />
                  </div>
                } />
                <Route path="/m/members" element={
                  <div className="mobile-responsive-wrapper">
                    <MemberManagement user={user} />
                  </div>
                } />
                <Route path="/m/analytics" element={
                  <div className="mobile-responsive-wrapper">
                    <AdvancedAnalytics user={user} />
                  </div>
                } />
                <Route path="/m/rewards" element={
                  <div className="mobile-responsive-wrapper">
                    <RewardsManagement user={user} />
                  </div>
                } />
                <Route path="/m/staff" element={
                  <div className="mobile-responsive-wrapper">
                    <StaffManagement user={user} />
                  </div>
                } />
                <Route path="/m/settings" element={
                  <div className="mobile-responsive-wrapper">
                    <Settings user={user} />
                  </div>
                } />

                {/* Default redirects */}
                <Route path="/m/" element={<Navigate to="/m/dashboard" />} />
                <Route path="/m" element={<Navigate to="/m/dashboard" />} />
                <Route path="*" element={<Navigate to="/m/dashboard" />} />
              </Routes>
            </MobileLayout>
          )}
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default MobileApp;