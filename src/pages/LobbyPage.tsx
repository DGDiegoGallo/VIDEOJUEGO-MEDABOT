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
    iron: number;
    steel: number;
    energy_crystals: number;
  } | null>(null);

  // Obtener sesiones del usuario para los materiales
  const { sessions } = useGameSessionData(user ? parseInt(user.id) : 0);

  useEffect(() => {
    if (sessions.length > 0) {
      const initialSession = sessions.find(s => s.session_name?.includes('Sesión Inicial')) || sessions[0];
      if (initialSession?.materials) {
        setCurrentMaterials(initialSession.materials);
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
      <div className="relative z-10 flex items-center justify-center w-full h-full pt-16 px-4">
        {renderSection()}
      </div>
    </div>
  );
};
