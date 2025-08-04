import { API_CONFIG } from '@/config/api';
import { GameMaterials } from '@/managers/SupplyBoxManager';

interface EquipNFTData {
  nftId: string;
  nftData: any;
  sessionId: string;
}

interface UnequipNFTData {
  nftId: string;
  sessionId: string;
}

interface UpdateMaterialsData {
  sessionId: string;
  materials: GameMaterials;
  isVictory?: boolean;
  victoryBonusPercentage?: number;
}

interface UpdateDailyQuestsData {
  sessionId: string;
  completedQuests: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    reward: number;
    completedAt: string;
  }>;
}

class GameSessionService {
  private readonly baseURL = `${API_CONFIG.STRAPI_URL}/api`;

  private getAuthHeaders() {
    const token = localStorage.getItem('auth-token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Obtiene la sesión de juego activa del usuario
   */
  async getUserGameSession(userId: number): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseURL}/game-sessions?filters[users_permissions_user][id][$eq]=${userId}&populate=*`,
        { headers: this.getAuthHeaders() }
      );

      if (!response.ok) {
        throw new Error(`Error fetching game session: ${response.status}`);
      }

      const data = await response.json();
      return data.data[0] || null; // Retorna la primera sesión encontrada
    } catch (error) {
      console.error('Error getting user game session:', error);
      throw error;
    }
  }

  /**
   * Actualiza los materiales en la sesión de juego
   */
  async updateSessionMaterials({ sessionId, materials, isVictory = false, victoryBonusPercentage = 0.25 }: UpdateMaterialsData): Promise<any> {
    try {
      console.log('🎮 Actualizando materiales en sesión:', sessionId);
      console.log('📦 Materiales a actualizar:', materials);
      console.log('🏆 Es victoria:', isVictory, 'Bonus:', victoryBonusPercentage);

      // Primero obtener la sesión actual
      const currentSession = await this.getSessionById(sessionId);
      if (!currentSession) {
        throw new Error('Sesión de juego no encontrada');
      }

      // Obtener materiales actuales de la sesión
      const currentMaterials = currentSession.materials || {
        steel: 0,
        energy_cells: 0,
        medicine: 0,
        food: 0
      };

      // Calcular nuevos materiales
      let updatedMaterials: GameMaterials = {
        steel: currentMaterials.steel + materials.steel,
        energy_cells: currentMaterials.energy_cells + materials.energy_cells,
        medicine: currentMaterials.medicine + materials.medicine,
        food: currentMaterials.food + materials.food
      };

      // Aplicar bonus de victoria si corresponde
      let bonusApplied = null;
      if (isVictory && victoryBonusPercentage > 0) {
        const bonusMaterials = {
          steel: Math.floor(materials.steel * victoryBonusPercentage),
          energy_cells: Math.floor(materials.energy_cells * victoryBonusPercentage),
          medicine: Math.floor(materials.medicine * victoryBonusPercentage),
          food: Math.floor(materials.food * victoryBonusPercentage)
        };

        updatedMaterials = {
          steel: updatedMaterials.steel + bonusMaterials.steel,
          energy_cells: updatedMaterials.energy_cells + bonusMaterials.energy_cells,
          medicine: updatedMaterials.medicine + bonusMaterials.medicine,
          food: updatedMaterials.food + bonusMaterials.food
        };

        bonusApplied = bonusMaterials;
        console.log('🏆 Bonus de victoria aplicado:', bonusMaterials);
      }

      // Preparar datos de actualización
      const updateData = {
        data: {
          materials: updatedMaterials
        }
      };

      console.log('📤 Enviando actualización de materiales:', updateData);

      const response = await fetch(
        `${this.baseURL}/game-sessions/${sessionId}`,
        {
          method: 'PUT',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(updateData)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error response:', errorData);
        throw new Error(`Error actualizando materiales: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Materiales actualizados exitosamente:', result);
      
      // No actualizar localStorage aquí - ya se maneja en SupplyBoxManager
      // this.updateLocalStorageMaterials(updatedMaterials);
      
      return { 
        success: true, 
        data: result,
        materialsUpdated: updatedMaterials,
        bonusApplied
      };
    } catch (error) {
      console.error('❌ Error actualizando materiales:', error);
      throw error;
    }
  }

  /**
   * Actualiza las misiones diarias completadas en la sesión
   */
  async updateDailyQuestsCompleted({ sessionId, completedQuests }: UpdateDailyQuestsData): Promise<any> {
    try {
      console.log('🎯 Actualizando misiones diarias completadas en sesión:', sessionId);
      console.log('📋 Misiones completadas:', completedQuests);

      // Obtener la sesión actual
      const currentSession = await this.getSessionById(sessionId);
      if (!currentSession) {
        throw new Error('Sesión de juego no encontrada');
      }

      // Obtener misiones ya completadas
      const currentCompletedQuests = currentSession.daily_quests_completed?.quests || [];
      
      // Combinar misiones existentes con las nuevas (evitar duplicados)
      const allCompletedQuests = [...currentCompletedQuests];
      
      completedQuests.forEach(newQuest => {
        const exists = allCompletedQuests.find(existing => existing.id === newQuest.id);
        if (!exists) {
          allCompletedQuests.push(newQuest);
        }
      });

      // Preparar datos de actualización
      const updateData = {
        data: {
          daily_quests_completed: {
            date: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
            quests: allCompletedQuests
          }
        }
      };

      console.log('📤 Enviando actualización de misiones diarias:', updateData);

      const response = await fetch(
        `${this.baseURL}/game-sessions/${sessionId}`,
        {
          method: 'PUT',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(updateData)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error response:', errorData);
        throw new Error(`Error actualizando misiones diarias: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Misiones diarias actualizadas exitosamente:', result);
      
      return { 
        success: true, 
        data: result,
        questsUpdated: allCompletedQuests
      };
    } catch (error) {
      console.error('❌ Error actualizando misiones diarias:', error);
      throw error;
    }
  }

  /**
   * Actualiza los materiales en localStorage
   */
  private updateLocalStorageMaterials(materials: GameMaterials): void {
    try {
      // Obtener el userId del token o de localStorage
      const userData = localStorage.getItem('user-data');
      if (userData) {
        const user = JSON.parse(userData);
        const storageKey = `game-materials-${user.id}`;
        
        // Guardar los materiales totales actualizados
        localStorage.setItem(storageKey, JSON.stringify(materials));
        console.log('💾 Materiales actualizados en localStorage:', materials);
      }
    } catch (error) {
      console.error('❌ Error actualizando localStorage:', error);
    }
  }

  /**
   * Equipa un NFT en la sesión de juego del usuario
   */
  async equipNFT({ nftId, nftData, sessionId }: EquipNFTData): Promise<any> {
    try {
      console.log('🎮 Equipando NFT:', nftId, 'en sesión:', sessionId);
      console.log('📊 Datos del NFT:', nftData);

      // Primero obtener la sesión actual
      const currentSession = await this.getSessionById(sessionId);
      if (!currentSession) {
        throw new Error('Sesión de juego no encontrada');
      }

      // Preparar los datos del NFT equipado
      const equippedNFT = {
        id: nftData.documentId || nftData.id,
        token_id: nftData.token_id,
        contract_address: nftData.contract_address,
        name: nftData.metadata?.name || 'NFT Sin Nombre',
        description: nftData.metadata?.description || 'Sin descripción',
        icon_name: nftData.metadata?.icon_name || 'FaQuestion',
        achievement_type: nftData.metadata?.achievement_type || 'unknown',
        rarity: nftData.metadata?.rarity || 'common',
        attributes: nftData.metadata?.attributes || [],
        network: nftData.network,
        owner_address: nftData.owner_address,
        is_listed_for_sale: nftData.is_listed_for_sale,
        listing_price_eth: nftData.listing_price_eth,
        minted_at: nftData.minted_at,
        last_transfer_at: nftData.last_transfer_at
      };

      // Verificar si el NFT ya está equipado
      const currentEquippedNFTs = currentSession.equipped_items?.nfts || [];
      const isAlreadyEquipped = currentEquippedNFTs.some((nft: any) => 
        nft.id === equippedNFT.id || nft.token_id === equippedNFT.token_id
      );

      if (isAlreadyEquipped) {
        console.log('⚠️ NFT ya está equipado');
        return { success: false, message: 'NFT ya está equipado' };
      }

      // Agregar el NFT a equipped_items
      const updatedEquippedItems = {
        ...currentSession.equipped_items,
        nfts: [...currentEquippedNFTs, equippedNFT]
      };

      // Actualizar la sesión
      const updateData = {
        data: {
          equipped_items: updatedEquippedItems
        }
      };

      console.log('📤 Enviando actualización:', updateData);

      const response = await fetch(
        `${this.baseURL}/game-sessions/${sessionId}`,
        {
          method: 'PUT',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(updateData)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error response:', errorData);
        throw new Error(`Error equipando NFT: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ NFT equipado exitosamente:', result);
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ Error equipando NFT:', error);
      throw error;
    }
  }

  /**
   * Desequipa un NFT de la sesión de juego del usuario
   */
  async unequipNFT({ nftId, sessionId }: UnequipNFTData): Promise<any> {
    try {
      console.log('🎮 Desequipando NFT:', nftId, 'de sesión:', sessionId);

      // Primero obtener la sesión actual
      const currentSession = await this.getSessionById(sessionId);
      if (!currentSession) {
        throw new Error('Sesión de juego no encontrada');
      }

      // Remover el NFT de equipped_items
      const currentEquippedNFTs = currentSession.equipped_items?.nfts || [];
      const updatedEquippedNFTs = currentEquippedNFTs.filter((nft: any) => 
        nft.id !== nftId && nft.token_id !== nftId
      );

      const updatedEquippedItems = {
        ...currentSession.equipped_items,
        nfts: updatedEquippedNFTs
      };

      // Actualizar la sesión
      const updateData = {
        data: {
          equipped_items: updatedEquippedItems
        }
      };

      console.log('📤 Enviando actualización:', updateData);

      const response = await fetch(
        `${this.baseURL}/game-sessions/${sessionId}`,
        {
          method: 'PUT',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(updateData)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error response:', errorData);
        throw new Error(`Error desequipando NFT: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ NFT desequipado exitosamente:', result);
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ Error desequipando NFT:', error);
      throw error;
    }
  }

  /**
   * Obtiene una sesión específica por ID
   */
  private async getSessionById(sessionId: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseURL}/game-sessions/${sessionId}?populate=*`,
        { headers: this.getAuthHeaders() }
      );

      if (!response.ok) {
        throw new Error(`Error fetching session: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error getting session by ID:', error);
      throw error;
    }
  }

  /**
   * Verifica si un NFT está equipado en la sesión
   */
  async isNFTEquipped(nftId: string, sessionId: string): Promise<boolean> {
    try {
      const session = await this.getSessionById(sessionId);
      if (!session) return false;

      const equippedNFTs = session.equipped_items?.nfts || [];
      return equippedNFTs.some((nft: any) => 
        nft.id === nftId || nft.token_id === nftId
      );
    } catch (error) {
      console.error('Error checking if NFT is equipped:', error);
      return false;
    }
  }
}

export const gameSessionService = new GameSessionService(); 