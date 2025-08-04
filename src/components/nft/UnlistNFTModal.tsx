import React, { useState } from 'react';
import { FaTimes, FaExclamationTriangle, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { useNFTActions } from '@/hooks/useNFTs';
import type { UserNFT } from '@/types/nft';

interface UnlistNFTModalProps {
  nft: UserNFT | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UnlistNFTModal: React.FC<UnlistNFTModalProps> = ({
  nft,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { unlist, clearError } = useNFTActions();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!nft) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Confirmando unlist para NFT:', nft.metadata?.name, 'Document ID:', nft.documentId);
      await unlist(nft.documentId);
      onSuccess();
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al quitar el NFT de la lista');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      clearError();
      onClose();
    }
  };

  if (!isOpen || !nft) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center">
            <FaExclamationTriangle className="mr-2 text-orange-400" />
            Quitar NFT de la Lista
          </h3>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* NFT Info */}
        <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-600">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {nft.metadata?.icon_name ? '🏆' : '🎨'}
              </span>
            </div>
            <div className="flex-1">
              <h4 className="text-white font-semibold">{nft.metadata?.name}</h4>
              <p className="text-gray-400 text-sm">{nft.metadata?.rarity}</p>
              <p className="text-orange-400 text-sm font-medium">
                Precio: {nft.listing_price_eth} ETH
              </p>
            </div>
          </div>
        </div>

        {/* Warning Message */}
        <div className="mb-6 p-4 bg-orange-900/20 border border-orange-700/30 rounded-lg">
          <div className="flex items-start space-x-2">
            <FaExclamationTriangle className="text-orange-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-orange-300">
              <p className="font-medium mb-2">¿Estás seguro de que quieres quitar este NFT de la lista?</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>El NFT será removido del marketplace</li>
                <li>Volverá a tu colección personal</li>
                <li>Ya no estará disponible para compra</li>
                <li>Podrás volver a listarlo más tarde</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 bg-red-900/20 border border-red-700/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <FaSpinner className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Quitando...
              </div>
            ) : (
              'Quitar de la Lista'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}; 