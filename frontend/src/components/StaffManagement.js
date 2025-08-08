import React, { useState, useEffect } from 'react';
import { 
  UsersIcon,
  AcademicCapIcon,
  ChartBarIcon,
  TrophyIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  BookOpenIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import apiService from '../services/apiService';
import { toast } from 'react-hot-toast';

const StaffManagement = ({ user }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [staffMembers, setStaffMembers] = useState([]);
  const [trainingCourses, setTrainingCourses] = useState([]);
  const [trainingRecords, setTrainingRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchStaffData();
  }, [activeTab]);

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'overview') {
        const data = await apiService.getStaffDashboard();
        setDashboardData(data);
      } else if (activeTab === 'staff') {
        const response = await apiService.getStaffMembers();
        setStaffMembers(response.staff_members);
      } else if (activeTab === 'training') {
        const courses = await apiService.getTrainingCourses();
        setTrainingCourses(courses);
        const records = await apiService.getTrainingRecords();
        setTrainingRecords(records.training_records);
      }
    } catch (error) {
      console.error('Failed to fetch staff data:', error);
      toast.error('Failed to load staff data');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'staff', name: 'Staff Directory', icon: UsersIcon },
    { id: 'training', name: 'Training & LMS', icon: AcademicCapIcon },
    { id: 'performance', name: 'Performance', icon: TrophyIcon },
  ];

  const getDepartmentColor = (department) => {
    switch (department) {
      case 'Gaming':
        return 'text-red-600 bg-red-50';
      case 'F&B':
        return 'text-green-600 bg-green-50';
      case 'Security':
        return 'text-blue-600 bg-blue-50';
      case 'Management':
        return 'text-purple-600 bg-purple-50';
      case 'Maintenance':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPerformanceColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrainingStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-800 bg-green-100';
      case 'in_progress':
        return 'text-blue-800 bg-blue-100';
      case 'enrolled':
        return 'text-yellow-800 bg-yellow-100';
      case 'failed':
        return 'text-red-800 bg-red-100';
      default:
        return 'text-gray-800 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600">Employee management, training, and performance tracking</p>
        </div>
        <div className="flex space-x-2">
          <button className="btn-secondary flex items-center space-x-2">
            <BookOpenIcon className="h-4 w-4" />
            <span>Add Training</span>
          </button>
          <button className="btn-primary flex items-center space-x-2">
            <UserPlusIcon className="h-4 w-4" />
            <span>Add Employee</span>
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
                    <div className="bg-blue-50 rounded-lg p-6">
                      <div className="flex items-center">
                        <UsersIcon className="h-8 w-8 text-blue-600 mr-3" />
                        <div>
                          <p className="text-sm text-blue-600 font-medium">Total Staff</p>
                          <p className="text-2xl font-bold text-blue-900">
                            {dashboardData.total_staff}
                          </p>
                          <p className="text-xs text-blue-600">Active employees</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-6">
                      <div className="flex items-center">
                        <AcademicCapIcon className="h-8 w-8 text-green-600 mr-3" />
                        <div>
                          <p className="text-sm text-green-600 font-medium">Training Rate</p>
                          <p className="text-2xl font-bold text-green-900">
                            {dashboardData.training_completion_rate}%
                          </p>
                          <p className="text-xs text-green-600">Overall completion</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-6">
                      <div className="flex items-center">
                        <TrophyIcon className="h-8 w-8 text-purple-600 mr-3" />
                        <div>
                          <p className="text-sm text-purple-600 font-medium">Performance</p>
                          <p className="text-2xl font-bold text-purple-900">
                            {dashboardData.average_performance_score}
                          </p>
                          <p className="text-xs text-purple-600">Average score</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 rounded-lg p-6">
                      <div className="flex items-center">
                        <ClockIcon className="h-8 w-8 text-yellow-600 mr-3" />
                        <div>
                          <p className="text-sm text-yellow-600 font-medium">Reviews Due</p>
                          <p className="text-2xl font-bold text-yellow-900">
                            {dashboardData.upcoming_reviews}
                          </p>
                          <p className="text-xs text-yellow-600">Next 30 days</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Department Distribution */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white border rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff by Department</h3>
                      <div className="space-y-4">
                        {Object.entries(dashboardData.staff_by_department || {}).map(([dept, count]) => (
                          <div key={dept} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDepartmentColor(dept)}`}>
                                {dept}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-bold text-gray-900">{count}</span>
                              <p className="text-xs text-gray-500">employees</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white border rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Statistics</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Courses:</span>
                          <span className="font-semibold">{dashboardData.training_stats?.total_courses}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Enrollments:</span>
                          <span className="font-semibold">{dashboardData.training_stats?.total_enrollments}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Completed This Month:</span>
                          <span className="font-semibold">{dashboardData.training_stats?.completed_this_month}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Recent Enrollments:</span>
                          <span className="font-semibold">{dashboardData.recent_training_enrollments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Staff Directory Tab */}
              {activeTab === 'staff' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Staff Directory</h3>
                    <div className="flex space-x-2">
                      <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                        <option value="">All Departments</option>
                        <option value="Gaming">Gaming</option>
                        <option value="F&B">F&B</option>
                        <option value="Security">Security</option>
                        <option value="Management">Management</option>
                        <option value="Maintenance">Maintenance</option>
                      </select>
                      <button className="btn-primary flex items-center space-x-2">
                        <UserPlusIcon className="h-4 w-4" />
                        <span>Add Employee</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {staffMembers.map((staff) => (
                      <div key={staff.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {staff.first_name} {staff.last_name}
                            </h4>
                            <p className="text-sm text-gray-600">{staff.position}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDepartmentColor(staff.department)}`}>
                            {staff.department}
                          </span>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Employee ID:</span>
                            <span className="font-medium">{staff.employee_id}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Hire Date:</span>
                            <span className="font-medium">{formatDate(staff.hire_date)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Performance:</span>
                            <span className={`font-bold ${getPerformanceColor(staff.performance_score)}`}>
                              {staff.performance_score}/100
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Training Rate:</span>
                            <span className="font-medium">{staff.training_completion_rate}%</span>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 mb-1">Skills:</p>
                          <div className="flex flex-wrap gap-1">
                            {staff.skills?.slice(0, 3).map((skill, idx) => (
                              <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {skill}
                              </span>
                            ))}
                            {staff.skills?.length > 3 && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                +{staff.skills.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button className="flex-1 text-sm bg-primary-950 text-white py-2 px-3 rounded-md hover:bg-primary-800 transition-colors">
                            View Details
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

              {/* Training & LMS Tab */}
              {activeTab === 'training' && (
                <div className="space-y-6">
                  {/* Training Courses */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Training Courses</h3>
                      <button className="btn-primary flex items-center space-x-2">
                        <PlusIcon className="h-4 w-4" />
                        <span>New Course</span>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {trainingCourses.map((course) => (
                        <div key={course.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900">{course.course_name}</h4>
                            <div className="flex items-center space-x-2">
                              {course.is_mandatory && (
                                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium">
                                  Mandatory
                                </span>
                              )}
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                                {course.category}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-gray-500">Duration</p>
                              <p className="font-semibold">{course.duration_hours}h</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Level</p>
                              <p className="font-semibold capitalize">{course.difficulty_level}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Passing Score</p>
                              <p className="font-semibold">{course.passing_score}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Positions</p>
                              <p className="font-semibold">{course.required_for_positions?.length || 0}</p>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button className="flex-1 text-sm bg-primary-950 text-white py-2 px-3 rounded-md hover:bg-primary-800 transition-colors">
                              Manage
                            </button>
                            <button className="text-sm bg-gray-100 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-200 transition-colors">
                              <EyeIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Training Records */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Training Activity</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolled</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {trainingRecords.slice(0, 10).map((record) => (
                            <tr key={record.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {record.staff_name || 'Unknown Staff'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {record.course_name || 'Unknown Course'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(record.enrollment_date)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {Math.round((record.time_spent_minutes || 0) / 60)}h spent
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {record.score ? `${record.score}%` : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTrainingStatusColor(record.status)}`}>
                                  {record.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Tab */}
              {activeTab === 'performance' && (
                <div className="text-center py-12">
                  <TrophyIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Management</h3>
                  <p className="text-gray-600">Advanced performance tracking and review management coming soon.</p>
                  <button className="mt-4 btn-primary">
                    Configure Performance System
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

export default StaffManagement;