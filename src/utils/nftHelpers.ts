import { apiClient } from './api';
import { API_CONFIG } from '@/config/api';
import type { BaseNFTData, NFTRarity, AchievementNFT } from '@/types/nft';

export class NFTApiHelper {
  
  // Crear NFT genérico
  static async createNFT(nftData: BaseNFTData, walletId: string | number): Promise<any> {
    console.log('🎨 Creating NFT for wallet:', walletId);
    
    const payload = {
      user_wallet: typeof walletId === 'string' ? parseInt(walletId, 10) : walletId,
      ...nftData,
    };

    return await apiClient.create(API_CONFIG.ENDPOINTS.WALLET.USER_NFTS, payload);
  }

  // Obtener NFTs por wallet usando documentId
  static async getNFTsByWallet(walletDocumentId: string): Promise<any> {
    return await apiClient.get(
      `${API_CONFIG.ENDPOINTS.WALLET.USER_NFTS}?filters[user_wallet][documentId][$eq]=${walletDocumentId}&populate=*`
    );
  }

  // Obtener NFTs por usuario (buscar wallet primero)
  static async getNFTsByUserId(userId: string | number): Promise<any> {
    console.log('🎮 Getting NFTs for user ID:', userId);
    
    // Primero obtener el wallet del usuario
    const walletResponse = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.WALLET.USER_WALLETS}?filters[users_permissions_user][id][$eq]=${userId}&populate=*`
    );

    console.log('🎮 Wallet response:', walletResponse);

    if (!walletResponse.data || !Array.isArray(walletResponse.data) || walletResponse.data.length === 0) {
      console.log('🎮 No wallet found for user, returning empty array');
      return { data: [] };
    }

    const walletDocumentId = (walletResponse.data as any[])[0].documentId;
    console.log('🎮 Found wallet document ID:', walletDocumentId);
    
    // Luego obtener los NFTs del wallet
    const nftsResponse = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.WALLET.USER_NFTS}?filters[user_wallet][documentId][$eq]=${walletDocumentId}&populate=*`
    );
    
    console.log('🎮 NFTs response:', nftsResponse);
    return nftsResponse;
  }

  // Obtener NFTs en venta (para marketplace)
  static async getMarketplaceNFTs(page = 1, pageSize = 12): Promise<any> {
    return await apiClient.get(
      `${API_CONFIG.ENDPOINTS.WALLET.USER_NFTS}?filters[is_listed_for_sale][$eq]=True&populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort[0]=createdAt:desc`
    );
  }

  // Obtener NFTs por rareza
  static async getNFTsByRarity(rarity: NFTRarity, page = 1, pageSize = 12): Promise<any> {
    return await apiClient.get(
      `${API_CONFIG.ENDPOINTS.WALLET.USER_NFTS}?filters[metadata][rarity][$eq]=${rarity}&populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort[0]=createdAt:desc`
    );
  }

  // Listar NFT para venta
  static async listNFTForSale(nftDocumentId: string, priceEth: number): Promise<any> {
    return await apiClient.update(API_CONFIG.ENDPOINTS.WALLET.USER_NFTS, nftDocumentId, {
      is_listed_for_sale: 'True',
      listing_price_eth: priceEth
    });
  }

  // Quitar NFT de venta
  static async unlistNFT(nftDocumentId: string): Promise<any> {
    return await apiClient.update(API_CONFIG.ENDPOINTS.WALLET.USER_NFTS, nftDocumentId, {
      is_listed_for_sale: 'False',
      listing_price_eth: 0
    });
  }

  // Buscar NFTs por nombre
  static async searchNFTs(searchTerm: string, page = 1, pageSize = 12): Promise<any> {
    return await apiClient.get(
      `${API_CONFIG.ENDPOINTS.WALLET.USER_NFTS}?filters[metadata][name][$containsi]=${searchTerm}&populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort[0]=createdAt:desc`
    );
  }

  // Obtener NFT por documentId
  static async getNFTById(documentId: string): Promise<any> {
    return await apiClient.getById(API_CONFIG.ENDPOINTS.WALLET.USER_NFTS, documentId);
  }
}

export class NFTFactory {
  
  // Generar NFT de logro
  static createAchievementNFT(
    walletAddress: string,
    username: string,
    achievementType: string,
    iconName: string,
    rarity: NFTRarity = 'common'
  ): AchievementNFT {
    const tokenId = `${achievementType.toUpperCase()}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const currentTimestamp = new Date().toISOString();

    return {
      token_id: tokenId,
      contract_address: API_CONFIG.NFT_CONTRACT_ADDRESS,
      token_uri: `${API_CONFIG.STRAPI_URL}/api/nft-metadata/${tokenId}`,
      metadata: {
        name: this.getAchievementName(achievementType),
        description: this.getAchievementDescription(achievementType, username),
        icon_name: iconName,
        rarity,
        achievement_type: achievementType,
        earned_date: new Date().toLocaleDateString('es-ES'),
        attributes: [
          { trait_type: 'Achievement Type', value: this.getAchievementName(achievementType) },
          { trait_type: 'Rarity', value: rarity },
          { trait_type: 'Earned Date', value: new Date().toLocaleDateString('es-ES') },
          { trait_type: 'Player', value: username }
        ]
      },
      network: this.mapNetwork(API_CONFIG.BLOCKCHAIN_NETWORK),
      owner_address: walletAddress,
      is_listed_for_sale: 'False',
      listing_price_eth: 0,
      minted_at: currentTimestamp,
      last_transfer_at: currentTimestamp
    };
  }

  private static getAchievementName(type: string): string {
    const names: Record<string, string> = {
      'registration_achievement': 'Medabot Pioneer',
      'first_battle': 'First Battle',
      'level_10': 'Level 10 Master',
      'tournament_winner': 'Tournament Champion'
    };
    return names[type] || 'Achievement';
  }

  private static getAchievementDescription(type: string, username: string): string {
    const descriptions: Record<string, string> = {
      'registration_achievement': `¡Bienvenido al mundo de Medabot, ${username}! Este NFT conmemora tu registro como pionero en nuestra plataforma de juegos.`,
      'first_battle': `${username} ha completado su primera batalla en Medabot!`,
      'level_10': `${username} ha alcanzado el nivel 10 en Medabot!`
    };
    return descriptions[type] || `Logro desbloqueado por ${username}`;
  }

  private static mapNetwork(network: string): import('@/types/api').NetworkType {
    const networkMap: Record<string, import('@/types/api').NetworkType> = {
      'sepolia': 'ethereum-goerli',
      'mainnet': 'ethereum-mainnet',
      'polygon': 'polygon-mainnet',
      'mumbai': 'polygon-mumbai'
    };
    return networkMap[network] || 'ethereum-goerli';
  }
}