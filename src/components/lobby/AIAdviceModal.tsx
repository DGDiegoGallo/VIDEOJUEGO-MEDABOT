import React, { useState, useEffect, useRef } from 'react';
import { 
  FaTimes, FaRobot, FaPaperPlane, FaSpinner, FaUser, FaMagic
} from 'react-icons/fa';
import { useAuthStore } from '../../stores/authStore';

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  type: string;
  target: number;
  progress: number;
  reward: number;
  completed: boolean;
  completedAt?: string;
}

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface AIAdviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  quest: DailyQuest | null;
}

export const AIAdviceModal: React.FC<AIAdviceModalProps> = ({ 
  isOpen, 
  onClose, 
  quest 
}) => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialAdvice, setHasInitialAdvice] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Generar consejo inicial cuando se abra el modal
  useEffect(() => {
    if (isOpen && quest && !hasInitialAdvice) {
      generateInitialAdvice();
      setHasInitialAdvice(true);
    }
  }, [isOpen, quest, hasInitialAdvice]);

  // Limpiar estado cuando se cierre el modal
  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setInputMessage('');
      setHasInitialAdvice(false);
      setIsLoading(false);
    }
  }, [isOpen]);

  const generateInitialAdvice = async () => {
    if (!quest || !user) return;

    setIsLoading(true);
    
    const userName = user.nombre || user.username || 'Jugador';
    const contextMessage = `El usuario ${userName} pide un consejo particular sobre la siguiente misión: "${quest.title}" - ${quest.description}. La mecánica de juego es: Disparo automático y como es automático, precisión en movimiento, utilizar el campo de batalla, sobrevivir y ahorrar recursos como vendajes. Por favor responde de forma concisa al usuario en particular.`;

    try {
      const payload = { user: contextMessage };
      const res = await fetch('http://localhost:1337/api/prompts/7/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      const botAnswer = data.answer ?? 'Lo siento, no puedo responder en este momento.';

      // Agregar mensaje inicial del bot
      const initialMessage: ChatMessage = {
        id: Date.now().toString(),
        text: botAnswer,
        isUser: false,
        timestamp: new Date()
      };

      setMessages([initialMessage]);
    } catch (error) {
      console.error('Error getting initial AI advice:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        text: 'Lo siento, hubo un problema al conectar con el asistente de IA. Por favor, intenta de nuevo.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages([errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !quest || !user) return;

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
      const contextMessage = `Eres "Soporte" debes ayudar al usuario ${userName}. El contexto es sobre la misión "${quest.title}" - ${quest.description}. Las mecánicas del juego incluyen: disparo automático, precisión en movimiento, uso del campo de batalla, supervivencia y conservación de recursos como vendajes. El usuario pregunta: ${trimmed}`;
      
      const payload = { user: contextMessage };
      const res = await fetch('http://localhost:1337/api/prompts/7/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      const botAnswer = data.answer ?? 'Lo siento, no puedo responder en este momento.';

      // Agregar respuesta del bot
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: botAnswer,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message to AI:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Lo siento, hubo un problema al procesar tu mensaje. Por favor, intenta de nuevo.',
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl max-w-2xl w-full max-h-[80vh] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <FaRobot className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Asistente de IA</h2>
              <p className="text-sm text-gray-400">
                Consejos para: {quest?.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl transition-colors p-2"
          >
            <FaTimes />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]">
          {messages.length === 0 && isLoading && (
            <div className="flex items-center justify-center py-8">
              <FaSpinner className="animate-spin text-blue-400 text-2xl mr-3" />
              <span className="text-gray-300">Generando consejo inicial...</span>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-100'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {!message.isUser && (
                    <FaMagic className="text-blue-400 mt-1 flex-shrink-0" />
                  )}
                  {message.isUser && (
                    <FaUser className="text-blue-200 mt-1 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && messages.length > 0 && (
            <div className="flex justify-start">
              <div className="bg-gray-700 text-gray-100 p-3 rounded-lg">
                <FaSpinner className="animate-spin text-blue-400" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex space-x-3">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu pregunta sobre esta misión..."
              className="flex-1 bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none resize-none"
              rows={2}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              {isLoading ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaPaperPlane />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Presiona Enter para enviar, Shift+Enter para nueva línea
          </p>
        </div>
      </div>
    </div>
  );
}; 