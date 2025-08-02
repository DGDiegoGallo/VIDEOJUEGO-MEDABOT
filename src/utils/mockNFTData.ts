import type { UserNFT } from '@/types/nft';

// Datos de prueba para el marketplace de NFTs
export const mockMarketplaceNFTs: UserNFT[] = [
  {
    id: 1,
    documentId: "health_boost_medal_001",
    createdAt: "2025-07-28T14:30:15.123Z",
    updatedAt: "2025-07-28T14:30:15.123Z",
    publishedAt: "2025-07-28T14:30:15.140Z",
    token_id: "HEALTH_BOOST_1753725839828_1001",
    contract_address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    token_uri: "http://localhost:1337/api/nft-metadata/HEALTH_BOOST_1753725839828_1001",
    metadata: {
      name: "Medalla de Vitalidad",
      description: "Una medalla mística que fortalece la resistencia del portador. Aumenta la vida máxima en un 15%, permitiendo sobrevivir más tiempo en combate.",
      icon_name: "FaHeart",
      rarity: "common",
      achievement_type: "power_enhancement",
      attributes: [
        { trait_type: "Effect Type", value: "Health Boost" },
        { trait_type: "Rarity", value: "Common" },
        { trait_type: "Power Level", value: "+15% Health" },
        { trait_type: "Category", value: "Defensive" },
        { trait_type: "Minted Date", value: "28/7/2025" }
      ]
    },
    network: "ethereum-goerli",
    owner_address: "0x1A2B3C4D5E6F7890ABCDEF1234567890ABCDEF12",
    is_listed_for_sale: "True",
    listing_price_eth: 0.025,
    minted_at: "2025-07-28T14:30:15.000Z",
    last_transfer_at: "2025-07-28T14:30:15.000Z",
    user_wallet: {
      id: 72,
      documentId: "wallet_health_boost_owner",
      wallet_address: "0x1A2B3C4D5E6F7890ABCDEF1234567890ABCDEF12"
    }
  },
  {
    id: 2,
    documentId: "weapon_damage_medal_002",
    createdAt: "2025-07-27T16:45:22.456Z",
    updatedAt: "2025-07-27T16:45:22.456Z",
    publishedAt: "2025-07-27T16:45:22.470Z",
    token_id: "WEAPON_DMG_1753625839828_2002",
    contract_address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    token_uri: "http://localhost:1337/api/nft-metadata/WEAPON_DMG_1753625839828_2002",
    metadata: {
      name: "Medalla del Guerrero",
      description: "Forjada en los campos de batalla más intensos. Esta medalla otorga un 8% de daño adicional a todas las armas, convirtiendo cada golpe en más letal.",
      icon_name: "FaSword",
      rarity: "common",
      achievement_type: "power_enhancement",
      attributes: [
        { trait_type: "Effect Type", value: "Weapon Damage" },
        { trait_type: "Rarity", value: "Common" },
        { trait_type: "Power Level", value: "+8% Damage" },
        { trait_type: "Category", value: "Offensive" },
        { trait_type: "Minted Date", value: "27/7/2025" }
      ]
    },
    network: "ethereum-goerli",
    owner_address: "0x2B3C4D5E6F7890ABCDEF1234567890ABCDEF1234",
    is_listed_for_sale: "True",
    listing_price_eth: 0.032,
    minted_at: "2025-07-27T16:45:22.000Z",
    last_transfer_at: "2025-07-27T16:45:22.000Z",
    user_wallet: {
      id: 73,
      documentId: "wallet_weapon_damage_owner",
      wallet_address: "0x2B3C4D5E6F7890ABCDEF1234567890ABCDEF1234"
    }
  },
  {
    id: 3,
    documentId: "triple_shot_medal_003",
    createdAt: "2025-07-26T09:15:33.789Z",
    updatedAt: "2025-07-26T09:15:33.789Z",
    publishedAt: "2025-07-26T09:15:33.805Z",
    token_id: "TRIPLE_SHOT_1753525839828_3003",
    contract_address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    token_uri: "http://localhost:1337/api/nft-metadata/TRIPLE_SHOT_1753525839828_3003",
    metadata: {
      name: "Medalla del Tirador Maestro",
      description: "Una reliquia legendaria de los antiguos maestros del combate a distancia. Permite disparar 3 proyectiles simultáneamente, triplicando el poder de fuego en cada ataque.",
      icon_name: "FaBullseye",
      rarity: "legendary",
      achievement_type: "power_enhancement",
      attributes: [
        { trait_type: "Effect Type", value: "Multiple Projectiles" },
        { trait_type: "Rarity", value: "Legendary" },
        { trait_type: "Power Level", value: "x3 Projectiles" },
        { trait_type: "Category", value: "Offensive" },
        { trait_type: "Minted Date", value: "26/7/2025" },
        { trait_type: "Special Ability", value: "Triple Shot" }
      ]
    },
    network: "ethereum-goerli",
    owner_address: "0x3C4D5E6F7890ABCDEF1234567890ABCDEF123456",
    is_listed_for_sale: "True",
    listing_price_eth: 1.250,
    minted_at: "2025-07-26T09:15:33.000Z",
    last_transfer_at: "2025-07-26T09:15:33.000Z",
    user_wallet: {
      id: 74,
      documentId: "wallet_triple_shot_owner",
      wallet_address: "0x3C4D5E6F7890ABCDEF1234567890ABCDEF123456"
    }
  },
  {
    id: 4,
    documentId: "mining_boost_medal_004",
    createdAt: "2025-07-25T11:20:44.567Z",
    updatedAt: "2025-07-25T11:20:44.567Z",
    publishedAt: "2025-07-25T11:20:44.580Z",
    token_id: "MINING_BOOST_1753425839828_4004",
    contract_address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    token_uri: "http://localhost:1337/api/nft-metadata/MINING_BOOST_1753425839828_4004",
    metadata: {
      name: "Medalla del Minero Experto",
      description: "Bendecida por los espíritus de las profundidades terrestres. Aumenta significativamente la eficiencia en la recolección de minerales, duplicando la cantidad obtenida por cada extracción.",
      icon_name: "FaGem",
      rarity: "epic",
      achievement_type: "power_enhancement",
      attributes: [
        { trait_type: "Effect Type", value: "Mining Boost" },
        { trait_type: "Rarity", value: "Epic" },
        { trait_type: "Power Level", value: "+100% Mining" },
        { trait_type: "Category", value: "Utility" },
        { trait_type: "Minted Date", value: "25/7/2025" },
        { trait_type: "Special Ability", value: "Double Mining" }
      ]
    },
    network: "ethereum-goerli",
    owner_address: "0x4D5E6F7890ABCDEF1234567890ABCDEF12345678",
    is_listed_for_sale: "True",
    listing_price_eth: 0.485,
    minted_at: "2025-07-25T11:20:44.000Z",
    last_transfer_at: "2025-07-25T11:20:44.000Z",
    user_wallet: {
      id: 75,
      documentId: "wallet_mining_boost_owner",
      wallet_address: "0x4D5E6F7890ABCDEF1234567890ABCDEF12345678"
    }
  },
  {
    id: 5,
    documentId: "speed_boost_medal_005",
    createdAt: "2025-07-24T13:35:55.234Z",
    updatedAt: "2025-07-24T13:35:55.234Z",
    publishedAt: "2025-07-24T13:35:55.250Z",
    token_id: "SPEED_BOOST_1753325839828_5005",
    contract_address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    token_uri: "http://localhost:1337/api/nft-metadata/SPEED_BOOST_1753325839828_5005",
    metadata: {
      name: "Medalla del Viento Veloz",
      description: "Imbuida con la esencia de los vientos más rápidos del mundo. Otorga un 13% de aumento en la velocidad de movimiento, permitiendo esquivar ataques y posicionarse estratégicamente.",
      icon_name: "FaBolt",
      rarity: "rare",
      achievement_type: "power_enhancement",
      attributes: [
        { trait_type: "Effect Type", value: "Movement Speed" },
        { trait_type: "Rarity", value: "Rare" },
        { trait_type: "Power Level", value: "+13% Speed" },
        { trait_type: "Category", value: "Mobility" },
        { trait_type: "Minted Date", value: "24/7/2025" },
        { trait_type: "Special Ability", value: "Swift Movement" }
      ]
    },
    network: "ethereum-goerli",
    owner_address: "0x5E6F7890ABCDEF1234567890ABCDEF1234567890",
    is_listed_for_sale: "True",
    listing_price_eth: 0.195,
    minted_at: "2025-07-24T13:35:55.000Z",
    last_transfer_at: "2025-07-24T13:35:55.000Z",
    user_wallet: {
      id: 76,
      documentId: "wallet_speed_boost_owner",
      wallet_address: "0x5E6F7890ABCDEF1234567890ABCDEF1234567890"
    }
  }
];

// Función para obtener datos mock del marketplace
export const getMockMarketplaceData = () => {
  return {
    data: mockMarketplaceNFTs,
    meta: {
      pagination: {
        page: 1,
        pageSize: 25,
        pageCount: 1,
        total: 5
      }
    }
  };
};

// Función para simular delay de API
export const simulateApiDelay = (ms: number = 1000) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};