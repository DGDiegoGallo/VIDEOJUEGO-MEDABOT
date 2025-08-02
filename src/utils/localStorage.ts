// Utility functions for localStorage management

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth-token',
  USER_DATA: 'user-data',
  GAME_DATA_PREFIX: 'game-data-',
  BLOCKCHAIN_DATA: 'blockchain-data',
  SETTINGS: 'app-settings'
} as const;

export class LocalStorageManager {
  // Generic get/set methods
  static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return null;
    }
  }

  static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
    }
  }

  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
    }
  }

  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  // Specific methods for game data
  static getGameData(userId: string) {
    return this.get(`${STORAGE_KEYS.GAME_DATA_PREFIX}${userId}`);
  }

  static setGameData(userId: string, data: any) {
    this.set(`${STORAGE_KEYS.GAME_DATA_PREFIX}${userId}`, data);
  }

  static removeGameData(userId: string) {
    this.remove(`${STORAGE_KEYS.GAME_DATA_PREFIX}${userId}`);
  }

  // Check if data needs sync with server
  static needsSync(key: string): boolean {
    const syncKey = `${key}_last_sync`;
    const lastSync = this.get<number>(syncKey);
    const now = Date.now();
    const syncInterval = 5 * 60 * 1000; // 5 minutes

    return !lastSync || (now - lastSync) > syncInterval;
  }

  static markSynced(key: string): void {
    const syncKey = `${key}_last_sync`;
    this.set(syncKey, Date.now());
  }
}