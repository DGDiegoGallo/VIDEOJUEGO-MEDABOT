import { useState, useEffect } from 'react';
import { apiClient } from '@/utils/api';
import type { GameSession, TotalStats } from '@/types/gameSession';

export const useGameSessionData = (userId: number) => {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [totalStats, setTotalStats] = useState<TotalStats>({
    totalPlayTime: 0,
    totalEnemiesDefeated: 0,
    bestScore: 0,
    totalSessions: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching sessions for user ID:', userId);
      
      // Intentar obtener sesiones de juego con sintaxis correcta para Strapi v4
      const response = await apiClient.get(
        `/game-sessions?filters[users_permissions_user]=${userId}&populate=*`
      );
      
      console.log('📡 Raw API response:', response);
      console.log('📡 Response data:', (response as any).data);
      console.log('📡 Response data.data:', (response as any).data?.data);
      
      // Procesar la respuesta según la estructura real de Strapi
      // Los datos están directamente en response.data, no en response.data.data
      const rawData = (response as any).data || [];
      console.log('📡 Raw data array:', rawData);
      
      const sessionData = rawData.map((item: any) => {
        // Si el item tiene attributes, usarlos, sino usar el item directamente
        const sessionItem = item.attributes ? {
          id: item.id,
          documentId: item.documentId,
          ...item.attributes
        } : {
          ...item
        };
        
        console.log('🎮 Processing session item:', sessionItem);
        console.log('🎮 Session equipped_items:', sessionItem.equipped_items);
        console.log('🎮 Session user_nfts:', sessionItem.user_nfts);
        
        return sessionItem;
      });
      
      console.log('🎮 Final processed session data:', sessionData);
      console.log('🎮 First session equipped_items:', sessionData[0]?.equipped_items);
      console.log('🎮 First session user_nfts:', sessionData[0]?.user_nfts);
      
      setSessions(sessionData);
      
      // Calcular estadísticas totales
      const stats = sessionData.reduce((acc: TotalStats, session: GameSession) => {
        acc.totalPlayTime += session.duration_seconds || 0;
        acc.totalEnemiesDefeated += session.session_stats?.enemies_defeated || 0;
        acc.bestScore = Math.max(acc.bestScore, session.final_score || 0);
        acc.totalSessions += 1;
        return acc;
      }, {
        totalPlayTime: 0,
        totalEnemiesDefeated: 0,
        bestScore: 0,
        totalSessions: 0
      });
      
      setTotalStats(stats);
      
    } catch (err: any) {
      console.error('Error fetching sessions:', err);
      
      // Si es error 404, significa que la colección no existe aún
      if (err.response?.status === 404) {
        setError('La colección "game-sessions" no existe en Strapi. Créala primero en el Content-Type Builder.');
        setSessions([]);
        setTotalStats({
          totalPlayTime: 0,
          totalEnemiesDefeated: 0,
          bestScore: 0,
          totalSessions: 0
        });
      } else if (err.response?.status === 400) {
        setError('Error de consulta. Verifica que la colección "game-sessions" esté creada correctamente en Strapi.');
        setSessions([]);
        setTotalStats({
          totalPlayTime: 0,
          totalEnemiesDefeated: 0,
          bestScore: 0,
          totalSessions: 0
        });
      } else {
        setError(err.response?.data?.error?.message || 'Error al cargar las sesiones');
      }
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (sessionData: any) => {
    try {
      const response = await apiClient.create('/game-sessions', {
        users_permissions_user: userId,
        ...sessionData
      });
      
      const newSession = {
        id: (response as any).data?.id,
        documentId: (response as any).documentId,
        ...(response as any).attributes
      };
      
      setSessions(prev => [newSession, ...prev]);
      return newSession;
      
    } catch (err: any) {
      console.error('Error creating session:', err);
      throw new Error(err.response?.data?.error?.message || 'Error al crear la sesión');
    }
  };

  const updateSession = async (sessionId: string, updateData: any) => {
    try {
      const response = await apiClient.update('/game-sessions', sessionId, updateData);
      
      const updatedSession = {
        id: (response as any).data?.id,
        documentId: (response as any).documentId,
        ...(response as any).attributes
      };
      
      setSessions(prev => prev.map(session => 
        session.documentId === sessionId ? updatedSession : session
      ));
      
      return updatedSession;
      
    } catch (err: any) {
      console.error('Error updating session:', err);
      throw new Error(err.response?.data?.error?.message || 'Error al actualizar la sesión');
    }
  };

  const refreshData = () => {
    fetchSessions();
  };

  useEffect(() => {
    if (userId) {
      fetchSessions();
    }
  }, [userId]);

  return {
    sessions,
    totalStats,
    loading,
    error,
    createSession,
    updateSession,
    refreshData
  };
};