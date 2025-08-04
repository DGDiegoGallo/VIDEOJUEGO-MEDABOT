import React, { useEffect, useState } from 'react';
import { userWalletService, UserWallet } from '@/services/userWallet.service';
import { useAuthStore } from '@/stores/authStore';
import { WalletPinModal } from './WalletPinModal';
import { BuyUSDTModal } from './BuyUSDTModal';
import { TransactionHistory } from './TransactionHistory';
import { FaArrowUp, FaArrowDown, FaPlus, FaWallet, FaCopy } from 'react-icons/fa';

export const WalletView: React.FC = () => {
  const { user } = useAuthStore();
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [locked, setLocked] = useState(true);
  const [error, setError] = useState('');
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleBuySuccess = (amount: number) => {
    // Actualizar el balance localmente
    if (wallet) {
      setWallet({
        ...wallet,
        usdt_balance: wallet.usdt_balance + amount
      });
    }
    setShowBuyModal(false);
  };

  const copyWalletAddress = async () => {
    if (wallet?.wallet_address) {
      try {
        await navigator.clipboard.writeText(wallet.wallet_address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Error copying to clipboard:', err);
      }
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
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-center text-white">Mi Wallet</h2>

      {/* Wallet Info Card */}
      <div className="bg-gray-800/70 rounded-lg p-6 text-white backdrop-blur-md border border-gray-700">
        {/* Wallet Address */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <FaWallet className="text-blue-400" />
            <h3 className="text-lg font-semibold">Wallet ID</h3>
          </div>
          <div className="flex items-center space-x-3 bg-gray-900/50 rounded-lg p-3">
            <code className="text-sm font-mono text-gray-300 flex-1">
              {wallet?.wallet_address || 'Cargando...'}
            </code>
            <button
              onClick={copyWalletAddress}
              className="text-blue-400 hover:text-blue-300 transition-colors"
              title="Copiar dirección"
            >
              <FaCopy className={copied ? 'text-green-400' : ''} />
            </button>
          </div>
          {copied && (
            <p className="text-green-400 text-sm mt-2">¡Dirección copiada!</p>
          )}
        </div>

        {/* Balance */}
        <div className="bg-gray-900/60 p-6 rounded-lg flex flex-col md:flex-row items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-400">Balance USDT</p>
            <h3 className="text-4xl font-bold">{wallet?.usdt_balance ?? 0} <span className="text-lg">USDT</span></h3>
          </div>
          <button 
            onClick={() => setShowBuyModal(true)}
            className="mt-4 md:mt-0 btn-gradient px-6 py-3 rounded-md font-semibold flex items-center space-x-2"
          >
            <FaPlus />
            <span>Comprar USDT</span>
          </button>
        </div>

        {/* Transactions */}
        <TransactionHistory transactions={wallet?.transaction_history || []} />
      </div>

      {/* Buy USDT Modal */}
      <BuyUSDTModal
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        onSuccess={handleBuySuccess}
      />
    </div>
  );
};
