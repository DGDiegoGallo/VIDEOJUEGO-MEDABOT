import axios from 'axios';
import { API_CONFIG } from '../config/api';
// Importar datos demo del JSON
import marketplaceNFTData from '../../docs/marketplace-nft-data.json';

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
   * Buscar NFT en datos demo por token_id
   */
  private findDemoNFTByTokenId(tokenId: string): any | null {
    return marketplaceNFTData.data.find(nft => nft.token_id === tokenId) || null;
  }

  /**
   * Buscar NFT en datos demo por documentId (usando token_id como fallback)
   */
  private findDemoNFTByDocumentId(documentId: string): any | null {
    // Primero buscar por token_id ya que los datos demo usan token_id como identificador
    return marketplaceNFTData.data.find(nft => 
      nft.token_id === documentId || 
      nft.token_id.toLowerCase().includes(documentId.toLowerCase())
    ) || null;
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
   * 1. Obtiene el NFT del marketplace usando documentId
   * 2. Lo elimina del marketplace usando documentId
   * 3. Lo agrega a la colección del comprador (user-nfts)
   */
  async buyNFT(request: BuyNFTRequest): Promise<NFTMarketplaceResult> {
    try {
      console.log('🛒 Comprando NFT:', request);

      // 1. Obtener el NFT del marketplace usando documentId
      const marketplaceNFTResponse = await axios.get(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.BLOCKCHAIN.NFT_MARKETPLACE}?filters[documentId][$eq]=${request.nftDocumentId}&populate=*`,
        { headers: this.getAuthHeaders() }
      );

      let marketplaceNFT = null;
      let isDemoNFT = false;

      if (!marketplaceNFTResponse.data.data || marketplaceNFTResponse.data.data.length === 0) {
        // Si no se encuentra en la base de datos, buscar en datos demo
        console.log('🔍 NFT no encontrado en la base de datos, buscando en datos demo...');
        const demoNFT = this.findDemoNFTByDocumentId(request.nftDocumentId);
        
        if (demoNFT) {
          console.log('✅ NFT encontrado en datos demo:', demoNFT.metadata.name);
          
          // Convertir datos demo al formato esperado
          marketplaceNFT = {
            id: `demo_${demoNFT.token_id}`,
            documentId: request.nftDocumentId,
            token_id: demoNFT.token_id,
            contract_address: demoNFT.contract_address,
            token_uri: demoNFT.token_uri,
            metadata: demoNFT.metadata,
            network: demoNFT.network,
            owner_address: demoNFT.owner_address,
            is_listed_for_sale: demoNFT.is_listed_for_sale,
            listing_price_eth: demoNFT.listing_price_eth,
            listing_price_usdt: demoNFT.listing_price_usdt,
            minted_at: demoNFT.minted_at,
            last_transfer_at: demoNFT.last_transfer_at
          };
          isDemoNFT = true;
        } else {
          throw new Error('NFT no encontrado en el marketplace ni en datos demo');
      }
      } else {
        marketplaceNFT = marketplaceNFTResponse.data.data[0];
      }
      console.log('✅ NFT encontrado en marketplace:', marketplaceNFT.metadata?.name);
      console.log('🆔 Document ID del NFT en marketplace:', marketplaceNFT.documentId);

      // 2. Obtener la wallet del comprador
      const buyerWalletResponse = await axios.get(
        `${this.baseURL}/user-wallets?filters[users_permissions_user][id][$eq]=${request.buyerUserId}&populate=*`,
        { headers: this.getAuthHeaders() }
      );

      if (!buyerWalletResponse.data.data || buyerWalletResponse.data.data.length === 0) {
        throw new Error('No se encontró wallet del comprador');
      }

      const buyerWallet = buyerWalletResponse.data.data[0];
      console.log('✅ Wallet del comprador encontrada:', buyerWallet.wallet_address);

      // 3. Eliminar el NFT del marketplace usando documentId (solo si no es un NFT demo)
      if (!isDemoNFT) {
      const deleteUrl = `${this.baseURL}${API_CONFIG.ENDPOINTS.BLOCKCHAIN.NFT_MARKETPLACE}/${marketplaceNFT.documentId}`;
      console.log('🗑️ URL para eliminar NFT del marketplace:', deleteUrl);
      
      const deleteResponse = await axios.delete(deleteUrl, { headers: this.getAuthHeaders() });
      console.log('🗑️ Respuesta de eliminación del marketplace:', deleteResponse.status, deleteResponse.data);
      console.log('✅ NFT eliminado del marketplace');
      } else {
        console.log('ℹ️ NFT demo - no se elimina del marketplace ya que es datos de demostración');
      }

      // 4. Crear el NFT en la colección del comprador (user-nfts)
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

      console.log('📝 Datos del NFT a crear en user-nfts:', buyerNFTData);

      const buyerNFTResponse = await axios.post(
        `${this.baseURL}/user-nfts`,
        { data: buyerNFTData },
        { headers: this.getAuthHeaders() }
      );

      if (!buyerNFTResponse.data.data) {
        throw new Error('Error al agregar el NFT a la colección del comprador');
      }

      const buyerNFT = buyerNFTResponse.data.data;
      console.log('✅ NFT creado en user-nfts:', buyerNFT.id);

      console.log('✅ NFT comprado exitosamente:', {
        nftName: marketplaceNFT.metadata?.name,
        buyerId: request.buyerUserId,
        buyerWallet: buyerWallet.wallet_address,
        newNFTId: buyerNFT.id,
        marketplaceDeleted: marketplaceNFT.documentId,
        userNFTCreated: buyerNFT.id
      });

      return {
        success: true,
        data: buyerNFT,
        message: `NFT "${marketplaceNFT.metadata?.name}" comprado exitosamente${isDemoNFT ? ' (Demo)' : ''}`
      };

    } catch (error) {
      console.error('❌ Error comprando NFT:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        console.error('❌ Error response:', (error as any).response.status, (error as any).response.data);
      }
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

      let allNFTs = [];

      // 1. Obtener NFTs de la base de datos
      try {
      const response = await axios.get(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.BLOCKCHAIN.NFT_MARKETPLACE}?filters[is_listed_for_sale][$eq]=True&populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort[0]=createdAt:desc`,
        { headers: this.getAuthHeaders() }
      );

        const dbNFTs = response.data.data || [];
        allNFTs.push(...dbNFTs.map((nft: any) => ({
          ...nft,
          source: 'database'
        })));
        
        console.log(`✅ ${dbNFTs.length} NFTs encontrados en la base de datos`);
      } catch (dbError) {
        console.log('⚠️ Error obteniendo NFTs de la base de datos:', dbError);
      }

      // 2. Agregar NFTs demo con estructura compatible
      const demoNFTs = marketplaceNFTData.data.map((demoNFT, index) => ({
        id: `demo_${demoNFT.token_id}`,
        documentId: demoNFT.token_id, // Usar token_id como documentId para los demos
        createdAt: demoNFT.minted_at,
        updatedAt: demoNFT.last_transfer_at,
        publishedAt: demoNFT.minted_at,
        token_id: demoNFT.token_id,
        contract_address: demoNFT.contract_address,
        token_uri: demoNFT.token_uri,
        metadata: demoNFT.metadata,
        network: demoNFT.network,
        owner_address: demoNFT.owner_address,
        is_listed_for_sale: demoNFT.is_listed_for_sale,
        listing_price_eth: demoNFT.listing_price_eth,
        listing_price_usdt: demoNFT.listing_price_usdt,
        minted_at: demoNFT.minted_at,
        last_transfer_at: demoNFT.last_transfer_at,
        source: 'demo'
      }));

      allNFTs.push(...demoNFTs);
      console.log(`✅ ${demoNFTs.length} NFTs demo agregados`);

      console.log(`🎯 Total NFTs disponibles: ${allNFTs.length}`);

      // 3. Aplicar paginación manual para todos los NFTs
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedNFTs = allNFTs.slice(startIndex, endIndex);

      const totalPages = Math.ceil(allNFTs.length / pageSize);

      return {
        success: true,
        data: {
          nfts: paginatedNFTs,
          pagination: {
            page,
            pageSize,
            pageCount: totalPages,
            total: allNFTs.length
          }
        }
      };

    } catch (error) {
      console.error('❌ Error obteniendo NFTs del marketplace:', error);
      
      // En caso de error, retornar al menos los NFTs demo
      const demoNFTs = marketplaceNFTData.data.map((demoNFT) => ({
        id: `demo_${demoNFT.token_id}`,
        documentId: demoNFT.token_id,
        createdAt: demoNFT.minted_at,
        updatedAt: demoNFT.last_transfer_at,
        publishedAt: demoNFT.minted_at,
        token_id: demoNFT.token_id,
        contract_address: demoNFT.contract_address,
        token_uri: demoNFT.token_uri,
        metadata: demoNFT.metadata,
        network: demoNFT.network,
        owner_address: demoNFT.owner_address,
        is_listed_for_sale: demoNFT.is_listed_for_sale,
        listing_price_eth: demoNFT.listing_price_eth,
        listing_price_usdt: demoNFT.listing_price_usdt,
        minted_at: demoNFT.minted_at,
        last_transfer_at: demoNFT.last_transfer_at,
        source: 'demo'
      }));

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error obteniendo NFTs del marketplace',
        data: {
          nfts: demoNFTs,
          pagination: { page: 1, pageSize: demoNFTs.length, pageCount: 1, total: demoNFTs.length }
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