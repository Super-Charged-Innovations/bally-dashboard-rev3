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
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, onToggle, user }) => {
  const navigationItems = [
    {
      name: 'Dashboard',
      icon: HomeIcon,
      href: '/dashboard',
      current: false,
    },
    {
      name: 'Members',
      icon: UsersIcon,
      href: '/members',
      current: false,
    },
    {
      name: 'Gaming',
      icon: PuzzlePieceIcon,
      href: '/gaming',
      current: false,
    },
    {
      name: 'Rewards',
      icon: GiftIcon,
      href: '/rewards',
      current: false,
    },
    {
      name: 'Marketing',
      icon: MegaphoneIcon,
      href: '/marketing',
      current: false,
    },
    {
      name: 'Travel & VIP',
      icon: CalendarDaysIcon,
      href: '/travel',
      current: false,
    },
    {
      name: 'Staff',
      icon: AcademicCapIcon,
      href: '/staff',
      current: false,
    },
    {
      name: 'Advanced Analytics',
      icon: ChartPieIcon,
      href: '/advanced-analytics',
      current: false,
    },
    {
      name: 'Reports',
      icon: ChartBarIcon,
      href: '/analytics',
      current: false,
    },
  ];

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