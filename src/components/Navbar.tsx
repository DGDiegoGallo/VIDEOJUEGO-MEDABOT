import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaGamepad, 
  FaBars, 
  FaTimes, 
  FaHome, 
  FaTrophy, 
  FaUsers, 
  FaDiscord,
  FaTwitter,
  FaTelegram,
  FaGem
} from 'react-icons/fa';
import { GiDeathSkull } from 'react-icons/gi';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      setIsScrolled(scrolled);
      console.log('Scroll position:', window.scrollY, 'Is scrolled:', scrolled); // Debug temporal
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    navigate('/game');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const navItems = [
    { name: 'Inicio', icon: <FaHome />, href: '#home' },
    { name: 'Características', icon: <FaTrophy />, href: '#features' },
    { name: 'NFTs', icon: <FaGem />, href: '#nfts' },
    { name: 'Comunidad', icon: <FaUsers />, href: '#community' }
  ];

  const socialLinks = [
    { icon: <FaDiscord />, href: '#', color: 'text-purple-400 hover:text-purple-300' },
    { icon: <FaTwitter />, href: '#', color: 'text-blue-400 hover:text-blue-300' },
    { icon: <FaTelegram />, href: '#', color: 'text-blue-500 hover:text-blue-400' }
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
      isScrolled ? 'navbar-scrolled' : 'navbar-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 animate__animated animate__pulse animate__infinite">
            <GiDeathSkull className="text-3xl text-red-500" />
            <div className="text-2xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              MEDABOT
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-300 transform hover:scale-110 group"
              >
                <span className="group-hover:animate-bounce">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </a>
            ))}
          </div>

          {/* Social Links & CTA */}
          <div className="hidden md:flex items-center space-x-4">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                className={`text-xl transition-all duration-300 transform hover:scale-125 ${social.color}`}
              >
                {social.icon}
              </a>
            ))}
            
            <button
              onClick={handleLogin}
              className="ml-4 border-2 border-gray-500 hover:border-white hover:bg-white/10 px-4 py-2 rounded-full font-bold text-sm transition-all duration-300 transform hover:scale-105"
            >
              LOGIN
            </button>
            
            <button
              onClick={handleGetStarted}
              className="ml-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 px-6 py-2 rounded-full font-bold text-sm transition-all duration-300 transform hover:scale-105 animate__animated animate__pulse animate__infinite"
            >
              <FaGamepad className="inline mr-2" />
              JUGAR
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-white transition-colors duration-300"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="text-2xl animate__animated animate__rotateIn" />
              ) : (
                <FaBars className="text-2xl animate__animated animate__fadeIn" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden transition-all duration-500 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="py-4 space-y-4 rounded-lg mt-2 border border-red-500/20 mobile-menu-bg">
            {navItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-red-600/20 rounded-lg transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.icon}
                <span>{item.name}</span>
              </a>
            ))}
            
            <div className="flex items-center justify-center space-x-6 px-4 py-2">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className={`text-xl transition-all duration-300 ${social.color}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
            
            <div className="px-4 space-y-2">
              <button
                onClick={() => {
                  handleLogin();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full border-2 border-gray-500 hover:border-white hover:bg-white/10 px-6 py-3 rounded-full font-bold transition-all duration-300 transform hover:scale-105"
              >
                LOGIN
              </button>
              
              <button
                onClick={() => {
                  handleGetStarted();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 px-6 py-3 rounded-full font-bold transition-all duration-300 transform hover:scale-105"
              >
                <FaGamepad className="inline mr-2" />
                JUGAR AHORA
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};