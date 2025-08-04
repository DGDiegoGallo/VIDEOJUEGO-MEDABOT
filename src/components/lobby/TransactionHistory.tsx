import React from 'react';
import { FaArrowUp, FaArrowDown, FaClock, FaCheckCircle, FaTimes, FaSpinner } from 'react-icons/fa';
import { WalletTransaction } from '@/services/userWallet.service';

interface TransactionHistoryProps {
  transactions: WalletTransaction[];
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="text-green-400" />;
      case 'pending':
        return <FaSpinner className="text-yellow-400 animate-spin" />;
      case 'failed':
        return <FaTimes className="text-red-400" />;
      default:
        return <FaClock className="text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return <FaArrowDown className="text-green-500" />;
      case 'transfer':
        return <FaArrowUp className="text-blue-500" />;
      default:
        return <FaArrowUp className="text-gray-500" />;
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number) => {
    const isPositive = amount > 0;
    return (
      <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
        {isPositive ? '+' : ''}{amount} USDT
      </span>
    );
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaClock className="text-gray-400 text-2xl" />
        </div>
        <h3 className="text-white font-semibold mb-2">No hay transacciones</h3>
        <p className="text-gray-400 text-sm">
          Realiza tu primera compra de USDT para ver el historial aquí
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Historial de Transacciones</h3>
        <span className="text-gray-400 text-sm">
          {transactions.length} transacción{transactions.length !== 1 ? 'es' : ''}
        </span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {transactions.map((tx, index) => (
          <div
            key={tx.id}
            className="transaction-card rounded-lg p-4 animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(tx.type)}
                  <div>
                    <div className="text-white font-semibold capitalize">
                      {tx.type === 'buy' ? 'Compra' : 'Transferencia'}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {formatDate(tx.timestamp)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold">
                  {formatAmount(tx.amount)}
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <span className={`${getStatusColor(tx.status)}`}>
                    {getStatusIcon(tx.status)}
                  </span>
                  <span className={`capitalize ${getStatusColor(tx.status)}`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Detalles adicionales solo si es necesario */}
            {(tx.network || tx.fee || tx.dollar_amount) && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {tx.network && (
                    <div>
                      <span className="text-gray-400">Red:</span>
                      <span className="text-white ml-2">{tx.network}</span>
                    </div>
                  )}
                  {tx.fee && tx.fee > 0 && (
                    <div>
                      <span className="text-gray-400">Comisión:</span>
                      <span className="text-white ml-2">{tx.fee} USDT</span>
                    </div>
                  )}
                  {tx.dollar_amount && (
                    <div>
                      <span className="text-gray-400">Monto USD:</span>
                      <span className="text-white ml-2">${tx.dollar_amount}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}; 