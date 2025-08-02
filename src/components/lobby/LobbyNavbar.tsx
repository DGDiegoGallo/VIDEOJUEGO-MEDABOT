import React from 'react';
import { FaSignOutAlt, FaUser, FaWallet, FaImage, FaPlay, FaGem } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { MaterialsDisplay } from './MaterialsDisplay';

interface Props {
  onSectionChange: (section: LobbySection) => void;
  activeSection: LobbySection;
  materials?: {
    iron: number;
    steel: number;
    energy_crystals: number;
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
    <nav className="w-full bg-gray-800/80 backdrop-blur-md text-white py-3 px-6 flex items-center justify-between fixed top-0 left-0 z-50 shadow-lg">
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
            className={`flex items-center gap-2 py-2 px-4 rounded-md hover:bg-gray-700 transition-colors ${
              activeSection === item.id ? 'bg-blue-600' : ''
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
          <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg px-3 py-2 border border-purple-500/30">
            <FaGem className="text-purple-400 text-lg animate-pulse" />
            <div>
              <div className="text-purple-300 text-xs font-semibold">CRISTALES</div>
              <div className="text-purple-100 font-bold">{materials.energy_crystals}</div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
