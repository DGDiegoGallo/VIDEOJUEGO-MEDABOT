import React, { useState, useEffect } from 'react';
import { FaFilter, FaSearch, FaShieldAlt, FaTimes } from 'react-icons/fa';
import { useNFTs, useNFTActions } from '@/hooks/useNFTs';
import { useAuthStore } from '@/stores/authStore';
import { gameSessionService } from '@/services/gameSessionService';
import { NFTGrid } from './NFTGrid';
import { NFTModal } from './NFTModal';
import type { UserNFT } from '@/types/nft';

export const UserNFTCollection: React.FC = () => {
  const { user } = useAuthStore();
  const { nfts, isLoading, error, refetch } = useNFTs(user?.id);
  const { listForSale, unlist, select, clearSelected } = useNFTActions();
  const [selectedNFT, setSelectedNFT] = useState<UserNFT | null>(null);
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [userGameSession, setUserGameSession] = useState<any>(null);
  const [equippedNFTs, setEquippedNFTs] = useState<string[]>([]);
  const [isEquipping, setIsEquipping] = useState(false);

  // Cargar la sesión de juego del usuario
  useEffect(() => {
    const loadUserGameSession = async () => {
      if (user?.id) {
        try {
          const session = await gameSessionService.getUserGameSession(parseInt(user.id));
          setUserGameSession(session);
          
          // Extraer IDs de NFTs equipados
          const equipped = session?.equipped_items?.nfts?.map((nft: any) => 
            nft.id || nft.token_id
          ) || [];
          setEquippedNFTs(equipped);
        } catch (error) {
          console.error('Error loading user game session:', error);
        }
      }
    };

    loadUserGameSession();
  }, [user?.id]);

  // Filter NFTs based on search and rarity
  const filteredNFTs = nfts.filter(nft => {
    const matchesSearch = nft.metadata.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nft.metadata.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRarity = filterRarity === 'all' || nft.metadata.rarity === filterRarity;
    return matchesSearch && matchesRarity;
  });

  const handleSelectNFT = (nft: UserNFT) => {
    setSelectedNFT(nft);
    select(nft);
  };

  const handleCloseModal = () => {
    setSelectedNFT(null);
    clearSelected();
  };

  const handleListNFT = async (nft: UserNFT, price?: number) => {
    // If no price provided, open modal for price input
    if (price === undefined || price === 0) {
      setSelectedNFT(nft);
      return;
    }
    
    try {
      await listForSale(nft.documentId, price);
      await refetch();
    } catch (error) {
      console.error('Error listing NFT:', error);
    }
  };

  const handleUnlistNFT = async (nft: UserNFT) => {
    try {
      await unlist(nft.documentId);
      await refetch();
    } catch (error) {
      console.error('Error unlisting NFT:', error);
    }
  };

  const handleEquipNFT = async (nft: UserNFT) => {
    if (!userGameSession) {
      alert('No se encontró una sesión de juego. Crea una sesión primero.');
      return;
    }

    setIsEquipping(true);
    try {
      const result = await gameSessionService.equipNFT({
        nftId: nft.documentId,
        nftData: nft,
        sessionId: userGameSession.documentId
      });

      if (result.success) {
        // Actualizar estado local
        setEquippedNFTs(prev => [...prev, nft.documentId]);
        // Recargar la sesión
        const updatedSession = await gameSessionService.getUserGameSession(parseInt(user.id));
        setUserGameSession(updatedSession);
        alert('✅ NFT equipado exitosamente');
      } else {
        alert(result.message || 'Error equipando NFT');
      }
    } catch (error) {
      console.error('Error equipping NFT:', error);
      alert('❌ Error equipando NFT');
    } finally {
      setIsEquipping(false);
    }
  };

  const handleUnequipNFT = async (nft: UserNFT) => {
    if (!userGameSession) {
      alert('No se encontró una sesión de juego.');
      return;
    }

    setIsEquipping(true);
    try {
      const result = await gameSessionService.unequipNFT({
        nftId: nft.documentId,
        sessionId: userGameSession.documentId
      });

      if (result.success) {
        // Actualizar estado local
        setEquippedNFTs(prev => prev.filter(id => id !== nft.documentId));
        // Recargar la sesión
        const updatedSession = await gameSessionService.getUserGameSession(parseInt(user.id));
        setUserGameSession(updatedSession);
        alert('✅ NFT desequipado exitosamente');
      } else {
        alert(result.message || 'Error desequipando NFT');
      }
    } catch (error) {
      console.error('Error unequipping NFT:', error);
      alert('❌ Error desequipando NFT');
    } finally {
      setIsEquipping(false);
    }
  };

  const isNFTEquipped = (nft: UserNFT) => {
    return equippedNFTs.includes(nft.documentId);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-400 text-6xl mb-4">⚠️</div>
        <h3 className="text-white text-xl font-semibold mb-2">Error al cargar NFTs</h3>
        <p className="text-gray-400 text-center mb-4">{error}</p>
        <button
          onClick={refetch}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Mi Colección de NFTs</h2>
        <p className="text-gray-400">
          Gestiona tus NFTs, ponlos en venta o simplemente admira tu colección
        </p>
        
        {/* Estado de la sesión de juego */}
        {userGameSession && (
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FaShieldAlt className="text-blue-400" />
                <span className="text-blue-400 font-medium">Sesión de Juego Activa:</span>
                <span className="text-white">{userGameSession.session_name}</span>
              </div>
              <div className="text-sm text-gray-400">
                NFTs Equipados: {equippedNFTs.length}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar NFTs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Rarity Filter */}
        <div className="relative">
          <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value)}
            className="pl-10 pr-8 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 appearance-none"
          >
            <option value="all">Todas las rarezas</option>
            <option value="common">Común</option>
            <option value="rare">Raro</option>
            <option value="epic">Épico</option>
            <option value="legendary">Legendario</option>
          </select>
        </div>
      </div>

      {/* NFT Grid with Equip/Unequip functionality */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredNFTs.map((nft) => (
          <div
            key={nft.documentId}
            className={`bg-gray-800 border rounded-lg p-4 transition-all duration-300 hover:shadow-lg ${
              isNFTEquipped(nft) 
                ? 'border-green-500 bg-green-900/20' 
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            {/* NFT Icon */}
            <div className="text-center mb-4">
              <div className="text-4xl text-yellow-400 mb-2">🏆</div>
              <h3 className="text-lg font-semibold text-white">{nft.metadata.name}</h3>
              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                nft.metadata.rarity === 'legendary' ? 'bg-purple-900 text-purple-300' :
                nft.metadata.rarity === 'epic' ? 'bg-blue-900 text-blue-300' :
                nft.metadata.rarity === 'rare' ? 'bg-green-900 text-green-300' :
                'bg-gray-700 text-gray-300'
              }`}>
                {nft.metadata.rarity.toUpperCase()}
              </span>
            </div>

            {/* NFT Description */}
            <p className="text-gray-400 text-sm mb-4 line-clamp-3">
              {nft.metadata.description}
            </p>

            {/* Achievement Type */}
            <div className="mb-4">
              <span className="inline-block px-2 py-1 bg-blue-900 text-blue-300 text-xs rounded">
                {nft.metadata.achievement_type?.toUpperCase() || 'UNKNOWN'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {isNFTEquipped(nft) ? (
                <button
                  onClick={() => handleUnequipNFT(nft)}
                  disabled={isEquipping}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded transition-colors flex items-center justify-center space-x-2"
                >
                  <FaTimes />
                  <span>Desequipar</span>
                </button>
              ) : (
                <button
                  onClick={() => handleEquipNFT(nft)}
                  disabled={isEquipping}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded transition-colors flex items-center justify-center space-x-2"
                >
                  <FaShieldAlt />
                  <span>Equipar</span>
                </button>
              )}

              {nft.is_listed_for_sale === 'True' ? (
                <button
                  onClick={() => handleUnlistNFT(nft)}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded transition-colors"
                >
                  Quitar de Venta
                </button>
              ) : (
                <button
                  onClick={() => handleListNFT(nft)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
                >
                  Listar
                </button>
              )}
            </div>

            {/* Equipped Status */}
            {isNFTEquipped(nft) && (
              <div className="mt-3 p-2 bg-green-900/30 border border-green-500/50 rounded text-center">
                <span className="text-green-400 text-sm font-medium">✓ Equipado</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* NFT Modal */}
      {selectedNFT && (
        <NFTModal
          nft={selectedNFT}
          onClose={handleCloseModal}
          onList={handleListNFT}
          onUnlist={handleUnlistNFT}
          onEquip={handleEquipNFT}
          onUnequip={handleUnequipNFT}
          isEquipped={isNFTEquipped(selectedNFT)}
          isEquipping={isEquipping}
        />
      )}
    </div>
  );
};