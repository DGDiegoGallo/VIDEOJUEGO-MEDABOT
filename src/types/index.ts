// Tipos principales del juego
export interface GameConfig {
  width: number;
  height: number;
  debug: boolean;
}

export interface ModalConfig {
  id: string;
  title: string;
  content: string;
  closable?: boolean;
  persistent?: boolean;
  className?: string;
}

export interface UIComponent {
  id: string;
  element: HTMLElement;
  visible: boolean;
  show(): void;
  hide(): void;
  destroy(): void;
}

export interface GameEvents {
  'game:start': void;
  'game:pause': void;
  'game:resume': void;
  'modal:open': { id: string };
  'modal:close': { id: string };
  'ui:update': { component: string; data: any };
}

export type EventCallback<T = any> = (data: T) => void;

export interface EventEmitter {
  on<K extends keyof GameEvents>(event: K, callback: EventCallback<GameEvents[K]>): void;
  off<K extends keyof GameEvents>(event: K, callback: EventCallback<GameEvents[K]>): void;
  emit<K extends keyof GameEvents>(event: K, data: GameEvents[K]): void;
}

// Re-exportar tipos
export * from './admin';
export * from './supplyBox';