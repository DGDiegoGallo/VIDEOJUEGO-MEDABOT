export interface WeaponConfig {
  id: string;
  name: string;
  description: string;
  type: 'pistol' | 'machinegun' | 'launcher' | 'rifle';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
  effects: {
    bulletsPerShot?: number;
    fireRate?: number; // ms entre disparos
    damage?: number;
    bulletSpeed?: number;
    bulletLifetime?: number;
    specialEffect?: string;
  };
}

export const WEAPON_CONFIGS: Record<string, WeaponConfig> = {
  pistol_default: {
    id: 'pistol_default',
    name: 'Pistola Básica',
    description: 'Arma básica estándar con disparo simple',
    type: 'pistol',
    rarity: 'common',
    effects: {
      bulletsPerShot: 1,
      fireRate: 500,
      damage: 25,
      bulletSpeed: 400,
      bulletLifetime: 2000
    }
  },
  improved_machinegun: {
    id: 'improved_machinegun',
    name: 'Ametralladora Mejorada',
    description: 'Arma automática con ráfagas de 3 proyectiles',
    type: 'machinegun',
    rarity: 'uncommon',
    effects: {
      bulletsPerShot: 3, // Dispara 3 balas por ráfaga
      fireRate: 300, // Más rápida que la pistola
      damage: 20, // Menos daño por bala pero más balas
      bulletSpeed: 450,
      bulletLifetime: 2200,
      specialEffect: 'burst_fire'
    }
  },
  grenade_launcher: {
    id: 'grenade_launcher',
    name: 'Lanzagranadas',
    description: 'Arma explosiva para daño en área masivo',
    type: 'launcher',
    rarity: 'rare',
    effects: {
      bulletsPerShot: 1,
      fireRate: 800, // Más lento pero más potente
      damage: 50, // Alto daño
      bulletSpeed: 300, // Más lento
      bulletLifetime: 3000,
      specialEffect: 'explosive'
    }
  },
  laser_rifle: {
    id: 'laser_rifle',
    name: 'Rifle Láser',
    description: 'Arma de energía de alta precisión y daño crítico',
    type: 'rifle',
    rarity: 'epic',
    effects: {
      bulletsPerShot: 1,
      fireRate: 400,
      damage: 40, // Alto daño
      bulletSpeed: 600, // Muy rápido
      bulletLifetime: 2500,
      specialEffect: 'piercing'
    }
  }
};

export const getWeaponConfig = (weaponId: string): WeaponConfig => {
  return WEAPON_CONFIGS[weaponId] || WEAPON_CONFIGS.pistol_default;
}; 