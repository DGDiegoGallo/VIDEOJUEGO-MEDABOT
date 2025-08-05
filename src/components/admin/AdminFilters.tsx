import React from 'react';
import { useAdminStore } from '@/stores/adminStore';

export const AdminFilters: React.FC = () => {
  const { filters, setFilters } = useAdminStore();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date Range Filter */}
        <div>
          <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-2">
            Rango de Fechas
          </label>
          <select
            id="dateRange"
            value={filters.dateRange}
            onChange={(e) => setFilters({ dateRange: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas las fechas</option>
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="year">Este año</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Estado de Sesión
          </label>
          <select
            id="status"
            value={filters.status}
            onChange={(e) => setFilters({ status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activa</option>
            <option value="completed">Completada</option>
            <option value="abandoned">Abandonada</option>
          </select>
        </div>
      </div>
    </div>
  );
};