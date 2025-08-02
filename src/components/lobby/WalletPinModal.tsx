import React, { useState } from 'react';

interface Props {
  onVerify: (pin: string) => void;
  onClose: () => void;
}

export const WalletPinModal: React.FC<Props> = ({ onVerify, onClose }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (pin.length !== 4) {
      setError('El PIN debe tener 4 dígitos');
      return;
    }
    setError('');
    onVerify(pin);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-800 w-full max-w-sm p-6 rounded-lg shadow-xl text-white">
        <h3 className="text-xl font-semibold mb-4 text-center">Ingresa tu PIN</h3>
        <input
          type="password"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded-md bg-gray-700 focus:outline-none text-center text-xl tracking-widest"
        />
        {error && <p className="text-red-500 text-sm mb-2 text-center">{error}</p>}
        <div className="flex justify-between gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-gray-600 hover:bg-gray-500 rounded-md"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 rounded-md"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};
