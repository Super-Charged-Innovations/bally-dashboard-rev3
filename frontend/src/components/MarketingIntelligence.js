import React, { useState, useEffect } from 'react';
import { 
  CalendarDaysIcon,
  UserGroupIcon,
  CakeIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  PlusIcon,
  MegaphoneIcon,
  ChartBarIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import apiService from '../services/apiService';
import { toast } from 'react-hot-toast';

const MarketingIntelligence = ({ user }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [birthdayMembers, setBirthdayMembers] = useState([]);
  const [inactiveMembers, setInactiveMembers] = useState([]);
  const [walkInGuests, setWalkInGuests] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchMarketingData();
  }, [activeTab]);

  const fetchMarketingData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'overview') {
        const data = await apiService.getMarketingDashboard();
        setDashboardData(data);
      } else if (activeTab === 'birthdays') {
        const response = await apiService.getBirthdayCalendar();
        setBirthdayMembers(response.birthdays);
      } else if (activeTab === 'inactive') {
        const response = await apiService.getInactiveCustomers(30);
        setInactiveMembers(response.inactive_members);
      } else if (activeTab === 'walkins') {
        const response = await apiService.getWalkInGuests();
        setWalkInGuests(response.guests);
      } else if (activeTab === 'campaigns') {
        const response = await apiService.getMarketingCampaigns();
        setCampaigns(response.campaigns);
      }
    } catch (error) {
      console.error('Failed to fetch marketing data:', error);
      toast.error('Failed to load marketing data');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'birthdays', name: 'Birthday Calendar', icon: CakeIcon },
    { id: 'inactive', name: 'Inactive Customers', icon: ExclamationTriangleIcon },
    { id: 'walkins', name: 'Walk-in Guests', icon: UserGroupIcon },
    { id: 'campaigns', name: 'Campaigns', icon: MegaphoneIcon },
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Ruby':
        return 'text-red-600 bg-red-50';
      case 'Sapphire':
        return 'text-blue-600 bg-blue-50';
      case 'Diamond':
        return 'text-gray-600 bg-gray-50';
      case 'VIP':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getCampaignStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-800 bg-green-100';
      case 'completed':
        return 'text-blue-800 bg-blue-100';
      case 'draft':
        return 'text-gray-800 bg-gray-100';
      case 'paused':
        return 'text-yellow-800 bg-yellow-100';
      default:
        return 'text-gray-800 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing Intelligence</h1>
          <p className="text-gray-600">Customer analytics, campaigns, and engagement insights</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <PlusIcon className="h-4 w-4" />
          <span>Create Campaign</span>
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
              {/* Overview Tab */}
              {activeTab === 'overview' && dashboardData && (
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <div className="flex items-center">
                        <CakeIcon className="h-8 w-8 text-blue-600 mr-3" />
                        <div>
                          <p className="text-sm text-blue-600 font-medium">Birthday Members</p>
                          <p className="text-2xl font-bold text-blue-900">
                            {dashboardData.birthday_members?.length || 0}
                          </p>
                          <p className="text-xs text-blue-600">This month</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 rounded-lg p-6">
                      <div className="flex items-center">
                        <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600 mr-3" />
                        <div>
                          <p className="text-sm text-yellow-600 font-medium">Inactive Members</p>
                          <p className="text-2xl font-bold text-yellow-900">
                            {dashboardData.inactive_members?.length || 0}
                          </p>
                          <p className="text-xs text-yellow-600">Need attention</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-6">
                      <div className="flex items-center">
                        <UserGroupIcon className="h-8 w-8 text-green-600 mr-3" />
                        <div>
                          <p className="text-sm text-green-600 font-medium">Walk-ins Today</p>
                          <p className="text-2xl font-bold text-green-900">
                            {dashboardData.walk_in_today || 0}
                          </p>
                          <p className="text-xs text-green-600">
                            {dashboardData.walk_in_conversion_rate?.toFixed(1)}% conversion
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-6">
                      <div className="flex items-center">
                        <MegaphoneIcon className="h-8 w-8 text-purple-600 mr-3" />
                        <div>
                          <p className="text-sm text-purple-600 font-medium">Active Campaigns</p>
                          <p className="text-2xl font-bold text-purple-900">
                            {dashboardData.active_campaigns || 0}
                          </p>
                          <p className="text-xs text-purple-600">Running now</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Birthday Members */}
                    <div className="bg-white border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Upcoming Birthdays</h3>
                        <button className="text-primary-950 text-sm font-medium">View All</button>
                      </div>
                      <div className="space-y-3">
                        {dashboardData.birthday_members?.slice(0, 5).map((member) => (
                          <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{member.member_name}</p>
                              <div className="flex items-center space-x-2">
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getTierColor(member.tier)}`}>
                                  {member.tier}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {formatDate(member.birthday_date)}
                                </span>
                              </div>
                            </div>
                            <button className="text-primary-950 text-sm font-medium">Send Offer</button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Customer Segments */}
                    <div className="bg-white border rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Segments</h3>
                      <div className="space-y-4">
                        {Object.entries(dashboardData.customer_segments || {}).map(([tier, count]) => (
                          <div key={tier} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTierColor(tier)}`}>
                                {tier}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-bold text-gray-900">{count}</span>
                              <p className="text-xs text-gray-500">members</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Birthday Calendar Tab */}
              {activeTab === 'birthdays' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Birthday Calendar</h3>
                    <button className="btn-secondary">Export List</button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {birthdayMembers.map((member) => (
                      <div key={member.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900">{member.member_name}</h4>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTierColor(member.tier)}`}>
                            {member.tier}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p><strong>Birthday:</strong> {formatDate(member.birthday_date)}</p>
                          <p><strong>Preferred:</strong> {member.preferred_celebration_type}</p>
                          <p><strong>Last Spend:</strong> ${member.last_birthday_spend?.toFixed(2) || '0.00'}</p>
                        </div>
                        <div className="mt-4 flex space-x-2">
                          <button className="flex-1 text-sm bg-primary-950 text-white py-2 px-3 rounded-md hover:bg-primary-800 transition-colors">
                            Send Invite
                          </button>
                          <button className="text-sm bg-gray-100 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-200 transition-colors">
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inactive Customers Tab */}
              {activeTab === 'inactive' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Inactive Customers (30+ Days)</h3>
                    <button className="btn-secondary">Create Campaign</button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tier</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Visit</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Score</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Spend</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {inactiveMembers.map((member) => (
                          <tr key={member.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {member.first_name} {member.last_name}
                                </div>
                                <div className="text-sm text-gray-500">{member.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTierColor(member.tier)}`}>
                                {member.tier}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {member.last_visit ? formatDate(member.last_visit) : 'Never'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className={`h-2 w-16 rounded-full ${
                                  member.risk_score > 0.7 ? 'bg-red-200' :
                                  member.risk_score > 0.4 ? 'bg-yellow-200' : 'bg-green-200'
                                }`}>
                                  <div 
                                    className={`h-2 rounded-full ${
                                      member.risk_score > 0.7 ? 'bg-red-600' :
                                      member.risk_score > 0.4 ? 'bg-yellow-600' : 'bg-green-600'
                                    }`}
                                    style={{ width: `${(member.risk_score || 0) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="ml-2 text-sm text-gray-600">
                                  {((member.risk_score || 0) * 100).toFixed(0)}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${member.avg_spend?.toFixed(2) || '0.00'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-primary-950 hover:text-primary-700 mr-3">
                                Contact
                              </button>
                              <button className="text-gray-600 hover:text-gray-900">
                                <PencilIcon className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Walk-in Guests Tab */}
              {activeTab === 'walkins' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Walk-in Guests</h3>
                    <div className="flex space-x-2">
                      <button className="btn-secondary">Export Data</button>
                      <button className="btn-primary">Add Guest</button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {walkInGuests.map((guest) => (
                      <div key={guest.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900">
                            {guest.first_name} {guest.last_name}
                          </h4>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            guest.converted_to_member 
                              ? 'text-green-800 bg-green-100' 
                              : 'text-gray-800 bg-gray-100'
                          }`}>
                            {guest.converted_to_member ? 'Converted' : 'Guest'}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p><strong>Visit:</strong> {formatDate(guest.visit_date)}</p>
                          <p><strong>Spend:</strong> ${guest.spend_amount?.toFixed(2) || '0.00'}</p>
                          <p><strong>Games:</strong> {guest.games_played?.join(', ') || 'None'}</p>
                          {guest.follow_up_required && (
                            <p className="text-yellow-600"><strong>⚠️ Follow-up required</strong></p>
                          )}
                        </div>
                        <div className="mt-4 flex space-x-2">
                          {!guest.converted_to_member && (
                            <button className="flex-1 text-sm bg-primary-950 text-white py-2 px-3 rounded-md hover:bg-primary-800 transition-colors">
                              Convert
                            </button>
                          )}
                          <button className="text-sm bg-gray-100 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-200 transition-colors">
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Campaigns Tab */}
              {activeTab === 'campaigns' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Marketing Campaigns</h3>
                    <button className="btn-primary flex items-center space-x-2">
                      <PlusIcon className="h-4 w-4" />
                      <span>New Campaign</span>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {campaigns.map((campaign) => (
                      <div key={campaign.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{campaign.name}</h4>
                            <p className="text-sm text-gray-600">{campaign.campaign_type}</p>
                          </div>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getCampaignStatusColor(campaign.status)}`}>
                            {campaign.status}
                          </span>
                        </div>
                        
                        <p className="text-gray-700 text-sm mb-4">{campaign.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-500">Budget</p>
                            <p className="font-semibold">${campaign.budget?.toFixed(2) || '0.00'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Reach</p>
                            <p className="font-semibold">{campaign.actual_reach || 0} / {campaign.estimated_reach}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Conversion</p>
                            <p className="font-semibold">{campaign.conversion_rate?.toFixed(1) || '0.0'}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Duration</p>
                            <p className="font-semibold text-xs">
                              {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button className="flex-1 text-sm bg-primary-950 text-white py-2 px-3 rounded-md hover:bg-primary-800 transition-colors">
                            View Details
                          </button>
                          <button className="text-sm bg-gray-100 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-200 transition-colors">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketingIntelligence;