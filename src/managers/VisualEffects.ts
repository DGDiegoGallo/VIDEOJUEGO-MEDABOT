import { Scene } from 'phaser';


/**
 * Clase que maneja todos los efectos visuales del juego
 * 
 * Responsabilidades:
 * - Crear efectos de explosión
 * - Manejar efectos de recolección
 * - Controlar efectos de subida de nivel
 * - Gestionar efectos de daño
 * - Aplicar efectos de texto flotante
 * 
 * @example
 * ```typescript
 * const effects = new VisualEffects(scene);
 * effects.createExplosionEffect(x, y);
 * effects.showScoreText(x, y, '+10');
 * ```
 */
export class VisualEffects {
  private scene: Scene;

  /**
   * Constructor de la clase VisualEffects
   * @param scene - Escena de Phaser donde se crearán los efectos
   */
  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Crea un efecto de explosión en una posición específica
   * @param x - Posición X de la explosión
   * @param y - Posición Y de la explosión
   * @param color - Color de las partículas (opcional)
   * @param particleCount - Número de partículas (opcional)
   */
  createExplosionEffect(
    x: number, 
    y: number, 
    color: number = 0xffaa00, 
    particleCount: number = 8
  ): void {
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = 30;
      const particleX = x + Math.cos(angle) * distance;
      const particleY = y + Math.sin(angle) * distance;

      const particle = this.scene.add.circle(particleX, particleY, 3, color);

      this.scene.tweens.add({
        targets: particle,
        x: particleX + Math.cos(angle) * 50,
        y: particleY + Math.sin(angle) * 50,
        alpha: 0,
        scale: 0,
        duration: 800,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }

  /**
   * Crea un efecto de recolección (partículas que vuelan hacia el jugador)
   * @param startX - Posición X de inicio
   * @param startY - Posición Y de inicio
   * @param targetX - Posición X objetivo (jugador)
   * @param targetY - Posición Y objetivo (jugador)
   * @param color - Color de las partículas (opcional)
   * @param particleCount - Número de partículas (opcional)
   */
  createCollectionEffect(
    startX: number, 
    startY: number, 
    targetX: number, 
    targetY: number,
    color: number = 0x00ffff,
    particleCount: number = 6
  ): void {
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = 20;
      const particleX = startX + Math.cos(angle) * distance;
      const particleY = startY + Math.sin(angle) * distance;

      const particle = this.scene.add.circle(particleX, particleY, 2, color);

      this.scene.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        scale: 0,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }

  /**
   * Crea un efecto de subida de nivel (explosión de estrellas)
   * @param playerX - Posición X del jugador
   * @param playerY - Posición Y del jugador
   * @param color - Color de las estrellas (opcional)
   * @param starCount - Número de estrellas (opcional)
   */
  createLevelUpEffect(
    playerX: number, 
    playerY: number, 
    color: number = 0xffff00,
    starCount: number = 12
  ): void {
    // Efecto de estrellas
    for (let i = 0; i < starCount; i++) {
      const angle = (i / starCount) * Math.PI * 2;
      const distance = 40;
      const starX = playerX + Math.cos(angle) * distance;
      const starY = playerY + Math.sin(angle) * distance;

      const star = this.scene.add.star(starX, starY, 5, 4, 8, color);

      this.scene.tweens.add({
        targets: star,
        x: starX + Math.cos(angle) * 80,
        y: starY + Math.sin(angle) * 80,
        alpha: 0,
        scale: 0,
        rotation: Math.PI * 2,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => {
          star.destroy();
        }
      });
    }

    // Flash de pantalla eliminado - solo quedan las estrellas
  }

  /**
   * Crea un flash de pantalla
   * @param color - Color del flash
   * @param alpha - Opacidad del flash
   * @param duration - Duración del flash en milisegundos
   */
  createScreenFlash(color: number = 0xffff00, alpha: number = 0.3, duration: number = 300): void {
    const flash = this.scene.add.rectangle(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2,
      this.scene.scale.width,
      this.scene.scale.height,
      color,
      alpha
    );

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: duration,
      onComplete: () => {
        flash.destroy();
      }
    });
  }

  /**
   * Crea un efecto de daño (ondas de choque)
   * @param x - Posición X del efecto
   * @param y - Posición Y del efecto
   * @param color - Color de las ondas (opcional)
   * @param waveCount - Número de ondas (opcional)
   */
  createDamageEffect(
    x: number, 
    y: number, 
    color: number = 0xff0000,
    waveCount: number = 3
  ): void {
    for (let i = 0; i < waveCount; i++) {
      const wave = this.scene.add.circle(x, y, 10 + (i * 10), color, 0.5);
      wave.setStrokeStyle(2, color);

      this.scene.tweens.add({
        targets: wave,
        scaleX: 3 + (i * 0.5),
        scaleY: 3 + (i * 0.5),
        alpha: 0,
        duration: 600 + (i * 100),
        ease: 'Power2',
        onComplete: () => {
          wave.destroy();
        }
      });
    }
  }

  /**
   * Muestra texto flotante que se desvanece
   * @param x - Posición X del texto
   * @param y - Posición Y del texto
   * @param text - Texto a mostrar
   * @param color - Color del texto (opcional)
   * @param fontSize - Tamaño de fuente (opcional)
   * @param duration - Duración de la animación (opcional)
   */
  showScoreText(
    x: number, 
    y: number, 
    text: string, 
    color: string = '#ffff00',
    fontSize: string = '16px',
    duration: number = 1000
  ): void {
    const scoreText = this.scene.add.text(x, y - 20, text, {
      fontSize: fontSize,
      color: color,
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: scoreText,
      y: y - 50,
      alpha: 0,
      duration: duration,
      ease: 'Power2',
      onComplete: () => {
        scoreText.destroy();
      }
    });
  }

  /**
   * Crea un efecto de partículas de curación
   * @param x - Posición X del efecto
   * @param y - Posición Y del efecto
   * @param color - Color de las partículas (opcional)
   * @param particleCount - Número de partículas (opcional)
   */
  createHealEffect(
    x: number, 
    y: number, 
    color: number = 0x00ff00,
    particleCount: number = 8
  ): void {
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = 15;
      const particleX = x + Math.cos(angle) * distance;
      const particleY = y + Math.sin(angle) * distance;

      const particle = this.scene.add.circle(particleX, particleY, 2, color);

      this.scene.tweens.add({
        targets: particle,
        y: particleY - 30,
        alpha: 0,
        scale: 0,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }

  /**
   * Crea un efecto de rayo eléctrico
   * @param startX - Posición X de inicio
   * @param startY - Posición Y de inicio
   * @param endX - Posición X final
   * @param endY - Posición Y final
   * @param color - Color del rayo (opcional)
   * @param segments - Número de segmentos del rayo (opcional)
   */
  createLightningEffect(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    color: number = 0x00ffff,
    segments: number = 8
  ): void {
    const points: { x: number; y: number }[] = [];
    points.push({ x: startX, y: startY });

    // Generar puntos intermedios para crear el efecto de rayo
    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const x = startX + (endX - startX) * t;
      const y = startY + (endY - startY) * t;
      
      // Agregar variación aleatoria
      const variation = 20;
      points.push({
        x: x + (Math.random() - 0.5) * variation,
        y: y + (Math.random() - 0.5) * variation
      });
    }

    points.push({ x: endX, y: endY });

    // Crear el rayo
    const lightning = this.scene.add.graphics();
    lightning.lineStyle(3, color, 1);
    lightning.beginPath();
    lightning.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      lightning.lineTo(points[i].x, points[i].y);
    }

    lightning.strokePath();

    // Animar el rayo
    this.scene.tweens.add({
      targets: lightning,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        lightning.destroy();
      }
    });
  }

  /**
   * Crea un efecto de ondas de energía
   * @param x - Posición X del centro
   * @param y - Posición Y del centro
   * @param color - Color de las ondas (opcional)
   * @param waveCount - Número de ondas (opcional)
   */
  createEnergyWaveEffect(
    x: number,
    y: number,
    color: number = 0x0088ff,
    waveCount: number = 4
  ): void {
    for (let i = 0; i < waveCount; i++) {
      const wave = this.scene.add.circle(x, y, 20, color, 0.3);
      wave.setStrokeStyle(2, color, 0.8);

      this.scene.tweens.add({
        targets: wave,
        scaleX: 5 + (i * 0.5),
        scaleY: 5 + (i * 0.5),
        alpha: 0,
        duration: 800 + (i * 200),
        ease: 'Power2',
        onComplete: () => {
          wave.destroy();
        }
      });
    }
  }

  /**
   * Crea un efecto de polvo de estrellas
   * @param x - Posición X del centro
   * @param y - Posición Y del centro
   * @param color - Color de las estrellas (opcional)
   * @param starCount - Número de estrellas (opcional)
   */
  createStardustEffect(
    x: number,
    y: number,
    color: number = 0xffffff,
    starCount: number = 15
  ): void {
    for (let i = 0; i < starCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 50;
      const starX = x + Math.cos(angle) * distance;
      const starY = y + Math.sin(angle) * distance;

      const star = this.scene.add.star(starX, starY, 4, 2, 4, color);

      this.scene.tweens.add({
        targets: star,
        x: starX + (Math.random() - 0.5) * 100,
        y: starY + (Math.random() - 0.5) * 100,
        alpha: 0,
        scale: 0,
        rotation: Math.PI * 2,
        duration: 1000 + Math.random() * 500,
        ease: 'Power2',
        onComplete: () => {
          star.destroy();
        }
      });
    }
  }

  /**
   * Crea un efecto de impacto de bala
   * @param x - Posición X del impacto
   * @param y - Posición Y del impacto
   * @param color - Color del efecto (opcional)
   * @param particleCount - Número de partículas (opcional)
   */
  createBulletHitEffect(
    x: number,
    y: number,
    color: number = 0xffaa00,
    particleCount: number = 6
  ): void {
    // Crear partículas de chispas
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = 20;
      const sparkX = x + Math.cos(angle) * distance;
      const sparkY = y + Math.sin(angle) * distance;

      const spark = this.scene.add.circle(sparkX, sparkY, 2, color);

      this.scene.tweens.add({
        targets: spark,
        x: sparkX + Math.cos(angle) * 40,
        y: sparkY + Math.sin(angle) * 40,
        alpha: 0,
        scale: 0,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          spark.destroy();
        }
      });
    }

    // Crear efecto de ondas concéntricas
    const wave = this.scene.add.circle(x, y, 5, color, 0.5);
    wave.setStrokeStyle(2, color, 0.8);

    this.scene.tweens.add({
      targets: wave,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        wave.destroy();
      }
    });
  }

  /**
   * Limpia todos los efectos visuales activos
   */
  clearAllEffects(): void {
    // Esta función puede ser implementada si necesitamos limpiar efectos específicos
    // Por ahora, los efectos se auto-destruyen
  }

  /**
   * Destruye la instancia de efectos visuales
   */
  destroy(): void {
    this.clearAllEffects();
  }
} 