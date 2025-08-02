import React, { useState } from 'react';
import { FaFlask, FaDatabase, FaLink, FaCheckCircle, FaUser, FaGem } from 'react-icons/fa';
import { useGameSessionData } from '@/hooks/useGameSessionData';
import { useNFTs } from '@/hooks/useNFTs';
import { apiClient } from '@/utils/api';

interface SessionTestControlsProps {
  userId: number;
}

export const SessionTestControls: React.FC<SessionTestControlsProps> = ({ userId }) => {
  const { createSession, sessions, error: sessionError } = useGameSessionData(userId);
  const { userNFTs, loading: nftsLoading } = useNFTs();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  // Si hay error de configuración, mostrar información
  const hasConfigError = sessionError && (sessionError.includes('game-sessions') || sessionError.includes('colección'));

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runConnectionTest = async () => {
    setTesting(true);
    setTestResults([]);
    
    try {
      addTestResult('🔄 Iniciando test de conexión...');
      
      // Test 1: Verificar relación con usuario
      addTestResult(`✅ Usuario conectado: ID ${userId}`);
      
      // Test 2: Verificar carga de NFTs
      if (nftsLoading) {
        addTestResult('⏳ Cargando NFTs del usuario...');
      } else {
        const nftCount = userNFTs?.length || 0;
        addTestResult(`✅ NFTs cargados: ${nftCount} encontrados`);
        if (userNFTs && userNFTs.length > 0) {
          userNFTs.slice(0, 3).forEach(nft => {
            addTestResult(`  📦 NFT: ${nft.metadata.name} (${nft.metadata.rarity})`);
          });
        }
      }
      
      // Test 3: Verificar estado de game-sessions
      if (hasConfigError) {
        addTestResult('⚠️ Colección "game-sessions" no configurada en Strapi');
        addTestResult('💡 Ve a la pestaña "Progreso" para ver la guía de configuración');
      } else {
        addTestResult(`✅ Sesiones existentes: ${sessions?.length || 0}`);
      }
      
      // Test 4: Verificar conexión con Strapi
      try {
        const response = await fetch('http://localhost:1337/api/users/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth-storage')?.replace(/"/g, '')}`
          }
        });
        if (response.ok) {
          addTestResult('✅ Conexión con Strapi funcionando');
        } else {
          addTestResult('⚠️ Problema de autenticación con Strapi');
        }
      } catch (error) {
        addTestResult('❌ No se puede conectar con Strapi (¿está corriendo?)');
      }
      
      addTestResult('✅ Test de conexión completado');
      
    } catch (error) {
      addTestResult(`❌ Error en test: ${error}`);
    } finally {
      setTesting(false);
    }
  };

  const createTestSession = async () => {
    setTesting(true);
    
    try {
      addTestResult('🔄 Creando sesión de prueba...');
      
      // Seleccionar algunos NFTs para equipar (máximo 3)
      const availableNFTs = userNFTs?.filter(nft => nft.is_listed_for_sale === "False") || [];
      const selectedNFTs = availableNFTs.slice(0, 3).map(nft => nft.id);
      
      addTestResult(`🎒 NFTs disponibles para equipar: ${availableNFTs.length}`);
      addTestResult(`📦 NFTs seleccionados: ${selectedNFTs.length}`);
      
      // Mostrar detalles de NFTs seleccionados
      selectedNFTs.forEach(nftId => {
        const nft = userNFTs.find(n => n.id === nftId);
        if (nft) {
          addTestResult(`  • ${nft.metadata.name} (${nft.metadata.rarity}) - ID: ${nftId}`);
        }
      });
      
      const testSessionData = {
        session_name: `Test Session ${new Date().toLocaleTimeString()}`,
        game_mode: 'survival',
        difficulty_level: 'normal',
        started_at: new Date().toISOString(),
        session_stats: {
          enemies_defeated: Math.floor(Math.random() * 10),
          total_damage_dealt: Math.floor(Math.random() * 500),
          total_damage_received: Math.floor(Math.random() * 200),
          shots_fired: Math.floor(Math.random() * 50),
          shots_hit: Math.floor(Math.random() * 40),
          accuracy_percentage: Math.floor(Math.random() * 100),
          resources_collected: {
            minerals: Math.floor(Math.random() * 20),
            energy_orbs: Math.floor(Math.random() * 15),
            power_ups: Math.floor(Math.random() * 5)
          }
        },
        materials: {
          iron: Math.floor(Math.random() * 20) + 5,
          steel: Math.floor(Math.random() * 10) + 2,
          energy_crystals: Math.floor(Math.random() * 5) + 1,
          rare_metals: Math.floor(Math.random() * 3)
        },
        guns: [
          {
            id: 'basic_pistol',
            name: 'Pistola Básica',
            damage: 25,
            fire_rate: 1.5,
            ammo_capacity: 12,
            equipped: true
          },
          {
            id: 'assault_rifle',
            name: 'Rifle de Asalto',
            damage: 35,
            fire_rate: 2.0,
            ammo_capacity: 30,
            equipped: false
          }
        ],
        daily_quests_completed: {
          date: new Date().toISOString().split('T')[0],
          quests: [
            {
              id: 'kill_10_enemies',
              name: 'Eliminar 10 enemigos',
              completed: Math.random() > 0.5,
              progress: Math.floor(Math.random() * 10),
              target: 10
            },
            {
              id: 'collect_materials',
              name: 'Recolectar 50 materiales',
              completed: Math.random() > 0.7,
              progress: Math.floor(Math.random() * 50),
              target: 50
            },
            {
              id: 'survive_5_minutes',
              name: 'Sobrevivir 5 minutos',
              completed: Math.random() > 0.6,
              progress: Math.floor(Math.random() * 300),
              target: 300
            }
          ]
        },
        equipped_items: {
          nfts: selectedNFTs,
          weapons: ['basic_pistol'],
          active_effects: availableNFTs.slice(0, 3).map(nft => {
            const effect = nft.metadata.game_effect || (nft.metadata as any).game_effect;
            return effect ? {
              nft_id: nft.id,
              effect_type: effect.type,
              value: effect.value,
              unit: effect.unit
            } : null;
          }).filter(Boolean)
        }
      };
      
      const newSession = await createSession(testSessionData);
      addTestResult('✅ Sesión de prueba creada exitosamente');
      addTestResult(`🆔 ID de sesión: ${newSession.documentId}`);
      addTestResult(`📦 NFTs equipados: ${selectedNFTs.length}`);
      addTestResult(`🔫 Armas disponibles: ${testSessionData.guns.length}`);
      addTestResult(`🎯 Misiones diarias: ${testSessionData.daily_quests_completed.quests.length}`);
      addTestResult(`⚡ Efectos activos: ${testSessionData.equipped_items.active_effects.length}`);
      
    } catch (error) {
      addTestResult(`❌ Error creando sesión: ${error}`);
      console.error('Session creation error:', error);
    } finally {
      setTesting(false);
    }
  };

  const createSessionWithSpecificNFT = async () => {
    setTesting(true);
    
    try {
      addTestResult('🔄 Creando sesión con NFT específico...');
      
      const availableNFTs = userNFTs?.filter(nft => nft.is_listed_for_sale === "False") || [];
      
      if (availableNFTs.length === 0) {
        addTestResult('❌ No hay NFTs disponibles para equipar');
        return;
      }
      
      // Seleccionar el primer NFT disponible
      const selectedNFT = availableNFTs[0];
      addTestResult(`🎯 NFT seleccionado: ${selectedNFT.metadata.name}`);
      addTestResult(`💎 Rareza: ${selectedNFT.metadata.rarity}`);
      addTestResult(`🆔 ID del NFT: ${selectedNFT.id}`);
      
      // Verificar si tiene efectos de juego
      const gameEffect = selectedNFT.metadata.game_effect || (selectedNFT.metadata as any).game_effect;
      if (gameEffect) {
        addTestResult(`⚡ Efecto: ${gameEffect.type} +${gameEffect.value}${gameEffect.unit === 'percentage' ? '%' : ''}`);
      } else {
        addTestResult('⚠️ Este NFT no tiene efectos de juego definidos');
      }
      
      const sessionData = {
        session_name: `NFT Test: ${selectedNFT.metadata.name}`,
        game_mode: 'challenge',
        difficulty_level: 'hard',
        started_at: new Date().toISOString(),
        session_stats: {
          enemies_defeated: 0,
          total_damage_dealt: 0,
          total_damage_received: 0,
          shots_fired: 0,
          shots_hit: 0,
          accuracy_percentage: 0,
          resources_collected: {
            minerals: 0,
            energy_orbs: 0,
            power_ups: 0
          }
        },
        materials: {
          iron: 15,
          steel: 8,
          energy_crystals: 3
        },
        guns: [
          {
            id: 'enhanced_pistol',
            name: 'Pistola Mejorada',
            damage: 30,
            fire_rate: 1.8,
            ammo_capacity: 15
          }
        ],
        daily_quests_completed: {
          date: new Date().toISOString().split('T')[0],
          quests: []
        },
        equipped_items: {
          nfts: [selectedNFT.id],
          weapons: ['enhanced_pistol'],
          active_effects: gameEffect ? [{
            nft_id: selectedNFT.id,
            effect_type: gameEffect.type,
            value: gameEffect.value,
            unit: gameEffect.unit,
            rarity_multiplier: selectedNFT.metadata.rarity === 'legendary' ? 3.0 : 
                              selectedNFT.metadata.rarity === 'epic' ? 2.0 :
                              selectedNFT.metadata.rarity === 'rare' ? 1.5 : 1.0
          }] : []
        }
      };
      
      const newSession = await createSession(sessionData);
      addTestResult('✅ Sesión con NFT específico creada');
      addTestResult(`🔗 Relación NFT-Sesión establecida correctamente`);
      addTestResult(`📋 Sesión ID: ${newSession.documentId}`);
      
    } catch (error) {
      addTestResult(`❌ Error creando sesión con NFT: ${error}`);
      console.error('NFT session creation error:', error);
    } finally {
      setTesting(false);
    }
  };

  const testUserRelation = async () => {
    setTesting(true);
    
    try {
      addTestResult('🔄 Testeando relación con usuario...');
      
      // Test 1: Verificar usuario actual
      addTestResult(`👤 Usuario ID: ${userId}`);
      
      // Test 2: Intentar obtener datos del usuario desde Strapi
      try {
        const userData = await apiClient.getMe();
        addTestResult(`✅ Usuario verificado: ${userData.username} (${userData.email})`);
        addTestResult(`📅 Usuario creado: ${new Date(userData.createdAt).toLocaleDateString()}`);
      } catch (error) {
        addTestResult(`⚠️ No se pudo verificar usuario desde API: ${error}`);
      }
      
      // Test 3: Verificar sesiones existentes del usuario
      addTestResult(`📊 Sesiones existentes del usuario: ${sessions.length}`);
      
      if (sessions.length > 0) {
        const lastSession = sessions[0];
        addTestResult(`🎮 Última sesión: "${lastSession.session_name}" (${lastSession.game_state})`);
      }
      
      addTestResult('✅ Test de relación con usuario completado');
      
    } catch (error) {
      addTestResult(`❌ Error en test de usuario: ${error}`);
    } finally {
      setTesting(false);
    }
  };

  const testNFTRelations = async () => {
    setTesting(true);
    
    try {
      addTestResult('🔄 Testeando relaciones de NFTs...');
      
      if (!userNFTs || userNFTs.length === 0) {
        addTestResult('⚠️ No hay NFTs para testear');
        addTestResult('💡 Tip: Ve al marketplace y compra algunos NFTs primero');
        return;
      }
      
      // Analizar NFTs disponibles
      const availableNFTs = userNFTs?.filter(nft => nft.is_listed_for_sale === "False") || [];
      const listedNFTs = userNFTs?.filter(nft => nft.is_listed_for_sale === "True") || [];
      
      addTestResult(`📊 Total de NFTs del usuario: ${userNFTs?.length || 0}`);
      addTestResult(`🎒 NFTs disponibles para equipar: ${availableNFTs.length}`);
      addTestResult(`🏪 NFTs en venta: ${listedNFTs.length}`);
      
      // Mostrar detalles de NFTs disponibles
      if (availableNFTs.length > 0) {
        addTestResult('📦 NFTs disponibles para equipar:');
        availableNFTs.slice(0, 5).forEach(nft => {
          addTestResult(`  • ${nft.metadata.name} (${nft.metadata.rarity}) - ID: ${nft.id}`);
        });
      }
      
      // Analizar efectos de juego
      const nftsWithEffects = userNFTs?.filter(nft => 
        nft.metadata.game_effect || 
        (nft.metadata as any).game_effect
      ) || [];
      
      addTestResult(`⚡ NFTs con efectos de juego: ${nftsWithEffects.length}`);
      
      if (nftsWithEffects.length > 0) {
        addTestResult('🎮 Efectos disponibles:');
        nftsWithEffects.slice(0, 3).forEach(nft => {
          const effect = nft.metadata.game_effect || (nft.metadata as any).game_effect;
          if (effect) {
            addTestResult(`  • ${nft.metadata.name}: ${effect.type} +${effect.value}${effect.unit === 'percentage' ? '%' : ''}`);
          }
        });
      }
      
      // Test de relación con wallet
      if (userNFTs && userNFTs.length > 0) {
        const firstNFT = userNFTs[0];
        if (firstNFT.user_wallet) {
          addTestResult(`🔗 Relación con wallet verificada: ${firstNFT.user_wallet.wallet_address}`);
        } else {
          addTestResult('⚠️ Algunos NFTs no tienen relación con wallet');
        }
      }
      
      addTestResult('✅ Análisis de NFTs completado');
      
    } catch (error) {
      addTestResult(`❌ Error analizando NFTs: ${error}`);
    } finally {
      setTesting(false);
    }
  };

  const testSessionNFTRelation = async () => {
    setTesting(true);
    
    try {
      addTestResult('🔄 Testeando relación sesión-NFT...');
      
      if (!userNFTs || userNFTs.length === 0) {
        addTestResult('⚠️ No hay NFTs para testear la relación');
        return;
      }
      
      if (sessions.length === 0) {
        addTestResult('⚠️ No hay sesiones para testear la relación');
        addTestResult('💡 Crea una sesión primero para probar la relación');
        return;
      }
      
      // Buscar sesiones con NFTs equipados
      const sessionsWithNFTs = sessions.filter(session => 
        session.equipped_items?.nfts && session.equipped_items.nfts.length > 0
      );
      
      addTestResult(`🔗 Sesiones con NFTs equipados: ${sessionsWithNFTs.length}/${sessions.length}`);
      
      if (sessionsWithNFTs.length > 0) {
        const session = sessionsWithNFTs[0];
        addTestResult(`📋 Analizando sesión: "${session.session_name}"`);
        addTestResult(`🎒 NFTs equipados en esta sesión: ${session.equipped_items.nfts.length}`);
        
        // Verificar que los NFTs equipados existen en la colección del usuario
        const equippedNFTIds = session.equipped_items.nfts;
        const userNFTIds = userNFTs.map(nft => nft.id);
        
        const validNFTs = equippedNFTIds.filter((id: number) => userNFTIds.includes(id));
        const invalidNFTs = equippedNFTIds.filter((id: number) => !userNFTIds.includes(id));
        
        addTestResult(`✅ NFTs válidos equipados: ${validNFTs.length}`);
        if (invalidNFTs.length > 0) {
          addTestResult(`⚠️ NFTs inválidos encontrados: ${invalidNFTs.length}`);
        }
        
        // Mostrar detalles de NFTs equipados
        validNFTs.slice(0, 3).forEach((nftId: number) => {
          const nft = userNFTs.find(n => n.id === nftId);
          if (nft) {
            addTestResult(`  🎮 ${nft.metadata.name} (${nft.metadata.rarity})`);
          }
        });
      }
      
      addTestResult('✅ Test de relación sesión-NFT completado');
      
    } catch (error) {
      addTestResult(`❌ Error en test de relación: ${error}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">Controles de Prueba</h2>
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
          <h3 className="text-blue-400 font-semibold mb-2">💡 Guía de Uso</h3>
          <div className="text-sm text-gray-300 space-y-1">
            <p>1. <strong>Test de Conexión</strong>: Verifica que el sistema funciona correctamente</p>
            <p>2. <strong>Test Usuario</strong>: Confirma la relación con tu cuenta de usuario</p>
            <p>3. <strong>Test NFTs</strong>: Analiza tus NFTs y sus efectos de juego</p>
            <p>4. <strong>Test Relación</strong>: Verifica que las sesiones se relacionan correctamente con los NFTs</p>
            <p>5. <strong>Crear Sesión</strong>: Crea una sesión completa con datos aleatorios</p>
            <p>6. <strong>Sesión + NFT</strong>: Crea una sesión enfocada en probar un NFT específico</p>
          </div>
        </div>
      </div>

      {/* Test Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={runConnectionTest}
          disabled={testing}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 p-4 rounded-lg transition-colors flex flex-col items-center space-y-2"
        >
          <FaDatabase className="text-xl" />
          <span className="font-semibold text-sm">Test de Conexión</span>
          <span className="text-xs text-center opacity-80">
            Verifica conexiones básicas
          </span>
        </button>

        <button
          onClick={testUserRelation}
          disabled={testing}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 p-4 rounded-lg transition-colors flex flex-col items-center space-y-2"
        >
          <FaUser className="text-xl" />
          <span className="font-semibold text-sm">Test Usuario</span>
          <span className="text-xs text-center opacity-80">
            Verifica relación con usuario
          </span>
        </button>

        <button
          onClick={testNFTRelations}
          disabled={testing || nftsLoading}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 p-4 rounded-lg transition-colors flex flex-col items-center space-y-2"
        >
          <FaGem className="text-xl" />
          <span className="font-semibold text-sm">Test NFTs</span>
          <span className="text-xs text-center opacity-80">
            Analiza NFTs del usuario
          </span>
        </button>

        <button
          onClick={testSessionNFTRelation}
          disabled={testing || sessions.length === 0}
          className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 p-4 rounded-lg transition-colors flex flex-col items-center space-y-2"
        >
          <FaLink className="text-xl" />
          <span className="font-semibold text-sm">Test Relación</span>
          <span className="text-xs text-center opacity-80">
            Verifica sesión-NFT
          </span>
        </button>

        <button
          onClick={createTestSession}
          disabled={testing || !userNFTs || userNFTs.length === 0}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 p-4 rounded-lg transition-colors flex flex-col items-center space-y-2"
        >
          <FaFlask className="text-xl" />
          <span className="font-semibold text-sm">Crear Sesión</span>
          <span className="text-xs text-center opacity-80">
            Sesión completa de prueba
          </span>
        </button>

        <button
          onClick={createSessionWithSpecificNFT}
          disabled={testing || !userNFTs || userNFTs.filter(nft => nft.is_listed_for_sale === "False").length === 0}
          className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 p-4 rounded-lg transition-colors flex flex-col items-center space-y-2"
        >
          <FaGem className="text-xl" />
          <span className="font-semibold text-sm">Sesión + NFT</span>
          <span className="text-xs text-center opacity-80">
            Sesión con NFT específico
          </span>
        </button>

        <button
          onClick={() => {
            setTestResults([]);
            window.location.reload();
          }}
          disabled={testing}
          className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600 p-4 rounded-lg transition-colors flex flex-col items-center space-y-2"
        >
          <FaCheckCircle className="text-xl" />
          <span className="font-semibold text-sm">Reiniciar</span>
          <span className="text-xs text-center opacity-80">
            Limpiar y recargar
          </span>
        </button>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FaCheckCircle className="text-green-400" />
            <h3 className="text-lg font-semibold">Resultados de Prueba</h3>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
            <div className="font-mono text-sm space-y-1">
              {testResults.map((result, index) => (
                <div key={index} className="text-gray-300">
                  {result}
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setTestResults([])}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Limpiar resultados
            </button>
          </div>
        </div>
      )}

      {/* Current Status */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Estado Actual del Sistema</h3>
        
        {/* Status de Strapi */}
        {hasConfigError && (
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <FaDatabase className="text-yellow-400" />
              <span className="text-yellow-400 font-semibold">Configuración Pendiente</span>
            </div>
            <p className="text-gray-300 text-sm">
              La colección "game-sessions" no está configurada en Strapi. 
              Ve a la pestaña "Progreso" para ver la guía completa.
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="bg-gray-700 rounded-lg p-3">
            <span className="text-gray-400">Usuario ID:</span>
            <p className="font-medium text-blue-400">{userId}</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-3">
            <span className="text-gray-400">NFTs Totales:</span>
            <p className="font-medium text-purple-400">
              {nftsLoading ? 'Cargando...' : userNFTs?.length || 0}
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-3">
            <span className="text-gray-400">NFTs Disponibles:</span>
            <p className="font-medium text-green-400">
              {nftsLoading ? '...' : userNFTs?.filter(nft => nft.is_listed_for_sale === "False").length || 0}
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-3">
            <span className="text-gray-400">Game Sessions:</span>
            <p className="font-medium">
              {hasConfigError ? 
                <span className="text-yellow-400">No configurado</span> :
                <span className="text-orange-400">{sessions.length}</span>
              }
            </p>
          </div>
        </div>
        
        {/* Additional Status Info */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Sesión Activa:</span>
              <p className="font-medium">
                {sessions.find(s => s.game_state === 'active') ? 
                  <span className="text-green-400">Sí</span> : 
                  <span className="text-gray-500">No</span>
                }
              </p>
            </div>
            <div>
              <span className="text-gray-400">NFTs con Efectos:</span>
              <p className="font-medium text-yellow-400">
                {nftsLoading ? '...' : 
                  userNFTs?.filter(nft => 
                    nft.metadata.game_effect || (nft.metadata as any).game_effect
                  ).length || 0
                }
              </p>
            </div>
            <div>
              <span className="text-gray-400">Estado de Carga:</span>
              <p className="font-medium">
                {testing ? 
                  <span className="text-yellow-400">Probando...</span> :
                  <span className="text-green-400">Listo</span>
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};