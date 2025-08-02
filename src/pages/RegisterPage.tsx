import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RegisterForm } from "@/components/RegisterForm";
import { RegistrationSuccessModal } from "@/components/crypto/RegistrationSuccessModal";
import { useAuthStore } from "@/stores/authStore";
import type { RegisterData } from "@/types/api";
import { FaArrowLeft } from "react-icons/fa";

export const RegisterPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [generatedPin, setGeneratedPin] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/login");
  };

  const handleRegister = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await register(data);
      if (result) {
        setGeneratedPin(result.pin);
        setWalletAddress(result.walletAddress);
        setShowModal(true);
      }
      // Removido: navigate('/lobby') - ya no navega automáticamente
    } catch (err) {
      console.error("Register error:", err);
      setError(err instanceof Error ? err.message : "Error de registro");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="absolute top-6 left-6 flex items-center space-x-2 text-gray-300 hover:text-white transition-colors z-10"
      >
        <FaArrowLeft />
        <span>Volver</span>
      </button>

      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4 tracking-wide">
          MEDABOT GAME
        </h1>
        <p className="text-xl text-gray-300 mb-12">
          Crea tu cuenta para comenzar
        </p>

        <RegisterForm
          onSubmit={handleRegister}
          loading={isLoading}
          error={error}
          onClearError={() => setError(null)}
        />

        <p className="mt-6 text-gray-400">
          ¿Ya tienes cuenta?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-blue-400 hover:underline"
          >
            Inicia sesión
          </button>
        </p>
      </div>

      {/* Success Modal */}
      <RegistrationSuccessModal
        isOpen={showModal}
        pin={generatedPin}
        walletAddress={walletAddress}
        onContinue={() => {
          setShowModal(false);
          navigate("/lobby");
        }}
      />
    </div>
  );
};
