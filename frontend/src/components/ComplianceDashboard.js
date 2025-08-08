import React, { useState, useEffect } from 'react';
import { 
  ShieldCheckIcon, 
  DocumentTextIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  PlusIcon,
  DownloadIcon
} from '@heroicons/react/24/outline';
import apiService from '../services/apiService';
import { toast } from 'react-hot-toast';

const ComplianceDashboard = ({ user }) => {
  const [complianceReports, setComplianceReports] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [dataRetentionPolicies, setDataRetentionPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reports');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [newReport, setNewReport] = useState({
    report_type: 'audit_trail',
    start_date: '',
    end_date: ''
  });
  const [auditSummary, setAuditSummary] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reportsRes, auditRes, policiesRes] = await Promise.all([
        apiService.get('/api/compliance/reports'),
        apiService.get('/api/audit/enhanced'),
        apiService.get('/api/data-retention/policies')
      ]);

      setComplianceReports(reportsRes.reports || []);
      setAuditLogs(auditRes.audit_logs || []);
      setAuditSummary(auditRes.summary || {});
      setDataRetentionPolicies(policiesRes || []);
    } catch (error) {
      console.error('Failed to load compliance data:', error);
      toast.error('Failed to load compliance data');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.post('/api/compliance/reports/generate', newReport);
      toast.success('Compliance report generated successfully');
      setShowGenerateModal(false);
      setNewReport({
        report_type: 'audit_trail',
        start_date: '',
        end_date: ''
      });
      loadData();
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };

  const getComplianceScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getViolationSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Compliance Dashboard</h1>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Generate Report</span>
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Compliance Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {complianceReports.length > 0 ? 
                  Math.round(complianceReports.reduce((acc, report) => acc + (report.compliance_score || 0), 0) / complianceReports.length) 
                  : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{complianceReports.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Risk Activities</p>
              <p className="text-2xl font-bold text-gray-900">{auditSummary.high_risk_activities || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Policies</p>
              <p className="text-2xl font-bold text-gray-900">
                {dataRetentionPolicies.filter(p => p.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reports'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Compliance Reports
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'audit'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Audit Trail
          </button>
          <button
            onClick={() => setActiveTab('policies')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'policies'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Data Retention
          </button>
        </nav>
      </div>

      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Compliance Reports */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Compliance Reports</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Report Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Violations
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Generated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {complianceReports.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        No compliance reports found. Generate your first report to get started.
                      </td>
                    </tr>
                  ) : (
                    complianceReports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {report.report_type.replace('_', ' ').toUpperCase()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(report.report_period_start).toLocaleDateString()} - {new Date(report.report_period_end).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getComplianceScoreColor(report.compliance_score)}`}>
                            {report.compliance_score}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-1">
                            {report.violations.map((violation, index) => (
                              <span
                                key={index}
                                className={`px-2 py-1 text-xs rounded-full ${getViolationSeverityColor(violation.severity)}`}
                              >
                                {violation.severity}
                              </span>
                            ))}
                            {report.violations.length === 0 && (
                              <span className="text-sm text-green-600">None</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                            report.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            report.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(report.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-primary-600 hover:text-primary-900 mr-3">
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            <DownloadIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Violations */}
          {complianceReports.some(r => r.violations.length > 0) && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-orange-600" />
                  Recent Compliance Issues
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {complianceReports
                  .filter(r => r.violations.length > 0)
                  .slice(0, 3)
                  .map((report) => 
                    report.violations.map((violation, index) => (
                      <div key={`${report.id}-${index}`} className="border-l-4 border-orange-400 bg-orange-50 p-4">
                        <div className="flex items-start">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-orange-900">
                              {violation.type?.replace('_', ' ') || 'Compliance Issue'}
                            </h4>
                            <p className="text-sm text-orange-700 mt-1">
                              {violation.description}
                            </p>
                            <p className="text-sm text-orange-600 mt-2">
                              <strong>Recommendation:</strong> {violation.recommendation}
                            </p>
                            <div className="flex items-center mt-2 space-x-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${getViolationSeverityColor(violation.severity)}`}>
                                {violation.severity}
                              </span>
                              <span className="text-xs text-orange-600">
                                Report: {report.report_type.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="space-y-6">
          {/* Audit Summary */}
          {auditSummary && Object.keys(auditSummary).length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Audit Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Actions Breakdown</h4>
                  {auditSummary.actions_breakdown && Object.entries(auditSummary.actions_breakdown).map(([action, count]) => (
                    <div key={action} className="flex justify-between text-sm">
                      <span className="text-gray-600 capitalize">{action.replace('_', ' ')}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Resources Breakdown</h4>
                  {auditSummary.resources_breakdown && Object.entries(auditSummary.resources_breakdown).map(([resource, count]) => (
                    <div key={resource} className="flex justify-between text-sm">
                      <span className="text-gray-600 capitalize">{resource.replace('_', ' ')}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Admin Activity</h4>
                  {auditSummary.admin_activity && Object.entries(auditSummary.admin_activity).slice(0, 5).map(([admin, count]) => (
                    <div key={admin} className="flex justify-between text-sm">
                      <span className="text-gray-600">{admin}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recent Audit Logs */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Audit Activities</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {auditLogs.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  No audit logs found.
                </div>
              ) : (
                auditLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="px-6 py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`h-2 w-2 rounded-full ${getRiskColor(log.risk_level)}`}></span>
                          <h4 className="text-sm font-medium text-gray-900">
                            {log.admin_username} {log.action} {log.resource}
                          </h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            log.risk_level === 'high' ? 'bg-red-100 text-red-800' :
                            log.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {log.risk_level} risk
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Resource ID: {log.resource_id || 'N/A'}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>IP: {log.ip_address || 'Unknown'}</span>
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                          <span>Risk Score: {log.risk_score}/5</span>
                        </div>
                        {log.details && Object.keys(log.details).length > 0 && (
                          <div className="mt-2 text-xs text-gray-600">
                            <strong>Details:</strong> {JSON.stringify(log.details)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'policies' && (
        <div className="space-y-6">
          {/* Data Retention Policies */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Data Retention Policies</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Policy Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Data Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Retention Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Auto Delete
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Next Review
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dataRetentionPolicies.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        No data retention policies found.
                      </td>
                    </tr>
                  ) : (
                    dataRetentionPolicies.map((policy) => (
                      <tr key={policy.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{policy.policy_name}</div>
                          <div className="text-sm text-gray-500">{policy.legal_basis}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                          {policy.data_category.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {Math.round(policy.retention_period_days / 365)} years
                          {policy.archive_after_days && (
                            <div className="text-xs text-gray-400">
                              Archive after {Math.round(policy.archive_after_days / 365)} years
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {policy.auto_delete ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                          ) : (
                            <span className="text-gray-400">Manual</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                            policy.status === 'active' ? 'bg-green-100 text-green-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {policy.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(policy.next_review_date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Generate Compliance Report</h3>
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <form onSubmit={generateReport} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Report Type</label>
                  <select
                    value={newReport.report_type}
                    onChange={(e) => setNewReport({...newReport, report_type: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="audit_trail">Audit Trail</option>
                    <option value="kyc_compliance">KYC Compliance</option>
                    <option value="data_retention">Data Retention</option>
                    <option value="aml_report">AML Report</option>
                    <option value="gambling_activity">Gambling Activity</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input
                      type="date"
                      value={newReport.start_date}
                      onChange={(e) => setNewReport({...newReport, start_date: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input
                      type="date"
                      value={newReport.end_date}
                      onChange={(e) => setNewReport({...newReport, end_date: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowGenerateModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
                  >
                    Generate Report
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceDashboard;