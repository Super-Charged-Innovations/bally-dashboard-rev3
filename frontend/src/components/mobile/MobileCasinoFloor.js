import React, { useState, useEffect } from 'react';
import {
  MapIcon,
  TableCellsIcon,
  CpuChipIcon,
  PlayIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon,
  ArrowPathIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const MobileCasinoFloor = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [tables, setTables] = useState([]);
  const [slotMachines, setSlotMachines] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const canSeeFullNames = user?.role === 'SuperAdmin' || user?.permissions?.includes('view_full_player_data');

  const maskPlayerName = (fullName, memberId) => {
    if (canSeeFullNames) {
      return fullName || `Member ${memberId}`;
    }
    return `Member ${memberId}`;
  };

  useEffect(() => {
    generateMockData();
  }, []);

  const generateMockData = () => {
    setRefreshing(true);
    
    // Simplified mock data for mobile
    const mockTables = [
      {
        id: 'BJ-01',
        name: 'Blackjack 1',
        type: 'Blackjack',
        status: 'active',
        players: 3,
        maxPlayers: 7,
        dealer: 'Sarah C.',
        totalWagered: 4650,
        lastUpdate: '2 min ago'
      },
      {
        id: 'RT-01',
        name: 'Roulette 1',
        type: 'Roulette',
        status: 'active',
        players: 6,
        maxPlayers: 8,
        dealer: 'Anna R.',
        totalWagered: 8200,
        lastUpdate: '1 min ago'
      },
      {
        id: 'PK-01',
        name: 'Poker 1',
        type: 'Poker',
        status: 'active',
        players: 4,
        maxPlayers: 9,
        dealer: 'Tom W.',
        totalWagered: 15400,
        lastUpdate: '3 min ago'
      },
      {
        id: 'BC-01',
        name: 'Baccarat 1',
        type: 'Baccarat',
        status: 'vacant',
        players: 0,
        maxPlayers: 7,
        dealer: 'Linda Z.',
        totalWagered: 0,
        lastUpdate: '15 min ago'
      }
    ];

    const mockSlots = [
      {
        id: 'SL-001',
        name: 'Fortune Wheel',
        status: 'occupied',
        memberId: 'M089',
        fullName: 'Patricia Garcia',
        sessionTime: 78,
        credits: 1250,
        lastWin: '5 min ago',
        progressive: 125420
      },
      {
        id: 'SL-002',
        name: 'Diamond Dreams',
        status: 'occupied',
        memberId: 'V023',
        fullName: 'Richard Moore',
        sessionTime: 145,
        credits: 3200,
        lastWin: '12 min ago',
        progressive: 89750
      },
      {
        id: 'SL-003',
        name: 'Lucky Sevens',
        status: 'available',
        memberId: null,
        fullName: null,
        sessionTime: 0,
        credits: 0,
        lastWin: null,
        progressive: 0
      },
      {
        id: 'SL-004',
        name: 'Mega Jackpot',
        status: 'occupied',
        memberId: 'M234',
        fullName: 'Nancy Williams',
        sessionTime: 203,
        credits: 750,
        lastWin: '28 min ago',
        progressive: 245800
      },
      {
        id: 'SL-005',
        name: 'Ocean Adventure',
        status: 'maintenance',
        memberId: null,
        fullName: null,
        sessionTime: 0,
        credits: 0,
        lastWin: null,
        progressive: 0
      }
    ];

    setTables(mockTables);
    setSlotMachines(mockSlots);
    
    setTimeout(() => {
      setRefreshing(false);
      toast.success('Floor data updated', { duration: 2000 });
    }, 1000);
  };

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
      case 'active': return 'text-green-800 bg-green-100';
      case 'occupied': return 'text-green-800 bg-green-100';
      case 'vacant': return 'text-yellow-800 bg-yellow-100';
      case 'available': return 'text-blue-800 bg-blue-100';
      case 'maintenance': return 'text-red-800 bg-red-100';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: MapIcon },
    { id: 'tables', name: 'Tables', icon: TableCellsIcon },
    { id: 'slots', name: 'Slots', icon: CpuChipIcon }
  ];

  return (
    <div className="space-y-4">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Casino Floor</h1>
          <p className="text-sm text-gray-600">Real-time monitoring</p>
        </div>
        <button
          onClick={generateMockData}
          disabled={refreshing}
          className="p-2 rounded-lg bg-primary-950 text-white hover:bg-primary-800 disabled:opacity-50"
        >
          <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-primary-950 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-2 mb-2">
                <TableCellsIcon className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Active Tables</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {tables.filter(t => t.status === 'active').length}
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-2 mb-2">
                <CpuChipIcon className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Occupied Slots</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {slotMachines.filter(s => s.status === 'occupied').length}
              </p>
            </div>
          </div>

          {/* Active Tables Summary */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Active Gaming Tables</h3>
            <div className="space-y-3">
              {tables.filter(t => t.status === 'active').map((table) => (
                <div key={table.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{table.name}</h4>
                    <p className="text-sm text-gray-600">{table.players}/{table.maxPlayers} players • {table.dealer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{formatCurrency(table.totalWagered)}</p>
                    <p className="text-xs text-gray-500">{table.lastUpdate}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-blue-600 font-medium">Total Players</p>
              <p className="text-lg font-bold text-blue-900">
                {tables.reduce((sum, table) => sum + table.players, 0) + 
                 slotMachines.filter(s => s.status === 'occupied').length}
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
              <p className="text-xs text-green-600 font-medium">Revenue/Hour</p>
              <p className="text-lg font-bold text-green-900">$12.4K</p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
              <p className="text-xs text-purple-600 font-medium">Efficiency</p>
              <p className="text-lg font-bold text-purple-900">87%</p>
            </div>
          </div>
        </div>
      )}

      {/* Tables Tab */}
      {activeTab === 'tables' && (
        <div className="space-y-4">
          {tables.map((table) => (
            <div key={table.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{table.name}</h3>
                  <p className="text-sm text-gray-600">{table.type}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(table.status)}`}>
                  {table.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-500">Players</p>
                  <p className="font-medium">{table.players}/{table.maxPlayers}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Dealer</p>
                  <p className="font-medium">{table.dealer}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Wagered</p>
                  <p className="font-medium text-green-600">{formatCurrency(table.totalWagered)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Update</p>
                  <p className="font-medium">{table.lastUpdate}</p>
                </div>
              </div>
              
              <button className="w-full py-2 px-4 bg-primary-950 text-white rounded-lg text-sm font-medium hover:bg-primary-800">
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Slots Tab */}
      {activeTab === 'slots' && (
        <div className="space-y-4">
          {slotMachines.map((machine) => (
            <div key={machine.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{machine.name}</h3>
                  <p className="text-sm text-gray-600">{machine.id}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(machine.status)}`}>
                  {machine.status}
                </span>
              </div>

              {machine.status === 'occupied' && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                    <UserIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      {maskPlayerName(machine.fullName, machine.memberId)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 flex items-center">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        Session Time
                      </p>
                      <p className="font-medium">{formatTime(machine.sessionTime)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 flex items-center">
                        <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                        Credits
                      </p>
                      <p className="font-medium text-green-600">{machine.credits}</p>
                    </div>
                    {machine.progressive > 0 && (
                      <>
                        <div>
                          <p className="text-xs text-gray-500">Progressive</p>
                          <p className="font-medium text-purple-600">{formatCurrency(machine.progressive)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Last Win</p>
                          <p className="font-medium">{machine.lastWin}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {machine.status === 'available' && (
                <div className="text-center py-4 text-gray-500">
                  <CpuChipIcon className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Available for play</p>
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
      )}
    </div>
  );
};

export default MobileCasinoFloor;