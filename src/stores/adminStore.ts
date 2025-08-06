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
  clearMetrics: () => Promise<void>;
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
        
        if (!dashboardData) {
          throw new Error('No hay datos disponibles para exportar');
        }

        const { analytics } = dashboardData;
        let yPosition = 20;

        // Title and Header
        doc.setFontSize(20);
        doc.setTextColor(44, 62, 80);
        doc.text('Reporte de Análisis de Juego', 20, yPosition);
        yPosition += 15;

        doc.setFontSize(12);
        doc.setTextColor(127, 140, 141);
        doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}`, 20, yPosition);
        yPosition += 20;

        // Executive Summary
        doc.setFontSize(16);
        doc.setTextColor(44, 62, 80);
        doc.text('Resumen Ejecutivo', 20, yPosition);
        yPosition += 10;

        doc.setFontSize(10);
        doc.setTextColor(52, 73, 94);
        const summaryData = [
          ['Total de Usuarios', dashboardData.totalUsers.toString()],
          ['Usuarios Activos (7 días)', dashboardData.activeUsers.toString()],
          ['Total de Sesiones', dashboardData.totalSessions.toString()],
          ['Enemigos Derrotados', analytics.combatStats.totalEnemiesDefeated.toLocaleString()],
          ['Precisión Promedio', `${analytics.combatStats.averageAccuracy.toFixed(1)}%`],
          ['Tasa de Victoria', `${analytics.survivalStats.winRate.toFixed(1)}%`],
          ['Tiempo Total de Juego', `${Math.round(analytics.survivalStats.totalSurvivalTime / 3600)} horas`]
        ];

        autoTable(doc, {
          body: summaryData,
          startY: yPosition,
          theme: 'grid',
          styles: { fontSize: 9, cellPadding: 3 },
          columnStyles: { 0: { fontStyle: 'bold', fillColor: [236, 240, 241] } },
          margin: { left: 20, right: 20 }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;

        // Combat Statistics
        doc.setFontSize(14);
        doc.setTextColor(44, 62, 80);
        doc.text('Estadísticas de Combate', 20, yPosition);
        yPosition += 10;

        const combatData = [
          ['Métrica', 'Valor', 'Descripción'],
          ['Zombies Eliminados', analytics.combatStats.zombiesKilled.toLocaleString(), 'Enemigos básicos derrotados'],
          ['Velocistas Eliminados', analytics.combatStats.dashersKilled.toLocaleString(), 'Enemigos rápidos derrotados'],
          ['Tanques Eliminados', analytics.combatStats.tanksKilled.toLocaleString(), 'Enemigos pesados derrotados'],
          ['Disparos Realizados', analytics.combatStats.totalShotsFired.toLocaleString(), 'Total de proyectiles disparados'],
          ['Disparos Certeros', analytics.combatStats.totalShotsHit.toLocaleString(), 'Proyectiles que impactaron'],
          ['Daño Total Infligido', analytics.combatStats.totalDamageDealt.toLocaleString(), 'Daño causado por jugadores'],
          ['Barriles Destruidos', analytics.combatStats.barrelsDestroyed.toLocaleString(), 'Objetos explosivos eliminados']
        ];

        autoTable(doc, {
          head: [combatData[0]],
          body: combatData.slice(1),
          startY: yPosition,
          theme: 'striped',
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [231, 76, 60], textColor: 255 },
          columnStyles: { 
            0: { fontStyle: 'bold' },
            1: { halign: 'right' },
            2: { fontSize: 7, textColor: [127, 140, 141] }
          },
          margin: { left: 20, right: 20 }
        });

        // New page for rankings
        doc.addPage();
        yPosition = 20;

        // Top Players
        doc.setFontSize(14);
        doc.setTextColor(44, 62, 80);
        doc.text('Top 10 Jugadores', 20, yPosition);
        yPosition += 10;

        const rankingData = analytics.playerRankings.slice(0, 10).map((player, index) => [
          `#${index + 1}`,
          player.username,
          player.totalScore.toLocaleString(),
          player.averageScore.toFixed(0),
          `${player.averageAccuracy.toFixed(1)}%`,
          `${player.winRate.toFixed(1)}%`,
          player.dailyQuestsCompleted.toString(),
          Math.round(player.activityScore).toString()
        ]);

        autoTable(doc, {
          head: [['Pos.', 'Usuario', 'Puntos Tot.', 'Prom.', 'Precisión', 'Victoria', 'Misiones', 'Act. Score']],
          body: rankingData,
          startY: yPosition,
          theme: 'striped',
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [241, 196, 15], textColor: [44, 62, 80] },
          columnStyles: {
            0: { halign: 'center', fontStyle: 'bold' },
            2: { halign: 'right' },
            3: { halign: 'right' },
            4: { halign: 'center' },
            5: { halign: 'center' },
            6: { halign: 'center' },
            7: { halign: 'right', fontStyle: 'bold' }
          },
          margin: { left: 20, right: 20 }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;

        // Materials Summary
        doc.setFontSize(14);
        doc.setTextColor(44, 62, 80);
        doc.text('Materiales Recolectados', 20, yPosition);
        yPosition += 10;

        const materialsData = [
          ['Tipo de Material', 'Cantidad Total', 'Porcentaje'],
          ['Acero', analytics.totalMaterials.steel.toLocaleString(), ''],
          ['Celdas de Energía', analytics.totalMaterials.energy_cells.toLocaleString(), ''],
          ['Medicina', analytics.totalMaterials.medicine.toLocaleString(), ''],
          ['Comida', analytics.totalMaterials.food.toLocaleString(), '']
        ];

        // Calculate percentages
        const totalMaterials = Object.values(analytics.totalMaterials).reduce((sum, val) => sum + val, 0);
        if (totalMaterials > 0) {
          materialsData[1][2] = `${((analytics.totalMaterials.steel / totalMaterials) * 100).toFixed(1)}%`;
          materialsData[2][2] = `${((analytics.totalMaterials.energy_cells / totalMaterials) * 100).toFixed(1)}%`;
          materialsData[3][2] = `${((analytics.totalMaterials.medicine / totalMaterials) * 100).toFixed(1)}%`;
          materialsData[4][2] = `${((analytics.totalMaterials.food / totalMaterials) * 100).toFixed(1)}%`;
        }

        autoTable(doc, {
          head: [materialsData[0]],
          body: materialsData.slice(1),
          startY: yPosition,
          theme: 'grid',
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: [46, 204, 113], textColor: 255 },
          columnStyles: { 
            1: { halign: 'right' },
            2: { halign: 'center' }
          },
          margin: { left: 20, right: 20 }
        });

        // Footer
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(127, 140, 141);
          doc.text(
            `Página ${i} de ${pageCount} - Reporte generado automáticamente`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
          );
        }

        // Save PDF
        const fileName = `reporte-juego-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
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

    clearMetrics: async () => {
      try {
        // Aquí iría la lógica para limpiar métricas del servidor
        // Por ahora solo simulamos la operación
        console.log('Clearing metrics...');
        // await AdminService.clearMetrics();
      } catch (error) {
        console.error('Error clearing metrics:', error);
        throw error;
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