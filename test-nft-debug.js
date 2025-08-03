// Test para debuggear el problema de NFT
console.log('🎮 Testing NFT System...');

// Simular el NFT que debería funcionar según marketplace-nft-data.json
const testNFT = {
  documentId: "triple_shot_medal_003",
  metadata: {
    name: "Medalla del Tirador Maestro",
    description: "Una reliquia legendaria de los antiguos maestros del combate a distancia. Permite disparar 3 proyectiles simultáneamente, triplicando el poder de fuego en cada ataque.",
    icon_name: "FaBullseye",
    achievement_type: "power_enhancement",
    rarity: "legendary",
    game_effect: {
      type: "multiple_projectiles",
      value: 3,
      unit: "count"
    },
    attributes: [
      {
        trait_type: "Effect Type",
        value: "Multiple Projectiles"
      },
      {
        trait_type: "Rarity",
        value: "Legendary"
      },
      {
        trait_type: "Power Level",
        value: "x3 Projectiles"
      },
      {
        trait_type: "Category",
        value: "Offensive"
      }
    ]
  }
};

// Test hasGameEffect
function hasGameEffect(nft) {
  const metadata = nft.metadata;
  const hasEffect = !!(metadata.game_effect?.type);
  
  console.log('🔍 Testing hasGameEffect:');
  console.log('  NFT Name:', metadata.name);
  console.log('  Has game_effect:', !!metadata.game_effect);
  console.log('  game_effect.type:', metadata.game_effect?.type);
  console.log('  game_effect.value:', metadata.game_effect?.value);
  console.log('  Result:', hasEffect);
  
  return hasEffect;
}

// Test extractGameEffects
function extractGameEffects(nft) {
  const effects = [];
  const metadata = nft.metadata;

  console.log('🔍 Testing extractGameEffects:');
  
  if (metadata.game_effect) {
    const gameEffect = metadata.game_effect;
    const effectType = gameEffect.type;
    
    const effect = {
      type: effectType,
      value: gameEffect.value,
      unit: gameEffect.unit || 'percentage',
      category: 'offensive', // simplified
      stackable: true,
      maxStacks: 1,
      duration: 0,
      cooldown: 0
    };

    effects.push(effect);
    console.log('  ✅ Effect extracted:', effect);
  } else {
    console.log('  ❌ No game_effect found');
  }

  return effects;
}

// Ejecutar tests
console.log('\n=== RUNNING TESTS ===');

const hasEffect = hasGameEffect(testNFT);
console.log('\n1. hasGameEffect result:', hasEffect);

if (hasEffect) {
  const effects = extractGameEffects(testNFT);
  console.log('\n2. extractGameEffects result:', effects);
  
  if (effects.length > 0) {
    const effect = effects[0];
    console.log('\n3. Effect details:');
    console.log('   Type:', effect.type);
    console.log('   Value:', effect.value);
    console.log('   Unit:', effect.unit);
    
    if (effect.type === 'multiple_projectiles') {
      console.log('\n✅ SUCCESS: NFT should enable', effect.value, 'projectiles per shot');
    }
  }
} else {
  console.log('\n❌ FAILED: NFT does not have game_effect');
}

console.log('\n=== TEST COMPLETE ===');