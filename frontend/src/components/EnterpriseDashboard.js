import React, { useState, useEffect } from 'react';
import { 
  BellIcon, 
  ShieldCheckIcon, 
  DocumentTextIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  ServerIcon
} from '@heroicons/react/24/outline';
import apiService from '../services/apiService';
import { toast } from 'react-hot-toast';

const EnterpriseDashboard = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [realTimeEvents, setRealTimeEvents] = useState([]);
  const [systemIntegrations, setSystemIntegrations] = useState([]);
  const [complianceReports, setComplianceReports] = useState([]);
  const [userActivity, setUserActivity] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [
        notificationsRes,
        eventsRes,
        integrationsRes,
        reportsRes,
        activityRes
      ] = await Promise.all([
        apiService.get('/api/notifications?limit=5'),
        apiService.get('/api/analytics/real-time-events?limit=10'),
        apiService.get('/api/integrations'),
        apiService.get('/api/compliance/reports?limit=3'),
        apiService.get('/api/analytics/user-activity')
      ]);

      setNotifications(notificationsRes.notifications || []);
      setRealTimeEvents(eventsRes.events || []);
      setSystemIntegrations(integrationsRes || []);
      setComplianceReports(reportsRes.reports || []);
      setUserActivity(activityRes || {});
    } catch (error) {
      console.error('Failed to load enterprise dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const markNotificationRead = async (notificationId) => {
    try {
      await apiService.patch(`/api/notifications/${notificationId}/read`);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, status: 'read' } : n
      ));
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const syncIntegration = async (integrationId) => {
    try {
      await apiService.patch(`/api/integrations/${integrationId}/sync`);
      toast.success('Integration sync completed');
      loadDashboardData(); // Refresh data
    } catch (error) {
      toast.error('Failed to sync integration');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'normal': return 'text-blue-600 bg-blue-50';
      case 'low': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'error': return 'text-red-500';
      case 'warning': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'inactive': return 'text-gray-500';
      case 'error': return 'text-red-600';
      case 'testing': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Enterprise Dashboard</h1>
        <div className="flex space-x-2">
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <BellIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Notifications</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.filter(n => n.status !== 'read').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Critical Events</p>
              <p className="text-2xl font-bold text-gray-900">
                {realTimeEvents.filter(e => e.severity === 'critical').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ServerIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Integrations</p>
              <p className="text-2xl font-bold text-gray-900">
                {systemIntegrations.filter(i => i.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {userActivity.unique_users || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Notifications */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <BellIcon className="h-5 w-5 mr-2" />
              Recent Notifications
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No notifications</p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border ${
                      notification.status === 'read' ? 'bg-gray-50' : 'bg-white border-blue-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{notification.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{notification.content}</p>
                        <div className="flex items-center mt-2 space-x-2">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(notification.priority)}`}
                          >
                            {notification.priority}
                          </span>
                          <span className="text-xs text-gray-500">
                            {notification.category}
                          </span>
                        </div>
                      </div>
                      {notification.status !== 'read' && (
                        <button
                          onClick={() => markNotificationRead(notification.id)}
                          className="ml-4 text-blue-600 hover:text-blue-800"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Real-time Events */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2" />
              Real-time Events
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {realTimeEvents.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent events</p>
              ) : (
                realTimeEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-start space-x-3">
                    <div className={`mt-1 ${getSeverityColor(event.severity)}`}>
                      {event.severity === 'critical' ? (
                        <ExclamationTriangleIcon className="h-5 w-5" />
                      ) : (
                        <ClockIcon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{event.title}</p>
                      <p className="text-sm text-gray-600">{event.description}</p>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className="text-xs text-gray-500">{event.source}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                        {event.requires_action && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                            Action Required
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Integrations */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <ServerIcon className="h-5 w-5 mr-2" />
              System Integrations
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {systemIntegrations.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No integrations configured</p>
              ) : (
                systemIntegrations.map((integration) => (
                  <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{integration.name}</h4>
                      <p className="text-sm text-gray-600">{integration.provider}</p>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className={`text-sm ${getStatusColor(integration.status)}`}>
                          {integration.status}
                        </span>
                        {integration.last_sync && (
                          <span className="text-xs text-gray-500">
                            Last sync: {new Date(integration.last_sync).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => syncIntegration(integration.id)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Sync
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* User Activity Summary */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2" />
              User Activity Summary
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Activities</span>
                <span className="font-medium">{userActivity.total_activities || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Unique Users</span>
                <span className="font-medium">{userActivity.unique_users || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Session Duration</span>
                <span className="font-medium">
                  {userActivity.user_engagement?.avg_session_duration_minutes || 0} min
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pages per Session</span>
                <span className="font-medium">
                  {userActivity.user_engagement?.avg_pages_per_session || 0}
                </span>
              </div>
            </div>

            {/* Device Breakdown */}
            {userActivity.device_breakdown && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Device Breakdown</h4>
                <div className="space-y-2">
                  {Object.entries(userActivity.device_breakdown).map(([device, count]) => (
                    <div key={device} className="flex justify-between text-sm">
                      <span className="capitalize text-gray-600">{device}</span>
                      <span className="text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compliance Reports */}
      {complianceReports.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Recent Compliance Reports
            </h3>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Report Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Generated
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {complianceReports.map((report) => (
                    <tr key={report.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {report.report_type.replace('_', ' ').toUpperCase()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(report.report_period_start).toLocaleDateString()} - {new Date(report.report_period_end).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          report.compliance_score >= 90 ? 'bg-green-100 text-green-800' :
                          report.compliance_score >= 70 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {report.compliance_score}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {report.status}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(report.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnterpriseDashboard;