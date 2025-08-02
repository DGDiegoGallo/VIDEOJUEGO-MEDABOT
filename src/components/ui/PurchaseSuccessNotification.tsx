import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaEthereum, FaTimes } from 'react-icons/fa';
import type { UserNFT } from '@/types/nft';

interface PurchaseSuccessNotificationProps {
  nft: UserNFT;
  isVisible: boolean;
  onClose: () => void;
}

export const PurchaseSuccessNotification: React.FC<PurchaseSuccessNotificationProps> = ({
  nft,
  isVisible,
  onClose
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto-close after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="bg-green-900/90 backdrop-blur-sm border border-green-500/50 rounded-lg p-4 shadow-2xl max-w-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <FaCheckCircle className="text-green-400 text-2xl" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-semibold text-sm">
              ¡Compra Exitosa!
            </h4>
            <p className="text-green-300 text-xs mt-1">
              {nft.metadata.name}
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <FaEthereum className="text-blue-400 text-xs" />
              <span className="text-green-300 text-xs font-medium">
                {nft.listing_price_eth} ETH
              </span>
            </div>
            <p className="text-green-400 text-xs mt-2">
              El NFT ha sido agregado a tu colección
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="flex-shrink-0 text-green-400 hover:text-white transition-colors"
          >
            <FaTimes size={16} />
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 bg-green-800/50 rounded-full h-1">
          <div 
            className="bg-green-400 h-1 rounded-full transition-all duration-5000 ease-linear"
            style={{ width: isAnimating ? '0%' : '100%' }}
          />
        </div>
      </div>
    </div>
  );
}; 