import { Scene } from 'phaser';

/**
 * Tipos de estructuras disponibles - ACTUALIZADAS CON TILESET
 */
export enum StructureType {
    // Estructuras del tileset
    BONES_SMALL = 'bones_small',
    BONES_LARGE = 'bones_large',
    BROKEN_TREE_LARGE = 'broken_tree_large',
    BROKEN_TREE_SMALL = 'broken_tree_small',
    BROKEN_TREE_MEDIUM = 'broken_tree_medium',
    BROKEN_TREE_STUMP_1 = 'broken_tree_stump_1',
    BROKEN_TREE_STUMP_2 = 'broken_tree_stump_2',
    BROKEN_TREE_STUMP_3 = 'broken_tree_stump_3',
    DEAD_ARM_1 = 'dead_arm_1',
    DEAD_ARM_2 = 'dead_arm_2',
    DEAD_ARM_3 = 'dead_arm_3',
    DEAD_ARM_4 = 'dead_arm_4',
    PILE_SKULLS = 'pile_skulls',
    PLANT_LARGE = 'plant_large',
    PLANT_SMALL = 'plant_small',
    ROCK_LARGE = 'rock_large',
    ROCK_MEDIUM = 'rock_medium',
    THORN_PLANT_1 = 'thorn_plant_1',
    THORN_PLANT_2 = 'thorn_plant_2',
    TREE_SMALL = 'tree_small',
    TREE_LARGE = 'tree_large',
    // Mantener el barril explosivo
    EXPLOSIVE_BARREL = 'explosive_barrel'
}

/**
 * Configuración base para estructuras - ACTUALIZADA PARA TILESET
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
    // Nuevas propiedades para tileset
    tileId?: number;
    imagePath?: string;
    collisionBounds?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

/**
 * Datos del tileset para mapear estructuras
 */
const TILESET_DATA = {
    0: { type: StructureType.BONES_SMALL, image: 'Bones_shadow1_3.png', imageSize: { width: 32, height: 32 }, collision: { x: 3, y: 5, width: 25, height: 22 } },
    1: { type: StructureType.BONES_LARGE, image: 'Bones_shadow2_6.png', imageSize: { width: 64, height: 64 }, collision: { x: 8, y: 8, width: 48, height: 48 } },
    2: { type: StructureType.BROKEN_TREE_LARGE, image: 'Broken_ tree_shadow3_1.png', imageSize: { width: 128, height: 128 }, collision: { x: 22, y: 52.9, width: 84, height: 30.1 } },
    3: { type: StructureType.BROKEN_TREE_SMALL, image: 'Broken_tree_shadow1_2.png', imageSize: { width: 32, height: 32 }, collision: { x: 9.2, y: 6.8, width: 18.2, height: 24.4 } },
    4: { type: StructureType.BROKEN_TREE_MEDIUM, image: 'Broken_tree_shadow1_4.png', imageSize: { width: 64, height: 64 }, collision: { x: 11.9, y: 15.5, width: 39, height: 29.9 } },
    5: { type: StructureType.BROKEN_TREE_STUMP_1, image: 'Broken_tree_shadow2_1-1.png', imageSize: { width: 128, height: 128 }, collision: { x: 57.3, y: 74.5, width: 33.7, height: 33.5 } },
    6: { type: StructureType.BROKEN_TREE_STUMP_2, image: 'Broken_tree_shadow2_2-1.png', imageSize: { width: 128, height: 128 }, collision: { x: 43.3, y: 58.3, width: 30.3, height: 39.8 } },
    7: { type: StructureType.BROKEN_TREE_STUMP_3, image: 'Broken_tree_shadow2_3-1.png', imageSize: { width: 64, height: 64 }, collision: { x: 21, y: 20.6, width: 34, height: 27.4 } },
    8: { type: StructureType.DEAD_ARM_1, image: 'Dead_arm_shadow1_1.png', imageSize: { width: 64, height: 64 }, collision: { x: 24.8, y: 14.6, width: 37.2, height: 39.5 } },
    9: { type: StructureType.DEAD_ARM_2, image: 'Dead_arm_shadow1_2.png', imageSize: { width: 64, height: 64 }, collision: { x: 16.5, y: 23.2, width: 25.7, height: 28.8 } },
    10: { type: StructureType.DEAD_ARM_3, image: 'Dead_arm_shadow1_3.png', imageSize: { width: 64, height: 64 }, collision: { x: 23.6, y: 25.2, width: 17, height: 25.5 } },
    11: { type: StructureType.DEAD_ARM_4, image: 'Dead_arm_shadow1_4.png', imageSize: { width: 64, height: 64 }, collision: { x: 20.7, y: 25.8, width: 19.3, height: 20.1 } },
    12: { type: StructureType.PILE_SKULLS, image: 'Pile_sculls_shadow1.png', imageSize: { width: 128, height: 128 }, collision: { x: 34.4, y: 52.4, width: 59.7, height: 36.6 } },
    13: { type: StructureType.PLANT_LARGE, image: 'Plant_shadow1_1.png', imageSize: { width: 128, height: 128 }, collision: { x: 32, y: 53.5, width: 64, height: 39.5 } },
    14: { type: StructureType.PLANT_SMALL, image: 'Plant_shadow1_2.png', imageSize: { width: 64, height: 64 }, collision: { x: 11, y: 26.1, width: 42, height: 23.9 } },
    15: { type: StructureType.ROCK_LARGE, image: 'Rock_shadow1_1.png', imageSize: { width: 64, height: 64 }, collision: { x: 3, y: 8.5, width: 57, height: 51.5 } },
    16: { type: StructureType.ROCK_MEDIUM, image: 'Rock_shadow1_2.png', imageSize: { width: 64, height: 64 }, collision: { x: 9, y: 10, width: 45, height: 44 } },
    17: { type: StructureType.THORN_PLANT_1, image: 'Thorn_plant_shadow1_1.png', imageSize: { width: 128, height: 128 }, collision: { x: 68.5, y: 69.8, width: 19.8, height: 18.5 } },
    18: { type: StructureType.THORN_PLANT_2, image: 'Thorn_plant_shadow1_2.png', imageSize: { width: 128, height: 128 }, collision: { x: 17, y: 65.7, width: 25.6, height: 24.3 } },
    19: { type: StructureType.TREE_SMALL, image: 'Tree_shadow1_2.png', imageSize: { width: 64, height: 64 }, collision: { x: 17.5, y: 36.2, width: 28.6, height: 26.8 } },
    20: { type: StructureType.TREE_LARGE, image: 'Tree_shadow2_1.png', imageSize: { width: 128, height: 128 }, collision: { x: 44.2, y: 70.6, width: 34.6, height: 30.4 } }
};

/**
 * Clase base para todas las estructuras - ACTUALIZADA PARA TILESET
 */
export class Structure extends Phaser.GameObjects.Container {
    public structureType: StructureType;
    public hasPhysics: boolean;
    public isDestructible: boolean;
    public health: number;
    public maxHealth: number;

    // Sprites para estructuras del tileset
    protected mainSprite?: Phaser.GameObjects.Image;
    protected collisionSprite?: Phaser.GameObjects.Rectangle;
    protected markSprites: Phaser.GameObjects.GameObject[] = [];
    protected structureScale: number = 1.0;

    constructor(scene: Scene, config: StructureConfig) {
        super(scene, config.x, config.y);

        this.structureType = config.type;
        this.hasPhysics = config.hasPhysics ?? true;
        this.isDestructible = config.isDestructible ?? false;
        this.health = config.health ?? 1;
        this.maxHealth = this.health;

        this.setDepth(30); // Estructuras por encima del jugador para efecto 2.5D

        // Crear el sprite de colisión PRIMERO si es del tileset
        if (config.type !== StructureType.EXPLOSIVE_BARREL) {
            this.createCollisionSpriteFromConfig(config);
        }

        // Crear el sprite principal
        this.createMainSprite(config);

        // Agregar física si es necesario
        if (this.hasPhysics) {
            this.setupPhysics();
        }

        // Agregar a la escena
        scene.add.existing(this);
    }

    /**
     * Crea el sprite de colisión desde la configuración (en el constructor)
     */
    private createCollisionSpriteFromConfig(config: StructureConfig): void {
        // Buscar datos del tileset
        const tileData = Object.values(TILESET_DATA).find(data => data.type === config.type);

        if (tileData) {
            // Obtener la escala que se usará para el sprite visual
            this.structureScale = this.getProceduralScale();
            this.createCollisionSprite(tileData);
        }
    }

    /**
     * Crea el sprite principal según el tipo de estructura
     */
    private createMainSprite(config: StructureConfig): void {
        if (config.type === StructureType.EXPLOSIVE_BARREL) {
            // Mantener la implementación original del barril explosivo
            this.createBarrelSprite(config);
            return;
        }

        // Buscar datos del tileset
        const tileData = Object.values(TILESET_DATA).find(data => data.type === config.type);

        if (!tileData) {
            console.warn(`Tipo de estructura no encontrado en tileset: ${config.type}`);
            this.createDefaultSprite(config);
            return;
        }

        // Cargar la imagen si no está cargada
        const imageKey = `structure_${config.type}`;
        if (!this.scene.textures.exists(imageKey)) {
            this.scene.load.image(imageKey, `src/assets/objects/${tileData.image}`);
            this.scene.load.start();

            // Esperar a que cargue la imagen para crear el sprite visual
            this.scene.load.once('complete', () => {
                this.createImageSprite(imageKey, tileData);
            });
        } else {
            this.createImageSprite(imageKey, tileData);
        }
    }

    /**
     * Crea el sprite de colisión basado en los datos del tileset
     */
    private createCollisionSprite(tileData: any): void {
        const collision = tileData.collision;
        const imageSize = tileData.imageSize;

        // Aplicar escala a las dimensiones de colisión
        const scaledCollisionWidth = collision.width * this.structureScale;
        const scaledCollisionHeight = collision.height * this.structureScale;

        // Calcular la posición del sprite de colisión relativa al centro de la imagen (escalada)
        const collisionX = (collision.x - imageSize.width / 2 + collision.width / 2) * this.structureScale;
        const collisionY = (collision.y - imageSize.height / 2 + collision.height / 2) * this.structureScale;

        // Calcular posición absoluta del sprite de colisión (no relativa al contenedor)
        const absoluteCollisionX = this.x + collisionX;
        const absoluteCollisionY = this.y + collisionY;

        this.collisionSprite = this.scene.add.rectangle(
            absoluteCollisionX, absoluteCollisionY,
            scaledCollisionWidth, scaledCollisionHeight,
            0x00ff00, 0.0 // Invisible - solo para colisiones
        );

        // Agregar referencia a la estructura original para que CollisionManager pueda acceder a ella
        (this.collisionSprite as any).parentStructure = this;

        // NO agregar al contenedor - mantenerlo independiente para física correcta
        // Sprite de colisión creado correctamente con escala aplicada
    }

    /**
     * Crea el sprite de imagen del tileset
     */
    private createImageSprite(imageKey: string, tileData: any): void {
        // Crear el sprite principal con la imagen
        this.mainSprite = this.scene.add.image(0, 0, imageKey);
        this.mainSprite.setOrigin(0.5, 0.5);

        // Aplicar la escala ya calculada (para mantener consistencia con la colisión)
        this.mainSprite.setScale(this.structureScale);

        this.add(this.mainSprite);

        // Sprite visual creado correctamente con escala aplicada
    }

    /**
     * Obtiene una escala procedural según el tipo de estructura
     */
    private getProceduralScale(): number {
        const baseScale = 1.0;
        let minScale = baseScale;
        let maxScale = baseScale;

        // Definir rangos de escala según el tipo de estructura
        switch (this.structureType) {
            // Árboles - Los más grandes (pueden ser muy variados)
            case StructureType.TREE_LARGE:
                minScale = 1.0;
                maxScale = 1.8;
                break;
            case StructureType.TREE_SMALL:
                minScale = 1.0;
                maxScale = 1.5;
                break;
            case StructureType.BROKEN_TREE_LARGE:
                minScale = 1.0;
                maxScale = 1.6;
                break;
            case StructureType.BROKEN_TREE_MEDIUM:
                minScale = 1.0;
                maxScale = 1.4;
                break;
            case StructureType.BROKEN_TREE_SMALL:
                minScale = 1.0;
                maxScale = 1.3;
                break;

            // Tocones - Variación moderada
            case StructureType.BROKEN_TREE_STUMP_1:
            case StructureType.BROKEN_TREE_STUMP_2:
            case StructureType.BROKEN_TREE_STUMP_3:
                minScale = 1.0;
                maxScale = 1.4;
                break;

            // Plantas - Bastante variadas
            case StructureType.PLANT_LARGE:
                minScale = 1.0;
                maxScale = 1.6;
                break;
            case StructureType.PLANT_SMALL:
                minScale = 1.0;
                maxScale = 1.4;
                break;
            case StructureType.THORN_PLANT_1:
            case StructureType.THORN_PLANT_2:
                minScale = 1.0;
                maxScale = 1.5;
                break;

            // Brazos muertos - Variación moderada
            case StructureType.DEAD_ARM_1:
            case StructureType.DEAD_ARM_2:
            case StructureType.DEAD_ARM_3:
            case StructureType.DEAD_ARM_4:
                minScale = 1.0;
                maxScale = 1.3;
                break;

            // Rocas - Variación moderada
            case StructureType.ROCK_LARGE:
                minScale = 1.0;
                maxScale = 1.4;
                break;
            case StructureType.ROCK_MEDIUM:
                minScale = 1.0;
                maxScale = 1.3;
                break;

            // Huesos - Poca variación (los más consistentes)
            case StructureType.BONES_LARGE:
                minScale = 1.0;
                maxScale = 1.2;
                break;
            case StructureType.BONES_SMALL:
                minScale = 1.0;
                maxScale = 1.15;
                break;
            case StructureType.PILE_SKULLS:
                minScale = 1.0;
                maxScale = 1.25;
                break;

            // Por defecto - Sin variación
            default:
                minScale = 1.0;
                maxScale = 1.0;
                break;
        }

        // Generar escala aleatoria dentro del rango
        return minScale + Math.random() * (maxScale - minScale);
    }

    /**
     * Crea el sprite de barril explosivo (mantiene la implementación original)
     */
    private createBarrelSprite(config: StructureConfig): void {
        const barrelSize = config.width || 24;

        // Crear el sprite principal del barril como rectángulo
        const barrelRect = this.scene.add.rectangle(0, 0, barrelSize, barrelSize, 0x8b4513);
        barrelRect.setStrokeStyle(3, 0x654321);
        this.add(barrelRect);

        // Crear elementos adicionales del barril
        this.createBarrelExtras(barrelSize, barrelSize);
    }

    /**
     * Crea sprite por defecto para tipos no reconocidos
     */
    private createDefaultSprite(config: StructureConfig): void {
        const size = 30;
        const defaultRect = this.scene.add.rectangle(0, 0, size, size, 0x7f8c8d);
        defaultRect.setStrokeStyle(2, 0x34495e);
        this.add(defaultRect);

        this.collisionSprite = defaultRect;
    }



    /**
     * Crea elementos adicionales para barriles explosivos - MEJORADO VISUALMENTE
     */
    private createBarrelExtras(width: number, height: number): void {
        // Sombra del barril
        const shadowSprite = this.scene.add.rectangle(2, 2, width, height, 0x2c1810, 0.4);
        shadowSprite.setDepth(-65);
        this.add(shadowSprite);

        // Anillos metálicos del barril (arriba y abajo)
        const topRing = this.scene.add.rectangle(0, -height * 0.3, width + 2, 3, 0x654321);
        const bottomRing = this.scene.add.rectangle(0, height * 0.3, width + 2, 3, 0x654321);
        topRing.setDepth(-58);
        bottomRing.setDepth(-58);
        this.add(topRing);
        this.add(bottomRing);
        this.markSprites.push(topRing, bottomRing);

        // Símbolo de peligro (triángulo amarillo con exclamación)
        const warningTriangle = this.scene.add.triangle(
            0, -height * 0.1,
            0, -8,
            -7, 6,
            7, 6,
            0xffff00
        );
        warningTriangle.setStrokeStyle(1, 0xff8800);
        warningTriangle.setDepth(-57);
        this.add(warningTriangle);
        this.markSprites.push(warningTriangle);

        // Exclamación dentro del triángulo
        const exclamationBody = this.scene.add.rectangle(0, -height * 0.15, 1.5, 6, 0xff0000);
        const exclamationDot = this.scene.add.rectangle(0, -height * 0.05, 1.5, 1.5, 0xff0000);
        exclamationBody.setDepth(-56);
        exclamationDot.setDepth(-56);
        this.add(exclamationBody);
        this.add(exclamationDot);
        this.markSprites.push(exclamationBody, exclamationDot);

        // Texto "TNT" en el barril
        const tntText = this.scene.add.text(0, height * 0.15, 'TNT', {
            fontSize: '8px',
            color: '#ff0000',
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        tntText.setDepth(-57);
        this.add(tntText);
        this.markSprites.push(tntText);

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
     * Configura la física de la estructura - CORREGIDA PARA USAR COLISIONES DEL JSON
     */
    protected setupPhysics(): void {
        // NO agregar física aquí - se hará en el StructureManager
        // Solo marcar que tiene física habilitada
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
        // Obtener dimensiones del sprite principal o usar valores por defecto
        let width = 30, height = 30;
        if (this.mainSprite) {
            width = this.mainSprite.width;
            height = this.mainSprite.height;
        } else if (this.collisionSprite) {
            width = this.collisionSprite.width;
            height = this.collisionSprite.height;
        }

        // Crear overlay rojo temporal
        const damageOverlay = this.scene.add.rectangle(
            this.x, this.y,
            width, height,
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
     * Obtiene el sprite de colisión específico del JSON - CORREGIDO
     */
    public getMainSprite(): Phaser.GameObjects.GameObject {
        return this.collisionSprite || this;
    }

    /**
     * Obtiene el sprite de colisión para física (usado por StructureManager)
     */
    public getCollisionSprite(): Phaser.GameObjects.GameObject | null {
        return this.collisionSprite;
    }

    /**
     * Verifica si la estructura tiene física
     */
    public getHasPhysics(): boolean {
        return this.hasPhysics;
    }

    /**
     * Destruye la estructura y limpia recursos - ACTUALIZADO PARA TILESET
     */
    public destroyStructure(): void {
        // Limpiar sprites adicionales
        this.markSprites.forEach(sprite => {
            if (sprite && sprite.destroy) {
                sprite.destroy();
            }
        });
        this.markSprites = [];

        // Destruir el sprite de colisión independiente si existe
        if (this.collisionSprite && this.collisionSprite.destroy) {
            this.collisionSprite.destroy();
        }

        // Destruir el contenedor (que incluye todos los sprites hijos)
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

        // Agregar al grupo de física si tiene física - CORREGIDO PARA USAR COLISIONES DEL JSON
        if (structure.getHasPhysics()) {
            const collisionSprite = structure.getCollisionSprite();
            if (collisionSprite) {
                // Agregar física al sprite de colisión específico
                this.scene.physics.add.existing(collisionSprite, true);
                this.structureGroup.add(collisionSprite);
            } else {
                // Fallback para barriles explosivos y estructuras sin sprite de colisión específico
                this.scene.physics.add.existing(structure, true);
                this.structureGroup.add(structure);
                console.log(`⚠️ Fallback: Física agregada al contenedor completo para ${config.type}`);
            }
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

            // Remover del grupo de física - CORREGIDO
            if (structure.getHasPhysics()) {
                const collisionSprite = structure.getCollisionSprite();
                if (collisionSprite) {
                    this.structureGroup.remove(collisionSprite);
                } else {
                    this.structureGroup.remove(structure);
                }
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
     * Crea una estructura aleatoria del tileset (excluyendo barriles explosivos)
     * @param x - Posición X
     * @param y - Posición Y
     * @returns La estructura creada
     */
    public createRandomTilesetStructure(x: number, y: number): Structure {
        // Obtener todos los tipos de estructura del tileset (excluyendo barril explosivo)
        const tilesetTypes = Object.values(StructureType).filter(type => type !== StructureType.EXPLOSIVE_BARREL);

        // Seleccionar un tipo aleatorio
        const randomType = tilesetTypes[Math.floor(Math.random() * tilesetTypes.length)];

        return this.createStructure({
            type: randomType,
            x,
            y,
            hasPhysics: true,
            isDestructible: false
        });
    }

    /**
     * Obtiene todos los tipos de estructura disponibles del tileset
     */
    public getTilesetStructureTypes(): StructureType[] {
        return Object.values(StructureType).filter(type => type !== StructureType.EXPLOSIVE_BARREL);
    }

    /**
     * Crea múltiples estructuras aleatorias del tileset
     * @param positions - Array de posiciones {x, y}
     * @returns Array de estructuras creadas
     */
    public createMultipleRandomTilesetStructures(positions: { x: number, y: number }[]): Structure[] {
        return positions.map(pos => this.createRandomTilesetStructure(pos.x, pos.y));
    }

    /**
     * Destruye el manager y limpia recursos
     */
    public destroy(): void {
        this.clearAllStructures();
        this.structureGroup.destroy(true);
    }
}