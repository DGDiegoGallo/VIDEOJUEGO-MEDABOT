import React from 'react';
import { motion } from 'framer-motion';
import { NFTCard } from './NFTCard';
import type { UserNFT } from '@/types/nft';

interface NFTGridProps {
  nfts: UserNFT[];
  isLoading?: boolean;
  showPrice?: boolean;
  showActions?: boolean;
  onSelect?: (nft: UserNFT) => void;
  onList?: (nft: UserNFT, price?: number) => void;
  onUnlist?: (nft: UserNFT) => void;
  onBuy?: (nft: UserNFT) => void;
  emptyMessage?: string;
  className?: string;
}

export const NFTGrid: React.FC<NFTGridProps> = ({
  nfts,
  isLoading = false,
  showPrice = false,
  showActions = false,
  onSelect,
  onList,
  onUnlist,
  onBuy,
  emptyMessage = 'No se encontraron NFTs',
  className = ''
}) => {
  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ${className}`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-gray-800 rounded-lg border-2 border-gray-600 animate-pulse">
            <div className="p-4">
              <div className="flex justify-center mb-3">
                <div className="w-16 h-16 bg-gray-700 rounded-full"></div>
              </div>
              <div className="h-6 bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-700 rounded mb-3"></div>
              <div className="h-12 bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!nfts || nfts.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <div className="text-gray-400 text-6xl mb-4">🎨</div>
        <h3 className="text-white text-xl font-semibold mb-2">Sin NFTs</h3>
        <p className="text-gray-400 text-center">{emptyMessage}</p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <motion.div 
      className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {nfts.map((nft, index) => (
        <motion.div
          key={nft.documentId}
          variants={itemVariants}
          custom={index}
        >
          <NFTCard
            nft={nft}
            showPrice={showPrice}
            showActions={showActions}
            onSelect={onSelect}
            onList={onList}
            onUnlist={onUnlist}
            onBuy={onBuy}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};