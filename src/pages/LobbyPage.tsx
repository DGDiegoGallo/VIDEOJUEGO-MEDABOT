import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlay } from 'react-icons/fa';
import { useAuthStore } from '@/stores/authStore';
import { useGameSessionData } from '@/hooks/useGameSessionData';
import LobbyBg from '@/assets/lobby.png';
import { LobbyNavbar, LobbySection } from '@/components/lobby/LobbyNavbar';
import { ProfileView } from '@/components/lobby/ProfileView';
import { WalletView } from '@/components/lobby/WalletView';
import { NFTView } from '@/components/lobby/NFTView';
import { SurvivalLobbyView } from '@/components/lobby/SurvivalLobbyView';

export const LobbyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [section, setSection] = useState<LobbySection>('main');
  const [currentMaterials, setCurrentMaterials] = useState<{
    steel: number;
    energy_cells: number;
    medicine: number;
    food: number;
  } | undefined>(undefined);

  // Obtener sesiones del usuario para los materiales
  const { sessions } = useGameSessionData(user ? parseInt(user.id) : 0);

  useEffect(() => {
    if (sessions.length > 0) {
      const initialSession = sessions.find(s => s.session_name?.includes('Sesión Inicial')) || sessions[0];
      if (initialSession?.materials) {
        // Mapear los materiales existentes a la nueva estructura
        const materials = initialSession.materials;
        setCurrentMaterials({
          steel: materials.steel || 0,
          energy_cells: materials.energy_cells || 0,
          medicine: materials.medicine || 0,
          food: materials.food || 0
        });
      }
    }
  }, [sessions]);

  const handlePlay = () => navigate('/game');

  const renderSection = () => {
    switch (section) {
      case 'profile':
        return <ProfileView />;
      case 'wallet':
        return <WalletView />;
      case 'nfts':
        return <NFTView />;
      default:
        return <SurvivalLobbyView />;
    }
  };

  return (
    <div
      className="relative w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${LobbyBg})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Navbar */}
      <LobbyNavbar 
        activeSection={section} 
        onSectionChange={setSection} 
        materials={currentMaterials}
      />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center w-full h-full pt-24 px-4">
        {renderSection()}
      </div>
    </div>
  );
};
