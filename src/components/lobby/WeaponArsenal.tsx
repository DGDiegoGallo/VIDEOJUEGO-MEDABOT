import React from 'react';
import { FaCog, FaHammer, FaBolt, FaShieldAlt, FaCheckCircle } from 'react-icons/fa';
import { getWeaponConfig } from '@/config/weaponConfig';

interface WeaponArsenalProps {
  guns: Array<{
    id: string;
    name: string;
    damage: number;
    fire_rate: number;
    ammo_capacity: number;
    type: string;
    rarity: string;
    is_default: boolean;
  }>;
  equippedWeapons: string[];
  onEquipWeapon?: (weaponId: string) => void;
  compact?: boolean;
}

export const WeaponArsenal: React.FC<WeaponArsenalProps> = ({ 
  guns, 
  equippedWeapons, 
  onEquipWeapon,
  compact = false 
}) => {
  const getWeaponIcon = (weaponId: string) => {
    switch (weaponId) {
      case 'improved_machinegun':
        return <FaCog className="text-2xl" />;
      case 'grenade_launcher':
        return <FaHammer className="text-2xl" />;
      case 'laser_rifle':
        return <FaBolt className="text-2xl" />;
      default:
        return <FaShieldAlt className="text-2xl" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-600/50';
      case 'uncommon': return 'text-green-400 border-green-600/50';
      case 'rare': return 'text-blue-400 border-blue-600/50';
      case 'epic': return 'text-purple-400 border-purple-600/50';
      default: return 'text-gray-400 border-gray-600/50';
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-800/60';
      case 'uncommon': return 'bg-green-800/60';
      case 'rare': return 'bg-blue-800/60';
      case 'epic': return 'bg-purple-800/60';
      default: return 'bg-gray-800/60';
    }
  };

  const isEquipped = (weaponId: string) => {
    return equippedWeapons.includes(weaponId);
  };

  const handleEquip = (weaponId: string) => {
    if (onEquipWeapon && !isEquipped(weaponId)) {
      onEquipWeapon(weaponId);
    }
  };

  if (compact) {
    // Mostrar solo el arma equipada
    const equippedWeapon = guns.find(gun => equippedWeapons.includes(gun.id));
    
    if (!equippedWeapon) {
      return (
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-xl p-4 backdrop-blur-sm">
          <h4 className="text-lg font-bold text-white mb-3">Arsenal Cargado</h4>
          <div className="text-center text-gray-400">
            <FaShieldAlt className="text-3xl mx-auto mb-2 opacity-50" />
            <div className="text-sm">Sin arma equipada</div>
          </div>
        </div>
      );
    }

    // Obtener descripción simple del arma equipada
    const getWeaponDescription = (weaponId: string) => {
      switch (weaponId) {
        case 'pistol_default':
          return 'Arma básica confiable para supervivencia';
        case 'improved_machinegun':
          return 'Arma automática con mayor cadencia de fuego y daño mejorado';
        case 'grenade_launcher':
          return 'Arma explosiva para daño en área masivo';
        case 'laser_rifle':
          return 'Arma de energía de alta precisión y daño crítico';
        default:
          return 'Arma de combate';
      }
    };

    return (
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-xl p-4 backdrop-blur-sm">
        <h4 className="text-lg font-bold text-white mb-3">Arsenal Cargado</h4>
        
        <div className="flex items-center space-x-3 mb-3">
          <div className={getRarityColor(equippedWeapon.rarity)}>
            {getWeaponIcon(equippedWeapon.id)}
          </div>
          <div className="flex-1">
            <h5 className={`font-bold ${getRarityColor(equippedWeapon.rarity)}`}>
              {equippedWeapon.name}
            </h5>
            <p className="text-xs text-gray-400 uppercase">
              {equippedWeapon.rarity}
            </p>
          </div>
          <FaCheckCircle className="text-green-400" />
        </div>
        
        <div className="text-sm text-gray-300 leading-relaxed">
          {getWeaponDescription(equippedWeapon.id)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
      <h3 className="text-2xl font-bold text-white flex items-center mb-6">
        <FaShieldAlt className="mr-3 text-orange-400" />
        Arsenal Disponible
      </h3>

      {guns.length === 0 ? (
        <div className="text-center py-8">
          <FaShieldAlt className="text-6xl text-gray-600 mx-auto mb-4" />
          <h4 className="text-xl font-bold text-gray-400 mb-2">Arsenal Vacío</h4>
          <p className="text-gray-500">Crea armas en la mesa de creación para llenar tu arsenal</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {guns.map((weapon) => {
            const weaponConfig = getWeaponConfig(weapon.id);
            const equipped = isEquipped(weapon.id);
            
            return (
              <div
                key={weapon.id}
                className={`${getRarityBg(weapon.rarity)} border ${getRarityColor(weapon.rarity)} rounded-xl p-4 transform transition-all duration-300 hover:scale-105`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={getRarityColor(weapon.rarity)}>
                      {getWeaponIcon(weapon.id)}
                    </div>
                    <div>
                      <h4 className={`text-lg font-bold ${getRarityColor(weapon.rarity)}`}>
                        {weaponConfig.name}
                      </h4>
                      <p className="text-gray-400 text-xs">{weapon.rarity.toUpperCase()}</p>
                    </div>
                  </div>
                  {equipped && (
                    <FaCheckCircle className="text-green-400 text-xl" />
                  )}
                </div>

                {/* Stats */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Daño:</span>
                    <span className="text-white font-semibold">{weapon.damage}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Velocidad:</span>
                    <span className="text-white font-semibold">{weapon.fire_rate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Munición:</span>
                    <span className="text-white font-semibold">{weapon.ammo_capacity}</span>
                  </div>
                  
                  {/* Efectos especiales */}
                  {weaponConfig.effects.bulletsPerShot && weaponConfig.effects.bulletsPerShot > 1 && (
                    <div className="text-xs text-yellow-300 bg-yellow-900/30 rounded px-2 py-1">
                      • {weaponConfig.effects.bulletsPerShot} proyectiles por disparo
                    </div>
                  )}
                  
                  {weaponConfig.effects.specialEffect && (
                    <div className="text-xs text-purple-300 bg-purple-900/30 rounded px-2 py-1">
                      • {weaponConfig.effects.specialEffect}
                    </div>
                  )}
                </div>

                {/* Equip Button */}
                <button
                  onClick={() => handleEquip(weapon.id)}
                  disabled={equipped}
                  className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                    equipped
                      ? 'bg-green-600 text-white cursor-not-allowed'
                      : 'bg-orange-600 hover:bg-orange-700 text-white'
                  }`}
                >
                  {equipped ? (
                    <div className="flex items-center justify-center space-x-2">
                      <FaCheckCircle />
                      <span>Equipada</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <FaShieldAlt />
                      <span>Equipar</span>
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}; 