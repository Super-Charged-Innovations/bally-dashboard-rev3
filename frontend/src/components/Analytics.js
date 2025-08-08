import React from 'react';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  UsersIcon, 
  CurrencyDollarIcon 
} from '@heroicons/react/24/outline';

const Analytics = ({ user }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600">Comprehensive casino analytics and insights</p>
        </div>
        <button className="btn-primary">
          Generate Report
        </button>
      </div>

      {/* Coming Soon */}
      <div className="bg-white rounded-lg shadow-sm p-12">
        <div className="text-center">
          <ChartBarIcon className="h-24 w-24 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Advanced Analytics Coming Soon</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            We're working on comprehensive analytics features including revenue insights, 
            customer behavior analysis, predictive analytics, and detailed reporting capabilities.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-blue-50 rounded-lg p-6">
              <TrendingUpIcon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-blue-900 mb-2">Revenue Analytics</h3>
              <p className="text-sm text-blue-700">Track revenue trends, identify peak periods, and optimize pricing strategies.</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-6">
              <UsersIcon className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-green-900 mb-2">Customer Insights</h3>
              <p className="text-sm text-green-700">Analyze customer behavior, preferences, and lifetime value metrics.</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-6">
              <CurrencyDollarIcon className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-purple-900 mb-2">Performance Metrics</h3>
              <p className="text-sm text-purple-700">Monitor KPIs, operational efficiency, and business performance indicators.</p>
            </div>
          </div>
          
          <button className="mt-8 btn-primary">
            Request Early Access
          </button>
        </div>
      </div>
    </div>
  );
};

export default Analytics;