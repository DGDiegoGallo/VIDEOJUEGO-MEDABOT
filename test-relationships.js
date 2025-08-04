// Script para verificar las relaciones entre wallet, NFT y sesión del juego
const API_BASE = 'http://localhost:1337/api';

async function checkRelationships(userId) {
  console.log('🔍 Verificando relaciones para el usuario ID:', userId);
  
  try {
    // 1. Obtener la wallet del usuario
    console.log('\n1️⃣ Obteniendo wallet del usuario...');
    const walletResponse = await fetch(`${API_BASE}/user-wallets?filters[users_permissions_user]=${userId}&populate=*`);
    const walletData = await walletResponse.json();
    
    if (walletData.data && walletData.data.length > 0) {
      const wallet = walletData.data[0];
      console.log('✅ Wallet encontrada:', wallet.id);
      console.log('📍 Wallet address:', wallet.wallet_address);
      console.log('🎨 NFTs en wallet:', wallet.user_nfts?.length || 0);
      
      // 2. Obtener los NFTs de la wallet
      if (wallet.user_nfts && wallet.user_nfts.length > 0) {
        console.log('\n2️⃣ Obteniendo NFTs de la wallet...');
        for (const nft of wallet.user_nfts) {
          console.log('🎨 NFT ID:', nft.id);
          console.log('🎨 Token ID:', nft.token_id);
          console.log('🎨 Owner address:', nft.owner_address);
          console.log('🎨 Wallet relation:', nft.user_wallet ? '✅ Relacionado' : '❌ No relacionado');
          console.log('🎮 Game sessions:', nft.game_sessions?.length || 0);
        }
      } else {
        console.log('⚠️ No se encontraron NFTs en la wallet');
      }
      
      // 3. Obtener las sesiones del juego del usuario
      console.log('\n3️⃣ Obteniendo sesiones del juego...');
      const sessionsResponse = await fetch(`${API_BASE}/game-sessions?filters[users_permissions_user]=${userId}&populate=*`);
      const sessionsData = await sessionsResponse.json();
      
      if (sessionsData.data && sessionsData.data.length > 0) {
        for (const session of sessionsData.data) {
          console.log('🎮 Session ID:', session.id);
          console.log('🎮 Session name:', session.session_name);
          console.log('🎨 NFTs en sesión:', session.user_nfts?.length || 0);
          
          if (session.user_nfts && session.user_nfts.length > 0) {
            for (const nft of session.user_nfts) {
              console.log('  - NFT ID:', nft.id);
              console.log('  - Token ID:', nft.token_id);
            }
          }
        }
      } else {
        console.log('⚠️ No se encontraron sesiones del juego');
      }
      
    } else {
      console.log('❌ No se encontró wallet para el usuario');
    }
    
  } catch (error) {
    console.error('❌ Error verificando relaciones:', error);
  }
}

// Función para verificar un NFT específico
async function checkNFT(nftId) {
  console.log(`\n🎨 Verificando NFT ID: ${nftId}`);
  
  try {
    const response = await fetch(`${API_BASE}/user-nfts/${nftId}?populate=*`);
    const data = await response.json();
    
    if (data.data) {
      const nft = data.data;
      console.log('✅ NFT encontrado');
      console.log('🎨 Token ID:', nft.token_id);
      console.log('🎨 Owner address:', nft.owner_address);
      console.log('🎨 Wallet relation:', nft.user_wallet ? `✅ Relacionado con wallet ${nft.user_wallet.id}` : '❌ No relacionado');
      console.log('🎮 Game sessions:', nft.game_sessions?.length || 0);
      
      if (nft.game_sessions && nft.game_sessions.length > 0) {
        for (const session of nft.game_sessions) {
          console.log('  - Session ID:', session.id);
          console.log('  - Session name:', session.session_name);
        }
      }
    } else {
      console.log('❌ NFT no encontrado');
    }
  } catch (error) {
    console.error('❌ Error verificando NFT:', error);
  }
}

// Función para verificar una wallet específica
async function checkWallet(walletId) {
  console.log(`\n💰 Verificando Wallet ID: ${walletId}`);
  
  try {
    const response = await fetch(`${API_BASE}/user-wallets/${walletId}?populate=*`);
    const data = await response.json();
    
    if (data.data) {
      const wallet = data.data;
      console.log('✅ Wallet encontrada');
      console.log('📍 Address:', wallet.wallet_address);
      console.log('👤 User relation:', wallet.users_permissions_user ? `✅ Relacionado con usuario ${wallet.users_permissions_user.id}` : '❌ No relacionado');
      console.log('🎨 NFTs:', wallet.user_nfts?.length || 0);
      
      if (wallet.user_nfts && wallet.user_nfts.length > 0) {
        for (const nft of wallet.user_nfts) {
          console.log('  - NFT ID:', nft.id);
          console.log('  - Token ID:', nft.token_id);
        }
      }
    } else {
      console.log('❌ Wallet no encontrada');
    }
  } catch (error) {
    console.error('❌ Error verificando wallet:', error);
  }
}

// Exportar funciones para uso en consola del navegador
if (typeof window !== 'undefined') {
  window.checkRelationships = checkRelationships;
  window.checkNFT = checkNFT;
  window.checkWallet = checkWallet;
  
  console.log('🔧 Funciones disponibles:');
  console.log('- checkRelationships(userId) - Verifica todas las relaciones de un usuario');
  console.log('- checkNFT(nftId) - Verifica un NFT específico');
  console.log('- checkWallet(walletId) - Verifica una wallet específica');
  console.log('\nEjemplo: checkRelationships(80)');
}

// Si se ejecuta directamente en Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { checkRelationships, checkNFT, checkWallet };
} 