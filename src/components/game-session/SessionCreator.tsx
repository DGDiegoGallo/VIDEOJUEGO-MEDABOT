import React, { useState } from 'react';
import { useNFTs } from '@/hooks/useNFTs';
import { FaGamepad, FaHeart, FaCrosshairs, FaBolt } from 'react-icons/fa';

interface SessionCreatorProps {
  userId: number;
  onSubmit: (sessionData: any) => void;
  onCancel: () => void;
}

export const SessionCreator: React.FC<SessionCreatorProps> = ({ 
  userId, 
  onSubmit, 
  onCancel 
}) => {
  const { userNFTs } = useNFTs();
  const [formData, setFormData] = useState({
    session_name: `Sesión ${new Date().toLocaleDateString()}`,
    game_mode: 'survival',
    difficulty_level: 'normal',
    selected_nfts: [] as number[]
  });

  const availableNFTs = userNFTs?.filter(nft => nft.is_listed_for_sale === "False") || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const sessionData = {
      session_name: formData.session_name,
      game_mode: formData.game_mode,
      difficulty_level: formData.difficulty_level,
      started_at: new Date().toISOString(),
      session_stats: {
        enemies_defeated: 0,
        total_damage_dealt: 0,
        total_damage_received: 0,
        shots_fired: 0,
        shots_hit: 0,
        accuracy_percentage: 0,
        resources_collected: {
          minerals: 0,
          energy_orbs: 0,
          power_ups: 0
        }
      },
      materials: {
        iron: Math.floor(Math.random() * 20) + 5,
        steel: Math.floor(Math.random() * 10) + 2,
        energy_crystals: Math.floor(Math.random() * 5) + 1
      },
      guns: [
        {
          id: 'basic_pistol',
          name: 'Pistola Básica',
          damage: 25,
          fire_rate: 1.5,
          ammo_capacity: 12
        }
      ],
      daily_quests_completed: {
        date: new Date().toISOString().split('T')[0],
        quests: [
          {
            id: 'kill_10_enemies',
            name: 'Eliminar 10 enemigos',
            completed: false,
            progress: 0,
            target: 10
          },
          {
            id: 'collect_materials',
            name: 'Recolectar 50 materiales',
            completed: false,
            progress: 0,
            target: 50
          }
        ]
      },
      equipped_items: {
        nfts: formData.selected_nfts,
        weapons: ['basic_pistol'],
        active_effects: []
      }
    };

    onSubmit(sessionData);
  };

  const toggleNFT = (nftId: number) => {
    setFormData(prev => ({
      ...prev,
      selected_nfts: prev.selected_nfts.includes(nftId)
        ? prev.selected_nfts.filter(id => id !== nftId)
        : [...prev.selected_nfts, nftId]
    }));
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-purple-400 border-purple-500';
      case 'epic': return 'text-orange-400 border-orange-500';
      case 'rare': return 'text-blue-400 border-blue-500';
      default: return 'text-gray-400 border-gray-500';
    }
  };

  const getEffectIcon = (effectType: string) => {
    switch (effectType) {
      case 'health_boost': return <FaHeart className="text-green-400" />;
      case 'weapon_damage_boost': return <FaCrosshairs className="text-red-400" />;
      case 'movement_speed': return <FaBolt className="text-yellow-400" />;
      default: return <FaGamepad className="text-blue-400" />;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Nombre de Sesión
          </label>
          <input
            type="text"
            value={formData.session_name}
            onChange={(e) => setFormData(prev => ({ ...prev, session_name: e.target.value }))}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Modo de Juego
          </label>
          <select
            value={formData.game_mode}
            onChange={(e) => setFormData(prev => ({ ...prev, game_mode: e.target.value }))}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="survival">Supervivencia</option>
            <option value="adventure">Aventura</option>
            <option value="challenge">Desafío</option>
            <option value="tutorial">Tutorial</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Dificultad
          </label>
          <select
            value={formData.difficulty_level}
            onChange={(e) => setFormData(prev => ({ ...prev, difficulty_level: e.target.value }))}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="easy">Fácil</option>
            <option value="normal">Normal</option>
            <option value="hard">Difícil</option>
            <option value="nightmare">Pesadilla</option>
          </select>
        </div>
      </div>

      {/* NFT Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-4">
          Seleccionar NFTs para Equipar ({formData.selected_nfts.length} seleccionados)
        </label>
        
        {availableNFTs.length === 0 ? (
          <div className="bg-gray-700 rounded-lg p-6 text-center">
            <p className="text-gray-400">No tienes NFTs disponibles para equipar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
            {availableNFTs.map((nft) => {
              const isSelected = formData.selected_nfts.includes(nft.id);
              const effect = nft.metadata.game_effect || (nft.metadata as any).game_effect;
              
              return (
                <div
                  key={nft.id}
                  onClick={() => toggleNFT(nft.id)}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-900/20' 
                      : `border-gray-600 hover:border-gray-500 ${getRarityColor(nft.metadata.rarity)}`
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{nft.metadata.name}</h4>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleNFT(nft.id)}
                      className="text-blue-600"
                    />
                  </div>
                  
                  <div className="text-xs text-gray-400 mb-2">
                    {nft.metadata.rarity}
                  </div>
                  
                  {effect && (
                    <div className="flex items-center space-x-2 text-xs">
                      {getEffectIcon(effect.type)}
                      <span>
                        {effect.type.replace('_', ' ')} +{effect.value}
                        {effect.unit === 'percentage' ? '%' : ''}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Crear Sesión
        </button>
      </div>
    </form>
  );
};