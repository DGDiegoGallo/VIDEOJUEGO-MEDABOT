import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { AdminService } from '@/services/adminService';
import type { AdminDashboardData, AdminUserData, AdminGameSessionData } from '@/types/admin';

interface AdminState {
  dashboardData: AdminDashboardData | null;
  users: AdminUserData[];
  gameSessions: AdminGameSessionData[];
  isLoading: boolean;
  error: string | null;
  selectedUser: AdminUserData | null;
  filters: {
    dateRange: string;
    status: string;
  };
}

interface AdminActions {
  loadDashboardData: () => Promise<void>;
  loadUsers: () => Promise<void>;
  loadGameSessions: () => Promise<void>;
  setSelectedUser: (user: AdminUserData | null) => void;
  setFilters: (filters: Partial<AdminState['filters']>) => void;
  clearError: () => void;
  exportToPDF: () => Promise<void>;
  collectAndSaveMetrics: () => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

export const useAdminStore = create<AdminState & AdminActions>()(
  immer((set, get) => ({
    // State
    dashboardData: null,
    users: [],
    gameSessions: [],
    isLoading: false,
    error: null,
    selectedUser: null,
    filters: {
      dateRange: 'all',
      status: 'all'
    },

    // Actions
    loadDashboardData: async () => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const data = await AdminService.getDashboardData();
        set((state) => {
          state.dashboardData = data;
          state.users = data.users;
          state.gameSessions = data.gameSessions;
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Error loading dashboard data';
          state.isLoading = false;
        });
      }
    },

    loadUsers: async () => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const users = await AdminService.getAllUsers();
        set((state) => {
          state.users = users;
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Error loading users';
          state.isLoading = false;
        });
      }
    },

    loadGameSessions: async () => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const sessions = await AdminService.getAllGameSessions();
        set((state) => {
          state.gameSessions = sessions;
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Error loading game sessions';
          state.isLoading = false;
        });
      }
    },

    setSelectedUser: (user: AdminUserData | null) => {
      set((state) => {
        state.selectedUser = user;
      });
    },

    setFilters: (filters: Partial<AdminState['filters']>) => {
      set((state) => {
        state.filters = { ...state.filters, ...filters };
      });
    },

    clearError: () => {
      set((state) => {
        state.error = null;
      });
    },

    exportToPDF: async () => {
      try {
        const { jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');
        
        const doc = new jsPDF();
        const { users, gameSessions, dashboardData } = get();

        // Title
        doc.setFontSize(20);
        doc.text('Dashboard de Administración', 20, 20);
        
        // Summary
        doc.setFontSize(12);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 35);
        doc.text(`Total de Usuarios: ${dashboardData?.totalUsers || 0}`, 20, 45);
        doc.text(`Total de Sesiones: ${dashboardData?.totalSessions || 0}`, 20, 55);
        doc.text(`Usuarios Activos: ${dashboardData?.activeUsers || 0}`, 20, 65);

        // Users table
        const userTableData = users.map(user => [
          user.username,
          user.email,
          user.nombre || 'N/A',
          user.apellido || 'N/A',
          user.rol || 'N/A',
          user.totalSessions.toString(),
          user.level.toString(),
          user.experience.toString()
        ]);

        autoTable(doc, {
          head: [['Usuario', 'Email', 'Nombre', 'Apellido', 'Rol', 'Sesiones', 'Nivel', 'Experiencia']],
          body: userTableData,
          startY: 80,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [41, 128, 185] }
        });

        // Game sessions table (on new page if needed)
        const finalY = (doc as any).lastAutoTable.finalY || 80;
        if (finalY > 200) {
          doc.addPage();
        }

        const sessionTableData = gameSessions.slice(0, 50).map(session => [
          session.username,
          new Date(session.startTime).toLocaleDateString(),
          session.duration.toString(),
          session.score.toString(),
          session.level.toString(),
          session.status
        ]);

        autoTable(doc, {
          head: [['Usuario', 'Fecha', 'Duración (min)', 'Puntuación', 'Nivel', 'Estado']],
          body: sessionTableData,
          startY: finalY > 200 ? 20 : finalY + 20,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [231, 76, 60] }
        });

        // Save PDF
        doc.save(`dashboard-admin-${new Date().toISOString().split('T')[0]}.pdf`);
      } catch (error) {
        set((state) => {
          state.error = 'Error generando PDF: ' + (error instanceof Error ? error.message : 'Error desconocido');
        });
      }
    },

    collectAndSaveMetrics: async () => {
      try {
        const metrics = await AdminService.collectWebVitals();
        await AdminService.saveMetrics(metrics);
      } catch (error) {
        console.error('Error collecting metrics:', error);
      }
    },

    deleteUser: async (userId: string) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        await AdminService.deleteUser(userId);
        
        // Remove user from local state
        set((state) => {
          state.users = state.users.filter(user => user.id !== userId);
          state.dashboardData = state.dashboardData ? {
            ...state.dashboardData,
            users: state.users,
            totalUsers: state.users.length
          } : null;
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Error eliminando usuario';
          state.isLoading = false;
        });
      }
    }
  }))
);