import React from 'react';
import { FaGamepad, FaClock, FaTrophy, FaGem, FaCrosshairs, FaTasks } from 'react-icons/fa';
import type { GameSession } from '@/types/gameSession';

interface SessionDetailsProps {
  session: GameSession;
}

export const SessionDetails: React.FC<SessionDetailsProps> = ({ session }) => {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Session Stats */}
      <div>
        <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <FaGamepad className="text-blue-400" />
          <span>Estadísticas de Sesión</span>
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="text-sm text-gray-400">Enemigos Derrotados</div>
            <div className="text-xl font-bold text-red-400">
              {session.session_stats?.enemies_defeated || 0}
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="text-sm text-gray-400">Daño Total</div>
            <div className="text-xl font-bold text-orange-400">
              {session.session_stats?.total_damage_dealt || 0}
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="text-sm text-gray-400">Precisión</div>
            <div className="text-xl font-bold text-green-400">
              {session.session_stats?.accuracy_percentage || 0}%
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="text-sm text-gray-400">Duración</div>
            <div className="text-xl font-bold text-blue-400">
              {formatDuration(session.duration_seconds)}
            </div>
          </div>
        </div>
      </div>

      {/* Materials */}
      {session.materials && (
        <div>
          <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <FaGem className="text-purple-400" />
            <span>Materiales</span>
          </h4>
          
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(session.materials).map(([material, amount]) => (
              <div key={material} className="bg-gray-700 rounded-lg p-3 text-center">
                <div className="text-sm text-gray-400 capitalize">
                  {material.replace('_', ' ')}
                </div>
                <div className="text-lg font-bold text-purple-400">
                  {amount as number}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weapons */}
      {session.guns && session.guns.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <FaBullseye className="text-yellow-400" />
            <span>Armas</span>
          </h4>
          
          <div className="space-y-2">
            {session.guns.map((gun: any, index: number) => (
              <div key={index} className="bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-semibold">{gun.name}</h5>
                    <div className="text-sm text-gray-400">ID: {gun.id}</div>
                  </div>
                  <div className="text-right text-sm">
                    <div>Daño: <span className="text-red-400">{gun.damage}</span></div>
                    <div>Cadencia: <span className="text-blue-400">{gun.fire_rate}</span></div>
                    <div>Munición: <span className="text-green-400">{gun.ammo_capacity}</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Quests */}
      {session.daily_quests_completed && (
        <div>
          <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <FaListAlt className="text-green-400" />
            <span>Misiones Diarias</span>
          </h4>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-3">
              Fecha: {session.daily_quests_completed.date}
            </div>
            
            <div className="space-y-2">
              {session.daily_quests_completed.quests?.map((quest: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{quest.name}</div>
                    <div className="text-sm text-gray-400">
                      Progreso: {quest.progress}/{quest.target}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    quest.completed 
                      ? 'bg-green-900 text-green-300'
                      : 'bg-yellow-900 text-yellow-300'
                  }`}>
                    {quest.completed ? 'Completada' : 'En progreso'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Equipped Items */}
      {session.equipped_items && (
        <div>
          <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <FaTrophy className="text-gold-400" />
            <span>Items Equipados</span>
          </h4>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-400">NFTs Equipados:</span>
                <p className="font-medium">
                  {session.equipped_items.nfts?.length || 0}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Armas Equipadas:</span>
                <p className="font-medium">
                  {session.equipped_items.weapons?.length || 0}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Efectos Activos:</span>
                <p className="font-medium">
                  {session.equipped_items.active_effects?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-lg font-semibold mb-3 flex items-center space-x-2">
          <FaClock className="text-blue-400" />
          <span>Información Temporal</span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Iniciada:</span>
            <p className="font-medium">
              {new Date(session.started_at).toLocaleString()}
            </p>
          </div>
          {session.ended_at && (
            <div>
              <span className="text-gray-400">Finalizada:</span>
              <p className="font-medium">
                {new Date(session.ended_at).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};