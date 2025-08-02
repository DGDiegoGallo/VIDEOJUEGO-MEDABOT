import React from 'react';
import { FaSkull, FaFire, FaBolt } from 'react-icons/fa';
import { GiDeathSkull, GiPistolGun } from 'react-icons/gi';

export const AnimatedBackground: React.FC = () => {
  const particles = [
    { icon: <FaSkull />, size: 'text-4xl', color: 'text-red-500/20', position: 'top-20 left-10', animation: 'animate__animated animate__pulse animate__infinite' },
    { icon: <GiDeathSkull />, size: 'text-6xl', color: 'text-green-600/15', position: 'top-40 right-20', animation: 'animate__animated animate__bounce animate__infinite animate__slow' },
    { icon: <FaFire />, size: 'text-3xl', color: 'text-orange-500/25', position: 'bottom-32 left-1/4', animation: 'animate__animated animate__pulse animate__infinite' },
    { icon: <FaBolt />, size: 'text-5xl', color: 'text-yellow-500/20', position: 'top-1/3 right-1/4', animation: 'animate__animated animate__flash animate__infinite' },
    { icon: <GiPistolGun />, size: 'text-4xl', color: 'text-gray-500/15', position: 'bottom-20 right-10', animation: 'animate__animated animate__swing animate__infinite animate__slow' },
    { icon: <FaSkull />, size: 'text-2xl', color: 'text-red-400/30', position: 'top-1/2 left-20', animation: 'animate__animated animate__fadeInOut animate__infinite animate__slow' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle, index) => (
        <div
          key={index}
          className={`absolute ${particle.position} ${particle.size} ${particle.color} ${particle.animation}`}
          style={{ animationDelay: `${index * 0.5}s` }}
        >
          {particle.icon}
        </div>
      ))}
      
      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-red-500/40 rounded-full animate__animated animate__bounce animate__infinite animate__slow"></div>
      <div className="absolute top-3/4 right-1/3 w-3 h-3 bg-blue-500/30 rounded-full animate__animated animate__pulse animate__infinite"></div>
      <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-yellow-500/50 rounded-full animate__animated animate__flash animate__infinite"></div>
      
      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-900/5 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-transparent"></div>
    </div>
  );
};