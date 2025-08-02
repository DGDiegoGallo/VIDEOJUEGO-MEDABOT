import React, { useState } from 'react';
import { FaCopy, FaCheckCircle } from 'react-icons/fa';

interface RegistrationSuccessModalProps {
  isOpen: boolean;
  pin: string;
  walletAddress: string;
  onContinue: () => void;
}

export const RegistrationSuccessModal: React.FC<RegistrationSuccessModalProps> = ({
  isOpen,
  pin,
  walletAddress,
  onContinue,
}) => {
  const [confirmed, setConfirmed] = useState(false);
  if (!isOpen) return null;

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const truncateAddress = (address: string) => `${address.slice(0, 8)}...${address.slice(-6)}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-8">
        <div className="text-center space-y-6">
          <FaCheckCircle className="text-green-500 text-5xl mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">¡Tu wallet ha sido creada!</h2>
          <p className="text-gray-700 max-w-prose mx-auto">
            A continuación verás tu <span className="font-semibold">PIN de 4 dígitos</span> y la dirección de tu
            wallet. El PIN se mostrará <span className="font-semibold">una sola vez</span>. Anótalo y guárdalo en un
            lugar seguro. Sin él no podrás acceder a tu wallet en el futuro.
          </p>

          <div className="space-y-3 text-left">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PIN (guárdalo ahora)</label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 bg-gray-100 px-4 py-3 rounded border text-2xl font-mono tracking-widest text-gray-900">
                  {pin || '----'}
                </code>
                <button
                  onClick={() => copy(pin)}
                  className="p-2 text-gray-600 hover:text-gray-800"
                >
                  <FaCopy />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de Wallet</label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 bg-gray-100 px-3 py-2 rounded border text-sm break-all text-gray-900">
                  {truncateAddress(walletAddress) || '---'}
                </code>
                <button
                  onClick={() => copy(walletAddress)}
                  className="p-2 text-gray-600 hover:text-gray-800"
                >
                  <FaCopy />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 mt-4">
            <input
              type="checkbox"
              id="confirmPin"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="confirmPin" className="text-sm text-gray-700">
              Confirmo que he guardado mi PIN en un lugar seguro y entiendo que no volverá a mostrarse.
            </label>
          </div>

          <button
            onClick={onContinue}
            disabled={!confirmed}
            className="mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};
