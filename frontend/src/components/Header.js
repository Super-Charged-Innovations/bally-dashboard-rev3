import React, { useState } from 'react';
import { 
  Bars3Icon, 
  BellIcon, 
  UserCircleIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const Header = ({ user, onLogout, onMenuToggle }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationCount] = useState(3); // Mock notification count

  const handleDropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'SuperAdmin':
        return 'tier-ruby text-white';
      case 'GeneralAdmin':
        return 'tier-sapphire text-white';
      case 'Manager':
        return 'tier-diamond text-white';
      case 'Supervisor':
        return 'bg-status-warning/20 text-status-warning border border-status-warning/30';
      default:
        return 'bg-casino-luxury-gray text-casino-luxury-light';
    }
  };

  const getRoleDisplay = (role) => {
    switch (role) {
      case 'SuperAdmin':
        return '👑 Super Admin';
      case 'GeneralAdmin':
        return '💎 General Admin';
      case 'Manager':
        return '🎰 Manager';
      case 'Supervisor':
        return '🛡️ Supervisor';
      default:
        return role;
    }
  };

  return (
    <header className="bg-luxury-gradient border-b border-casino-gold/20 px-6 py-4 flex items-center justify-between shadow-luxury">
      {/* Left Section */}
      <div className="flex items-center space-x-6">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg text-casino-luxury-light hover:text-casino-gold hover:bg-casino-gold/10 focus:outline-none focus:ring-2 focus:ring-casino-gold focus:ring-opacity-50 transition-all duration-200"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        
        <div className="animate-fade-in-up">
          <h1 className="text-2xl font-bold text-white font-casino-serif">
            Welcome back, <span className="text-casino-gold">{user?.full_name?.split(' ')[0] || 'Admin'}</span>
          </h1>
          <p className="text-sm text-casino-luxury-light font-casino-sans">
            Manage your casino operations with confidence
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* Quick Action Buttons */}
        <button className="btn-casino-ghost px-4 py-2 text-sm">
          📊 View Reports
        </button>

        <button className="btn-casino-secondary px-4 py-2 text-sm">
          🎰 Casino Floor
        </button>

        {/* Notifications */}
        <div className="relative">
          <button className="relative p-3 text-casino-luxury-light hover:text-casino-gold hover:bg-casino-gold/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-casino-gold focus:ring-opacity-50 transition-all duration-200">
            <BellIcon className="h-6 w-6" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-status-critical text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                {notificationCount}
              </span>
            )}
          </button>
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={handleDropdownToggle}
            className="flex items-center space-x-3 p-3 text-casino-luxury-light hover:bg-casino-gold/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-casino-gold focus:ring-opacity-50 transition-all duration-200 group"
          >
            <UserCircleIcon className="h-8 w-8 text-casino-gold group-hover:text-white transition-colors" />
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-white font-casino-sans">{user?.full_name}</p>
              <div className={`text-xs px-2 py-1 rounded-full font-medium tier-badge ${getRoleColor(user?.role)} mt-1`}>
                {getRoleDisplay(user?.role)}
              </div>
            </div>
            <ChevronDownIcon className={`h-4 w-4 text-casino-luxury-light transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 casino-card border border-casino-gold/30 focus:outline-none z-50 animate-slide-in-right">
              <div className="px-4 py-3 casino-card-header">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-casino-gradient flex items-center justify-center">
                    <span className="text-lg font-bold text-white font-casino-serif">
                      {user?.full_name?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white font-casino-sans">{user?.full_name}</p>
                    <p className="text-xs text-casino-luxury-light">{user?.email || `${user?.username}@ballyscasino.lk`}</p>
                    <div className={`inline-flex items-center text-xs px-2 py-1 rounded-full font-medium tier-badge ${getRoleColor(user?.role)} mt-1`}>
                      {getRoleDisplay(user?.role)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="py-2">
                <button
                  className="flex items-center w-full px-4 py-3 text-sm text-casino-luxury-light hover:bg-casino-gold/10 hover:text-casino-gold transition-all duration-200 group"
                  onClick={() => setDropdownOpen(false)}
                >
                  <Cog6ToothIcon className="h-4 w-4 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                  Account Settings
                </button>
                
                <div className="border-t border-casino-gold/10 my-2"></div>
                
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onLogout();
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm text-status-critical hover:bg-status-critical/10 transition-all duration-200 group"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3 group-hover:translate-x-1 transition-transform duration-200" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay for dropdown */}
      {dropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setDropdownOpen(false)}
        ></div>
      )}
    </header>
  );
};

export default Header;