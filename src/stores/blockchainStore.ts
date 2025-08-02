import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { ethers } from 'ethers';
import { MetaMaskSDK } from '@metamask/sdk';
import type { NFTData, BlockchainTransaction, WalletConnection } from '@/types/blockchain';

interface BlockchainState {
  wallet: WalletConnection | null;
  userNFTs: NFTData[];
  transactions: BlockchainTransaction[];
  isConnecting: boolean;
  isLoading: boolean;
  error: string | null;
}

interface BlockchainActions {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  mintNFT: (achievementId: string, metadata: any) => Promise<void>;
  loadUserNFTs: (userAddress: string) => Promise<void>;
  transferNFT: (nftId: string, toAddress: string) => Promise<void>;
  clearError: () => void;
}

const MetaMaskSDKInstance = new MetaMaskSDK({
  dappMetadata: {
    name: "Medabot Game",
    url: window.location.origin,
  }
});

export const useBlockchainStore = create<BlockchainState & BlockchainActions>()(
  immer((set, get) => ({
    // State
    wallet: null,
    userNFTs: [],
    transactions: [],
    isConnecting: false,
    isLoading: false,
    error: null,

    // Actions
    connectWallet: async () => {
      set((state) => {
        state.isConnecting = true;
        state.error = null;
      });

      try {
        const ethereum = MetaMaskSDKInstance.getProvider();
        
        if (!ethereum) {
          throw new Error('MetaMask not installed');
        }

        // Request account access
        const accounts = await ethereum.request({
          method: 'eth_requestAccounts',
        }) as string[];

        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts found');
        }

        // Get network info
        const chainId = await ethereum.request({
          method: 'eth_chainId',
        }) as string;

        const provider = new ethers.BrowserProvider(ethereum);

        set((state) => {
          state.wallet = {
            address: accounts[0],
            chainId: parseInt(chainId, 16),
            isConnected: true,
            provider: provider,
          };
          state.isConnecting = false;
        });

        // Load user's NFTs
        await get().loadUserNFTs(accounts[0]);

      } catch (error) {
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Failed to connect wallet';
          state.isConnecting = false;
        });
      }
    },

    disconnectWallet: () => {
      set((state) => {
        state.wallet = null;
        state.userNFTs = [];
        state.transactions = [];
      });
    },

    mintNFT: async (achievementId: string, metadata: any) => {
      const { wallet } = get();
      
      if (!wallet?.isConnected) {
        throw new Error('Wallet not connected');
      }

      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        // TODO: Implement actual NFT minting logic
        // This would involve calling a smart contract
        console.log('Minting NFT for achievement:', achievementId, metadata);

        // Create transaction record
        const transaction: BlockchainTransaction = {
          id: Date.now().toString(),
          userId: '', // Will be set from auth store
          type: 'mint',
          toAddress: wallet.address,
          transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          state.transactions.push(transaction);
        });

        // Simulate minting process
        setTimeout(() => {
          const newNFT: NFTData = {
            id: Date.now().toString(),
            tokenId: Math.floor(Math.random() * 10000).toString(),
            contractAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
            name: metadata.name,
            description: metadata.description,
            image: metadata.image,
            attributes: metadata.attributes || [],
            rarity: metadata.rarity || 'common',
            mintedAt: new Date().toISOString(),
            owner: wallet.address,
            transactionHash: transaction.transactionHash,
          };

          set((state) => {
            state.userNFTs.push(newNFT);
            const txIndex = state.transactions.findIndex(tx => tx.id === transaction.id);
            if (txIndex !== -1) {
              state.transactions[txIndex].status = 'confirmed';
              state.transactions[txIndex].confirmedAt = new Date().toISOString();
              state.transactions[txIndex].nftId = newNFT.id;
            }
            state.isLoading = false;
          });

          // TODO: Save NFT data to Strapi
        }, 3000);

      } catch (error) {
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Failed to mint NFT';
          state.isLoading = false;
        });
      }
    },

    loadUserNFTs: async (userAddress: string) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        // TODO: Load NFTs from Strapi and/or blockchain
        console.log('Loading NFTs for address:', userAddress);
        
        // Mock data for now
        const mockNFTs: NFTData[] = [];

        set((state) => {
          state.userNFTs = mockNFTs;
          state.isLoading = false;
        });

      } catch (error) {
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Failed to load NFTs';
          state.isLoading = false;
        });
      }
    },

    transferNFT: async (nftId: string, toAddress: string) => {
      const { wallet } = get();
      
      if (!wallet?.isConnected) {
        throw new Error('Wallet not connected');
      }

      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        // TODO: Implement NFT transfer logic
        console.log('Transferring NFT:', nftId, 'to:', toAddress);

        const transaction: BlockchainTransaction = {
          id: Date.now().toString(),
          userId: '', // Will be set from auth store
          type: 'transfer',
          nftId,
          fromAddress: wallet.address,
          toAddress,
          transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          state.transactions.push(transaction);
          state.isLoading = false;
        });

      } catch (error) {
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Failed to transfer NFT';
          state.isLoading = false;
        });
      }
    },

    clearError: () => {
      set((state) => {
        state.error = null;
      });
    },
  }))
);