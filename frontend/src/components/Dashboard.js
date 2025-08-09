import React, { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  CurrencyDollarIcon, 
  ArrowTrendingUpIcon,
  PuzzlePieceIcon,
  ChartBarIcon,
  ClockIcon,
  SparklesIcon
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

  // Casino-themed chart data with luxury styling
  const casinoActivityData = {
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        label: 'Gaming Floor Activity',
        data: [8000, 12000, 15000, 18000, 22000, 25000, 30000],
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        tension: 0.4,
        fill: true,
        pointBorderColor: '#FFD700',
        pointBackgroundColor: '#1A1A1A',
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
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
          color: 'rgba(255, 215, 0, 0.1)',
        },
        ticks: {
          color: '#FFD700',
          font: {
            family: 'Inter',
            size: 12,
          },
          callback: function(value) {
            return value / 1000 + 'K';
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#4A4A4A',
          font: {
            family: 'Inter',
            size: 12,
          },
        },
      },
    },
  };

  const memberTierData = {
    labels: ['VIP', 'Diamond', 'Sapphire', 'Ruby'],
    datasets: [
      {
        data: [8, 15, 35, 42],
        backgroundColor: ['#FFD700', '#9E9E9E', '#1976D2', '#E53935'],
        borderWidth: 0,
        hoverBorderColor: '#FFD700',
        hoverBorderWidth: 3,
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
      title: 'Active Members',
      value: metrics?.total_members || '250',
      change: '+12%',
      icon: UsersIcon,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      gradient: 'bg-red-500',
      trend: 'positive'
    },
    {
      title: 'Gaming Sessions',
      value: metrics?.active_sessions || '125',
      change: '+8%',
      icon: PuzzlePieceIcon,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      gradient: 'bg-blue-500',
      trend: 'positive'
    },
    {
      title: 'Daily Revenue',
      value: `$${metrics?.daily_revenue?.toLocaleString() || '45,750'}`,
      change: '+15%',
      icon: CurrencyDollarIcon,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      gradient: 'bg-yellow-500',
      trend: 'positive'
    },
  ];

  const vipActivities = [
    {
      id: 1,
      member: 'Patricia Wong',
      tier: 'VIP',
      activity: 'High Stakes Table',
      amount: '+$12,500',
      time: '2 mins ago',
      icon: '💎',
      tierColor: 'bg-yellow-500 text-black'
    },
    {
      id: 2,
      member: 'James Rodriguez',
      tier: 'Diamond',
      activity: 'Slot Tournament',
      amount: '+$3,200',
      time: '8 mins ago',
      icon: '🏆',
      tierColor: 'bg-gray-400 text-white'
    },
    {
      id: 3,
      member: 'Chen Wei Lin',
      tier: 'Sapphire',
      activity: 'Blackjack Session',
      amount: '+$1,850',
      time: '15 mins ago',
      icon: '🃏',
      tierColor: 'bg-blue-500 text-white'
    },
    {
      id: 4,
      member: 'Sarah Johnson',
      tier: 'VIP',
      activity: 'Private Room',
      amount: '+$8,750',
      time: '23 mins ago',
      icon: '🎰',
      tierColor: 'bg-yellow-500 text-black'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-casino-luxury-black">
        <div className="inline-block w-12 h-12 border-2 border-casino-gold/20 border-t-casino-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 bg-adaptive-bg min-h-screen p-6 animate-fade-in-up">
      {/* Welcome Header with Casino Ambiance */}
      <div className="casino-card p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-adaptive-text-accent/5 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-adaptive-text font-casino-serif mb-3">
              Welcome back, <span className="text-adaptive-text-accent">{user?.full_name?.split(' ')[0] || 'Admin'}</span>
            </h1>
            <p className="text-lg text-adaptive-text-muted font-casino-sans">
              Your casino empire awaits. Monitor operations, track VIP members, and maximize revenue.
            </p>
            <div className="flex items-center mt-4 space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-status-active rounded-full animate-pulse"></div>
                <span className="text-sm text-status-active font-medium">All Systems Operational</span>
              </div>
              <div className="flex items-center space-x-2">
                <SparklesIcon className="w-4 h-4 text-adaptive-text-accent" />
                <span className="text-sm text-adaptive-text-accent font-medium">Peak Gaming Hours</span>
              </div>
            </div>
          </div>
          
          {/* Casino Ambiance Icons */}
          <div className="flex items-center space-x-6">
            <div className="text-6xl animate-pulse">🎰</div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-4 h-4 bg-adaptive-text-accent rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-adaptive-text-accent/60 rounded-full animate-pulse"></div>
            </div>
            <div className="text-5xl">💎</div>
          </div>
        </div>
      </div>

      {/* Casino Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metricCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="casino-card p-6 group">
              <div className="flex items-center justify-between mb-6">
                <div className={`p-4 rounded-xl ${card.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`h-8 w-8 ${card.color}`} />
                </div>
                <div className={`text-sm font-bold px-3 py-1 rounded-full ${card.trend === 'positive' ? 'bg-status-active/20 text-status-active' : 'bg-status-critical/20 text-status-critical'}`}>
                  {card.change}
                </div>
              </div>
              
              {/* Mini Casino Chart */}
              <div className="h-20 mb-6 bg-adaptive-surface/50 rounded-lg p-2">
                <div className="h-full flex items-end justify-between space-x-1">
                  {[4, 8, 6, 10, 12, 8, 14, 10, 16, 12, 18, 15].map((height, i) => (
                    <div
                      key={i}
                      className={`${card.gradient} rounded-sm flex-1 opacity-60 hover:opacity-100 transition-opacity`}
                      style={{ height: `${height * 3}px` }}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-sm text-adaptive-text-muted mb-2 font-casino-sans">{card.title}</p>
                <p className="text-3xl font-bold text-adaptive-text-accent mb-2">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gaming Floor Activity Chart */}
        <div className="lg:col-span-2 casino-card p-6">
          <div className="casino-card-header">
            <h3 className="text-xl font-bold text-adaptive-text-accent font-casino-serif">🎯 Gaming Floor Activity</h3>
            <p className="text-adaptive-text-muted text-sm mt-1">Live player engagement across the week</p>
          </div>
          <div className="h-80">
            <Line data={casinoActivityData} options={chartOptions} />
          </div>
        </div>

        {/* Member Tier Distribution */}
        <div className="casino-card p-6">
          <div className="casino-card-header">
            <h3 className="text-xl font-bold text-adaptive-text-accent font-casino-serif">👑 VIP Tiers</h3>
            <p className="text-adaptive-text-muted text-sm mt-1">Premium member distribution</p>
          </div>
          
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-40 h-40">
              <div className="w-full h-full">
                <Doughnut data={memberTierData} options={doughnutOptions} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-3xl font-bold text-adaptive-text-accent font-casino-mono">250</span>
                  <p className="text-xs text-adaptive-text-muted">Members</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            {[
              { tier: 'VIP', count: 8, percentage: 8, color: 'tier-vip' },
              { tier: 'Diamond', count: 15, percentage: 15, color: 'tier-diamond' },
              { tier: 'Sapphire', count: 35, percentage: 35, color: 'tier-sapphire' },
              { tier: 'Ruby', count: 42, percentage: 42, color: 'tier-ruby' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`tier-badge ${item.color} text-xs font-semibold px-3 py-1`}>
                    {item.tier}
                  </div>
                  <span className="text-sm text-adaptive-text-muted">{item.count} members</span>
                </div>
                <span className="text-sm text-adaptive-text-accent font-bold">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* VIP Member Activity Feed */}
        <div className="lg:col-span-2 bg-gray-800 border border-yellow-500/20 rounded-xl shadow-lg p-6">
          <div className="border-b border-yellow-500/10 pb-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-yellow-500 font-serif">🔥 Live High-Value Activity</h3>
                <p className="text-gray-300 text-sm mt-1">Real-time premium member transactions</p>
              </div>
              <button className="bg-transparent text-yellow-500 border border-yellow-500/20 px-4 py-2 rounded-lg text-sm hover:border-yellow-500/40 hover:bg-yellow-500/5 transition-all duration-300">
                View All
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {vipActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-700/20 rounded-lg hover:bg-yellow-500/5 transition-colors group">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl group-hover:scale-110 transition-transform">{activity.icon}</div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-white font-sans">{activity.member}</h4>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${activity.tierColor}`}>
                        {activity.tier}
                      </div>
                    </div>
                    <p className="text-sm text-gray-300">{activity.activity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-500 text-lg font-mono">{activity.amount}</p>
                  <p className="text-xs text-gray-300">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Casino Performance Summary */}
        <div className="bg-gray-800 border border-yellow-500/20 rounded-xl shadow-lg p-6">
          <div className="border-b border-yellow-500/10 pb-4 mb-6">
            <h3 className="text-xl font-bold text-yellow-500 font-serif">📈 Today's Performance</h3>
            <p className="text-gray-300 text-sm mt-1">Key gaming metrics</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Table Games Revenue</span>
                <span className="text-sm font-bold text-yellow-500">68%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div className="bg-red-500 h-3 rounded-full animate-pulse" style={{ width: '68%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Slot Machines</span>
                <span className="text-sm font-bold text-yellow-500">45%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div className="bg-blue-500 h-3 rounded-full animate-pulse" style={{ width: '45%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">VIP Room Activity</span>
                <span className="text-sm font-bold text-yellow-500">92%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div className="bg-yellow-500 h-3 rounded-full animate-pulse" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-3xl font-bold text-yellow-500 font-mono mb-2">$125,750</p>
            <p className="text-sm text-gray-300 mb-4">Total Revenue Today</p>
            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-red-500/30 transform hover:-translate-y-0.5 transition-all duration-300 w-full">
              🎰 View Detailed Analytics
            </button>
          </div>
        </div>
      </div>

      {/* VIP Experience Promotional Banner */}
      <div className="bg-gray-800 border border-yellow-500/20 rounded-xl shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 opacity-20"></div>
        <div className="relative z-10 flex items-center justify-between p-8">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-yellow-500 mb-3 font-serif">
              🌟 Exclusive VIP Experience Management
            </h3>
            <p className="text-gray-300 mb-6 text-lg font-sans">
              Elevate your premium members with personalized luxury services and exclusive gaming experiences
            </p>
            <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-red-500/30 transform hover:-translate-y-0.5 transition-all duration-300 text-lg">
              Manage VIP Services
            </button>
          </div>
          <div className="text-8xl opacity-80">👑</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;