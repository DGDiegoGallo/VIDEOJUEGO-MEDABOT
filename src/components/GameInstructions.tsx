import React, { useState } from "react";

interface GameInstructionsProps {
  onStart: () => void;
}

export const GameInstructions: React.FC<GameInstructionsProps> = ({
  onStart,
}) => {
  const [showInstructions, setShowInstructions] = useState(true);

  const handleStart = () => {
    setShowInstructions(false);
    onStart();
  };

  if (!showInstructions) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg p-8 max-w-2xl mx-4 text-center">
        <h1 className="text-4xl font-bold text-white mb-6">
          🧟 SURVIVAL ZOMBIE 🧟
        </h1>

        <div className="space-y-6 text-left">
          <div className="bg-gray-700 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-white mb-3">
              🎮 Controles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">⬆️⬇️⬅️➡️</span>
                  <span>Mover personaje</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🎯</span>
                  <span>Disparo automático</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🧟</span>
                  <span>Enemigos aparecen automáticamente</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">💚</span>
                  <span>Tu personaje (verde)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🔴</span>
                  <span>Zombies (rojo)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">💛</span>
                  <span>Balas (amarillo)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-white mb-3">
              📊 Objetivo
            </h2>
            <div className="text-gray-300 space-y-2">
              <p>• Sobrevive el mayor tiempo posible</p>
              <p>• Elimina zombies para ganar puntos</p>
              <p>• Evita ser tocado por los enemigos</p>
              <p>• Cada zombie eliminado = +10 puntos</p>
              <p>• ¡La dificultad aumenta con el tiempo!</p>
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-white mb-3">
              ⚡ Características
            </h2>
            <div className="text-gray-300 space-y-2">
              <p>• Disparo automático estilo Vampire Survivors</p>
              <p>• Enemigos aparecen desde los bordes</p>
              <p>• Sistema de salud y puntuación</p>
              <p>• Efectos visuales y partículas</p>
              <p>• Interfaz minimalista y moderna</p>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <button
            onClick={handleStart}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors duration-200 transform hover:scale-105"
          >
            🚀 ¡COMENZAR JUEGO!
          </button>

          <div className="text-gray-400 text-sm">
            <p>Presiona ESC para pausar durante el juego</p>
            <p>Haz clic en el menú para ver más opciones</p>
          </div>
        </div>
      </div>
    </div>
  );
};
