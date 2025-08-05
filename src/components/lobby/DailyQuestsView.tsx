import React, { useState, useEffect } from 'react';
import { 
  FaTasks, FaCheck, FaClock, FaTimes, FaSync, FaTrophy, FaRobot, FaDice,
  FaSkull, FaCrosshairs, FaBullseye, FaBomb, FaFirstAid, FaStar, FaStopwatch, FaBox, FaFire
} from 'react-icons/fa';
import { 
  GiCrossedSwords, GiTargeting, GiDeathSkull, GiHourglass, 
  GiBarrel, GiStairsGoal, GiLevelFourAdvanced, GiMachineGun, GiGrenade, GiLaserSparks
} from 'react-icons/gi';
import { BsBox, BsCollection } from 'react-icons/bs';
import { MdLocalHospital, MdHealing } from 'react-icons/md';
import { dailyQuestService } from '../../services/dailyQuestService';
import { gameSessionService } from '../../services/gameSessionService';
import { AIAdviceModal } from './AIAdviceModal';

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  type: string;
  target: number;
  progress: number;
  reward: number;
  completed: boolean;
  completedAt?: string;
}

interface DailyQuestsViewProps {
  userId: string | number;
  onClose: () => void;
}

export const DailyQuestsView: React.FC<DailyQuestsViewProps> = ({ userId, onClose }) => {
  /**
   * SISTEMA DE MISIONES DIARIAS - ARQUITECTURA MEJORADA
   * 
   * 🔄 FLUJO PRINCIPAL:
   * 1. Verificar misiones completadas en backend (daily_quests_completed.date)
   * 2. Si fecha backend = hoy → Sincronizar quests completadas + mostrar pendientes
   * 3. Si fecha backend ≠ hoy → Generar nuevas quests en localStorage
   * 4. Si no hay backend → Usar/generar localStorage
   * 
   * 📅 FORMATO DE FECHAS:
   * - Uso consistente de ISO format (YYYY-MM-DD) como el backend
   * - getCurrentDateISO() centraliza el formato
   * 
   * 🎮 INTEGRACIÓN CON GAMEPLAY:
   * - questProgress se mantiene separado (para tiempo real en juego)
   * - Este sistema maneja el estado final/completado
   * - smartSyncQuests() evita conflictos entre lobby y gameplay
   * 
   * 💾 ALMACENAMIENTO:
   * - localStorage: quests activas del día actual
   * - Backend (Strapi): quests completadas + fecha de completación
   * - Sincronización bidireccional inteligente
   */
  
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>([]);
  const [permanentQuests, setPermanentQuests] = useState<DailyQuest[]>([]);
  const [availableFood, setAvailableFood] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<DailyQuest | null>(null);

  // Función utilitaria para obtener fecha en formato ISO (YYYY-MM-DD)
  const getCurrentDateISO = (): string => {
    return new Date().toISOString().split('T')[0];
  };

  // Función para sincronizar quests sin interferir con el progreso del juego
  const smartSyncQuests = async (): Promise<void> => {
    try {
      const sessionData = await gameSessionService.getUserGameSession(Number(userId));
      const today = getCurrentDateISO();
      
      // Si hay misiones completadas en el backend para hoy, sincronizar
      if (sessionData?.daily_quests_completed?.date === today) {
        console.log('🔄 Sincronizando misiones completadas desde backend');
        
        // También sincronizar el progreso con session_stats si están disponibles
        if (sessionData.session_stats) {
          console.log('📊 Sincronizando progreso con session_stats del backend');
          console.log('📊 Session stats:', sessionData.session_stats);
          
          // Aquí podrías llamar a una función del DailyQuestManager si tuvieras acceso
          // Por ahora, la sincronización se hará cuando se abra el juego
        }
        
        await loadQuestsFromBackend();
      } else {
        console.log('📅 No hay misiones completadas para hoy en el backend');
      }
    } catch (error) {
      console.error('❌ Error en sincronización inteligente:', error);
    }
  };

  // Función para validar que las misiones sean del día actual
  const validateQuestsAreToday = (quests: DailyQuest[]): DailyQuest[] => {
    const today = getCurrentDateISO();
    return quests.filter(quest => {
      // Si la misión está completada, verificar que fue completada hoy
      if (quest.completed && quest.completedAt) {
        const completedDate = new Date(quest.completedAt).toISOString().split('T')[0];
        const isToday = completedDate === today;
        if (!isToday) {
          console.log(`🗑️ Filtrando misión completada en fecha pasada: ${quest.title} (${completedDate})`);
          return false;
        }
        return true;
      }
      
      // Si la misión no está completada, mantenerla (son las nuevas generadas para hoy)
      if (!quest.completed) {
        return true;
      }
      
      // Fallback: mantener misiones sin fecha de completación pero que no estén marcadas como completadas
      return !quest.completed;
    });
  };

  useEffect(() => {
    loadQuestsFromBackend();
    loadPermanentQuests();
    
    // Sincronización inteligente adicional después de 1 segundo
    const syncTimer = setTimeout(() => {
      smartSyncQuests();
    }, 1000);
    
    return () => clearTimeout(syncTimer);
  }, [userId]);

  const loadQuestsFromBackend = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Cargando misiones desde backend para usuario:', userId);
      
      // Obtener datos de la sesión del backend
      const sessionData = await gameSessionService.getUserGameSession(Number(userId));
      const today = getCurrentDateISO(); // Usar función utilitaria
      
      if (sessionData && sessionData.daily_quests_completed) {
        const backendDate = sessionData.daily_quests_completed.date;
        const completedQuests = sessionData.daily_quests_completed.quests || [];
        
        console.log('📅 Fecha backend:', backendDate, '- Fecha hoy:', today);
        console.log('📋 Misiones completadas en backend:', completedQuests.length);
        
        // Verificar si las misiones del backend son del día actual
        if (backendDate === today) {
          // Usar las misiones del backend como referencia principal
          console.log('✅ Usando misiones del backend (mismo día)');
          
          // Filtrar solo las misiones completadas del día actual del backend
          const todayCompletedQuests = completedQuests.filter((quest: any) => {
            // Verificar que la quest fue completada hoy
            if (quest.completedAt) {
              const completedDate = new Date(quest.completedAt).toISOString().split('T')[0];
              const isToday = completedDate === today;
              
              console.log(`🔍 Quest ${quest.id} (${quest.title}): completedAt=${quest.completedAt}, date=${completedDate}, isToday=${isToday}`);
              
              return isToday;
            } else {
              console.log(`⚠️ Quest ${quest.id} (${quest.title}): Sin completedAt, se excluye`);
              return false;
            }
          });
          
          console.log('📋 Total misiones en backend:', completedQuests.length);
          console.log('📋 Misiones completadas hoy (filtradas):', todayCompletedQuests.length);
          console.log('📋 IDs de misiones de hoy:', todayCompletedQuests.map((q: any) => q.id));
          
          // En lugar de usar localStorage, generar solo las misiones faltantes para completar 3
          const completedIds = new Set(todayCompletedQuests.map((q: any) => q.id));
          const missingQuestsCount = Math.max(0, 3 - todayCompletedQuests.length);
          
          console.log('🔢 Misiones faltantes para completar 3:', missingQuestsCount);
          
          // Generar misiones faltantes con IDs únicos que no conflicten
          const missingQuests: DailyQuest[] = [];
          if (missingQuestsCount > 0) {
            const questTemplates = [
              {
                type: 'kill_enemies',
                titles: ['Cazador de Enemigos'],
                descriptions: ['Elimina {target} enemigos'],
                targets: [1], // Target muy bajo para demo
                rewards: [2]
              },
              {
                type: 'destroy_barrels',
                titles: ['Demoledor'],
                descriptions: ['Explota {target} barriles'],
                targets: [1], // Target muy bajo para demo
                rewards: [1]
              },
              {
                type: 'use_bandages',
                titles: ['Médico de Campo'],
                descriptions: ['Aplica {target} vendajes'],
                targets: [3], // Target bajo para demo
                rewards: [1]
              }
            ];

            // Generar IDs únicos basados en timestamp para evitar conflictos
            const timestamp = Date.now();
            for (let i = 0; i < missingQuestsCount; i++) {
              const template = questTemplates[i % questTemplates.length];
              const newId = `daily_${timestamp}_${i + 1}`;
              
              missingQuests.push({
                id: newId,
                title: template.titles[0],
                description: template.descriptions[0].replace('{target}', template.targets[0].toString()),
                type: template.type,
                target: template.targets[0],
                progress: 0,
                reward: template.rewards[0],
                completed: false
              });
              
              console.log(`🆕 Generada misión faltante: ${newId} - ${template.titles[0]}`);
            }
          }
          
          // Combinar misiones completadas del backend + misiones faltantes generadas
          const combinedQuests: DailyQuest[] = [
            // Misiones completadas del backend
            ...todayCompletedQuests.map((backendQuest: any) => ({
              id: backendQuest.id,
              title: backendQuest.title,
              description: backendQuest.description,
              type: backendQuest.type,
              target: backendQuest.target,
              progress: backendQuest.progress || backendQuest.target,
              reward: backendQuest.reward,
              completed: true,
              completedAt: backendQuest.completedAt
            })),
            // Misiones faltantes generadas
            ...missingQuests
          ];
          
          // Validar que todas las misiones sean del día actual antes de mostrarlas
          const validatedQuests = validateQuestsAreToday(combinedQuests);
          console.log('🔍 Misiones después de validación:', validatedQuests.length, '/', combinedQuests.length);
          
          setDailyQuests(validatedQuests);
          
          // Calcular alimentos disponibles basado en misiones pendientes
          const pendingQuests = validatedQuests.filter(q => !q.completed);
          const totalAvailableFood = pendingQuests.reduce((sum, quest) => sum + quest.reward, 0);
          setAvailableFood(totalAvailableFood);
          
          console.log('📊 Estado final:', {
            total: validatedQuests.length,
            completed: validatedQuests.filter(q => q.completed).length,
            pending: pendingQuests.length,
            availableFood: totalAvailableFood
          });
          
        } else {
          // Las misiones del backend son de otro día, generar nuevas
          console.log('📅 Misiones del backend son de otro día, generando nuevas');
          const newQuests = generateNewQuests();
          setDailyQuests(newQuests);
          
          const totalAvailableFood = newQuests.reduce((sum, quest) => sum + quest.reward, 0);
          setAvailableFood(totalAvailableFood);
        }
      } else {
        // No hay datos del backend, usar localStorage o generar nuevas
        console.log('📅 No hay datos del backend, verificando localStorage');
        const localStorageQuests = loadQuestsFromLocalStorage();
        setDailyQuests(localStorageQuests);
        
        const pendingQuests = localStorageQuests.filter(q => !q.completed);
        const totalAvailableFood = pendingQuests.reduce((sum, quest) => sum + quest.reward, 0);
        setAvailableFood(totalAvailableFood);
      }
    } catch (error) {
      console.error('❌ Error loading quests from backend:', error);
      // Fallback a localStorage
      const localStorageQuests = loadQuestsFromLocalStorage();
      setDailyQuests(localStorageQuests);
      
      const pendingQuests = localStorageQuests.filter(q => !q.completed);
      const totalAvailableFood = pendingQuests.reduce((sum, quest) => sum + quest.reward, 0);
      setAvailableFood(totalAvailableFood);
    } finally {
      setIsLoading(false);
    }
  };

  const loadQuestsFromLocalStorage = (): DailyQuest[] => {
    try {
      const today = getCurrentDateISO(); // Usar función utilitaria
      const storageKey = `dailyQuests_${userId}`;
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        const questData = JSON.parse(stored);
        if (questData.date === today && questData.quests.length > 0) {
          return questData.quests;
        }
      }
      
      // Si no hay misiones válidas, generar nuevas
      return generateNewQuests();
    } catch (error) {
      console.error('Error loading quests from localStorage:', error);
      return generateNewQuests();
    }
  };

  const loadPermanentQuests = () => {
    // Las misiones permanentes se generan siempre igual
    const permanent = [
      {
        id: 'permanent_1',
        title: 'Ametralladora Mejorada',
        description: 'Consigue la Ametralladora Mejorada',
        type: 'get_improved_machinegun',
        target: 1,
        progress: 0,
        reward: 5,
        completed: false
      },
      {
        id: 'permanent_2',
        title: 'Lanzagranadas',
        description: 'Consigue el Lanzagranadas',
        type: 'get_grenade_launcher',
        target: 1,
        progress: 0,
        reward: 8,
        completed: false
      },
      {
        id: 'permanent_3',
        title: 'Rifle Láser',
        description: 'Consigue el Rifle Láser',
        type: 'get_laser_rifle',
        target: 1,
        progress: 0,
        reward: 10,
        completed: false
      }
    ];
    setPermanentQuests(permanent);
  };

  const generateNewQuests = (): DailyQuest[] => {
    const questTemplates = [
      {
        type: 'kill_enemies',
        titles: ['Exterminador', 'Cazador de Enemigos', 'Guerrero Implacable'],
        descriptions: ['Elimina {target} enemigos', 'Derrota {target} enemigos', 'Acaba con {target} enemigos'],
        targets: [30, 50, 75, 100],
        rewards: [1, 2, 3]
      },
      {
        type: 'kill_zombies',
        titles: ['Cazador de Zombies', 'Exterminador de No-Muertos', 'Guardián de la Vida'],
        descriptions: ['Elimina {target} zombies', 'Derrota {target} zombies', 'Acaba con {target} zombies'],
        targets: [20, 35, 50, 70],
        rewards: [1, 2, 3]
      },
      {
        type: 'kill_dashers',
        titles: ['Cazador de Velocistas', 'Detector de Dashers', 'Perseguidor Implacable'],
        descriptions: ['Elimina {target} dashers', 'Derrota {target} dashers', 'Acaba con {target} dashers'],
        targets: [5, 10, 15, 20],
        rewards: [2, 3, 4]
      },
      {
        type: 'kill_tanks',
        titles: ['Destructor de Tanques', 'Cazador de Blindados', 'Guerrero Anti-Tanque'],
        descriptions: ['Elimina {target} tanques', 'Derrota {target} tanques', 'Acaba con {target} tanques'],
        targets: [3, 5, 8, 12],
        rewards: [2, 3, 4]
      },
      {
        type: 'reach_level',
        titles: ['Ascenso de Poder', 'Maestro de Habilidades', 'Evolución Constante'],
        descriptions: ['Alcanza el nivel {target}', 'Llega al nivel {target}', 'Sube al nivel {target}'],
        targets: [3, 5, 7, 10],
        rewards: [2, 3, 4]
      },
      {
        type: 'survive_time',
        titles: ['Superviviente', 'Resistente', 'Guardián del Tiempo'],
        descriptions: ['Sobrevive {target} segundos', 'Mantente vivo {target} segundos', 'Resiste {target} segundos'],
        targets: [120, 180, 240, 300],
        rewards: [1, 2, 3]
      },
      {
        type: 'collect_supply_boxes',
        titles: ['Recolector', 'Buscador de Suministros', 'Proveedor'],
        descriptions: ['Recolecta {target} cajas de suministros', 'Encuentra {target} cajas', 'Obtén {target} suministros'],
        targets: [5, 10, 15, 20],
        rewards: [1, 2, 3]
      },
      {
        type: 'destroy_barrels',
        titles: ['Demoledor', 'Destructor de Barriles', 'Explosivo'],
        descriptions: ['Destruye {target} barriles', 'Explota {target} barriles', 'Acaba con {target} barriles'],
        targets: [3, 5, 8, 12],
        rewards: [1, 2, 3]
      },
      {
        type: 'use_bandages',
        titles: ['Sanador', 'Médico de Campo', 'Curador'],
        descriptions: ['Usa {target} vendajes', 'Aplica {target} vendajes', 'Utiliza {target} vendajes'],
        targets: [2, 3, 5, 8],
        rewards: [1, 2, 3]
      },
      {
        type: 'gain_levels',
        titles: ['Ascenso Rápido', 'Evolución Constante', 'Maestro de Poder'],
        descriptions: ['Sube {target} niveles', 'Alcanza {target} niveles más', 'Gana {target} niveles'],
        targets: [2, 3, 4, 5],
        rewards: [2, 3, 4]
      }
    ];

    // Seleccionar 3 misiones aleatorias
    const selectedTemplates = shuffleArray([...questTemplates]).slice(0, 3);
    
    const newQuests: DailyQuest[] = selectedTemplates.map((template, index) => {
      const titleIndex = Math.floor(Math.random() * template.titles.length);
      const descIndex = Math.floor(Math.random() * template.descriptions.length);
      const targetIndex = Math.floor(Math.random() * template.targets.length);
      const rewardIndex = Math.floor(Math.random() * template.rewards.length);

      return {
        id: `quest_${index + 1}`,
        title: template.titles[titleIndex],
        description: template.descriptions[descIndex].replace('{target}', template.targets[targetIndex].toString()),
        type: template.type,
        target: template.targets[targetIndex],
        progress: 0,
        reward: template.rewards[rewardIndex],
        completed: false
      };
    });

    // Guardar las nuevas misiones
    const questData = {
      date: getCurrentDateISO(), // Usar función utilitaria
      userId: userId,
      quests: newQuests
    };
    
    localStorage.setItem(`dailyQuests_${userId}`, JSON.stringify(questData));
    return newQuests;
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleRerollQuests = () => {
    setIsLoading(true);
    const newQuests = generateNewQuests();
    setDailyQuests(newQuests);
    
    // Recalcular alimentos disponibles
    const pendingQuests = newQuests.filter(q => !q.completed);
    const totalAvailableFood = pendingQuests.reduce((sum, quest) => sum + quest.reward, 0);
    setAvailableFood(totalAvailableFood);
    
    setIsLoading(false);
  };

  const handleConsultAI = (questId: string) => {
    // Buscar la misión en ambas listas
    const quest = [...dailyQuests, ...permanentQuests].find(q => q.id === questId);
    
    if (quest) {
      setSelectedQuest(quest);
      setIsAIModalOpen(true);
      console.log(`🤖 Abriendo consulta con IA para misión: ${quest.title}`);
    } else {
      console.error('Quest not found:', questId);
    }
  };

  const handleCloseAIModal = () => {
    setIsAIModalOpen(false);
    setSelectedQuest(null);
  };

  const handleUpdateQuests = async () => {
    try {
      setIsUpdating(true);
      console.log('🔄 Verificando nuevas misiones diarias...');
      
      // Verificar si hay nuevas misiones disponibles usando el servicio mejorado
      const updateResult = await dailyQuestService.updateDailyQuests(userId);
      
      if (updateResult) {
        console.log('✅ Misiones diarias actualizadas, recargando...');
        
        // Importante: No limpiar questProgress aquí para no interferir con el juego
        // Solo limpiar las dailyQuests que no interfieren con el progreso en tiempo real
        
        // Recargar las misiones después de la actualización
        await loadQuestsFromBackend();
        
        alert('¡Misiones diarias actualizadas! Se han generado nuevas misiones.');
      } else {
        console.log('⏰ No hay nuevas misiones disponibles aún');
        
        // Verificar si las misiones actuales del backend ya están sincronizadas
        const sessionData = await gameSessionService.getUserGameSession(Number(userId));
        if (sessionData?.daily_quests_completed?.date === getCurrentDateISO()) {
          console.log('✅ Las misiones ya están actualizadas para hoy');
          await loadQuestsFromBackend(); // Recargar para mostrar el estado actual
          alert('Las misiones ya están actualizadas para el día de hoy.');
        } else {
          alert('No hay nuevas misiones disponibles. Las misiones se renuevan diariamente.');
        }
      }
    } catch (error) {
      console.error('❌ Error actualizando misiones diarias:', error);
      alert('Error al verificar nuevas misiones. Por favor, intenta de nuevo.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getCompletedQuestsCount = () => {
    return dailyQuests.filter(quest => quest.completed).length;
  };

  const getTotalReward = () => {
    const questRewards = dailyQuests
      .filter(quest => quest.completed)
      .reduce((sum, quest) => sum + quest.reward, 0);
    
    const bonusReward = getCompletedQuestsCount() === 3 ? 10 : 0;
    
    return questRewards + bonusReward;
  };

  const getProgressPercentage = (quest: DailyQuest) => {
    return Math.min((quest.progress / quest.target) * 100, 100);
  };

  const getQuestIcon = (type: string) => {
    const iconClass = "text-xl";
    
    switch (type) {
      case 'kill_enemies':
        return <GiCrossedSwords className={`${iconClass} text-red-400`} />;
      case 'kill_zombies':
        return <GiDeathSkull className={`${iconClass} text-green-400`} />;
      case 'kill_dashers':
        return <GiTargeting className={`${iconClass} text-yellow-400`} />;
      case 'kill_tanks':
        return <FaCrosshairs className={`${iconClass} text-orange-400`} />;
      case 'reach_level':
        return <GiStairsGoal className={`${iconClass} text-purple-400`} />;
      case 'gain_levels':
        return <GiLevelFourAdvanced className={`${iconClass} text-purple-400`} />;
      case 'survive_time':
        return <FaStopwatch className={`${iconClass} text-blue-400`} />;
      case 'collect_supply_boxes':
        return <BsBox className={`${iconClass} text-brown-400`} />;
      case 'destroy_barrels':
        return <FaBomb className={`${iconClass} text-red-500`} />;
      case 'use_bandages':
        return <MdHealing className={`${iconClass} text-green-500`} />;
      case 'get_improved_machinegun':
        return <GiMachineGun className={`${iconClass} text-gray-400`} />;
      case 'get_grenade_launcher':
        return <GiGrenade className={`${iconClass} text-red-600`} />;
      case 'get_laser_rifle':
        return <GiLaserSparks className={`${iconClass} text-cyan-400`} />;
      default:
        return <FaBullseye className={`${iconClass} text-blue-400`} />;
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            <span className="ml-3 text-white">Cargando misiones...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 pt-20">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl max-w-4xl w-full max-h-[calc(100vh-6rem)] overflow-y-auto shadow-2xl">
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center">
              <FaTasks className="mr-2 sm:mr-3 text-blue-400" />
              Misiones Diarias
            </h2>
            <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto justify-end">
              <button
                onClick={handleUpdateQuests}
                disabled={isUpdating}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-2 sm:px-3 py-2 rounded-lg transition-colors flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                title="Verificar nuevas misiones diarias desde el servidor"
              >
                <FaSync className={`text-xs sm:text-sm ${isUpdating ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">
                  {isUpdating ? 'Verificando...' : 'Actualizar'}
                </span>
                <span className="sm:hidden">
                  {isUpdating ? '...' : 'Act'}
                </span>
              </button>
              <button
                onClick={handleRerollQuests}
                className="bg-purple-600 hover:bg-purple-700 text-white px-2 sm:px-3 py-2 rounded-lg transition-colors flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                title="Generar nuevas misiones diarias (testing)"
              >
                <FaDice className="text-xs sm:text-sm" />
                <span className="hidden sm:inline">Rerollear</span>
                <span className="sm:hidden">Roll</span>
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white text-xl sm:text-2xl font-bold transition-colors p-2"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Alimentos Counter - Solo mostrar si hay alimentos disponibles */}
          {availableFood > 0 && (
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <span className="text-xl sm:text-2xl">🍎</span>
                  <div>
                    <div className="text-white font-bold text-sm sm:text-lg">Alimentos Disponibles</div>
                    <div className="text-green-200 text-xs sm:text-sm">Recompensa de misiones diarias</div>
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white">{availableFood}</div>
              </div>
            </div>
          )}

          {/* Progress Summary */}
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{getCompletedQuestsCount()}/3</div>
                  <div className="text-gray-300 text-sm">Completadas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{getTotalReward()}</div>
                  <div className="text-gray-300 text-sm">Alimentos Ganados</div>
                </div>
              </div>
              {getCompletedQuestsCount() === 3 && (
                <div className="flex items-center space-x-2 bg-yellow-600/20 border border-yellow-500/50 rounded-lg px-3 py-2">
                  <FaTrophy className="text-yellow-400" />
                  <span className="text-yellow-400 font-bold">¡Bonus +10 Alimentos!</span>
                </div>
              )}
            </div>
          </div>

          {/* Misiones Diarias */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <FaSync className="mr-2 text-blue-400" />
              Misiones Diarias
            </h3>
            <div className="space-y-4">
              {dailyQuests.map((quest) => (
                <div
                  key={quest.id}
                  className={`bg-gradient-to-r p-3 sm:p-4 rounded-lg border transition-all duration-200 ${
                    quest.completed
                      ? 'from-green-900/50 to-green-800/50 border-green-600/50'
                      : 'from-gray-800/50 to-gray-900/50 border-gray-600/50 hover:border-gray-500/50'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-3 gap-3">
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-1">
                      <div className="flex-shrink-0">{getQuestIcon(quest.type)}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-sm sm:text-lg ${quest.completed ? 'text-green-400' : 'text-white'} truncate`}>
                          {quest.title}
                        </h3>
                        <p className="text-gray-300 text-xs sm:text-sm">{quest.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between lg:justify-end space-x-2 sm:space-x-3 flex-shrink-0">
                      <div className="text-center">
                        <div className={`font-bold text-sm sm:text-base ${quest.completed ? 'text-green-400' : 'text-blue-400'}`}>
                          {quest.progress}/{quest.target}
                        </div>
                        <div className="text-gray-400 text-xs">Progreso</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-yellow-400 text-sm sm:text-base">🍎 {quest.reward}</div>
                        <div className="text-gray-400 text-xs">Recompensa</div>
                      </div>
                      <button
                        onClick={() => handleConsultAI(quest.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 sm:p-2 rounded-lg transition-colors"
                        title="Consultar con Agente IA"
                      >
                        <FaRobot className="text-xs sm:text-sm" />
                      </button>
                      {quest.completed && (
                        <div className="flex items-center space-x-1 sm:space-x-2 bg-green-600/20 border border-green-500/50 rounded-lg px-2 sm:px-3 py-1 sm:py-2">
                          <FaCheck className="text-green-400 text-xs sm:text-sm" />
                          <span className="text-green-400 font-bold text-xs sm:text-sm">Completada</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        quest.completed ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${getProgressPercentage(quest)}%` }}
                    ></div>
                  </div>

                  {/* Completion Time */}
                  {quest.completed && quest.completedAt && (
                    <div className="flex items-center justify-end mt-2 text-gray-400 text-xs">
                      <FaClock className="mr-1" />
                      Completada: {new Date(quest.completedAt).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Misiones Permanentes */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <FaTrophy className="mr-2 text-yellow-400" />
              Misiones Permanentes
            </h3>
            <div className="space-y-4">
              {permanentQuests.map((quest) => (
                <div
                  key={quest.id}
                  className={`bg-gradient-to-r p-3 sm:p-4 rounded-lg border transition-all duration-200 ${
                    quest.completed
                      ? 'from-green-900/50 to-green-800/50 border-green-600/50'
                      : 'from-gray-800/50 to-gray-900/50 border-gray-600/50 hover:border-gray-500/50'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-3 gap-3">
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-1">
                      <div className="flex-shrink-0">{getQuestIcon(quest.type)}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-sm sm:text-lg ${quest.completed ? 'text-green-400' : 'text-white'} truncate`}>
                          {quest.title}
                        </h3>
                        <p className="text-gray-300 text-xs sm:text-sm">{quest.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between lg:justify-end space-x-2 sm:space-x-3 flex-shrink-0">
                      <div className="text-center">
                        <div className={`font-bold text-sm sm:text-base ${quest.completed ? 'text-green-400' : 'text-blue-400'}`}>
                          {quest.progress}/{quest.target}
                        </div>
                        <div className="text-gray-400 text-xs">Progreso</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-yellow-400 text-sm sm:text-base">🍎 {quest.reward}</div>
                        <div className="text-gray-400 text-xs">Recompensa</div>
                      </div>
                      <button
                        onClick={() => handleConsultAI(quest.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 sm:p-2 rounded-lg transition-colors"
                        title="Consultar con Agente IA"
                      >
                        <FaRobot className="text-xs sm:text-sm" />
                      </button>
                      {quest.completed && (
                        <div className="flex items-center space-x-1 sm:space-x-2 bg-green-600/20 border border-green-500/50 rounded-lg px-2 sm:px-3 py-1 sm:py-2">
                          <FaCheck className="text-green-400 text-xs sm:text-sm" />
                          <span className="text-green-400 font-bold text-xs sm:text-sm">Completada</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        quest.completed ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${getProgressPercentage(quest)}%` }}
                    ></div>
                  </div>

                  {/* Completion Time */}
                  {quest.completed && quest.completedAt && (
                    <div className="flex items-center justify-end mt-2 text-gray-400 text-xs">
                      <FaClock className="mr-1" />
                      Completada: {new Date(quest.completedAt).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Asistente IA */}
      <AIAdviceModal
        isOpen={isAIModalOpen}
        onClose={handleCloseAIModal}
        quest={selectedQuest}
      />
    </div>
  );
}; 