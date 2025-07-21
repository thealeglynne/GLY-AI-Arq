'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaTimes } from 'react-icons/fa';
import { getCurrentUser, subscribeToAuthState } from '../../lib/supabaseClient';
import GuardarAuditoria from '../components/saveChat';
import ListaAuditorias from '../components/ListaAuditorias';
import ModalInicio from '../components/AnalisisProcesos';

export default function ChatConConfiguracion() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [windowWidth, setWindowWidth] = useState(1024);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [auditContent, setAuditContent] = useState('');
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [exitPromptVisible, setExitPromptVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoginPopupVisible, setIsLoginPopupVisible] = useState(false);
  const [empresaInfo, setEmpresaInfo] = useState({ nombreEmpresa: '', rol: '' });
  const [showFloatingAlert, setShowFloatingAlert] = useState(false);
  const messagesEndRef = useRef(null);
  const isMobile = windowWidth < 640;
  const API_URL = 'https://gly-ai-brain.onrender.com';
  const REQUEST_TIMEOUT = 40000;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (!currentUser) setIsLoginPopupVisible(true);
    };
    fetchUser();

    const subscription = subscribeToAuthState((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) setIsLoginPopupVisible(false);
    });

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    if (messages.length === 0) {
      const fetchInitialMessage = async () => {
        setIsLoading(true);
        setErrorMessage('');
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

          const response = await fetch(`${API_URL}/gpt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: 'iniciar conversación',
              rol: 'Auditor',
              temperatura: 0.7,
              estilo: 'Formal',
              config: {},
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          const data = await response.json();
          const respuesta = data.respuesta || data.message || "No se pudo procesar la respuesta";
          setMessages([{ from: 'ia', text: respuesta }]);
        } catch (error) {
          const errorMsg = error.name === 'AbortError'
            ? 'La solicitud inicial tardó demasiado. Por favor, intenta recargar la página.'
            : `Error: ${error.message}`;
          setErrorMessage(errorMsg);
          setMessages([{ from: 'ia', text: `⚠️ ${errorMsg}` }]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchInitialMessage();
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (messages.length > 0) {
        e.preventDefault();
        e.returnValue = '';
        setExitPromptVisible(true);
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [messages]);

  const sendRequest = async (query) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    const response = await fetch(`${API_URL}/gpt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        rol: 'Auditor',
        temperatura: 0.7,
        estilo: 'Formal',
        config: {
          empresa: empresaInfo.nombreEmpresa,
          rolUsuario: empresaInfo.rol
        },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = { from: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setErrorMessage('');

    try {
      if (input.trim().toLowerCase() === 'generar auditoria') {
        setIsAlertOpen(true);
        setIsLoading(false);
        return;
      }
      const data = await sendRequest(input);
      const respuesta = data.respuesta || data.message || "No se pudo procesar la respuesta";

      if (respuesta.toLowerCase().includes('generar auditoria')) {
        setShowFloatingAlert(true);
        setTimeout(() => setShowFloatingAlert(false), 10000);
      }

      setMessages(prev => [...prev, { from: 'ia', text: respuesta }]);
    } catch (error) {
      const errorMsg = error.name === 'AbortError'
        ? 'La solicitud tardó demasiado.'
        : `Error: ${error.message}`;
      setErrorMessage(errorMsg);
      setMessages(prev => [...prev, { from: 'ia', text: `⚠️ ${errorMsg}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAudit = async () => {
    setIsAlertOpen(false);
    setIsLoading(true);
    try {
      const data = await sendRequest('generar auditoria');
      if (data.propuesta) {
        setAuditContent(data.propuesta);
        setIsModalOpen(true);
        setMessages(prev => [...prev, { from: 'ia', text: data.respuesta }]);
      } else {
        setMessages(prev => [...prev, {
          from: 'ia',
          text: '⚠️ No se pudo generar la auditoría.',
        }]);
      }
    } catch (error) {
      const errorMsg = error.name === 'AbortError'
        ? 'La solicitud tardó demasiado.'
        : `Error: ${error.message}`;
      setErrorMessage(errorMsg);
      setMessages(prev => [...prev, { from: 'ia', text: `⚠️ ${errorMsg}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerAuditCommand = () => {
    setInput('generar auditoria');
    setShowFloatingAlert(false);
    setTimeout(() => handleSend(), 100);
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-white">
      <div className="w-[95%] sm:w-full md:w-[90%] lg:w-[80%] h-[80vh] md:h-[90vh] bg-gray-100 rounded-xl shadow-xl overflow-hidden flex flex-col lg:flex-row border border-gray-200">
        <ModalInicio onComplete={(info) => setEmpresaInfo(info)} />
        <div className="hidden lg:block lg:w-[30%] h-full bg-white border-r border-gray-200 overflow-y-auto p-4">
          <ListaAuditorias />
        </div>

        {/* Chat principal */}
        <div className="flex flex-col flex-1 px-3 sm:px-6 py-3 sm:py-5 bg-white h-full">
          <div className="overflow-y-auto space-y-4 flex-1 pr-1">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`max-w-[90%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-sm shadow-md leading-relaxed whitespace-pre-wrap backdrop-blur-md
                    ${msg.from === 'ia'
                      ? 'bg-white/30 text-gray-800 border border-white/60'
                      : 'bg-black/90 text-white border border-black/60'}`}
                >
                  {msg.text}
                </motion.div>
              </div>
            ))}
            {isLoading && (
              <motion.div className="text-sm text-gray-500 px-2">Pensando...</motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="mt-4 sm:mt-6">
            <div className="flex items-center gap-2 sm:gap-3 border border-gray-300 bg-gray-50 rounded-full shadow-md p-2 sm:p-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Escribe tu mensaje..."
                className="flex-1 bg-transparent focus:outline-none text-sm text-black"
                disabled={isLoading}
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: isLoading ? 1 : 1.1 }}
                onClick={handleSend}
                disabled={isLoading}
                className="text-white bg-black hover:bg-gray-900 rounded-full p-2 transition"
              >
                <FaPaperPlane size={16} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating alert */}
      <AnimatePresence>
        {showFloatingAlert && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
            className="fixed top-5 right-5 bg-black text-white rounded-xl shadow-lg px-4 py-3 z-[1000] flex items-center gap-4"
          >
            <span className="text-sm">Auditoría lista para generar</span>
            <button
              onClick={triggerAuditCommand}
              className="bg-white text-black text-xs px-3 py-1 rounded-full hover:bg-gray-200 transition"
            >
              Generar ahora
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alert modal */}
      {isAlertOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl shadow-xl max-w-md w-full mx-4 p-6 relative"
          >
            <button onClick={() => setIsAlertOpen(false)} className="absolute top-4 right-4 text-gray-600">
              <FaTimes size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">¿Listo para generar tu informe técnico?</h2>
            <p className="text-sm text-gray-700 mb-6">Cuanto más contexto compartas sobre tu empresa, mejor podrá GLY-AI analizar tus procesos, detectar oportunidades y proponer soluciones adaptadas a tu realidad.
Este informe no es genérico: es el primer paso hacia tu transformación empresarial impulsada por IA.</p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setIsAlertOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancelar</button>
              <button onClick={handleGenerateAudit} className="px-4 py-2 bg-black text-white rounded-lg">Generar</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal propuesta técnica */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto p-6 relative"
          >
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-600">
              <FaTimes size={20} />
            </button>
            <h2 className="text-2xl font-bold mb-4">Informe Técnico Consultivo</h2>
            <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {auditContent}
            </div>
            <div className="mt-6 flex justify-end gap-4">
              {user ? (
                <GuardarAuditoria auditContent={auditContent} onSave={() => setIsModalOpen(false)} />
              ) : (
                <button
                  onClick={() => setIsLoginPopupVisible(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Iniciar Sesión para Guardar
                </button>
              )}
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-black text-white rounded-lg">Cerrar</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Confirmación de salida */}
      {exitPromptVisible && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl shadow-xl max-w-md w-full mx-4 p-6 relative"
          >
            <button onClick={() => setExitPromptVisible(false)} className="absolute top-4 right-4 text-gray-600 hover:text-gray-800">
              <FaTimes size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-800">¿Deseas salir?</h2>
            <p className="text-gray-700 text-sm mb-6">
              Estás a punto de abandonar esta sesión de auditoría. ¿Estás seguro?
            </p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setExitPromptVisible(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                Cancelar
              </button>
              <button
                onClick={() => {
                  setExitPromptVisible(false);
                  window.removeEventListener('beforeunload', () => {});
                  window.location.href = '/';
                }}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900"
              >
                Salir de la página
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
