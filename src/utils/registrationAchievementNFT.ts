import { v4 as uuidv4 } from 'uuid';
import type { RegistrationAchievementNFT, NetworkType, ListingStatus } from '@/types/api';
import { API_CONFIG } from '@/config/api';

/**
 * Maps blockchain network names to Strapi enumeration values
 */
const NETWORK_MAPPING: Record<string, NetworkType> = {
  'sepolia': 'ethereum-goerli', // Map sepolia to closest equivalent
  'ethereum': 'ethereum-mainnet',
  'polygon': 'polygon-mainnet',
  'binance': 'binance-smart-chain',
  'arbitrum': 'arbitrum-one',
  'optimism': 'optimism-mainnet',
  'avalanche': 'avalanche-c',
  'fantom': 'fantom-mainnet',
  'base': 'base-mainnet',
  'solana': 'solana-mainnet'
};

/**
 * Creates a registration achievement NFT data structure
 * This NFT is awarded to users upon successful registration
 */
export function createRegistrationAchievementNFTData(
  walletAddress: string,
  username: string
): RegistrationAchievementNFT {
  const tokenId = `REG_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  const currentTimestamp = new Date().toISOString();

  // Map the configured network to Strapi enumeration
  const mappedNetwork: NetworkType = NETWORK_MAPPING[API_CONFIG.BLOCKCHAIN_NETWORK] || 'ethereum-goerli';
  const listingStatus: ListingStatus = 'False'; // Strapi enumeration value

  console.log('🎖️ Generating registration achievement NFT data for user:', username);
  console.log('🎖️ Wallet address:', walletAddress);
  console.log('🎖️ Token ID:', tokenId);
  console.log('🎖️ Mapped network:', mappedNetwork);
  console.log('🎖️ Listing status:', listingStatus);

  const nftData: RegistrationAchievementNFT = {
    id: uuidv4(),
    user_wallet: 0, // Will be set by the API call
    token_id: tokenId,
    contract_address: API_CONFIG.NFT_CONTRACT_ADDRESS,
    token_uri: `${API_CONFIG.STRAPI_URL}/api/nft-metadata/${tokenId}`,
    metadata: {
      name: 'Medabot Pioneer',
      description: `¡Bienvenido al mundo de Medabot, ${username}! Este NFT conmemora tu registro como pionero en nuestra plataforma de juegos.`,
      icon_name: 'FaTrophy', // React icon from react-icons/fa
      achievement_type: 'registration_achievement',
      rarity: 'common',
      attributes: [
        {
          trait_type: 'Achievement Type',
          value: 'Registration Pioneer'
        },
        {
          trait_type: 'Rarity',
          value: 'Common'
        },
        {
          trait_type: 'Earned Date',
          value: new Date().toLocaleDateString('es-ES')
        },
        {
          trait_type: 'Player',
          value: username
        }
      ]
    },
    network: mappedNetwork,
    owner_address: walletAddress,
    is_listed_for_sale: listingStatus,
    listing_price_eth: 0,
    minted_at: currentTimestamp,
    last_transfer_at: currentTimestamp
  };

  console.log('🎖️ Registration achievement NFT data generated:', nftData);
  return nftData;
}