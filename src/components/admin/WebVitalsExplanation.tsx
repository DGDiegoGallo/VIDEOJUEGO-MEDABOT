import React, { useState } from 'react';
import { FiInfo, FiClock, FiZap, FiActivity, FiTrendingUp, FiChevronDown, FiChevronUp } from 'react-icons/fi';

export const WebVitalsExplanation: React.FC = () => {
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

  const webVitalsMetrics = [
    {
      id: 'fcp',
      name: 'First Contentful Paint (FCP)',
      icon: FiZap,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Tiempo hasta que aparece el primer contenido visible en la página',
      details: [
        'Mide cuándo el navegador renderiza el primer elemento DOM con contenido',
        'Incluye texto, imágenes, elementos canvas no blancos o SVGs',
        'Valores recomendados: < 1.8 segundos (bueno), 1.8-3.0s (necesita mejora), > 3.0s (pobre)',
        'Importante para la percepción de velocidad del usuario'
      ],
      goodValue: '< 1.8s',
      needsImprovement: '1.8s - 3.0s',
      poorValue: '> 3.0s'
    },
    {
      id: 'lcp',
      name: 'Largest Contentful Paint (LCP)',
      icon: FiActivity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Tiempo hasta que se renderiza el elemento de contenido más grande visible',
      details: [
        'Mide cuándo se carga el elemento más grande del viewport inicial',
        'Puede ser una imagen, video, bloque de texto grande o elemento a nivel de bloque',
        'Valores recomendados: < 2.5 segundos (bueno), 2.5-4.0s (necesita mejora), > 4.0s (pobre)',
        'Indica cuándo el contenido principal de la página ha terminado de cargar'
      ],
      goodValue: '< 2.5s',
      needsImprovement: '2.5s - 4.0s',
      poorValue: '> 4.0s'
    },
    {
      id: 'cls',
      name: 'Cumulative Layout Shift (CLS)',
      icon: FiTrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Mide la estabilidad visual de la página durante la carga',
      details: [
        'Suma de todas las puntuaciones de cambio de diseño inesperadas',
        'Ocurre cuando elementos visibles cambian de posición entre frames',
        'Valores recomendados: < 0.1 (bueno), 0.1-0.25 (necesita mejora), > 0.25 (pobre)',
        'Importante para evitar clics accidentales y mejorar la experiencia del usuario'
      ],
      goodValue: '< 0.1',
      needsImprovement: '0.1 - 0.25',
      poorValue: '> 0.25'
    },
    {
      id: 'ttfb',
      name: 'Time to First Byte (TTFB)',
      icon: FiClock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Tiempo hasta recibir el primer byte de respuesta del servidor',
      details: [
        'Mide el tiempo desde la solicitud hasta el primer byte de respuesta',
        'Incluye tiempo de DNS, conexión TCP, SSL y respuesta del servidor',
        'Valores recomendados: < 600ms (bueno), 600ms-1.4s (necesita mejora), > 1.4s (pobre)',
        'Fundamental para optimizar el rendimiento del servidor y la red'
      ],
      goodValue: '< 600ms',
      needsImprovement: '600ms - 1.4s',
      poorValue: '> 1.4s'
    }
  ];

  const toggleExpanded = (metricId: string) => {
    setExpandedMetric(expandedMetric === metricId ? null : metricId);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-6">
        <FiInfo className="h-6 w-6 text-blue-600 mr-2" />
        <h3 className="text-lg font-medium text-gray-900">
          Explicación de Métricas Web Vitals
        </h3>
      </div>

      <div className="space-y-4">
        {webVitalsMetrics.map((metric) => {
          const Icon = metric.icon;
          const isExpanded = expandedMetric === metric.id;

          return (
            <div key={metric.id} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleExpanded(metric.id)}
                className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`${metric.bgColor} rounded-lg p-2 mr-3`}>
                      <Icon className={`h-5 w-5 ${metric.color}`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{metric.name}</h4>
                      <p className="text-sm text-gray-600">{metric.description}</p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <FiChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <FiChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <div className="mt-4 space-y-3">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Detalles:</h5>
                      <ul className="space-y-1">
                        {metric.details.map((detail, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-xs font-medium text-green-800 mb-1">BUENO</div>
                        <div className="text-sm font-semibold text-green-900">{metric.goodValue}</div>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <div className="text-xs font-medium text-yellow-800 mb-1">NECESITA MEJORA</div>
                        <div className="text-sm font-semibold text-yellow-900">{metric.needsImprovement}</div>
                      </div>
                      <div className="bg-red-50 p-3 rounded-lg">
                        <div className="text-xs font-medium text-red-800 mb-1">POBRE</div>
                        <div className="text-sm font-semibold text-red-900">{metric.poorValue}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">¿Por qué son importantes las Web Vitals?</h4>
        <p className="text-sm text-blue-800">
          Las Core Web Vitals son métricas esenciales que Google utiliza para evaluar la experiencia del usuario 
          en tu sitio web. Estas métricas afectan directamente el SEO y la satisfacción del usuario, 
          impactando en las conversiones y el engagement de tu juego.
        </p>
      </div>
    </div>
  );
};