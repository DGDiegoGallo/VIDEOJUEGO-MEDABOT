import axios from 'axios';
import { API_CONFIG } from '../config/api';
import { mockMarketplaceNFTs } from '../utils/mockNFTData';

const API_URL = API_CONFIG.STRAPI_URL;

export interface SimpleNFTPurchaseResult {
  success: boolean;
  nft?: any;
  error?: string;
  message?: string;
}

class SimpleNFTService {
  private readonly baseURL = `${API_URL}/api`;

  private getAuthHeaders() {
    const token = localStorage.getItem('auth-token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Agrega un NFT directamente a la colección del usuario sin verificación de balance
   */
  async addNFTToUserCollection(
    nftDocumentId: string,
    userId: number
  ): Promise<SimpleNFTPurchaseResult> {
    try {
      console.log('🎮 Agregando NFT a colección del usuario:', {
        nftDocumentId,
        userId
      });

      let nft: any = null;
      let isMockData = false;

      // 1. Primero intentar buscar el NFT en la base de datos
      try {
        console.log('🔍 Buscando NFT en la base de datos...');
        const nftResponse = await axios.get(
          `${this.baseURL}/nfts?filters[documentId][$eq]=${nftDocumentId}&populate=*`,
          { headers: this.getAuthHeaders() }
        );

        if (nftResponse.data.data && nftResponse.data.data.length > 0) {
          nft = nftResponse.data.data[0];
          console.log('✅ NFT encontrado en la base de datos:', nft.metadata?.name || nft.documentId);
        }
      } catch (dbError) {
        console.log('⚠️ NFT no encontrado en la base de datos, buscando en datos mock...');
      }

      // 2. Si no se encontró en la base de datos, buscar en datos mock
      if (!nft) {
        nft = mockMarketplaceNFTs.find(mockNft => mockNft.documentId === nftDocumentId);
        if (nft) {
          isMockData = true;
          console.log('✅ NFT encontrado en datos mock:', nft.metadata.name);
        }
      }

      if (!nft) {
        throw new Error('NFT no encontrado ni en la base de datos ni en los datos de demostración');
      }

      // 3. Obtener la wallet del usuario
      const walletResponse = await axios.get(
        `${this.baseURL}/user-wallets?filters[users_permissions_user][id][$eq]=${userId}&populate=*`,
        { headers: this.getAuthHeaders() }
      );

      if (!walletResponse.data.data || walletResponse.data.data.length === 0) {
        throw new Error('No se encontró wallet del usuario');
      }

      const userWallet = walletResponse.data.data[0];
      
      // 4. Crear un nuevo NFT para el usuario con la estructura correcta
      const newNFTData = {
        token_id: `PURCHASE_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        contract_address: nft.contract_address || nft.attributes?.contract_address,
        token_uri: nft.token_uri || nft.attributes?.token_uri,
        metadata: nft.metadata || nft.attributes?.metadata,
        network: nft.network || nft.attributes?.network,
        owner_address: userWallet.wallet_address,
        is_listed_for_sale: "False",
        listing_price_eth: 0,
        minted_at: new Date().toISOString(),
        last_transfer_at: new Date().toISOString(),
        user_wallet: userWallet.id
      };

      // 5. Crear el NFT en la base de datos usando el endpoint correcto
      const createNFTResponse = await axios.post(
        `${this.baseURL}/user-nfts`,
        { data: newNFTData },
        { headers: this.getAuthHeaders() }
      );

      if (!createNFTResponse.data.data) {
        throw new Error('Error al crear el NFT');
      }

      const newNFT = createNFTResponse.data.data;

      console.log('✅ NFT agregado exitosamente a la colección del usuario:', {
        nftName: nft.metadata?.name || nft.attributes?.metadata?.name,
        userId,
        newNFTId: newNFT.id,
        walletAddress: userWallet.wallet_address,
        source: isMockData ? 'Mock Data' : 'Database'
      });

      return {
        success: true,
        nft: newNFT,
        message: `NFT agregado exitosamente a tu colección${isMockData ? ' (Demo)' : ''}`
      };

    } catch (error) {
      console.error('❌ Error agregando NFT a la colección:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al agregar NFT'
      };
    }
  }

  /**
   * Obtiene todos los NFTs disponibles para compra (combina base de datos y datos mock)
   */
  async getAvailableNFTs(): Promise<any[]> {
    try {
      const allNFTs: any[] = [];

      // 1. Obtener NFTs de la base de datos que estén listados para venta
      try {
        console.log('🔍 Obteniendo NFTs de la base de datos...');
        const dbResponse = await axios.get(
          `${this.baseURL}/nfts?filters[is_listed_for_sale][$eq]=True&populate=*`,
          { headers: this.getAuthHeaders() }
        );

        if (dbResponse.data.data && dbResponse.data.data.length > 0) {
          const dbNFTs = dbResponse.data.data.map((nft: any) => ({
            ...nft,
            source: 'database'
          }));
          allNFTs.push(...dbNFTs);
          console.log(`✅ ${dbNFTs.length} NFTs encontrados en la base de datos`);
        }
      } catch (dbError) {
        console.log('⚠️ Error obteniendo NFTs de la base de datos:', dbError);
      }

      // 2. Agregar NFTs de demostración
      const mockNFTs = mockMarketplaceNFTs.map(nft => ({
        ...nft,
        source: 'mock'
      }));
      allNFTs.push(...mockNFTs);
      console.log(`✅ ${mockNFTs.length} NFTs de demostración agregados`);

      console.log(`🎯 Total de NFTs disponibles: ${allNFTs.length}`);
      return allNFTs;

    } catch (error) {
      console.error('Error obteniendo NFTs disponibles:', error);
      // En caso de error, retornar al menos los NFTs de demostración
      return mockMarketplaceNFTs.map(nft => ({
        ...nft,
        source: 'mock'
      }));
    }
  }
}

export const simpleNFTService = new SimpleNFTService(); 