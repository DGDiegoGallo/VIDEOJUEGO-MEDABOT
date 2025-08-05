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
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>([]);
  const [permanentQuests, setPermanentQuests] = useState<DailyQuest[]>([]);
  const [availableFood, setAvailableFood] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<DailyQuest | null>(null);

  useEffect(() => {
    loadQuestsFromBackend();
    loadPermanentQuests();
  }, [userId]);

  const loadQuestsFromBackend = async () => {
    try {
      setIsLoading(true);
      
      // Obtener datos de la sesión del backend
      const sessionData = await gameSessionService.getUserGameSession(Number(userId));
      
      if (sessionData && sessionData.daily_quests_completed) {
        // Obtener misiones completadas del backend
        const completedQuests = sessionData.daily_quests_completed.quests || [];
        
        // Cargar misiones desde localStorage para obtener las no completadas
        const localStorageQuests = loadQuestsFromLocalStorage();
        
        // Combinar misiones: completadas del backend + no completadas del localStorage
        const allQuests = [...localStorageQuests];
        
        // Marcar como completadas las que están en el backend
        completedQuests.forEach((completedQuest: any) => {
          const existingQuest = allQuests.find(q => q.id === completedQuest.id);
          if (existingQuest) {
            existingQuest.completed = true;
            existingQuest.completedAt = completedQuest.completedAt;
            existingQuest.progress = completedQuest.progress;
          }
        });
        
        setDailyQuests(allQuests);
        
        // Calcular alimentos disponibles basado en misiones pendientes
        const pendingQuests = allQuests.filter(q => !q.completed);
        const totalAvailableFood = pendingQuests.reduce((sum, quest) => sum + quest.reward, 0);
        setAvailableFood(totalAvailableFood);
        
        console.log('📊 Misiones cargadas del backend:', {
          completed: completedQuests.length,
          pending: pendingQuests.length,
          availableFood: totalAvailableFood
        });
      } else {
        // Si no hay datos del backend, usar localStorage
        const localStorageQuests = loadQuestsFromLocalStorage();
        setDailyQuests(localStorageQuests);
        
        const pendingQuests = localStorageQuests.filter(q => !q.completed);
        const totalAvailableFood = pendingQuests.reduce((sum, quest) => sum + quest.reward, 0);
        setAvailableFood(totalAvailableFood);
      }
    } catch (error) {
      console.error('Error loading quests from backend:', error);
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
      const today = new Date().toDateString();
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
      date: new Date().toDateString(),
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
      
      // Verificar si hay nuevas misiones disponibles
      const updateResult = await dailyQuestService.updateDailyQuests(userId);
      
      if (updateResult) {
        console.log('✅ Misiones diarias actualizadas, recargando...');
        
        // Recargar las misiones después de la actualización
        await loadQuestsFromBackend();
        
        alert('¡Misiones diarias actualizadas! Se han generado nuevas misiones.');
      } else {
        console.log('⏰ No hay nuevas misiones disponibles aún');
        alert('No hay nuevas misiones disponibles. Las misiones se renuevan diariamente.');
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