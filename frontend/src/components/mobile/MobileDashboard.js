import React, { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  MapIcon,
  CpuChipIcon,
  BellIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import apiService from '../../services/apiService';
import { toast } from 'react-hot-toast';

const MobileDashboard = ({ user }) => {
  const [metrics, setMetrics] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Simulate API calls with mock data
      const mockMetrics = {
        totalRevenue: 8750000,
        revenueChange: 0.23,
        activeMembers: 2596,
        memberChange: 0.15,
        activeTables: 4,
        occupiedSlots: 3,
        totalAlerts: 4,
        efficiency: 0.87
      };

      const mockAlerts = [
        { id: 1, type: 'high-win', message: 'High-value win at Poker Table 1 - $2,500', time: '2 min ago', severity: 'info' },
        { id: 2, type: 'vip-activity', message: 'VIP member checked in at Diamond Lounge', time: '5 min ago', severity: 'info' },
        { id: 3, type: 'maintenance', message: 'Slot machine SL-005 requires attention', time: '12 min ago', severity: 'warning' },
        { id: 4, type: 'security', message: 'Security checkpoint alert cleared', time: '18 min ago', severity: 'success' }
      ];

      setMetrics(mockMetrics);
      setAlerts(mockAlerts);
      
      if (refreshing) {
        toast.success('Dashboard refreshed!', { icon: '🔄' });
      }
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-950"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-950 to-primary-800 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.full_name}</h1>
        <p className="text-primary-200 mb-4">Here's your casino overview for today</p>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 hover:bg-opacity-30"
        >
          <ArrowTrendingUpIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              metrics.revenueChange >= 0 ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'
            }`}>
              {metrics.revenueChange >= 0 ? '+' : ''}{formatPercentage(metrics.revenueChange)}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900">{formatCurrency(metrics.totalRevenue / 1000000)}M</h3>
          <p className="text-sm text-gray-600">Total Revenue</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <UserGroupIcon className="h-6 w-6 text-blue-600" />
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              metrics.memberChange >= 0 ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'
            }`}>
              {metrics.memberChange >= 0 ? '+' : ''}{formatPercentage(metrics.memberChange)}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900">{metrics.activeMembers.toLocaleString()}</h3>
          <p className="text-sm text-gray-600">Active Members</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <MapIcon className="h-6 w-6 text-purple-600" />
            <span className="text-xs font-medium px-2 py-1 rounded-full text-green-800 bg-green-100">
              Active
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900">{metrics.activeTables}</h3>
          <p className="text-sm text-gray-600">Gaming Tables</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <CpuChipIcon className="h-6 w-6 text-orange-600" />
            <span className="text-xs font-medium px-2 py-1 rounded-full text-blue-800 bg-blue-100">
              {formatPercentage(metrics.efficiency)}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900">{metrics.occupiedSlots}/12</h3>
          <p className="text-sm text-gray-600">Slot Machines</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/m/casino-floor"
            className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 hover:from-blue-100 hover:to-blue-200"
          >
            <MapIcon className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="font-medium text-gray-900 text-sm">Casino Floor</h3>
              <p className="text-xs text-gray-600">Live monitoring</p>
            </div>
          </Link>

          <Link
            to="/m/analytics"
            className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 hover:from-purple-100 hover:to-purple-200"
          >
            <ChartBarIcon className="h-6 w-6 text-purple-600" />
            <div>
              <h3 className="font-medium text-gray-900 text-sm">Analytics</h3>
              <p className="text-xs text-gray-600">Generate reports</p>
            </div>
          </Link>

          <Link
            to="/m/gaming"
            className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-green-100 border border-green-200 hover:from-green-100 hover:to-green-200"
          >
            <CpuChipIcon className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="font-medium text-gray-900 text-sm">Gaming</h3>
              <p className="text-xs text-gray-600">Manage games</p>
            </div>
          </Link>

          <Link
            to="/m/members"
            className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 hover:from-yellow-100 hover:to-yellow-200"
          >
            <UserGroupIcon className="h-6 w-6 text-yellow-600" />
            <div>
              <h3 className="font-medium text-gray-900 text-sm">Members</h3>
              <p className="text-xs text-gray-600">View profiles</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Alerts</h2>
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
            {metrics.totalAlerts}
          </span>
        </div>
        
        <div className="space-y-3">
          {alerts.slice(0, 4).map((alert) => (
            <div key={alert.id} className={`flex items-start space-x-3 p-3 rounded-lg border-l-4 ${
              alert.severity === 'warning' ? 'border-yellow-500 bg-yellow-50' :
              alert.severity === 'success' ? 'border-green-500 bg-green-50' :
              'border-blue-500 bg-blue-50'
            }`}>
              <div className="flex-shrink-0 mt-1">
                {alert.type === 'high-win' && <FireIcon className="h-4 w-4 text-orange-500" />}
                {alert.type === 'vip-activity' && <EyeIcon className="h-4 w-4 text-purple-500" />}
                {alert.type === 'maintenance' && <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />}
                {alert.type === 'security' && <BellIcon className="h-4 w-4 text-green-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                <p className="text-xs text-gray-500">{alert.time}</p>
              </div>
            </div>
          ))}
        </div>
        
        <button className="w-full mt-4 text-center text-sm font-medium text-primary-950 hover:text-primary-800">
          View all alerts →
        </button>
      </div>

      {/* Performance Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Today's Performance</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-900">Revenue Trend</span>
            </div>
            <p className="text-xs text-gray-600">Up 23% from last month</p>
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <ChartBarIcon className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">Efficiency</span>
            </div>
            <p className="text-xs text-gray-600">87% operational efficiency</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileDashboard;