import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle: string;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, title, value, subtitle }) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="text-2xl">{icon}</div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      
      <div className="text-3xl font-bold mb-2">{value}</div>
      <p className="text-gray-400 text-sm">{subtitle}</p>
    </div>
  );
};