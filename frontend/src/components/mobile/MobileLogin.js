import React, { useState, useEffect } from 'react';
import {
  DevicePhoneMobileIcon,
  EyeIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const MobileLogin = ({ onLogin }) => {
  const [authMethod, setAuthMethod] = useState('demo');
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      // Check if Web Authentication API is supported
      if (!window.PublicKeyCredential) {
        console.log('WebAuthn not supported');
        return;
      }

      // Check if biometrics are available
      const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setBiometricSupported(true);
      setBiometricAvailable(available);
      
      if (available) {
        toast.success('Biometric authentication available!', { icon: '🔐' });
      }
    } catch (error) {
      console.log('Biometric check failed:', error);
      setBiometricSupported(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      setAuthenticating(true);
      
      // Simulate biometric authentication process
      toast.loading('🔐 Authenticating with biometrics...', { duration: 2000 });
      
      // In a real implementation, you would use WebAuthn API
      // For demo purposes, we'll simulate the process
      
      const publicKeyCredentialRequestOptions = {
        challenge: new Uint8Array(32),
        allowCredentials: [{
          id: new Uint8Array(32),
          type: 'public-key',
          transports: ['internal']
        }],
        userVerification: 'required',
        timeout: 60000
      };

      // Simulate biometric authentication
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful authentication
      const mockUser = {
        id: 'mobile-user-biometric',
        username: 'mobile_admin',
        full_name: 'Mobile Administrator',
        role: 'SuperAdmin',
        auth_method: 'biometric',
        permissions: ['*', 'casino_floor_access', 'view_full_player_data']
      };

      toast.success('✅ Biometric authentication successful!', { 
        duration: 3000,
        icon: '🎉'
      });
      
      onLogin(mockUser);
      
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      toast.error('❌ Biometric authentication failed. Please try again.');
    } finally {
      setAuthenticating(false);
    }
  };

  const handleDemoLogin = async (role) => {
    try {
      setAuthenticating(true);
      
      toast.loading('🚀 Logging in with demo credentials...', { duration: 1500 });
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockUser = role === 'SuperAdmin' ? {
        id: 'mobile-superadmin-id',
        username: 'mobile_superadmin',
        full_name: 'Mobile Super Administrator',
        role: 'SuperAdmin',
        auth_method: 'demo',
        permissions: ['*', 'casino_floor_access', 'view_full_player_data']
      } : {
        id: 'mobile-manager-id',
        username: 'mobile_manager',
        full_name: 'Mobile Casino Manager',
        role: 'GeneralAdmin',
        auth_method: 'demo',
        permissions: ['members:read', 'members:write', 'gaming:read', 'gaming:write', 'reports:read', 'casino_floor_access']
      };
      
      toast.success(`✅ Logged in as ${role}!`, { 
        duration: 2000,
        icon: '👋'
      });
      
      onLogin(mockUser);
      
    } catch (error) {
      toast.error('Failed to login');
    } finally {
      setAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 p-2">
            <img 
              src="/ballys-logo.svg" 
              alt="Bally's Casino"
              className="h-full w-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Mobile Dashboard</h1>
          <p className="text-primary-200">Sri Lanka's Premier Gaming Experience</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Secure Login</h2>

          {/* Biometric Login Section */}
          {biometricSupported && biometricAvailable && (
            <div className="mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200 mb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Biometric Authentication</h3>
                    <p className="text-sm text-gray-600">Most secure method available</p>
                  </div>
                </div>
                <button
                  onClick={handleBiometricLogin}
                  disabled={authenticating}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {authenticating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <UserIcon className="h-5 w-5" />
                      <span>Login with Biometrics</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with demo</span>
                </div>
              </div>
            </div>
          )}

          {/* Demo Login Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => handleDemoLogin('SuperAdmin')}
              disabled={authenticating}
              className="w-full bg-primary-950 text-white py-3 px-4 rounded-xl font-medium hover:bg-primary-800 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <DevicePhoneMobileIcon className="h-5 w-5" />
              <span>Demo: Super Administrator</span>
            </button>

            <button
              onClick={() => handleDemoLogin('GeneralAdmin')}
              disabled={authenticating}
              className="w-full bg-gray-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-700 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <EyeIcon className="h-5 w-5" />
              <span>Demo: Casino Manager</span>
            </button>
          </div>

          {/* Security Notice */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Demo Environment</h4>
                <p className="text-xs text-yellow-700">This is a demonstration version. In production, all authentication methods would connect to secure backend systems.</p>
              </div>
            </div>
          </div>

          {/* Biometric Support Status */}
          {!biometricAvailable && biometricSupported && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <CheckCircleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800">Biometric Setup</h4>
                  <p className="text-xs text-blue-700">Your device supports biometrics. Set up fingerprint or face recognition in your device settings to enable secure login.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-primary-200 text-sm">© 2025 Bally's Casino. Secure mobile access.</p>
        </div>
      </div>
    </div>
  );
};

export default MobileLogin;