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
        return 'text-red-600 bg-red-50';
      case 'GeneralAdmin':
        return 'text-blue-600 bg-blue-50';
      case 'Manager':
        return 'text-green-600 bg-green-50';
      case 'Supervisor':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-950 transition-colors"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Admin'}
          </h1>
          <p className="text-sm text-gray-500">
            We're very happy to see you on your personal dashboard
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* View Reports Button */}
        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
          View Reports
        </button>

        {/* Manage Store Button */}
        <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
          Manage Store
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-950 transition-colors">
          <BellIcon className="h-6 w-6" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={handleDropdownToggle}
            className="flex items-center space-x-3 p-2 text-gray-700 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-950 transition-colors"
          >
            <UserCircleIcon className="h-8 w-8 text-gray-400" />
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium">{user?.full_name}</p>
              <p className={`text-xs px-2 py-1 rounded-full font-medium ${getRoleColor(user?.role)}`}>
                {user?.role}
              </p>
            </div>
            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
                <span className={`inline-block mt-1 text-xs px-2 py-1 rounded-full font-medium ${getRoleColor(user?.role)}`}>
                  {user?.role}
                </span>
              </div>
              
              <div className="py-1">
                <button
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  <Cog6ToothIcon className="h-4 w-4 mr-3" />
                  Settings
                </button>
                
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onLogout();
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
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