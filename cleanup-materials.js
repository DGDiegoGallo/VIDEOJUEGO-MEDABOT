// Script para limpiar localStorage duplicados de materiales
// Ejecutar en la consola del navegador

console.log('🧹 Limpiando localStorage duplicados de materiales...');

// Obtener todas las claves de localStorage
const allKeys = Object.keys(localStorage);

// Encontrar claves relacionadas con materiales
const materialKeys = allKeys.filter(key => 
  key.includes('materials') || 
  key.includes('collectedMaterials') ||
  key.includes('game-materials')
);

console.log('📦 Claves de materiales encontradas:', materialKeys);

// Mostrar el contenido de cada clave
materialKeys.forEach(key => {
  try {
    const data = JSON.parse(localStorage.getItem(key));
    console.log(`📋 ${key}:`, data);
  } catch (error) {
    console.log(`📋 ${key}:`, localStorage.getItem(key));
  }
});

// Función para limpiar claves duplicadas
function cleanupDuplicateMaterials() {
  const userData = localStorage.getItem('user-data');
  if (userData) {
    const user = JSON.parse(userData);
    const correctKey = `game-materials-${user.id}`;
    
    console.log('🎯 Clave correcta:', correctKey);
    
    // Eliminar claves incorrectas
    materialKeys.forEach(key => {
      if (key !== correctKey && key !== 'collectedMaterials') {
        console.log(`🗑️ Eliminando clave duplicada: ${key}`);
        localStorage.removeItem(key);
      }
    });
    
    console.log('✅ Limpieza completada');
  } else {
    console.log('❌ No se encontró user-data en localStorage');
  }
}

// Función para mostrar el estado final
function showFinalState() {
  const userData = localStorage.getItem('user-data');
  if (userData) {
    const user = JSON.parse(userData);
    const correctKey = `game-materials-${user.id}`;
    const materials = localStorage.getItem(correctKey);
    
    console.log('📊 Estado final:');
    console.log('👤 User ID:', user.id);
    console.log('🔑 Clave correcta:', correctKey);
    console.log('📦 Materiales:', materials ? JSON.parse(materials) : 'No encontrado');
  }
}

// Ejecutar limpieza
console.log('\n🚀 Ejecutando limpieza...');
cleanupDuplicateMaterials();

console.log('\n📊 Estado final:');
showFinalState();

console.log('\n✅ Script completado. Los localStorage duplicados han sido eliminados.'); 