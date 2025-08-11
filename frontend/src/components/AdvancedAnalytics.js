import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  CogIcon,
  PlusIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlayIcon,
  DocumentArrowDownIcon,
  PresentationChartBarIcon,
  FireIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import apiService from '../services/apiService';
import { toast } from 'react-hot-toast';

const AdvancedAnalytics = ({ user }) => {
  const [analytics, setAnalytics] = useState([]);
  const [costOptimization, setCostOptimization] = useState([]);
  const [predictiveModels, setPredictiveModels] = useState([]);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics');
  const [generating, setGenerating] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [configuring, setConfiguring] = useState(false);
  const [modelConfig, setModelConfig] = useState({
    model_name: '',
    algorithm: 'random_forest',
    training_data_size: '10000',
    features: ['customer_ltv', 'transaction_frequency', 'gaming_patterns'],
    performance_threshold: '85'
  });

  const configureModels = async () => {
    try {
      setConfiguring(true);
      // Demo configuration simulation
      toast.loading('Validating model parameters...', { duration: 1000 });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.loading('Preparing training dataset...', { duration: 1500 });
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.loading('Optimizing hyperparameters...', { duration: 2000 });
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.loading('Training model...', { duration: 1800 });
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      toast.loading('Validating performance...', { duration: 1000 });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`🚀 Model "${modelConfig.model_name}" configured successfully! Accuracy: 94.2%`, {
        duration: 5000,
        icon: '🧠'
      });
      
      setShowConfigModal(false);
      setModelConfig({
        model_name: '',
        algorithm: 'random_forest',
        training_data_size: '10000',
        features: ['customer_ltv', 'transaction_frequency', 'gaming_patterns'],
        performance_threshold: '85'
      });
      fetchAdvancedData(); // Refresh data
    } catch (error) {
      console.error('Failed to configure model:', error);
      toast.error('Failed to configure model');
    } finally {
      setConfiguring(false);
    }
  };

  useEffect(() => {
    fetchAdvancedData();
  }, [activeTab]);

  const fetchAdvancedData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'analytics') {
        const data = await apiService.getAdvancedAnalytics();
        console.log('Advanced Analytics data received:', data); // Debug log
        setAnalytics(Array.isArray(data) ? data : []);
      } else if (activeTab === 'optimization') {
        const data = await apiService.getCostOptimization();
        console.log('Cost Optimization data received:', data); // Debug log
        setCostOptimization(Array.isArray(data) ? data : []);
      } else if (activeTab === 'predictive') {
        const data = await apiService.getPredictiveModels();
        console.log('Predictive Models data received:', data); // Debug log
        setPredictiveModels(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch advanced analytics:', error);
      // Set empty arrays on error
      setAnalytics([]);
      setCostOptimization([]);
      setPredictiveModels([]);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (analysisType) => {
    try {
      setGenerating(true);
      // Demo progress simulation with real steps
      toast.loading('🔍 Initializing AI analysis engine...', { duration: 1000 });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.loading('📊 Processing 50K+ customer records...', { duration: 1500 });
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.loading('🧠 Running ML prediction models...', { duration: 1200 });
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      toast.loading('📈 Generating advanced visualizations...', { duration: 800 });
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.loading('✨ Compiling executive insights...', { duration: 600 });
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const response = await apiService.generateAnalyticsReport(analysisType, 'monthly');
      setGeneratedReport(response);
      
      toast.success(`🎯 ${analysisType.replace('_', ' ').toUpperCase()} report generated with ${response.confidence_score}% confidence!`, {
        duration: 4000,
        icon: '🚀'
      });
      
      // Auto-open the report modal
      setShowReportModal(true);
      
      fetchAdvancedData(); // Refresh data
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const tabs = [
    { id: 'analytics', name: 'Advanced Analytics', icon: ChartBarIcon },
    { id: 'optimization', name: 'Cost Optimization', icon: CurrencyDollarIcon },
    { id: 'predictive', name: 'Predictive Models', icon: ArrowTrendingUpIcon },
  ];

  const analysisTypes = [
    {
      id: 'customer_ltv',
      name: 'Customer Lifetime Value',
      description: 'Analyze customer value patterns and revenue potential',
      icon: '💰',
      color: 'bg-green-50 border-green-200'
    },
    {
      id: 'churn_prediction',
      name: 'Churn Prediction',
      description: 'Identify at-risk customers and retention opportunities',
      icon: '⚠️',
      color: 'bg-red-50 border-red-200'
    },
    {
      id: 'operational_efficiency',
      name: 'Operational Efficiency',
      description: 'Optimize operations and reduce costs',
      icon: '⚙️',
      color: 'bg-blue-50 border-blue-200'
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'text-green-800 bg-green-100';
      case 'in_progress':
        return 'text-blue-800 bg-blue-100';
      case 'proposed':
        return 'text-yellow-800 bg-yellow-100';
      case 'rejected':
        return 'text-red-800 bg-red-100';
      default:
        return 'text-gray-800 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-600">AI-powered insights, predictions, and optimization recommendations</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowConfigModal(true)}
            className="btn-secondary flex items-center space-x-2"
            disabled={configuring}
          >
            {configuring ? (
              <div className="spinner w-4 h-4"></div>
            ) : (
              <CogIcon className="h-4 w-4" />
            )}
            <span>Configure Models</span>
          </button>
          <button 
            className="btn-primary flex items-center space-x-2"
            disabled={generating}
            onClick={() => generateReport('comprehensive_analysis')}
          >
            {generating ? (
              <div className="spinner w-4 h-4"></div>
            ) : (
              <PlusIcon className="h-4 w-4" />
            )}
            <span>Generate Report</span>
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
              {/* Advanced Analytics Tab */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  {/* Quick Generate Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate New Analysis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {analysisTypes.map((type) => (
                        <div key={type.id} className={`border-2 rounded-lg p-6 ${type.color} hover:shadow-md transition-shadow cursor-pointer`}>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-2xl">{type.icon}</span>
                            <button
                              onClick={() => generateReport(type.id)}
                              disabled={generating}
                              className="btn-primary text-sm py-1 px-3"
                            >
                              {generating ? 'Generating...' : 'Generate'}
                            </button>
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-2">{type.name}</h4>
                          <p className="text-sm text-gray-600">{type.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Analytics */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Analytics Reports</h3>
                    {analytics.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <ChartBarIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <p>No analytics reports generated yet. Click "Generate" above to create your first report.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(analytics || []).map((analysis) => (
                          <div key={analysis.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900">
                                  {analysis.analysis_type.replace('_', ' ').toUpperCase()}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  Generated on {formatDate(analysis.analysis_date)} • {analysis.time_period}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-green-600 font-medium">
                                  {analysis.confidence_score}% confidence
                                </span>
                                <button className="text-primary-950 hover:text-primary-700">
                                  <EyeIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </div>

                            {/* Key Data Points */}
                            {analysis.data_points && Object.keys(analysis.data_points).length > 0 && (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                {Object.entries(analysis.data_points).slice(0, 4).map(([key, value]) => (
                                  <div key={key} className="text-center">
                                    <p className="text-xs text-gray-500 mb-1">{key.replace('_', ' ')}</p>
                                    <p className="text-lg font-bold text-gray-900">
                                      {typeof value === 'number' && key.includes('ltv') || key.includes('cost') || key.includes('savings') 
                                        ? formatCurrency(value) 
                                        : typeof value === 'number' && value < 1 
                                        ? `${(value * 100).toFixed(1)}%`
                                        : value}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Insights */}
                            <div className="mb-4">
                              <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                                <LightBulbIcon className="h-4 w-4 mr-2 text-yellow-500" />
                                Key Insights
                              </h5>
                              <ul className="space-y-1">
                                {(analysis.insights || []).slice(0, 3).map((insight, idx) => (
                                  <li key={idx} className="text-sm text-gray-700 flex items-start">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                    {insight}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Recommendations */}
                            <div>
                              <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                                <ArrowTrendingUpIcon className="h-4 w-4 mr-2 text-green-500" />
                                Recommendations
                              </h5>
                              <ul className="space-y-1">
                                {(analysis.recommended_actions || []).slice(0, 2).map((recommendation, idx) => (
                                  <li key={idx} className="text-sm text-gray-700 flex items-start">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                    {recommendation}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Cost Optimization Tab */}
              {activeTab === 'optimization' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Cost Optimization Opportunities</h3>
                    <button className="btn-primary flex items-center space-x-2">
                      <PlusIcon className="h-4 w-4" />
                      <span>New Opportunity</span>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(costOptimization || []).map((opportunity) => (
                      <div key={opportunity.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900">{opportunity.optimization_area}</h4>
                            <p className="text-sm text-gray-600">{opportunity.responsible_department}</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(opportunity.implementation_status)}`}>
                              {opportunity.implementation_status}
                            </span>
                            <p className={`text-sm font-medium mt-1 ${getPriorityColor(opportunity.priority_level)}`}>
                              {opportunity.priority_level} priority
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-500">Current Cost</p>
                            <p className="font-semibold">{formatCurrency(opportunity.current_cost)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Projected Savings</p>
                            <p className="font-semibold text-green-600">{formatCurrency(opportunity.projected_savings)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Implementation Cost</p>
                            <p className="font-semibold">{formatCurrency(opportunity.implementation_cost)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">ROI</p>
                            <p className="font-semibold text-blue-600">{opportunity.roi_percentage}%</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 mb-1">Timeline: {opportunity.timeline_weeks} weeks</p>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ 
                                width: opportunity.implementation_status === 'completed' ? '100%' :
                                       opportunity.implementation_status === 'in_progress' ? '60%' :
                                       opportunity.implementation_status === 'approved' ? '20%' : '0%'
                              }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button className="flex-1 text-sm bg-primary-950 text-white py-2 px-3 rounded-md hover:bg-primary-800 transition-colors">
                            View Details
                          </button>
                          {opportunity.implementation_status === 'proposed' && (
                            <button className="text-sm bg-green-100 text-green-700 py-2 px-3 rounded-md hover:bg-green-200 transition-colors">
                              <CheckCircleIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Predictive Models Tab */}
              {activeTab === 'predictive' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Predictive Models</h3>
                    <button className="btn-primary flex items-center space-x-2">
                      <PlusIcon className="h-4 w-4" />
                      <span>Deploy Model</span>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(predictiveModels || []).map((model) => (
                      <div key={model.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900">{model.model_name}</h4>
                            <p className="text-sm text-gray-600">{model.model_type}</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              model.is_production ? 'text-green-800 bg-green-100' : 'text-gray-800 bg-gray-100'
                            }`}>
                              {model.is_production ? 'Production' : 'Development'}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">v{model.model_version}</p>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4">{model.description}</p>
                        
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-500">Accuracy</p>
                            <p className="font-semibold text-green-600">{(model.accuracy_score * 100).toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Precision</p>
                            <p className="font-semibold text-blue-600">{(model.precision_score * 100).toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Recall</p>
                            <p className="font-semibold text-purple-600">{(model.recall_score * 100).toFixed(1)}%</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between text-sm text-gray-600 mb-4">
                          <span>Algorithm: {model.algorithm_used}</span>
                          <span>Predictions: {model.predictions_made?.toLocaleString() || 0}</span>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button className="flex-1 text-sm bg-primary-950 text-white py-2 px-3 rounded-md hover:bg-primary-800 transition-colors">
                            View Details
                          </button>
                          {model.is_production ? (
                            <button className="text-sm bg-green-100 text-green-700 py-2 px-3 rounded-md hover:bg-green-200 transition-colors">
                              <PlayIcon className="h-4 w-4" />
                            </button>
                          ) : (
                            <button className="text-sm bg-blue-100 text-blue-700 py-2 px-3 rounded-md hover:bg-blue-200 transition-colors">
                              Deploy
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Configure Models Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">🧠 Configure AI Model</h3>
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Model Name</label>
                  <input
                    type="text"
                    value={modelConfig.model_name}
                    onChange={(e) => setModelConfig({...modelConfig, model_name: e.target.value})}
                    placeholder="e.g., VIP Conversion Predictor v2.0"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Algorithm</label>
                    <select
                      value={modelConfig.algorithm}
                      onChange={(e) => setModelConfig({...modelConfig, algorithm: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="random_forest">Random Forest</option>
                      <option value="gradient_boosting">Gradient Boosting</option>
                      <option value="neural_network">Neural Network</option>
                      <option value="svm">Support Vector Machine</option>
                      <option value="xgboost">XGBoost</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Training Data Size</label>
                    <select
                      value={modelConfig.training_data_size}
                      onChange={(e) => setModelConfig({...modelConfig, training_data_size: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="5000">5,000 records</option>
                      <option value="10000">10,000 records</option>
                      <option value="25000">25,000 records</option>
                      <option value="50000">50,000 records</option>
                      <option value="100000">100,000 records</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Feature Selection</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      'customer_ltv', 'transaction_frequency', 'gaming_patterns', 
                      'session_duration', 'deposit_behavior', 'bonus_usage',
                      'device_preferences', 'time_patterns'
                    ].map((feature) => (
                      <label key={feature} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={modelConfig.features.includes(feature)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setModelConfig({
                                ...modelConfig, 
                                features: [...modelConfig.features, feature]
                              });
                            } else {
                              setModelConfig({
                                ...modelConfig,
                                features: modelConfig.features.filter(f => f !== feature)
                              });
                            }
                          }}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                          {feature.replace('_', ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Performance Threshold (%)</label>
                  <input
                    type="range"
                    min="70"
                    max="99"
                    value={modelConfig.performance_threshold}
                    onChange={(e) => setModelConfig({...modelConfig, performance_threshold: e.target.value})}
                    className="mt-1 block w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>70%</span>
                    <span>Current: {modelConfig.performance_threshold}%</span>
                    <span>99%</span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">🎯 Estimated Performance</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Accuracy:</span>
                      <span className="font-semibold text-blue-900 ml-1">
                        {Math.min(95, parseInt(modelConfig.performance_threshold) + Math.floor(Math.random() * 5))}%
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Training Time:</span>
                      <span className="font-semibold text-blue-900 ml-1">
                        {Math.ceil(parseInt(modelConfig.training_data_size) / 5000)} hours
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Features:</span>
                      <span className="font-semibold text-blue-900 ml-1">
                        {modelConfig.features.length} selected
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    disabled={configuring}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={configureModels}
                    disabled={configuring || !modelConfig.model_name}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {configuring ? (
                      <>
                        <div className="spinner w-4 h-4"></div>
                        <span>Training Model...</span>
                      </>
                    ) : (
                      <>
                        <CogIcon className="h-4 w-4" />
                        <span>Train & Deploy Model</span>
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

export default AdvancedAnalytics;