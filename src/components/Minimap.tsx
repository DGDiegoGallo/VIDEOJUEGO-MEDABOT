import React, { useState, useEffect, useRef } from 'react';

interface MinimapProps {
  playerChunk: { x: number; y: number };
  worldSize: number;
  activeChunks: string[];
  playerPosition: { x: number; y: number };
  enemies?: Array<{
    id: string;
    x: number;
    y: number;
    type: string;
    distance: number;
  }>;
  radarRange?: number;
}

export const Minimap: React.FC<MinimapProps> = ({
  playerChunk,
  worldSize,
  activeChunks,
  playerPosition,
  enemies = [],
  radarRange = 400
}) => {
  const [scale, setScale] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [scanAngle, setScanAngle] = useState(0);
  const mapSize = isExpanded ? 200 : 120;
  const centerX = mapSize / 2;
  const centerY = mapSize / 2;
  
  // Refs para evitar logs repetitivos
  const lastEnemyCount = useRef(0);
  const lastNearbyCount = useRef(0);
  const lastLogTime = useRef(0);

  // Debug: Log de enemigos recibidos (solo cuando cambia)
  useEffect(() => {
    const currentTime = Date.now();
    const currentEnemyCount = enemies.length;
    const currentNearbyCount = enemies.filter(e => e.distance <= radarRange).length;
    
    // Solo logear si cambió el número de enemigos o pasaron 500ms
    if (currentEnemyCount !== lastEnemyCount.current || 
        currentNearbyCount !== lastNearbyCount.current ||
        currentTime - lastLogTime.current > 500) {
      
      if (enemies.length > 0) {
        console.log('🎯 Minimap recibió enemigos:', {
          total: enemies.length,
          nearby: currentNearbyCount,
          positions: enemies.slice(0, 3).map(e => `(${Math.round(e.x)}, ${Math.round(e.y)})`)
        });
      }
      
      lastEnemyCount.current = currentEnemyCount;
      lastNearbyCount.current = currentNearbyCount;
      lastLogTime.current = currentTime;
    }
  }, [enemies, radarRange]);

  // Convertir coordenadas del mundo a coordenadas del radar
  const worldToRadar = (worldX: number, worldY: number) => {
    const relativeX = worldX - playerPosition.x;
    const relativeY = worldY - playerPosition.y;
    
    // Escalar al tamaño del radar
    const radarX = centerX + (relativeX / radarRange) * (mapSize / 2) * scale;
    // INVERTIR el eje Y: en Phaser Y crece hacia abajo, en el radar hacia arriba
    const radarY = centerY - (relativeY / radarRange) * (mapSize / 2) * scale;
    
    return { x: radarX, y: radarY };
  };

  // Verificar si un enemigo está dentro del rango del radar
  const isInRadarRange = (enemy: any) => {
    return enemy.distance <= radarRange;
  };

  // Efecto de escaneo rotatorio
  useEffect(() => {
    const interval = setInterval(() => {
      setScanAngle(prev => (prev + 2) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Efecto de pulso del radar
  const [pulseRadius, setPulseRadius] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseRadius(prev => {
        if (prev >= mapSize / 2) return 0;
        return prev + 3;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [mapSize]);

  // Enemigos detectados
  const detectedEnemies = enemies.filter(isInRadarRange);
  const nearbyEnemies = detectedEnemies.filter(e => e.distance <= 200); // Enemigos muy cercanos
  const farEnemies = detectedEnemies.filter(e => e.distance > 200 && e.distance <= radarRange); // Enemigos en rango pero lejos

  // Debug: Log de enemigos procesados (solo cuando cambia significativamente)
  useEffect(() => {
    const currentTime = Date.now();
    if (detectedEnemies.length > 0 && currentTime - lastLogTime.current > 1000) {
      console.log('🎯 Minimap procesó enemigos:', {
        detected: detectedEnemies.length,
        nearby: nearbyEnemies.length,
        far: farEnemies.length,
        radarRange
      });
      
      // Debug: Mostrar conversión de coordenadas para el primer enemigo
      if (detectedEnemies.length > 0) {
        const enemy = detectedEnemies[0];
        const radarPos = worldToRadar(enemy.x, enemy.y);
        console.log('🎯 Debug coordenadas:', {
          enemigo: `(${Math.round(enemy.x)}, ${Math.round(enemy.y)})`,
          jugador: `(${Math.round(playerPosition.x)}, ${Math.round(playerPosition.y)})`,
          relativo: `(${Math.round(enemy.x - playerPosition.x)}, ${Math.round(enemy.y - playerPosition.y)})`,
          radar: `(${Math.round(radarPos.x)}, ${Math.round(radarPos.y)})`,
          distancia: Math.round(enemy.distance)
        });
      }
      
      lastLogTime.current = currentTime;
    }
  }, [detectedEnemies.length, radarRange]); // Remover dependencias que cambian constantemente

  return (
    <div className="absolute top-4 right-20 z-40">
      {/* Controles del radar */}
      <div className="flex items-center space-x-2 mb-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-gray-800/90 hover:bg-gray-700/90 text-gray-300 text-xs px-2 py-1 rounded border border-gray-600"
          title={isExpanded ? "Contraer radar" : "Expandir radar"}
        >
          {isExpanded ? '◀' : '▶'}
        </button>
        <button
          onClick={() => setScale(Math.max(0.5, scale - 0.2))}
          className="bg-gray-800/90 hover:bg-gray-700/90 text-gray-300 text-xs px-2 py-1 rounded border border-gray-600"
          title="Reducir zoom"
        >
          -
        </button>
        <span className="text-gray-400 text-xs min-w-[40px] text-center">{Math.round(scale * 100)}%</span>
        <button
          onClick={() => setScale(Math.min(3, scale + 0.2))}
          className="bg-gray-800/90 hover:bg-gray-700/90 text-gray-300 text-xs px-2 py-1 rounded border border-gray-600"
          title="Aumentar zoom"
        >
          +
        </button>
      </div>

      {/* Radar */}
      <div 
        className="relative bg-gray-900/90 backdrop-blur-sm rounded-full border-2 border-green-400 p-2"
        style={{ width: mapSize, height: mapSize }}
      >
        {/* Círculo exterior del radar */}
        <div 
          className="absolute inset-2 rounded-full border border-green-400/50"
          style={{ width: mapSize - 8, height: mapSize - 8 }}
        />
        
        {/* Círculo interior (rango cercano) */}
        <div 
          className="absolute inset-6 rounded-full border border-green-400/30 border-dashed"
          style={{ width: mapSize - 24, height: mapSize - 24 }}
        />

        {/* Línea de escaneo rotatoria */}
        <div
          className="absolute origin-center"
          style={{
            left: centerX,
            top: centerY,
            width: mapSize / 2 - 4,
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(0, 255, 0, 0.8), transparent)',
            transform: `rotate(${scanAngle}deg)`,
            transformOrigin: '0 50%'
          }}
        />

        {/* Efecto de sondeo (pulso) */}
        <div
          className="absolute rounded-full border border-green-400/40"
          style={{
            left: centerX - pulseRadius,
            top: centerY - pulseRadius,
            width: pulseRadius * 2,
            height: pulseRadius * 2,
            opacity: 1 - (pulseRadius / (mapSize / 2)),
            animation: 'pulse 2s infinite'
          }}
        />

        {/* Líneas de dirección */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-px bg-green-400/20" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-px h-full bg-green-400/20" />
        </div>

        {/* Indicadores de dirección */}
        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-xs text-green-400 font-bold">
          N
        </div>
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs text-green-400 font-bold">
          S
        </div>
        <div className="absolute left-1 top-1/2 transform -translate-y-1/2 text-xs text-green-400 font-bold">
          W
        </div>
        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 text-xs text-green-400 font-bold">
          E
        </div>

        {/* Jugador (centro) */}
        <div
          className="absolute bg-green-400 border border-green-300 rounded-full shadow-lg"
          style={{
            left: centerX - 3,
            top: centerY - 3,
            width: 6,
            height: 6
          }}
        />

        {/* Indicador de prueba - punto rojo fijo para verificar que funciona */}
        {detectedEnemies.length === 0 && (
          <div
            className="absolute bg-red-500 border border-red-300 rounded-full animate-pulse"
            style={{
              left: centerX + 20,
              top: centerY - 10,
              width: 6,
              height: 6
            }}
            title="Indicador de prueba - Radar funcionando"
          />
        )}

        {/* Enemigos cercanos (rojo brillante) */}
        {nearbyEnemies.map((enemy) => {
          const radarPos = worldToRadar(enemy.x, enemy.y);
          
          // Solo mostrar si está dentro del radar visible (con margen)
          const margin = 10;
          if (radarPos.x < -margin || radarPos.x > mapSize + margin || 
              radarPos.y < -margin || radarPos.y > mapSize + margin) {
            return null;
          }

          return (
            <div
              key={enemy.id}
              className="absolute bg-red-500 border border-red-300 rounded-full animate-pulse shadow-lg"
              style={{
                left: radarPos.x - 3,
                top: radarPos.y - 3,
                width: 6,
                height: 6,
                opacity: 0.9 + (0.1 * (1 - enemy.distance / radarRange)),
                zIndex: 10
              }}
              title={`Enemigo ${enemy.type} - ${Math.round(enemy.distance)}px (CERCANO) - Pos: (${Math.round(enemy.x)}, ${Math.round(enemy.y)})`}
            />
          );
        })}

        {/* Enemigos lejanos (naranja) */}
        {farEnemies.map((enemy) => {
          const radarPos = worldToRadar(enemy.x, enemy.y);
          
          // Solo mostrar si está dentro del radar visible (con margen)
          const margin = 10;
          if (radarPos.x < -margin || radarPos.x > mapSize + margin || 
              radarPos.y < -margin || radarPos.y > mapSize + margin) {
            return null;
          }

          return (
            <div
              key={enemy.id}
              className="absolute bg-orange-500 border border-orange-300 rounded-full"
              style={{
                left: radarPos.x - 2,
                top: radarPos.y - 2,
                width: 4,
                height: 4,
                opacity: 0.7 + (0.3 * (1 - enemy.distance / radarRange)),
                zIndex: 5
              }}
              title={`Enemigo ${enemy.type} - ${Math.round(enemy.distance)}px - Pos: (${Math.round(enemy.x)}, ${Math.round(enemy.y)})`}
            />
          );
        })}

        {/* Información del radar */}
        <div className="absolute bottom-1 left-1 text-xs text-green-400 font-mono font-bold">
          RADAR
        </div>
        <div className="absolute bottom-1 right-1 text-xs text-green-400 font-mono">
          {detectedEnemies.length}
        </div>
      </div>

      {/* Información adicional */}
      <div className="text-xs text-gray-400 mt-1 text-center">
        <div>Rango: {radarRange}px</div>
        <div>Enemigos: {detectedEnemies.length} | Cercanos: {nearbyEnemies.length}</div>
        {detectedEnemies.length > 0 && (
          <div className="text-red-400 font-bold">
            ¡{detectedEnemies.length} enemigo{detectedEnemies.length > 1 ? 's' : ''} detectado{detectedEnemies.length > 1 ? 's' : ''}!
          </div>
        )}
      </div>
    </div>
  );
}; 