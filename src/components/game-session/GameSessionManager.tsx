import React, { useState, useEffect } from 'react';
import { FaPlay, FaPlus, FaTrash, FaEdit, FaEye } from 'react-icons/fa';
import { useGameSessionData } from '@/hooks/useGameSessionData';
import { SessionCreator } from './SessionCreator';
import { ActiveSessionControls } from './ActiveSessionControls';
import { SessionDetails } from './SessionDetails';
import { userWalletService } from '@/services/userWallet.service';
import { useAuthStore } from '@/stores/authStore';
import { StrapiSetupGuide } from "./StrapiSetupGuide";
import type { GameSession } from "@/types/gameSession";

interface GameSessionManagerProps {
  userId: number;
}

export const GameSessionManager: React.FC<GameSessionManagerProps> = ({
  userId,
}) => {
  const { sessions, loading, error, createSession, updateSession } = useGameSessionData(userId);
  const [showCreator, setShowCreator] = useState(false);
  const [activeSession, setActiveSession] = useState<GameSession | null>(null);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<{ wallet: any; nfts: any[] } | null>(null);

  // Si hay error de configuración, mostrar guía
  if (
    error &&
    (error.includes("game-sessions") || error.includes("colección"))
  ) {
    return <StrapiSetupGuide />;
  }

  const handleCreateSession = async (sessionData: any) => {
    try {
      await createSession(sessionData);
      setShowCreator(false);
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  const handleCreateTestSession = async () => {
    try {
      setIsCreatingSession(true);
      console.log('🎮 Iniciando creación de sesión de prueba...');
      
      // Obtener usuario autenticado
      const { user } = useAuthStore.getState();
      if (!user) {
        console.error('❌ No hay usuario autenticado');
        throw new Error('Usuario no autenticado');
      }

      console.log('👤 Usuario autenticado:', user);

      // Obtener wallet y NFTs del usuario
      const { wallet, nfts } = await userWalletService.getUserWalletWithNFTs(parseInt(user.id));
      
      if (!wallet) {
        console.error('❌ No se encontró wallet para el usuario');
        throw new Error('Wallet no encontrada');
      }

      console.log('💰 Wallet encontrada:', wallet.wallet_address);
      console.log('🎨 NFTs encontrados:', nfts.length);

      // Guardar información para mostrar en la UI
      setSessionInfo({ wallet, nfts });

      // Preparar datos de la sesión con información del usuario y NFTs
      const testSessionData = {
        session_name: `Sesión de Prueba - ${user.username} - ${new Date().toLocaleDateString()}`,
        session_stats: {
          enemies_defeated: Math.floor(Math.random() * 50) + 10,
          total_damage_dealt: Math.floor(Math.random() * 2000) + 500,
          total_damage_received: Math.floor(Math.random() * 500) + 100,
          shots_fired: Math.floor(Math.random() * 200) + 50,
          shots_hit: Math.floor(Math.random() * 100) + 25,
          accuracy_percentage: Math.floor(Math.random() * 50) + 25,
          final_score: Math.floor(Math.random() * 1000) + 500,
          level_reached: Math.floor(Math.random() * 5) + 1,
          duration_seconds: 300,
          started_at: new Date().toISOString(),
          ended_at: new Date(Date.now() + 300000).toISOString(),
          game_state: 'completed'
        },
        materials: {
          iron: Math.floor(Math.random() * 20) + 5,
          steel: Math.floor(Math.random() * 10) + 2,
          energy_crystals: Math.floor(Math.random() * 5) + 1
        },
        guns: [
          {
            id: 'basic_pistol',
            name: 'Pistola Básica',
            damage: 25,
            fire_rate: 1.5,
            ammo_capacity: 12
          }
        ],
        daily_quests_completed: {
          date: new Date().toISOString().split('T')[0],
          quests: [
            {
              id: 'kill_10_enemies',
              name: 'Eliminar 10 enemigos',
              completed: true,
              progress: 10,
              target: 10
            },
            {
              id: 'collect_materials',
              name: 'Recolectar 50 materiales',
              completed: false,
              progress: 25,
              target: 50
            }
          ]
        },
        equipped_items: {
          nfts: nfts.map(nft => ({
            id: nft.documentId,
            token_id: nft.token_id,
            contract_address: nft.contract_address,
            name: nft.metadata?.name || 'NFT Sin Nombre',
            description: nft.metadata?.description || 'Sin descripción',
            icon_name: nft.metadata?.icon_name || 'FaQuestion',
            achievement_type: nft.metadata?.achievement_type || 'unknown',
            rarity: nft.metadata?.rarity || 'common',
            attributes: nft.metadata?.attributes || [],
            network: nft.network,
            owner_address: nft.owner_address,
            is_listed_for_sale: nft.is_listed_for_sale,
            listing_price_eth: nft.listing_price_eth,
            minted_at: nft.minted_at,
            last_transfer_at: nft.last_transfer_at
          })),
          weapons: ['basic_pistol'],
          active_effects: []
        },
        // Relación con NFTs usando los IDs numéricos de los NFTs
        user_nfts: nfts.map(nft => parseInt(nft.id))
      };

      console.log('📊 Datos de sesión preparados:', testSessionData);
      console.log('🎨 NFTs equipados:', testSessionData.equipped_items.nfts.length);

      await createSession(testSessionData);
      console.log('✅ Sesión de prueba creada exitosamente');
      
    } catch (error) {
      console.error("Error creating test session:", error);
    } finally {
      setIsCreatingSession(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Session Info Display */}
      {sessionInfo && (
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-blue-400">
              Información de la Sesión
            </h3>
            <button
              onClick={() => setSessionInfo(null)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Wallet Info */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-md font-semibold text-gray-300 mb-3">💰 Wallet del Usuario</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-400">Dirección:</span>
                  <span className="text-green-400 ml-2 font-mono text-xs">
                    {sessionInfo.wallet.wallet_address}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Balance USDT:</span>
                  <span className="text-yellow-400 ml-2">
                    {sessionInfo.wallet.usdt_balance}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Document ID:</span>
                  <span className="text-blue-400 ml-2 font-mono text-xs">
                    {sessionInfo.wallet.documentId}
                  </span>
                </div>
              </div>
            </div>

            {/* NFTs Info */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-md font-semibold text-gray-300 mb-3">
                🎨 NFTs Equipados ({sessionInfo.nfts.length})
              </h4>
              {sessionInfo.nfts.length > 0 ? (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {sessionInfo.nfts.map((nft, index) => (
                    <div key={nft.documentId} className="bg-gray-700/50 rounded p-2">
                      <div className="text-sm font-medium text-purple-400">
                        {nft.metadata?.name || 'NFT Sin Nombre'}
                      </div>
                      <div className="text-xs text-gray-400">
                        Token ID: {nft.token_id}
                      </div>
                      <div className="text-xs text-gray-400">
                        Tipo: {nft.metadata?.achievement_type || 'unknown'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-sm">
                  No hay NFTs disponibles para equipar
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Active Session */}
      {activeSession && (
        <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <h2 className="text-xl font-bold text-green-400">
                Sesión Activa
              </h2>
            </div>
            <div className="text-sm text-gray-400">
              Iniciada: {new Date(activeSession.started_at).toLocaleString()}
            </div>
          </div>

          <ActiveSessionControls
            session={activeSession}
            onUpdate={updateSession}
          />
        </div>
      )}

      {/* Session Creator */}
      {showCreator && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Nueva Sesión de Juego</h2>
            <button
              onClick={() => setShowCreator(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <SessionCreator
            userId={userId}
            onSubmit={handleCreateSession}
            onCancel={() => setShowCreator(false)}
          />
        </div>
      )}

      {/* Sessions List */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Gestión de Sesiones</h2>
          <div className="flex space-x-3">
            <button
              onClick={handleCreateTestSession}
              disabled={!!activeSession}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <FaPlay />
              <span>Sesión de Prueba</span>
            </button>
            <button
              onClick={() => setShowCreator(true)}
              disabled={!!activeSession || showCreator}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <FaPlus />
              <span>Nueva Sesión</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
            <p className="text-gray-400 mt-2">Cargando sesiones...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
            <div className="mb-4">
              <FaPlay className="mx-auto text-4xl text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">
                No hay sesiones de juego
              </h3>
              <p className="text-gray-400 mb-6">
                Crea tu primera sesión para comenzar a jugar y hacer seguimiento de tu progreso.
              </p>
            </div>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={handleCreateTestSession}
                disabled={isCreatingSession}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
              >
                {isCreatingSession ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creando...</span>
                  </>
                ) : (
                  <>
                    <FaPlay />
                    <span>Crear Sesión de Prueba</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowCreator(true)}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
              >
                <FaPlus />
                <span>Crear Sesión Personalizada</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {sessions.map((session: GameSession) => (
              <div
                key={session.documentId}
                className={`bg-gray-800 border rounded-lg p-6 cursor-pointer transition-all ${
                  selectedSession === session.documentId
                    ? "border-blue-500 bg-gray-750"
                    : "border-gray-700 hover:border-gray-600"
                }`}
                onClick={() =>
                  setSelectedSession(
                    selectedSession === session.documentId
                      ? null
                      : session.documentId
                  )
                }
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        {session.session_name}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          session.game_state === "active"
                            ? "bg-green-900 text-green-300"
                            : session.game_state === "completed"
                            ? "bg-blue-900 text-blue-300"
                            : session.game_state === "paused"
                            ? "bg-yellow-900 text-yellow-300"
                            : "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {session.game_state}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
                      <div>
                        Modo:{" "}
                        <span className="text-white">{session.game_mode}</span>
                      </div>
                      <div>
                        Dificultad:{" "}
                        <span className="text-white">
                          {session.difficulty_level}
                        </span>
                      </div>
                      <div>
                        Duración:{" "}
                        <span className="text-white">
                          {Math.floor(session.duration_seconds / 60)}m
                        </span>
                      </div>
                      <div>
                        Puntuación:{" "}
                        <span className="text-white">
                          {session.final_score}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-sm text-gray-400">
                    {new Date(session.started_at).toLocaleDateString()}
                  </div>
                </div>

                {selectedSession === session.documentId && (
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <SessionDetails session={session} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
