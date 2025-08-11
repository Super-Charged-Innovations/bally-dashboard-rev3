import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  PuzzlePieceIcon,
  GiftIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  MagnifyingGlassIcon,
  MegaphoneIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
  ChartPieIcon,
  BuildingOfficeIcon,
  BellIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

// Permission checking utility
const hasPermission = (userPermissions, requiredPermission) => {
  if (!userPermissions) return false;
  if (userPermissions.includes("*")) return true;
  return userPermissions.includes(requiredPermission);
};

// Role-based access control for navigation items
const getFilteredNavigationItems = (user) => {
  if (!user) return [];
  
  const allNavigationItems = [
    {
      name: 'Dashboard',
      icon: HomeIcon,
      href: '/dashboard',
      current: false,
      requiredRole: null, // Available to all authenticated users
    },
    {
      name: 'Enterprise',
      icon: BuildingOfficeIcon,
      href: '/enterprise',
      current: false,
      requiredRole: 'SuperAdmin', // Only SuperAdmin
    },
    {
      name: 'Members',
      icon: UsersIcon,
      href: '/members',
      current: false,
      requiredPermissions: ['members:read'],
    },
    {
      name: 'Gaming',
      icon: PuzzlePieceIcon,
      href: '/gaming',
      current: false,
      requiredPermissions: ['gaming:read'],
    },
    {
      name: 'Rewards',
      icon: GiftIcon,
      href: '/rewards',
      current: false,
      requiredPermissions: ['members:read'], // Managers can manage rewards
    },
    {
      name: 'Marketing',
      icon: MegaphoneIcon,
      href: '/marketing',
      current: false,
      requiredRole: ['SuperAdmin', 'GeneralAdmin'], // Advanced feature
    },
    {
      name: 'Travel & VIP',
      icon: CalendarDaysIcon,
      href: '/travel',
      current: false,
      requiredRole: ['SuperAdmin', 'GeneralAdmin'], // Advanced feature
    },
    {
      name: 'Staff',
      icon: AcademicCapIcon,
      href: '/staff',
      current: false,
      requiredRole: ['SuperAdmin', 'GeneralAdmin'], // Only admins can manage staff
    },
    {
      name: 'Advanced Analytics',
      icon: ChartPieIcon,
      href: '/advanced-analytics',
      current: false,
      requiredRole: ['SuperAdmin', 'GeneralAdmin'], // Advanced feature
    },
    {
      name: 'Reports',
      icon: ChartBarIcon,
      href: '/analytics',
      current: false,
      requiredPermissions: ['reports:read'], // Managers can view reports
    },
    {
      name: 'Notifications',
      icon: BellIcon,
      href: '/notifications',
      current: false,
      requiredRole: ['SuperAdmin', 'GeneralAdmin', 'Manager'], // Not for supervisors
    },
    {
      name: 'Compliance',
      icon: ShieldCheckIcon,
      href: '/compliance',
      current: false,
      requiredRole: ['SuperAdmin', 'GeneralAdmin'], // Only admins
    },
    {
      name: 'Security',
      icon: ShieldExclamationIcon,
      href: '/security',
      current: false,
      requiredRole: ['SuperAdmin', 'GeneralAdmin'], // Security-focused access
    },
  ];

  return allNavigationItems.filter(item => {
    // Check role-based access
    if (item.requiredRole) {
      if (typeof item.requiredRole === 'string') {
        return user.role === item.requiredRole;
      } else if (Array.isArray(item.requiredRole)) {
        return item.requiredRole.includes(user.role);
      }
    }
    
    // Check permission-based access
    if (item.requiredPermissions) {
      return item.requiredPermissions.some(permission => 
        hasPermission(user.permissions, permission)
      );
    }
    
    // Default: available to all authenticated users
    return true;
  });
};

const Sidebar = ({ isOpen, onToggle, user }) => {
  // Get filtered navigation items based on user role and permissions
  const navigationItems = getFilteredNavigationItems(user);

  const bottomItems = [
    {
      name: 'Settings',
      icon: Cog6ToothIcon,
      href: '/settings',
    },
    {
      name: 'Search',
      icon: MagnifyingGlassIcon,
      href: '/search',
    },
    {
      name: 'Help',
      icon: QuestionMarkCircleIcon,
      href: '/help',
    },
  ];

  return (
    <div className={`bg-white shadow-lg h-full flex flex-col transition-all duration-300 ${
      isOpen ? 'w-64' : 'w-16'
    } sidebar`}>
      {/* Logo Section */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        {isOpen ? (
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full gradient-casino flex items-center justify-center">
              <span className="text-sm font-bold text-white">B</span>
            </div>
            <span className="text-lg font-bold text-gray-900">Bally's Admin</span>
          </div>
        ) : (
          <div className="h-8 w-8 rounded-full gradient-casino flex items-center justify-center">
            <span className="text-sm font-bold text-white">B</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-950 text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                } ${!isOpen ? 'justify-center' : ''}`
              }
              title={!isOpen ? item.name : ''}
            >
              <Icon className={`flex-shrink-0 h-5 w-5 ${isOpen ? 'mr-3' : ''}`} />
              {isOpen && item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info (when expanded) */}
      {isOpen && user && (
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {user.full_name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.full_name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.role}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="border-t border-gray-200 px-2 py-4 space-y-2">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              className={`group flex items-center w-full px-2 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 ${
                !isOpen ? 'justify-center' : ''
              }`}
              title={!isOpen ? item.name : ''}
            >
              <Icon className={`flex-shrink-0 h-5 w-5 ${isOpen ? 'mr-3' : ''}`} />
              {isOpen && item.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;