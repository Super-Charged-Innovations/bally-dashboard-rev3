import React, { useState, useEffect } from 'react';
import { 
  PlayIcon,
  PauseIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UsersIcon,
  PlusIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import apiService from '../services/apiService';
import { toast } from 'react-hot-toast';

const GamingManagement = ({ user }) => {
  const [sessions, setSessions] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sessions');

  useEffect(() => {
    fetchGamingData();
  }, [activeTab]);

  const fetchGamingData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'sessions') {
        const response = await apiService.getGamingSessions({ limit: 50 });
        setSessions(response.sessions);
      } else if (activeTab === 'packages') {
        const packagesData = await apiService.getGamingPackages();
        setPackages(packagesData);
      }
    } catch (error) {
      console.error('Failed to fetch gaming data:', error);
      toast.error('Failed to load gaming data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDuration = (startTime, endTime) => {
    if (!endTime) return 'Active';
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = (end - start) / (1000 * 60); // minutes
    return `${Math.round(duration)} min`;
  };

  const getGameTypeColor = (gameType) => {
    const colors = {
      'Blackjack': 'bg-red-100 text-red-800',
      'Roulette': 'bg-green-100 text-green-800',
      'Poker': 'bg-blue-100 text-blue-800',
      'Baccarat': 'bg-purple-100 text-purple-800',
      'Slots': 'bg-yellow-100 text-yellow-800',
    };
    return colors[gameType] || 'bg-gray-100 text-gray-800';
  };

  const tabs = [
    { id: 'sessions', name: 'Gaming Sessions', icon: PlayIcon },
    { id: 'packages', name: 'Gaming Packages', icon: CurrencyDollarIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gaming Management</h1>
          <p className="text-gray-600">Monitor gaming sessions and manage packages</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <PlusIcon className="h-4 w-4" />
          <span>Create Package</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-primary-950 text-primary-950'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="spinner w-8 h-8"></div>
            </div>
          ) : (
            <>
              {/* Gaming Sessions Tab */}
              {activeTab === 'sessions' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <PlayIcon className="h-6 w-6 text-blue-600 mr-2" />
                        <div>
                          <p className="text-sm text-blue-600 font-medium">Active Sessions</p>
                          <p className="text-2xl font-bold text-blue-900">
                            {sessions.filter(s => s.status === 'active').length}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <CurrencyDollarIcon className="h-6 w-6 text-green-600 mr-2" />
                        <div>
                          <p className="text-sm text-green-600 font-medium">Total Buy-ins</p>
                          <p className="text-2xl font-bold text-green-900">
                            {formatCurrency(sessions.reduce((sum, s) => sum + (s.buy_in_amount || 0), 0))}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <ClockIcon className="h-6 w-6 text-yellow-600 mr-2" />
                        <div>
                          <p className="text-sm text-yellow-600 font-medium">Avg Duration</p>
                          <p className="text-2xl font-bold text-yellow-900">2.5h</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <UsersIcon className="h-6 w-6 text-purple-600 mr-2" />
                        <div>
                          <p className="text-sm text-purple-600 font-medium">Unique Players</p>
                          <p className="text-2xl font-bold text-purple-900">
                            {new Set(sessions.map(s => s.member_id)).size}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sessions Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Player
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Game
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Table/Machine
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Buy-in
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Duration
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Net Result
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sessions.map((session) => (
                          <tr key={session.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {session.member_name || 'Unknown Player'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getGameTypeColor(session.game_type)}`}>
                                {session.game_type}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {session.table_number || session.machine_number || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(session.buy_in_amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDuration(session.session_start, session.session_end)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {session.net_result !== null ? (
                                <span className={session.net_result >= 0 ? 'text-green-600' : 'text-red-600'}>
                                  {formatCurrency(session.net_result)}
                                </span>
                              ) : (
                                <span className="text-gray-500">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                session.status === 'active' 
                                  ? 'text-green-800 bg-green-100' 
                                  : 'text-gray-800 bg-gray-100'
                              }`}>
                                {session.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Gaming Packages Tab */}
              {activeTab === 'packages' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {packages.map((pkg) => (
                    <div key={pkg.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          pkg.is_active ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'
                        }`}>
                          {pkg.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4">{pkg.description}</p>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Price:</span>
                          <span className="font-semibold text-primary-950">{formatCurrency(pkg.price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Credits:</span>
                          <span className="font-semibold text-green-600">{formatCurrency(pkg.credits)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Validity:</span>
                          <span className="font-semibold">{pkg.validity_hours}h</span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Tier Access:</p>
                        <div className="flex flex-wrap gap-1">
                          {pkg.tier_access.map((tier) => (
                            <span
                              key={tier}
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                tier === 'Ruby' ? 'text-red-600 bg-red-50' :
                                tier === 'Sapphire' ? 'text-blue-600 bg-blue-50' :
                                tier === 'Diamond' ? 'text-gray-600 bg-gray-50' :
                                'text-yellow-600 bg-yellow-50'
                              }`}
                            >
                              {tier}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="flex-1 text-sm bg-primary-950 text-white py-2 px-3 rounded-md hover:bg-primary-800 transition-colors">
                          Edit
                        </button>
                        <button className="flex-1 text-sm bg-gray-100 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-200 transition-colors">
                          View Stats
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <div className="text-center py-12">
                  <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Gaming Analytics</h3>
                  <p className="text-gray-600">Advanced gaming analytics and reporting will be available here.</p>
                  <button className="mt-4 btn-primary">
                    Configure Analytics
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GamingManagement;