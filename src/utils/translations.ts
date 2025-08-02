// Sistema de traducciones para el marketplace

export const RARITY_TRANSLATIONS = {
  common: {
    en: 'Common',
    es: 'Común'
  },
  rare: {
    en: 'Rare',
    es: 'Raro'
  },
  epic: {
    en: 'Epic',
    es: 'Épico'
  },
  legendary: {
    en: 'Legendary',
    es: 'Legendario'
  }
};

export const ACHIEVEMENT_TYPE_TRANSLATIONS = {
  power_enhancement: {
    en: 'Power Enhancement',
    es: 'Mejora de Poder'
  },
  registration_achievement: {
    en: 'Registration Achievement',
    es: 'Logro de Registro'
  },
  combat_achievement: {
    en: 'Combat Achievement',
    es: 'Logro de Combate'
  },
  exploration_achievement: {
    en: 'Exploration Achievement',
    es: 'Logro de Exploración'
  }
};

export const EFFECT_TYPE_TRANSLATIONS = {
  health_boost: {
    en: 'Health Boost',
    es: 'Aumento de Vida'
  },
  weapon_damage_boost: {
    en: 'Weapon Damage',
    es: 'Daño de Arma'
  },
  experience_boost: {
    en: 'Experience Boost',
    es: 'Aumento de Experiencia'
  },
  magnetic_range: {
    en: 'Magnetic Range',
    es: 'Alcance Magnético'
  },
  fire_rate: {
    en: 'Fire Rate',
    es: 'Velocidad de Disparo'
  },
  critical_chance: {
    en: 'Critical Chance',
    es: 'Probabilidad Crítica'
  },
  shield_strength: {
    en: 'Shield Strength',
    es: 'Fuerza de Escudo'
  },
  bullet_speed: {
    en: 'Bullet Speed',
    es: 'Velocidad de Bala'
  },
  bullet_lifetime: {
    en: 'Bullet Lifetime',
    es: 'Duración de Bala'
  },
  multiple_projectiles: {
    en: 'Multiple Projectiles',
    es: 'Proyectiles Múltiples'
  }
};

export const CATEGORY_TRANSLATIONS = {
  offensive: {
    en: 'Offensive',
    es: 'Ofensivo'
  },
  defensive: {
    en: 'Defensive',
    es: 'Defensivo'
  },
  utility: {
    en: 'Utility',
    es: 'Utilidad'
  }
};

// Función para traducir rareza
export const translateRarity = (rarity: string, language: 'en' | 'es' = 'es'): string => {
  const rarityKey = rarity.toLowerCase() as keyof typeof RARITY_TRANSLATIONS;
  return RARITY_TRANSLATIONS[rarityKey]?.[language] || rarity;
};

// Función para traducir tipo de logro
export const translateAchievementType = (type: string, language: 'en' | 'es' = 'es'): string => {
  const typeKey = type.toLowerCase() as keyof typeof ACHIEVEMENT_TYPE_TRANSLATIONS;
  return ACHIEVEMENT_TYPE_TRANSLATIONS[typeKey]?.[language] || type;
};

// Función para traducir tipo de efecto
export const translateEffectType = (type: string, language: 'en' | 'es' = 'es'): string => {
  const typeKey = type.toLowerCase() as keyof typeof EFFECT_TYPE_TRANSLATIONS;
  return EFFECT_TYPE_TRANSLATIONS[typeKey]?.[language] || type;
};

// Función para traducir categoría
export const translateCategory = (category: string, language: 'en' | 'es' = 'es'): string => {
  const categoryKey = category.toLowerCase() as keyof typeof CATEGORY_TRANSLATIONS;
  return CATEGORY_TRANSLATIONS[categoryKey]?.[language] || category;
};

// Función para obtener el color de rareza
export const getRarityColor = (rarity: string): string => {
  const colors = {
    common: 'text-gray-400',
    rare: 'text-blue-400',
    epic: 'text-purple-400',
    legendary: 'text-yellow-400'
  };
  return colors[rarity.toLowerCase() as keyof typeof colors] || colors.common;
};

// Función para obtener el color de fondo de rareza
export const getRarityBgColor = (rarity: string): string => {
  const colors = {
    common: 'bg-gray-700 text-gray-300',
    rare: 'bg-blue-900 text-blue-300',
    epic: 'bg-purple-900 text-purple-300',
    legendary: 'bg-yellow-900 text-yellow-300'
  };
  return colors[rarity.toLowerCase() as keyof typeof colors] || colors.common;
};

// Función para normalizar rareza (convertir a inglés para filtros)
export const normalizeRarity = (rarity: string): string => {
  const rarityMap: Record<string, string> = {
    'común': 'common',
    'raro': 'rare',
    'épico': 'epic',
    'legendario': 'legendary',
    'common': 'common',
    'rare': 'rare',
    'epic': 'epic',
    'legendary': 'legendary'
  };
  return rarityMap[rarity.toLowerCase()] || rarity.toLowerCase();
};

// Función para obtener opciones de filtro de rareza
export const getRarityFilterOptions = (language: 'en' | 'es' = 'es') => [
  { value: 'all', label: language === 'es' ? 'Todas las rarezas' : 'All rarities' },
  { value: 'common', label: translateRarity('common', language) },
  { value: 'rare', label: translateRarity('rare', language) },
  { value: 'epic', label: translateRarity('epic', language) },
  { value: 'legendary', label: translateRarity('legendary', language) }
];

// Función para obtener opciones de ordenamiento
export const getSortOptions = (language: 'en' | 'es' = 'es') => [
  { value: 'newest', label: language === 'es' ? 'Más recientes' : 'Most recent' },
  { value: 'price-low', label: language === 'es' ? 'Precio: Menor a mayor' : 'Price: Low to high' },
  { value: 'price-high', label: language === 'es' ? 'Precio: Mayor a menor' : 'Price: High to low' },
  { value: 'rarity', label: language === 'es' ? 'Por rareza' : 'By rarity' }
]; 