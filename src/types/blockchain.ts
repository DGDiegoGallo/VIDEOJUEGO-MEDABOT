export interface NFTData {
  id: string;
  tokenId: string;
  contractAddress: string;
  name: string;
  description: string;
  image: string;
  attributes: NFTAttribute[];
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  mintedAt: string;
  owner: string;
  transactionHash: string;
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: string;
}

export interface BlockchainTransaction {
  id: string;
  userId: string;
  type: 'mint' | 'transfer' | 'trade';
  nftId?: string;
  fromAddress?: string;
  toAddress: string;
  transactionHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  gasUsed?: string;
  gasPrice?: string;
  createdAt: string;
  confirmedAt?: string;
}

export interface WalletConnection {
  address: string;
  chainId: number;
  isConnected: boolean;
  provider: any;
}