import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaPlay, 
  FaSkull, 
  FaShieldAlt, 
  FaTrophy, 
  FaUser, 
  FaWallet, 
  FaGhost,
  FaCrosshairs,
  FaHeart,
  FaBolt,
  FaAward,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaHammer,
  FaTasks,
  FaGamepad,
  FaFire
} from 'react-icons/fa';
import { useAuthStore } from '@/stores/authStore';
import { useGameSessionData } from '@/hooks/useGameSessionData';
import { InitialSessionCard } from '@/components/game-session/InitialSessionCard';
import { MaterialsDisplay } from '@/components/lobby/MaterialsDisplay';
import { EquipmentDisplay } from '@/components/lobby/EquipmentDisplay';
import { CraftingTable } from '@/components/lobby/CraftingTable';
import { DailyQuestsView } from './DailyQuestsView';
import type { GameSession } from '@/types/gameSession';

export const SurvivalLobbyView: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [initialSession, setInitialSession] = useState<GameSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const [showCraftingModal, setShowCraftingModal] = useState(false);
  const [showDailyQuests, setShowDailyQuests] = useState(false);

  // Obtener sesiones del usuario
  const { sessions, loading: sessionsLoading, refreshData } = useGameSessionData(user ? parseInt(user.id) : 0);

  useEffect(() => {
    if (sessions.length > 0) {
      // Buscar la sesión inicial (la primera creada)
      const initial = sessions.find(s => s.session_name?.includes('Sesión Inicial'));
      const selectedSession = initial || sessions[0];
      setInitialSession(selectedSession);
      
      console.log('🎮 Sessions found:', sessions.length);
      console.log('🎮 Selected session:', selectedSession);
    }
    setIsLoading(false);
  }, [sessions]);

  const handleRefreshData = () => {
    console.log('🔄 Refreshing session data...');
    refreshData();
  };

  const handleStartGame = (sessionId: string) => {
    console.log('🎮 Starting game with session:', sessionId);
    navigate('/game', { state: { sessionId } });
  };

  const handleViewDetails = (session: GameSession) => {
    setShowSessionDetails(true);
    console.log('📊 Viewing session details:', session);
  };

  const handleQuickPlay = () => {
    navigate('/game');
  };

  const handleCreateNewSession = () => {
    navigate('/game-session-test');
  };

  // Calcular estadísticas mejoradas
  const getEnhancedStats = () => {
    if (!initialSession?.session_stats) return null;
    
    const stats = initialSession.session_stats as any; // Usando any para acceder a propiedades dinámicas
    const totalTime = Math.floor((stats.survival_time_total || 0) / 60);
    const accuracy = stats.accuracy_percentage || 0;
    const totalDamage = stats.total_damage_dealt || 0;
    
    return {
      totalTime,
      accuracy,
      totalDamage,
      gamesPlayed: stats.games_played_total || 0,
      victories: stats.victories_total || 0,
      defeats: stats.defeats_total || 0
    };
  };

  const enhancedStats = getEnhancedStats();

  if (isLoading || sessionsLoading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full text-white bg-black/40 rounded-lg p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-400 mb-4"></div>
        <h2 className="text-2xl font-bold text-red-400 mb-2">Cargando Zona de Supervivencia</h2>
        <p className="text-gray-400">Preparando tu arsenal...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full text-white bg-black/40 rounded-lg p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">

      {/* Header Principal */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <FaSkull className="text-6xl text-red-500 mr-4 animate-pulse" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
            ZONA DE SUPERVIVENCIA
          </h1>
          <FaGhost className="text-6xl text-green-500 ml-4 animate-bounce" />
        </div>
        <p className="text-xl text-gray-300 mb-2">
          Bienvenido, <span className="text-yellow-400 font-bold">{user?.username}</span>
        </p>
        <p className="text-gray-400 mb-4">
          Prepárate para enfrentar la horda de zombies
        </p>
        
        {/* Botón de Refresh */}
        <button
          onClick={handleRefreshData}
          disabled={sessionsLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
        >
          <div className={`w-4 h-4 border-2 border-white border-t-transparent rounded-full ${sessionsLoading ? 'animate-spin' : ''}`}></div>
          <span>Actualizar Datos</span>
        </button>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Panel Izquierdo - Estado del Jugador */}
        <div className="space-y-6">
          {/* Tarjeta de Estado */}
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <FaUser className="mr-3 text-blue-400" />
                Estado del Combatiente
              </h3>
              <div className="flex items-center space-x-2">
                <FaHeart className="text-red-400" />
                <span className="text-red-400 font-bold">100%</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <FaCrosshairs className="text-green-400 mr-2" />
                  <span className="text-gray-300">Precisión</span>
                </div>
                <div className="text-2xl font-bold text-green-400">
                  {initialSession?.session_stats?.accuracy_percentage || 0}%
                </div>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <FaBolt className="text-yellow-400 mr-2" />
                  <span className="text-gray-300">Nivel</span>
                </div>
                <div className="text-2xl font-bold text-yellow-400">
                  {initialSession?.session_stats?.level_reached || 0}
                </div>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <FaSkull className="text-red-400 mr-2" />
                  <span className="text-gray-300">Zombies Eliminados</span>
                </div>
                <div className="text-2xl font-bold text-red-400">
                  {initialSession?.session_stats?.enemies_defeated || 0}
                </div>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <FaTrophy className="text-purple-400 mr-2" />
                  <span className="text-gray-300">Puntuación</span>
                </div>
                <div className="text-2xl font-bold text-purple-400">
                  {initialSession?.session_stats?.final_score || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta de Arsenal */}
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <FaShieldAlt className="mr-3 text-blue-400" />
                Arsenal Disponible
              </h3>
              <button
                onClick={() => setShowCraftingModal(true)}
                className="crafting-btn text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
              >
                <FaHammer />
                <span>Mesa de Creación</span>
              </button>
            </div>
            
            {/* Equipment Display */}
            {initialSession?.equipped_items && (
              <div className="mb-6">
                <EquipmentDisplay 
                  equipped_items={initialSession.equipped_items} 
                  showTitle={false}
                  compact={true}
                />
              </div>
            )}
            
            <div className="space-y-4">
              {/* NFTs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 font-medium">NFTs Equipados</span>
                  <span className="text-purple-400 font-bold">
                    {initialSession?.equipped_items?.nfts?.length || 0}
                  </span>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  {initialSession?.equipped_items?.nfts?.length ? (
                    <div className="space-y-2">
                      <div className="flex items-center text-green-400">
                        <FaCheckCircle className="mr-2" />
                        <span>NFTs listos para el combate</span>
                      </div>
                      {initialSession.equipped_items.nfts.map((nft: any, index: number) => (
                        <div key={index} className="ml-4 p-2 bg-gray-700/50 rounded text-sm">
                          <div className="text-purple-400 font-medium">{nft.name}</div>
                          <div className="text-gray-400 text-xs">{nft.achievement_type}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center text-yellow-400">
                      <FaExclamationTriangle className="mr-2" />
                      <span>No hay NFTs equipados</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Armas */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 font-medium">Armas Disponibles</span>
                  <span className="text-blue-400 font-bold">
                    {initialSession?.guns?.length || 0}
                  </span>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  {initialSession?.guns?.length ? (
                    <div className="space-y-2">
                      <div className="flex items-center text-green-400">
                        <FaCheckCircle className="mr-2" />
                        <span>Arsenal cargado</span>
                      </div>
                      {initialSession.guns.map((gun: any, index: number) => (
                        <div key={index} className="ml-4 p-2 bg-gray-700/50 rounded text-sm">
                          <div className="text-blue-400 font-medium">{gun.name}</div>
                          <div className="text-gray-400 text-xs">Daño: {gun.damage} | Cadencia: {gun.fire_rate}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center text-yellow-400">
                      <FaExclamationTriangle className="mr-2" />
                      <span>Sin armas disponibles</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Derecho - Acciones */}
        <div className="space-y-6">
          {/* Botones de Acción */}
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white flex items-center mb-6">
              <FaPlay className="mr-3 text-green-400" />
              Acciones de Combate
            </h3>
            
            <div className="space-y-4">
              <button
                onClick={handleQuickPlay}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 shadow-lg"
              >
                <FaPlay className="text-xl" />
                <span className="text-xl">¡COMBATE RÁPIDO!</span>
              </button>
              
              <button
                onClick={() => setShowDailyQuests(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 shadow-lg"
              >
                <FaTasks className="text-xl" />
                <span className="text-xl">Misiones Diarias</span>
              </button>
              
              <button
                onClick={() => navigate('/lobby?section=nfts')}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 shadow-lg"
              >
                <FaTrophy className="text-xl" />
                <span className="text-xl">Gestionar NFTs</span>
              </button>
            </div>
          </div>

          {/* Materiales - Movido de vuelta aquí */}
          {initialSession?.materials && (
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
              <MaterialsDisplay 
                materials={initialSession.materials} 
                showTitle={true}
              />
            </div>
          )}

          {/* Estadísticas Rápidas Mejoradas - Movido al final */}
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white flex items-center mb-4">
              <FaClock className="mr-3 text-yellow-400" />
              Estadísticas Rápidas
            </h3>
            
            {enhancedStats ? (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center mb-1">
                    <FaClock className="text-orange-400 mr-2 text-sm" />
                    <span className="text-gray-300 text-sm">Tiempo Total</span>
                  </div>
                  <div className="text-lg font-bold text-orange-400">
                    {enhancedStats.totalTime}m
                  </div>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center mb-1">
                    <FaCrosshairs className="text-green-400 mr-2 text-sm" />
                    <span className="text-gray-300 text-sm">Disparos Acertados</span>
                  </div>
                  <div className="text-lg font-bold text-green-400">
                    {initialSession?.session_stats?.shots_hit || 0}
                  </div>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center mb-1">
                    <FaSkull className="text-red-400 mr-2 text-sm" />
                    <span className="text-gray-300 text-sm">Daño Total</span>
                  </div>
                  <div className="text-lg font-bold text-red-400">
                    {enhancedStats.totalDamage}
                  </div>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center mb-1">
                    <FaGamepad className="text-blue-400 mr-2 text-sm" />
                    <span className="text-gray-300 text-sm">Partidas</span>
                  </div>
                  <div className="text-lg font-bold text-blue-400">
                    {enhancedStats.gamesPlayed}
                  </div>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center mb-1">
                    <FaTrophy className="text-green-400 mr-2 text-sm" />
                    <span className="text-gray-300 text-sm">Victorias</span>
                  </div>
                  <div className="text-lg font-bold text-green-400">
                    {enhancedStats.victories}
                  </div>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center mb-1">
                    <FaFire className="text-red-400 mr-2 text-sm" />
                    <span className="text-gray-300 text-sm">Derrotas</span>
                  </div>
                  <div className="text-lg font-bold text-red-400">
                    {enhancedStats.defeats}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <p>No hay estadísticas disponibles</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barra de Advertencia */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 border border-red-500 rounded-lg p-4 text-center">
        <div className="flex items-center justify-center space-x-3">
          <FaExclamationTriangle className="text-2xl text-white animate-pulse" />
          <span className="text-white font-bold text-lg">ADVERTENCIA</span>
          <FaExclamationTriangle className="text-2xl text-white animate-pulse" />
        </div>
        <p className="text-red-100 mt-2">
          La horda de zombies se acerca. Prepárate para el combate final.
        </p>
      </div>

      {/* Modal de Misiones Diarias */}
      {showDailyQuests && user && (
        <DailyQuestsView 
          userId={parseInt(user.id)} 
          onClose={() => setShowDailyQuests(false)} 
        />
      )}

      {/* Modal de Mesa de Creación */}
      {showCraftingModal && initialSession?.materials && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white flex items-center">
                  <FaHammer className="mr-3 text-orange-400" />
                  Mesa de Creación
                </h2>
                <button
                  onClick={() => setShowCraftingModal(false)}
                  className="text-gray-400 hover:text-white text-2xl font-bold transition-colors"
                >
                  ×
                </button>
              </div>
              
              <CraftingTable 
                materials={initialSession.materials}
                onCraft={(recipeId) => {
                  console.log('🎮 Crafting recipe:', recipeId);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 