import React, { useState, useEffect } from 'react';
import { FaDollarSign, FaCreditCard, FaShieldAlt, FaCheckCircle, FaTimes, FaSpinner, FaInfoCircle } from 'react-icons/fa';
import { SiStripe } from 'react-icons/si';
import { stripePaymentService, PaymentRequest } from '@/services/stripePaymentService';
import { stripeService } from '@/services/stripe.service';
import { userWalletService } from '@/services/userWallet.service';
import { useAuthStore } from '@/stores/authStore';

interface BuyUSDTModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

interface NetworkOption {
  id: string;
  name: string;
  icon: string;
  fee: number;
  minAmount: number;
  maxAmount: number;
  processingTime: string;
  description: string;
}

const NETWORKS = stripePaymentService.getNetworkInfo();

export const BuyUSDTModal: React.FC<BuyUSDTModalProps> = ({ isOpen, onClose, onSuccess }) => {
  // Función de cierre que maneja la cancelación
  const handleClose = () => {
    if (paymentStarted && canCancel) {
      handleCancelPayment();
    }
    onClose();
  };
  const { user } = useAuthStore();
  const [step, setStep] = useState<'amount' | 'payment' | 'processing' | 'success' | 'error'>('amount');
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkOption>(NETWORKS[0]);
  const [amount, setAmount] = useState(NETWORKS[0].minAmount); // Usar el valor mínimo como inicial
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [usdtPrice] = useState(1.00); // Precio fijo de USDT
  const [processingStep, setProcessingStep] = useState(0);
  const [paymentIntent, setPaymentIntent] = useState<any>(null);
  const [stripeWindowRef, setStripeWindowRef] = useState<Window | null>(null);
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [canCancel, setCanCancel] = useState(true);
  const [checkWindowClosedInterval, setCheckWindowClosedInterval] = useState<NodeJS.Timeout | null>(null);
  const [paymentTimeout, setPaymentTimeout] = useState<NodeJS.Timeout | null>(null);

  // Cleanup cuando el modal se cierra
  useEffect(() => {
    if (!isOpen) {
      // Limpiar intervalos y timeouts si el modal se cierra
      if (checkWindowClosedInterval) {
        clearInterval(checkWindowClosedInterval);
        setCheckWindowClosedInterval(null);
      }
      if (paymentTimeout) {
        clearTimeout(paymentTimeout);
        setPaymentTimeout(null);
      }
      
      // Resetear estados
      setStep('amount');
      setProcessingStep(0);
      setPaymentStarted(false);
      setCanCancel(true);
      setStripeWindowRef(null);
      setPaymentIntent(null);
      setError('');
    }
  }, [isOpen, checkWindowClosedInterval, paymentTimeout]);

  // Actualizar monto cuando cambie la red seleccionada
  useEffect(() => {
    // Solo ajustar si el monto actual está fuera de los límites de la nueva red
    if (amount < selectedNetwork.minAmount) {
      setAmount(selectedNetwork.minAmount);
    } else if (amount > selectedNetwork.maxAmount) {
      setAmount(selectedNetwork.maxAmount);
    }
  }, [selectedNetwork]); // Remover 'amount' de las dependencias para evitar bucle infinito

  const handleAmountChange = (value: number) => {
    // Permitir escribir cualquier número, sin restricciones en tiempo real
    setAmount(value);
  };

  const handleCancelPayment = () => {
    console.log('Cancelando pago...');
    
    // Cerrar ventana de Stripe si está abierta
    if (stripeWindowRef && !stripeWindowRef.closed) {
      console.log('Cerrando ventana de Stripe...');
      stripeWindowRef.close();
    }
    
    // Limpiar intervalos y timeouts
    if (checkWindowClosedInterval) {
      clearInterval(checkWindowClosedInterval);
      setCheckWindowClosedInterval(null);
    }
    if (paymentTimeout) {
      clearTimeout(paymentTimeout);
      setPaymentTimeout(null);
    }
    
    // Resetear estados
    setStep('amount');
    setProcessingStep(0);
    setPaymentStarted(false);
    setCanCancel(true);
    setStripeWindowRef(null);
    setPaymentIntent(null);
    setError('');
    
    console.log('Pago cancelado exitosamente');
  };

  const calculateTotal = () => {
    const networkFee = selectedNetwork.fee;
    const stripeFee = amount * 0.029 + 0.30;
    return amount + networkFee + stripeFee;
  };

  // Validar si el monto es válido
  const isAmountValid = () => {
    return amount >= selectedNetwork.minAmount && amount <= selectedNetwork.maxAmount;
  };

  // Obtener mensaje de error si el monto no es válido
  const getAmountError = () => {
    if (amount < selectedNetwork.minAmount) {
      return `El monto mínimo es $${selectedNetwork.minAmount}`;
    }
    if (amount > selectedNetwork.maxAmount) {
      return `El monto máximo es $${selectedNetwork.maxAmount}`;
    }
    return null;
  };

  const handleBuyUSDT = async () => {
    if (!user) {
      setError('Usuario no autenticado');
      return;
    }

    // Validar que el monto esté dentro de los límites
    if (!isAmountValid()) {
      setError(getAmountError() || 'Monto inválido');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const paymentRequest: PaymentRequest = {
        amount: amount,
        network: selectedNetwork.id,
        usdtAmount: amount,
        usdtPrice: usdtPrice,
        userId: user.id
      };

      // Crear sesión de Checkout de Stripe
      // Enviar amount directamente (no multiplicar por 100) porque el backend ya lo convierte
      const checkoutData = {
        amount: amount, // Enviar el monto en USD directamente
        currency: 'usd',
        metadata: {
          userId: user.id.toString(),
          usdtAmount: amount.toString(),
          network: selectedNetwork.id,
          usdtPrice: usdtPrice.toString()
        }
      };

      console.log('Cantidad en USDT:', amount);
      console.log('Cantidad en USD enviada al backend:', amount);
      console.log('Cantidad esperada en Stripe:', amount);
      console.log('Enviando datos a Stripe:', checkoutData);

      const response = await stripeService.createCheckoutSession(checkoutData);
      
      console.log('Respuesta de Stripe:', response);
      
      if (!response.success || !response.data?.url) {
        setError('Error al crear sesión de pago');
        setStep('error');
        return;
      }

      // Abrir ventana de Stripe
      const stripeWindow = window.open(response.data.url, 'stripe-checkout', 'width=500,height=600,scrollbars=yes,resizable=yes');
      
      if (!stripeWindow) {
        setError('No se pudo abrir la ventana de pago. Verifica que no esté bloqueado el popup.');
        setStep('error');
        return;
      }

      // Guardar referencia de la ventana
      setStripeWindowRef(stripeWindow);

      // Cambiar a paso de procesamiento
      setStep('processing');
      setPaymentStarted(true);
      setCanCancel(true); // Aún se puede cancelar hasta que se detecte el cierre
      setPaymentIntent({ success: true, checkoutUrl: response.data.url });

      // Verificar si la ventana se cerró (pago completado)
      console.log('Ventana de Stripe abierta, monitoreando cierre...');
      
      // Método 1: setInterval para verificar cierre
      const checkWindowClosed = setInterval(() => {
        console.log('Verificando si la ventana está cerrada...', stripeWindow.closed);
        
        if (stripeWindow.closed) {
          console.log('¡Ventana de Stripe cerrada! Procesando transacción...');
          clearInterval(checkWindowClosed);
          setCheckWindowClosedInterval(null);
          
          // Marcar que ya no se puede cancelar
          setCanCancel(false);
          
          // Simular procesamiento de transacción
          setTimeout(() => {
            processSuccessfulPayment(paymentRequest);
          }, 2000);
        }
      }, 1000);
      
      setCheckWindowClosedInterval(checkWindowClosed);

      // Método 2: Intentar agregar event listener a la ventana (puede no funcionar por CORS)
      try {
        stripeWindow.onbeforeunload = () => {
          console.log('Evento onbeforeunload detectado en ventana de Stripe');
          clearInterval(checkWindowClosed);
          setCheckWindowClosedInterval(null);
          setCanCancel(false);
          setTimeout(() => {
            processSuccessfulPayment(paymentRequest);
          }, 2000);
        };
      } catch (error) {
        console.log('No se pudo agregar event listener a la ventana de Stripe (CORS)');
      }

      // Timeout de seguridad (5 minutos)
      const timeout = setTimeout(() => {
        console.log('Timeout de seguridad alcanzado');
        clearInterval(checkWindowClosed);
        setCheckWindowClosedInterval(null);
        if (!stripeWindow.closed) {
          console.log('Cerrando ventana por timeout');
          stripeWindow.close();
          setError('Tiempo de espera agotado');
          setStep('error');
        }
      }, 300000);
      
      setPaymentTimeout(timeout);

    } catch (err) {
      console.error('Error en handleBuyUSDT:', err);
      setError('Error al procesar el pago');
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const processSuccessfulPayment = async (paymentRequest: PaymentRequest) => {
    try {
      // Marcar que ya no se puede cancelar
      setCanCancel(false);
      
      // Paso 1: Verificando transacción
      setProcessingStep(1);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Paso 2: Procesando en blockchain
      setProcessingStep(2);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generar hash de transacción
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      // Paso 3: Actualizando balance
      setProcessingStep(3);
      
      // Procesar en el wallet
      const result = await userWalletService.processBuyTransaction(
        parseInt(paymentRequest.userId),
        paymentRequest.amount,
        paymentRequest.usdtAmount,
        txHash
      );

      if (result.success) {
        setProcessingStep(4);
        await new Promise(resolve => setTimeout(resolve, 1000));
        onSuccess(paymentRequest.usdtAmount);
        setStep('success');
      } else {
        throw new Error('Error procesando transacción en wallet');
      }
    } catch (err) {
      console.error('Error en processSuccessfulPayment:', err);
      setError('Error al procesar la transacción');
      setStep('error');
    }
  };

  const simulatePaymentProcess = async (paymentRequest: PaymentRequest) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 6000));
      const result = await stripePaymentService.simulatePayment(paymentRequest);

      if (result.success) {
        onSuccess(paymentRequest.usdtAmount);
        setStep('success');
      } else {
        throw new Error(result.error || 'Error procesando transacción');
      }
    } catch (err) {
      setError('Error al procesar la transacción');
      setStep('error');
    }
  };

  const processingSteps = [
    'Esperando pago en Stripe...',
    'Verificando transacción...',
    'Procesando en blockchain...',
    'Actualizando balance...'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl border border-gray-700 overflow-hidden modal-content">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaDollarSign className="text-2xl" />
              <div>
                <h2 className="text-xl font-bold">Comprar USDT</h2>
                <p className="text-blue-100 text-sm">Precio: $1.00 = 1 USDT</p>
              </div>
            </div>
            <button
              onClick={canCancel ? handleClose : undefined}
              className={`transition-colors ${
                canCancel 
                  ? 'text-white/80 hover:text-white cursor-pointer' 
                  : 'text-white/40 cursor-not-allowed'
              }`}
              disabled={!canCancel}
              title={canCancel ? 'Cerrar' : 'No se puede cerrar durante el procesamiento'}
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'amount' && (
            <div className="space-y-6">
              {/* Amount Input */}
              <div>
                <label className="block text-white font-semibold mb-3">
                  Cantidad de USDT
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => handleAmountChange(Number(e.target.value))}
                    className={`w-full bg-gray-800 border rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:border-blue-500 ${
                      !isAmountValid() ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder={selectedNetwork.minAmount.toString()}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    USDT
                  </div>
                </div>
                <div className="flex justify-between text-sm text-gray-400 mt-2">
                  <span>Mín: ${selectedNetwork.minAmount}</span>
                  <span>Máx: ${selectedNetwork.maxAmount}</span>
                </div>
                {getAmountError() && (
                  <div className="mt-2 text-red-400 text-sm flex items-center">
                    <FaInfoCircle className="mr-1" />
                    {getAmountError()}
                  </div>
                )}
              </div>

              {/* Network Selection */}
              <div>
                <label className="block text-white font-semibold mb-3">
                  Red de Blockchain
                </label>
                <div className="space-y-2">
                  {NETWORKS.map((network) => (
                    <button
                      key={network.id}
                      onClick={() => setSelectedNetwork(network)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        selectedNetwork.id === network.id
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-semibold">{network.name}</div>
                          <div className="text-gray-400 text-sm">{network.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-semibold">
                            {network.fee > 0 ? `$${network.fee}` : 'Gratis'}
                          </div>
                          <div className="text-gray-400 text-sm">{network.processingTime}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-gray-800 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Cantidad USDT:</span>
                  <span className="text-white">{amount} USDT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Comisión de red:</span>
                  <span className="text-white">{selectedNetwork.fee > 0 ? `$${selectedNetwork.fee}` : 'Gratis'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Comisión Stripe:</span>
                  <span className="text-white">${((amount * 0.029 + 0.30)).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-600 pt-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-white">Total a pagar:</span>
                    <span className="text-green-400">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Buy Button */}
              <button
                onClick={handleBuyUSDT}
                disabled={isLoading || !isAmountValid()}
                className="w-full btn-gradient text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <FaCreditCard />
                    <span>Comprar USDT - ${calculateTotal().toFixed(2)}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {step === 'payment' && (
            <div className="text-center space-y-6">
              <div className="animate-pulse">
                <SiStripe className="text-6xl mx-auto text-blue-500 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Procesando Pago</h3>
                <p className="text-gray-400">Completando tu pago de forma segura...</p>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <FaSpinner className="animate-spin text-blue-500" />
                <span className="text-gray-400">Procesando pago...</span>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaSpinner className="text-blue-500 text-2xl animate-spin" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Ventana de Pago Abierta</h3>
                <p className="text-gray-400 mb-4">
                  Se ha abierto una ventana de Stripe para completar tu pago.
                  <br />
                  <span className="text-blue-400 font-semibold">Cierra la ventana cuando hayas terminado.</span>
                </p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <SiStripe className="text-blue-500 text-xl" />
                  <span className="text-white font-semibold">Instrucciones:</span>
                </div>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li>• Completa el pago en la ventana de Stripe</li>
                  <li>• Puedes usar tarjeta de crédito/débito</li>
                  <li>• El pago es seguro y encriptado</li>
                  <li>• Cierra la ventana cuando termines</li>
                </ul>
              </div>

              {/* Botones de acción */}
              <div className="flex space-x-3">
                {canCancel && (
                  <button
                    onClick={handleCancelPayment}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                  >
                    Cancelar Pago
                  </button>
                )}
                
                {!canCancel && (
                  <div className="flex-1 bg-gray-600 text-white font-bold py-3 px-4 rounded-lg text-center">
                    Procesando...
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {processingSteps.map((stepText, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                      index <= processingStep
                        ? 'bg-green-500/10 border border-green-500/30'
                        : 'bg-gray-800 border border-gray-600'
                    }`}
                  >
                    {index <= processingStep ? (
                      <FaCheckCircle className="text-green-500" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-gray-500 rounded-full" />
                    )}
                    <span className={index <= processingStep ? 'text-white' : 'text-gray-400'}>
                      {stepText}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <FaCheckCircle className="text-green-500 text-3xl" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">¡Compra Exitosa!</h3>
                <p className="text-gray-400 mb-4">
                  Se han acreditado <span className="text-green-400 font-bold">{amount} USDT</span> a tu wallet
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Continuar
              </button>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <FaTimes className="text-red-500 text-3xl" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Error en la Transacción</h3>
                <p className="text-gray-400 mb-4">{error}</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setStep('amount')}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Intentar de Nuevo
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 