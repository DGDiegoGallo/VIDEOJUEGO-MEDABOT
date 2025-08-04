import axios, { AxiosInstance } from 'axios';
import type { CreatedWallet } from '@/components/crypto/WalletSetupModal';
import type { StrapiResponse, StrapiEntity, AuthResponse, LoginCredentials, RegisterData } from '@/types/api';
import { API_CONFIG } from '@/config/api';

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.STRAPI_URL;
    
    this.client = axios.create({
      baseURL: `${this.baseURL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth-storage');
      if (token && token !== '""' && token !== '""' && !(config.url?.startsWith('/auth'))) {
        try {
          const authData = JSON.parse(token);
          if (authData.state?.token) {
            config.headers.Authorization = `Bearer ${authData.state.token}`;
          }
        } catch (error) {
          console.error('Error parsing auth token:', error);
        }
      }
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('auth-storage');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Login via Strapi auth/local endpoint
    const { email, password } = credentials;
    const response = await this.client.post<AuthResponse>('/auth/local', {
      identifier: email,
      password,
    });

    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/local/register', {
      username: data.username,
      email: data.email,
      password: data.password,
    });
    return response.data;
  }

  async getMe(): Promise<any> {
    const response = await this.client.get(API_CONFIG.ENDPOINTS.AUTH.ME);
    return response.data;
  }

  // Generic CRUD operations
  async get<T>(endpoint: string, params?: any): Promise<StrapiResponse<T>> {
    const response = await this.client.get<StrapiResponse<T>>(endpoint, { params });
    return response.data;
  }

  async getById<T>(endpoint: string, id: string | number): Promise<StrapiResponse<StrapiEntity<T>>> {
    const response = await this.client.get<StrapiResponse<StrapiEntity<T>>>(`${endpoint}/${id}`);
    return response.data;
  }

  async create<T>(endpoint: string, data: any): Promise<StrapiResponse<StrapiEntity<T>>> {
    const response = await this.client.post<StrapiResponse<StrapiEntity<T>>>(endpoint, { data });
    return response.data;
  }

  async update<T>(endpoint: string, id: string | number, data: any): Promise<StrapiResponse<StrapiEntity<T>>> {
    const response = await this.client.put<StrapiResponse<StrapiEntity<T>>>(`${endpoint}/${id}`, { data });
    return response.data;
  }

  async delete(endpoint: string, id: string | number): Promise<void> {
    await this.client.delete(`${endpoint}/${id}`);
  }

  // Wallet specific
  async createWallet(wallet: CreatedWallet, userId: string | number): Promise<any> {
    // Strapi v4 collection type 'user-wallets'
    const payload = {
      data: {
        users_permissions_user: typeof userId === 'string' ? parseInt(userId, 10) : userId,
        wallet_address: wallet.address,
        usdt_balance: wallet.usdt_balance,
        pin_hash: wallet.pin_hash,
        encrypted_data: wallet.encrypted_data,
        transaction_history: wallet.transaction_history,
        is_active: wallet.is_active,
      },
    } as const;

    const response = await this.client.post(API_CONFIG.ENDPOINTS.WALLET.USER_WALLETS, payload);
    return response.data;
  }

  // NFT specific methods
  async createRegistrationAchievementNFT(nftData: import('@/types/api').RegistrationAchievementNFT, walletId: string | number): Promise<any> {
    console.log('🎖️ Creating registration achievement NFT for wallet ID:', walletId);
    console.log('🎖️ Wallet ID type:', typeof walletId);
    console.log('🎖️ NFT data before payload creation:', nftData);
    
    // Ensure walletId is a number for Strapi relation
    const walletIdNumber = typeof walletId === 'string' ? parseInt(walletId, 10) : walletId;
    
    if (isNaN(walletIdNumber) || walletIdNumber <= 0) {
      throw new Error(`Invalid wallet ID for NFT relation: ${walletId} (converted to: ${walletIdNumber})`);
    }
    
    console.log('🎖️ Using wallet ID for relation:', walletIdNumber);
    
    // Strapi v4 collection type 'user-nfts' - same pattern as wallet creation
    const payload = {
      data: {
        user_wallet: walletIdNumber, // Strapi relation to user-wallets collection
        token_id: nftData.token_id,
        contract_address: nftData.contract_address,
        token_uri: nftData.token_uri,
        metadata: nftData.metadata,
        network: nftData.network, // Strapi enumeration value
        owner_address: nftData.owner_address,
        is_listed_for_sale: nftData.is_listed_for_sale, // Strapi enumeration value ('True' or 'False')
        listing_price_eth: nftData.listing_price_eth,
        minted_at: nftData.minted_at,
        last_transfer_at: nftData.last_transfer_at,
      },
    } as const;

    console.log('🎖️ Registration achievement NFT payload:', JSON.stringify(payload, null, 2));
    console.log('🎖️ API endpoint:', API_CONFIG.ENDPOINTS.WALLET.USER_NFTS);
    
    try {
      const response = await this.client.post(API_CONFIG.ENDPOINTS.WALLET.USER_NFTS, payload);
      console.log('✅ Registration achievement NFT created successfully:', response.data);
      console.log('✅ NFT relation established with wallet ID:', walletIdNumber);
      console.log('✅ Created NFT ID:', response.data?.data?.id);
      console.log('✅ Full response structure:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('❌ Failed to create registration achievement NFT:', error);
      console.error('❌ Failed wallet ID:', walletIdNumber);
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as any;
        if (axiosError.response?.data) {
          console.error('❌ Strapi error details:', JSON.stringify(axiosError.response.data, null, 2));
        }
        if (axiosError.response?.status) {
          console.error('❌ HTTP status:', axiosError.response.status);
        }
      }
      throw error;
    }
  }

  // NFT specific methods (public endpoints)
  async createUserNFT(nftData: any): Promise<any> {
    const url = `${this.baseURL}/api${API_CONFIG.ENDPOINTS.WALLET.USER_NFTS}`;
    console.log('Creating NFT at URL:', url);
    console.log('NFT data:', nftData);
    
    // Create a request without auth headers for public endpoints
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: nftData })
    });

    console.log('NFT creation response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('NFT creation error:', errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  async getUserNFTs(userId: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/api${API_CONFIG.ENDPOINTS.WALLET.USER_NFTS}?filters[user_wallet][$eq]=${userId}&populate=*`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  }

  async getUserWallet(userId: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/api${API_CONFIG.ENDPOINTS.WALLET.USER_WALLETS}?filters[user_wallet][$eq]=${userId}&populate=*`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  }

  // Public wallet creation (no auth required)
  async createWalletPublic(walletData: any): Promise<any> {
    const url = `${this.baseURL}/api${API_CONFIG.ENDPOINTS.WALLET.USER_WALLETS}`;
    console.log('Creating wallet at URL:', url);
    console.log('Wallet data:', walletData);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: walletData })
    });

    console.log('Wallet creation response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Wallet creation error:', errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  // File upload
  async uploadFile(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('files', file);

    const response = await this.client.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }
}

export const apiClient = new ApiClient();