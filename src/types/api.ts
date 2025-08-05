export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiEntity<T> {
  id: number;
  attributes: T & {
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  documentoID: string;
}

export interface AuthResponse {
  jwt: string;
  user: {
    id: number;
    username: string;
    email: string;
    confirmed: boolean;
    blocked: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export type NetworkType = 
  | 'ethereum-mainnet'
  | 'ethereum-goerli'
  | 'polygon-mainnet'
  | 'polygon-mumbai'
  | 'binance-smart-chain'
  | 'bnb-testnet'
  | 'arbitrum-one'
  | 'arbitrum-goerli'
  | 'optimism-mainnet'
  | 'optimism-goerli'
  | 'avalanche-c'
  | 'fantom-mainnet'
  | 'base-mainnet'
  | 'base-goerli'
  | 'zkSync-era'
  | 'linea-mainnet'
  | 'scroll-mainnet'
  | 'aurora-mainnet'
  | 'solana-mainnet'
  | 'solana-devnet';

export type ListingStatus = 'True' | 'False';

export interface RegistrationAchievementNFT {
  id: string;
  user_wallet: string | number;
  token_id: string;
  contract_address: string;
  token_uri: string;
  metadata: {
    name: string;
    description: string;
    icon_name: string; // React icon name
    achievement_type: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    attributes: Array<{
      trait_type: string;
      value: string | number;
    }>;
  };
  network: NetworkType;
  owner_address: string;
  is_listed_for_sale: ListingStatus;
  listing_price_eth: number;
  minted_at: string;
  last_transfer_at: string;
}

export interface ApiError {
  error: {
    status: number;
    name: string;
    message: string;
    details?: any;
  };
}