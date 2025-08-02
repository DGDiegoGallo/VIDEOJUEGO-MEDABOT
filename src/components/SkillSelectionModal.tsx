import React from 'react';
import { FaBolt, FaMagnet, FaCrosshairs, FaTimes } from 'react-icons/fa';
import { GiUpgrade } from 'react-icons/gi';

export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  currentLevel: number;
  maxLevel: number;
  effect: string;
}

interface SkillSelectionModalProps {
  isOpen: boolean;
  level: number;
  skills: Skill[];
  onSkillSelect: (skillId: string) => void;
  onClose: () => void;
}

export const SkillSelectionModal: React.FC<SkillSelectionModalProps> = ({
  isOpen,
  level,
  skills,
  onSkillSelect,
  onClose
}) => {
  if (!isOpen) return null;

  const getSkillIcon = (skillId: string) => {
    switch (skillId) {
      case 'rapidFire':
        return <FaBolt className="text-yellow-400 text-3xl" />;
      case 'magneticField':
        return <FaMagnet className="text-blue-400 text-3xl" />;
      case 'multiShot':
        return <FaCrosshairs className="text-red-400 text-3xl" />;
      default:
        return <FaBolt className="text-gray-400 text-3xl" />;
    }
  };

  const getSkillColor = (skillId: string) => {
    switch (skillId) {
      case 'rapidFire':
        return {
          bg: 'from-yellow-600 to-orange-600',
          border: 'border-yellow-500/50',
          text: 'text-yellow-400'
        };
      case 'magneticField':
        return {
          bg: 'from-blue-600 to-cyan-600',
          border: 'border-blue-500/50',
          text: 'text-blue-400'
        };
      case 'multiShot':
        return {
          bg: 'from-red-600 to-pink-600',
          border: 'border-red-500/50',
          text: 'text-red-400'
        };
      default:
        return {
          bg: 'from-gray-600 to-gray-700',
          border: 'border-gray-500/50',
          text: 'text-gray-400'
        };
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-md rounded-2xl p-8 max-w-2xl w-full mx-4 border border-gray-700/50 shadow-2xl animate-modal-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <GiUpgrade className="text-yellow-500 text-4xl animate-pulse" />
            <div>
              <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                ¡NIVEL {level}!
              </h2>
              <p className="text-gray-400 text-sm">Elige una habilidad para mejorar</p>
            </div>
          </div>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {skills.map((skill) => {
            const colors = getSkillColor(skill.id);
            const isMaxLevel = skill.currentLevel >= skill.maxLevel;
            
            return (
              <button
                key={skill.id}
                onClick={() => !isMaxLevel && onSkillSelect(skill.id)}
                disabled={isMaxLevel}
                className={`
                  relative bg-gradient-to-br ${colors.bg} rounded-xl p-6 border-2 ${colors.border}
                  transition-all duration-300 transform hover:scale-105 hover:shadow-2xl
                  ${isMaxLevel 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:shadow-yellow-500/20 cursor-pointer'
                  }
                  group
                `}
              >
                {/* Max Level Badge */}
                {isMaxLevel && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full px-3 py-1 text-xs font-bold text-white">
                    MAX
                  </div>
                )}

                {/* Skill Icon */}
                <div className="flex justify-center mb-4">
                  {getSkillIcon(skill.id)}
                </div>

                {/* Skill Info */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {skill.name}
                  </h3>
                  
                  <p className="text-gray-300 text-sm mb-3">
                    {skill.description}
                  </p>

                  {/* Level Indicator */}
                  <div className="mb-3">
                    <div className="flex justify-center items-center space-x-2 mb-2">
                      <span className="text-white text-sm font-semibold">
                        Nivel {skill.currentLevel}
                      </span>
                      {!isMaxLevel && (
                        <>
                          <span className="text-gray-400">→</span>
                          <span className={`${colors.text} text-sm font-semibold`}>
                            Nivel {skill.currentLevel + 1}
                          </span>
                        </>
                      )}
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`bg-gradient-to-r ${colors.bg} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${(skill.currentLevel / skill.maxLevel) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Effect Description */}
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-gray-300 text-xs">
                      {skill.effect}
                    </p>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            );
          })}
        </div>

        {/* Instructions */}
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-4">
            💡 Las habilidades se vuelven más poderosas con cada nivel
          </p>
          
          {/* Close button (emergency) */}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors"
            title="Cerrar (no recomendado)"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>
      </div>
    </div>
  );
};