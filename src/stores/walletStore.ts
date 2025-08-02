import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { CreatedWallet } from '@/components/crypto/WalletSetupModal';

interface WalletState {
  wallet: CreatedWallet | null;
  isLoading: boolean;
  error: string | null;
}

interface WalletActions {
  setWallet: (wallet: CreatedWallet) => void;
  saveWalletToStrapi: (wallet: CreatedWallet, userId: string) => Promise<void>;
  clearError: () => void;
}

export const useWalletStore = create<WalletState & WalletActions>()(
  persist(
    immer((set) => ({
      wallet: null,
      isLoading: false,
      error: null,

      setWallet: (wallet: CreatedWallet) => {
        set((state) => {
          state.wallet = wallet;
        });
      },

      saveWalletToStrapi: async (wallet: CreatedWallet, userId: string) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });
        try {
          const { apiClient } = await import('@/utils/api');
          await apiClient.createWallet(wallet, userId);
          set((state) => {
            state.wallet = wallet;
            state.isLoading = false;
          });
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Wallet save failed';
            state.isLoading = false;
          });
        }
      },

      clearError: () => {
        set((state) => {
          state.error = null;
        });
      },
    })),
    {
      name: 'wallet-storage',
      partialize: (state) => ({ wallet: state.wallet }),
    }
  )
);
