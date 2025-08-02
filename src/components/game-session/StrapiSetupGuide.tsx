import React from 'react';
import { FaExclamationTriangle, FaDatabase, FaCog, FaCheckCircle } from 'react-icons/fa';

export const StrapiSetupGuide: React.FC = () => {
  return (
    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-4">
        <FaExclamationTriangle className="text-yellow-400 text-xl" />
        <h3 className="text-yellow-400 font-semibold text-lg">
          Configuración Requerida en Strapi
        </h3>
      </div>
      
      <p className="text-gray-300 mb-6">
        La colección <code className="bg-gray-800 px-2 py-1 rounded">game-sessions</code> no existe en tu Strapi. 
        Sigue estos pasos para crearla:
      </p>

      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold mt-1">
            1
          </div>
          <div>
            <h4 className="font-semibold text-white mb-1">Abrir Content-Type Builder</h4>
            <p className="text-gray-400 text-sm">
              Ve a tu panel de Strapi → <strong>Content-Type Builder</strong>
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold mt-1">
            2
          </div>
          <div>
            <h4 className="font-semibold text-white mb-1">Crear Collection Type</h4>
            <p className="text-gray-400 text-sm">
              Haz clic en <strong>"Create new collection type"</strong>
            </p>
            <div className="bg-gray-800 rounded p-2 mt-2 text-sm">
              <div>• Display name: <code className="text-blue-400">Game Sessions</code></div>
              <div>• API ID (singular): <code className="text-blue-400">game-session</code></div>
              <div>• API ID (plural): <code className="text-blue-400">game-sessions</code></div>
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold mt-1">
            3
          </div>
          <div>
            <h4 className="font-semibold text-white mb-1">Agregar Campos Básicos</h4>
            <p className="text-gray-400 text-sm mb-2">
              Agrega estos campos mínimos para empezar:
            </p>
            <div className="bg-gray-800 rounded p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-400">users_permissions_user</span>
                <span className="text-gray-400">Relation (Many to One → User)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-400">session_name</span>
                <span className="text-gray-400">Text (Required)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-400">game_mode</span>
                <span className="text-gray-400">Enumeration (survival, adventure, challenge)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-400">session_stats</span>
                <span className="text-gray-400">JSON</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-400">started_at</span>
                <span className="text-gray-400">DateTime</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold mt-1">
            4
          </div>
          <div>
            <h4 className="font-semibold text-white mb-1">Guardar y Reiniciar</h4>
            <p className="text-gray-400 text-sm">
              Haz clic en <strong>"Save"</strong> y luego <strong>"Restart"</strong> cuando Strapi lo solicite
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold mt-1">
            5
          </div>
          <div>
            <h4 className="font-semibold text-white mb-1">Configurar Permisos</h4>
            <p className="text-gray-400 text-sm">
              Ve a <strong>Settings → Roles & Permissions → Authenticated</strong> y habilita:
            </p>
            <div className="bg-gray-800 rounded p-2 mt-2 text-sm">
              <div>• <code className="text-green-400">find</code> - Para leer sesiones</div>
              <div>• <code className="text-green-400">create</code> - Para crear sesiones</div>
              <div>• <code className="text-green-400">update</code> - Para actualizar sesiones</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <FaCheckCircle className="text-green-400" />
          <span className="text-green-400 font-semibold">Una vez completado:</span>
        </div>
        <p className="text-gray-300 text-sm">
          Recarga esta página y los controles de prueba funcionarán correctamente.
        </p>
      </div>

      <div className="mt-4 flex justify-center">
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
        >
          <FaDatabase />
          <span>Recargar Página</span>
        </button>
      </div>
    </div>
  );
};