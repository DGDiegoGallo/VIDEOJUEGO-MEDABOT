import React, { useState } from 'react';
import { 
  FaHammer, 
  FaCog, 
  FaExclamationTriangle, 
  FaCheckCircle,
  FaLock,
  FaUnlock,
  FaBolt,
  FaHeart,
  FaAppleAlt,
  FaShieldAlt
} from 'react-icons/fa';
import { GiSteelClaws } from 'react-icons/gi';

interface CraftingRecipe {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  materials: {
    steel: number;
    energy_cells: number;
    medicine: number;
    food: number;
  };
  food_requirement: number; // Comida necesaria para desbloquear
  type: 'weapon' | 'consumable';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
}

interface CraftingTableProps {
  materials: {
    steel: number;
    energy_cells: number;
    medicine: number;
    food: number;
  };
  onCraft?: (recipeId: string) => void;
}

const CRAFTING_RECIPES: CraftingRecipe[] = [
  {
    id: "improved_machinegun",
    name: "Ametralladora Mejorada",
    description: "Arma automática con mayor cadencia de fuego y daño mejorado",
    icon: <FaCog className="text-2xl" />,
    materials: {
      steel: 15,
      energy_cells: 8,
      medicine: 0,
      food: 0
    },
    food_requirement: 5,
    type: 'weapon',
    rarity: 'uncommon'
  },
  {
    id: "grenade_launcher",
    name: "Lanzagranadas",
    description: "Arma explosiva para daño en área masivo",
    icon: <FaHammer className="text-2xl" />,
    materials: {
      steel: 20,
      energy_cells: 12,
      medicine: 0,
      food: 0
    },
    food_requirement: 10,
    type: 'weapon',
    rarity: 'rare'
  },
  {
    id: "laser_rifle",
    name: "Rifle Láser",
    description: "Arma de energía de alta precisión y daño crítico",
    icon: <FaBolt className="text-2xl" />,
    materials: {
      steel: 25,
      energy_cells: 20,
      medicine: 0,
      food: 0
    },
    food_requirement: 15,
    type: 'weapon',
    rarity: 'epic'
  },
  {
    id: "bandage",
    name: "Vendaje",
    description: "Curación de emergencia para recuperar salud",
    icon: <FaHeart className="text-2xl" />,
    materials: {
      steel: 0,
      energy_cells: 0,
      medicine: 3,
      food: 0
    },
    food_requirement: 2,
    type: 'consumable',
    rarity: 'common'
  }
];

export const CraftingTable: React.FC<CraftingTableProps> = ({ 
  materials, 
  onCraft 
}) => {
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);

  const canCraft = (recipe: CraftingRecipe): boolean => {
    return (
      materials.steel >= recipe.materials.steel &&
      materials.energy_cells >= recipe.materials.energy_cells &&
      materials.medicine >= recipe.materials.medicine &&
      materials.food >= recipe.materials.food &&
      materials.food >= recipe.food_requirement
    );
  };

  const isUnlocked = (recipe: CraftingRecipe): boolean => {
    return materials.food >= recipe.food_requirement;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'uncommon': return 'text-green-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-800/60 border-gray-600/50';
      case 'uncommon': return 'bg-green-800/60 border-green-600/50';
      case 'rare': return 'bg-blue-800/60 border-blue-600/50';
      case 'epic': return 'bg-purple-800/60 border-purple-600/50';
      default: return 'bg-gray-800/60 border-gray-600/50';
    }
  };

  const handleCraft = (recipeId: string) => {
    if (onCraft) {
      onCraft(recipeId);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
      <h3 className="text-2xl font-bold text-white flex items-center mb-6">
        <FaHammer className="mr-3 text-orange-400" />
        Mesa de Creación
      </h3>

      {/* Materiales Disponibles */}
      <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
        <h4 className="text-lg font-semibold text-white mb-3">Materiales Disponibles</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center space-x-2 bg-blue-900/30 rounded-lg p-2">
            <GiSteelClaws className="text-blue-400" />
            <span className="text-blue-300 text-sm">Acero: {materials.steel}</span>
          </div>
          <div className="flex items-center space-x-2 bg-yellow-900/30 rounded-lg p-2">
            <FaBolt className="text-yellow-400" />
            <span className="text-yellow-300 text-sm">Energía: {materials.energy_cells}</span>
          </div>
          <div className="flex items-center space-x-2 bg-red-900/30 rounded-lg p-2">
            <FaHeart className="text-red-400" />
            <span className="text-red-300 text-sm">Medicina: {materials.medicine}</span>
          </div>
          <div className="flex items-center space-x-2 bg-green-900/30 rounded-lg p-2">
            <FaAppleAlt className="text-green-400" />
            <span className="text-green-300 text-sm">Comida: {materials.food}</span>
          </div>
        </div>
      </div>

      {/* Recetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CRAFTING_RECIPES.map((recipe) => {
          const unlocked = isUnlocked(recipe);
          const canCraftRecipe = canCraft(recipe);
          
          return (
            <div
              key={recipe.id}
              className={`${getRarityBg(recipe.rarity)} border rounded-xl p-4 transform transition-all duration-300 ${
                unlocked 
                  ? 'hover:scale-105 cursor-pointer' 
                  : 'opacity-60 cursor-not-allowed'
              }`}
              onClick={() => unlocked && setSelectedRecipe(recipe.id)}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`${getRarityColor(recipe.rarity)}`}>
                    {recipe.icon}
                  </div>
                  <div>
                    <h4 className={`text-lg font-bold ${getRarityColor(recipe.rarity)}`}>
                      {recipe.name}
                    </h4>
                    <p className="text-gray-400 text-sm">{recipe.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {unlocked ? (
                    <FaUnlock className="text-green-400" />
                  ) : (
                    <FaLock className="text-red-400" />
                  )}
                  <span className={`text-xs font-semibold ${getRarityColor(recipe.rarity)}`}>
                    {recipe.rarity.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Requisitos */}
              <div className="space-y-2 mb-4">
                <div className="text-xs text-gray-400">
                  Requisitos de comida: {recipe.food_requirement} (Tienes: {materials.food})
                </div>
                
                {unlocked && (
                  <div className="space-y-1">
                    {recipe.materials.steel > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">Acero:</span>
                        <span className={materials.steel >= recipe.materials.steel ? 'text-green-400' : 'text-red-400'}>
                          {materials.steel}/{recipe.materials.steel}
                        </span>
                      </div>
                    )}
                    {recipe.materials.energy_cells > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">Energía:</span>
                        <span className={materials.energy_cells >= recipe.materials.energy_cells ? 'text-green-400' : 'text-red-400'}>
                          {materials.energy_cells}/{recipe.materials.energy_cells}
                        </span>
                      </div>
                    )}
                    {recipe.materials.medicine > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">Medicina:</span>
                        <span className={materials.medicine >= recipe.materials.medicine ? 'text-green-400' : 'text-red-400'}>
                          {materials.medicine}/{recipe.materials.medicine}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Botón de Craft */}
              {unlocked && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCraft(recipe.id);
                  }}
                  disabled={!canCraftRecipe}
                  className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                    canCraftRecipe
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {canCraftRecipe ? (
                    <div className="flex items-center justify-center space-x-2">
                      <FaHammer />
                      <span>Crear</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <FaExclamationTriangle />
                      <span>Materiales Insuficientes</span>
                    </div>
                  )}
                </button>
              )}

              {/* Mensaje de bloqueo */}
              {!unlocked && (
                <div className="text-center py-2 px-4 bg-red-900/30 border border-red-600/50 rounded-lg">
                  <div className="flex items-center justify-center space-x-2 text-red-400">
                    <FaLock />
                    <span className="text-sm">Necesitas {recipe.food_requirement} comida para desbloquear</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Información del Sistema */}
      <div className="mt-6 p-4 bg-blue-900/30 border border-blue-600/50 rounded-lg">
        <h4 className="text-lg font-semibold text-blue-300 mb-2">Sistema de Progresión</h4>
        <div className="text-sm text-blue-200 space-y-1">
          <p>• <strong>Acero + Energía:</strong> Para crear armas</p>
          <p>• <strong>Medicina:</strong> Para crear vendajes</p>
          <p>• <strong>Comida:</strong> Desbloquea recetas y es necesaria para crear</p>
          <p>• <strong>Progresión:</strong> Obtén más comida para desbloquear armas más poderosas</p>
        </div>
      </div>
    </div>
  );
}; 