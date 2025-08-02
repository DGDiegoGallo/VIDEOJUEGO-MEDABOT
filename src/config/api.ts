export const API_CONFIG = {
  STRAPI_URL: 'http://localhost:1337',
  BLOCKCHAIN_NETWORK: 'sepolia',
  NFT_CONTRACT_ADDRESS: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/local',
      REGISTER: '/auth/local/register',
      ME: '/users/me'
    },
    GAME: {
      USER_DATA: '/user-game-datas',
      CHALLENGES: '/challenges',
      MISSIONS: '/missions',
      ACHIEVEMENTS: '/achievements',
      SESSIONS: '/game-sessions'
    },
    BLOCKCHAIN: {
      NFTS: '/nfts',
      TRANSACTIONS: '/blockchain-transactions'
    },
    WALLET: {
      USER_WALLETS: '/user-wallets',
      USER_NFTS: '/user-nfts'
    }
  }
};