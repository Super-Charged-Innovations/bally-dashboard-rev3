import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  WrenchScrewdriverIcon,
  ComputerDesktopIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  PlusIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarDaysIcon,
  UserIcon,
  InformationCircleIcon,
  Cog6ToothIcon,
  BoltIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import apiService from '../services/apiService';

const MaintenanceManagement = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('facilities');
  const [maintenanceData, setMaintenanceData] = useState({
    facilities: [],
    machines: [],
    terminals: [],
    tickets: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [updating, setUpdating] = useState(false);

  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: 'facility',
    priority: 'medium',
    location: '',
    equipment_id: '',
    assigned_to: ''
  });

  useEffect(() => {
    loadMaintenanceData();
    // Set up real-time updates every 45 seconds
    const interval = setInterval(loadMaintenanceData, 45000);
    return () => clearInterval(interval);
  }, []);

  const loadMaintenanceData = async () => {
    try {
      setLoading(true);
      const [facilitiesRes, machinesRes, terminalsRes, ticketsRes] = await Promise.all([
        apiService.get('/api/maintenance/facilities'),
        apiService.get('/api/maintenance/machines'),
        apiService.get('/api/maintenance/terminals'),
        apiService.get('/api/maintenance/tickets')
      ]);
      
      setMaintenanceData({
        facilities: facilitiesRes,
        machines: machinesRes,
        terminals: terminalsRes,
        tickets: ticketsRes
      });
    } catch (error) {
      console.error('Failed to load maintenance data:', error);
      toast.error('Failed to load maintenance data');
    } finally {
      setLoading(false);
    }
  };

  const updateEquipmentStatus = async (equipmentId, category, newStatus) => {
    try {
      setUpdating(true);
      
      // Demo progress simulation
      toast.loading('🔧 Updating equipment status...', { duration: 1000 });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.loading('📡 Notifying maintenance team...', { duration: 1200 });
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const response = await apiService.put(`/api/maintenance/${category}/${equipmentId}/status`, { 
        status: newStatus 
      });
      
      const statusMessages = {
        'operational': '✅ Equipment is now OPERATIONAL and running normally',
        'maintenance': '🔧 Equipment is now under MAINTENANCE - service in progress',
        'out_of_order': '❌ Equipment marked as OUT OF ORDER - requires immediate attention',
        'scheduled': '📅 Equipment scheduled for MAINTENANCE - awaiting service window'
      };
      
      toast.success(statusMessages[newStatus] || `Status updated to ${newStatus}`, {
        duration: 4000,
        icon: '🔧'
      });
      
      loadMaintenanceData();
    } catch (error) {
      toast.error('Failed to update equipment status');
    } finally {
      setUpdating(false);
    }
  };

  const createMaintenanceTicket = async () => {
    try {
      setUpdating(true);
      
      // Demo ticket creation simulation
      toast.loading('📝 Creating maintenance ticket...', { duration: 1000 });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.loading('👷 Assigning to maintenance team...', { duration: 1200 });
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      toast.loading('📱 Sending notifications...', { duration: 800 });
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const response = await apiService.post('/api/maintenance/tickets', newTicket);
      
      const priorityEmojis = {
        'low': '🟢',
        'medium': '🟡', 
        'high': '🟠',
        'critical': '🔴'
      };
      
      toast.success(`${priorityEmojis[newTicket.priority]} Maintenance ticket created! Priority: ${newTicket.priority.toUpperCase()}`, {
        duration: 5000,
        icon: '🎫'
      });
      
      setShowCreateModal(false);
      setNewTicket({
        title: '',
        description: '',
        category: 'facility',
        priority: 'medium',
        location: '',
        equipment_id: '',
        assigned_to: ''
      });
      loadMaintenanceData();
    } catch (error) {
      toast.error('Failed to create maintenance ticket');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status) => {
    const iconClasses = "h-5 w-5";
    switch (status) {
      case 'operational':
        return <CheckCircleIcon className={`${iconClasses} text-green-600`} />;
      case 'maintenance':
        return <WrenchScrewdriverIcon className={`${iconClasses} text-yellow-600`} />;
      case 'out_of_order':
        return <XCircleIcon className={`${iconClasses} text-red-600`} />;
      case 'scheduled':
        return <ClockIcon className={`${iconClasses} text-blue-600`} />;
      default:
        return <InformationCircleIcon className={`${iconClasses} text-gray-600`} />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'operational':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'maintenance':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'out_of_order':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'scheduled':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getPriorityBadge = (priority) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    switch (priority) {
      case 'critical':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'high':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'medium':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'low':
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getCategoryIcon = (category) => {
    const iconClasses = "h-6 w-6";
    switch (category) {
      case 'facility':
        return <BuildingOfficeIcon className={`${iconClasses} text-blue-600`} />;
      case 'machine':
        return <Cog6ToothIcon className={`${iconClasses} text-purple-600`} />;
      case 'terminal':
        return <ComputerDesktopIcon className={`${iconClasses} text-green-600`} />;
      case 'electrical':
        return <BoltIcon className={`${iconClasses} text-yellow-600`} />;
      case 'security':
        return <ShieldCheckIcon className={`${iconClasses} text-red-600`} />;
      default:
        return <WrenchScrewdriverIcon className={`${iconClasses} text-gray-600`} />;
    }
  };

  const filteredData = () => {
    let data = maintenanceData[activeTab] || [];
    
    // Apply search filter
    if (searchTerm) {
      data = data.filter(item => 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.equipment_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      data = data.filter(item => item.status === filterStatus);
    }

    // Apply priority filter (for tickets)
    if (filterPriority !== 'all' && activeTab === 'tickets') {
      data = data.filter(item => item.priority === filterPriority);
    }
    
    return data;
  };

  const tabs = [
    { id: 'facilities', name: 'Facilities', count: maintenanceData.facilities?.length || 0 },
    { id: 'machines', name: 'Casino Machines', count: maintenanceData.machines?.length || 0 },
    { id: 'terminals', name: 'Terminals', count: maintenanceData.terminals?.length || 0 },
    { id: 'tickets', name: 'Service Tickets', count: maintenanceData.tickets?.length || 0 }
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
          <h1 className="text-2xl font-bold text-gray-900">🔧 Maintenance</h1>
          <p className="text-gray-600">Manage facilities, equipment, and service operations</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Create Ticket</span>
          </button>
          <button
            onClick={loadMaintenanceData}
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
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Operational</p>
              <p className="text-2xl font-bold text-gray-900">
                {[...maintenanceData.facilities, ...maintenanceData.machines, ...maintenanceData.terminals]
                  .filter(item => item.status === 'operational').length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <WrenchScrewdriverIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Maintenance</p>
              <p className="text-2xl font-bold text-gray-900">
                {[...maintenanceData.facilities, ...maintenanceData.machines, ...maintenanceData.terminals]
                  .filter(item => item.status === 'maintenance').length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Out of Order</p>
              <p className="text-2xl font-bold text-gray-900">
                {[...maintenanceData.facilities, ...maintenanceData.machines, ...maintenanceData.terminals]
                  .filter(item => item.status === 'out_of_order').length || 0}
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
              <p className="text-sm font-medium text-gray-600">Open Tickets</p>
              <p className="text-2xl font-bold text-gray-900">
                {maintenanceData.tickets?.filter(t => t.status !== 'resolved').length || 0}
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
            placeholder="Search equipment, locations, or tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Status</option>
            <option value="operational">Operational</option>
            <option value="maintenance">Maintenance</option>
            <option value="out_of_order">Out of Order</option>
            <option value="scheduled">Scheduled</option>
          </select>

          {activeTab === 'tickets' && (
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          )}
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
        {activeTab === 'tickets' ? (
          <div className="space-y-4">
            {filteredData().map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="mr-4">
                      {getCategoryIcon(ticket.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 mr-3">
                          {ticket.title}
                        </h3>
                        <span className={getPriorityBadge(ticket.priority)}>
                          {ticket.priority}
                        </span>
                        <span className={getStatusBadge(ticket.status)}>
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{ticket.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">
                            <strong>Location:</strong> {ticket.location}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Equipment:</strong> {ticket.equipment_id || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <strong>Assigned to:</strong> {ticket.assigned_to}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Category:</strong> {ticket.category}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        Created: {ticket.created_at}
                        {ticket.due_date && (
                          <>
                            <span className="mx-2">•</span>
                            <CalendarDaysIcon className="h-4 w-4 mr-1" />
                            Due: {ticket.due_date}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData().map((equipment) => (
              <div key={equipment.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-primary-500 rounded-lg flex items-center justify-center">
                      {getCategoryIcon(equipment.type || activeTab.slice(0, -1))}
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{equipment.name}</h3>
                      <p className="text-sm text-gray-600">{equipment.equipment_id || equipment.model}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(equipment.status)}
                    <span className={getStatusBadge(equipment.status)}>
                      {equipment.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    {equipment.location}
                  </div>
                  {equipment.manufacturer && (
                    <div className="flex items-center text-sm text-gray-600">
                      <InformationCircleIcon className="h-4 w-4 mr-2" />
                      {equipment.manufacturer} • {equipment.model}
                    </div>
                  )}
                  {equipment.last_maintenance && (
                    <div className="flex items-center text-sm text-gray-600">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      Last Service: {equipment.last_maintenance}
                    </div>
                  )}
                  {equipment.assigned_technician && (
                    <div className="flex items-center text-sm text-gray-600">
                      <UserIcon className="h-4 w-4 mr-2" />
                      Tech: {equipment.assigned_technician}
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => updateEquipmentStatus(
                        equipment.id, 
                        activeTab, 
                        equipment.status === 'operational' ? 'maintenance' : 'operational'
                      )}
                      className="flex-1 btn-secondary text-sm py-2"
                      disabled={updating}
                    >
                      {equipment.status === 'operational' ? 'Start Maintenance' : 'Mark Operational'}
                    </button>
                    <button className="flex-1 btn-primary text-sm py-2">
                      <WrenchScrewdriverIcon className="h-4 w-4 mr-1" />
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredData().length === 0 && (
          <div className="text-center py-12">
            <WrenchScrewdriverIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No {activeTab} found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">🎫 Create Maintenance Ticket</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ticket Title</label>
                  <input
                    type="text"
                    value={newTicket.title}
                    onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                    placeholder="e.g., Slot Machine 247 - Not Accepting Coins"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      value={newTicket.category}
                      onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="facility">Facility</option>
                      <option value="machine">Casino Machine</option>
                      <option value="terminal">Terminal/POS</option>
                      <option value="electrical">Electrical</option>
                      <option value="security">Security System</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <select
                      value={newTicket.priority}
                      onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      value={newTicket.location}
                      onChange={(e) => setNewTicket({...newTicket, location: e.target.value})}
                      placeholder="e.g., Main Gaming Floor - Section A"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Equipment ID (Optional)</label>
                    <input
                      type="text"
                      value={newTicket.equipment_id}
                      onChange={(e) => setNewTicket({...newTicket, equipment_id: e.target.value})}
                      placeholder="e.g., SLT-247"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Assign to</label>
                  <select
                    value={newTicket.assigned_to}
                    onChange={(e) => setNewTicket({...newTicket, assigned_to: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select Technician</option>
                    <option value="John Silva - Senior Tech">John Silva - Senior Technician</option>
                    <option value="Maria Santos - Facilities">Maria Santos - Facilities Manager</option>
                    <option value="David Chen - IT Tech">David Chen - IT Technician</option>
                    <option value="Lisa Perera - Gaming Tech">Lisa Perera - Gaming Technician</option>
                    <option value="Ahmed Hassan - Electrical">Ahmed Hassan - Electrical Specialist</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                    rows={4}
                    placeholder="Detailed description of the issue, symptoms, and any troubleshooting already attempted..."
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">📋 Ticket Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Category:</span>
                      <span className="font-semibold text-blue-900 ml-1 capitalize">
                        {newTicket.category}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Priority:</span>
                      <span className="font-semibold text-blue-900 ml-1 capitalize">
                        {newTicket.priority}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Location:</span>
                      <span className="font-semibold text-blue-900 ml-1">
                        {newTicket.location || 'Not specified'}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Assigned to:</span>
                      <span className="font-semibold text-blue-900 ml-1">
                        {newTicket.assigned_to || 'Unassigned'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    disabled={updating}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createMaintenanceTicket}
                    disabled={updating || !newTicket.title || !newTicket.description}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {updating ? (
                      <>
                        <div className="spinner w-4 h-4"></div>
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <PlusIcon className="h-4 w-4" />
                        <span>Create Ticket</span>
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

export default MaintenanceManagement;