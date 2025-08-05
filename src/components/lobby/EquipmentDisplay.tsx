import React from 'react';
import { FaBandAid, FaShieldAlt, FaExclamationTriangle, FaCog, FaHammer, FaBolt } from 'react-icons/fa';
import { getWeaponConfig } from '@/config/weaponConfig';

interface EquipmentDisplayProps {
  equipped_items: {
    nfts: any[];
    weapons: string[];
    active_effects: any[];
    bandages: number;
  };
  showTitle?: boolean;
  compact?: boolean;
}

export const EquipmentDisplay: React.FC<EquipmentDisplayProps> = ({ 
  equipped_items, 
  showTitle = true,
  compact = false 
}) => {
  const { nfts, weapons, active_effects, bandages } = equipped_items;

  if (compact) {
    return (
      <div className="flex items-center space-x-3">
        {/* Bandages */}
        <div className="flex items-center space-x-2 bg-gradient-to-r from-red-900/50 to-pink-900/50 rounded-lg px-3 py-2 border border-red-600/30">
          <FaBandAid className="text-red-400 text-lg" />
          <div>
            <div className="text-red-300 text-xs font-semibold">VENDAS</div>
            <div className="text-red-100 font-bold">{bandages}</div>
          </div>
        </div>

        {/* NFT Count */}
        <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-lg px-3 py-2 border border-purple-600/30">
          <FaShieldAlt className="text-purple-400 text-lg" />
          <div>
            <div className="text-purple-300 text-xs font-semibold">NFTs</div>
            <div className="text-purple-100 font-bold">{nfts.length}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
      {showTitle && (
        <h3 className="text-2xl font-bold text-white flex items-center mb-6">
          <FaShieldAlt className="mr-3 text-blue-400" />
          Equipamiento del Combatiente
        </h3>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Bandages */}
        <div className="bg-gradient-to-br from-red-800/60 to-pink-800/60 border border-red-600/50 rounded-xl p-4 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <FaBandAid className="text-4xl text-red-400" />
              <div>
                <h4 className="text-lg font-bold text-red-200">Vendas</h4>
                <p className="text-red-300 text-sm">Curación de emergencia</p>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-red-100 mb-2">
              {bandages}
            </div>
            
            {/* Status indicator */}
            <div className="flex items-center justify-center space-x-2">
              {bandages >= 5 && (
                <div className="flex items-center text-green-400">
                  <FaShieldAlt className="mr-1" />
                  <span className="text-sm font-semibold">Bien equipado</span>
                </div>
              )}
              {bandages >= 2 && bandages < 5 && (
                <div className="flex items-center text-blue-400">
                  <FaShieldAlt className="mr-1" />
                  <span className="text-sm font-semibold">Preparado</span>
                </div>
              )}
              {bandages === 1 && (
                <div className="flex items-center text-yellow-400">
                  <FaExclamationTriangle className="mr-1" />
                  <span className="text-sm font-semibold">Última venda</span>
                </div>
              )}
              {bandages === 0 && (
                <div className="flex items-center text-red-400">
                  <FaExclamationTriangle className="mr-1" />
                  <span className="text-sm font-semibold">Sin vendas</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* NFTs Equipped */}
        <div className="bg-gradient-to-br from-purple-800/60 to-indigo-800/60 border border-purple-600/50 rounded-xl p-4 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <FaShieldAlt className="text-4xl text-purple-400" />
              <div>
                <h4 className="text-lg font-bold text-purple-200">NFTs Equipados</h4>
                <p className="text-purple-300 text-sm">Habilidades especiales</p>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-100 mb-2">
              {nfts.length}
            </div>
            
            <div className="text-purple-400 text-sm">
              {nfts.length === 0 ? 'Ningún NFT equipado' : 
               nfts.length === 1 ? '1 NFT equipado' : 
               `${nfts.length} NFTs equipados`}
            </div>
          </div>
        </div>

        {/* Weapons */}
        <div className="bg-gradient-to-br from-orange-800/60 to-red-800/60 border border-orange-600/50 rounded-xl p-4 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              {weapons.length > 0 && weapons[0] === 'improved_machinegun' ? (
                <FaCog className="text-4xl text-orange-400" />
              ) : weapons.length > 0 && weapons[0] === 'grenade_launcher' ? (
                <FaHammer className="text-4xl text-orange-400" />
              ) : weapons.length > 0 && weapons[0] === 'laser_rifle' ? (
                <FaBolt className="text-4xl text-orange-400" />
              ) : (
                <FaShieldAlt className="text-4xl text-orange-400" />
              )}
              <div>
                <h4 className="text-lg font-bold text-orange-200">Arma Principal</h4>
                <p className="text-orange-300 text-sm">Equipamiento de combate</p>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            {/* Mostrar información del arma equipada */}
            {weapons.length > 0 ? (
              <div className="space-y-2">
                {(() => {
                  const weaponConfig = getWeaponConfig(weapons[0]);
                  const rarityColors = {
                    common: 'text-gray-300',
                    uncommon: 'text-green-300',
                    rare: 'text-blue-300',
                    epic: 'text-purple-300'
                  };
                  
                  return (
                    <>
                      <div className={`text-xl font-bold ${rarityColors[weaponConfig.rarity]} mb-1`}>
                        {weaponConfig.name}
                      </div>
                      <div className="text-orange-400 text-xs mb-2">
                        {weaponConfig.rarity.toUpperCase()}
                      </div>
                      <div className="text-orange-200 text-sm mb-2">
                        {weaponConfig.description}
                      </div>
                      
                      {/* Efectos del arma */}
                      <div className="bg-orange-900/40 rounded-lg p-2 space-y-1">
                        {weaponConfig.effects.bulletsPerShot && weaponConfig.effects.bulletsPerShot > 1 && (
                          <div className="text-xs text-orange-300">
                            • {weaponConfig.effects.bulletsPerShot} proyectiles por disparo
                          </div>
                        )}
                        {weaponConfig.effects.fireRate && (
                          <div className="text-xs text-orange-300">
                            • Velocidad: {weaponConfig.effects.fireRate}ms
                          </div>
                        )}
                        {weaponConfig.effects.damage && (
                          <div className="text-xs text-orange-300">
                            • Daño: {weaponConfig.effects.damage}
                          </div>
                        )}
                        {weaponConfig.effects.specialEffect && (
                          <div className="text-xs text-yellow-300">
                            • Efecto: {weaponConfig.effects.specialEffect}
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-2xl font-bold text-orange-100">
                  Sin arma
                </div>
                <div className="text-orange-400 text-sm">
                  Equipa un arma en la mesa de creación
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resumen de equipamiento */}
      <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FaShieldAlt className="text-blue-400" />
            <span className="text-gray-300 font-semibold">Total de Items Equipados:</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {nfts.length + weapons.length + (bandages > 0 ? 1 : 0)}
          </div>
        </div>
        
        {/* Advertencia si no hay vendas */}
        {bandages === 0 && (
          <div className="mt-3 p-3 bg-red-900/30 border border-red-600/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <FaExclamationTriangle className="text-red-400" />
              <span className="text-red-200 text-sm font-semibold">
                ¡Necesitas vendas! Busca cajas de suministros para obtener más.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 