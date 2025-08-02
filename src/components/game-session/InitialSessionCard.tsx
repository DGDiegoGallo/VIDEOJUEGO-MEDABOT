import React from 'react';
import { FaPlay, FaTrophy, FaUser, FaWallet, FaSkull, FaCrosshairs, FaShieldAlt, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import type { GameSession } from '@/types/gameSession';

interface InitialSessionCardProps {
  session: GameSession;
  onStartGame: (sessionId: string) => void;
  onViewDetails: (session: GameSession) => void;
}

export const InitialSessionCard: React.FC<InitialSessionCardProps> = ({
  session,
  onStartGame,
  onViewDetails
}) => {
  const hasNFTs = session.user_nfts && session.user_nfts.length > 0;
  const hasEquippedNFTs = session.equipped_items?.nfts && session.equipped_items.nfts.length > 0;
  const gameState = session.session_stats?.game_state || 'not_started';

  const getGameStateColor = (state: string) => {
    switch (state) {
      case 'active': return 'bg-green-900 text-green-300';
      case 'completed': return 'bg-blue-900 text-blue-300';
      case 'paused': return 'bg-yellow-900 text-yellow-300';
      case 'not_started': return 'bg-gray-900 text-gray-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  const getGameStateIcon = (state: string) => {
    switch (state) {
      case 'active': return <FaPlay className="text-green-400" />;
      case 'completed': return <FaTrophy className="text-blue-400" />;
      case 'paused': return <FaExclamationTriangle className="text-yellow-400" />;
      case 'not_started': return <FaSkull className="text-gray-400" />;
      default: return <FaSkull className="text-gray-400" />;
    }
  };

  return (
    <div className="bg-gradient-to-r from-gray-900/90 to-gray-800/90 border border-gray-600 rounded-xl p-6 backdrop-blur-sm shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
          <h2 className="text-2xl font-bold text-blue-400 flex items-center">
            <FaShieldAlt className="mr-3" />
            Misión de Supervivencia
          </h2>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 ${getGameStateColor(gameState)}`}>
          {getGameStateIcon(gameState)}
          <span className="capitalize">{gameState.replace('_', ' ')}</span>
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Información de la Sesión */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-700/80 rounded-lg p-4 border border-gray-600">
          <h4 className="text-lg font-semibold text-gray-300 mb-3 flex items-center">
            <FaCrosshairs className="mr-2 text-green-400" />
            Estadísticas de Combate
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Puntuación:</span>
              <span className="text-yellow-400 font-bold">
                {session.session_stats?.final_score || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Nivel:</span>
              <span className="text-green-400 font-bold">
                {session.session_stats?.level_reached || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Duración:</span>
              <span className="text-blue-400 font-bold">
                {Math.floor((session.session_stats?.duration_seconds || 0) / 60)}m
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Zombies Eliminados:</span>
              <span className="text-red-400 font-bold">
                {session.session_stats?.enemies_defeated || 0}
              </span>
            </div>
          </div>
        </div>

        {/* NFTs del Usuario */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-700/80 rounded-lg p-4 border border-gray-600">
          <h4 className="text-lg font-semibold text-gray-300 mb-3 flex items-center">
            <FaTrophy className="mr-2 text-purple-400" />
            Arsenal NFT ({hasNFTs ? session.user_nfts?.length || 0 : 0})
          </h4>
          {hasNFTs ? (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {session.user_nfts?.map((nft: any) => (
                <div key={nft.id} className="bg-gray-700/70 rounded p-2 border border-purple-500/30">
                  <div className="text-sm font-medium text-purple-400 flex items-center">
                    <FaTrophy className="mr-1 text-xs" />
                    {nft.metadata?.name || 'NFT Sin Nombre'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {nft.metadata?.achievement_type || 'unknown'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-sm flex items-center">
              <FaExclamationTriangle className="mr-2 text-yellow-400" />
              No hay NFTs disponibles
            </div>
          )}
        </div>

        {/* Estado de Equipamiento */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-700/80 rounded-lg p-4 border border-gray-600">
          <h4 className="text-lg font-semibold text-gray-300 mb-3 flex items-center">
            <FaShieldAlt className="mr-2 text-blue-400" />
            Estado de Equipamiento
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">NFTs Equipados:</span>
              <div className="flex items-center">
                {hasEquippedNFTs ? (
                  <FaCheckCircle className="text-green-400 mr-1" />
                ) : (
                  <FaExclamationTriangle className="text-yellow-400 mr-1" />
                )}
                <span className={`text-sm font-bold ${hasEquippedNFTs ? 'text-green-400' : 'text-yellow-400'}`}>
                  {session.equipped_items?.nfts?.length || 0}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Armas:</span>
              <div className="flex items-center">
                {session.guns?.length ? (
                  <FaCheckCircle className="text-green-400 mr-1" />
                ) : (
                  <FaExclamationTriangle className="text-yellow-400 mr-1" />
                )}
                <span className={`text-sm font-bold ${session.guns?.length ? 'text-green-400' : 'text-yellow-400'}`}>
                  {session.guns?.length || 0}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Materiales:</span>
              <span className="text-blue-400 font-bold text-sm">
                {Object.values(session.materials || {}).reduce((a: any, b: any) => a + b, 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
        <button
          onClick={() => onStartGame(session.documentId)}
          disabled={!hasNFTs}
          className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 font-bold shadow-lg"
        >
          <FaPlay />
          <span>Comenzar Misión</span>
        </button>
        
        <button
          onClick={() => onViewDetails(session)}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 font-bold shadow-lg"
        >
          <FaUser />
          <span>Ver Detalles</span>
        </button>
      </div>

      {/* Mensajes de Estado */}
      <div className="mt-4 space-y-2">
        {!hasNFTs && (
          <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400 text-sm flex items-center">
              <FaExclamationTriangle className="mr-2" />
              ⚠️ Necesitas al menos un NFT para comenzar la misión. 
              Completa el registro para obtener tu primer NFT de supervivencia.
            </p>
          </div>
        )}

        {hasNFTs && !hasEquippedNFTs && (
          <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-blue-400 text-sm flex items-center">
              <FaShieldAlt className="mr-2" />
              💡 Tienes NFTs disponibles pero no están equipados. 
              Equipa tus NFTs para mejorar tu rendimiento en la batalla contra los zombies.
            </p>
          </div>
        )}

        {gameState === 'not_started' && (
          <div className="p-3 bg-gray-800/50 border border-gray-600 rounded-lg">
            <p className="text-gray-300 text-sm flex items-center">
              <FaSkull className="mr-2" />
              🎮 Esta es tu misión inicial. Prepárate para enfrentar la horda de zombies.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}; 