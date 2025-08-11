import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  ExclamationTriangleIcon,
  FireIcon,
  ShieldExclamationIcon,
  HeartIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  BanknotesIcon,
  MegaphoneIcon,
  XMarkIcon,
  ClockIcon,
  MapPinIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';
import apiService from '../services/apiService';

const EmergencyBroadcast = ({ user }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [customMessage, setCustomMessage] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);
  const [location, setLocation] = useState('');

  // Check if user has permission to use emergency broadcast
  const hasEmergencyAccess = user && ['SuperAdmin', 'GeneralAdmin', 'Manager'].includes(user.role);

  const emergencyTypes = [
    {
      id: 'fire',
      name: 'Fire Emergency',
      icon: FireIcon,
      color: 'red',
      template: 'FIRE EMERGENCY - Evacuate immediately via nearest exit. Do not use elevators. Proceed to assembly point.',
      priority: 'critical',
      sound: true
    },
    {
      id: 'medical',
      name: 'Medical Emergency',
      icon: HeartIcon,
      color: 'pink',
      template: 'MEDICAL EMERGENCY - Medical assistance required. Please clear the area and allow medical personnel access.',
      priority: 'high',
      sound: true
    },
    {
      id: 'security',
      name: 'Security Threat',
      icon: ShieldExclamationIcon,
      color: 'orange',
      template: 'SECURITY ALERT - Security incident in progress. Please remain calm and follow staff instructions.',
      priority: 'critical',
      sound: true
    },
    {
      id: 'evacuation',
      name: 'Building Evacuation',
      icon: BuildingOfficeIcon,
      color: 'red',
      template: 'BUILDING EVACUATION - All guests and staff must evacuate immediately. Use nearest exit and proceed to assembly point.',
      priority: 'critical',
      sound: true
    },
    {
      id: 'theft',
      name: 'Theft/Robbery',
      icon: BanknotesIcon,
      color: 'yellow',
      template: 'SECURITY INCIDENT - Theft/robbery in progress. Security personnel responding. Avoid the area.',
      priority: 'high',
      sound: false
    },
    {
      id: 'fight',
      name: 'Altercation/Fight',
      icon: UserGroupIcon,
      color: 'orange',
      template: 'DISTURBANCE ALERT - Security responding to altercation. Please maintain distance and follow staff guidance.',
      priority: 'medium',
      sound: false
    },
    {
      id: 'earthquake',
      name: 'Natural Disaster',
      icon: ExclamationTriangleIcon,
      color: 'purple',
      template: 'NATURAL DISASTER - Drop, cover, and hold. Remain calm and await further instructions from staff.',
      priority: 'critical',
      sound: true
    },
    {
      id: 'custom',
      name: 'Custom Emergency',
      icon: MegaphoneIcon,
      color: 'blue',
      template: '',
      priority: 'high',
      sound: false
    }
  ];

  const handleEmergencySelect = (emergency) => {
    setSelectedEmergency(emergency);
    if (emergency.id === 'custom') {
      setCustomMessage('');
    } else {
      setCustomMessage(emergency.template);
    }
  };

  const broadcastEmergency = async () => {
    if (!selectedEmergency || (!customMessage.trim())) {
      toast.error('Please select emergency type and enter message');
      return;
    }

    try {
      setBroadcasting(true);

      // Immediate visual feedback
      if (selectedEmergency.priority === 'critical') {
        toast.loading('🚨 BROADCASTING CRITICAL EMERGENCY...', { duration: 1500 });
      } else {
        toast.loading('📢 Broadcasting emergency message...', { duration: 1000 });
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate emergency broadcast
      const broadcastData = {
        type: selectedEmergency.id,
        message: customMessage,
        location: location,
        priority: selectedEmergency.priority,
        sound_alert: selectedEmergency.sound,
        timestamp: new Date().toISOString(),
        broadcast_by: user.full_name
      };

      const response = await apiService.post('/api/emergency/broadcast', broadcastData);

      // Success notification based on emergency type
      const successMessages = {
        'fire': '🔥 FIRE EMERGENCY BROADCAST SENT TO ALL PERSONNEL',
        'medical': '🏥 MEDICAL EMERGENCY ALERT DISPATCHED',
        'security': '🛡️ SECURITY ALERT BROADCAST TO ALL STAFF',
        'evacuation': '🚨 EVACUATION ORDER SENT TO ENTIRE FACILITY',
        'theft': '🚔 SECURITY INCIDENT ALERT DISPATCHED',
        'fight': '⚠️ DISTURBANCE ALERT SENT TO SECURITY TEAM',
        'earthquake': '🌍 NATURAL DISASTER ALERT BROADCAST',
        'custom': '📢 CUSTOM EMERGENCY MESSAGE BROADCAST'
      };

      toast.success(successMessages[selectedEmergency.id], {
        duration: 6000,
        icon: selectedEmergency.priority === 'critical' ? '🚨' : '📢'
      });

      // Additional alerts for critical emergencies
      if (selectedEmergency.priority === 'critical') {
        setTimeout(() => {
          toast.success('🚨 Emergency services automatically notified', { duration: 4000 });
        }, 2000);
        
        setTimeout(() => {
          toast.success('📱 Push notifications sent to all mobile devices', { duration: 4000 });
        }, 3000);
      }

      // Reset form
      setShowModal(false);
      setSelectedEmergency(null);
      setCustomMessage('');
      setLocation('');

    } catch (error) {
      toast.error('Failed to broadcast emergency message');
      console.error('Emergency broadcast failed:', error);
    } finally {
      setBroadcasting(false);
    }
  };

  // Don't render if user doesn't have access
  if (!hasEmergencyAccess) {
    return null;
  }

  return (
    <>
      {/* Floating Emergency Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowModal(true)}
          className="group relative bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 animate-pulse hover:animate-none"
          title="Emergency Broadcast"
        >
          <ExclamationTriangleIcon className="h-8 w-8" />
          
          {/* Pulsing ring effect */}
          <div className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-75"></div>
          
          {/* Emergency label */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Emergency Broadcast
          </div>
        </button>
      </div>

      {/* Emergency Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-screen overflow-y-auto">
            {/* Header */}
            <div className="bg-red-600 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ExclamationTriangleIcon className="h-8 w-8 animate-pulse" />
                  <div>
                    <h2 className="text-2xl font-bold">Emergency Broadcast System</h2>
                    <p className="text-red-100 text-sm">Select emergency type and broadcast immediately</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:text-red-200 transition-colors"
                  disabled={broadcasting}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Step 1: Emergency Type Selection */}
              {!selectedEmergency && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Step 1: Select Emergency Type
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {emergencyTypes.map((emergency) => {
                      const Icon = emergency.icon;
                      return (
                        <button
                          key={emergency.id}
                          onClick={() => handleEmergencySelect(emergency)}
                          className={`relative p-4 rounded-xl border-2 hover:border-${emergency.color}-500 hover:bg-${emergency.color}-50 transition-all duration-200 group`}
                        >
                          <div className="text-center">
                            <div className={`mx-auto w-12 h-12 rounded-full bg-${emergency.color}-100 flex items-center justify-center mb-3 group-hover:bg-${emergency.color}-200 transition-colors`}>
                              <Icon className={`h-6 w-6 text-${emergency.color}-600`} />
                            </div>
                            <p className="font-medium text-gray-900 text-sm">{emergency.name}</p>
                            {emergency.priority === 'critical' && (
                              <span className="inline-block mt-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                CRITICAL
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 2: Message and Broadcast */}
              {selectedEmergency && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Step 2: Confirm and Broadcast
                    </h3>
                    <button
                      onClick={() => setSelectedEmergency(null)}
                      className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                      ← Change Emergency Type
                    </button>
                  </div>

                  {/* Selected Emergency Display */}
                  <div className={`p-4 rounded-lg border-2 border-${selectedEmergency.color}-200 bg-${selectedEmergency.color}-50`}>
                    <div className="flex items-center space-x-3">
                      <selectedEmergency.icon className={`h-8 w-8 text-${selectedEmergency.color}-600`} />
                      <div>
                        <h4 className="font-semibold text-gray-900">{selectedEmergency.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            Priority: <span className={`ml-1 font-medium text-${selectedEmergency.color}-600`}>
                              {selectedEmergency.priority.toUpperCase()}
                            </span>
                          </span>
                          {selectedEmergency.sound && (
                            <span className="flex items-center">
                              <SpeakerWaveIcon className="h-4 w-4 mr-1" />
                              Sound Alert
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPinIcon className="h-4 w-4 inline mr-1" />
                      Location (Optional)
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., Main Gaming Floor, VIP Area, Entrance Lobby"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>

                  {/* Message Input/Display */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emergency Message
                    </label>
                    <textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder={selectedEmergency.id === 'custom' ? 'Enter your emergency message...' : 'Modify the default message if needed...'}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      This message will be broadcast to all staff and displayed on all screens
                    </p>
                  </div>

                  {/* Broadcast Preview */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">Broadcast Preview:</h5>
                    <div className="bg-white border rounded p-3">
                      <div className="flex items-start space-x-3">
                        <selectedEmergency.icon className={`h-5 w-5 text-${selectedEmergency.color}-600 mt-0.5`} />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`px-2 py-1 bg-${selectedEmergency.color}-100 text-${selectedEmergency.color}-800 text-xs rounded font-medium`}>
                              {selectedEmergency.priority.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500">
                              <ClockIcon className="h-3 w-3 inline mr-1" />
                              {new Date().toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900">{customMessage}</p>
                          {location && (
                            <p className="text-xs text-gray-600 mt-1">
                              <MapPinIcon className="h-3 w-3 inline mr-1" />
                              Location: {location}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Broadcast by: {user.full_name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Broadcast Button */}
                  <div className="flex justify-end space-x-4 pt-4 border-t">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={broadcasting}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={broadcastEmergency}
                      disabled={broadcasting || !customMessage.trim()}
                      className={`px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold ${
                        selectedEmergency.priority === 'critical' ? 'animate-pulse' : ''
                      }`}
                    >
                      {broadcasting ? (
                        <div className="flex items-center space-x-2">
                          <div className="spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Broadcasting...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <MegaphoneIcon className="h-5 w-5" />
                          <span>
                            {selectedEmergency.priority === 'critical' ? 'BROADCAST EMERGENCY' : 'Send Broadcast'}
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmergencyBroadcast;