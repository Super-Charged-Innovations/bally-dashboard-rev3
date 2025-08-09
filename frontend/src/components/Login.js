import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';

const Login = ({ onLogin, loading }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    const result = await onLogin(formData);
    if (!result.success) {
      setError(result.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-adaptive-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      {/* Casino Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: isDark 
            ? 'radial-gradient(circle at 2px 2px, rgba(255, 215, 0, 0.15) 1px, transparent 0)' 
            : 'radial-gradient(circle at 2px 2px, rgba(220, 38, 38, 0.1) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }}></div>
      </div>
      
      {/* Luxury Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-adaptive-text-accent/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-adaptive-text-accent/5 rounded-full blur-3xl animate-pulse"></div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo and Title */}
        <div className="text-center animate-fade-in-up">
          <div className="mx-auto h-24 w-24 casino-card flex items-center justify-center mb-6">
            <span className="text-3xl font-bold text-adaptive-text-accent font-casino-serif">B</span>
          </div>
          <h2 className="mt-6 text-4xl font-extrabold text-adaptive-text font-casino-serif">
            Bally's Casino
          </h2>
          <p className="mt-3 text-lg text-adaptive-text-accent font-casino-sans font-medium">
            Admin Dashboard
          </p>
          <p className="mt-1 text-sm text-adaptive-text-muted">
            Sri Lanka's Premier Gaming Experience
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6 animate-slide-in-right" onSubmit={handleSubmit}>
          <div className="casino-card p-8 space-y-6">
            <div className="casino-card-header">
              <h3 className="text-xl font-semibold text-center text-casino-gold font-casino-serif">
                Secure Access Portal
              </h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-casino-gold mb-2 font-casino-sans">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="casino-input w-full"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-casino-gold mb-2 font-casino-sans">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="casino-input w-full pr-12"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-casino-luxury-light hover:text-casino-gold transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-status-critical/20 border border-status-critical/40 rounded-lg p-4 animate-fade-in-up">
                <div className="text-sm text-status-critical font-medium">{error}</div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-casino-primary w-full text-lg py-4 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {loading ? (
                    <>
                      <div className="casino-spinner mr-3"></div>
                      <span className="font-casino-sans">Authenticating...</span>
                    </>
                  ) : (
                    <span className="font-casino-sans font-semibold">Enter Casino Dashboard</span>
                  )}
                </span>
                <div className="absolute inset-0 bg-gold-gradient opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </form>

        {/* Demo Credentials */}
        <div className="casino-card p-6 animate-fade-in-up">
          <div className="casino-card-header">
            <h4 className="text-sm font-semibold text-casino-gold text-center font-casino-sans">
              🎰 Demo Access Credentials
            </h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-casino-luxury-gray/30 rounded-lg">
              <div>
                <span className="text-xs text-casino-luxury-light font-medium">Super Admin:</span>
                <div className="text-sm text-white font-casino-mono">superadmin / admin123</div>
              </div>
              <div className="tier-badge tier-vip text-xs">
                Full Access
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-casino-luxury-gray/30 rounded-lg">
              <div>
                <span className="text-xs text-casino-luxury-light font-medium">Manager:</span>
                <div className="text-sm text-white font-casino-mono">manager / manager123</div>
              </div>
              <div className="tier-badge tier-sapphire text-xs">
                Limited Access
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-casino-luxury-light space-y-1 animate-fade-in-up">
          <p className="font-casino-sans">&copy; 2025 Bally's Casino Sri Lanka. All rights reserved.</p>
          <p className="text-casino-gold">Enterprise Admin Dashboard v1.0.0</p>
          <div className="flex items-center justify-center space-x-2 mt-3">
            <div className="w-2 h-2 bg-status-active rounded-full animate-pulse"></div>
            <span className="text-xs text-status-active font-medium">System Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;