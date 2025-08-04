import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Game } from 'phaser';
import { useNavigate } from 'react-router-dom';
import { GameUI } from '@/components/GameUI';
import { GameMenu } from '@/components/GameMenu';
import { GameInstructions } from '@/components/GameInstructions';
import { GameOverStats } from '@/components/GameOverStats';
import { SkillSelectionModal } from '@/components/SkillSelectionModal';
import { SupplyBoxModal } from '@/components/SupplyBoxModal';
import { BandageButton } from '@/components/BandageButton';
import { HealingIndicator } from '@/components/HealingIndicator';
import { SkillOption } from '@/types/game';
import { LoadingScreen } from '@/components/LoadingScreen';
import { MainScene } from '@/scenes/MainScene';
import { VIEWPORT_CONFIG } from '@/config/gameConfig';
import { useEquipment, type EquipmentStats } from '@/hooks/useEquipment';
import { useAuthStore } from '@/stores/authStore';
import { useGameSessionData } from '@/hooks/useGameSessionData';
import { toast } from 'react-toastify';

interface GameStats {
  health: number;
  maxHealth: number;
  score: number;
  time: number;
  experience: number;
  maxExperience: number;
  level: number;
  skills?: {
    rapidFire: number;
    magneticField: number;
    multiShot: number;
  };
  world?: {
    playerX: number;
    playerY: number;
    activeChunks: number;
    totalChunks: number;
    structures: number;
  };
  minimapData?: {
    playerChunk: { x: number; y: number };
    worldSize: number;
    activeChunks: string[];
    playerPosition: { x: number; y: number };
    enemies?: Array<{
      id: string;
      x: number;
      y: number;
      type: string;
      distance: number;
    }>;
  };
  equipment?: {
    items: Array<{
      name: string;
      type: string;
      rarity: string;
      effects: Array<{
        type: string;
        value: number;
        unit: string;
      }>;
    }>;
    stats: EquipmentStats;
  };
}

export const GamePage: React.FC = () => {
  const navigate = useNavigate();
  const gameRef = useRef<Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Obtener usuario autenticado
  const { user } = useAuthStore();
  
  // Sistema de equipamiento escalable
  const { 
    equipment, 
    isLoading: isEquipmentLoading, 
    error: equipmentError,
    hasLoaded: hasEquipmentLoaded,
    reloadEquipment 
  } = useEquipment(user?.id);

  // Obtener datos de la sesión de juego
  const { sessions } = useGameSessionData(user ? parseInt(user.id) : 0);
  
  // Obtener la sesión activa (la primera sesión del usuario)
  const activeSession = sessions.length > 0 ? sessions[0] : null;
  
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [finalStats, setFinalStats] = useState<any>(null);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showGameMenu, setShowGameMenu] = useState(false);
  const [showSupplyBoxModal, setShowSupplyBoxModal] = useState(false);
  const [supplyBoxMaterials, setSupplyBoxMaterials] = useState<any>({});
  const [currentLevel, setCurrentLevel] = useState(1);
  const [availableSkills, setAvailableSkills] = useState<SkillOption[]>([]);
  const [enemiesKilled, setEnemiesKilled] = useState(0);
  const [isWorldLoading, setIsWorldLoading] = useState(false);
  const [bandageStats, setBandageStats] = useState({
    medicineInventory: 0,
    canUse: false,
    cooldownRemaining: 0,
    healProgress: 0,
    isHealing: false,
    totalHealAmount: 0
  });
  const [gameStats, setGameStats] = useState<GameStats>({
    health: 100,
    maxHealth: 100,
    score: 0,
    time: 0,
    experience: 0,
    maxExperience: 100,
    level: 1
  });

  // Daily Quests state
  const [dailyQuests, setDailyQuests] = useState<any[]>([]);
  const [questProgress, setQuestProgress] = useState<any>(null);
  const [completedQuests, setCompletedQuests] = useState<any[]>([]);

  // Optimización: usar useCallback para evitar re-renders innecesarios
  const handleUIUpdate = useCallback((gameStats: GameStats) => {
    setGameStats(gameStats);
  }, []);

  // Manejar eventos de subida de nivel
  const handleLevelUp = useCallback((levelUpData: any) => {
    console.log('🎯 GamePage: Recibido evento levelUp:', levelUpData);
    setCurrentLevel(levelUpData.level);
    setAvailableSkills(levelUpData.skills || []);
    setShowSkillModal(true);
  }, []);

  // Manejar selección de habilidad
  const handleSkillSelection = useCallback((skillId: string) => {
    console.log('🎯 GamePage: Seleccionando habilidad:', skillId);
    if (gameRef.current) {
      const mainScene = gameRef.current.scene.getScene('MainScene') as MainScene;
      if (mainScene) {
        mainScene.selectSkill(skillId);
      }
    }
    setShowSkillModal(false);
  }, []);

  const handleGameOver = useCallback((stats: any) => {
    console.log('🎮 GamePage: Recibido evento gameOver:', stats);
    setFinalStats(stats);
    setGameOver(true);
    console.log('🎮 GamePage: Modal de game over activado');
  }, []);

  const handleEnemyKilled = useCallback(() => {
    setEnemiesKilled(prev => prev + 1);
  }, []);

  const handleWorldLoading = useCallback((loading: boolean) => {
    setIsWorldLoading(loading);
  }, []);

  const handleSupplyBoxCollected = useCallback((boxData: any) => {
    console.log('📦 GamePage: Caja de suministros recolectada:', boxData);
    setSupplyBoxMaterials(boxData.materials);
    setShowSupplyBoxModal(true);
  }, []);

  const handleBandageStarted = useCallback((bandageData: any) => {
    console.log('🩹 GamePage: Curación iniciada:', bandageData);
    // Actualizar estadísticas del vendaje
    if (gameRef.current) {
      const mainScene = gameRef.current.scene.getScene('MainScene') as MainScene;
      if (mainScene) {
        setBandageStats(mainScene.getBandageStats());
      }
    }
  }, []);

  const handleBandageProgress = useCallback((bandageData: any) => {
    console.log('🩹 GamePage: Progreso de curación:', bandageData);
    // Actualizar estadísticas del vendaje
    if (gameRef.current) {
      const mainScene = gameRef.current.scene.getScene('MainScene') as MainScene;
      if (mainScene) {
        setBandageStats(mainScene.getBandageStats());
      }
    }
  }, []);

  const handleBandageCompleted = useCallback((bandageData: any) => {
    console.log('🩹 GamePage: Curación completada:', bandageData);
    // Actualizar estadísticas del vendaje
    if (gameRef.current) {
      const mainScene = gameRef.current.scene.getScene('MainScene') as MainScene;
      if (mainScene) {
        setBandageStats(mainScene.getBandageStats());
      }
    }
  }, []);

  // Daily Quests handlers
  const handleQuestCompleted = useCallback((data: { quest: any; reward: number }) => {
    console.log('🎯 GamePage: Misión completada:', data.quest.title);
    
    // Mostrar notificación con toastify
    toast.success(`🎯 ¡Misión completada! ${data.quest.title} - Recompensa: ${data.reward} alimentos`, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });

    // Actualizar estado de misiones
    updateDailyQuestsState();
  }, []);

  const handleAllQuestsCompleted = useCallback((data: { totalReward: number; quests: any[] }) => {
    console.log('🏆 GamePage: Todas las misiones completadas!');
    
    // Mostrar notificación especial
    toast.success(`🏆 ¡Todas las misiones diarias completadas! Recompensa total: ${data.totalReward} alimentos`, {
      position: "top-right",
      autoClose: 7000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });

    // Actualizar estado de misiones
    updateDailyQuestsState();
  }, []);

  const updateDailyQuestsState = useCallback(() => {
    if (gameRef.current) {
      const mainScene = gameRef.current.scene.getScene('MainScene') as MainScene;
      if (mainScene) {
        setDailyQuests(mainScene.getDailyQuests());
        setQuestProgress(mainScene.getQuestProgress());
        setCompletedQuests(mainScene.getCompletedQuests());
      }
    }
  }, []);

  // Actualizar estado de misiones diarias en tiempo real
  useEffect(() => {
    if (!gameStarted || gameOver) return; // Detener cuando el juego termine

    const interval = setInterval(() => {
      if (gameRef.current) {
        const mainScene = gameRef.current.scene.getScene('MainScene') as MainScene;
        if (mainScene) {
          setDailyQuests(mainScene.getDailyQuests());
          setQuestProgress(mainScene.getQuestProgress());
          setCompletedQuests(mainScene.getCompletedQuests());
        }
      }
    }, 1000); // Actualizar cada segundo

    return () => clearInterval(interval);
  }, [gameStarted, gameOver]); // Agregar gameOver como dependencia

  // Cargar equipamiento solo una vez cuando el usuario esté disponible
  useEffect(() => {
    if (user?.id && !hasEquipmentLoaded && !isEquipmentLoading) {
      console.log('🎮 Cargando equipamiento inicial para usuario:', user.id);
      reloadEquipment();
    }
  }, [user?.id, hasEquipmentLoaded, isEquipmentLoading, reloadEquipment]);

  // Timer para actualizar estadísticas del vendaje
  useEffect(() => {
    if (!gameStarted || gameOver) return; // Detener cuando el juego termine

    const interval = setInterval(() => {
      if (gameRef.current) {
        const mainScene = gameRef.current.scene.getScene('MainScene') as MainScene;
        if (mainScene) {
          setBandageStats(mainScene.getBandageStats());
        }
      }
    }, 100); // Actualizar cada 100ms para animaciones suaves

    return () => clearInterval(interval);
  }, [gameStarted, gameOver]); // Agregar gameOver como dependencia

  // Mostrar información del equipamiento cargado (solo una vez)
  useEffect(() => {
    if (equipment && equipment.items.length > 0 && hasEquipmentLoaded) {
      console.log('🎮 Equipamiento cargado:', {
        items: equipment.items.length,
        stats: equipment.stats,
        effects: equipment.totalEffects
      });
    }
  }, [equipment, hasEquipmentLoaded]);

  // Calculate responsive dimensions while maintaining 16:9 aspect ratio
  const calculateGameDimensions = () => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Calculate dimensions based on window size while maintaining 16:9 aspect ratio
    let gameWidth = Math.min(windowWidth, VIEWPORT_CONFIG.MAX_WIDTH);
    let gameHeight = gameWidth / VIEWPORT_CONFIG.ASPECT_RATIO;
    
    // If height is too tall for the window, scale based on height instead
    if (gameHeight > windowHeight) {
      gameHeight = Math.min(windowHeight, VIEWPORT_CONFIG.MAX_HEIGHT);
      gameWidth = gameHeight * VIEWPORT_CONFIG.ASPECT_RATIO;
    }
    
    // Ensure minimum dimensions
    gameWidth = Math.max(gameWidth, VIEWPORT_CONFIG.MIN_WIDTH);
    gameHeight = Math.max(gameHeight, VIEWPORT_CONFIG.MIN_HEIGHT);
    
    return { width: gameWidth, height: gameHeight };
  };

  useEffect(() => {
    if (containerRef.current && !gameRef.current && gameStarted) {
      calculateGameDimensions();
      
      // Phaser game configuration with fixed 16:9 aspect ratio
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: VIEWPORT_CONFIG.BASE_WIDTH,
        height: VIEWPORT_CONFIG.BASE_HEIGHT,
        parent: containerRef.current,
        backgroundColor: 'transparent', // Fondo transparente para que se vea el mundo procedural
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          width: VIEWPORT_CONFIG.BASE_WIDTH,
          height: VIEWPORT_CONFIG.BASE_HEIGHT
        },
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: false // Debug desactivado - usar colisiones del JSON
          }
        },
        scene: [MainScene]
      };

      gameRef.current = new Game(config);

      // Listen to game events - wait for scene to be ready
      setTimeout(() => {
        const mainScene = gameRef.current?.scene.getScene('MainScene') as MainScene;
        if (mainScene) {
          console.log('🎮 GamePage: Registrando eventos de MainScene');
          
          // Establecer el sessionId en el GameStateManager si existe una sesión activa
          if (activeSession?.documentId) {
            mainScene.gameStateManager?.setSessionId(activeSession.documentId);
            console.log('🎮 GamePage: SessionId establecido:', activeSession.documentId);
          }
          
          mainScene.events.on('updateUI', handleUIUpdate);
          mainScene.events.on('gameOver', handleGameOver);
          mainScene.events.on('levelUpModal', handleLevelUp);
          mainScene.events.on('enemyKilled', handleEnemyKilled);
          mainScene.events.on('worldLoading', handleWorldLoading);
          mainScene.events.on('supplyBoxCollected', handleSupplyBoxCollected);
          mainScene.events.on('bandageStarted', handleBandageStarted);
          mainScene.events.on('bandageProgress', handleBandageProgress);
          mainScene.events.on('bandageCompleted', handleBandageCompleted);
          mainScene.events.on('questCompleted', handleQuestCompleted);
          mainScene.events.on('allQuestsCompleted', handleAllQuestsCompleted);
        } else {
          console.error('❌ GamePage: No se pudo obtener MainScene');
        }
      }, 100);
    }

    // Handle window resize - maintain aspect ratio
    const handleResize = () => {
      if (gameRef.current && containerRef.current) {
        // The scale manager will handle the resize automatically with FIT mode
        gameRef.current.scale.refresh();
      }
    };

    // Handle visibility change (console open/close, tab change)
    const handleVisibilityChange = () => {
      if (gameRef.current) {
        const mainScene = gameRef.current.scene.getScene('MainScene') as MainScene;
        if (mainScene) {
          if (document.hidden || document.visibilityState === 'hidden') {
            // Pause game when tab is hidden or console is opened
            mainScene.scene.pause();
          } else {
            // Resume game when tab is visible again
            mainScene.scene.resume();
          }
        }
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Clean up game events
      if (gameRef.current) {
        try {
          const mainScene = gameRef.current.scene.getScene('MainScene') as MainScene;
          if (mainScene && mainScene.events) {
            mainScene.events.off('updateUI', handleUIUpdate);
            mainScene.events.off('gameOver', handleGameOver);
            mainScene.events.off('levelUp', handleLevelUp);
                      mainScene.events.off('enemyKilled', handleEnemyKilled);
          mainScene.events.off('worldLoading', handleWorldLoading);
          mainScene.events.off('supplyBoxCollected', handleSupplyBoxCollected);
          mainScene.events.off('bandageStarted', handleBandageStarted);
          mainScene.events.off('bandageProgress', handleBandageProgress);
          mainScene.events.off('bandageCompleted', handleBandageCompleted);
          mainScene.events.off('questCompleted', handleQuestCompleted);
          mainScene.events.off('allQuestsCompleted', handleAllQuestsCompleted);
          }
        } catch (error) {
          console.warn('Error cleaning up events:', error);
        }
        
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [gameStarted, handleUIUpdate, handleLevelUp, handleGameOver, handleQuestCompleted, handleAllQuestsCompleted]);

  const handleGameStart = () => {
    setGameStarted(true);
    setGameOver(false);
    
    // Aplicar estadísticas del equipamiento al iniciar el juego
    if (equipment && equipment.stats) {
      console.log('🎮 Aplicando estadísticas del equipamiento al juego:', equipment.stats);
      
      // Actualizar gameStats con las estadísticas del equipamiento
      setGameStats(prev => ({
        ...prev,
        maxHealth: equipment.stats.maxHealth,
        health: equipment.stats.maxHealth, // Comenzar con vida máxima
        equipment: {
          items: equipment.items.map(item => ({
            name: item.name,
            type: item.type,
            rarity: item.rarity,
            effects: item.effects.map(effect => ({
              type: effect.type,
              value: effect.value,
              unit: effect.unit
            }))
          })),
          stats: equipment.stats
        }
      }));
    }

    // Inicializar inventario de vendajes desde los datos de la sesión
    let medicineAmount = 0; // Valor por defecto
    
    if (sessions.length > 0) {
      const currentSession = sessions.find(s => s.session_name?.includes('Sesión Inicial')) || sessions[0];
      if (currentSession?.materials?.medicine !== undefined) {
        medicineAmount = currentSession.materials.medicine;
        console.log('🩹 Inicializando inventario de vendajes con medicina de la sesión:', medicineAmount);
      } else {
        console.log('🩹 No se encontró medicina en la sesión, usando valor por defecto: 0');
      }
    } else {
      console.log('🩹 No hay sesiones disponibles, usando valor por defecto: 0');
    }
    
    // Inicializar el BandageManager con la medicina disponible
    if (gameRef.current) {
      const mainScene = gameRef.current.scene.getScene('MainScene') as MainScene;
      if (mainScene) {
        mainScene.initializeBandageInventory(medicineAmount);
        // Actualizar las estadísticas del vendaje
        setBandageStats(mainScene.getBandageStats());
        
        // Inicializar estado de misiones diarias
        setDailyQuests(mainScene.getDailyQuests());
        setQuestProgress(mainScene.getQuestProgress());
        setCompletedQuests(mainScene.getCompletedQuests());
        
        console.log('🎯 GamePage: Estado de misiones diarias inicializado');
        console.log('🎯 Misiones diarias:', mainScene.getDailyQuests());
        console.log('🎯 Progreso de misiones:', mainScene.getQuestProgress());
      }
    }
  };

  const handleRestart = () => {
    if (gameRef.current) {
      const mainScene = gameRef.current.scene.getScene('MainScene') as MainScene;
      if (mainScene) {
        // Remove old event listeners before restart
        mainScene.events.off('updateUI', handleUIUpdate);
        mainScene.events.off('gameOver', handleGameOver);
        mainScene.events.off('levelUp', handleLevelUp);
        mainScene.events.off('enemyKilled', handleEnemyKilled);
        mainScene.events.off('worldLoading', handleWorldLoading);
        
        // Restart the scene
        mainScene.scene.restart();
        
        // Re-register event listeners after restart
        setTimeout(() => {
          const restartedScene = gameRef.current?.scene.getScene('MainScene') as MainScene;
          if (restartedScene) {
            restartedScene.events.on('updateUI', handleUIUpdate);
            restartedScene.events.on('gameOver', handleGameOver);
            restartedScene.events.on('levelUpModal', handleLevelUp);
                      restartedScene.events.on('enemyKilled', handleEnemyKilled);
          restartedScene.events.on('worldLoading', handleWorldLoading);
          restartedScene.events.on('supplyBoxCollected', handleSupplyBoxCollected);
          restartedScene.events.on('bandageStarted', handleBandageStarted);
          restartedScene.events.on('bandageProgress', handleBandageProgress);
          restartedScene.events.on('bandageCompleted', handleBandageCompleted);
          restartedScene.events.on('questCompleted', handleQuestCompleted);
          restartedScene.events.on('allQuestsCompleted', handleAllQuestsCompleted);
          }
        }, 100);
      }
    }
    
    // Reset UI state
    setGameOver(false);
    setFinalStats(null);
    setShowSkillModal(false);
    setShowGameMenu(false);
    setShowSupplyBoxModal(false);
    setSupplyBoxMaterials({});
    setCurrentLevel(1);
    setAvailableSkills([]);
    setEnemiesKilled(0);
    setIsWorldLoading(false);
    setBandageStats({
      medicineInventory: 0,
      canUse: false,
      cooldownRemaining: 0,
      healProgress: 0,
      isHealing: false,
      totalHealAmount: 0
    });
    setGameStats({
      health: 100,
      maxHealth: 100,
      score: 0,
      time: 0,
      experience: 0,
      maxExperience: 100,
      level: 1,
      skills: { rapidFire: 0, magneticField: 0, multiShot: 0 }
    });
  };

  const handleMainMenu = () => {
    navigate('/lobby');
  };

  const handleMenuToggle = useCallback(() => {
    console.log('🎮 handleMenuToggle llamado, showGameMenu:', showGameMenu);
    if (gameRef.current) {
      const mainScene = gameRef.current.scene.getScene('MainScene') as MainScene;
      if (mainScene) {
        if (!showGameMenu) {
          // Abrir menú - pausar juego
          console.log('🎮 Pausando juego...');
          mainScene.pauseGame();
        } else {
          // Cerrar menú - reanudar juego
          console.log('🎮 Reanudando juego...');
          mainScene.resumeGame();
        }
      } else {
        console.error('❌ No se pudo obtener MainScene');
      }
    } else {
      console.error('❌ gameRef.current es null');
    }
    setShowGameMenu(prev => !prev);
  }, [showGameMenu]);

  const handleMenuClose = useCallback(() => {
    if (gameRef.current) {
      const mainScene = gameRef.current.scene.getScene('MainScene') as MainScene;
      if (mainScene) {
        mainScene.resumeGame();
      }
    }
    setShowGameMenu(false);
  }, []);

  const handleUseBandage = useCallback(() => {
    if (gameRef.current) {
      const mainScene = gameRef.current.scene.getScene('MainScene') as MainScene;
      if (mainScene) {
        const success = mainScene.useBandage();
        if (success) {
          // Actualizar estadísticas del vendaje
          setBandageStats(mainScene.getBandageStats());
        }
      }
    }
  }, []);

  return (
    <div className="w-full h-screen bg-gray-900 flex items-center justify-center relative overflow-hidden">
      {/* Phaser Game Container - Fixed 16:9 aspect ratio */}
      <div 
        ref={containerRef} 
        id="phaser-game" 
        className="relative z-10 max-w-full max-h-full"
        style={{
          aspectRatio: '16/9',
          width: '100%',
          height: '100%',
          maxWidth: '100vw',
          maxHeight: '100vh'
        }}
      />
      
      {/* Loading Screen */}
      <LoadingScreen 
        isVisible={isWorldLoading && gameStarted} 
        message="Generando mundo procedural..."
      />

      {/* Equipment Loading Indicator */}
      {isEquipmentLoading && (
        <div className="absolute top-4 right-4 z-50 bg-blue-900/90 backdrop-blur-sm rounded-lg p-3 border border-blue-700/50">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
            <span className="text-blue-400 text-sm font-semibold">Cargando equipamiento...</span>
          </div>
        </div>
      )}

      {/* Equipment Error Indicator */}
      {equipmentError && (
        <div className="absolute top-4 right-4 z-50 bg-red-900/90 backdrop-blur-sm rounded-lg p-3 border border-red-700/50">
          <div className="flex items-center space-x-2">
            <span className="text-red-400 text-sm font-semibold">Error: {equipmentError}</span>
          </div>
        </div>
      )}

      {/* React UI Overlay */}
      {gameStarted && (
        <GameUI 
          health={gameStats.health}
          maxHealth={gameStats.maxHealth}
          score={gameStats.score}
          time={gameStats.time}
          experience={gameStats.experience}
          maxExperience={gameStats.maxExperience}
          level={gameStats.level}
          skills={gameStats.skills}
          world={gameStats.world}
          equipment={gameStats.equipment}
          onMenuToggle={handleMenuToggle}
          minimapData={gameStats.minimapData}
        />
      )}

      {/* Game Menu */}
      <GameMenu
        isOpen={showGameMenu}
        onClose={handleMenuClose}
        onLogout={handleMainMenu}
        userId={user?.id || '0'}
        playerStats={{
          level: gameStats.level,
          enemiesKilled: enemiesKilled,
          skills: gameStats.skills || { rapidFire: 0, magneticField: 0, multiShot: 0 }
        }}
        equipment={gameStats.equipment}
        dailyQuests={dailyQuests}
        questProgress={questProgress}
        completedQuests={completedQuests}
      />
      
      {/* Game Instructions */}
      {!gameStarted && <GameInstructions onStart={handleGameStart} />}
      
      {/* Skill Selection Modal */}
      <SkillSelectionModal
        isOpen={showSkillModal}
        level={currentLevel}
        skills={availableSkills}
        onSkillSelect={handleSkillSelection}
        onClose={() => {
          console.log('🎯 GamePage: Cerrando modal de habilidades');
          // Forzar selección de la primera habilidad disponible si se cierra sin elegir
          const firstAvailableSkill = availableSkills.find(skill => skill.currentLevel < skill.maxLevel);
          if (firstAvailableSkill) {
            handleSkillSelection(firstAvailableSkill.id);
          } else {
            setShowSkillModal(false);
          }
        }}
      />

      {/* Game Over Screen */}
      {gameOver && finalStats && (
        <GameOverStats
          score={finalStats.score}
          time={finalStats.time}
          level={finalStats.level}
          reason={finalStats.reason}
          survivalBonus={finalStats.survivalBonus}
          onRestart={handleRestart}
          onMainMenu={handleMainMenu}
        />
      )}

      {/* Supply Box Modal */}
      <SupplyBoxModal
        isOpen={showSupplyBoxModal}
        materials={supplyBoxMaterials}
        onClose={() => setShowSupplyBoxModal(false)}
      />

      {/* Bandage Button */}
      {gameStarted && (
        <BandageButton
          medicineInventory={bandageStats.medicineInventory}
          canUse={bandageStats.canUse}
          cooldownRemaining={bandageStats.cooldownRemaining}
          useProgress={bandageStats.healProgress}
          isUsing={bandageStats.isHealing}
          onUseBandage={handleUseBandage}
        />
      )}

      {/* Healing Indicator */}
      {gameStarted && (
        <HealingIndicator
          isHealing={bandageStats.isHealing}
          healProgress={bandageStats.healProgress}
          totalHealAmount={bandageStats.totalHealAmount}
        />
      )}

      {/* Daily Quests Progress Indicator - OCULTO */}
      {/* {gameStarted && dailyQuests.length > 0 && (
        <div className="fixed top-4 right-4 z-50 bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-gray-600 max-w-xs">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-yellow-400 text-lg">🎯</span>
            <h3 className="text-white font-semibold text-sm">Misiones Diarias</h3>
            <button
              onClick={() => {
                if (gameRef.current) {
                  const mainScene = gameRef.current.scene.getScene('MainScene') as MainScene;
                  if (mainScene && mainScene.dailyQuestManager) {
                    console.log('🔍 Iniciando debug de misiones...');
                    mainScene.dailyQuestManager.reloadQuestsFromStorage();
                    mainScene.dailyQuestManager.forceUpdateProgress();
                    mainScene.dailyQuestManager.verifyAndFixQuests();
                    mainScene.dailyQuestManager.forceCompleteQuests();
                    mainScene.dailyQuestManager.debugQuests();
                    mainScene.dailyQuestManager.forceCheckProgress();
                    
                    setTimeout(() => {
                      setDailyQuests(mainScene.getDailyQuests());
                      setQuestProgress(mainScene.getQuestProgress());
                      setCompletedQuests(mainScene.getCompletedQuests());
                    }, 100);
                  }
                }
              }}
              className="ml-auto text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
              title="Debug misiones"
            >
              🔍
            </button>
          </div>
          <div className="space-y-2">
            {dailyQuests.slice(0, 3).map((quest) => (
              <div key={quest.id} className="text-xs">
                <div className="flex justify-between text-white mb-1">
                  <span className="truncate">{quest.title}</span>
                  <span className={`font-semibold ${quest.completed ? 'text-green-400' : 'text-gray-300'}`}>
                    {quest.progress}/{quest.target}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full transition-all duration-300 ${
                      quest.completed
                        ? 'bg-gradient-to-r from-green-500 to-green-400'
                        : 'bg-gradient-to-r from-blue-500 to-purple-500'
                    }`}
                    style={{ width: `${(quest.progress / quest.target) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )} */}
    </div>
  );
};