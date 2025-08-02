import React, { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaStop, FaClock } from 'react-icons/fa';
import type { GameSession } from '@/types/gameSession';

interface ActiveSessionControlsProps {
  session: GameSession;
  onUpdate: (sessionId: string, data: any) => void;
}

export const ActiveSessionControls: React.FC<ActiveSessionControlsProps> = ({ 
  session, 
  onUpdate 
}) => {
  const [currentDuration, setCurrentDuration] = useState(session.duration_seconds);
  const [isRunning, setIsRunning] = useState(session.game_state === 'active');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        setCurrentDuration(prev => prev + 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePause = async () => {
    setIsRunning(false);
    await onUpdate(session.documentId, {
      game_state: 'paused',
      duration_seconds: currentDuration
    });
  };

  const handleResume = async () => {
    setIsRunning(true);
    await onUpdate(session.documentId, {
      game_state: 'active',
      duration_seconds: currentDuration
    });
  };

  const handleStop = async () => {
    setIsRunning(false);
    await onUpdate(session.documentId, {
      game_state: 'completed',
      ended_at: new Date().toISOString(),
      duration_seconds: currentDuration,
      final_score: Math.floor(Math.random() * 10000) + 1000 // Score simulado
    });
  };

  return (
    <div className="space-y-4">
      {/* Session Info */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">{session.session_name}</h3>
          <p className="text-gray-400">
            {session.game_mode} - {session.difficulty_level}
          </p>
        </div>
        
        <div className="text-right">
          <div className="flex items-center space-x-2 text-2xl font-mono">
            <FaClock className="text-blue-400" />
            <span>{formatTime(currentDuration)}</span>
          </div>
          <p className="text-sm text-gray-400">Tiempo transcurrido</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex space-x-4">
        {session.game_state === 'active' ? (
          <button
            onClick={handlePause}
            className="bg-yellow-600 hover:bg-yellow-700 px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <FaPause />
            <span>Pausar</span>
          </button>
        ) : (
          <button
            onClick={handleResume}
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <FaPlay />
            <span>Reanudar</span>
          </button>
        )}
        
        <button
          onClick={handleStop}
          className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
        >
          <FaStop />
          <span>Finalizar</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-gray-400">Enemigos</div>
          <div className="text-lg font-bold text-red-400">
            {session.session_stats?.enemies_defeated || 0}
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-gray-400">Daño</div>
          <div className="text-lg font-bold text-orange-400">
            {session.session_stats?.total_damage_dealt || 0}
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-gray-400">NFTs</div>
          <div className="text-lg font-bold text-purple-400">
            {session.equipped_items?.nfts?.length || 0}
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-gray-400">Nivel</div>
          <div className="text-lg font-bold text-blue-400">
            {session.level_reached || 1}
          </div>
        </div>
      </div>
    </div>
  );
};