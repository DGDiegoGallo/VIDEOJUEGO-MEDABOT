import axios from 'axios';
import { API_CONFIG } from '../config/api';

const API_URL = API_CONFIG.STRAPI_URL;

export interface NFTPurchaseTransaction {
  id: string;
  nftId: string;
  buyerId: number;
  sellerId: number;
  price: number;
  transactionHash: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

export interface NFTPurchaseResult {
  success: boolean;
  transaction?: NFTPurchaseTransaction;
  error?: string;
  message?: string;
}

class NFTPurchaseService {
  private readonly baseURL = `${API_URL}/api`;

  private getAuthHeaders() {
    const token = localStorage.getItem('auth-token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Procesa la compra de un NFT
   */
  async purchaseNFT(
    nftDocumentId: string,
    buyerUserId: number,
    price: number
  ): Promise<NFTPurchaseResult> {
    try {
      console.log('🛒 Iniciando compra de NFT:', {
        nftDocumentId,
        buyerUserId,
        price
      });

      // 1. Obtener información del NFT
      const nftResponse = await axios.get(
        `${this.baseURL}/nfts/${nftDocumentId}?populate=*`,
        { headers: this.getAuthHeaders() }
      );

      if (!nftResponse.data.data) {
        throw new Error('NFT no encontrado');
      }

      const nft = nftResponse.data.data;
      
      // Verificar que el NFT esté en venta
      if (nft.is_listed_for_sale !== 'True') {
        throw new Error('Este NFT no está disponible para la venta');
      }

      // Verificar que el comprador no sea el vendedor
      if (nft.owner_address === nft.buyer_address) {
        throw new Error('No puedes comprar tu propio NFT');
      }

      // 2. Obtener información del vendedor
      const sellerResponse = await axios.get(
        `${this.baseURL}/user-wallets?filters[wallet_address][$eq]=${nft.owner_address}&populate=*`,
        { headers: this.getAuthHeaders() }
      );

      if (!sellerResponse.data.data || sellerResponse.data.data.length === 0) {
        throw new Error('No se pudo encontrar al vendedor');
      }

      const sellerWallet = sellerResponse.data.data[0];
      const sellerUserId = sellerWallet.users_permissions_user.id;

      // 3. Obtener información del comprador
      const buyerResponse = await axios.get(
        `${this.baseURL}/user-wallets?filters[users_permissions_user][id][$eq]=${buyerUserId}&populate=*`,
        { headers: this.getAuthHeaders() }
      );

      if (!buyerResponse.data.data || buyerResponse.data.data.length === 0) {
        throw new Error('No se pudo encontrar tu wallet');
      }

      const buyerWallet = buyerResponse.data.data[0];

      // 4. Verificar balance del comprador
      if (buyerWallet.usdt_balance < price) {
        throw new Error(`Balance insuficiente. Necesitas ${price} USDT, tienes ${buyerWallet.usdt_balance} USDT`);
      }

      // 5. Crear transacción de compra
      const transaction: NFTPurchaseTransaction = {
        id: Date.now().toString(),
        nftId: nftDocumentId,
        buyerId: buyerUserId,
        sellerId: sellerUserId,
        price: price,
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // 6. Procesar transferencia de fondos
      const transferResult = await this.processFundTransfer(
        buyerWallet,
        sellerWallet,
        price,
        transaction.transactionHash
      );

      if (!transferResult.success) {
        throw new Error(transferResult.error || 'Error en la transferencia de fondos');
      }

      // 7. Actualizar propietario del NFT
      await this.updateNFTOwnership(nftDocumentId, buyerWallet.wallet_address);

      // 8. Marcar transacción como completada
      transaction.status = 'completed';
      transaction.completedAt = new Date().toISOString();

      console.log('✅ Compra de NFT completada exitosamente:', {
        nftName: nft.metadata.name,
        price: price,
        transactionHash: transaction.transactionHash,
        newOwner: buyerWallet.wallet_address
      });

      return {
        success: true,
        transaction,
        message: 'NFT comprado exitosamente'
      };

    } catch (error) {
      console.error('❌ Error en la compra de NFT:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido en la compra'
      };
    }
  }

  /**
   * Procesa la transferencia de fondos entre comprador y vendedor
   */
  private async processFundTransfer(
    buyerWallet: any,
    sellerWallet: any,
    amount: number,
    transactionHash: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Actualizar balance del comprador (restar)
      const newBuyerBalance = buyerWallet.usdt_balance - amount;
      const buyerTransaction = {
        id: Date.now().toString(),
        type: 'purchase',
        amount: -amount,
        from: buyerWallet.wallet_address,
        to: sellerWallet.wallet_address,
        timestamp: new Date().toISOString(),
        status: 'completed',
        network: 'ETH',
        tx_hash: transactionHash,
        fee: 0
      };

      await axios.put(
        `${this.baseURL}/user-wallets/${buyerWallet.documentId}`,
        {
          data: {
            ...buyerWallet,
            usdt_balance: newBuyerBalance,
            transaction_history: [buyerTransaction, ...(buyerWallet.transaction_history || [])]
          }
        },
        { headers: this.getAuthHeaders() }
      );

      // Actualizar balance del vendedor (sumar)
      const newSellerBalance = sellerWallet.usdt_balance + amount;
      const sellerTransaction = {
        id: (Date.now() + 1).toString(),
        type: 'sale',
        amount: amount,
        from: buyerWallet.wallet_address,
        to: sellerWallet.wallet_address,
        timestamp: new Date().toISOString(),
        status: 'completed',
        network: 'ETH',
        tx_hash: transactionHash,
        fee: 0
      };

      await axios.put(
        `${this.baseURL}/user-wallets/${sellerWallet.documentId}`,
        {
          data: {
            ...sellerWallet,
            usdt_balance: newSellerBalance,
            transaction_history: [sellerTransaction, ...(sellerWallet.transaction_history || [])]
          }
        },
        { headers: this.getAuthHeaders() }
      );

      return { success: true };

    } catch (error) {
      console.error('Error en transferencia de fondos:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error en transferencia'
      };
    }
  }

  /**
   * Actualiza el propietario del NFT
   */
  private async updateNFTOwnership(nftDocumentId: string, newOwnerAddress: string): Promise<void> {
    try {
      await axios.put(
        `${this.baseURL}/nfts/${nftDocumentId}`,
        {
          data: {
            owner_address: newOwnerAddress,
            is_listed_for_sale: 'False',
            listing_price_eth: 0,
            last_transfer_at: new Date().toISOString()
          }
        },
        { headers: this.getAuthHeaders() }
      );

      console.log('✅ Propietario del NFT actualizado:', newOwnerAddress);

    } catch (error) {
      console.error('Error actualizando propietario del NFT:', error);
      throw error;
    }
  }

  /**
   * Obtiene el historial de compras de un usuario
   */
  async getPurchaseHistory(userId: number): Promise<NFTPurchaseTransaction[]> {
    try {
      // Aquí podrías implementar la lógica para obtener el historial
      // Por ahora retornamos un array vacío
      return [];
    } catch (error) {
      console.error('Error obteniendo historial de compras:', error);
      return [];
    }
  }

  /**
   * Verifica si un usuario puede comprar un NFT específico
   */
  async canPurchaseNFT(nftDocumentId: string, userId: number): Promise<{
    canPurchase: boolean;
    reason?: string;
    nftPrice?: number;
    userBalance?: number;
  }> {
    try {
      // Obtener información del NFT
      const nftResponse = await axios.get(
        `${this.baseURL}/nfts/${nftDocumentId}`,
        { headers: this.getAuthHeaders() }
      );

      if (!nftResponse.data.data) {
        return { canPurchase: false, reason: 'NFT no encontrado' };
      }

      const nft = nftResponse.data.data;
      const nftPrice = nft.listing_price_eth;

      // Verificar que esté en venta
      if (nft.is_listed_for_sale !== 'True') {
        return { canPurchase: false, reason: 'NFT no está en venta' };
      }

      // Obtener balance del usuario
      const walletResponse = await axios.get(
        `${this.baseURL}/user-wallets?filters[users_permissions_user][id][$eq]=${userId}`,
        { headers: this.getAuthHeaders() }
      );

      if (!walletResponse.data.data || walletResponse.data.data.length === 0) {
        return { canPurchase: false, reason: 'No tienes una wallet configurada' };
      }

      const userBalance = walletResponse.data.data[0].usdt_balance;

      // Verificar balance
      if (userBalance < nftPrice) {
        return {
          canPurchase: false,
          reason: 'Balance insuficiente',
          nftPrice,
          userBalance
        };
      }

      return {
        canPurchase: true,
        nftPrice,
        userBalance
      };

    } catch (error) {
      console.error('Error verificando capacidad de compra:', error);
      return { canPurchase: false, reason: 'Error al verificar' };
    }
  }
}

export const nftPurchaseService = new NFTPurchaseService(); 