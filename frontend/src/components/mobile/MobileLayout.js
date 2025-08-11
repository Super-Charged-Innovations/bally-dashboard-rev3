import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  CpuChipIcon,
  ChartBarIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  MapIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  MagnifyingGlassIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

const MobileLayout = ({ children, user }) => {
  const [showSidebar, setShowSidebar] = useState(false);
  const location = useLocation();

  const bottomNavItems = [
    { path: '/m/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { path: '/m/casino-floor', icon: MapIcon, label: 'Floor' },
    { path: '/m/gaming', icon: CpuChipIcon, label: 'Gaming' },
    { path: '/m/analytics', icon: ChartBarIcon, label: 'Analytics' },
    { path: '/m/members', icon: UserGroupIcon, label: 'Members' }
  ];

  const sidebarItems = [
    { path: '/m/dashboard', icon: HomeIcon, label: 'Dashboard', category: 'Overview' },
    { path: '/m/casino-floor', icon: MapIcon, label: 'Casino Floor', category: 'Operations' },
    { path: '/m/gaming', icon: CpuChipIcon, label: 'Gaming Management', category: 'Operations' },
    { path: '/m/members', icon: UserGroupIcon, label: 'Member Management', category: 'Management' },
    { path: '/m/rewards', icon: ChartBarIcon, label: 'Rewards', category: 'Management' },
    { path: '/m/staff', icon: UserCircleIcon, label: 'Staff Management', category: 'Management' },
    { path: '/m/analytics', icon: ChartBarIcon, label: 'Advanced Analytics', category: 'Analytics' },
    { path: '/m/settings', icon: Cog6ToothIcon, label: 'Settings', category: 'System' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 mobile-layout">
      {/* Mobile Header */}
      <header className="bg-primary-950 text-white p-4 fixed top-0 left-0 right-0 z-40 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowSidebar(true)}
              className="p-2 rounded-lg hover:bg-primary-800"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-lg font-bold">Bally's Casino</h1>
              <p className="text-xs text-primary-200">Mobile Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-lg hover:bg-primary-800">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-lg hover:bg-primary-800">
              <BellIcon className="h-5 w-5" />
            </button>
            <div className="w-8 h-8 bg-primary-700 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium">{user?.username?.charAt(0).toUpperCase()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setShowSidebar(false)}>
          <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 bg-primary-950 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Navigation</h2>
                  <p className="text-sm text-primary-200">Welcome, {user?.full_name}</p>
                </div>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="p-2 rounded-lg hover:bg-primary-800"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setShowSidebar(false)}
                      className={`flex items-center space-x-3 p-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive(item.path)
                          ? 'bg-primary-950 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pt-20 pb-20 px-4 min-h-screen">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="grid grid-cols-5 h-16">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center space-y-1 ${
                  active ? 'text-primary-950' : 'text-gray-400'
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-primary-950' : 'text-gray-400'}`} />
                <span className={`text-xs font-medium ${active ? 'text-primary-950' : 'text-gray-400'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default MobileLayout;