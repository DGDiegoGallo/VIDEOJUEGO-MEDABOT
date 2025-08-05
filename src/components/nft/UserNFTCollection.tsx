import React, { useState, useEffect, useCallback } from 'react';
import { FaFilter, FaSearch, FaShieldAlt, FaTimes, FaShoppingCart } from 'react-icons/fa';
import { useNFTs, useNFTActions } from '@/hooks/useNFTs';
import { useAuthStore } from '@/stores/authStore';
import { gameSessionService } from '@/services/gameSessionService';
import { nftMarketplaceService } from '@/services/nftMarketplaceService';
import { NFTGrid } from './NFTGrid';
import { NFTModal } from './NFTModal';
import { UnlistNFTModal } from './UnlistNFTModal';
import { MarketplaceParticles } from '@/components/effects/MarketplaceParticles';
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
    <div className="relative w-full max-w-7xl mx-auto">
      {/* Background Particles - mismo efecto que el marketplace */}
      <MarketplaceParticles />
      
      {/* Content */}
      <div className="relative z-10">
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

      {/* Filters and Search - Estilo marketplace */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Search */}
        <div className="relative sm:col-span-2">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar NFTs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800/80 backdrop-blur-sm border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>

        {/* Rarity Filter */}
        <div className="relative">
          <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value)}
            className="w-full pl-10 pr-8 py-2 bg-gray-800/80 backdrop-blur-sm border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none transition-all"
          >
            <option value="all">Todas las rarezas</option>
            <option value="common">Común</option>
            <option value="rare">Raro</option>
            <option value="epic">Épico</option>
            <option value="legendary">Legendario</option>
          </select>
        </div>
      </div>

      {/* Stats similares al marketplace */}
      {allNFTsToRender.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg text-center border border-gray-600 shadow-lg hover:bg-gray-700/80 transition-all duration-300">
            <div className="text-2xl font-bold text-white">{allNFTsToRender.length}</div>
            <div className="text-gray-400 text-sm">NFTs en Colección</div>
          </div>
          <div className="bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg text-center border border-gray-600 shadow-lg hover:bg-gray-700/80 transition-all duration-300">
            <div className="text-2xl font-bold text-green-400">{equippedNFTs.length}</div>
            <div className="text-gray-400 text-sm">Equipados</div>
          </div>
          <div className="bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg text-center border border-gray-600 shadow-lg hover:bg-gray-700/80 transition-all duration-300">
            <div className="text-2xl font-bold text-orange-400">
              {listedNFTs.length}
            </div>
            <div className="text-gray-400 text-sm">En Venta</div>
          </div>
          <div className="bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg text-center border border-gray-600 shadow-lg hover:bg-gray-700/80 transition-all duration-300">
            <div className="text-2xl font-bold text-purple-400">
              {allNFTsToRender.filter(nft => nft.metadata.rarity === 'legendary').length}
            </div>
            <div className="text-gray-400 text-sm">Legendarios</div>
          </div>
        </div>
      )}

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
      
      {/* NFT Grid usando el mismo diseño del marketplace */}
      <NFTGrid
        nfts={allNFTsToRender}
        isLoading={isLoading}
        showPrice={false}
        showActions={false}
        onSelect={handleSelectNFT}
        emptyMessage={isLoading ? 'Cargando tu colección...' : 'Tu colección de NFTs está vacía'}
        className="mb-6"
      />

      {/* Información adicional sobre acciones disponibles */}
      {allNFTsToRender.length > 0 && (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-600 rounded-lg p-4 mb-6">
          <h3 className="text-white font-semibold mb-3 flex items-center">
            <FaShieldAlt className="mr-2 text-blue-400" />
            Acciones Disponibles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-300">Haz clic en un NFT para equipar/desequipar</span>
        </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-300">Usa el modal para listar en el marketplace</span>
                </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-gray-300">
                NFTs equipados: <span className="text-white font-medium">{equippedNFTs.length}</span>
                  </span>
                </div>
              </div>
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
    </div>
  );
};