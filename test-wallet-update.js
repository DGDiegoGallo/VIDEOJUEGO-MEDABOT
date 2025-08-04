// Test script para verificar la actualización de wallet en Strapi
// Ejecutar con: node test-wallet-update.js

const axios = require('axios');

const API_URL = 'http://localhost:1337/api';

// Función para simular una compra de USDT
async function testWalletUpdate() {
  try {
    console.log('🧪 Iniciando test de actualización de wallet...');
    
    // 1. Obtener una wallet existente (asumiendo que existe)
    console.log('📋 1. Obteniendo wallet existente...');
    const walletResponse = await axios.get(`${API_URL}/user-wallets?populate=*`);
    
    if (!walletResponse.data.data || walletResponse.data.data.length === 0) {
      console.log('❌ No se encontraron wallets para probar');
      return;
    }
    
    const wallet = walletResponse.data.data[0];
    console.log('✅ Wallet encontrada:', {
      id: wallet.id,
      documentId: wallet.documentId,
      address: wallet.attributes.wallet_address,
      balance: wallet.attributes.usdt_balance,
      userId: wallet.attributes.users_permissions_user
    });
    
    // 2. Simular una transacción de compra
    console.log('💰 2. Simulando transacción de compra...');
    const currentBalance = wallet.attributes.usdt_balance || 0;
    const purchaseAmount = 50; // 50 USDT
    const newBalance = currentBalance + purchaseAmount;
    
    const newTransaction = {
      id: Date.now().toString(),
      type: 'buy',
      amount: purchaseAmount,
      from: 'Stripe Payment',
      to: wallet.attributes.wallet_address,
      timestamp: new Date().toISOString(),
      status: 'completed',
      network: 'BSC',
      tx_hash: `0x${Math.random().toString(16).substr(2, 64)}`,
      fee: 0,
      dollar_amount: purchaseAmount
    };
    
    // 3. Actualizar la wallet
    console.log('🔄 3. Actualizando wallet en Strapi...');
    const updateData = {
      data: {
        users_permissions_user: wallet.attributes.users_permissions_user,
        wallet_address: wallet.attributes.wallet_address,
        pin_hash: wallet.attributes.pin_hash,
        encrypted_data: wallet.attributes.encrypted_data,
        is_active: wallet.attributes.is_active,
        usdt_balance: newBalance,
        transaction_history: [
          newTransaction,
          ...(wallet.attributes.transaction_history || [])
        ]
      }
    };
    
    console.log('📤 Datos a enviar:', {
      balance_anterior: currentBalance,
      balance_nuevo: newBalance,
      transaccion: newTransaction
    });
    
    const updateResponse = await axios.put(
      `${API_URL}/user-wallets/${wallet.documentId}`,
      updateData
    );
    
    console.log('✅ 4. Wallet actualizada exitosamente!');
    console.log('📊 Resultado:', {
      balance_anterior: currentBalance,
      balance_nuevo: updateResponse.data.data.attributes.usdt_balance,
      transacciones_totales: updateResponse.data.data.attributes.transaction_history?.length || 0
    });
    
    // 5. Verificar que la actualización fue exitosa
    console.log('🔍 5. Verificando actualización...');
    const verifyResponse = await axios.get(`${API_URL}/user-wallets/${wallet.documentId}?populate=*`);
    const updatedWallet = verifyResponse.data.data;
    
    console.log('✅ Verificación completada:', {
      balance_actual: updatedWallet.attributes.usdt_balance,
      transacciones: updatedWallet.attributes.transaction_history?.length || 0,
      ultima_transaccion: updatedWallet.attributes.transaction_history?.[0] || 'N/A'
    });
    
    console.log('🎉 Test completado exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en el test:', error.response?.data || error.message);
  }
}

// Ejecutar el test
testWalletUpdate(); 