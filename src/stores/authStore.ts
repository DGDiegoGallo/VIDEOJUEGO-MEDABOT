import { create } from 'zustand';
import CryptoJS from 'crypto-js';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { User } from '@/types/user';
import type { LoginCredentials, RegisterData } from '@/types/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<{ pin: string; walletAddress: string } | null>;
  logout: () => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    immer((set) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          // Import API client dynamically to avoid circular dependency
          const { apiClient } = await import('@/utils/api');
          const response = await apiClient.login(credentials);

          const userData = {
            id: response.user.id.toString(),
            username: response.user.username,
            email: response.user.email,
            createdAt: response.user.createdAt,
            updatedAt: response.user.updatedAt,
          };

          // Save to localStorage first
          localStorage.setItem('user-data', JSON.stringify(userData));
          localStorage.setItem('auth-token', response.jwt);

          set((state) => {
            state.token = response.jwt;
            state.user = userData;
            state.isAuthenticated = true;
            state.isLoading = false;
          });
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Login failed';
            state.isLoading = false;
          });
        }
      },

      register: async (data: RegisterData): Promise<{ pin: string; walletAddress: string } | null> => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          try {
            const { apiClient } = await import('@/utils/api');
            const response = await apiClient.register(data);

            // Generate wallet for new user
            const [{ ethers }, { v4: uuidv4 }] = await Promise.all([
              import('ethers'),
              import('uuid'),
            ]);
            const pin = Math.floor(1000 + Math.random() * 9000).toString();
            const wallet = ethers.Wallet.createRandom();

            const walletData: import('@/components/crypto/WalletSetupModal').CreatedWallet = {
              id: uuidv4(),
              address: wallet.address,
              usdt_balance: 0,
              pin_hash: CryptoJS.SHA256(pin).toString(),
              encrypted_data: {
                private_key: wallet.privateKey,
                mnemonic: wallet.mnemonic?.phrase || '',
                public_key: wallet.publicKey,
              },

              transaction_history: [],
              created_at: new Date().toISOString(),
              last_access: new Date().toISOString(),
              is_active: true,
            };

            let createdWalletId: string | null = null;
            let createdWalletResponse: any = null;
            
            try {
              const walletResponse = await apiClient.createWallet(walletData, response.user.id.toString());
              console.log('🔍 Full wallet response:', JSON.stringify(walletResponse, null, 2));
              
              // Try different ways to get the wallet ID
              createdWalletId = walletResponse?.data?.id?.toString() || 
                               walletResponse?.id?.toString() || 
                               null;
              
              createdWalletResponse = walletResponse;
              console.log('✅ Wallet created successfully with ID:', createdWalletId);
              console.log('🔍 Wallet response data structure:', walletResponse?.data);
            } catch (walletErr) {
              console.error('❌ Error creating wallet:', walletErr);
              // Continue without blocking registration
            }

            // Create registration achievement NFT if wallet was created successfully
            let createdNFTId: string | null = null;
            if (createdWalletId) {
              try {
                const { createRegistrationAchievementNFTData } = await import('@/utils/registrationAchievementNFT');
                const registrationNFTData = createRegistrationAchievementNFTData(
                  wallet.address,
                  response.user.username
                );
                
                console.log('🎖️ Creating registration achievement NFT for wallet ID:', createdWalletId);
                console.log('🎖️ Wallet address for NFT:', wallet.address);
                console.log('🎖️ Username for NFT:', response.user.username);
                
                const nftResponse = await apiClient.createRegistrationAchievementNFT(registrationNFTData, createdWalletId);
                console.log('✅ Registration achievement NFT created and linked to wallet successfully');
                
                createdNFTId = nftResponse?.data?.id?.toString() || null;
                console.log('🎨 Created NFT ID:', createdNFTId);
                
                // Update wallet to include the NFT relationship
                if (createdNFTId && createdWalletResponse?.data?.id) {
                  try {
                    console.log('🔄 Updating wallet to include NFT relationship');
                    await apiClient.update('/user-wallets', createdWalletResponse.data.id, {
                      user_nfts: [parseInt(createdNFTId, 10)]
                    });
                    console.log('✅ Wallet updated with NFT relationship');
                  } catch (updateErr) {
                    console.error('❌ Error updating wallet with NFT relationship:', updateErr);
                  }
                }
                
                // Create initial game session after NFT creation
                if (createdNFTId) {
                  try {
                    const { createInitialGameSession } = await import('@/utils/initialGameSession');
                    
                    // Get the created NFT ID
                    const nftId = parseInt(createdNFTId, 10);
                    
                    // Create initial game session
                    await createInitialGameSession(
                      response.user.id,
                      response.user.username,
                      nftId
                    );
                    
                  } catch (sessionErr) {
                    console.error('❌ Error creating initial game session:', sessionErr);
                    console.error('❌ Failed for user ID:', response.user.id);
                    console.error('❌ Failed for NFT ID:', createdNFTId);
                    // Continue without blocking registration - session creation is optional
                  }
                } else {
                  console.warn('⚠️ Skipping initial game session creation - NFT ID not available');
                }
                
              } catch (nftErr) {
                console.error('❌ Error creating registration achievement NFT:', nftErr);
                console.error('❌ Failed for wallet ID:', createdWalletId);
                console.error('❌ Failed for wallet address:', wallet.address);
                // Continue without blocking registration - NFT creation is optional
              }
            } else {
              console.warn('⚠️ Skipping registration achievement NFT creation - wallet ID not available');
            }

            const userData = {
              id: response.user.id.toString(),
              username: response.user.username,
              email: response.user.email,
              createdAt: response.user.createdAt,
              updatedAt: response.user.updatedAt,
            };

            localStorage.setItem('user-data', JSON.stringify(userData));
            localStorage.setItem('auth-token', response.jwt);

            set((state) => {
              state.token = response.jwt;
              state.user = userData;
              state.isAuthenticated = true;
              state.isLoading = false;
            });

            // Assign result to return later
            const result = { pin, walletAddress: wallet.address };
            return result;
          } catch (error) {
            // On error return null
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Registration failed';
              state.isLoading = false;
            });
            return null;
          }
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Registration failed';
            state.isLoading = false;
          });
          return null;
        }
      },

      logout: () => {
        set((state) => {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          state.error = null;
        });
      },

      clearError: () => {
        set((state) => {
          state.error = null;
        });
      },

      setLoading: (loading: boolean) => {
        set((state) => {
          state.isLoading = loading;
        });
      },
    })),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);