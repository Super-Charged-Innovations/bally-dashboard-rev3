import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  BellIcon,
  UserGroupIcon,
  PhoneIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ClockIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import apiService from '../services/apiService';

const SecurityMonitoring = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('alerts');
  const [securityData, setSecurityData] = useState({
    alerts: [],
    briefs: [],
    advisories: [],
    staff: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [newNotification, setNewNotification] = useState({
    type: 'alert',
    title: '',
    message: '',
    severity: 'medium',
    recipients: [],
    channels: ['push']
  });

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      const [alertsData, briefsData, advisoriesData, staffData] = await Promise.all([
        apiService.get('/api/security/alerts'),
        apiService.get('/api/security/briefs'),
        apiService.get('/api/security/advisories'),
        apiService.get('/api/security/staff')
      ]);
      
      setSecurityData({
        alerts: alertsData,
        briefs: briefsData,
        advisories: advisoriesData,
        staff: staffData
      });
    } catch (error) {
      console.error('Failed to load security data:', error);
      toast.error('Failed to load security data');
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async () => {
    try {
      setSending(true);
      
      // Demo progress simulation
      toast.loading('📡 Preparing security notification...', { duration: 1000 });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.loading('👥 Identifying security personnel...', { duration: 1200 });
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      toast.loading('🔔 Sending push notifications...', { duration: 1500 });
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.loading('📧 Dispatching email alerts...', { duration: 1000 });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await apiService.post('/api/security/notifications', newNotification);
      
      const recipientCount = newNotification.recipients.length || 12;
      const channelText = newNotification.channels.join(', ');
      
      toast.success(`🚨 Security ${newNotification.type} sent to ${recipientCount} personnel via ${channelText}!`, {
        duration: 5000,
        icon: '✅'
      });
      
      setShowCreateModal(false);
      setNewNotification({
        type: 'alert',
        title: '',
        message: '',
        severity: 'medium',
        recipients: [],
        channels: ['push']
      });
      loadSecurityData();
    } catch (error) {
      toast.error('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const getSeverityIcon = (severity) => {
    const iconClasses = "h-5 w-5";
    switch (severity) {
      case 'critical':
        return <ShieldExclamationIcon className={`${iconClasses} text-red-600`} />;
      case 'high':
        return <ExclamationTriangleIcon className={`${iconClasses} text-orange-600`} />;
      case 'medium':
        return <InformationCircleIcon className={`${iconClasses} text-yellow-600`} />;
      case 'low':
        return <InformationCircleIcon className={`${iconClasses} text-blue-600`} />;
      default:
        return <InformationCircleIcon className={`${iconClasses} text-gray-600`} />;
    }
  };

  const getSeverityBadge = (severity) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (severity) {
      case 'critical':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'high':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'medium':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'low':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'resolved':
        return <CheckCircleIcon className="h-4 w-4 text-blue-500" />;
      case 'investigating':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      default:
        return <XCircleIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredData = securityData[activeTab]?.filter(item => {
    const matchesSearch = !searchTerm || 
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = filterSeverity === 'all' || item.severity === filterSeverity;
    
    return matchesSearch && matchesSeverity;
  }) || [];

  const tabs = [
    { id: 'alerts', name: 'Security Alerts', count: securityData.alerts?.length || 0 },
    { id: 'briefs', name: 'Security Briefs', count: securityData.briefs?.length || 0 },
    { id: 'advisories', name: 'Advisories', count: securityData.advisories?.length || 0 },
    { id: 'staff', name: 'Security Staff', count: securityData.staff?.length || 0 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🛡️ Security Monitoring</h1>
          <p className="text-gray-600">Monitor security alerts, briefs, and communicate with security personnel</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <BellIcon className="h-5 w-5" />
            <span>Send Alert</span>
          </button>
          <button
            onClick={loadSecurityData}
            className="btn-secondary flex items-center space-x-2"
          >
            <ArrowPathIcon className="h-5 w-5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <ShieldExclamationIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Alerts</p>
              <p className="text-2xl font-bold text-gray-900">
                {securityData.alerts?.filter(a => a.status === 'active').length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-gray-900">
                {securityData.alerts?.filter(a => a.severity === 'critical' || a.severity === 'high').length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Briefs</p>
              <p className="text-2xl font-bold text-gray-900">
                {securityData.briefs?.filter(b => new Date(b.date).toDateString() === new Date().toDateString()).length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">On-Duty Staff</p>
              <p className="text-2xl font-bold text-gray-900">
                {securityData.staff?.filter(s => s.status === 'on_duty').length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search alerts, briefs, or advisories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
              <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100 text-gray-900">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="space-y-4">
        {activeTab === 'staff' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((staff) => (
              <div key={staff.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-primary-500 rounded-full flex items-center justify-center">
                      <UserGroupIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{staff.name}</h3>
                      <p className="text-sm text-gray-600">{staff.position}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    staff.status === 'on_duty' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {staff.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    {staff.phone}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                    {staff.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    Shift: {staff.shift}
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <button className="flex-1 btn-secondary text-sm py-2">
                      <PhoneIcon className="h-4 w-4 mr-1" />
                      Call
                    </button>
                    <button className="flex-1 btn-primary text-sm py-2">
                      <DevicePhoneMobileIcon className="h-4 w-4 mr-1" />
                      Alert
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredData.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="mr-4">
                      {getSeverityIcon(item.severity)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 mr-3">{item.title}</h3>
                        <span className={getSeverityBadge(item.severity)}>
                          {item.severity}
                        </span>
                        {item.status && (
                          <div className="flex items-center ml-3">
                            {getStatusIcon(item.status)}
                            <span className="ml-1 text-sm text-gray-600 capitalize">
                              {item.status.replace('_', ' ')}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-700 mb-3">{item.description}</p>
                      
                      {item.location && (
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Location:</strong> {item.location}
                        </p>
                      )}
                      
                      {item.recommendations && (
                        <div className="mb-3">
                          <strong className="text-sm text-gray-900">Recommendations:</strong>
                          <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                            {item.recommendations.map((rec, index) => (
                              <li key={index}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {new Date(item.timestamp || item.date).toLocaleString()}
                        {item.author && (
                          <>
                            <span className="mx-2">•</span>
                            <span>By {item.author}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    {activeTab === 'alerts' && (
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <BellIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <InformationCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No {activeTab} found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Create Notification Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">🚨 Send Security Notification</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                      value={newNotification.type}
                      onChange={(e) => setNewNotification({...newNotification, type: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="alert">Security Alert</option>
                      <option value="brief">Security Brief</option>
                      <option value="advisory">Advisory</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Severity</label>
                    <select
                      value={newNotification.severity}
                      onChange={(e) => setNewNotification({...newNotification, severity: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                    placeholder="e.g., Suspicious Activity Detected - Gaming Floor"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <textarea
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                    rows={4}
                    placeholder="Detailed description of the security situation..."
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notification Channels</label>
                  <div className="flex space-x-4">
                    {[
                      { id: 'push', label: 'Push Notification', icon: BellIcon },
                      { id: 'sms', label: 'SMS', icon: DevicePhoneMobileIcon },
                      { id: 'email', label: 'Email', icon: EnvelopeIcon }
                    ].map((channel) => (
                      <label key={channel.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newNotification.channels.includes(channel.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewNotification({
                                ...newNotification,
                                channels: [...newNotification.channels, channel.id]
                              });
                            } else {
                              setNewNotification({
                                ...newNotification,
                                channels: newNotification.channels.filter(c => c !== channel.id)
                              });
                            }
                          }}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <channel.icon className="ml-2 h-4 w-4 text-gray-600" />
                        <span className="ml-1 text-sm text-gray-700">{channel.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">📊 Notification Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Recipients:</span>
                      <span className="font-semibold text-blue-900 ml-1">
                        {securityData.staff?.filter(s => s.status === 'on_duty').length || 0} On-Duty Staff
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Channels:</span>
                      <span className="font-semibold text-blue-900 ml-1">
                        {newNotification.channels.length} selected
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    disabled={sending}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendNotification}
                    disabled={sending || !newNotification.title || !newNotification.message}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {sending ? (
                      <>
                        <div className="spinner w-4 h-4"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <BellIcon className="h-4 w-4" />
                        <span>Send Notification</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityMonitoring;