import React, { useEffect, useState } from 'react';
import { userWalletService, UserWallet } from '@/services/userWallet.service';
import { useAuthStore } from '@/stores/authStore';
import { WalletPinModal } from './WalletPinModal';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

export const WalletView: React.FC = () => {
  const { user } = useAuthStore();
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [locked, setLocked] = useState(true);
  const [error, setError] = useState('');

  // Verify pin and fetch wallet
  const handleVerifyPin = async (pin: string) => {
    try {
      if (!user) return;
      const fetchedWallet = await userWalletService.getUserWallet(parseInt(user.id));
      if (!fetchedWallet) {
        setError('No se encontró wallet.');
        return;
      }
      const isValid = userWalletService.verifyPin(pin, fetchedWallet.pin_hash);
      if (!isValid) {
        setError('PIN incorrecto');
        return;
      }
      setWallet(fetchedWallet);
      setLocked(false);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Error al verificar PIN');
    }
  };

  useEffect(() => {
    // When component mounts, ensure it's locked
    setLocked(true);
  }, [user]);

  if (locked) {
    return (
      <>
        <WalletPinModal onVerify={handleVerifyPin} onClose={() => setLocked(false)} />
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto bg-gray-800/70 rounded-lg p-6 text-white backdrop-blur-md">
      <h2 className="text-3xl font-bold mb-6 text-center">Mi Wallet</h2>

      {/* Balance */}
      <div className="bg-gray-900/60 p-6 rounded-lg flex flex-col md:flex-row items-center justify-between mb-8">
        <div>
          <p className="text-sm text-gray-400">Balance USDT</p>
          <h3 className="text-4xl font-bold">{wallet?.usdt_balance ?? 0} <span className="text-lg">USDT</span></h3>
        </div>
        <button className="mt-4 md:mt-0 bg-green-600 hover:bg-green-500 px-6 py-3 rounded-md font-semibold">Depositar</button>
      </div>

      {/* Transactions */}
      <h3 className="text-xl font-semibold mb-4">Historial de Transacciones</h3>
      {wallet?.transaction_history?.length ? (
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-sm text-left">
            <thead className="sticky top-0 bg-gray-900">
              <tr>
                <th className="px-4 py-2">Tipo</th>
                <th className="px-4 py-2">Monto</th>
                <th className="px-4 py-2">Fecha</th>
                <th className="px-4 py-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {wallet.transaction_history.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-700 hover:bg-gray-700/40">
                  <td className="px-4 py-2 flex items-center gap-2">
                    {tx.type === 'buy' ? <FaArrowDown className="text-green-500" /> : <FaArrowUp className="text-yellow-500" />}
                    {tx.type}
                  </td>
                  <td className="px-4 py-2">{tx.amount} USDT</td>
                  <td className="px-4 py-2">{new Date(tx.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-2 capitalize">{tx.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-400">No hay transacciones.</p>
      )}
    </div>
  );
};
