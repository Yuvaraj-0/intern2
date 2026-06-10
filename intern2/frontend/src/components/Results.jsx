import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { AlertTriangle, DollarSign, TrendingUp, Shield, FileText } from 'lucide-react';

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#6B7280'];

function Results({ job }) {
  if (!job) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <FileText className="w-16 h-16 mx-auto text-gray-300 mb-3" />
        <h3 className="text-lg font-medium text-gray-600">No Job Selected</h3>
        <p className="text-gray-400 text-sm mt-1">Select a job from the list to view results</p>
      </div>
    );
  }

  if (job.status !== 'completed') {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full mb-3"></div>
          <h3 className="text-lg font-medium text-gray-600">Processing...</h3>
          <p className="text-gray-400 text-sm mt-1">Job #{job.job_id} is {job.status}</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const categoryData = Object.entries(job.category_breakdown || {}).map(([name, value]) => ({ name, value }));
  const anomalyData = [
    { name: 'Normal', value: job.total_transactions - job.anomaly_count },
    { name: 'Anomalies', value: job.anomaly_count }
  ];

  const riskColors = {
    low: 'text-green-600 bg-green-100',
    medium: 'text-yellow-600 bg-yellow-100',
    high: 'text-red-600 bg-red-100'
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Summary</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-xs text-gray-500">Total Spend</span>
            </div>
            <p className="text-xl font-bold mt-1">
              ₹{job.total_spend_inr?.toLocaleString() || 0}
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-xs text-gray-500">Anomalies</span>
            </div>
            <p className="text-xl font-bold mt-1">{job.anomaly_count || 0}</p>
          </div>
        </div>
        
        {/* Risk Level */}
        <div className={`rounded-lg p-3 mb-4 ${riskColors[job.llm_narrative?.risk_level] || 'bg-gray-100'}`}>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span className="font-medium">Risk Level: {job.llm_narrative?.risk_level?.toUpperCase()}</span>
          </div>
        </div>
        
        {/* Narrative */}
        {job.llm_narrative?.narrative && (
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">AI Analysis</span>
            </div>
            <p className="text-sm text-blue-800">{job.llm_narrative.narrative}</p>
          </div>
        )}
      </div>
      
      {/* Category Breakdown Chart */}
      {categoryData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-md font-semibold mb-4">Spending by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      
      {/* Anomalies Pie Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-md font-semibold mb-4">Transaction Health</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={anomalyData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {anomalyData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? '#10B981' : '#EF4444'} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Anomalies List */}
      {job.flagged_anomalies && job.flagged_anomalies.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-md font-semibold mb-3 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span>Flagged Anomalies ({job.flagged_anomalies.length})</span>
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {job.flagged_anomalies.map((anomaly, idx) => (
              <div key={idx} className="bg-red-50 border border-red-200 rounded p-2 text-sm">
                <p className="font-medium text-red-800">{anomaly.merchant}</p>
                <p className="text-red-600 text-xs">Amount: ₹{anomaly.amount?.toLocaleString()}</p>
                <p className="text-red-500 text-xs">{anomaly.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Recent Transactions Table */}
      {job.cleaned_transactions && job.cleaned_transactions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-md font-semibold mb-3">Recent Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2">Merchant</th>
                  <th className="text-left p-2">Amount</th>
                  <th className="text-left p-2">Category</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {job.cleaned_transactions.slice(0, 10).map((tx, idx) => (
                  <tr key={idx} className="border-t border-gray-100">
                    <td className="p-2">{tx.merchant}</td>
                    <td className="p-2">₹{tx.amount?.toLocaleString()}</td>
                    <td className="p-2">
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                        {tx.category}
                      </span>
                    </td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        tx.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Results;
