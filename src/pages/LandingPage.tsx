import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaGamepad,
  FaTrophy,
  FaUsers,
  FaBolt,
  FaGem,
  FaPlay,
  FaDiscord,
  FaTwitter,
  FaTelegram,
} from "react-icons/fa";
import {
  GiDeathSkull,
  GiPistolGun,
  GiChestArmor,
  GiTreasureMap,
} from "react-icons/gi";
import { SiEthereum, SiPolygon } from "react-icons/si";
import { Navbar } from "@/components/Navbar";
import { AnimatedBackground } from "@/components/AnimatedBackground";

export const LandingPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleGetStarted = () => {
    navigate('/login');
  };



  const features = [
    {
      icon: <GiDeathSkull className="text-4xl text-red-500" />,
      title: "Survival Zombie",
      description:
        "Sobrevive en un mundo post-apocalíptico lleno de zombies y peligros",
    },
    {
      icon: <SiEthereum className="text-4xl text-blue-400" />,
      title: "Blockchain & NFTs",
      description:
        "Gana NFTs únicos como recompensas diarias y colecciona items raros",
    },
    {
      icon: <FaTrophy className="text-4xl text-yellow-500" />,
      title: "Sistema de Logros",
      description:
        "Desbloquea medallas y logros mientras progresas en el juego",
    },
    {
      icon: <FaUsers className="text-4xl text-green-500" />,
      title: "Multijugador",
      description: "Únete a otros supervivientes y forma alianzas estratégicas",
    },
  ];

  const nftRewards = [
    { name: "Arma Legendaria", rarity: "Legendario", color: "text-orange-500" },
    { name: "Armadura Épica", rarity: "Épico", color: "text-purple-500" },
    {
      name: "Medalla de Supervivencia",
      rarity: "Raro",
      color: "text-blue-500",
    },
    { name: "Kit de Supervivencia", rarity: "Común", color: "text-green-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-red-900 to-black text-white">
      <Navbar />

      {/* Hero Section */}
      <section
        id="home"
        className="relative h-screen flex items-center justify-center pt-16"
      >
        <AnimatedBackground />

        <div
          className={`text-center z-10 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="mb-8">
            <h1 className="text-8xl font-bold mb-4 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              MEDABOT
            </h1>
            <div className="flex items-center justify-center space-x-4 mb-6">
              <FaBolt className="text-yellow-500 text-2xl animate-pulse" />
              <h2 className="text-3xl font-semibold text-gray-300">
                SURVIVAL APOCALYPSE
              </h2>
              <FaBolt className="text-yellow-500 text-2xl animate-pulse" />
            </div>
          </div>

          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Sumérgete en un mundo post-apocalíptico donde cada decisión cuenta.
            Sobrevive, lucha y gana NFTs únicos en el primer juego survival con
            blockchain.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleGetStarted}
              className="group bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
            >
              <FaPlay className="group-hover:animate-bounce" />
              <span>JUGAR AHORA</span>
            </button>

            <button 
              onClick={() => navigate('/register')}
              className="border-2 border-gray-500 hover:border-white hover:bg-white hover:text-black px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105"
            >
              CREAR CUENTA
            </button>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-8 max-w-md mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">10K+</div>
              <div className="text-sm text-gray-400">Jugadores</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">500+</div>
              <div className="text-sm text-gray-400">NFTs Únicos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">24/7</div>
              <div className="text-sm text-gray-400">Servidores</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate__animated animate__bounce animate__infinite">
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent animate__animated animate__fadeInDown">
            CARACTERÍSTICAS ÉPICAS
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gradient-to-b from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 hover:border-red-500 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20 animate__animated animate__fadeInUp"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-center mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-center text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NFT Rewards Section */}
      <section
        id="nfts"
        className="py-20 px-4 bg-gradient-to-r from-gray-900 to-black"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent animate__animated animate__fadeInDown">
              RECOMPENSAS NFT DIARIAS
            </h2>
            <p className="text-xl text-gray-300 animate__animated animate__fadeInUp animate__delay-1s">
              Gana NFTs únicos cada día que juegas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {nftRewards.map((nft, index) => (
              <div
                key={index}
                className="bg-gradient-to-b from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 hover:border-purple-500 transition-all duration-300 transform hover:scale-105 animate__animated animate__zoomIn"
                style={{ animationDelay: `${index * 0.3}s` }}
              >
                <div className="flex justify-center mb-4">
                  <FaGem className={`text-4xl ${nft.color}`} />
                </div>
                <h3 className="text-lg font-bold text-center mb-2">
                  {nft.name}
                </h3>
                <div
                  className={`text-center text-sm font-semibold ${nft.color}`}
                >
                  {nft.rarity}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 animate__animated animate__fadeInUp animate__delay-2s">
            <div className="flex justify-center items-center space-x-4 mb-4">
              <SiEthereum className="text-3xl text-blue-400 animate__animated animate__pulse animate__infinite" />
              <span className="text-xl">Powered by</span>
              <SiPolygon className="text-3xl text-purple-500 animate__animated animate__pulse animate__infinite" />
            </div>
            <p className="text-gray-400">
              Blockchain seguro y transacciones rápidas
            </p>
          </div>
        </div>
      </section>

      {/* Gameplay Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent animate__animated animate__fadeInDown">
            GAMEPLAY INTENSO
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate__animated animate__fadeInLeft">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <GiPistolGun className="text-3xl text-red-500 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold mb-2">Combate Táctico</h3>
                    <p className="text-gray-400">
                      Sistema de combate avanzado con múltiples armas y
                      estrategias
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <GiChestArmor className="text-3xl text-blue-500 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      Crafting & Upgrades
                    </h3>
                    <p className="text-gray-400">
                      Crea y mejora tu equipo para sobrevivir más tiempo
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <GiTreasureMap className="text-3xl text-yellow-500 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold mb-2">Exploración</h3>
                    <p className="text-gray-400">
                      Explora un mundo abierto lleno de secretos y tesoros
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl border border-gray-700 animate__animated animate__fadeInRight">
              <div className="text-center">
                <FaGamepad className="text-6xl text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-4">
                  ¿Listo para el Desafío?
                </h3>
                <p className="text-gray-400 mb-6">
                  Únete a miles de jugadores en la experiencia survival más
                  intensa
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleGetStarted}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-8 py-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-105"
                  >
                    COMENZAR AVENTURA
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="border-2 border-green-500 hover:bg-green-500 hover:text-black px-8 py-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-105"
                  >
                    CREAR CUENTA
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="community" className="bg-black py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 animate__animated animate__fadeInUp">
            <h3 className="text-3xl font-bold mb-4">MEDABOT</h3>
            <p className="text-gray-400 mb-6">
              El futuro del gaming blockchain está aquí
            </p>

            <div className="flex justify-center space-x-6">
              <a
                href="#"
                className="text-blue-500 hover:text-blue-400 transition-all duration-300 transform hover:scale-125 animate__animated animate__bounceIn animate__delay-1s"
              >
                <FaDiscord className="text-2xl" />
              </a>
              <a
                href="#"
                className="text-blue-400 hover:text-blue-300 transition-all duration-300 transform hover:scale-125 animate__animated animate__bounceIn animate__delay-2s"
              >
                <FaTwitter className="text-2xl" />
              </a>
              <a
                href="#"
                className="text-blue-500 hover:text-blue-400 transition-all duration-300 transform hover:scale-125 animate__animated animate__bounceIn animate__delay-3s"
              >
                <FaTelegram className="text-2xl" />
              </a>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
            <p>&copy; 2024 Medabot Game. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
