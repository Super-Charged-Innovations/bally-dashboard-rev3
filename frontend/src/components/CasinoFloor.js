import React, { useState, useEffect } from 'react';
import {
  MapIcon,
  TableCellsIcon,
  CpuChipIcon,
  PlayIcon,
  PauseIcon,
  ExclamationTriangleIcon,
  BellIcon,
  EyeIcon,
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  FireIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const CasinoFloor = ({ user }) => {
  const [activeView, setActiveView] = useState('overview');
  const [tables, setTables] = useState([]);
  const [slotMachines, setSlotMachines] = useState([]);
  const [playerActivities, setPlayerActivities] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Check if user has permission to see full names
  const canSeeFullNames = user?.role === 'superadmin' || user?.permissions?.includes('view_full_player_data');

  // Mask player name based on permissions
  const maskPlayerName = (fullName, memberId) => {
    if (canSeeFullNames) {
      return fullName || `Member ${memberId}`;
    }
    return `Member ${memberId}`;
  };

  // Generate mock real-time data
  const generateMockData = () => {
    // Mock Tables Data
    const mockTables = [
      {
        id: 'BJ-01',
        name: 'Blackjack Table 1',
        type: 'Blackjack',
        status: 'active',
        dealer: 'Sarah Chen',
        minBet: 25,
        maxBet: 2500,
        players: [
          { position: 1, memberId: 'M001', fullName: 'John Martinez', sessionTime: 45, currentBet: 150, totalWagered: 2250, netResult: -450 },
          { position: 3, memberId: 'M067', fullName: 'Lisa Wong', sessionTime: 72, currentBet: 300, totalWagered: 4800, netResult: 1200 },
          { position: 5, memberId: 'M134', fullName: 'Robert Taylor', sessionTime: 28, currentBet: 100, totalWagered: 1400, netResult: -200 }
        ],
        totalHands: 156,
        avgHandTime: '2.3 min'
      },
      {
        id: 'BJ-02',
        name: 'Blackjack Table 2',
        type: 'Blackjack',
        status: 'active',
        dealer: 'Mike Johnson',
        minBet: 50,
        maxBet: 5000,
        players: [
          { position: 2, memberId: 'V089', fullName: 'David Kim', sessionTime: 180, currentBet: 500, totalWagered: 15000, netResult: 3200 },
          { position: 4, memberId: 'M203', fullName: 'Emma Davis', sessionTime: 95, currentBet: 250, totalWagered: 6750, netResult: -850 }
        ],
        totalHands: 89,
        avgHandTime: '3.1 min'
      },
      {
        id: 'RT-01',
        name: 'Roulette Table 1',
        type: 'Roulette',
        status: 'active',
        dealer: 'Anna Rodriguez',
        minBet: 10,
        maxBet: 1000,
        players: [
          { position: 1, memberId: 'M045', fullName: 'Carlos Silva', sessionTime: 125, currentBet: 85, totalWagered: 3400, netResult: -680 },
          { position: 2, memberId: 'V012', fullName: 'Jennifer Park', sessionTime: 67, currentBet: 150, totalWagered: 2850, netResult: 420 },
          { position: 3, memberId: 'M156', fullName: 'Michael Brown', sessionTime: 34, currentBet: 50, totalWagered: 850, netResult: 125 }
        ],
        totalSpins: 42,
        avgSpinTime: '3.8 min'
      },
      {
        id: 'PK-01',
        name: 'Texas Hold\'em Table 1',
        type: 'Poker',
        status: 'active',
        dealer: 'Tom Wilson',
        minBet: 100,
        maxBet: 10000,
        players: [
          { position: 1, memberId: 'V034', fullName: 'Alex Thompson', sessionTime: 240, currentBet: 800, totalWagered: 12000, netResult: 2800 },
          { position: 3, memberId: 'M178', fullName: 'Sophie Liu', sessionTime: 186, currentBet: 400, totalWagered: 8500, netResult: -1200 },
          { position: 6, memberId: 'V067', fullName: 'James Anderson', sessionTime: 298, currentBet: 1200, totalWagered: 25000, netResult: 4500 }
        ],
        totalHands: 67,
        avgHandTime: '4.2 min'
      },
      {
        id: 'BC-01',
        name: 'Baccarat Table 1',
        type: 'Baccarat',
        status: 'vacant',
        dealer: 'Linda Zhang',
        minBet: 500,
        maxBet: 50000,
        players: [],
        totalHands: 0,
        avgHandTime: '0 min'
      }
    ];

    // Mock Slot Machines Data
    const mockSlots = [
      {
        id: 'SL-001',
        name: 'Fortune Wheel Deluxe',
        type: 'Video Slots',
        status: 'occupied',
        memberId: 'M089',
        fullName: 'Patricia Garcia',
        sessionTime: 78,
        creditsUsed: 450,
        creditsRemaining: 1250,
        totalWins: 680,
        netResult: 230,
        lastWin: '5 min ago',
        denomination: '$1.00',
        progressive: 125420
      },
      {
        id: 'SL-002',
        name: 'Diamond Dreams',
        type: 'Video Slots',
        status: 'occupied',
        memberId: 'V023',
        fullName: 'Richard Moore',
        sessionTime: 145,
        creditsUsed: 850,
        creditsRemaining: 3200,
        totalWins: 1240,
        netResult: 390,
        lastWin: '12 min ago',
        denomination: '$2.00',
        progressive: 89750
      },
      {
        id: 'SL-003',
        name: 'Lucky Sevens Classic',
        type: 'Classic Slots',
        status: 'available',
        memberId: null,
        fullName: null,
        sessionTime: 0,
        creditsUsed: 0,
        creditsRemaining: 0,
        totalWins: 0,
        netResult: 0,
        lastWin: 'N/A',
        denomination: '$0.25',
        progressive: 0
      },
      {
        id: 'SL-004',
        name: 'Mega Jackpot Mania',
        type: 'Progressive Slots',
        status: 'occupied',
        memberId: 'M234',
        fullName: 'Nancy Williams',
        sessionTime: 203,
        creditsUsed: 1250,
        creditsRemaining: 750,
        totalWins: 580,
        netResult: -670,
        lastWin: '28 min ago',
        denomination: '$5.00',
        progressive: 245800
      },
      {
        id: 'SL-005',
        name: 'Ocean Adventure',
        type: 'Video Slots',
        status: 'maintenance',
        memberId: null,
        fullName: null,
        sessionTime: 0,
        creditsUsed: 0,
        creditsRemaining: 0,
        totalWins: 0,
        netResult: 0,
        lastWin: 'N/A',
        denomination: '$1.50',
        progressive: 0
      }
    ];

    // Mock Player Activities
    const mockActivities = [
      { memberId: 'V067', fullName: 'James Anderson', location: 'PK-01', activity: 'Big Win', amount: 2500, time: '2 min ago', type: 'win' },
      { memberId: 'M067', fullName: 'Lisa Wong', location: 'BJ-01', activity: 'Hot Streak', amount: 800, time: '5 min ago', type: 'streak' },
      { memberId: 'V089', fullName: 'David Kim', location: 'BJ-02', activity: 'Extended Session', amount: null, time: '7 min ago', type: 'session' },
      { memberId: 'V023', fullName: 'Richard Moore', location: 'SL-002', activity: 'Progressive Hit', amount: 1240, time: '12 min ago', type: 'progressive' },
      { memberId: 'M234', fullName: 'Nancy Williams', location: 'SL-004', activity: 'Cold Streak', amount: -500, time: '15 min ago', type: 'loss' }
    ];

    // Mock Alerts
    const mockAlerts = [
      { id: 1, type: 'high-win', message: 'High-value win detected at PK-01 - $2,500', time: '2 min ago', severity: 'info' },
      { id: 2, type: 'extended-session', message: 'Extended session alert: Player at BJ-02 (3+ hours)', time: '7 min ago', severity: 'warning' },
      { id: 3, type: 'machine-maintenance', message: 'Slot machine SL-005 requires maintenance', time: '15 min ago', severity: 'error' },
      { id: 4, type: 'vip-activity', message: 'VIP player activity at Baccarat section', time: '18 min ago', severity: 'info' }
    ];

    setTables(mockTables);
    setSlotMachines(mockSlots);
    setPlayerActivities(mockActivities);
    setAlerts(mockAlerts);
    setLastUpdate(new Date());
  };

  // Auto-refresh effect
  useEffect(() => {
    generateMockData();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        generateMockData();
        toast.success('Casino floor data updated', { duration: 2000 });
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'occupied': return 'text-green-600 bg-green-100';
      case 'vacant': return 'text-yellow-600 bg-yellow-100';
      case 'available': return 'text-blue-600 bg-blue-100';
      case 'maintenance': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'win': return <FireIcon className="h-4 w-4 text-green-500" />;
      case 'streak': return <ChartBarIcon className="h-4 w-4 text-orange-500" />;
      case 'session': return <ClockIcon className="h-4 w-4 text-blue-500" />;
      case 'progressive': return <CpuChipIcon className="h-4 w-4 text-purple-500" />;
      case 'loss': return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      default: return <EyeIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const views = [
    { id: 'overview', name: 'Overview', icon: MapIcon },
    { id: 'tables', name: 'Live Tables', icon: TableCellsIcon },
    { id: 'slots', name: 'Slot Machines', icon: CpuChipIcon },
    { id: 'players', name: 'Player Activity', icon: UserGroupIcon },
    { id: 'alerts', name: 'Alerts', icon: BellIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-casino-serif">🎰 Casino Floor Monitor</h1>
          <p className="text-gray-600 mt-2">Real-time monitoring of all gaming activities</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Auto-refresh:</span>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                autoRefresh ? 'bg-primary-950' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  autoRefresh ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="text-sm text-gray-500">
            Last update: {lastUpdate.toLocaleTimeString()}
          </div>
          <button
            onClick={generateMockData}
            className="btn-primary flex items-center space-x-2"
          >
            <MapIcon className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {views.map((view) => {
              const Icon = view.icon;
              return (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeView === view.id
                      ? 'border-primary-950 text-primary-950'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{view.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Summary Cards */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <TableCellsIcon className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Tables</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tables.filter(t => t.status === 'active').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <CpuChipIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Occupied Slots</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {slotMachines.filter(s => s.status === 'occupied').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <UserGroupIcon className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Players</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tables.reduce((sum, table) => sum + table.players.length, 0) + 
                     slotMachines.filter(s => s.status === 'occupied').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <BellIcon className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Player Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {playerActivities.slice(0, 6).map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {maskPlayerName(activity.fullName, activity.memberId)} - {activity.activity}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.location} • {activity.time}
                        {activity.amount && ` • ${formatCurrency(activity.amount)}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Alerts */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {alerts.slice(0, 4).map((alert) => (
                  <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                    alert.severity === 'error' ? 'border-red-500 bg-red-50' :
                    alert.severity === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                    'border-blue-500 bg-blue-50'
                  }`}>
                    <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tables Tab */}
      {activeView === 'tables' && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Live Gaming Tables</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Table</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dealer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Players</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Limits</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tables.map((table) => (
                  <tr key={table.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{table.name}</div>
                        <div className="text-sm text-gray-500">{table.type}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(table.status)}`}>
                        {table.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {table.dealer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{table.players.length}/7 seated</div>
                      {table.players.slice(0, 2).map((player, idx) => (
                        <div key={idx} className="text-xs text-gray-500">
                          Pos {player.position}: {maskPlayerName(player.fullName, player.memberId)}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(table.minBet)} - {formatCurrency(table.maxBet)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {table.totalHands} hands
                      </div>
                      <div className="text-xs text-gray-500">
                        Avg: {table.avgHandTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-primary-950 hover:text-primary-800">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slots Tab */}
      {activeView === 'slots' && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Slot Machine Status</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {slotMachines.map((machine) => (
                <div key={machine.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{machine.name}</h4>
                      <p className="text-sm text-gray-500">{machine.id} • {machine.denomination}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(machine.status)}`}>
                      {machine.status}
                    </span>
                  </div>
                  
                  {machine.status === 'occupied' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Player:</span>
                        <span className="font-medium">{maskPlayerName(machine.fullName, machine.memberId)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Session Time:</span>
                        <span className="font-medium">{formatTime(machine.sessionTime)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Credits Used:</span>
                        <span className="font-medium">{machine.creditsUsed}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Credits Left:</span>
                        <span className="font-medium text-green-600">{machine.creditsRemaining}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Net Result:</span>
                        <span className={`font-medium ${machine.netResult >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(machine.netResult)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Last Win:</span>
                        <span className="font-medium">{machine.lastWin}</span>
                      </div>
                      {machine.progressive > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progressive:</span>
                          <span className="font-medium text-purple-600">{formatCurrency(machine.progressive)}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {machine.status === 'available' && (
                    <div className="text-center py-4 text-gray-500">
                      <CpuChipIcon className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Available for play</p>
                      {machine.progressive > 0 && (
                        <p className="text-xs text-purple-600 mt-1">Progressive: {formatCurrency(machine.progressive)}</p>
                      )}
                    </div>
                  )}
                  
                  {machine.status === 'maintenance' && (
                    <div className="text-center py-4 text-red-500">
                      <ExclamationTriangleIcon className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Under Maintenance</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Players Tab */}
      {activeView === 'players' && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Player Activity Monitor</h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {playerActivities.map((activity, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getActivityIcon(activity.type)}
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          {maskPlayerName(activity.fullName, activity.memberId)}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {activity.location} • {activity.activity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {activity.amount && (
                        <p className={`text-lg font-bold ${activity.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(activity.amount)}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeView === 'alerts' && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Casino Floor Alerts</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
                  alert.severity === 'error' ? 'border-red-500 bg-red-50' :
                  alert.severity === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                  'border-blue-500 bg-blue-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-green-600 hover:text-green-800">
                        <CheckCircleIcon className="h-5 w-5" />
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CasinoFloor;