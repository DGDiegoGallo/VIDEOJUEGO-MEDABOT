import axios from 'axios';
import { API_CONFIG } from '../config/api';

const BASE_URL = `${API_CONFIG.STRAPI_URL}/api`;

interface CreatePaymentIntentData {
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
}

interface CreateCheckoutSessionData {
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
}

interface ConfirmPaymentData {
  paymentIntentId: string;
}

export const stripeService = {
  /**
   * Crear un Payment Intent
   */
  async createPaymentIntent(data: CreatePaymentIntentData) {
    try {
      const response = await axios.post(`${BASE_URL}/stripe/create-payment-intent`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  /**
   * Crear una sesión de Checkout
   */
  async createCheckoutSession(data: CreateCheckoutSessionData) {
    try {
      console.log('Llamando a Stripe API:', `${BASE_URL}/stripe/create-checkout-session`);
      console.log('Datos enviados:', data);
      
      const response = await axios.post(`${BASE_URL}/stripe/create-checkout-session`, data);
      console.log('Respuesta de Stripe API:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },

  /**
   * Confirmar un pago
   */
  async confirmPayment(data: ConfirmPaymentData) {
    try {
      const response = await axios.post(`${BASE_URL}/stripe/confirm-payment`, data);
      return response.data;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  },
}; 