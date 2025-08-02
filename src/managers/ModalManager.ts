import type { ModalConfig } from '@/types';
import { EventEmitter } from '@/utils/EventEmitter';

export class ModalManager extends EventEmitter {
  private static instance: ModalManager;
  private modals: Map<string, HTMLElement> = new Map();
  private container: HTMLElement;

  private constructor() {
    super();
    this.container = document.getElementById('modal-container')!;
  }

  static getInstance(): ModalManager {
    if (!ModalManager.instance) {
      ModalManager.instance = new ModalManager();
    }
    return ModalManager.instance;
  }

  createModal(config: ModalConfig): void {
    if (this.modals.has(config.id)) {
      console.warn(`Modal ${config.id} ya existe`);
      return;
    }

    const modal = this.buildModal(config);
    this.modals.set(config.id, modal);
    this.container.appendChild(modal);
  }

  showModal(id: string): void {
    const modal = this.modals.get(id);
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('animate-modal-in');
      this.emit('modal:open', { id });
    }
  }

  hideModal(id: string): void {
    const modal = this.modals.get(id);
    if (modal) {
      modal.classList.add('animate-modal-out');
      setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('animate-modal-out');
      }, 300);
      this.emit('modal:close', { id });
    }
  }

  destroyModal(id: string): void {
    const modal = this.modals.get(id);
    if (modal) {
      modal.remove();
      this.modals.delete(id);
    }
  }

  private buildModal(config: ModalConfig): HTMLElement {
    const backdrop = document.createElement('div');
    backdrop.className = `modal-backdrop hidden ${config.className || ''}`;
    backdrop.style.pointerEvents = 'auto';

    const content = document.createElement('div');
    content.className = 'modal-content animate-fade-in flex flex-col p-6 m-auto mt-20';

    // Header
    const header = document.createElement('div');
    header.className = 'flex justify-between items-center mb-4';
    
    const title = document.createElement('h2');
    title.className = 'text-xl font-bold text-gray-800 dark:text-white';
    title.textContent = config.title;
    
    header.appendChild(title);

    if (config.closable !== false) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'text-gray-500 hover:text-gray-700 text-2xl';
      closeBtn.innerHTML = '×';
      closeBtn.onclick = () => this.hideModal(config.id);
      header.appendChild(closeBtn);
    }

    // Body
    const body = document.createElement('div');
    body.className = 'text-gray-600 dark:text-gray-300';
    body.innerHTML = config.content;

    content.appendChild(header);
    content.appendChild(body);
    backdrop.appendChild(content);

    // Click fuera para cerrar (si no es persistente)
    if (!config.persistent) {
      backdrop.onclick = (e) => {
        if (e.target === backdrop) {
          this.hideModal(config.id);
        }
      };
    }

    return backdrop;
  }
}