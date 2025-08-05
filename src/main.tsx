import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { usePerformanceMetrics } from './hooks/usePerformanceMetrics';
import './styles/index.css';

// Component to initialize performance metrics
const AppWithMetrics: React.FC = () => {
  usePerformanceMetrics();
  return <App />;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppWithMetrics />
  </React.StrictMode>
);