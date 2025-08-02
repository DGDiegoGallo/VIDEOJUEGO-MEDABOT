import type { NetworkType, ListingStatus } from './api';

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: string;
}

export interface NFTMetadata {
  name: string;
  description: string;
  icon_name: string;
  rarity: NFTRarity;
  attributes: NFTAttribute[];
  achievement_type?: string;
  earned_date?: string;
  [key: string]: any;
}

export type NFTRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface BaseNFTData {
  token_id: string;
  contract_address: string;
  token_uri: string;
  metadata: NFTMetadata;
  network: NetworkType;
  owner_address: string;
  is_listed_for_sale: ListingStatus;
  listing_price_eth: number;
  minted_at: string;
  last_transfer_at: string;
}

export interface UserNFT extends BaseNFTData {
  id: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  user_wallet: {
    id: number;
    documentId: string;
    wallet_address: string;
  };
}

export interface AchievementNFT extends BaseNFTData {
  metadata: NFTMetadata & {
    achievement_type: string;
    earned_date: string;
  };
}

export interface GameItemNFT extends BaseNFTData {
  metadata: NFTMetadata & {
    item_type: 'weapon' | 'armor' | 'accessory';
    stats: {
      attack?: number;
      defense?: number;
      speed?: number;
    };
  };
}