'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaSlidersH, FaPaperPlane, FaTimes } from 'react-icons/fa';

export default function ChatConConfiguracion() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [windowWidth, setWindowWidth] = useState(1024);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para el popup de la auditoría
  const [auditContent, setAuditContent] = useState(''); // Contenido de la auditoría
  const [isAlertOpen, setIsAlertOpen] = useState(false); // Estado para el alert
  const [errorMessage, setErrorMessage] = useState(''); // Estado para errores

  const messagesEndRef = useRef(null);
  const isMobile = windowWidth < 640;
  const API_URL = 'https://gly-ai-brain.onrender.com';
  const REQUEST_TIMEOUT = 30000; // 30 segundos de tiempo de espera

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Enviar solicitud inicial al cargar el componente
  useEffect(() => {
    if (messages.length === 0) {
      const fetchInitialMessage = async () => {
        setIsLoading(true);
        setErrorMessage('');
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

          const requestData = {
            query: 'iniciar conversación',
            rol: 'Auditor',
            temperatura: 0.7,
            estilo: 'Formal',
            config: {}
          };

          const response = await fetch(`${API_URL}/gpt`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
          }

          const data = await response.json();
          const respuesta = data.respuesta || data.message || "No se pudo procesar la respuesta";
          setMessages([{ from: 'ia', text: respuesta }]);
        } catch (error) {
          console.error('Error al obtener el mensaje inicial:', error);
          const errorMsg = error.name === 'AbortError'
            ? 'La solicitud inicial tardó demasiado. Por favor, intenta recargar la página.'
            : `Error: ${error.message}`;
          setErrorMessage(errorMsg);
          setMessages([{
            from: 'ia',
            text: `⚠️ ${errorMsg}`
          }]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchInitialMessage();
    }
  }, []);

  const sendRequest = async (query) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const requestData = {
        query,
        rol: 'Auditor',
        temperatura: 0.7,
        estilo: 'Formal',
        config: {}
      };

      const response = await fetch(`${API_URL}/gpt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { from: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setErrorMessage(''); // Limpiar mensajes de error previos

    try {
      // Detectar si el usuario escribió "generar auditoria"
      if (input.trim().toLowerCase() === 'generar auditoria') {
        setIsAlertOpen(true); // Mostrar el alert
        setIsLoading(false); // Detener el estado de carga
        return;
      }

      const data = await sendRequest(input);
      const respuesta = data.respuesta || data.message || "No se pudo procesar la respuesta";
      setMessages(prev => [...prev, { from: 'ia', text: respuesta }]);
    } catch (error) {
      console.error('Error al conectar con GLY-ai-Brain:', error);
      const errorMsg = error.name === 'AbortError'
        ? 'La solicitud tardó demasiado. Por favor, intenta nuevamente.'
        : `Error: ${error.message}`;
      setErrorMessage(errorMsg);
      setMessages(prev => [...prev, {
        from: 'ia',
        text: `⚠️ ${errorMsg}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAudit = async () => {
    setIsAlertOpen(false); // Cerrar el alert
    setIsLoading(true);
    setErrorMessage(''); // Limpiar mensajes de error previos

    try {
      const data = await sendRequest('generar auditoria');

      // Verificar si la respuesta contiene una auditoría
      if (data.propuesta) {
        setAuditContent(data.propuesta); // Guardar el contenido de la auditoría
        setIsModalOpen(true); // Abrir el popup
        setMessages(prev => [...prev, { from: 'ia', text: data.respuesta }]);
      } else {
        setMessages(prev => [...prev, {
          from: 'ia',
          text: '⚠️ No se pudo generar la auditoría. Por favor, intenta de nuevo.'
        }]);
      }
    } catch (error) {
      console.error('Error al generar la auditoría:', error);
      const errorMsg = error.name === 'AbortError'
        ? 'La solicitud tardó demasiado. Por favor, intenta nuevamente.'
        : `Error al generar la auditoría: ${error.message}`;
      setErrorMessage(errorMsg);
      setMessages(prev => [...prev, {
        from: 'ia',
        text: `⚠️ ${errorMsg}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setAuditContent('');
  };

  const closeAlert = () => {
    setIsAlertOpen(false);
  };

  return (
    <div className={`flex items-center justify-center bg-white bg-opacity-70 relative transition-all duration-500 ease-in-out ${messages.length === 0 ? 'min-h-[40vh]' : 'h-screen'}`}>
      <div className={`flex flex-col flex-1 w-[80vw] max-w-4xl bg-white rounded-3xl shadow-2xl px-[4vw] py-[5vh] transition-all duration-500 ease-in-out ${messages.length === 0 ? 'min-h-[30vh]' : 'h-[90vh]'}`}>
        {/* CONTENEDOR DE MENSAJES */}
        <div className={`overflow-y-auto space-y-4 transition-all duration-500 ease-in-out ${messages.length === 0 ? 'flex-0' : 'flex-1'}`}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm shadow-sm leading-relaxed whitespace-pre-wrap font-sans
                  ${msg.from === 'ia' ? 'bg-white text-gray-800 border border-gray-200' : 'bg-black text-white border border-black'}`}
              >
                {msg.text}
              </motion.div>
            </div>
          ))}
  
          {isLoading && (
            <div className="flex justify-start">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="px-4 py-3 rounded-lg text-sm text-gray-600"
              >
                Pensando...
              </motion.div>
            </div>
          )}
  
          <div ref={messagesEndRef} />
        </div>
  
        {/* CONTENEDOR DE INPUT */}
        <div className="mt-6">
          <div className="flex items-center gap-3 border border-gray-300 bg-gray-50 rounded-full shadow-md p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 border-none focus:outline-none text-sm placeholder:text-gray-400 bg-transparent"
              placeholder="Escribe tu mensaje..."
              disabled={isLoading}
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: isLoading ? 1 : 1.1 }}
              onClick={handleSend}
              disabled={isLoading}
              className={`text-white bg-black hover:bg-gray-900 rounded-full p-2 transition ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FaPaperPlane size={16} />
            </motion.button>
          </div>
        </div>
  
        {/* ALERT MODAL */}
        {isAlertOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl shadow-xl max-w-md w-full mx-4 p-6 relative"
            >
              <button
                onClick={closeAlert}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
              >
                <FaTimes size={20} />
              </button>
              <h2 className="text-xl font-bold mb-4 text-gray-800">Confirmar Generación de Auditoría</h2>
              <p className="text-gray-700 text-sm mb-6">
                ¿Estás seguro de que deseas generar el informe técnico consultivo ahora?
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={closeAlert}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGenerateAudit}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition"
                >
                  Generar Auditoría
                </button>
              </div>
            </motion.div>
          </div>
        )}
  
        {/* AUDITORÍA MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto p-6 relative"
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
              >
                <FaTimes size={20} />
              </button>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Informe Técnico Consultivo</h2>
              <div className="text-gray-700 text-sm whitespace-pre-wrap">{auditContent}</div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
  
  
        }