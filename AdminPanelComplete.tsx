/**
 * ADMIN PANEL COMPLETO - COMPONENTE REUTILIZABLE
 * 
 * DOCUMENTACIÓN:
 * ==============
 * 
 * Este componente proporciona un panel de administración completo con:
 * - Dashboard con métricas y gráficos
 * - Gestión de usuarios (ver, eliminar, bloquear)
 * - Generación de reportes PDF
 * - Navegación por pestañas
 * - Interfaz responsiva
 * 
 * INSTALACIÓN DE DEPENDENCIAS:
 * npm install react-icons jspdf html2canvas chart.js react-chartjs-2
 * 
 * USO:
 * <AdminPanel 
 *   apiBaseUrl="http://localhost:3000/api"
 *   currentUser={{ name: "Admin", role: "admin" }}
 *   onLogout={() => console.log("Logout")}
 * />
 * 
 * PERSONALIZACIÓN:
 * - Cambia las rutas de API en API_ENDPOINTS
 * - Modifica los colores en THEME
 * - Adapta los roles permitidos en ADMIN_ROLES
 * - Personaliza las métricas en el dashboard
 */

import React, { useState, useEffect } from 'react';
import { 
  FaUsers, FaChartBar, FaDownload, FaCog, FaEye, FaTrash, 
  FaLock, FaLockOpen, FaUserCog, FaTimes, FaSpinner,
  FaFileAlt, FaBuilding, FaEnvelope 
} from 'react-icons/fa';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

// ==================== CONFIGURACIÓN ====================

const ADMIN_ROLES = ['admin', 'superadmin', 'administrator'];

const API_ENDPOINTS = {
  users: '/users',
  companies: '/companies',
  messages: '/messages',
  metrics: '/metrics'
};

const THEME = {
  primary: '#4A6FDC',
  secondary: '#F44123',
  success: '#2DA771',
  warning: '#E9B949',
  light: '#EBEBEB',
  dark: '#484847',
  muted: '#767179'
};

// ==================== TIPOS ====================

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  blocked: boolean;
  createdAt: string;
  company?: string;
}

interface Company {
  id: number;
  name: string;
  sector: string;
  email: string;
  usersCount: number;
  createdAt: string;
}

interface SystemMetrics {
  totalUsers: number;
  totalCompanies: number;
  totalMessages: number;
  activeUsers: number;
}

interface AdminPanelProps {
  apiBaseUrl: string;
  currentUser: { name: string; role: string };
  onLogout: () => void;
}

// ==================== COMPONENTE PRINCIPAL ====================

const AdminPanel: React.FC<AdminPanelProps> = ({ apiBaseUrl, currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'companies'>('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalUsers: 0,
    totalCompanies: 0,
    totalMessages: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // ==================== SERVICIOS API ====================

  const apiCall = async (endpoint: string, options?: RequestInit) => {
    const response = await fetch(`${apiBaseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        ...options?.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  };

  const fetchUsers = async () => {
    try {
      const data = await apiCall(API_ENDPOINTS.users);
      // Adaptable a diferentes estructuras de respuesta
      const usersList = Array.isArray(data) ? data : data.data || data.users || [];
      setUsers(usersList.map((user: any) => ({
        id: user.id,
        name: user.name || user.username || `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        role: user.role || user.rol || 'user',
        blocked: user.blocked || false,
        createdAt: user.createdAt || new Date().toISOString(),
        company: user.company?.name || user.companyName
      })));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const data = await apiCall(API_ENDPOINTS.companies);
      const companiesList = Array.isArray(data) ? data : data.data || data.companies || [];
      setCompanies(companiesList.map((company: any) => ({
        id: company.id,
        name: company.name,
        sector: company.sector || 'No especificado',
        email: company.email || 'No especificado',
        usersCount: company.usersCount || company.users?.length || 0,
        createdAt: company.createdAt || new Date().toISOString()
      })));
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchCompanies()]);

      // Calcular métricas basadas en los datos obtenidos
      const messagesData = await apiCall(API_ENDPOINTS.messages).catch(() => ({ data: [] }));
      const messagesList = Array.isArray(messagesData) ? messagesData : messagesData.data || [];

      setMetrics({
        totalUsers: users.length,
        totalCompanies: companies.length,
        totalMessages: messagesList.length,
        activeUsers: users.filter(u => !u.blocked).length
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: number) => {
    try {
      await apiCall(`${API_ENDPOINTS.users}/${userId}`, { method: 'DELETE' });
      setUsers(users.filter(u => u.id !== userId));
      alert('Usuario eliminado correctamente');
    } catch (error) {
      alert('Error al eliminar usuario');
      console.error(error);
    }
  };

  const toggleUserBlock = async (userId: number) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      await apiCall(`${API_ENDPOINTS.users}/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ blocked: !user.blocked })
      });

      setUsers(users.map(u => 
        u.id === userId ? { ...u, blocked: !u.blocked } : u
      ));
      alert(`Usuario ${user.blocked ? 'desbloqueado' : 'bloqueado'} correctamente`);
    } catch (error) {
      alert('Error al actualizar usuario');
      console.error(error);
    }
  };

  // ==================== GENERACIÓN DE REPORTES ====================

  const generatePDFReport = async () => {
    try {
      const doc = new jsPDF();
      const margin = 20;
      let y = margin;

      // Título
      doc.setFontSize(20);
      doc.text('Reporte del Sistema de Administración', margin, y);
      y += 20;

      // Fecha
      doc.setFontSize(12);
      doc.text(`Generado el: ${new Date().toLocaleString()}`, margin, y);
      y += 15;

      // Métricas generales
      doc.setFontSize(14);
      doc.text('Métricas Generales:', margin, y);
      y += 10;

      const metricsText = [
        `• Total de usuarios: ${metrics.totalUsers}`,
        `• Usuarios activos: ${metrics.activeUsers}`,
        `• Total de empresas: ${metrics.totalCompanies}`,
        `• Total de mensajes: ${metrics.totalMessages}`
      ];

      metricsText.forEach(text => {
        doc.setFontSize(11);
        doc.text(text, margin + 5, y);
        y += 8;
      });

      y += 10;

      // Lista de usuarios
      doc.setFontSize(14);
      doc.text('Usuarios del Sistema:', margin, y);
      y += 10;

      users.slice(0, 20).forEach(user => { // Limitar a 20 usuarios para el PDF
        if (y > 250) {
          doc.addPage();
          y = margin;
        }
        doc.setFontSize(10);
        doc.text(`• ${user.name} (${user.email}) - ${user.role}${user.blocked ? ' [BLOQUEADO]' : ''}`, margin + 5, y);
        y += 8;
      });

      // Gráfico (si existe)
      const chartElement = document.getElementById('admin-chart');
      if (chartElement) {
        try {
          doc.addPage();
          const canvas = await html2canvas(chartElement);
          const imgData = canvas.toDataURL('image/png');
          doc.addImage(imgData, 'PNG', margin, margin, 170, 100);
        } catch (error) {
          console.error('Error adding chart to PDF:', error);
        }
      }

      doc.save(`reporte-admin-${new Date().toISOString().split('T')[0]}.pdf`);
      alert('Reporte PDF generado correctamente');
    } catch (error) {
      alert('Error al generar el reporte PDF');
      console.error(error);
    }
  };

  // ==================== EFECTOS ====================

  useEffect(() => {
    if (!ADMIN_ROLES.includes(currentUser.role.toLowerCase())) {
      alert('No tienes permisos de administrador');
      return;
    }
    fetchMetrics();
  }, []);

  useEffect(() => {
    setMetrics(prev => ({
      ...prev,
      totalUsers: users.length,
      activeUsers: users.filter(u => !u.blocked).length
    }));
  }, [users]);

  useEffect(() => {
    setMetrics(prev => ({
      ...prev,
      totalCompanies: companies.length
    }));
  }, [companies]);

  // ==================== COMPONENTES UI ====================

  const MetricCard = ({ title, value, icon, color }: any) => (
    <div className="metric-card" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="metric-icon" style={{ color }}>
        {icon}
      </div>
      <div className="metric-content">
        <h3>{value}</h3>
        <p>{title}</p>
      </div>
    </div>
  );

  const UserModal = ({ user, onClose }: { user: User; onClose: () => void }) => (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Detalles del Usuario</h3>
          <button onClick={onClose} className="close-btn">
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <div className="user-detail">
            <strong>ID:</strong> {user.id}
          </div>
          <div className="user-detail">
            <strong>Nombre:</strong> {user.name}
          </div>
          <div className="user-detail">
            <strong>Email:</strong> {user.email}
          </div>
          <div className="user-detail">
            <strong>Rol:</strong> {user.role}
          </div>
          <div className="user-detail">
            <strong>Estado:</strong> {user.blocked ? 'Bloqueado' : 'Activo'}
          </div>
          <div className="user-detail">
            <strong>Empresa:</strong> {user.company || 'No asignada'}
          </div>
          <div className="user-detail">
            <strong>Creado:</strong> {new Date(user.createdAt).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );

  // ==================== DATOS PARA GRÁFICOS ====================

  const chartData = {
    labels: ['Usuarios Totales', 'Usuarios Activos', 'Empresas', 'Mensajes'],
    datasets: [
      {
        label: 'Estadísticas del Sistema',
        data: [metrics.totalUsers, metrics.activeUsers, metrics.totalCompanies, metrics.totalMessages],
        backgroundColor: [THEME.primary, THEME.success, THEME.secondary, THEME.warning],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Resumen General del Sistema',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // ==================== RENDER ====================

  return (
    <div className="admin-panel">
      {/* Header */}
      <header className="admin-header">
        <div className="header-content">
          <h1>Panel de Administración</h1>
          <div className="header-actions">
            <span>Bienvenido, {currentUser.name}</span>
            <button onClick={onLogout} className="logout-btn">
              Cerrar Sesión
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <nav className="admin-tabs">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            <FaChartBar /> Dashboard
          </button>
          <button 
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            <FaUsers /> Usuarios
          </button>
          <button 
            className={activeTab === 'companies' ? 'active' : ''}
            onClick={() => setActiveTab('companies')}
          >
            <FaBuilding /> Empresas
          </button>
        </nav>
      </header>

      {/* Content */}
      <main className="admin-content">
        {loading && (
          <div className="loading-overlay">
            <FaSpinner className="spinner" />
            <p>Cargando...</p>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="dashboard">
            <div className="dashboard-header">
              <h2>Resumen General</h2>
              <button onClick={generatePDFReport} className="pdf-btn">
                <FaDownload /> Generar Reporte PDF
              </button>
            </div>

            {/* Metric Cards */}
            <div className="metrics-grid">
              <MetricCard
                title="Total Usuarios"
                value={metrics.totalUsers}
                icon={<FaUsers size={24} />}
                color={THEME.primary}
              />
              <MetricCard
                title="Usuarios Activos"
                value={metrics.activeUsers}
                icon={<FaUserCog size={24} />}
                color={THEME.success}
              />
              <MetricCard
                title="Total Empresas"
                value={metrics.totalCompanies}
                icon={<FaBuilding size={24} />}
                color={THEME.secondary}
              />
              <MetricCard
                title="Total Mensajes"
                value={metrics.totalMessages}
                icon={<FaEnvelope size={24} />}
                color={THEME.warning}
              />
            </div>

            {/* Chart */}
            <div className="chart-container">
              <div id="admin-chart">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="users">
            <div className="section-header">
              <h2>Gestión de Usuarios ({users.length})</h2>
              <button onClick={fetchUsers} className="refresh-btn">
                Actualizar
              </button>
            </div>

            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Empresa</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge role-${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${user.blocked ? 'blocked' : 'active'}`}>
                          {user.blocked ? 'Bloqueado' : 'Activo'}
                        </span>
                      </td>
                      <td>{user.company || '—'}</td>
                      <td className="actions">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="action-btn view"
                          title="Ver detalles"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => toggleUserBlock(user.id)}
                          className={`action-btn ${user.blocked ? 'unlock' : 'lock'}`}
                          title={user.blocked ? 'Desbloquear' : 'Bloquear'}
                        >
                          {user.blocked ? <FaLockOpen /> : <FaLock />}
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Eliminar usuario ${user.name}?`)) {
                              deleteUser(user.id);
                            }
                          }}
                          className="action-btn delete"
                          title="Eliminar"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Companies Tab */}
        {activeTab === 'companies' && (
          <div className="companies">
            <div className="section-header">
              <h2>Gestión de Empresas ({companies.length})</h2>
              <button onClick={fetchCompanies} className="refresh-btn">
                Actualizar
              </button>
            </div>

            <div className="companies-grid">
              {companies.map(company => (
                <div key={company.id} className="company-card">
                  <h3>{company.name}</h3>
                  <p><strong>Sector:</strong> {company.sector}</p>
                  <p><strong>Email:</strong> {company.email}</p>
                  <p><strong>Usuarios:</strong> {company.usersCount}</p>
                  <p><strong>Creada:</strong> {new Date(company.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* User Modal */}
      {selectedUser && (
        <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}

      {/* Styles */}
      <style jsx>{`
        .admin-panel {
          min-height: 100vh;
          background-color: #f8f9fa;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .admin-header {
          background: white;
          border-bottom: 1px solid #e9ecef;
          padding: 0;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
        }

        .header-content h1 {
          margin: 0;
          color: #333;
          font-size: 1.5rem;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .logout-btn {
          background: ${THEME.secondary};
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .logout-btn:hover {
          background: #d63384;
        }

        .admin-tabs {
          display: flex;
          padding: 0 2rem;
          background: #f8f9fa;
          border-top: 1px solid #e9ecef;
        }

        .admin-tabs button {
          background: none;
          border: none;
          padding: 1rem 1.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #666;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
        }

        .admin-tabs button:hover {
          color: ${THEME.primary};
        }

        .admin-tabs button.active {
          color: ${THEME.primary};
          border-bottom-color: ${THEME.primary};
          background: white;
        }

        .admin-content {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          z-index: 1000;
        }

        .spinner {
          animation: spin 1s linear infinite;
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .dashboard-header, .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .dashboard-header h2, .section-header h2 {
          margin: 0;
          color: #333;
        }

        .pdf-btn, .refresh-btn {
          background: ${THEME.primary};
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .pdf-btn:hover, .refresh-btn:hover {
          background: #3854c7;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .metric-card {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .metric-icon {
          font-size: 2rem;
        }

        .metric-content h3 {
          margin: 0;
          font-size: 2rem;
          color: #333;
        }

        .metric-content p {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }

        .chart-container {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          height: 400px;
        }

        .users-table {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .users-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .users-table th {
          background: #f8f9fa;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #333;
          border-bottom: 1px solid #e9ecef;
        }

        .users-table td {
          padding: 1rem;
          border-bottom: 1px solid #e9ecef;
          vertical-align: middle;
        }

        .users-table tr:hover {
          background: #f8f9fa;
        }

        .role-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .role-admin { background: #e3f2fd; color: #1976d2; }
        .role-user { background: #f3e5f5; color: #7b1fa2; }
        .role-agent { background: #e8f5e8; color: #388e3c; }

        .status-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .status-badge.active {
          background: #e8f5e8;
          color: #388e3c;
        }

        .status-badge.blocked {
          background: #ffebee;
          color: #d32f2f;
        }

        .actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          background: none;
          border: 1px solid #ddd;
          padding: 0.5rem;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
        }

        .action-btn:hover {
          background: #f8f9fa;
        }

        .action-btn.view { color: ${THEME.primary}; }
        .action-btn.lock { color: ${THEME.warning}; }
        .action-btn.unlock { color: ${THEME.success}; }
        .action-btn.delete { color: ${THEME.secondary}; }

        .companies-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .company-card {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .company-card h3 {
          margin: 0 0 1rem 0;
          color: #333;
        }

        .company-card p {
          margin: 0.5rem 0;
          color: #666;
          font-size: 0.9rem;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e9ecef;
        }

        .modal-header h3 {
          margin: 0;
          color: #333;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          color: #666;
          padding: 0.5rem;
        }

        .close-btn:hover {
          color: #333;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .user-detail {
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #f0f0f0;
        }

        .user-detail:last-child {
          border-bottom: none;
        }

        .user-detail strong {
          color: #333;
          margin-right: 0.5rem;
        }

        @media (max-width: 768px) {
          .admin-content {
            padding: 1rem;
          }

          .header-content {
            padding: 1rem;
            flex-direction: column;
            gap: 1rem;
          }

          .admin-tabs {
            padding: 0 1rem;
            overflow-x: auto;
          }

          .dashboard-header, .section-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .users-table {
            overflow-x: auto;
          }

          .companies-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;

/**
 * EJEMPLO DE USO:
 * 
 * import AdminPanel from './AdminPanelComplete';
 * 
 * function App() {
 *   const handleLogout = () => {
 *     localStorage.removeItem('authToken');
 *     window.location.href = '/login';
 *   };
 * 
 *   return (
 *     <AdminPanel
 *       apiBaseUrl="https://tu-api.com/api"
 *       currentUser={{ name: "Juan Pérez", role: "admin" }}
 *       onLogout={handleLogout}
 *     />
 *   );
 * }
 * 
 * PERSONALIZACIÓN RÁPIDA:
 * 
 * 1. Cambiar colores: Modifica el objeto THEME
 * 2. Cambiar endpoints: Modifica API_ENDPOINTS
 * 3. Agregar campos: Extiende las interfaces User/Company
 * 4. Nuevas métricas: Agrega cards en MetricCard
 * 5. Más pestañas: Añade botones en admin-tabs y contenido
 * 
 * ESTRUCTURA DE DATOS ESPERADA:
 * 
 * Users API Response:
 * {
 *   "data": [
 *     {
 *       "id": 1,
 *       "name": "Juan Pérez",
 *       "email": "juan@example.com",
 *       "role": "admin",
 *       "blocked": false,
 *       "createdAt": "2024-01-01T00:00:00Z",
 *       "company": { "name": "Mi Empresa" }
 *     }
 *   ]
 * }
 */ 