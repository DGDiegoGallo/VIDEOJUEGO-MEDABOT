import { useEffect } from 'react';
import { AdminService } from '@/services/adminService';

export const usePerformanceMetrics = () => {
  useEffect(() => {
    // Collect and save metrics when the app loads
    const collectMetrics = async () => {
      try {
        const metrics = await AdminService.collectWebVitals();
        await AdminService.saveMetrics(metrics);
      } catch (error) {
        console.error('Error collecting performance metrics:', error);
      }
    };

    // Collect metrics after a short delay to ensure page is fully loaded
    const timer = setTimeout(collectMetrics, 2000);

    // Collect metrics when the page is about to unload
    const handleBeforeUnload = () => {
      collectMetrics();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
};