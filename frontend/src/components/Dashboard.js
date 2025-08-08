import React, { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  CurrencyDollarIcon, 
  ArrowTrendingUpIcon,
  PuzzlePieceIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import apiService from '../services/apiService';
import { toast } from 'react-hot-toast';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = ({ user }) => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [realTimeData, setRealTimeData] = useState({
    activeUsers: 1250,
    todayRevenue: 45750,
    weeklyGrowth: 12.5
  });

  useEffect(() => {
    fetchDashboardMetrics();
    
    // Set up real-time updates
    const interval = setInterval(fetchDashboardMetrics, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardMetrics = async () => {
    try {
      const data = await apiService.getDashboardMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Mock data for charts (in real implementation, this would come from API)
  const weeklyUsersData = {
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        label: 'Active Users',
        data: [8000, 12000, 15000, 18000, 22000, 25000, 30000],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value) {
            return value / 1000 + 'K';
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const tierDistributionData = {
    labels: ['Individual Orders', 'Tourist Crowd'],
    datasets: [
      {
        data: [38, 12],
        backgroundColor: ['#3B82F6', '#F59E0B'],
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  const metricCards = [
    {
      title: 'Total Members',
      value: metrics?.total_members || '1001',
      change: '+12%',
      icon: UsersIcon,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      chart: 'purchases'
    },
    {
      title: 'Active Sessions',
      value: metrics?.active_sessions || '1005',
      change: '+8%',
      icon: PuzzlePieceIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      chart: 'sales'
    },
    {
      title: 'Daily Revenue',
      value: `$${metrics?.daily_revenue?.toFixed(0) || '101'}`,
      change: '+15%',
      icon: CurrencyDollarIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      chart: 'returns'
    },
  ];

  const recentActivities = [
    {
      id: 1,
      title: 'Birdsight',
      subtitle: 'Site Complete',
      value: '+$290',
      items: 'items1',
      icon: '🏢',
      color: 'text-green-600'
    },
    {
      id: 2,
      title: 'Flower Shop',
      subtitle: 'Bouquet',
      value: '+$72',
      items: 'items21',
      icon: '🌸',
      color: 'text-green-600'
    },
    {
      id: 3,
      title: 'Book Shop',
      subtitle: 'Collection',
      value: '+$35',
      items: 'items7',
      icon: '📚',
      color: 'text-green-600'
    },
    {
      id: 4,
      title: 'Illustration',
      subtitle: 'Window Theme',
      value: '+$196',
      items: 'items54',
      icon: '🎨',
      color: 'text-green-600'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header with Illustration */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Welcome back, {user?.full_name?.split(' ')[0] || 'Pixy Krovasky'}
            </h1>
            <p className="text-gray-600">
              We're very happy to see you on your personal dashboard
            </p>
          </div>
          
          {/* Illustration */}
          <div className="flex items-center space-x-4">
            <div className="text-6xl">👨‍💼</div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            </div>
            <div className="text-4xl">☕</div>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metricCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm metric-card">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
                <span className="text-sm text-green-600 font-medium">{card.change}</span>
              </div>
              
              {/* Mini Chart */}
              <div className="h-16 mb-4">
                {index === 0 && (
                  <div className="h-full flex items-end justify-between space-x-1">
                    {[4, 8, 6, 10, 12, 8, 14, 10, 16, 12, 18, 15].map((height, i) => (
                      <div
                        key={i}
                        className="bg-pink-200 rounded-sm flex-1"
                        style={{ height: `${height * 3}px` }}
                      />
                    ))}
                  </div>
                )}
                {index === 1 && (
                  <div className="h-full flex items-end justify-between space-x-1">
                    {[6, 10, 8, 14, 16, 12, 18, 14, 20, 16, 22, 18].map((height, i) => (
                      <div
                        key={i}
                        className="bg-purple-200 rounded-sm flex-1"
                        style={{ height: `${height * 3}px` }}
                      />
                    ))}
                  </div>
                )}
                {index === 2 && (
                  <div className="h-full flex items-end justify-between space-x-1">
                    {[8, 12, 10, 16, 18, 14, 20, 16, 22, 18, 24, 20].map((height, i) => (
                      <div
                        key={i}
                        className="bg-blue-200 rounded-sm flex-1"
                        style={{ height: `${height * 3}px` }}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm chart-container">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Users in the last 6 hours</h3>
          <div className="h-80">
            <Line data={weeklyUsersData} options={chartOptions} />
          </div>
        </div>

        {/* Followers Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Followers</h3>
          <p className="text-gray-600 mb-4">
            We're very happy to see you again on your personal dashboard.
          </p>
          <button className="text-orange-500 font-medium text-sm mb-6">Learn More</button>
          
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-32 h-32">
              <div className="w-full h-full">
                <Doughnut data={tierDistributionData} options={doughnutOptions} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">86%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Active Projects</h3>
            <button className="text-blue-600 text-sm font-medium">View All</button>
          </div>
          
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg activity-item">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{activity.icon}</div>
                  <div>
                    <h4 className="font-medium text-gray-900">{activity.title}</h4>
                    <p className="text-sm text-gray-500">{activity.subtitle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${activity.color}`}>{activity.value}</p>
                  <p className="text-sm text-gray-500">{activity.items}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Profits */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Monthly Profits</h3>
          <p className="text-sm text-gray-600 mb-6">Total Profit Growth of 25%</p>
          
          <div className="space-y-4 mb-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Individual Orders</span>
                <span className="text-sm font-medium">38%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '38%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Tourist Crowd</span>
                <span className="text-sm font-medium">12%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '12%' }}></div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 mb-1">$1200</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
        </div>
      </div>

      {/* Promotional Banner */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">Buy Uko & Get 15% Off</h3>
            <p className="text-pink-100 mb-4">Well Designed Theme to make everything better</p>
            <button className="bg-white text-purple-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Buy Now
            </button>
          </div>
          <div className="text-6xl opacity-80">🎁</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;