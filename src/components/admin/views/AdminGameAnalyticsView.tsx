import React, { useState } from 'react';
import { GameAnalyticsCharts } from '../GameAnalyticsCharts';
import { GameAnalyticsStats } from '../GameAnalyticsStats';
import { PlayerRankings } from '../PlayerRankings';
import { WeaponStats } from '../WeaponStats';
import { QuestStats } from '../QuestStats';
import { ExplanationModal } from '../ExplanationModal';
import type { AdminDashboardData } from '@/types/admin';

interface AdminGameAnalyticsViewProps {
  data: AdminDashboardData | null;
}

export const AdminGameAnalyticsView: React.FC<AdminGameAnalyticsViewProps> = ({ data }) => {
  const [showExplanation, setShowExplanation] = useState<string | null>(null);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando análisis de juego...</p>
        </div>
      </div>
    );
  }

  const { analytics } = data;

  const explanations = {
    overview: {
      title: "Resumen General",
      content: `
        <p><strong>Análisis de Juego</strong> proporciona una vista completa del rendimiento y actividad de todos los jugadores.</p>
        <ul>
          <li><strong>Materiales Totales:</strong> Suma de todos los recursos recolectados por todos los jugadores</li>
          <li><strong>Estadísticas de Combate:</strong> Métricas de rendimiento en batalla incluyendo precisión y daño</li>
          <li><strong>Estadísticas de Supervivencia:</strong> Tiempo de juego, niveles alcanzados y tasa de victoria</li>
          <li><strong>Rankings:</strong> Clasificación de jugadores basada en múltiples factores de rendimiento</li>
        </ul>
      `
    },
    combat: {
      title: "Estadísticas de Combate",
      content: `
        <p>Las <strong>Estadísticas de Combate</strong> muestran el rendimiento de los jugadores en batalla:</p>
        <ul>
          <li><strong>Enemigos Derrotados:</strong> Total de enemigos eliminados por todos los jugadores, divididos por tipo</li>
          <li><strong>Precisión Promedio:</strong> Porcentaje de disparos que impactaron el objetivo (disparos certeros / disparos totales)</li>
          <li><strong>Daño Total Infligido:</strong> Cantidad total de daño causado por todos los jugadores</li>
          <li><strong>Barriles Destruidos:</strong> Objetos explosivos eliminados que causan daño en área</li>
        </ul>
        <p><strong>Interpretación:</strong></p>
        <ul>
          <li>Precisión >70% = Jugadores experimentados</li>
          <li>Zombies vs Tanques = Indica preferencia de objetivos</li>
          <li>Alto daño infligido = Estrategias agresivas efectivas</li>
        </ul>
      `
    },
    survival: {
      title: "Estadísticas de Supervivencia",
      content: `
        <p>Las <strong>Estadísticas de Supervivencia</strong> evalúan la longevidad y progreso de los jugadores:</p>
        <ul>
          <li><strong>Tiempo Total de Juego:</strong> Suma de todas las sesiones de todos los jugadores</li>
          <li><strong>Tasa de Victoria:</strong> Porcentaje de partidas completadas exitosamente (victorias / partidas totales)</li>
          <li><strong>Nivel Promedio:</strong> Progresión típica alcanzada por los jugadores</li>
          <li><strong>Cajas de Suministros:</strong> Recursos recolectados que mejoran las capacidades del jugador</li>
        </ul>
        <p><strong>Métricas de Calidad:</strong></p>
        <ul>
          <li>Tasa de Victoria >60% = Buen balance de dificultad</li>
          <li>Tiempo promedio >10min = Engagement alto</li>
          <li>Nivel promedio >5 = Progresión saludable</li>
        </ul>
      `
    },
    rankings: {
      title: "Rankings de Jugadores",
      content: `
        <p>Los <strong>Rankings</strong> clasifican a los jugadores usando un sistema de puntuación ponderado:</p>
        <ul>
          <li><strong>Puntuación Total (25%):</strong> Puntos acumulados en todas las partidas</li>
          <li><strong>Tiempo de Juego (15%):</strong> Duración total de actividad (engagement)</li>
          <li><strong>Precisión (20%):</strong> Porcentaje de disparos certeros (habilidad)</li>
          <li><strong>Enemigos Derrotados (15%):</strong> Cantidad de enemigos eliminados (efectividad)</li>
          <li><strong>Misiones Completadas (10%):</strong> Objetivos diarios cumplidos (constancia)</li>
          <li><strong>Tasa de Victoria (10%):</strong> Porcentaje de partidas ganadas (éxito)</li>
          <li><strong>Materiales (5%):</strong> Recursos recolectados (exploración)</li>
        </ul>
        <p><strong>Fórmula:</strong> Activity Score = (Puntos × 0.25) + (Tiempo × 0.15) + (Precisión × 0.20) + (Enemigos × 0.15) + (Misiones × 0.10) + (Victoria × 0.10) + (Materiales × 0.05)</p>
      `
    },
    weapons: {
      title: "Estadísticas de Armas",
      content: `
        <p>Las <strong>Estadísticas de Armas</strong> muestran qué armas prefieren los jugadores:</p>
        <ul>
          <li><strong>Uso:</strong> Número de veces que cada arma ha sido equipada</li>
          <li><strong>Daño Promedio:</strong> Daño base del arma</li>
          <li><strong>Rareza:</strong> Clasificación de la dificultad para obtener el arma</li>
        </ul>
        <p><strong>Colores de Rareza:</strong></p>
        <ul>
          <li><span style="color: #6b7280;">Común</span> - Armas básicas disponibles desde el inicio</li>
          <li><span style="color: #059669;">Poco Común</span> - Armas mejoradas con mejor rendimiento</li>
          <li><span style="color: #2563eb;">Rara</span> - Armas especializadas con características únicas</li>
          <li><span style="color: #7c3aed;">Épica</span> - Armas poderosas con efectos especiales</li>
          <li><span style="color: #d97706;">Legendaria</span> - Armas excepcionales con máximo poder</li>
        </ul>
      `
    },

    quests: {
      title: "Estadísticas de Misiones Diarias",
      content: `
        <p>Las <strong>Misiones Diarias</strong> son objetivos que se renuevan cada día para mantener el engagement:</p>
        <ul>
          <li><strong>Misiones Completadas:</strong> Total de objetivos cumplidos por todos los jugadores</li>
          <li><strong>Promedio por Jugador:</strong> Número típico de misiones que completa cada jugador</li>
          <li><strong>Tipos de Misiones:</strong> Distribución de los diferentes objetivos disponibles</li>
        </ul>
        <p><strong>Tipos de Misiones:</strong></p>
        <ul>
          <li><strong>Eliminar Enemigos:</strong> Derrotar una cantidad específica de enemigos</li>
          <li><strong>Tiempo de Supervivencia:</strong> Sobrevivir por un período determinado</li>
          <li><strong>Destruir Barriles:</strong> Eliminar objetos explosivos</li>
          <li><strong>Recolectar Materiales:</strong> Obtener recursos específicos</li>
        </ul>
        <p><strong>Métricas de Salud:</strong></p>
        <ul>
          <li>Promedio >2 misiones/jugador = Engagement alto</li>
          <li>Distribución equilibrada = Variedad de gameplay</li>
          <li>Alta completación = Dificultad apropiada</li>
        </ul>
      `
    },
    materials: {
      title: "Gráfico de Materiales",
      content: `
        <p>El <strong>Gráfico de Materiales</strong> muestra la distribución de recursos recolectados:</p>
        <ul>
          <li><strong>Acero:</strong> Material básico para construcción y mejoras</li>
          <li><strong>Celdas de Energía:</strong> Combustible para armas y equipos avanzados</li>
          <li><strong>Medicina:</strong> Recursos para curación y supervivencia</li>
          <li><strong>Comida:</strong> Suministros para mantener la salud</li>
        </ul>
        <p><strong>Interpretación:</strong></p>
        <ul>
          <li>Distribución equilibrada = Gameplay balanceado</li>
          <li>Dominancia de un material = Posible desbalance</li>
          <li>Bajos valores = Dificultad de recolección alta</li>
        </ul>
      `
    },
    enemies: {
      title: "Gráfico de Enemigos Eliminados",
      content: `
        <p>El <strong>Gráfico de Enemigos</strong> muestra qué tipos de enemigos enfrentan más los jugadores:</p>
        <ul>
          <li><strong>Zombies (Rojo):</strong> Enemigos básicos, lentos pero numerosos</li>
          <li><strong>Velocistas (Azul):</strong> Enemigos rápidos, difíciles de golpear</li>
          <li><strong>Tanques (Gris):</strong> Enemigos pesados, alta resistencia</li>
        </ul>
        <p><strong>Análisis de Balance:</strong></p>
        <ul>
          <li>Zombies altos = Spawn rate apropiado para enemigos básicos</li>
          <li>Velocistas moderados = Desafío de precisión balanceado</li>
          <li>Tanques bajos = Enemigos especiales bien dosificados</li>
        </ul>
      `
    },
    topPlayers: {
      title: "Gráfico de Top Jugadores",
      content: `
        <p>El <strong>Gráfico de Top Jugadores</strong> visualiza los 5 jugadores más activos:</p>
        <ul>
          <li><strong>Eje Y:</strong> Puntuación de actividad calculada</li>
          <li><strong>Eje X:</strong> Nombres de usuario de los jugadores</li>
          <li><strong>Color:</strong> Púrpura indica alto rendimiento</li>
        </ul>
        <p><strong>Fórmula de Actividad:</strong></p>
        <ul>
          <li>Puntuación Total × 0.25</li>
          <li>Tiempo de Juego × 0.15</li>
          <li>Precisión × 0.20</li>
          <li>Enemigos Derrotados × 0.15</li>
          <li>Misiones × 0.10</li>
          <li>Tasa Victoria × 0.10</li>
          <li>Materiales × 0.05</li>
        </ul>
      `
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Explanation */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Análisis de Juego</h2>
            <p className="text-gray-600">
              Estadísticas detalladas del rendimiento de los jugadores y actividad en el juego
            </p>
          </div>
          <button
            onClick={() => setShowExplanation('overview')}
            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm hover:bg-blue-200 transition-colors"
          >
            ¿Qué significa esto?
          </button>
        </div>
      </div>

      {/* Game Statistics Overview */}
      <GameAnalyticsStats 
        analytics={analytics} 
        onExplain={(type) => setShowExplanation(type)}
      />

      {/* Charts */}
      <GameAnalyticsCharts 
        analytics={analytics}
        onExplain={(type) => setShowExplanation(type)}
      />

      {/* Additional Stats Sections */}
      <div className="grid grid-cols-1 gap-8">
        <WeaponStats 
          weaponStats={analytics.weaponStats}
          onExplain={(type) => setShowExplanation(type)}
        />
      </div>

      <QuestStats 
        questStats={analytics.questStats}
        onExplain={(type) => setShowExplanation(type)}
      />

      {/* Player Rankings */}
      <PlayerRankings 
        rankings={analytics.playerRankings} 
        onExplain={(type) => setShowExplanation(type)}
      />

      {/* Explanation Modal */}
      {showExplanation && explanations[showExplanation as keyof typeof explanations] && (
        <ExplanationModal
          title={explanations[showExplanation as keyof typeof explanations].title}
          content={explanations[showExplanation as keyof typeof explanations].content}
          onClose={() => setShowExplanation(null)}
        />
      )}
    </div>
  );
};