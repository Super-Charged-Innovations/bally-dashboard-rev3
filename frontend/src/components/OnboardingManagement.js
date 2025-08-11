import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  UserPlusIcon,
  DocumentCheckIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
  IdentificationIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarDaysIcon,
  UserIcon,
  FlagIcon,
  CameraIcon,
  DocumentTextIcon,
  BanknotesIcon,
  GiftIcon,
  MegaphoneIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import apiService from '../services/apiService';

const OnboardingManagement = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('applications');
  const [onboardingData, setOnboardingData] = useState({
    applications: [],
    documents: [],
    compliance: [],
    workflow: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [processing, setProcessing] = useState(false);

  const [newApplication, setNewApplication] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    nationality: '',
    passport_number: '',
    nic_number: '',
    address: '',
    membership_type: 'temporary',
    marketing_consent: false,
    source: 'walk_in'
  });

  useEffect(() => {
    loadOnboardingData();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(loadOnboardingData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadOnboardingData = async () => {
    try {
      setLoading(true);
      const [applicationsRes, documentsRes, complianceRes, workflowRes] = await Promise.all([
        apiService.get('/api/onboarding/applications'),
        apiService.get('/api/onboarding/documents'),
        apiService.get('/api/onboarding/compliance'),
        apiService.get('/api/onboarding/workflow')
      ]);
      
      setOnboardingData({
        applications: applicationsRes,
        documents: documentsRes,
        compliance: complianceRes,
        workflow: workflowRes
      });
    } catch (error) {
      console.error('Failed to load onboarding data:', error);
      toast.error('Failed to load onboarding data');
    } finally {
      setLoading(false);
    }
  };

  const processApplication = async (applicationId, action) => {
    try {
      setProcessing(true);
      
      // Demo process simulation with marketing and compliance integration
      if (action === 'approve') {
        toast.loading('🔍 Running compliance checks...', { duration: 1200 });
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        toast.loading('📋 Verifying documentation...', { duration: 1500 });
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast.loading('🛡️ Conducting risk assessment...', { duration: 1000 });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast.loading('🎯 Triggering marketing campaigns...', { duration: 800 });
        await new Promise(resolve => setTimeout(resolve, 800));
        
        toast.loading('✅ Finalizing membership setup...', { duration: 1000 });
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else if (action === 'reject') {
        toast.loading('📝 Documenting rejection reasons...', { duration: 800 });
        await new Promise(resolve => setTimeout(resolve, 800));
        
        toast.loading('📧 Preparing notification communications...', { duration: 1000 });
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const response = await apiService.put(`/api/onboarding/applications/${applicationId}`, {
        status: action === 'approve' ? 'approved' : 'rejected',
        action: action
      });
      
      const actionMessages = {
        'approve': '🎉 Application APPROVED! Member onboarded successfully with compliance verification complete!',
        'reject': '❌ Application REJECTED. Applicant will be notified with detailed feedback.',
        'hold': '⏸️ Application placed on HOLD for additional review and documentation.',
        'review': '🔍 Application sent for MANUAL REVIEW by compliance team.'
      };
      
      toast.success(actionMessages[action] || `Application ${action}ed successfully`, {
        duration: 5000,
        icon: action === 'approve' ? '🎉' : action === 'reject' ? '❌' : '⏸️'
      });
      
      loadOnboardingData();
    } catch (error) {
      toast.error(`Failed to ${action} application`);
    } finally {
      setProcessing(false);
    }
  };

  const createApplication = async () => {
    try {
      setProcessing(true);
      
      // Demo application creation with integrated workflow
      toast.loading('📝 Creating member application...', { duration: 1000 });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.loading('🔍 Initiating compliance screening...', { duration: 1200 });
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      toast.loading('📋 Setting up document requirements...', { duration: 800 });
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.loading('🎯 Assigning marketing profile...', { duration: 1000 });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await apiService.post('/api/onboarding/applications', newApplication);
      
      const membershipTypes = {
        'temporary': 'Temporary Guest',
        'standard': 'Standard Member',
        'premium': 'Premium Member',
        'vip': 'VIP Member'
      };
      
      toast.success(`🌟 ${membershipTypes[newApplication.membership_type]} application created! Compliance screening initiated.`, {
        duration: 5000,
        icon: '🎫'
      });
      
      setShowCreateModal(false);
      setNewApplication({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        nationality: '',
        passport_number: '',
        nic_number: '',
        address: '',
        membership_type: 'temporary',
        marketing_consent: false,
        source: 'walk_in'
      });
      loadOnboardingData();
    } catch (error) {
      toast.error('Failed to create application');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusIcon = (status) => {
    const iconClasses = "h-5 w-5";
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className={`${iconClasses} text-green-600`} />;
      case 'rejected':
        return <XCircleIcon className={`${iconClasses} text-red-600`} />;
      case 'pending':
        return <ClockIcon className={`${iconClasses} text-yellow-600`} />;
      case 'under_review':
        return <EyeIcon className={`${iconClasses} text-blue-600`} />;
      case 'compliance_check':
        return <ShieldCheckIcon className={`${iconClasses} text-purple-600`} />;
      case 'document_verification':
        return <DocumentCheckIcon className={`${iconClasses} text-orange-600`} />;
      default:
        return <InformationCircleIcon className={`${iconClasses} text-gray-600`} />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'under_review':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'compliance_check':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'document_verification':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getMembershipTypeBadge = (type) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (type) {
      case 'vip':
        return `${baseClasses} bg-gradient-to-r from-purple-500 to-pink-500 text-white`;
      case 'premium':
        return `${baseClasses} bg-gradient-to-r from-yellow-400 to-orange-500 text-white`;
      case 'standard':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'temporary':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getComplianceRiskBadge = (risk) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (risk) {
      case 'low':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'medium':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'high':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const filteredData = () => {
    let data = onboardingData[activeTab] || [];
    
    // Apply search filter
    if (searchTerm) {
      data = data.filter(item => 
        item.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.passport_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nic_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      data = data.filter(item => item.status === filterStatus);
    }

    // Apply type filter (for applications)
    if (filterType !== 'all' && activeTab === 'applications') {
      data = data.filter(item => item.membership_type === filterType);
    }
    
    return data;
  };

  const tabs = [
    { id: 'applications', name: 'Applications', count: onboardingData.applications?.length || 0 },
    { id: 'documents', name: 'Document Review', count: onboardingData.documents?.length || 0 },
    { id: 'compliance', name: 'Compliance Check', count: onboardingData.compliance?.length || 0 },
    { id: 'workflow', name: 'Process Flow', count: onboardingData.workflow?.length || 0 }
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
          <h1 className="text-2xl font-bold text-gray-900">🎯 Member Onboarding</h1>
          <p className="text-gray-600">Manage new member applications with integrated compliance and marketing</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <UserPlusIcon className="h-5 w-5" />
            <span>New Application</span>
          </button>
          <button
            onClick={loadOnboardingData}
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
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">
                {onboardingData.applications?.filter(a => a.status === 'pending' || a.status === 'under_review').length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <ShieldCheckIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Compliance Check</p>
              <p className="text-2xl font-bold text-gray-900">
                {onboardingData.applications?.filter(a => a.status === 'compliance_check').length || 0}
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
              <p className="text-sm font-medium text-gray-600">Approved Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {onboardingData.applications?.filter(a => a.status === 'approved' && 
                  new Date(a.updated_at).toDateString() === new Date().toDateString()).length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <DocumentCheckIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Doc Verification</p>
              <p className="text-2xl font-bold text-gray-900">
                {onboardingData.applications?.filter(a => a.status === 'document_verification').length || 0}
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
            placeholder="Search by name, email, passport, or NIC..."
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
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="compliance_check">Compliance Check</option>
            <option value="document_verification">Document Verification</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {activeTab === 'applications' && (
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Types</option>
              <option value="temporary">Temporary</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
              <option value="vip">VIP</option>
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
        {activeTab === 'applications' && (
          <div className="space-y-4">
            {filteredData().map((application) => (
              <div key={application.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="h-12 w-12 bg-primary-500 rounded-full flex items-center justify-center mr-4">
                      <UserIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 mr-3">
                          {application.first_name} {application.last_name}
                        </h3>
                        <span className={getStatusBadge(application.status)}>
                          {application.status.replace('_', ' ')}
                        </span>
                        <span className={getMembershipTypeBadge(application.membership_type)}>
                          {application.membership_type}
                        </span>
                        {application.compliance_risk && (
                          <span className={getComplianceRiskBadge(application.compliance_risk)}>
                            {application.compliance_risk} risk
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">
                            <EnvelopeIcon className="h-4 w-4 inline mr-1" />
                            {application.email}
                          </p>
                          <p className="text-sm text-gray-600">
                            <PhoneIcon className="h-4 w-4 inline mr-1" />
                            {application.phone}
                          </p>
                          <p className="text-sm text-gray-600">
                            <FlagIcon className="h-4 w-4 inline mr-1" />
                            {application.nationality}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <IdentificationIcon className="h-4 w-4 inline mr-1" />
                            Passport: {application.passport_number || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-600">
                            <IdentificationIcon className="h-4 w-4 inline mr-1" />
                            NIC: {application.nic_number || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-600">
                            <CalendarDaysIcon className="h-4 w-4 inline mr-1" />
                            DOB: {application.date_of_birth}
                          </p>
                        </div>
                      </div>

                      {application.marketing_campaigns && (
                        <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <MegaphoneIcon className="h-4 w-4 inline mr-1" />
                            <strong>Marketing:</strong> {application.marketing_campaigns.join(', ')}
                          </p>
                        </div>
                      )}

                      {application.compliance_notes && (
                        <div className="mb-3 p-2 bg-purple-50 rounded-lg">
                          <p className="text-sm text-purple-800">
                            <ShieldCheckIcon className="h-4 w-4 inline mr-1" />
                            <strong>Compliance:</strong> {application.compliance_notes}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        Applied: {application.created_at}
                        <span className="mx-2">•</span>
                        Source: {application.source.replace('_', ' ')}
                        {application.referral_code && (
                          <>
                            <span className="mx-2">•</span>
                            Referral: {application.referral_code}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    {application.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => processApplication(application.id, 'approve')}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          disabled={processing}
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => processApplication(application.id, 'reject')}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                          disabled={processing}
                        >
                          Reject
                        </button>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                          Review
                        </button>
                      </>
                    )}
                    {application.status !== 'pending' && (
                      <button className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700">
                        <EyeIcon className="h-4 w-4 inline mr-1" />
                        View
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData().map((document) => (
              <div key={document.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-orange-500 rounded-lg flex items-center justify-center">
                      <DocumentTextIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{document.document_type}</h3>
                      <p className="text-sm text-gray-600">{document.applicant_name}</p>
                    </div>
                  </div>
                  {getStatusIcon(document.verification_status)}
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Document ID:</strong> {document.document_number}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Uploaded:</strong> {document.uploaded_at}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Expiry:</strong> {document.expiry_date || 'N/A'}
                  </p>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <button className="flex-1 btn-secondary text-sm py-2">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      View
                    </button>
                    <button className="flex-1 btn-primary text-sm py-2">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Verify
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="space-y-4">
            {filteredData().map((check) => (
              <div key={check.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="h-10 w-10 bg-purple-500 rounded-lg flex items-center justify-center mr-4">
                      <ShieldCheckIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 mr-3">
                          {check.applicant_name}
                        </h3>
                        <span className={getComplianceRiskBadge(check.risk_level)}>
                          {check.risk_level} risk
                        </span>
                        <span className={getStatusBadge(check.status)}>
                          {check.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">
                            <strong>AML Check:</strong> {check.aml_status}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>PEP Status:</strong> {check.pep_status}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Sanctions:</strong> {check.sanctions_status}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <strong>KYC Score:</strong> {check.kyc_score}/100
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Source of Funds:</strong> {check.source_of_funds}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Background:</strong> {check.background_check}
                          </p>
                        </div>
                      </div>

                      {check.compliance_notes && (
                        <div className="mb-3 p-3 bg-purple-50 rounded-lg">
                          <p className="text-sm text-purple-800">
                            <strong>Compliance Notes:</strong> {check.compliance_notes}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        Checked: {check.checked_at}
                        <span className="mx-2">•</span>
                        Officer: {check.compliance_officer}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'workflow' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredData().map((workflow) => (
              <div key={workflow.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{workflow.applicant_name}</h3>
                  <span className={getStatusBadge(workflow.current_stage)}>
                    {workflow.current_stage.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="space-y-3">
                  {workflow.stages.map((stage, index) => (
                    <div key={index} className="flex items-center">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center mr-3 ${
                        stage.completed 
                          ? 'bg-green-500 text-white' 
                          : stage.active 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-300 text-gray-600'
                      }`}>
                        {stage.completed ? (
                          <CheckCircleIcon className="h-4 w-4" />
                        ) : (
                          <span className="text-xs">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${stage.active ? 'font-semibold text-blue-900' : 'text-gray-700'}`}>
                          {stage.name}
                        </p>
                        {stage.completed_at && (
                          <p className="text-xs text-gray-500">
                            Completed: {stage.completed_at}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Progress: {workflow.completion_percentage}%</span>
                    <span>ETA: {workflow.estimated_completion}</span>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${workflow.completion_percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredData().length === 0 && (
          <div className="text-center py-12">
            <UserPlusIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No {activeTab} found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Create Application Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3 max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">🎯 New Member Application</h3>
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
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      value={newApplication.first_name}
                      onChange={(e) => setNewApplication({...newApplication, first_name: e.target.value})}
                      placeholder="John"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      value={newApplication.last_name}
                      onChange={(e) => setNewApplication({...newApplication, last_name: e.target.value})}
                      placeholder="Silva"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={newApplication.email}
                      onChange={(e) => setNewApplication({...newApplication, email: e.target.value})}
                      placeholder="john.silva@email.com"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      value={newApplication.phone}
                      onChange={(e) => setNewApplication({...newApplication, phone: e.target.value})}
                      placeholder="+94-77-123-4567"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <input
                      type="date"
                      value={newApplication.date_of_birth}
                      onChange={(e) => setNewApplication({...newApplication, date_of_birth: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nationality</label>
                    <select
                      value={newApplication.nationality}
                      onChange={(e) => setNewApplication({...newApplication, nationality: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select Nationality</option>
                      <option value="Sri Lankan">Sri Lankan</option>
                      <option value="Indian">Indian</option>
                      <option value="British">British</option>
                      <option value="American">American</option>
                      <option value="Australian">Australian</option>
                      <option value="Chinese">Chinese</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Membership Type</label>
                    <select
                      value={newApplication.membership_type}
                      onChange={(e) => setNewApplication({...newApplication, membership_type: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="temporary">Temporary Guest</option>
                      <option value="standard">Standard Member</option>
                      <option value="premium">Premium Member</option>
                      <option value="vip">VIP Member</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Passport Number</label>
                    <input
                      type="text"
                      value={newApplication.passport_number}
                      onChange={(e) => setNewApplication({...newApplication, passport_number: e.target.value})}
                      placeholder="N1234567"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">NIC Number (Sri Lankans)</label>
                    <input
                      type="text"
                      value={newApplication.nic_number}
                      onChange={(e) => setNewApplication({...newApplication, nic_number: e.target.value})}
                      placeholder="200012345678"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <textarea
                    value={newApplication.address}
                    onChange={(e) => setNewApplication({...newApplication, address: e.target.value})}
                    rows={3}
                    placeholder="Complete residential address..."
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Application Source</label>
                    <select
                      value={newApplication.source}
                      onChange={(e) => setNewApplication({...newApplication, source: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="walk_in">Walk-in</option>
                      <option value="online">Online Application</option>
                      <option value="referral">Referral</option>
                      <option value="marketing_campaign">Marketing Campaign</option>
                      <option value="travel_partner">Travel Partner</option>
                    </select>
                  </div>

                  <div className="flex items-center pt-6">
                    <input
                      type="checkbox"
                      checked={newApplication.marketing_consent}
                      onChange={(e) => setNewApplication({...newApplication, marketing_consent: e.target.checked})}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Consent to marketing communications
                    </label>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">🎯 Application Overview</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Membership Type:</span>
                      <span className="font-semibold text-blue-900 ml-1 capitalize">
                        {newApplication.membership_type}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Source:</span>
                      <span className="font-semibold text-blue-900 ml-1">
                        {newApplication.source.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Marketing Consent:</span>
                      <span className="font-semibold text-blue-900 ml-1">
                        {newApplication.marketing_consent ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Next Steps:</span>
                      <span className="font-semibold text-blue-900 ml-1">
                        Document Upload → Compliance Check
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    disabled={processing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createApplication}
                    disabled={processing || !newApplication.first_name || !newApplication.last_name || !newApplication.email}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {processing ? (
                      <>
                        <div className="spinner w-4 h-4"></div>
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <UserPlusIcon className="h-4 w-4" />
                        <span>Create Application</span>
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

export default OnboardingManagement;