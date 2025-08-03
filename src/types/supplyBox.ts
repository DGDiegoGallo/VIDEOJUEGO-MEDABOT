export interface SupplyBoxConfig {
  spawnChance: number;
  materials: {
    steel: { min: number; max: number; chance: number };
    energy_cells: { min: number; max: number; chance: number };
    medicine: { min: number; max: number; chance: number };
  };
  visualEffects: {
    glowColor: number;
    pulseDuration: number;
    rotationSpeed: number;
  };
}

export interface SupplyBoxData {
  id: string;
  x: number;
  y: number;
  materials: {
    steel?: number;
    energy_cells?: number;
    medicine?: number;
  };
  isCollected: boolean;
}

export interface SupplyBoxStats {
  totalBoxesCreated: number;
  activeBoxes: number;
  totalMaterialsCollected: { [key: string]: number };
  spawnChance: number;
} 