import axios from 'axios';
import { API_CONFIG } from '../config/api';

const API_URL = API_CONFIG.STRAPI_URL;

export interface NFTMarketplaceResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export interface ListNFTRequest {
  nftDocumentId: string;
  priceEth: number;
  priceUsdt: number;
  userId: number;
}

export interface BuyNFTRequest {
  nftDocumentId: string;
  buyerUserId: number;
}

class NFTMarketplaceService {
  private readonly baseURL = `${API_URL}/api`;

  private getAuthHeaders() {
    const token = localStorage.getItem('auth-token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Listar un NFT para venta en el marketplace
   * 1. Obtiene el NFT del usuario
   * 2. Lo elimina de la colección del usuario
   * 3. Lo crea en el marketplace con el precio especificado
   */
  async listNFTForSale(request: ListNFTRequest): Promise<NFTMarketplaceResult> {
    try {
      console.log('🛒 Listando NFT para venta:', request);

      // 1. Obtener el NFT del usuario
      const userNFTResponse = await axios.get(
        `${this.baseURL}/user-nfts?filters[documentId][$eq]=${request.nftDocumentId}&populate=*`,
        { headers: this.getAuthHeaders() }
      );

      if (!userNFTResponse.data.data || userNFTResponse.data.data.length === 0) {
        throw new Error('NFT no encontrado en la colección del usuario');
      }

      const userNFT = userNFTResponse.data.data[0];
      console.log('✅ NFT encontrado:', userNFT.metadata?.name);
      console.log('🆔 ID del NFT a eliminar:', userNFT.id);
      console.log('📄 Document ID del NFT:', userNFT.documentId);

      // 2. Eliminar el NFT de la colección del usuario
      const deleteUrl = `${this.baseURL}/user-nfts/${userNFT.documentId}`;
      console.log('🗑️ URL de eliminación:', deleteUrl);
      console.log('🗑️ Document ID a eliminar:', userNFT.documentId);
      
      const deleteResponse = await axios.delete(deleteUrl, { headers: this.getAuthHeaders() });
      console.log('🗑️ Respuesta de eliminación:', deleteResponse.status, deleteResponse.data);
      
      if (deleteResponse.status === 204) {
        console.log('✅ NFT eliminado de la colección del usuario exitosamente');
      } else {
        console.warn('⚠️ Respuesta inesperada al eliminar NFT:', deleteResponse.status);
      }

      // 3. Crear el NFT en el marketplace
      const marketplaceNFTData = {
        token_id: userNFT.token_id,
        contract_address: userNFT.contract_address,
        token_uri: userNFT.token_uri,
        metadata: userNFT.metadata,
        network: userNFT.network,
        owner_address: userNFT.owner_address,
        is_listed_for_sale: "True",
        listing_price_eth: request.priceEth,
        listing_price_usdt: request.priceUsdt,
        minted_at: userNFT.minted_at,
        last_transfer_at: new Date().toISOString()
      };

      const marketplaceResponse = await axios.post(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.BLOCKCHAIN.NFT_MARKETPLACE}`,
        { data: marketplaceNFTData },
        { headers: this.getAuthHeaders() }
      );

      if (!marketplaceResponse.data.data) {
        throw new Error('Error al crear el NFT en el marketplace');
      }

      const marketplaceNFT = marketplaceResponse.data.data;

      console.log('✅ NFT listado exitosamente en el marketplace:', {
        nftName: userNFT.metadata?.name,
        priceEth: request.priceEth,
        priceUsdt: request.priceUsdt,
        marketplaceId: marketplaceNFT.id
      });

      return {
        success: true,
        data: marketplaceNFT,
        message: `NFT "${userNFT.metadata?.name}" listado exitosamente por ${request.priceEth} ETH`
      };

    } catch (error) {
      console.error('❌ Error listando NFT para venta:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        console.error('❌ Error response:', (error as any).response.status, (error as any).response.data);
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al listar NFT'
      };
    }
  }

  /**
   * Comprar un NFT del marketplace
   * 1. Obtiene el NFT del marketplace
   * 2. Lo elimina del marketplace
   * 3. Lo agrega a la colección del comprador
   */
  async buyNFT(request: BuyNFTRequest): Promise<NFTMarketplaceResult> {
    try {
      console.log('🛒 Comprando NFT:', request);

      // 1. Obtener el NFT del marketplace
      const marketplaceNFTResponse = await axios.get(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.BLOCKCHAIN.NFT_MARKETPLACE}?filters[documentId][$eq]=${request.nftDocumentId}&populate=*`,
        { headers: this.getAuthHeaders() }
      );

      if (!marketplaceNFTResponse.data.data || marketplaceNFTResponse.data.data.length === 0) {
        throw new Error('NFT no encontrado en el marketplace');
      }

      const marketplaceNFT = marketplaceNFTResponse.data.data[0];
      console.log('✅ NFT encontrado en marketplace:', marketplaceNFT.metadata?.name);

      // 2. Obtener la wallet del comprador
      const buyerWalletResponse = await axios.get(
        `${this.baseURL}/user-wallets?filters[users_permissions_user][id][$eq]=${request.buyerUserId}&populate=*`,
        { headers: this.getAuthHeaders() }
      );

      if (!buyerWalletResponse.data.data || buyerWalletResponse.data.data.length === 0) {
        throw new Error('No se encontró wallet del comprador');
      }

      const buyerWallet = buyerWalletResponse.data.data[0];

      // 3. Eliminar el NFT del marketplace
      await axios.delete(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.BLOCKCHAIN.NFT_MARKETPLACE}/${marketplaceNFT.id}`,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ NFT eliminado del marketplace');

      // 4. Crear el NFT en la colección del comprador
      const buyerNFTData = {
        token_id: marketplaceNFT.token_id,
        contract_address: marketplaceNFT.contract_address,
        token_uri: marketplaceNFT.token_uri,
        metadata: marketplaceNFT.metadata,
        network: marketplaceNFT.network,
        owner_address: buyerWallet.wallet_address,
        is_listed_for_sale: "False",
        listing_price_eth: 0,
        minted_at: marketplaceNFT.minted_at,
        last_transfer_at: new Date().toISOString(),
        user_wallet: buyerWallet.id
      };

      const buyerNFTResponse = await axios.post(
        `${this.baseURL}/user-nfts`,
        { data: buyerNFTData },
        { headers: this.getAuthHeaders() }
      );

      if (!buyerNFTResponse.data.data) {
        throw new Error('Error al agregar el NFT a la colección del comprador');
      }

      const buyerNFT = buyerNFTResponse.data.data;

      console.log('✅ NFT comprado exitosamente:', {
        nftName: marketplaceNFT.metadata?.name,
        buyerId: request.buyerUserId,
        buyerWallet: buyerWallet.wallet_address,
        newNFTId: buyerNFT.id
      });

      return {
        success: true,
        data: buyerNFT,
        message: `NFT "${marketplaceNFT.metadata?.name}" comprado exitosamente`
      };

    } catch (error) {
      console.error('❌ Error comprando NFT:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al comprar NFT'
      };
    }
  }

  /**
   * Obtener todos los NFTs listados en el marketplace
   */
  async getMarketplaceNFTs(page = 1, pageSize = 12): Promise<NFTMarketplaceResult> {
    try {
      console.log('🔍 Obteniendo NFTs del marketplace...');

      const response = await axios.get(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.BLOCKCHAIN.NFT_MARKETPLACE}?filters[is_listed_for_sale][$eq]=True&populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort[0]=createdAt:desc`,
        { headers: this.getAuthHeaders() }
      );

      const nfts = response.data.data || [];
      const pagination = response.data.meta?.pagination;

      console.log(`✅ ${nfts.length} NFTs encontrados en el marketplace`);

      return {
        success: true,
        data: {
          nfts,
          pagination
        }
      };

    } catch (error) {
      console.error('❌ Error obteniendo NFTs del marketplace:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error obteniendo NFTs del marketplace',
        data: {
          nfts: [],
          pagination: { page: 1, pageSize, pageCount: 1, total: 0 }
        }
      };
    }
  }

  /**
   * Obtener NFTs del marketplace por owner_address
   */
  async getMarketplaceNFTsByOwner(ownerAddress: string): Promise<NFTMarketplaceResult> {
    try {
      console.log('🔍 Obteniendo NFTs del marketplace por owner:', ownerAddress);

      const url = `${this.baseURL}${API_CONFIG.ENDPOINTS.BLOCKCHAIN.NFT_MARKETPLACE}?filters[owner_address][$eq]=${ownerAddress}&filters[is_listed_for_sale][$eq]=True&populate=*&sort[0]=createdAt:desc`;
      console.log('🌐 URL de la petición:', url);

      const response = await axios.get(url, { headers: this.getAuthHeaders() });

      console.log('📡 Respuesta completa:', response.data);
      const nfts = response.data.data || [];

      console.log(`✅ ${nfts.length} NFTs encontrados para el owner ${ownerAddress}`);
      if (nfts.length > 0) {
        console.log('📋 NFTs encontrados:', nfts.map((nft: any) => ({
          name: nft.metadata?.name,
          token_id: nft.token_id,
          owner_address: nft.owner_address,
          price: nft.listing_price_eth
        })));
      }

      return {
        success: true,
        data: nfts
      };

    } catch (error) {
      console.error('❌ Error obteniendo NFTs del marketplace por owner:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error obteniendo NFTs del marketplace',
        data: []
      };
    }
  }

  /**
   * Quitar NFT de la lista del marketplace y devolverlo a la colección del usuario
   */
  async unlistNFT(request: { nftDocumentId: string; userId: number }): Promise<NFTMarketplaceResult> {
    try {
      console.log('🛒 Quitando NFT de la lista:', request);

      // 1. Obtener el NFT del marketplace usando el documentId del marketplace
      const marketplaceUrl = `${this.baseURL}${API_CONFIG.ENDPOINTS.BLOCKCHAIN.NFT_MARKETPLACE}?filters[documentId][$eq]=${request.nftDocumentId}&populate=*`;
      console.log('🔍 URL para obtener NFT del marketplace:', marketplaceUrl);
      
      const marketplaceNFTResponse = await axios.get(marketplaceUrl, { headers: this.getAuthHeaders() });

      if (!marketplaceNFTResponse.data.data || marketplaceNFTResponse.data.data.length === 0) {
        throw new Error('NFT no encontrado en el marketplace');
      }

      const marketplaceNFT = marketplaceNFTResponse.data.data[0];
      console.log('✅ NFT encontrado en marketplace:', marketplaceNFT.metadata?.name);
      console.log('🆔 ID del NFT en marketplace:', marketplaceNFT.id);
      console.log('📄 Document ID del NFT en marketplace:', marketplaceNFT.documentId);

      // 2. Obtener la wallet del usuario
      const walletUrl = `${this.baseURL}/user-wallets?filters[users_permissions_user][id][$eq]=${request.userId}&populate=*`;
      console.log('🔍 URL para obtener wallet del usuario:', walletUrl);
      
      const userWalletResponse = await axios.get(walletUrl, { headers: this.getAuthHeaders() });

      if (!userWalletResponse.data.data || userWalletResponse.data.data.length === 0) {
        throw new Error('No se encontró wallet del usuario');
      }

      const userWallet = userWalletResponse.data.data[0];
      console.log('✅ Wallet del usuario encontrada:', userWallet.wallet_address);

      // 3. Eliminar el NFT del marketplace usando el documentId del marketplace
      const deleteUrl = `${this.baseURL}${API_CONFIG.ENDPOINTS.BLOCKCHAIN.NFT_MARKETPLACE}/${marketplaceNFT.documentId}`;
      console.log('🗑️ URL para eliminar NFT del marketplace:', deleteUrl);
      
      const deleteResponse = await axios.delete(deleteUrl, { headers: this.getAuthHeaders() });
      console.log('🗑️ Respuesta de eliminación del marketplace:', deleteResponse.status, deleteResponse.data);
      console.log('✅ NFT eliminado del marketplace');

      // 4. Crear el NFT en la colección del usuario
      const userNFTData = {
        token_id: marketplaceNFT.token_id,
        contract_address: marketplaceNFT.contract_address,
        token_uri: marketplaceNFT.token_uri,
        metadata: marketplaceNFT.metadata,
        network: marketplaceNFT.network,
        owner_address: userWallet.wallet_address,
        is_listed_for_sale: "False",
        listing_price_eth: 0,
        minted_at: marketplaceNFT.minted_at,
        last_transfer_at: new Date().toISOString(),
        user_wallet: userWallet.id
      };

      console.log('📝 Datos del NFT a crear en user-nfts:', userNFTData);

      const userNFTResponse = await axios.post(
        `${this.baseURL}/user-nfts`,
        { data: userNFTData },
        { headers: this.getAuthHeaders() }
      );

      if (!userNFTResponse.data.data) {
        throw new Error('Error al agregar el NFT a la colección del usuario');
      }

      const userNFT = userNFTResponse.data.data;
      console.log('✅ NFT creado en user-nfts:', userNFT.id);

      console.log('✅ NFT quitado de la lista exitosamente:', {
        nftName: marketplaceNFT.metadata?.name,
        userId: request.userId,
        userWallet: userWallet.wallet_address,
        newNFTId: userNFT.id,
        marketplaceDeleted: marketplaceNFT.documentId,
        userNFTCreated: userNFT.id
      });

      return {
        success: true,
        data: userNFT,
        message: `NFT "${marketplaceNFT.metadata?.name}" quitado de la lista exitosamente`
      };

    } catch (error) {
      console.error('❌ Error quitando NFT de la lista:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        console.error('❌ Error response:', (error as any).response.status, (error as any).response.data);
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al quitar NFT de la lista'
      };
    }
  }

  /**
   * Buscar NFTs en el marketplace por nombre o descripción
   */
  async searchMarketplaceNFTs(searchTerm: string, page = 1, pageSize = 12): Promise<NFTMarketplaceResult> {
    try {
      console.log('🔍 Buscando NFTs en el marketplace:', searchTerm);

      const response = await axios.get(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.BLOCKCHAIN.NFT_MARKETPLACE}?filters[is_listed_for_sale][$eq]=True&filters[metadata][name][$containsi]=${searchTerm}&populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort[0]=createdAt:desc`,
        { headers: this.getAuthHeaders() }
      );

      const nfts = response.data.data || [];
      const pagination = response.data.meta?.pagination;

      console.log(`✅ ${nfts.length} NFTs encontrados para la búsqueda "${searchTerm}"`);

      return {
        success: true,
        data: {
          nfts,
          pagination
        }
      };

    } catch (error) {
      console.error('❌ Error buscando NFTs en el marketplace:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error buscando NFTs en el marketplace',
        data: {
          nfts: [],
          pagination: { page: 1, pageSize, pageCount: 1, total: 0 }
        }
      };
    }
  }

  /**
   * Filtrar NFTs del marketplace por rareza
   */
  async filterMarketplaceNFTsByRarity(rarity: string, page = 1, pageSize = 12): Promise<NFTMarketplaceResult> {
    try {
      console.log('🔍 Filtrando NFTs del marketplace por rareza:', rarity);

      const response = await axios.get(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.BLOCKCHAIN.NFT_MARKETPLACE}?filters[is_listed_for_sale][$eq]=True&filters[metadata][rarity][$eq]=${rarity}&populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort[0]=createdAt:desc`,
        { headers: this.getAuthHeaders() }
      );

      const nfts = response.data.data || [];
      const pagination = response.data.meta?.pagination;

      console.log(`✅ ${nfts.length} NFTs encontrados con rareza "${rarity}"`);

      return {
        success: true,
        data: {
          nfts,
          pagination
        }
      };

    } catch (error) {
      console.error('❌ Error filtrando NFTs del marketplace por rareza:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error filtrando NFTs del marketplace',
        data: {
          nfts: [],
          pagination: { page: 1, pageSize, pageCount: 1, total: 0 }
        }
      };
    }
  }
}

export const nftMarketplaceService = new NFTMarketplaceService(); 