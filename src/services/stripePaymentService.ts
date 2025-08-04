import { stripeService } from './stripe.service';
import { userWalletService } from './userWallet.service';
import { useAuthStore } from '@/stores/authStore';

export interface PaymentRequest {
  amount: number;
  network: string;
  usdtAmount: number;
  usdtPrice: number;
  userId: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentIntentId?: string;
  clientSecret?: string;
  error?: string;
  redirectUrl?: string;
}

export interface PaymentConfirmation {
  success: boolean;
  transactionHash?: string;
  error?: string;
  wallet?: any;
}

class StripePaymentService {
  private readonly supportedNetworks = ['bsc', 'eth', 'polygon'];
  private readonly minAmount = 10;
  private readonly maxAmount = 50000;

  /**
   * Validar la solicitud de pago
   */
  private validatePaymentRequest(request: PaymentRequest): { valid: boolean; error?: string } {
    if (!request.amount || request.amount < this.minAmount) {
      return { valid: false, error: `El monto mínimo es $${this.minAmount}` };
    }

    if (request.amount > this.maxAmount) {
      return { valid: false, error: `El monto máximo es $${this.maxAmount}` };
    }

    if (!this.supportedNetworks.includes(request.network)) {
      return { valid: false, error: 'Red no soportada' };
    }

    if (!request.userId) {
      return { valid: false, error: 'Usuario no identificado' };
    }

    return { valid: true };
  }

  /**
   * Calcular comisiones y total
   */
  private calculateFees(amount: number, network: string): {
    networkFee: number;
    stripeFee: number;
    total: number;
  } {
    const networkFees = {
      bsc: 0,
      eth: 1.5,
      polygon: 0.5
    };

    const networkFee = networkFees[network as keyof typeof networkFees] || 0;
    const stripeFee = amount * 0.029 + 0.30; // 2.9% + $0.30
    const total = amount + networkFee + stripeFee;

    return {
      networkFee,
      stripeFee,
      total
    };
  }

  /**
   * Crear sesión de pago
   */
  async createPaymentSession(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Validar solicitud
      const validation = this.validatePaymentRequest(request);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Calcular comisiones
      const fees = this.calculateFees(request.amount, request.network);

      // Crear metadata para Stripe
      const metadata = {
        userId: request.userId,
        usdtAmount: request.usdtAmount.toString(),
        network: request.network,
        usdtPrice: request.usdtPrice.toString(),
        networkFee: fees.networkFee.toString(),
        stripeFee: fees.stripeFee.toFixed(2)
      };

      // Crear Payment Intent
      const paymentData = {
        amount: Math.round(fees.total * 100), // Stripe usa centavos
        currency: 'usd',
        metadata,
        description: `Compra de ${request.usdtAmount} USDT en ${request.network.toUpperCase()}`,
        receipt_email: 'user@example.com', // Se puede obtener del usuario
        automatic_payment_methods: {
          enabled: true,
        }
      };

      const intent = await stripeService.createPaymentIntent(paymentData);

      return {
        success: true,
        paymentIntentId: intent.id,
        clientSecret: intent.client_secret,
        redirectUrl: intent.next_action?.redirect_to_url?.url
      };

    } catch (error) {
      console.error('Error creating payment session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear sesión de pago'
      };
    }
  }

  /**
   * Confirmar pago y procesar transacción
   */
  async confirmPayment(paymentIntentId: string, userId: string): Promise<PaymentConfirmation> {
    try {
      // Confirmar pago con Stripe
      const confirmation = await stripeService.confirmPayment({ paymentIntentId });
      
      if (!confirmation.success) {
        return {
          success: false,
          error: 'Pago no confirmado'
        };
      }

      // Extraer datos de la transacción
      const metadata = confirmation.paymentIntent?.metadata;
      if (!metadata) {
        return {
          success: false,
          error: 'Metadatos de transacción no encontrados'
        };
      }

      const usdtAmount = parseFloat(metadata.usdtAmount);
      const dollarAmount = parseFloat(metadata.dollarAmount || '0');
      const network = metadata.network;

      // Generar hash de transacción
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;

      // Procesar en el wallet
      const result = await userWalletService.processBuyTransaction(
        parseInt(userId),
        dollarAmount,
        usdtAmount,
        txHash
      );

      if (!result.success) {
        return {
          success: false,
          error: 'Error procesando transacción en wallet'
        };
      }

      return {
        success: true,
        transactionHash: txHash,
        wallet: result.wallet
      };

    } catch (error) {
      console.error('Error confirming payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al confirmar pago'
      };
    }
  }

  /**
   * Simular proceso de pago (para desarrollo)
   */
  async simulatePayment(request: PaymentRequest): Promise<PaymentConfirmation> {
    try {
      // Simular delay de procesamiento
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Calcular comisiones
      const fees = this.calculateFees(request.amount, request.network);

      // Generar hash de transacción simulado
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;

      // Procesar en el wallet
      const result = await userWalletService.processBuyTransaction(
        parseInt(request.userId),
        fees.total,
        request.usdtAmount,
        txHash
      );

      if (!result.success) {
        return {
          success: false,
          error: 'Error procesando transacción'
        };
      }

      return {
        success: true,
        transactionHash: txHash,
        wallet: result.wallet
      };

    } catch (error) {
      console.error('Error simulating payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error en simulación'
      };
    }
  }

  /**
   * Obtener información de redes disponibles
   */
  getNetworkInfo() {
    return [
      {
        id: 'bsc',
        name: 'BNB Smart Chain',
        icon: '🟡',
        fee: 0,
        minAmount: 10,
        maxAmount: 10000,
        processingTime: '2-5 minutos',
        description: 'Red más económica, sin comisiones'
      },
      {
        id: 'eth',
        name: 'Ethereum',
        icon: '🔵',
        fee: 1.5,
        minAmount: 50,
        maxAmount: 50000,
        processingTime: '5-15 minutos',
        description: 'Red más segura, comisión estándar'
      },
      {
        id: 'polygon',
        name: 'Polygon',
        icon: '🟣',
        fee: 0.5,
        minAmount: 20,
        maxAmount: 25000,
        processingTime: '1-3 minutos',
        description: 'Red rápida, comisión baja'
      }
    ];
  }

  /**
   * Obtener precio estimado de USDT
   */
  async getEstimatedUSDTPrice(): Promise<number> {
    // USDT es una stablecoin, siempre vale $1.00
    return 1.00;
  }
}

export const stripePaymentService = new StripePaymentService(); 