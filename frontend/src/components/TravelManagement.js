import React, { useState, useEffect } from 'react';
import { 
  CalendarDaysIcon,
  UserGroupIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  HeartIcon,
  TrophyIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import apiService from '../services/apiService';
import { toast } from 'react-hot-toast';

const TravelManagement = ({ user }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [vipExperiences, setVipExperiences] = useState([]);
  const [groupBookings, setGroupBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchTravelData();
  }, [activeTab]);

  const fetchTravelData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'overview') {
        const data = await apiService.getVIPTravelDashboard();
        setDashboardData(data);
      } else if (activeTab === 'vip') {
        const response = await apiService.getVIPExperiences();
        setVipExperiences(response.experiences);
      } else if (activeTab === 'groups') {
        const response = await apiService.getGroupBookings();
        setGroupBookings(response.bookings);
      }
    } catch (error) {
      console.error('Failed to fetch travel data:', error);
      toast.error('Failed to load travel data');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: TrophyIcon },
    { id: 'vip', name: 'VIP Experiences', icon: StarIcon },
    { id: 'groups', name: 'Group Bookings', icon: UserGroupIcon },
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-800 bg-green-100';
      case 'in_progress':
      case 'confirmed':
        return 'text-blue-800 bg-blue-100';
      case 'planned':
      case 'inquiry':
        return 'text-yellow-800 bg-yellow-100';
      case 'cancelled':
        return 'text-red-800 bg-red-100';
      default:
        return 'text-gray-800 bg-gray-100';
    }
  };

  const getExperienceTypeIcon = (type) => {
    switch (type) {
      case 'arrival':
        return '✈️';
      case 'gaming':
        return '🎲';
      case 'dining':
        return '🍽️';
      case 'entertainment':
        return '🎭';
      case 'departure':
        return '🚗';
      default:
        return '⭐';
    }
  };

  const getSatisfactionColor = (score) => {
    if (score >= 9) return 'text-green-600';
    if (score >= 7) return 'text-yellow-600';
    if (score >= 5) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Travel & VIP Management</h1>
          <p className="text-gray-600">Manage VIP experiences and group bookings for premium service delivery</p>
        </div>
        <div className="flex space-x-2">
          <button className="btn-secondary flex items-center space-x-2">
            <CalendarDaysIcon className="h-4 w-4" />
            <span>Schedule Experience</span>
          </button>
          <button className="btn-primary flex items-center space-x-2">
            <PlusIcon className="h-4 w-4" />
            <span>New Booking</span>
          </button>
        </div>
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
                    <div className="bg-purple-50 rounded-lg p-6">
                      <div className="flex items-center">
                        <StarIcon className="h-8 w-8 text-purple-600 mr-3" />
                        <div>
                          <p className="text-sm text-purple-600 font-medium">Upcoming VIP</p>
                          <p className="text-2xl font-bold text-purple-900">
                            {dashboardData.upcoming_vip_experiences || 0}
                          </p>
                          <p className="text-xs text-purple-600">Next 7 days</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-6">
                      <div className="flex items-center">
                        <UserGroupIcon className="h-8 w-8 text-blue-600 mr-3" />
                        <div>
                          <p className="text-sm text-blue-600 font-medium">Active Groups</p>
                          <p className="text-2xl font-bold text-blue-900">
                            {dashboardData.active_group_bookings || 0}
                          </p>
                          <p className="text-xs text-blue-600">In progress</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-6">
                      <div className="flex items-center">
                        <HeartIcon className="h-8 w-8 text-green-600 mr-3" />
                        <div>
                          <p className="text-sm text-green-600 font-medium">Satisfaction</p>
                          <p className="text-2xl font-bold text-green-900">
                            {dashboardData.avg_vip_satisfaction || '0.0'}/10
                          </p>
                          <p className="text-xs text-green-600">Average rating</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 rounded-lg p-6">
                      <div className="flex items-center">
                        <TrophyIcon className="h-8 w-8 text-yellow-600 mr-3" />
                        <div>
                          <p className="text-sm text-yellow-600 font-medium">Monthly Revenue</p>
                          <p className="text-2xl font-bold text-yellow-900">
                            {formatCurrency(dashboardData.vip_revenue_this_month || 0)}
                          </p>
                          <p className="text-xs text-yellow-600">VIP services</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Upcoming Arrivals */}
                  <div className="bg-white border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Upcoming VIP Arrivals</h3>
                      <button className="text-primary-950 text-sm font-medium">View All</button>
                    </div>
                    <div className="space-y-4">
                      {dashboardData.upcoming_arrivals?.slice(0, 5).map((arrival, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="text-2xl">
                              {getExperienceTypeIcon(arrival.experience_type)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {arrival.experience_type.charAt(0).toUpperCase() + arrival.experience_type.slice(1)} Experience
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatDate(arrival.scheduled_date)}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {arrival.services_included?.slice(0, 3).map((service, idx) => (
                                  <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {service}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button className="text-primary-950 text-sm font-medium">Prepare</button>
                            <button className="text-gray-600 text-sm">Details</button>
                          </div>
                        </div>
                      )) || <p className="text-gray-500 text-center py-8">No upcoming VIP arrivals</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* VIP Experiences Tab */}
              {activeTab === 'vip' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">VIP Experiences</h3>
                    <div className="flex space-x-2">
                      <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                        <option value="">All Statuses</option>
                        <option value="planned">Planned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                      <button className="btn-primary flex items-center space-x-2">
                        <PlusIcon className="h-4 w-4" />
                        <span>New Experience</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vipExperiences.map((experience) => (
                      <div key={experience.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">
                              {getExperienceTypeIcon(experience.experience_type)}
                            </span>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {experience.experience_type.charAt(0).toUpperCase() + experience.experience_type.slice(1)}
                              </h4>
                              {experience.member_name && (
                                <p className="text-sm text-gray-600">{experience.member_name}</p>
                              )}
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(experience.status)}`}>
                            {experience.status}
                          </span>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Scheduled:</span>
                            <span className="font-medium">{formatDate(experience.scheduled_date)}</span>
                          </div>
                          {experience.duration_minutes && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Duration:</span>
                              <span className="font-medium">{experience.duration_minutes} min</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Cost:</span>
                            <span className="font-medium">{formatCurrency(experience.cost)}</span>
                          </div>
                          {experience.satisfaction_score && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Satisfaction:</span>
                              <span className={`font-bold ${getSatisfactionColor(experience.satisfaction_score)}`}>
                                {experience.satisfaction_score}/10
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 mb-1">Services Included:</p>
                          <div className="flex flex-wrap gap-1">
                            {experience.services_included?.slice(0, 3).map((service, idx) => (
                              <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {service}
                              </span>
                            ))}
                            {experience.services_included?.length > 3 && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                +{experience.services_included.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button className="flex-1 text-sm bg-primary-950 text-white py-2 px-3 rounded-md hover:bg-primary-800 transition-colors">
                            Manage
                          </button>
                          <button className="text-sm bg-gray-100 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-200 transition-colors">
                            <EyeIcon className="h-4 w-4" />
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

              {/* Group Bookings Tab */}
              {activeTab === 'groups' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Group Bookings</h3>
                    <div className="flex space-x-2">
                      <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                        <option value="">All Types</option>
                        <option value="corporate">Corporate</option>
                        <option value="celebration">Celebration</option>
                        <option value="tournament">Tournament</option>
                        <option value="leisure">Leisure</option>
                      </select>
                      <button className="btn-primary flex items-center space-x-2">
                        <PlusIcon className="h-4 w-4" />
                        <span>New Booking</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Group</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {groupBookings.map((booking) => (
                          <tr key={booking.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{booking.group_name}</div>
                                <div className="text-sm text-gray-500">{booking.group_type}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm text-gray-900">{booking.contact_person}</div>
                                <div className="text-sm text-gray-500">{booking.contact_email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {booking.group_type}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {booking.group_size} people
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div>
                                <div>Arr: {formatDate(booking.arrival_date).split(',')[0]}</div>
                                <div>Dep: {formatDate(booking.departure_date).split(',')[0]}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(booking.actual_value || booking.total_estimated_value)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button className="text-primary-950 hover:text-primary-700">
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                                <button className="text-gray-600 hover:text-gray-900">
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button className="text-green-600 hover:text-green-900">
                                  <CheckCircleIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

export default TravelManagement;