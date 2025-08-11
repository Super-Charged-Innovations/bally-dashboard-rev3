import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  TruckIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  BellIcon,
  ArrowPathIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  UsersIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import apiService from '../services/apiService';

const DriversManagement = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('drivers');
  const [driversData, setDriversData] = useState({
    drivers: [],
    schedules: [],
    bookings: [],
    locations: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [updating, setUpdating] = useState(false);

  const [newDriver, setNewDriver] = useState({
    name: '',
    phone: '',
    email: '',
    license_number: '',
    vehicle_type: 'sedan',
    shift_preference: 'day'
  });

  const [scheduleUpdate, setScheduleUpdate] = useState({
    driver_id: '',
    shift_start: '',
    shift_end: '',
    vehicle_assigned: '',
    route_assignment: 'airport_shuttle'
  });

  useEffect(() => {
    loadDriversData();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(loadDriversData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDriversData = async () => {
    try {
      setLoading(true);
      const [driversRes, schedulesRes, bookingsRes, locationsRes] = await Promise.all([
        apiService.get('/api/drivers'),
        apiService.get('/api/drivers/schedules'),
        apiService.get('/api/drivers/bookings'),
        apiService.get('/api/drivers/locations')
      ]);
      
      setDriversData({
        drivers: driversRes,
        schedules: schedulesRes,
        bookings: bookingsRes,
        locations: locationsRes
      });
    } catch (error) {
      console.error('Failed to load drivers data:', error);
      toast.error('Failed to load drivers data');
    } finally {
      setLoading(false);
    }
  };

  const updateDriverStatus = async (driverId, newStatus) => {
    try {
      setUpdating(true);
      
      // Demo progress simulation
      toast.loading('📡 Updating driver status...', { duration: 800 });
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.loading('🚗 Notifying dispatch system...', { duration: 1000 });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await apiService.put(`/api/drivers/${driverId}/status`, { status: newStatus });
      
      const statusMessages = {
        'on_duty': '✅ Driver is now ON DUTY and available for bookings',
        'off_duty': '🔴 Driver is now OFF DUTY and unavailable',
        'occupied': '🚗 Driver is now OCCUPIED with a passenger',
        'available': '🟢 Driver is now AVAILABLE for new bookings',
        'maintenance': '🔧 Driver vehicle is in MAINTENANCE mode'
      };
      
      toast.success(statusMessages[newStatus] || `Status updated to ${newStatus}`, {
        duration: 4000,
        icon: '🚗'
      });
      
      loadDriversData();
    } catch (error) {
      toast.error('Failed to update driver status');
    } finally {
      setUpdating(false);
    }
  };

  const sendDriverNotification = async (driverId, message) => {
    try {
      setUpdating(true);
      
      // Demo notification simulation
      toast.loading('📱 Sending notification to driver...', { duration: 1000 });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.loading('🔔 Delivering via multiple channels...', { duration: 1200 });
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const response = await apiService.post('/api/drivers/notifications', {
        driver_id: driverId,
        message: message,
        channels: ['sms', 'app', 'radio']
      });
      
      toast.success(`📨 Notification sent successfully to driver via SMS & App!`, {
        duration: 4000
      });
    } catch (error) {
      toast.error('Failed to send notification');
    } finally {
      setUpdating(false);
    }
  };

  const createDriver = async () => {
    try {
      setUpdating(true);
      
      // Demo creation simulation
      toast.loading('📝 Creating driver profile...', { duration: 1000 });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.loading('🚗 Assigning vehicle and credentials...', { duration: 1200 });
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      toast.loading('📱 Setting up mobile app access...', { duration: 800 });
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const response = await apiService.post('/api/drivers', newDriver);
      
      toast.success(`🎉 Driver ${newDriver.name} created successfully! Welcome to the team!`, {
        duration: 5000,
        icon: '🚗'
      });
      
      setShowCreateModal(false);
      setNewDriver({
        name: '',
        phone: '',
        email: '',
        license_number: '',
        vehicle_type: 'sedan',
        shift_preference: 'day'
      });
      loadDriversData();
    } catch (error) {
      toast.error('Failed to create driver');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status) => {
    const iconClasses = "h-5 w-5";
    switch (status) {
      case 'on_duty':
        return <CheckCircleIcon className={`${iconClasses} text-green-600`} />;
      case 'off_duty':
        return <XCircleIcon className={`${iconClasses} text-red-600`} />;
      case 'occupied':
        return <UsersIcon className={`${iconClasses} text-blue-600`} />;
      case 'available':
        return <CheckCircleIcon className={`${iconClasses} text-green-500`} />;
      case 'maintenance':
        return <InformationCircleIcon className={`${iconClasses} text-yellow-600`} />;
      default:
        return <InformationCircleIcon className={`${iconClasses} text-gray-600`} />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'on_duty':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'off_duty':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'occupied':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'available':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'maintenance':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getDirectionIcon = (direction) => {
    const iconClasses = "h-4 w-4";
    switch (direction) {
      case 'inbound':
        return <ArrowLeftIcon className={`${iconClasses} text-blue-600`} />;
      case 'outbound':
        return <ArrowRightIcon className={`${iconClasses} text-orange-600`} />;
      default:
        return <MapPinIcon className={`${iconClasses} text-gray-600`} />;
    }
  };

  const filteredData = () => {
    let data = driversData[activeTab] || [];
    
    // Apply search filter
    if (searchTerm) {
      data = data.filter(item => 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.vehicle_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      data = data.filter(item => item.status === filterStatus);
    }
    
    return data;
  };

  const tabs = [
    { id: 'drivers', name: 'Drivers', count: driversData.drivers?.length || 0 },
    { id: 'schedules', name: 'Schedules', count: driversData.schedules?.length || 0 },
    { id: 'bookings', name: 'Active Bookings', count: driversData.bookings?.length || 0 },
    { id: 'locations', name: 'Live Tracking', count: driversData.locations?.length || 0 }
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
          <h1 className="text-2xl font-bold text-gray-900">🚗 Drivers</h1>
          <p className="text-gray-600">Manage transportation services, driver schedules, and live tracking</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add Driver</span>
          </button>
          <button
            onClick={loadDriversData}
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
              <p className="text-sm font-medium text-gray-600">On Duty</p>
              <p className="text-2xl font-bold text-gray-900">
                {driversData.drivers?.filter(d => d.status === 'on_duty' || d.status === 'available' || d.status === 'occupied').length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Occupied</p>
              <p className="text-2xl font-bold text-gray-900">
                {driversData.drivers?.filter(d => d.status === 'occupied').length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <CalendarDaysIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Bookings</p>
              <p className="text-2xl font-bold text-gray-900">
                {driversData.bookings?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-bold text-gray-900">
                {driversData.drivers?.filter(d => d.status === 'available').length || 0}
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
            placeholder="Search drivers, vehicles, or locations..."
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
            <option value="on_duty">On Duty</option>
            <option value="off_duty">Off Duty</option>
            <option value="occupied">Occupied</option>
            <option value="available">Available</option>
            <option value="maintenance">Maintenance</option>
          </select>
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
        {activeTab === 'drivers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData().map((driver) => (
              <div key={driver.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-primary-500 rounded-full flex items-center justify-center">
                      <TruckIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{driver.name}</h3>
                      <p className="text-sm text-gray-600">{driver.vehicle_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(driver.status)}
                    <span className={getStatusBadge(driver.status)}>
                      {driver.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    {driver.phone}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <TruckIcon className="h-4 w-4 mr-2" />
                    {driver.vehicle_type} • {driver.license_number}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    Shift: {driver.shift_start} - {driver.shift_end}
                  </div>
                  {driver.current_passenger && (
                    <div className="flex items-center text-sm text-blue-600">
                      <UsersIcon className="h-4 w-4 mr-2" />
                      Passenger: {driver.current_passenger}
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => updateDriverStatus(driver.id, driver.status === 'on_duty' ? 'off_duty' : 'on_duty')}
                      className="flex-1 btn-secondary text-sm py-2"
                      disabled={updating}
                    >
                      {driver.status === 'on_duty' ? 'Off Duty' : 'On Duty'}
                    </button>
                    <button 
                      onClick={() => sendDriverNotification(driver.id, 'New assignment available')}
                      className="flex-1 btn-primary text-sm py-2"
                      disabled={updating}
                    >
                      <BellIcon className="h-4 w-4 mr-1" />
                      Notify
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {filteredData().map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="mr-4">
                      <UsersIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 mr-3">
                          {booking.passenger_name}
                        </h3>
                        <span className={getStatusBadge(booking.status)}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">
                            <strong>From:</strong> {booking.pickup_location}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>To:</strong> {booking.destination}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <strong>Driver:</strong> {booking.driver_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Vehicle:</strong> {booking.vehicle_number}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        Pickup: {booking.pickup_time}
                        <span className="mx-2">•</span>
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        ETA: {booking.eta}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    {getDirectionIcon(booking.direction)}
                    <span className="ml-1 text-sm text-gray-600 capitalize">
                      {booking.direction}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'locations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredData().map((location) => (
              <div key={location.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <MapPinIcon className="h-8 w-8 text-primary-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{location.driver_name}</h3>
                      <p className="text-sm text-gray-600">{location.vehicle_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {getDirectionIcon(location.direction)}
                    <span className="ml-1 text-sm font-medium text-gray-900">
                      {location.direction}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    Current: {location.current_location}
                  </div>
                  {location.destination && (
                    <div className="flex items-center text-sm text-gray-600">
                      <ArrowRightIcon className="h-4 w-4 mr-2" />
                      Destination: {location.destination}
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    Last Update: {location.last_update}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Speed: {location.speed} km/h</span>
                    <span className={getStatusBadge(location.status)}>
                      {location.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'schedules' && (
          <div className="space-y-4">
            {filteredData().map((schedule) => (
              <div key={schedule.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <CalendarDaysIcon className="h-6 w-6 text-orange-600 mr-4" />
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 mr-3">
                          {schedule.driver_name}
                        </h3>
                        <span className={getStatusBadge(schedule.status)}>
                          {schedule.shift_type}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">
                            <strong>Shift:</strong> {schedule.shift_start} - {schedule.shift_end}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <strong>Vehicle:</strong> {schedule.vehicle_assigned}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <strong>Route:</strong> {schedule.route_assignment}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        Date: {schedule.date}
                      </div>
                    </div>
                  </div>
                  
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <PencilIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredData().length === 0 && (
          <div className="text-center py-12">
            <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No {activeTab} found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Create Driver Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">🚗 Add New Driver</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      value={newDriver.name}
                      onChange={(e) => setNewDriver({...newDriver, name: e.target.value})}
                      placeholder="e.g., John Silva"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      value={newDriver.phone}
                      onChange={(e) => setNewDriver({...newDriver, phone: e.target.value})}
                      placeholder="+94-77-123-4567"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={newDriver.email}
                      onChange={(e) => setNewDriver({...newDriver, email: e.target.value})}
                      placeholder="driver@ballyscolombo.lk"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">License Number</label>
                    <input
                      type="text"
                      value={newDriver.license_number}
                      onChange={(e) => setNewDriver({...newDriver, license_number: e.target.value})}
                      placeholder="B1234567"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
                    <select
                      value={newDriver.vehicle_type}
                      onChange={(e) => setNewDriver({...newDriver, vehicle_type: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="sedan">Sedan</option>
                      <option value="suv">SUV</option>
                      <option value="luxury">Luxury Vehicle</option>
                      <option value="van">Van/Shuttle</option>
                      <option value="limousine">Limousine</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Shift Preference</label>
                    <select
                      value={newDriver.shift_preference}
                      onChange={(e) => setNewDriver({...newDriver, shift_preference: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="day">Day Shift (06:00-14:00)</option>
                      <option value="afternoon">Afternoon Shift (14:00-22:00)</option>
                      <option value="night">Night Shift (22:00-06:00)</option>
                      <option value="flexible">Flexible Hours</option>
                    </select>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">📋 New Driver Setup</h4>
                  <div className="text-sm text-blue-800">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Driver profile will be created with default permissions</li>
                      <li>Mobile app credentials will be sent via SMS</li>
                      <li>Vehicle assignment can be done after creation</li>
                      <li>Initial training schedule will be generated</li>
                    </ul>
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
                    onClick={createDriver}
                    disabled={updating || !newDriver.name || !newDriver.phone || !newDriver.license_number}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {updating ? (
                      <>
                        <div className="spinner w-4 h-4"></div>
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <TruckIcon className="h-4 w-4" />
                        <span>Create Driver</span>
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

export default DriversManagement;