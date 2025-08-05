import { gameSessionService } from './gameSessionService';

export interface DailyQuestReward {
  userId: string | number;
  questId: string;
  questTitle: string;
  reward: number; // Cantidad de alimentos
  completedAt: string;
  sessionId?: string;
}

export interface DailyQuestCompletion {
  userId: string | number;
  quests: Array<{
    id: string;
    title: string;
    reward: number;
    completedAt: string;
  }>;
  totalReward: number;
  bonusReward: number;
  sessionId?: string;
}

class DailyQuestService {
  /**
   * Procesa la recompensa de una misión completada
   * @param reward - Datos de la recompensa
   */
  async processQuestReward(reward: DailyQuestReward): Promise<boolean> {
    try {
      console.log(`🎯 Procesando recompensa de misión: ${reward.questTitle} - ${reward.reward} alimentos`);

      // Agregar food al localStorage
      this.addFoodToLocalStorage(reward.userId, reward.reward);

      // Si hay sessionId, actualizar en Strapi
      if (reward.sessionId) {
        await this.updateSessionFood(reward.sessionId, reward.reward);
      }

      console.log(`✅ Recompensa procesada exitosamente: +${reward.reward} alimentos`);
      return true;
    } catch (error) {
      console.error('❌ Error procesando recompensa de misión:', error);
      return false;
    }
  }

  /**
   * Procesa la recompensa por completar todas las misiones diarias
   * @param completion - Datos de la completación
   */
  async processAllQuestsCompletion(completion: DailyQuestCompletion): Promise<boolean> {
    try {
      console.log(`🏆 Procesando completación de todas las misiones: ${completion.totalReward + completion.bonusReward} alimentos`);

      // Agregar recompensa total al localStorage
      this.addFoodToLocalStorage(completion.userId, completion.totalReward + completion.bonusReward);

      // Si hay sessionId, actualizar en Strapi
      if (completion.sessionId) {
        await this.updateSessionFood(completion.sessionId, completion.totalReward + completion.bonusReward);
      }

      console.log(`✅ Completación de misiones procesada exitosamente: +${completion.totalReward + completion.bonusReward} alimentos`);
      return true;
    } catch (error) {
      console.error('❌ Error procesando completación de misiones:', error);
      return false;
    }
  }

  /**
   * Verifica si hay nuevas misiones diarias disponibles comparando fechas con el backend
   * @param userId - ID del usuario
   * @returns Promise<boolean> - true si hay nuevas misiones disponibles
   */
  async checkForNewDailyQuests(userId: string | number): Promise<{
    hasNewQuests: boolean;
    lastCompletedDate?: string;
    currentDate: string;
  }> {
    try {
      console.log('🔍 Verificando nuevas misiones diarias para usuario:', userId);
      
      // Obtener la fecha actual en formato ISO (YYYY-MM-DD) para coincidir con el backend
      const currentDate = new Date().toISOString().split('T')[0];
      
      // Obtener datos de la sesión del backend
      const sessionData = await gameSessionService.getUserGameSession(Number(userId));
      
      if (!sessionData || !sessionData.daily_quests_completed) {
        console.log('📅 No hay datos de misiones completadas en el backend');
        return {
          hasNewQuests: true,
          currentDate
        };
      }
      
      const lastCompletedDate = sessionData.daily_quests_completed.date;
      
      console.log('📅 Fecha última misión completada:', lastCompletedDate);
      console.log('📅 Fecha actual:', currentDate);
      
      // Verificar si la fecha actual es diferente a la última fecha completada
      const hasNewQuests = currentDate !== lastCompletedDate;
      
      console.log('🎯 ¿Hay nuevas misiones disponibles?', hasNewQuests);
      
      return {
        hasNewQuests,
        lastCompletedDate,
        currentDate
      };
    } catch (error) {
      console.error('❌ Error verificando nuevas misiones diarias:', error);
      // En caso de error, asumir que hay nuevas misiones disponibles
      return {
        hasNewQuests: true,
        currentDate: new Date().toISOString().split('T')[0]
      };
    }
  }

  /**
   * Actualiza las misiones diarias limpiando localStorage y generando nuevas misiones
   * @param userId - ID del usuario
   * @returns Promise<boolean> - true si se actualizaron exitosamente
   */
  async updateDailyQuests(userId: string | number): Promise<boolean> {
    try {
      console.log('🔄 Actualizando misiones diarias para usuario:', userId);
      
      // Verificar si hay nuevas misiones disponibles
      const { hasNewQuests, lastCompletedDate, currentDate } = await this.checkForNewDailyQuests(userId);
      
      if (!hasNewQuests) {
        console.log('⏰ No hay nuevas misiones disponibles aún');
        return false;
      }
      
      console.log('🧹 Limpiando localStorage de misiones diarias...');
      
      // Limpiar localStorage de misiones diarias
      localStorage.removeItem(`dailyQuests_${userId}`);
      localStorage.removeItem(`questProgress_${userId}`);
      
      console.log('✅ localStorage limpiado exitosamente');
      console.log('📝 Misiones diarias actualizadas desde:', lastCompletedDate || 'primera vez', 'a:', currentDate);
      
      return true;
    } catch (error) {
      console.error('❌ Error actualizando misiones diarias:', error);
      return false;
    }
  }

  /**
   * Fuerza la actualización de misiones diarias (útil para testing)
   * @param userId - ID del usuario
   */
  forceUpdateDailyQuests(userId: string | number): void {
    console.log('🔧 Forzando actualización de misiones diarias para usuario:', userId);
    
    // Limpiar localStorage de misiones diarias
    localStorage.removeItem(`dailyQuests_${userId}`);
    localStorage.removeItem(`questProgress_${userId}`);
    
    console.log('✅ Actualización forzada completada');
  }

  /**
   * Agrega alimentos al localStorage
   * @param userId - ID del usuario
   * @param amount - Cantidad de alimentos a agregar
   */
  private addFoodToLocalStorage(userId: string | number, amount: number): void {
    try {
      const storageKey = `game-materials-${userId}`;
      const currentMaterials = localStorage.getItem(storageKey);
      
      let materials: any = {
        steel: 0,
        energy_cells: 0,
        medicine: 0,
        food: 0
      };

      if (currentMaterials) {
        materials = JSON.parse(currentMaterials);
      }

      // Agregar food
      materials.food = (materials.food || 0) + amount;

      // Guardar en localStorage
      localStorage.setItem(storageKey, JSON.stringify(materials));

      console.log(`🍎 Alimentos agregados al localStorage: +${amount} (Total: ${materials.food})`);
    } catch (error) {
      console.error('❌ Error agregando food al localStorage:', error);
    }
  }

  /**
   * Actualiza el food en la sesión de Strapi
   * @param sessionId - ID de la sesión
   * @param foodAmount - Cantidad de food a agregar
   */
  private async updateSessionFood(sessionId: string, foodAmount: number): Promise<void> {
    try {
      // Obtener la sesión actual
      const session = await gameSessionService.getUserGameSession(Number(sessionId));
      
      if (!session) {
        console.warn('⚠️ No se encontró la sesión para actualizar food');
        return;
      }

      // Calcular nuevo total de food
      const currentFood = session.materials?.food || 0;
      const newFood = currentFood + foodAmount;

      // Actualizar la sesión con el nuevo food
      await gameSessionService.updateSessionMaterials({
        sessionId,
        materials: {
          steel: session.materials?.steel || 0,
          energy_cells: session.materials?.energy_cells || 0,
          medicine: session.materials?.medicine || 0,
          food: newFood
        },
        isVictory: false // No es una victoria, solo recompensa de misión
      });

      console.log(`🍎 Alimentos actualizados en Strapi: +${foodAmount} (Total: ${newFood})`);
    } catch (error) {
      console.error('❌ Error actualizando food en Strapi:', error);
      throw error;
    }
  }

  /**
   * Obtiene los alimentos actuales del usuario desde localStorage
   * @param userId - ID del usuario
   * @returns Cantidad de alimentos actual
   */
  getCurrentFood(userId: string | number): number {
    try {
      const storageKey = `game-materials-${userId}`;
      const currentMaterials = localStorage.getItem(storageKey);
      
      if (currentMaterials) {
        const materials = JSON.parse(currentMaterials);
        return materials.food || 0;
      }
      
      return 0;
    } catch (error) {
      console.error('❌ Error obteniendo food del localStorage:', error);
      return 0;
    }
  }

  /**
   * Obtiene todos los materiales del usuario desde localStorage
   * @param userId - ID del usuario
   * @returns Objeto con todos los materiales
   */
  getCurrentMaterials(userId: string | number): {
    steel: number;
    energy_cells: number;
    medicine: number;
    food: number;
  } {
    try {
      const storageKey = `game-materials-${userId}`;
      const currentMaterials = localStorage.getItem(storageKey);
      
      if (currentMaterials) {
        const materials = JSON.parse(currentMaterials);
        return {
          steel: materials.steel || 0,
          energy_cells: materials.energy_cells || 0,
          medicine: materials.medicine || 0,
          food: materials.food || 0
        };
      }
      
      return {
        steel: 0,
        energy_cells: 0,
        medicine: 0,
        food: 0
      };
    } catch (error) {
      console.error('❌ Error obteniendo materiales del localStorage:', error);
      return {
        steel: 0,
        energy_cells: 0,
        medicine: 0,
        food: 0
      };
    }
  }

  /**
   * Sincroniza los materiales del localStorage con Strapi
   * @param userId - ID del usuario
   * @param sessionId - ID de la sesión (opcional)
   */
  async syncMaterialsWithStrapi(userId: string | number, sessionId?: string): Promise<void> {
    try {
      const materials = this.getCurrentMaterials(userId);
      
      if (sessionId) {
        await gameSessionService.updateSessionMaterials({
          sessionId,
          materials,
          isVictory: false
        });
        
        console.log('🔄 Materiales sincronizados con Strapi');
      }
    } catch (error) {
      console.error('❌ Error sincronizando materiales con Strapi:', error);
    }
  }
}

export const dailyQuestService = new DailyQuestService(); 