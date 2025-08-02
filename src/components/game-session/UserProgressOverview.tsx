import React, { useState, useEffect } from 'react';
import { FaTrophy, FaGamepad, FaClock, FaSkull } from 'react-icons/fa';
import { useGameSessionData } from '@/hooks/useGameSessionData';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { StatCard } from '@/components/ui/StatCard';
import { StrapiSetupGuide } from './StrapiSetupGuide';

interface UserProgressOverviewProps {
  userId: number;
}

export const UserProgressOverview: React.FC<UserProgressOverviewProps> = ({ userId }) => {
  const { 
    sessions, 
    totalStats, 
    loading, 
    error, 
    refreshData 
  } = useGameSessionData(userId);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    // Si el error es sobre la colección que no existe, mostrar guía de configuración
    if (error.includes('game-sessions') || error.includes('colección')) {
      return <StrapiSetupGuide />;
    }
    
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
        <h3 className="text-red-400 font-semibold mb-2">Error al cargar datos</h3>
        <p className="text-red-300 mb-4">{error}</p>
        <button
          onClick={refreshData}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Resumen de Progreso</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<FaGamepad className="text-blue-400" />}
            title="Sesiones Jugadas"
            value={sessions.length}
            subtitle="Total de partidas"
          />
          <StatCard
            icon={<FaClock className="text-green-400" />}
            title="Tiempo Total"
            value={`${Math.floor(totalStats.totalPlayTime / 3600)}h ${Math.floor((totalStats.totalPlayTime % 3600) / 60)}m`}
            subtitle="Tiempo jugado"
          />
          <StatCard
            icon={<FaSkull className="text-red-400" />}
            title="Enemigos Derrotados"
            value={totalStats.totalEnemiesDefeated}
            subtitle="En todas las sesiones"
          />
          <StatCard
            icon={<FaTrophy className="text-yellow-400" />}
            title="Mejor Puntuación"
            value={totalStats.bestScore}
            subtitle="Récord personal"
          />
        </div>
      </div>

      {/* Recent Sessions */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Sesiones Recientes</h2>
          <button
            onClick={refreshData}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            Actualizar
          </button>
        </div>
        
        {sessions.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <FaGamepad className="text-4xl text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No hay sesiones registradas
            </h3>
            <p className="text-gray-500">
              Las sesiones de juego aparecerán aquí una vez que comiences a jugar
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.slice(0, 5).map((session) => (
              <div
                key={session.documentId}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{session.session_name}</h3>
                    <p className="text-gray-400">
                      {session.game_mode} - {session.difficulty_level}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    session.game_state === 'completed' 
                      ? 'bg-green-900 text-green-300'
                      : session.game_state === 'active'
                      ? 'bg-blue-900 text-blue-300'
                      : 'bg-gray-700 text-gray-300'
                  }`}>
                    {session.game_state}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Duración:</span>
                    <p className="font-medium">
                      {Math.floor(session.duration_seconds / 60)}m {session.duration_seconds % 60}s
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Puntuación:</span>
                    <p className="font-medium">{session.final_score}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">NFTs Equipados:</span>
                    <p className="font-medium">{session.equipped_nfts?.length || 0}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Nivel:</span>
                    <p className="font-medium">{session.level_reached}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};