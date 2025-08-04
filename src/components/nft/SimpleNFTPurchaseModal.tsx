import React, { useState, useEffect } from 'react';
import { FaTimes, FaEthereum, FaShieldAlt, FaCheckCircle, FaExclamationTriangle, FaSpinner, FaInfoCircle, FaStar, FaGift } from 'react-icons/fa';
import { nftMarketplaceService } from '@/services/nftMarketplaceService';
import { useAuthStore } from '@/stores/authStore';
import type { UserNFT } from '@/types/nft';

interface SimpleNFTPurchaseModalProps {
  nft: UserNFT | null;
  isOpen: boolean;
  onClose: () => void;
  onPurchaseSuccess: (nft: UserNFT) => void;
}

interface PurchaseStep {
  id: 'verification' | 'processing' | 'success';
  title: string;
  description: string;
  status: 'pending' | 'current' | 'completed' | 'error';
}

export const SimpleNFTPurchaseModal: React.FC<SimpleNFTPurchaseModalProps> = ({
  nft,
  isOpen,
  onClose,
  onPurchaseSuccess
}) => {
  const [currentStep, setCurrentStep] = useState<PurchaseStep['id']>('verification');
  const [steps, setSteps] = useState<PurchaseStep[]>([
    { id: 'verification', title: 'Verificar Usuario', description: 'Comprobando tu cuenta', status: 'pending' },
    { id: 'processing', title: 'Procesar Compra', description: 'Agregando NFT a tu colección', status: 'pending' },
    { id: 'success', title: 'Compra Exitosa', description: 'NFT agregado a tu colección', status: 'pending' }
  ]);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    if (isOpen && nft) {
      initializePurchase();
    }
  }, [isOpen, nft]);

  const initializePurchase = async () => {
    if (!user) {
      setError('Usuario no autenticado');
      return;
    }

    setCurrentStep('verification');
    setError('');
    setIsProcessing(true);

    try {
      // Simular verificación de usuario
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateStepStatus('verification', 'completed');
      setCurrentStep('processing');
      
      // Procesar compra
      await processPurchase();
      
    } catch (error) {
      console.error('Error in purchase process:', error);
      setError('Error en el proceso de compra');
    } finally {
      setIsProcessing(false);
    }
  };

  const updateStepStatus = (stepId: PurchaseStep['id'], status: PurchaseStep['status']) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
  };

  const processPurchase = async () => {
    if (!nft || !user) return;

    try {
      const purchaseResult = await nftMarketplaceService.buyNFT({
        nftDocumentId: nft.documentId,
        buyerUserId: parseInt(user.id)
      });

      if (!purchaseResult.success) {
        setError(purchaseResult.error || 'Error en la compra');
        updateStepStatus('processing', 'error');
        return;
      }

      updateStepStatus('processing', 'completed');
      setCurrentStep('success');
      
      console.log('✅ Compra exitosa:', purchaseResult.data);
      
      // Simular delay para mostrar éxito
      setTimeout(() => {
        onPurchaseSuccess(nft);
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error processing purchase:', error);
      setError('Error al procesar la compra');
      updateStepStatus('processing', 'error');
    }
  };

  const getStepIcon = (step: PurchaseStep) => {
    switch (step.status) {
      case 'completed':
        return <FaCheckCircle className="text-green-400 text-xl" />;
      case 'error':
        return <FaExclamationTriangle className="text-red-400 text-xl" />;
      case 'current':
        return <FaSpinner className="text-blue-400 text-xl animate-spin" />;
      default:
        return <div className="w-6 h-6 bg-gray-600 rounded-full border-2 border-gray-500" />;
    }
  };

  const getStepClass = (step: PurchaseStep) => {
    switch (step.status) {
      case 'completed':
        return 'border-green-500 bg-green-900/20 shadow-green-500/20';
      case 'error':
        return 'border-red-500 bg-red-900/20 shadow-red-500/20';
      case 'current':
        return 'border-blue-500 bg-blue-900/20 shadow-blue-500/20';
      default:
        return 'border-gray-600 bg-gray-800/20';
    }
  };

  if (!isOpen || !nft) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700 rounded-t-xl">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FaGift className="mr-3 text-purple-400" />
            Obtener NFT
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* NFT Info */}
        <div className="p-6 border-b border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* NFT Icon */}
            <div className="text-center">
              <div className="inline-block p-4 bg-gradient-to-br from-gray-800 to-gray-700 rounded-full mb-4 shadow-lg">
                <FaEthereum className="text-4xl text-blue-400" />
              </div>
            </div>
            
            {/* NFT Details */}
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold text-white mb-2">{nft.metadata.name}</h3>
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">{nft.metadata.description}</p>
              <div className="flex items-center space-x-4">
                <span className="text-2xl font-bold text-green-400">
                  {nft.listing_price_eth} ETH
                </span>
                <span className="text-gray-400">
                  ≈ ${(nft.listing_price_eth * 2000).toFixed(2)} USD
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Steps */}
        <div className="p-6">
          <div className="space-y-4 mb-6">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-all duration-300 ${getStepClass(step)}`}
              >
                <div className="flex-shrink-0">
                  {getStepIcon(step)}
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold">{step.title}</h4>
                  <p className="text-gray-400 text-sm">{step.description}</p>
                </div>
                {step.status === 'current' && (
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Demo Mode Notice */}
          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-6 rounded-lg border border-purple-500/50 shadow-lg mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <FaInfoCircle className="text-purple-400 text-xl" />
              <h4 className="text-purple-200 font-semibold">Modo Demostración</h4>
            </div>
            <p className="text-purple-300 text-sm">
              Este es un modo de demostración. El NFT se agregará directamente a tu colección sin verificación de balance.
              Próximamente se implementará el sistema completo con Stripe y verificación de fondos.
            </p>
          </div>

          {/* Balance Info (Demo) */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-lg border border-gray-600 shadow-lg mb-6">
            <h4 className="text-white font-semibold mb-4 flex items-center">
              <FaInfoCircle className="mr-2 text-blue-400" />
              Información de Balance (Demo)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-700/50 p-3 rounded-lg">
                <span className="text-gray-400 text-sm block">Balance actual:</span>
                <div className="text-white font-bold">∞ USDT</div>
              </div>
              <div className="bg-gray-700/50 p-3 rounded-lg">
                <span className="text-gray-400 text-sm block">Precio del NFT:</span>
                <div className="text-white font-bold">{nft.listing_price_eth} ETH</div>
              </div>
              <div className="bg-gray-700/50 p-3 rounded-lg">
                <span className="text-gray-400 text-sm block">Balance después:</span>
                <div className="text-white font-bold">∞ USDT</div>
              </div>
              <div className="bg-gray-700/50 p-3 rounded-lg">
                <span className="text-gray-400 text-sm block">Estado:</span>
                <div className="text-green-400 font-bold">Suficiente</div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 p-4 rounded-lg border border-red-500/50 shadow-lg">
              <div className="flex items-center space-x-3">
                <FaExclamationTriangle className="text-red-400 text-xl flex-shrink-0" />
                <span className="text-red-400 font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {currentStep === 'success' && (
            <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 p-6 rounded-lg border border-green-500/50 shadow-lg text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <FaCheckCircle className="text-green-400 text-3xl" />
                <span className="text-green-400 text-xl font-bold">¡NFT Agregado!</span>
              </div>
              <p className="text-green-300">
                El NFT ha sido agregado a tu colección y está listo para usar.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700 rounded-b-xl">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 disabled:from-gray-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 font-medium shadow-lg"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 