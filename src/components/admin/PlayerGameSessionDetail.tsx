import React from 'react';
import { FiUser, FiTarget, FiClock, FiTrendingUp, FiPackage, FiAward, FiZap } from 'react-icons/fi';
import type { PlayerGameSessionDetail } from '@/types/admin';

interface PlayerGameSessionDetailProps {
  playerData: PlayerGameSessionDetail;
  onClose: () => void;
}

export const PlayerGameSessionDetailComponent: React.FC<PlayerGameSessionDetailProps> = ({ 
  playerData, 
  onClose 
}) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  const getGameStateColor = (state: string) => {
    switch (state) {
      case 'victory': return 'text-green-600 bg-green-100';
      case 'defeat': return 'text-red-600 bg-red-100';
      case 'active': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getGameStateText = (state: string) => {
    switch (state) {
      case 'victory': return 'Victoria';
      case 'defeat': return 'Derrota';
      case 'active': return 'Activa';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Datos de Juego del Jugador</h2>
              <p className="text-blue-100 mt-1">{playerData.user.username}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Información del Usuario */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <FiUser className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-900">Información del Usuario</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Usuario</p>
                <p className="font-medium text-gray-900">{playerData.user.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{playerData.user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Registrado</p>
                <p className="font-medium text-gray-900">{formatDate(playerData.user.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Estado de la Sesión */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FiZap className="h-6 w-6 text-purple-600 mr-2" />
                <h3 className="text-xl font-semibold text-gray-900">Estado de la Sesión</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGameStateColor(playerData.sessionStats.gameState)}`}>
                {getGameStateText(playerData.sessionStats.gameState)}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{playerData.sessionStats.finalScore}</p>
                <p className="text-sm text-gray-600">Puntuación Final</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{playerData.sessionStats.levelReached}</p>
                <p className="text-sm text-gray-600">Nivel Alcanzado</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{formatTime(playerData.sessionStats.durationSeconds)}</p>
                <p className="text-sm text-gray-600">Duración</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{playerData.sessionStats.accuracyPercentage.toFixed(1)}%</p>
                <p className="text-sm text-gray-600">Precisión</p>
              </div>
            </div>
          </div>

          {/* Estadísticas de Combate */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center mb-4">
              <FiTarget className="h-6 w-6 text-red-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-900">Estadísticas de Combate</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{playerData.sessionStats.enemiesDefeated}</p>
                <p className="text-sm text-gray-600">Enemigos Derrotados</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{playerData.sessionStats.zombiesKilled}</p>
                <p className="text-sm text-gray-600">Zombies Eliminados</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{playerData.sessionStats.dashersKilled}</p>
                <p className="text-sm text-gray-600">Dashers Eliminados</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{playerData.sessionStats.tanksKilled}</p>
                <p className="text-sm text-gray-600">Tanques Eliminados</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-600">Disparos Realizados</p>
                <p className="text-lg font-semibold text-gray-900">{playerData.sessionStats.shotsFired}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Disparos Acertados</p>
                <p className="text-lg font-semibold text-gray-900">{playerData.sessionStats.shotsHit}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Daño Infligido</p>
                <p className="text-lg font-semibold text-gray-900">{playerData.sessionStats.totalDamageDealt}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Daño Recibido</p>
                <p className="text-lg font-semibold text-gray-900">{playerData.sessionStats.totalDamageReceived}</p>
              </div>
            </div>
          </div>

          {/* Estadísticas de Supervivencia */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center mb-4">
              <FiClock className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-900">Estadísticas de Supervivencia</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Tiempo Total de Supervivencia</p>
                <p className="text-lg font-semibold text-gray-900">{formatTime(playerData.sessionStats.survivalTimeTotal)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cajas de Suministros</p>
                <p className="text-lg font-semibold text-gray-900">{playerData.sessionStats.supplyBoxesTotal}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Barriles Destruidos</p>
                <p className="text-lg font-semibold text-gray-900">{playerData.sessionStats.barrelsDestroyedTotal}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Vendas Usadas</p>
                <p className="text-lg font-semibold text-gray-900">{playerData.sessionStats.bandagesUsedTotal}</p>
              </div>
            </div>
          </div>

          {/* Materiales */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center mb-4">
              <FiPackage className="h-6 w-6 text-yellow-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-900">Materiales Recolectados</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-gray-600">{playerData.materials.steel}</p>
                <p className="text-sm text-gray-600">Acero</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{playerData.materials.energyCells}</p>
                <p className="text-sm text-gray-600">Celdas de Energía</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-600">{playerData.materials.medicine}</p>
                <p className="text-sm text-gray-600">Medicina</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{playerData.materials.food}</p>
                <p className="text-sm text-gray-600">Comida</p>
              </div>
            </div>
          </div>

          {/* Armas */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center mb-4">
              <FiTarget className="h-6 w-6 text-orange-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-900">Armas Disponibles</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {playerData.guns.map((gun, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">{gun.name}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      gun.rarity === 'legendary' ? 'bg-purple-100 text-purple-800' :
                      gun.rarity === 'epic' ? 'bg-blue-100 text-blue-800' :
                      gun.rarity === 'rare' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {gun.rarity}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">Daño</p>
                      <p className="font-medium">{gun.damage}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Cadencia</p>
                      <p className="font-medium">{gun.fire_rate}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Munición</p>
                      <p className="font-medium">{gun.ammo_capacity}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Misiones Diarias */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center mb-4">
              <FiAward className="h-6 w-6 text-yellow-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-900">Misiones Diarias Completadas</h3>
            </div>
            <div className="space-y-3">
              {playerData.dailyQuestsCompleted.quests.filter(quest => quest.completed).map((quest, index) => (
                <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-green-800">{quest.title}</h4>
                      <p className="text-sm text-green-600">{quest.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-600">Recompensa: {quest.reward}</p>
                      <p className="text-xs text-green-500">
                        Completada: {formatDate(quest.completedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Estadísticas Generales */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center mb-4">
              <FiTrendingUp className="h-6 w-6 text-indigo-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-900">Estadísticas Generales</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Juegos Jugados</p>
                <p className="text-lg font-semibold text-gray-900">{playerData.sessionStats.gamesPlayedTotal}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Victorias</p>
                <p className="text-lg font-semibold text-green-600">{playerData.sessionStats.victoriesTotal}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Derrotas</p>
                <p className="text-lg font-semibold text-red-600">{playerData.sessionStats.defeatsTotal}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Niveles Ganados</p>
                <p className="text-lg font-semibold text-blue-600">{playerData.sessionStats.levelsGainedTotal}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};