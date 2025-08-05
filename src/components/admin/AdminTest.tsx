import React, { useState } from 'react';
import { AdminService } from '@/services/adminService';

export const AdminTest: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testMetrics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🧪 Testing web vitals collection...');
      const webVitals = await AdminService.collectWebVitals();
      console.log('✅ Web vitals collected:', webVitals);
      
      console.log('💾 Testing metrics save...');
      await AdminService.saveMetrics(webVitals);
      console.log('✅ Metrics saved successfully');
      
      setMetrics(webVitals);
    } catch (err) {
      console.error('❌ Test failed:', err);
      setError(err instanceof Error ? err.message : 'Test failed');
    } finally {
      setLoading(false);
    }
  };

  const testDashboard = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📊 Testing dashboard data...');
      const dashboardData = await AdminService.getDashboardData();
      console.log('✅ Dashboard data loaded:', dashboardData);
      
      setMetrics(dashboardData);
    } catch (err) {
      console.error('❌ Dashboard test failed:', err);
      setError(err instanceof Error ? err.message : 'Dashboard test failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Admin System Test</h3>
      
      <div className="space-y-4">
        <div className="flex space-x-4">
          <button
            onClick={testMetrics}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Web Vitals'}
          </button>
          
          <button
            onClick={testDashboard}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Dashboard'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {metrics && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Test Results:</h4>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(metrics, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};