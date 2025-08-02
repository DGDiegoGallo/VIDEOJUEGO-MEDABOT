import React, { useState } from 'react';
import { FaTimes, FaEthereum, FaCalendar, FaTag, FaStar, FaShieldAlt, FaInfoCircle } from 'react-icons/fa';
import * as Icons from 'react-icons/fa';
import type { UserNFT } from '@/types/nft';

interface NFTModalProps {
  nft: UserNFT | null;
  isOpen?: boolean;
  onClose: () => void;
  onList?: (nft: UserNFT, price: number) => void;
  onUnlist?: (nft: UserNFT) => void;
  onBuy?: (nft: UserNFT) => void;
  onEquip?: (nft: UserNFT) => void;
  onUnequip?: (nft: UserNFT) => void;
  isEquipped?: boolean;
  isEquipping?: boolean;
  showActions?: boolean;
}

const getReactIcon = (iconName: string) => {
  const IconComponent = (Icons as any)[iconName];
  return IconComponent || Icons.FaQuestion;
};

const getRarityColor = (rarity: string) => {
  const colors = {
    common: 'text-gray-400',
    rare: 'text-blue-400',
    epic: 'text-purple-400',
    legendary: 'text-yellow-400'
  };
  return colors[rarity as keyof typeof colors] || colors.common;
};

const getRarityBgColor = (rarity: string) => {
  const colors = {
    common: 'bg-gray-700 text-gray-300',
    rare: 'bg-blue-900 text-blue-300',
    epic: 'bg-purple-900 text-purple-300',
    legendary: 'bg-yellow-900 text-yellow-300'
  };
  return colors[rarity as keyof typeof colors] || colors.common;
};

export const NFTModal: React.FC<NFTModalProps> = ({
  nft,
  isOpen = true,
  onClose,
  onList,
  onUnlist,
  onBuy,
  onEquip,
  onUnequip,
  isEquipped = false,
  isEquipping = false,
  showActions = false
}) => {
  const [listingPrice, setListingPrice] = useState('');
  const [isListing, setIsListing] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  if (!isOpen || !nft) return null;

  const IconComponent = getReactIcon(nft.metadata.icon_name);
  const rarityColor = getRarityColor(nft.metadata.rarity);
  const rarityBgColor = getRarityBgColor(nft.metadata.rarity);

  const handleList = async () => {
    if (!listingPrice || parseFloat(listingPrice) <= 0) return;
    
    setIsListing(true);
    try {
      await onList?.(nft, parseFloat(listingPrice));
      setListingPrice('');
      onClose();
    } catch (error) {
      console.error('Error listing NFT:', error);
    } finally {
      setIsListing(false);
    }
  };

  const handleUnlist = async () => {
    try {
      await onUnlist?.(nft);
      onClose();
    } catch (error) {
      console.error('Error unlisting NFT:', error);
    }
  };

  const handleBuy = async () => {
    try {
      await onBuy?.(nft);
      onClose();
    } catch (error) {
      console.error('Error buying NFT:', error);
    }
  };

  const handleEquip = async () => {
    try {
      await onEquip?.(nft);
    } catch (error) {
      console.error('Error equipping NFT:', error);
    }
  };

  const handleUnequip = async () => {
    try {
      await onUnequip?.(nft);
    } catch (error) {
      console.error('Error unequipping NFT:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700 rounded-t-xl">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FaInfoCircle className="mr-3 text-blue-400" />
            Detalles del NFT
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Main NFT Info - Responsive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Left Column - Visual & Basic Info */}
            <div className="text-center lg:text-left">
              {/* NFT Icon and Name */}
              <div className="mb-6">
                <div className="inline-block p-4 bg-gradient-to-br from-gray-800 to-gray-700 rounded-full mb-4 shadow-lg">
                  <IconComponent className={`text-6xl ${rarityColor} drop-shadow-lg`} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{nft.metadata.name}</h3>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${rarityBgColor} shadow-lg`}>
                  {nft.metadata.rarity.toUpperCase()}
                </span>
              </div>

              {/* Equipped Status */}
              {isEquipped && (
                <div className="mb-6 p-4 bg-green-900/30 border border-green-500/50 rounded-lg shadow-lg">
                  <div className="flex items-center justify-center space-x-2">
                    <FaShieldAlt className="text-green-400" />
                    <span className="text-green-400 font-medium">Equipado en la Sesión de Juego</span>
                  </div>
                </div>
              )}

              {/* NFT Image Placeholder */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-12 mb-6 shadow-xl border border-gray-600">
                <IconComponent className="text-8xl text-gray-500 mx-auto drop-shadow-lg" />
              </div>

              {/* Price Display */}
              {nft.is_listed_for_sale === 'True' && (
                <div className="bg-gradient-to-r from-green-900/50 to-blue-900/50 p-4 rounded-lg border border-green-500/30">
                  <div className="flex items-center justify-center space-x-2">
                    <FaEthereum className="text-green-400 text-xl" />
                    <span className="text-2xl font-bold text-green-400">{nft.listing_price_eth} ETH</span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">≈ ${(nft.listing_price_eth * 2000).toFixed(2)} USD</p>
                </div>
              )}
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              {/* Description */}
              <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-600">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <FaInfoCircle className="mr-2 text-blue-400" />
                  Descripción
                </h4>
                <p className="text-gray-300 leading-relaxed">{nft.metadata.description}</p>
              </div>

              {/* Achievement Type */}
              <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-600">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <FaTag className="mr-2 text-purple-400" />
                  Tipo de Logro
                </h4>
                <span className="inline-block px-4 py-2 bg-blue-900/50 text-blue-300 rounded-lg border border-blue-500/30">
                  {nft.metadata.achievement_type?.toUpperCase() || 'UNKNOWN'}
                </span>
              </div>

              {/* Attributes */}
              {nft.metadata.attributes && nft.metadata.attributes.length > 0 && (
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-600">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <FaStar className="mr-2 text-yellow-400" />
                    Atributos
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {nft.metadata.attributes.map((attr: any, index: number) => (
                      <div key={index} className="bg-gray-700/70 p-3 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors">
                        <div className="text-xs text-gray-400 font-medium">{attr.trait_type}</div>
                        <div className="text-sm text-white font-semibold">{attr.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Technical Details - Expandable Section */}
          <div className="bg-gray-800/30 rounded-lg border border-gray-600 overflow-hidden">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="w-full p-4 bg-gray-800/50 hover:bg-gray-700/50 transition-colors flex items-center justify-between"
            >
              <h4 className="text-lg font-semibold text-white flex items-center">
                <FaInfoCircle className="mr-2 text-blue-400" />
                Detalles Técnicos
              </h4>
              <FaTimes 
                className={`text-gray-400 transition-transform ${showTechnicalDetails ? 'rotate-45' : 'rotate-0'}`} 
              />
            </button>
            
            {showTechnicalDetails && (
              <div className="p-6 bg-gray-800/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                      <span className="text-gray-400 font-medium">Token ID:</span>
                      <span className="text-white font-mono text-sm break-all">{nft.token_id}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                      <span className="text-gray-400 font-medium">Contrato:</span>
                      <span className="text-white font-mono text-xs break-all">{nft.contract_address}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                      <span className="text-gray-400 font-medium">Red:</span>
                      <span className="text-white font-semibold">{nft.network}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                      <span className="text-gray-400 font-medium">Propietario:</span>
                      <span className="text-white font-mono text-xs break-all">{nft.owner_address}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700 rounded-b-xl">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Equip/Unequip Button */}
            {onEquip && onUnequip && (
              <button
                onClick={isEquipped ? handleUnequip : handleEquip}
                disabled={isEquipping}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg ${
                  isEquipped
                    ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 text-white'
                    : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 text-white'
                }`}
              >
                <FaShieldAlt />
                <span>{isEquipped ? 'Desequipar' : 'Equipar'}</span>
              </button>
            )}

            {/* List/Unlist Button */}
            {onList && onUnlist && (
              <button
                onClick={nft.is_listed_for_sale === 'True' ? handleUnlist : () => setListingPrice('0.01')}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                {nft.is_listed_for_sale === 'True' ? 'Quitar de Venta' : 'Listar para Venta'}
              </button>
            )}

            {/* Buy Button */}
            {onBuy && nft.is_listed_for_sale === 'True' && (
              <button
                onClick={handleBuy}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg"
              >
                <FaEthereum />
                <span>Comprar</span>
              </button>
            )}
          </div>

          {/* Listing Price Input */}
          {onList && nft.is_listed_for_sale !== 'True' && (
            <div className="mt-4">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="Precio en ETH"
                  value={listingPrice}
                  onChange={(e) => setListingPrice(e.target.value)}
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <button
                  onClick={handleList}
                  disabled={!listingPrice || parseFloat(listingPrice) <= 0 || isListing}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-300 transform hover:scale-105 font-medium shadow-lg"
                >
                  {isListing ? 'Listando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};