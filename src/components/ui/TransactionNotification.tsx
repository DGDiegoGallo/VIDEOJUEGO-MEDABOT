import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaTimes, FaDollarSign, FaArrowUp } from 'react-icons/fa';

interface TransactionNotificationProps {
  isVisible: boolean;
  onClose: () => void;
  amount: number;
  network: string;
  transactionHash: string;
}

export const TransactionNotification: React.FC<TransactionNotificationProps> = ({
  isVisible,
  onClose,
  amount,
  network,
  transactionHash
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
      <div className="bg-green-900/90 backdrop-blur-md border border-green-500/50 rounded-lg p-4 shadow-2xl max-w-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
              <FaCheckCircle className="text-green-400 text-lg" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white font-semibold text-sm">
                Transacción Exitosa
              </h4>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <FaDollarSign className="text-green-400" />
                <span className="text-white">
                  +{amount} USDT acreditados
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <FaArrowUp className="text-blue-400" />
                <span className="text-gray-300">
                  Red: {network}
                </span>
              </div>
              
              <div className="text-gray-400 text-xs font-mono">
                {transactionHash.slice(0, 8)}...{transactionHash.slice(-8)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 w-full bg-gray-700 rounded-full h-1">
          <div 
            className="bg-green-500 h-1 rounded-full transition-all duration-5000 ease-linear"
            style={{ width: isAnimating ? '0%' : '100%' }}
          />
        </div>
      </div>
    </div>
  );
}; 