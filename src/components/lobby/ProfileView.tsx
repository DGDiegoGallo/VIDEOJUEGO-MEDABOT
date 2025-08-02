import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { API_CONFIG } from '@/config/api';

interface GameStats {
  highlightedMedal: string;
  enemiesKilled: number;
  score: number;
  highlightedSkill: string;
  materials: {
    iron: number;
    ammo: number;
    medicine: number;
    food: number;
  };
}

export const ProfileView: React.FC = () => {
  const { user, token } = useAuthStore();
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Prefer backend data; fallback to localStorage if unauthenticated
        if (token) {
          const response = await axios.get(`${API_CONFIG.STRAPI_URL}/api/user-stats?filters[user][id][$eq]=${user?.id}&populate=*`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.data.data?.length) {
            setGameStats(response.data.data[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching user stats, using local storage', error);
      } finally {
        // Fallback to localStorage if still null
        if (!gameStats) {
          try {
            const statsStr = localStorage.getItem('game-stats');
            if (statsStr) setGameStats(JSON.parse(statsStr));
          } catch (err) {
            console.warn('No local game stats');
          }
        }
        setIsLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) return <div className="text-white">Cargando perfil...</div>;

  return (
    <div className="w-full max-w-3xl bg-gray-800/70 rounded-lg p-8 text-white backdrop-blur-md">
      <h2 className="text-3xl font-bold mb-6 text-center">Perfil de Usuario</h2>

      {/* User Info */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
        <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-3xl font-bold uppercase">
          {user?.username?.charAt(0)}
        </div>
        <div>
          <h3 className="text-xl font-semibold">{user?.username}</h3>
          <p className="text-gray-300 text-sm">{user?.email}</p>
          <p className="text-gray-400 text-sm">Miembro desde {new Date(user?.createdAt ?? '').toLocaleDateString()}</p>
        </div>
      </div>

      {/* Game Stats */}
      {gameStats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900/60 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Medalla Destacada</h4>
            <p>{gameStats.highlightedMedal || 'Sin medalla'}</p>
          </div>
          <div className="bg-gray-900/60 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Enemigos Derrotados</h4>
            <p>{gameStats.enemiesKilled}</p>
          </div>
          <div className="bg-gray-900/60 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Puntuación Máxima</h4>
            <p>{gameStats.score}</p>
          </div>
          <div className="bg-gray-900/60 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Habilidad Destacada</h4>
            <p>{gameStats.highlightedSkill || 'N/A'}</p>
          </div>
          {/* Materials */}
          {Object.entries(gameStats.materials).map(([key, value]) => (
            <div key={key} className="bg-gray-900/60 p-4 rounded-lg">
              <h4 className="font-semibold capitalize mb-2">{key}</h4>
              <p>{value}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center">Sin estadísticas de juego disponibles.</p>
      )}
    </div>
  );
};
