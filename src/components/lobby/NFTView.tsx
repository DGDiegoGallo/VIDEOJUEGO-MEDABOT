import React, { useState } from 'react';
import { FaUser, FaStore } from 'react-icons/fa';
import { UserNFTCollection } from '@/components/nft/UserNFTCollection';
import { NFTMarketplace } from '@/components/nft/NFTMarketplace';

type NFTViewMode = 'collection' | 'marketplace';

export const NFTView: React.FC = () => {
  const [viewMode, setViewMode] = useState<NFTViewMode>('collection');

  return (
    <div className="w-full h-full text-white bg-black/40 rounded-lg p-6 overflow-y-auto">
      {/* Tab Navigation */}
      <div className="flex mb-6 bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setViewMode('collection')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-colors ${
            viewMode === 'collection'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <FaUser />
          Mi Colección
        </button>
        <button
          onClick={() => setViewMode('marketplace')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-colors ${
            viewMode === 'marketplace'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <FaStore />
          Marketplace
        </button>
      </div>

      {/* Content */}
      <div className="h-full">
        {viewMode === 'collection' ? (
          <UserNFTCollection />
        ) : (
          <NFTMarketplace />
        )}
      </div>
    </div>
  );
};
