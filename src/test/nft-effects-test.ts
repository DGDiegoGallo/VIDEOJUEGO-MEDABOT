/**
 * Test simple para verificar que el sistema de efectos NFT funciona correctamente
 */

import { GameNFTService } from '@/services/gameNFTService';
import { GameEffectsManager } from '@/managers/GameEffectsManager';
import type { UserNFT } from '@/types/nft';

// Mock de NFT para testing
const mockNFT: UserNFT = {
  id: 1,
  documentId: 'test_nft_001',
  token_id: 'TEST_NFT_001',
  contract_address: '0x123...',
  token_uri: 'http://test.com/nft/1',
  metadata: {
    name: 'Test NFT',
    description: 'NFT de prueba',
    icon_name: 'FaHeart',
    rarity: 'rare',
    attributes: [
      {
        trait_type: 'Effect Type',
        value: 'Health Boost'
      },
      {
        trait_type: 'Rarity',
        value: 'Rare'
      }
    ],
    game_effect: {
      type: 'health_boost',
      value: 20,
      unit: 'percentage'
    }
  },
  network: 'ethereum-goerli',
  owner_address: '0x456...',
  is_listed_for_sale: 'False',
  listing_price_eth: 0,
  minted_at: new Date().toISOString(),
  last_transfer_at: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  publishedAt: new Date().toISOString(),
  user_wallet: {
    id: 1,
    documentId: 'test_wallet_001',
    wallet_address: '0x456...'
  }
};

/**
 * Test básico del sistema de efectos
 */
export function testNFTEffects(): boolean {
  try {
    console.log('🧪 Iniciando test de efectos NFT...');

    // 1. Test del servicio NFT
    const nftService = GameNFTService.getInstance();
    console.log('✅ GameNFTService instanciado correctamente');

    // 2. Test del manager de efectos
    const effectsManager = new GameEffectsManager();
    console.log('✅ GameEffectsManager instanciado correctamente');

    // 3. Test de equipamiento de NFT
    const equipped = nftService.equipNFT(mockNFT);
    if (!equipped) {
      throw new Error('No se pudo equipar el NFT de prueba');
    }
    console.log('✅ NFT equipado correctamente');

    // 4. Test de obtención de efectos
    const effects = nftService.getActiveEffects();
    if (effects.length === 0) {
      throw new Error('No se encontraron efectos activos');
    }
    console.log('✅ Efectos activos obtenidos:', effects.length);

    // 5. Test de cálculo de valores
    const totalHealthBoost = nftService.getTotalEffectValue('health_boost');
    const expectedValue = 20 * 1.5; // rare multiplier
    if (totalHealthBoost !== expectedValue) {
      throw new Error(`Valor incorrecto: esperado ${expectedValue}, obtenido ${totalHealthBoost}`);
    }
    console.log('✅ Cálculo de efectos correcto:', totalHealthBoost);

    // 6. Test de información para UI
    const uiInfo = effectsManager.getUIEffectsInfo();
    console.log('✅ Información para UI generada:', uiInfo.length, 'efectos');

    // 7. Limpiar test
    nftService.clearEquippedNFTs();
    console.log('✅ Test limpiado correctamente');

    console.log('🎉 Todos los tests pasaron correctamente!');
    return true;

  } catch (error) {
    console.error('❌ Error en test de efectos NFT:', error);
    return false;
  }
}

/**
 * Test de múltiples NFTs con stacking
 */
export function testNFTStacking(): boolean {
  try {
    console.log('🧪 Iniciando test de stacking de NFTs...');

    const nftService = GameNFTService.getInstance();
    
    // NFT 1: Health boost común
    const nft1: UserNFT = {
      ...mockNFT,
      id: 1,
      documentId: 'test_nft_001',
      metadata: {
        ...mockNFT.metadata,
        name: 'Health NFT 1',
        rarity: 'common',
        attributes: [
          {
            trait_type: 'Effect Type',
            value: 'Health Boost'
          },
          {
            trait_type: 'Rarity',
            value: 'Common'
          }
        ],
        game_effect: {
          type: 'health_boost',
          value: 10,
          unit: 'percentage'
        }
      }
    };

    // NFT 2: Health boost raro
    const nft2: UserNFT = {
      ...mockNFT,
      id: 2,
      documentId: 'test_nft_002',
      metadata: {
        ...mockNFT.metadata,
        name: 'Health NFT 2',
        rarity: 'rare',
        attributes: [
          {
            trait_type: 'Effect Type',
            value: 'Health Boost'
          },
          {
            trait_type: 'Rarity',
            value: 'Rare'
          }
        ],
        game_effect: {
          type: 'health_boost',
          value: 15,
          unit: 'percentage'
        }
      }
    };

    // Equipar ambos NFTs
    nftService.equipNFT(nft1);
    nftService.equipNFT(nft2);

    // Verificar stacking
    const totalHealthBoost = nftService.getTotalEffectValue('health_boost');
    const expectedValue = (10 * 1.0) + (15 * 1.5); // common + rare
    
    if (Math.abs(totalHealthBoost - expectedValue) > 0.1) {
      throw new Error(`Stacking incorrecto: esperado ${expectedValue}, obtenido ${totalHealthBoost}`);
    }

    console.log('✅ Stacking de efectos funciona correctamente:', totalHealthBoost);

    // Limpiar
    nftService.clearEquippedNFTs();
    
    console.log('🎉 Test de stacking completado exitosamente!');
    return true;

  } catch (error) {
    console.error('❌ Error en test de stacking:', error);
    return false;
  }
}

// Ejecutar tests si se importa directamente
if (typeof window !== 'undefined') {
  (window as any).testNFTEffects = testNFTEffects;
  (window as any).testNFTStacking = testNFTStacking;
  console.log('🛠️ Tests disponibles: testNFTEffects(), testNFTStacking()');
}