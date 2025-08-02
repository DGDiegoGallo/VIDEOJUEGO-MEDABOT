import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'react-icons/fa';
import { translateRarity, translateAchievementType, getRarityColor, getRarityBgColor } from '@/utils/translations';
import type { UserNFT } from '@/types/nft';

interface NFTCardProps {
  nft: UserNFT;
  showPrice?: boolean;
  showActions?: boolean;
  onSelect?: (nft: UserNFT) => void;
  onList?: (nft: UserNFT, price?: number) => void;
  onUnlist?: (nft: UserNFT) => void;
  onBuy?: (nft: UserNFT) => void;
  className?: string;
}

const getReactIcon = (iconName: string) => {
  const IconComponent = (Icons as any)[iconName];
  return IconComponent || Icons.FaQuestion;
};

const getRarityGlow = (rarity: string) => {
  const glows = {
    common: '0 0 20px rgba(156, 163, 175, 0.4)',
    rare: '0 0 25px rgba(59, 130, 246, 0.6)',
    epic: '0 0 30px rgba(147, 51, 234, 0.7)',
    legendary: '0 0 35px rgba(251, 191, 36, 0.8)'
  };
  return glows[rarity as keyof typeof glows] || glows.common;
};

const getRarityHoverGlow = (rarity: string) => {
  const glows = {
    common: '0 0 30px rgba(156, 163, 175, 0.6)',
    rare: '0 0 40px rgba(59, 130, 246, 0.8)',
    epic: '0 0 50px rgba(147, 51, 234, 0.9)',
    legendary: '0 0 60px rgba(251, 191, 36, 1.0)'
  };
  return glows[rarity as keyof typeof glows] || glows.common;
};

export const NFTCard: React.FC<NFTCardProps> = ({
  nft,
  showPrice = false,
  showActions = false,
  onSelect,
  onList,
  onUnlist,
  onBuy,
  className = ''
}) => {
  const IconComponent = getReactIcon(nft.metadata.icon_name);
  const rarityColor = getRarityColor(nft.metadata.rarity);
  const rarityBgColor = getRarityBgColor(nft.metadata.rarity);
  const translatedRarity = translateRarity(nft.metadata.rarity, 'es');
  const translatedAchievementType = translateAchievementType(nft.metadata.achievement_type || '', 'es');

  const handleCardClick = () => {
    onSelect?.(nft);
  };

  const handleListClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // This will be handled by the parent component through a modal
    onList?.(nft);
  };

  const handleUnlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUnlist?.(nft);
  };

  const handleBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBuy?.(nft);
  };

  return (
    <motion.div 
      className={`
        relative bg-gray-800/90 backdrop-blur-sm rounded-lg border-2 border-gray-600
        cursor-pointer overflow-hidden ${className}
        hover:border-gray-500 transition-all duration-300
      `}
      onClick={handleCardClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.05,
        boxShadow: getRarityHoverGlow(nft.metadata.rarity),
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {/* Animated Rarity Background Glow */}
      <motion.div 
        className={`absolute inset-0 ${rarityBgColor.split(' ')[0]} opacity-10`}
        animate={{
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Pulsing Border Effect for Legendary */}
      {nft.metadata.rarity === 'legendary' && (
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-yellow-400"
          animate={{
            boxShadow: [
              '0 0 20px rgba(251, 191, 36, 0.5)',
              '0 0 40px rgba(251, 191, 36, 0.8)',
              '0 0 20px rgba(251, 191, 36, 0.5)'
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
      
      {/* Content */}
      <div className="relative p-4 z-10">
        {/* Animated Icon */}
        <div className="flex justify-center mb-3">
          <motion.div 
            className={`p-4 rounded-full ${rarityBgColor} border-2 ${rarityColor}`}
            whileHover={{ 
              rotate: nft.metadata.rarity === 'legendary' ? 360 : 0,
              scale: 1.1 
            }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              animate={nft.metadata.rarity === 'legendary' ? {
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              } : {}}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <IconComponent size={48} className={rarityColor.split(' ')[0]} />
            </motion.div>
          </motion.div>
        </div>

        {/* Name */}
        <h3 className="text-white font-bold text-lg text-center mb-2 truncate">
          {nft.metadata.name}
        </h3>

        {/* Rarity */}
        <div className="flex justify-center mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${rarityBgColor}`}>
            {translatedRarity}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm text-center mb-3 line-clamp-2">
          {nft.metadata.description}
        </p>

        {/* Animated Price */}
        {showPrice && nft.is_listed_for_sale === 'True' && (
          <motion.div 
            className="text-center mb-3"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <motion.span 
              className="text-green-400 font-bold text-lg"
              animate={{
                textShadow: [
                  '0 0 10px rgba(34, 197, 94, 0.5)',
                  '0 0 20px rgba(34, 197, 94, 0.8)',
                  '0 0 10px rgba(34, 197, 94, 0.5)'
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {nft.listing_price_eth} ETH
            </motion.span>
          </motion.div>
        )}

        {/* Achievement Type */}
        {nft.metadata.achievement_type && (
          <div className="text-center mb-3">
            <span className="text-blue-300 text-xs bg-blue-900/50 px-2 py-1 rounded">
              {translatedAchievementType.toUpperCase()}
            </span>
          </div>
        )}

        {/* Animated Actions */}
        {showActions && (
          <motion.div 
            className="flex gap-2 mt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {nft.is_listed_for_sale === 'False' ? (
              <motion.button
                onClick={handleListClick}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Listar
              </motion.button>
            ) : (
              <>
                <motion.button
                  onClick={handleUnlistClick}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Quitar
                </motion.button>
                {onBuy && (
                  <motion.button
                    onClick={handleBuyClick}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Comprar
                  </motion.button>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* Earned Date for Achievements */}
        {nft.metadata.earned_date && (
          <div className="text-center mt-2">
            <span className="text-gray-400 text-xs">
              Obtenido: {nft.metadata.earned_date}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};