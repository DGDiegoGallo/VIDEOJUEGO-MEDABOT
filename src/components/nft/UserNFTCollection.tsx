import React, { useState, useEffect, useCallback } from 'react';
import { FaFilter, FaSearch, FaShieldAlt, FaTimes, FaShoppingCart } from 'react-icons/fa';
import { useNFTs, useNFTActions } from '@/hooks/useNFTs';
import { useAuthStore } from '@/stores/authStore';
import { gameSessionService } from '@/services/gameSessionService';
import { nftMarketplaceService } from '@/services/nftMarketplaceService';
import { NFTGrid } from './NFTGrid';
import { NFTModal } from './NFTModal';
import { UnlistNFTModal } from './UnlistNFTModal';
import type { UserNFT } from '@/types/nft';

export const UserNFTCollection: React.FC = () => {
  const { user } = useAuthStore();
  const { nfts, isLoading, error, refetch } = useNFTs(user?.id);
  const { listForSale, unlist, select, clearSelected } = useNFTActions(user?.id ? parseInt(user.id) : undefined);
  const [selectedNFT, setSelectedNFT] = useState<UserNFT | null>(null);
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [userGameSession, setUserGameSession] = useState<any>(null);
  const [equippedNFTs, setEquippedNFTs] = useState<string[]>([]);
  const [isEquipping, setIsEquipping] = useState(false);
  const [isListingLoading, setIsListingLoading] = useState(false);
  const [isUnlistingLoading, setIsUnlistingLoading] = useState(false);
  const [listedNFTs, setListedNFTs] = useState<UserNFT[]>([]);
  const [showUnlistModal, setShowUnlistModal] = useState(false);
  const [nftToUnlist, setNftToUnlist] = useState<UserNFT | null>(null);

  // Función para cargar NFTs listados
  const loadListedNFTs = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const walletResponse = await fetch(`http://localhost:1337/api/user-wallets?filters[users_permissions_user][id][$eq]=${user.id}&populate=*`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });
      
      if (walletResponse.ok) {
        const walletData = await walletResponse.json();
        const userWallet = walletData.data?.[0];
        
        if (userWallet?.wallet_address) {
          console.log('🔍 Wallet del usuario encontrada:', userWallet.wallet_address);
          
          const listedResult = await nftMarketplaceService.getMarketplaceNFTsByOwner(
            userWallet.wallet_address
          );
          
          if (listedResult.success) {
            console.log('📋 NFTs listados encontrados:', listedResult.data?.length || 0);
            setListedNFTs(listedResult.data || []);
          } else {
            console.error('❌ Error obteniendo NFTs listados:', listedResult.error);
          }
        } else {
          console.warn('⚠️ No se encontró wallet para el usuario');
        }
      } else {
        console.error('❌ Error obteniendo wallet del usuario');
      }
    } catch (error) {
      console.error('Error loading listed NFTs:', error);
    }
  }, [user?.id]);

  // Cargar la sesión de juego del usuario y NFTs listados
  useEffect(() => {
    const loadUserData = async () => {
      if (user?.id) {
        try {
          // Cargar sesión de juego
          const session = await gameSessionService.getUserGameSession(parseInt(user.id));
          setUserGameSession(session);
          
          // Extraer IDs de NFTs equipados
          const equipped = session?.equipped_items?.nfts?.map((nft: any) => 
            nft.id || nft.token_id
          ) || [];
          setEquippedNFTs(equipped);

          // Cargar NFTs listados
          await loadListedNFTs();
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
    };

    loadUserData();
  }, [user?.id, loadListedNFTs]);

  // Recargar NFTs listados cuando cambien los NFTs del usuario (después de listar/delistar)
  useEffect(() => {
    if (user?.id) {
      loadListedNFTs();
    }
  }, [nfts.length, user?.id, loadListedNFTs]);

  // Filter NFTs based on search and rarity
  const filteredNFTs = nfts.filter(nft => {
    const matchesSearch = nft.metadata.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nft.metadata.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRarity = filterRarity === 'all' || nft.metadata.rarity === filterRarity;
    return matchesSearch && matchesRarity;
  });

  // Combinar NFTs locales con NFTs listados para renderizar
  const allNFTsToRender = [...filteredNFTs, ...listedNFTs];
  
  console.log('🎨 NFTs a renderizar:', {
    locales: filteredNFTs.length,
    listados: listedNFTs.length,
    total: allNFTsToRender.length,
    localesDetalle: filteredNFTs.map(nft => nft.metadata?.name),
    listadosDetalle: listedNFTs.map(nft => nft.metadata?.name)
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
    // Verificar si el NFT ya está listado
    if (isNFTListed(nft)) {
      console.log('⚠️ NFT ya está listado, no se puede listar de nuevo');
      return;
    }

    try {
      if (price && price > 0) {
        setIsListingLoading(true);
        console.log('🔄 Listando NFT:', nft.metadata?.name, 'Precio:', price);
        
        await listForSale(nft.documentId, price);
        
        // Esperar un momento para que se procese en el backend
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Recargar NFTs listados después de listar
        console.log('🔄 Recargando NFTs listados después de listar...');
        await loadListedNFTs();
        console.log('✅ NFTs listados recargados después de listar');
      } else {
        // Si no hay precio, abrir el modal de detalles para seleccionar precio
        console.log('🔄 Abriendo modal para seleccionar precio...');
        setSelectedNFT(nft);
      }
    } catch (error) {
      console.error('Error listing NFT:', error);
    } finally {
      setIsListingLoading(false);
    }
  };

  const handleUnlistNFT = async (nft: UserNFT) => {
    console.log('🔄 Quitando NFT listado del marketplace:', nft.documentId);
    setNftToUnlist(nft);
    setShowUnlistModal(true);
  };

  const handleUnlistSuccess = async () => {
    setIsUnlistingLoading(true);
    console.log('🔄 Procesando éxito de unlist...');
    
    try {
      // Recargar NFTs listados usando la función reutilizable
      await loadListedNFTs();
      
      // Recargar NFTs del usuario
      await refetch();
      
      console.log('✅ Proceso de unlist completado exitosamente');
    } catch (error) {
      console.error('Error recargando datos después de unlist:', error);
    } finally {
      setIsUnlistingLoading(false);
      setShowUnlistModal(false);
      setNftToUnlist(null);
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
        if (user?.id) {
          const updatedSession = await gameSessionService.getUserGameSession(parseInt(user.id));
          setUserGameSession(updatedSession);
        }
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
        if (user?.id) {
          const updatedSession = await gameSessionService.getUserGameSession(parseInt(user.id));
          setUserGameSession(updatedSession);
        }
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

  const isNFTListed = (nft: UserNFT) => {
    // Si el NFT está en listedNFTs, significa que está listado
    const isListed = listedNFTs.some(listedNFT => listedNFT.token_id === nft.token_id);
    console.log(`🔍 Verificando si NFT ${nft.metadata?.name} está listado:`, isListed);
    return isListed;
  };

  const getListedNFT = (nft: UserNFT) => {
    const listedNFT = listedNFTs.find(listedNFT => listedNFT.token_id === nft.token_id);
    if (listedNFT) {
      console.log(`📋 NFT listado encontrado: ${nft.metadata?.name} - Precio: ${listedNFT.listing_price_eth} ETH`);
    }
    return listedNFT;
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
      {(isListingLoading || isUnlistingLoading) && (
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-blue-400 font-medium">
              {isListingLoading ? 'Listando NFT en el marketplace...' : 'Quitando NFT del marketplace...'}
            </p>
          </div>
        </div>
      )}
      
      {allNFTsToRender.length === 0 && !isListingLoading && !isUnlistingLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🎨</div>
          <h3 className="text-white text-xl font-semibold mb-2">No tienes NFTs</h3>
          <p className="text-gray-400 text-center mb-4">
            {isLoading ? 'Cargando tu colección...' : 'Tu colección de NFTs está vacía'}
          </p>
          {!isLoading && (
            <button
              onClick={refetch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            >
              Recargar
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allNFTsToRender.map((nft) => {
            const isListed = isNFTListed(nft);
            const listedNFT = getListedNFT(nft);
            
            return (
              <div
                key={nft.documentId}
                className={`bg-gray-800 border rounded-lg p-4 transition-all duration-300 hover:shadow-lg ${
                  isNFTEquipped(nft) 
                    ? 'border-green-500 bg-green-900/20' 
                    : isListed
                    ? 'border-orange-500 bg-orange-900/20'
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

                {/* Listed Price Info */}
                {isListed && listedNFT && (
                  <div className="mb-4 p-2 bg-orange-900/30 border border-orange-500/50 rounded text-center">
                    <p className="text-orange-400 text-sm font-medium">
                      Listado por {listedNFT.listing_price_eth} ETH
                    </p>
                  </div>
                )}

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
                      disabled={isEquipping || isListed}
                      className={`w-full py-2 px-4 rounded transition-colors flex items-center justify-center space-x-2 ${
                        isListed
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      <FaShieldAlt />
                      <span>{isListed ? 'No Equipable' : 'Equipar'}</span>
                    </button>
                  )}

                  {isListed ? (
                    <button
                      onClick={() => handleUnlistNFT(listedNFT!)}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded transition-colors flex items-center justify-center space-x-2"
                    >
                      <FaShoppingCart />
                      <span>Quitar de Venta</span>
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

                {/* Status Indicators */}
                {isNFTEquipped(nft) && (
                  <div className="mt-3 p-2 bg-green-900/30 border border-green-500/50 rounded text-center">
                    <span className="text-green-400 text-sm font-medium">✓ Equipado</span>
                  </div>
                )}
                
                {isListed && (
                  <div className="mt-3 p-2 bg-orange-900/30 border border-orange-500/50 rounded text-center">
                    <span className="text-orange-400 text-sm font-medium">📋 Listado en Marketplace</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

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
          isListed={isNFTListed(selectedNFT)}
        />
      )}

      {/* Unlist NFT Modal */}
      <UnlistNFTModal
        nft={nftToUnlist}
        isOpen={showUnlistModal}
        onClose={() => setShowUnlistModal(false)}
        onSuccess={handleUnlistSuccess}
      />
    </div>
  );
};