import { Scene } from 'phaser';

/**
 * Tipos de estructuras disponibles
 */
export enum StructureType {
    CUBE = 'cube',
    TOWER = 'tower',
    WALL = 'wall',
    PLATFORM = 'platform',
    EXPLOSIVE_BARREL = 'explosive_barrel'
}

/**
 * Configuración base para estructuras
 */
interface StructureConfig {
    type: StructureType;
    x: number;
    y: number;
    width?: number;
    height?: number;
    color?: number;
    strokeColor?: number;
    hasPhysics?: boolean;
    isDestructible?: boolean;
    health?: number;
}

/**
 * Clase base para todas las estructuras - ARREGLADA para alineación correcta
 */
export class Structure extends Phaser.GameObjects.Rectangle {
    public structureType: StructureType;
    public hasPhysics: boolean;
    public isDestructible: boolean;
    public health: number;
    public maxHealth: number;

    // Sprites adicionales para estructuras complejas
    protected shadowSprite?: Phaser.GameObjects.Rectangle;
    protected supportSprites: Phaser.GameObjects.Rectangle[] = [];
    protected roofSprite?: Phaser.GameObjects.Triangle;
    protected markSprites: Phaser.GameObjects.Rectangle[] = [];

    constructor(scene: Scene, config: StructureConfig) {
        // Calcular dimensiones principales
        const { width, height } = Structure.calculateDimensions(config);

        // Crear el sprite principal directamente
        super(scene, config.x, config.y, width, height, config.color || 0x7f8c8d);

        this.structureType = config.type;
        this.hasPhysics = config.hasPhysics ?? true;
        this.isDestructible = config.isDestructible ?? false;
        this.health = config.health ?? 1;
        this.maxHealth = this.health;

        // Configurar el sprite principal
        this.setStrokeStyle(2, config.strokeColor || 0x34495e);
        this.setDepth(-60);

        // Crear elementos visuales adicionales
        this.createAdditionalVisuals(config, width, height);

        // Agregar física si es necesario
        if (this.hasPhysics) {
            this.setupPhysics();
        }

        // Agregar a la escena
        scene.add.existing(this);
    }

    /**
     * Calcula las dimensiones basadas en el tipo de estructura
     */
    private static calculateDimensions(config: StructureConfig): { width: number; height: number } {
        switch (config.type) {
            case StructureType.CUBE:
                const cubeSize = config.width || (30 + Math.random() * 40);
                return { width: cubeSize, height: cubeSize };

            case StructureType.TOWER:
                return {
                    width: config.width || (25 + Math.random() * 15),
                    height: config.height || (60 + Math.random() * 40)
                };

            case StructureType.WALL:
                const length = config.width || (80 + Math.random() * 60);
                const wallHeight = config.height || (20 + Math.random() * 20);
                const isHorizontal = Math.random() > 0.5;
                return {
                    width: isHorizontal ? length : wallHeight,
                    height: isHorizontal ? wallHeight : length
                };

            case StructureType.PLATFORM:
                return {
                    width: config.width || (50 + Math.random() * 30),
                    height: 15
                };

            case StructureType.EXPLOSIVE_BARREL:
                const barrelSize = config.width || 24;
                return { width: barrelSize, height: barrelSize };

            default:
                return { width: 30, height: 30 };
        }
    }

    /**
     * Crea elementos visuales adicionales para estructuras complejas
     */
    protected createAdditionalVisuals(config: StructureConfig, width: number, height: number): void {
        switch (this.structureType) {
            case StructureType.CUBE:
                this.createCubeExtras(width, height);
                break;
            case StructureType.TOWER:
                this.createTowerExtras(width, height);
                break;
            case StructureType.WALL:
                // Los muros no necesitan extras
                this.setFillStyle(config.color || 0x8e44ad);
                this.setStrokeStyle(2, config.strokeColor || 0x6c3483);
                break;
            case StructureType.PLATFORM:
                this.createPlatformExtras(width, height);
                break;
            case StructureType.EXPLOSIVE_BARREL:
                this.createBarrelExtras(width, height);
                break;
        }
    }

    /**
     * Crea elementos adicionales para cubos
     */
    private createCubeExtras(width: number, height: number): void {
        // Sombra
        this.shadowSprite = this.scene.add.rectangle(this.x + 3, this.y + 3, width, height, 0x2c3e50, 0.3);
        this.shadowSprite.setDepth(-65);
    }

    /**
     * Crea elementos adicionales para torres
     */
    private createTowerExtras(width: number, height: number): void {
        // Configurar color de torre
        this.setFillStyle(0x95a5a6);
        this.setStrokeStyle(2, 0x7f8c8d);

        // Techo
        const roofWidth = width + 10;
        this.roofSprite = this.scene.add.triangle(
            this.x,
            this.y - height / 2 - 8,
            0, 16,
            roofWidth / 2, 0,
            -roofWidth / 2, 0,
            0xe74c3c
        );
        this.roofSprite.setDepth(-60);
    }

    /**
     * Crea elementos adicionales para plataformas
     */
    private createPlatformExtras(width: number, height: number): void {
        // Configurar color de plataforma
        this.setFillStyle(0xf39c12);
        this.setStrokeStyle(2, 0xe67e22);

        // Soportes
        const support1 = this.scene.add.rectangle(this.x - width / 3, this.y + 15, 8, 20, 0xd68910);
        const support2 = this.scene.add.rectangle(this.x + width / 3, this.y + 15, 8, 20, 0xd68910);

        support1.setDepth(-60);
        support2.setDepth(-60);

        this.supportSprites.push(support1, support2);
    }

    /**
     * Crea elementos adicionales para barriles explosivos - MEJORADO VISUALMENTE
     */
    private createBarrelExtras(width: number, height: number): void {
        // Configurar color base del barril (marrón metálico)
        this.setFillStyle(0x8b4513);
        this.setStrokeStyle(3, 0x654321);

        // Sombra del barril
        this.shadowSprite = this.scene.add.rectangle(this.x + 2, this.y + 2, width, height, 0x2c1810, 0.4);
        this.shadowSprite.setDepth(-65);

        // Anillos metálicos del barril (arriba y abajo)
        const topRing = this.scene.add.rectangle(this.x, this.y - height * 0.3, width + 2, 3, 0x654321);
        const bottomRing = this.scene.add.rectangle(this.x, this.y + height * 0.3, width + 2, 3, 0x654321);
        topRing.setDepth(-58);
        bottomRing.setDepth(-58);
        this.markSprites.push(topRing, bottomRing);

        // Símbolo de peligro (triángulo amarillo con exclamación)
        const warningTriangle = this.scene.add.triangle(
            this.x, this.y - height * 0.1,
            0, -8,
            -7, 6,
            7, 6,
            0xffff00
        );
        warningTriangle.setStrokeStyle(1, 0xff8800);
        warningTriangle.setDepth(-57);
        this.markSprites.push(warningTriangle);

        // Exclamación dentro del triángulo
        const exclamationBody = this.scene.add.rectangle(this.x, this.y - height * 0.15, 1.5, 6, 0xff0000);
        const exclamationDot = this.scene.add.rectangle(this.x, this.y - height * 0.05, 1.5, 1.5, 0xff0000);
        exclamationBody.setDepth(-56);
        exclamationDot.setDepth(-56);
        this.markSprites.push(exclamationBody, exclamationDot);

        // Texto "TNT" en el barril
        const tntText = this.scene.add.text(this.x, this.y + height * 0.15, 'TNT', {
            fontSize: '8px',
            color: '#ff0000',
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        tntText.setDepth(-57);
        this.markSprites.push(tntText as any);

        // Efecto de brillo peligroso (parpadeo sutil)
        this.scene.tweens.add({
            targets: [warningTriangle, exclamationBody, exclamationDot],
            alpha: 0.6,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Efecto de pulsación en el texto TNT
        this.scene.tweens.add({
            targets: tntText,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Power2'
        });

        console.log(`💥 Barril explosivo mejorado creado en (${this.x}, ${this.y}) con efectos visuales`);
    }

    /**
     * Configura la física de la estructura - ARREGLADO para alineación perfecta
     */
    protected setupPhysics(): void {
        // Agregar física directamente al sprite principal
        this.scene.physics.add.existing(this, true); // true = static body

        // El cuerpo de física ya está perfectamente alineado con el sprite
        // No necesitamos ajustes adicionales
    }

    /**
     * Recibe daño (para estructuras destructibles) - COMPLETAMENTE ARREGLADO
     */
    public takeDamage(damage: number): boolean {
        if (!this.isDestructible || this.health <= 0) {
            return false;
        }

        const previousHealth = this.health;
        this.health = Math.max(0, this.health - damage);

        console.log(`🔥 Estructura dañada: ${previousHealth} → ${this.health} HP (daño: ${damage})`);

        // Efecto visual de daño usando método alternativo más robusto
        if (this.active && this.scene) {
            this.createDamageEffect();
        }

        // Retornar true si la estructura fue destruida
        const wasDestroyed = this.health <= 0;
        if (wasDestroyed) {
            console.log(`💥 Estructura destruida en (${Math.round(this.x)}, ${Math.round(this.y)})`);
        }

        return wasDestroyed;
    }

    /**
     * Crea efecto visual de daño sin depender de setTint
     */
    private createDamageEffect(): void {
        // Crear overlay rojo temporal
        const damageOverlay = this.scene.add.rectangle(
            this.x, this.y,
            this.width, this.height,
            0xff6666, 0.6
        );
        damageOverlay.setDepth(this.depth + 1);

        // Animación de desvanecimiento
        this.scene.tweens.add({
            targets: damageOverlay,
            alpha: 0,
            duration: 150,
            ease: 'Power2',
            onComplete: () => {
                damageOverlay.destroy();
            }
        });

        // Efecto de escala para feedback adicional
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 75,
            yoyo: true,
            ease: 'Power2'
        });

        // Crear partículas de daño
        for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 10 + Math.random() * 5;
            const particleX = this.x + Math.cos(angle) * distance;
            const particleY = this.y + Math.sin(angle) * distance;

            const particle = this.scene.add.rectangle(particleX, particleY, 2, 2, 0xff6666);
            particle.setDepth(this.depth + 2);

            this.scene.tweens.add({
                targets: particle,
                x: particleX + Math.cos(angle) * 15,
                y: particleY + Math.sin(angle) * 15,
                alpha: 0,
                duration: 200,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }
    }

    /**
     * Obtiene el tipo de estructura
     */
    public getType(): StructureType {
        return this.structureType;
    }

    /**
     * Obtiene el sprite principal para colisiones - ARREGLADO
     */
    public getMainSprite(): Phaser.GameObjects.Rectangle {
        return this; // El sprite principal ES esta instancia
    }

    /**
     * Verifica si la estructura tiene física
     */
    public getHasPhysics(): boolean {
        return this.hasPhysics;
    }

    /**
     * Destruye la estructura y limpia recursos - ARREGLADO
     */
    public destroyStructure(): void {
        // Limpiar sprites adicionales
        if (this.shadowSprite) {
            this.shadowSprite.destroy();
        }

        if (this.roofSprite) {
            this.roofSprite.destroy();
        }

        this.supportSprites.forEach(sprite => sprite.destroy());
        this.supportSprites = [];

        this.markSprites.forEach(sprite => sprite.destroy());
        this.markSprites = [];

        // Destruir el sprite principal
        this.destroy();
    }
}

/**
 * Manager para todas las estructuras del juego
 */
export class StructureManager {
    private scene: Scene;
    private structures: Structure[] = [];
    private structureGroup: Phaser.Physics.Arcade.StaticGroup;

    constructor(scene: Scene) {
        this.scene = scene;
        this.structureGroup = this.scene.physics.add.staticGroup();
    }

    /**
     * Crea una nueva estructura
     */
    public createStructure(config: StructureConfig): Structure {
        const structure = new Structure(this.scene, config);
        this.structures.push(structure);

        // Agregar al grupo de física si tiene física
        if (structure.getHasPhysics()) {
            this.structureGroup.add(structure);
        }

        return structure;
    }

    /**
     * Crea múltiples estructuras de una vez
     */
    public createMultipleStructures(configs: StructureConfig[]): Structure[] {
        return configs.map(config => this.createStructure(config));
    }

    /**
     * Remueve una estructura específica
     */
    public removeStructure(structure: Structure): void {
        const index = this.structures.indexOf(structure);
        if (index > -1) {
            this.structures.splice(index, 1);

            // Remover del grupo de física
            if (structure.getHasPhysics()) {
                this.structureGroup.remove(structure);
            }

            structure.destroyStructure();
        }
    }

    /**
     * Obtiene todas las estructuras
     */
    public getStructures(): Structure[] {
        return this.structures;
    }

    /**
     * Obtiene estructuras por tipo
     */
    public getStructuresByType(type: StructureType): Structure[] {
        return this.structures.filter(structure => structure.getType() === type);
    }

    /**
     * Obtiene el grupo de física para colisiones
     */
    public getPhysicsGroup(): Phaser.Physics.Arcade.StaticGroup {
        return this.structureGroup;
    }

    /**
     * Obtiene todas las estructuras con física (para CollisionManager)
     */
    public getPhysicsStructures(): Structure[] {
        return this.structures.filter(structure => structure.getHasPhysics());
    }

    /**
     * Busca estructuras en un área específica
     */
    public getStructuresInArea(x: number, y: number, radius: number): Structure[] {
        return this.structures.filter(structure => {
            const distance = Phaser.Math.Distance.Between(x, y, structure.x, structure.y);
            return distance <= radius;
        });
    }

    /**
     * Daña estructuras en un área (para explosiones)
     */
    public damageStructuresInArea(x: number, y: number, radius: number, damage: number): Structure[] {
        const damagedStructures: Structure[] = [];
        const structuresInArea = this.getStructuresInArea(x, y, radius);

        structuresInArea.forEach(structure => {
            if (structure.isDestructible) {
                const wasDestroyed = structure.takeDamage(damage);
                damagedStructures.push(structure);

                if (wasDestroyed) {
                    this.removeStructure(structure);
                }
            }
        });

        return damagedStructures;
    }

    /**
     * Limpia todas las estructuras
     */
    public clearAllStructures(): void {
        this.structures.forEach(structure => structure.destroyStructure());
        this.structures = [];
        this.structureGroup.clear(true, true);
    }

    /**
     * Obtiene estadísticas del manager
     */
    public getStats(): { total: number; byType: Record<string, number>; withPhysics: number } {
        const byType: Record<string, number> = {};
        let withPhysics = 0;

        this.structures.forEach(structure => {
            const type = structure.getType();
            byType[type] = (byType[type] || 0) + 1;

            if (structure.getHasPhysics()) {
                withPhysics++;
            }
        });

        return {
            total: this.structures.length,
            byType,
            withPhysics
        };
    }

    /**
     * Verifica si una posición está libre de estructuras
     * @param x - Posición X a verificar
     * @param y - Posición Y a verificar
     * @param radius - Radio de verificación
     * @param excludeTypes - Tipos de estructuras a excluir de la verificación
     * @returns true si la posición está libre
     */
    public isPositionFree(x: number, y: number, radius: number, excludeTypes?: StructureType[]): boolean {
        const structuresInArea = this.getStructuresInArea(x, y, radius);

        if (excludeTypes) {
            const filteredStructures = structuresInArea.filter(structure =>
                !excludeTypes.includes(structure.getType())
            );
            return filteredStructures.length === 0;
        }

        return structuresInArea.length === 0;
    }

    /**
     * Encuentra una posición libre cerca de una ubicación objetivo
     * @param targetX - Posición X objetivo
     * @param targetY - Posición Y objetivo
     * @param minRadius - Radio mínimo de separación
     * @param maxRadius - Radio máximo de búsqueda
     * @param maxAttempts - Número máximo de intentos
     * @returns Posición libre o null si no se encuentra
     */
    public findFreePosition(
        targetX: number,
        targetY: number,
        minRadius: number = 50,
        maxRadius: number = 200,
        maxAttempts: number = 20
    ): { x: number; y: number } | null {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            // Generar posición aleatoria en un anillo alrededor del objetivo
            const angle = Math.random() * Math.PI * 2;
            const distance = minRadius + Math.random() * (maxRadius - minRadius);

            const x = targetX + Math.cos(angle) * distance;
            const y = targetY + Math.sin(angle) * distance;

            // Verificar si la posición está libre
            if (this.isPositionFree(x, y, minRadius)) {
                return { x, y };
            }
        }

        return null; // No se encontró posición libre
    }

    /**
     * Destruye el manager y limpia recursos
     */
    public destroy(): void {
        this.clearAllStructures();
        this.structureGroup.destroy(true);
    }
}