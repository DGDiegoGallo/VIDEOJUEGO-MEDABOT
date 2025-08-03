import React from 'react';
import { FaSignOutAlt, FaUser, FaWallet, FaImage, FaPlay, FaGem, FaBolt, FaHeart, FaAppleAlt } from 'react-icons/fa';
import { GiSteelClaws } from 'react-icons/gi';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { MaterialsDisplay } from './MaterialsDisplay';

interface Props {
  onSectionChange: (section: LobbySection) => void;
  activeSection: LobbySection;
  materials?: {
    steel: number;
    energy_cells: number;
    medicine: number;
    food: number;
  };
}

export type LobbySection = 'main' | 'profile' | 'wallet' | 'nfts';

export const LobbyNavbar: React.FC<Props> = ({ onSectionChange, activeSection, materials }) => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems: { id: LobbySection | 'logout'; icon: React.ReactNode; label: string; action?: () => void }[] = [
    { id: 'main', icon: <FaPlay />, label: 'Juego' },
    { id: 'profile', icon: <FaUser />, label: 'Perfil' },
    { id: 'wallet', icon: <FaWallet />, label: 'Wallet' },
    { id: 'nfts', icon: <FaImage />, label: 'NFTs' },
    { id: 'logout', icon: <FaSignOutAlt />, label: 'Salir', action: handleLogout },
  ];

  return (
    <nav className="w-full bg-gray-800/90 backdrop-blur-md text-white py-4 px-6 flex items-center justify-between fixed top-0 left-0 z-50 shadow-lg border-b border-gray-700/50">
      {/* Navegación izquierda */}
      <div className="flex items-center gap-6">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'logout') {
                item.action?.();
                return;
              }
              onSectionChange(item.id as LobbySection);
            }}
            className={`flex items-center gap-2 py-3 px-4 rounded-md hover:bg-gray-700/80 transition-all duration-300 ${
              activeSection === item.id ? 'bg-blue-600/90 shadow-lg' : ''
            }`}
          >
            {item.icon}
            <span className="hidden md:inline-block text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Materiales en la derecha */}
      {materials && (
        <div className="hidden lg:flex items-center space-x-3">
          {/* Steel */}
          <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-900/70 to-cyan-900/70 rounded-lg px-3 py-2 border border-blue-600/40 backdrop-blur-sm">
            <GiSteelClaws className="text-blue-400 text-lg" />
            <div>
              <div className="text-blue-300 text-xs font-semibold">ACERO</div>
              <div className="text-blue-100 font-bold">{materials.steel}</div>
            </div>
          </div>

          {/* Energy Cells */}
          <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-900/70 to-orange-900/70 rounded-lg px-3 py-2 border border-yellow-600/40 backdrop-blur-sm">
            <FaBolt className="text-yellow-400 text-lg" />
            <div>
              <div className="text-yellow-300 text-xs font-semibold">ENERGÍA</div>
              <div className="text-yellow-100 font-bold">{materials.energy_cells}</div>
            </div>
          </div>

          {/* Medicine */}
          <div className="flex items-center space-x-2 bg-gradient-to-r from-red-900/70 to-pink-900/70 rounded-lg px-3 py-2 border border-red-600/40 backdrop-blur-sm">
            <FaHeart className="text-red-400 text-lg" />
            <div>
              <div className="text-red-300 text-xs font-semibold">MEDICINA</div>
              <div className="text-red-100 font-bold">{materials.medicine}</div>
            </div>
          </div>

          {/* Food */}
          <div className="flex items-center space-x-2 bg-gradient-to-r from-green-900/70 to-emerald-900/70 rounded-lg px-3 py-2 border border-green-600/40 backdrop-blur-sm">
            <FaAppleAlt className="text-green-400 text-lg" />
            <div>
              <div className="text-green-300 text-xs font-semibold">COMIDA</div>
              <div className="text-green-100 font-bold">{materials.food}</div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
