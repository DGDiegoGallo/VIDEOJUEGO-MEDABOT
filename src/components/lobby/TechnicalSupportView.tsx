import React, { useState, useEffect, useRef } from 'react';
import { 
  FaRobot, FaPaperPlane, FaSpinner, FaUser, FaLifeRing, FaMagic
} from 'react-icons/fa';
import { useAuthStore } from '../../stores/authStore';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export const TechnicalSupportView: React.FC = () => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialMessage, setHasInitialMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Generar mensaje inicial de bienvenida
  useEffect(() => {
    if (!hasInitialMessage) {
      generateInitialMessage();
      setHasInitialMessage(true);
    }
  }, [hasInitialMessage]);

  const generateInitialMessage = async () => {
    if (!user) return;

    setIsLoading(true);
    
    const userName = user.nombre || user.username || 'Jugador';
    const welcomeMessage = `Hola ${userName}, soy tu asistente de soporte técnico para el juego Medabot. Estoy aquí para ayudarte con cualquier problema técnico, dudas sobre mecánicas del juego, bugs, configuración o cualquier consulta que tengas. ¿En qué puedo ayudarte hoy?`;

    try {
      const payload = { user: welcomeMessage };
      const res = await fetch('http://localhost:1337/api/prompts/7/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      const botAnswer = data.answer ?? welcomeMessage; // Fallback al mensaje de bienvenida

      // Agregar mensaje inicial del bot
      const initialMessage: ChatMessage = {
        id: Date.now().toString(),
        text: botAnswer,
        isUser: false,
        timestamp: new Date()
      };

      setMessages([initialMessage]);
    } catch (error) {
      console.error('Error getting initial support message:', error);
      // Fallback al mensaje de bienvenida predeterminado
      const fallbackMessage: ChatMessage = {
        id: Date.now().toString(),
        text: welcomeMessage,
        isUser: false,
        timestamp: new Date()
      };
      setMessages([fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !user) return;

    const trimmed = inputMessage.trim();
    setInputMessage('');

    // Agregar mensaje del usuario
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: trimmed,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const userName = user.nombre || user.username || 'Jugador';
      const contextMessage = `Eres "Soporte Técnico" debes ayudar al usuario ${userName} con problemas técnicos, dudas sobre mecánicas del juego, bugs, configuración o cualquier consulta sobre el videojuego Medabot (un juego roguelike con mecánicas de disparo automático, supervivencia, colección de materiales y NFTs). El usuario pregunta: ${trimmed}`;
      
      const payload = { user: contextMessage };
      const res = await fetch('http://localhost:1337/api/prompts/7/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      const botAnswer = data.answer ?? 'Lo siento, no puedo responder en este momento. Por favor, intenta de nuevo.';

      // Agregar respuesta del bot
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: botAnswer,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message to support AI:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Lo siento, hubo un problema al procesar tu consulta. Por favor, intenta de nuevo en unos momentos.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 p-3 rounded-full">
            <FaLifeRing className="text-2xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Soporte Técnico</h2>
            <p className="text-blue-100 opacity-90">
              Asistente de IA para resolver tus dudas técnicas
            </p>
          </div>
          <div className="ml-auto">
            <div className="flex items-center space-x-2 bg-white/20 rounded-full px-3 py-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">En línea</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="h-96 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && isLoading && (
          <div className="flex items-center justify-center py-8">
            <FaSpinner className="animate-spin text-blue-400 text-2xl mr-3" />
            <span className="text-gray-300">Iniciando chat de soporte...</span>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-lg ${
                message.isUser
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              <div className="flex items-start space-x-3">
                {!message.isUser && (
                  <div className="bg-blue-600 p-1.5 rounded-full flex-shrink-0 mt-1">
                    <FaRobot className="text-white text-sm" />
                  </div>
                )}
                {message.isUser && (
                  <div className="bg-blue-200 p-1.5 rounded-full flex-shrink-0 mt-1">
                    <FaUser className="text-blue-600 text-sm" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                  <p className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && messages.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-gray-100 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-1.5 rounded-full">
                  <FaRobot className="text-white text-sm" />
                </div>
                <FaSpinner className="animate-spin text-blue-400" />
                <span className="text-sm">Procesando tu consulta...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-gray-700/50 bg-gray-800/50">
        <div className="flex space-x-4">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe tu problema técnico o haz tu consulta..."
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none resize-none"
              rows={3}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-400 mt-2">
              Presiona Enter para enviar, Shift+Enter para nueva línea
            </p>
          </div>
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 self-start"
          >
            {isLoading ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaPaperPlane />
            )}
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </div>
        
        {/* Quick Help Tips */}
        <div className="mt-4 p-4 bg-gray-700/30 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
            <FaMagic className="mr-2 text-blue-400" />
            Consejos rápidos:
          </h4>
          <div className="flex flex-wrap gap-2">
            {[
              'Problemas de rendimiento',
              'Errores de carga',
              'Controles del juego',
              'Mecánicas de supervivencia',
              'Sistema de NFTs',
              'Problemas de guardado'
            ].map((tip) => (
              <button
                key={tip}
                onClick={() => setInputMessage(tip)}
                className="text-xs bg-gray-600 hover:bg-gray-500 text-gray-200 px-3 py-1 rounded-full transition-colors"
              >
                {tip}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 