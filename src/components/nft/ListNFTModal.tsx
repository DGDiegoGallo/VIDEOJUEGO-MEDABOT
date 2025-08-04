import React, { useState } from 'react';
import { FaTimes, FaEthereum, FaDollarSign, FaInfoCircle } from 'react-icons/fa';
import { useNFTActions } from '@/hooks/useNFTs';
import type { UserNFT } from '@/types/nft';

interface ListNFTModalProps {
  nft: UserNFT | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ListNFTModal: React.FC<ListNFTModalProps> = ({
  nft,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { listForSale, clearError } = useNFTActions();
  const [priceEth, setPriceEth] = useState('');
  const [priceUsdt, setPriceUsdt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Conversión aproximada ETH a USDT (1 ETH = ~2000 USDT)
  const ETH_TO_USDT_RATE = 2000;

  const handlePriceEthChange = (value: string) => {
    setPriceEth(value);
    const ethValue = parseFloat(value) || 0;
    setPriceUsdt((ethValue * ETH_TO_USDT_RATE).toFixed(2));
  };

  const handlePriceUsdtChange = (value: string) => {
    setPriceUsdt(value);
    const usdtValue = parseFloat(value) || 0;
    setPriceEth((usdtValue / ETH_TO_USDT_RATE).toFixed(6));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nft) return;

    const ethPrice = parseFloat(priceEth);
    if (isNaN(ethPrice) || ethPrice <= 0) {
      setError('Por favor ingresa un precio válido en ETH');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await listForSale(nft.documentId, ethPrice);
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al listar el NFT');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setPriceEth('');
    setPriceUsdt('');
    setError(null);
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
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
            <FaEthereum className="mr-2 text-blue-400" />
            Listar NFT para Venta
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
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {nft.metadata?.icon_name ? '🏆' : '🎨'}
              </span>
            </div>
            <div className="flex-1">
              <h4 className="text-white font-semibold">{nft.metadata?.name}</h4>
              <p className="text-gray-400 text-sm">{nft.metadata?.rarity}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Price in ETH */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Precio en ETH
            </label>
            <div className="relative">
              <FaEthereum className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" />
              <input
                type="number"
                step="0.001"
                min="0"
                value={priceEth}
                onChange={(e) => handlePriceEthChange(e.target.value)}
                placeholder="0.001"
                className="w-full pl-10 pr-4 py-3 bg-gray-800/80 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Price in USDT */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Precio en USDT
            </label>
            <div className="relative">
              <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400" />
              <input
                type="number"
                step="0.01"
                min="0"
                value={priceUsdt}
                onChange={(e) => handlePriceUsdtChange(e.target.value)}
                placeholder="2.00"
                className="w-full pl-10 pr-4 py-3 bg-gray-800/80 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex items-start space-x-2 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
            <FaInfoCircle className="text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-300">
              <p>Al listar este NFT, será removido de tu colección y aparecerá en el marketplace.</p>
              <p className="mt-1">Otros usuarios podrán comprarlo al precio especificado.</p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-900/20 border border-red-700/30 rounded-lg">
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
              type="submit"
              disabled={isLoading || !priceEth || parseFloat(priceEth) <= 0}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Listando...
                </div>
              ) : (
                'Listar NFT'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 