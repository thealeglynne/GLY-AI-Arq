'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function ChatLLM({ empresa }) {
  const router = useRouter();
  const [messages, setMessages] = useState([
    {
      from: 'ia',
      text: `Hola ${empresa.rol} de ${empresa.nombreEmpresa}, 👋 Soy GLY-IA y estoy aquí para ayudarte a diagnosticar los procesos actuales de tu empresa y construir un camino hacia la automatización inteligente. ¿Por dónde te gustaría comenzar? 🤖`
    }
  ]);
  const [input, setInput] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '¿Estás seguro de que quieres salir? Se cerrará tu sesión.';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const opcionesIA = [
    '📈 Diagnóstico de procesos actuales',
    '🔄 Identificar procesos repetitivos',
    '🤖 Sugerir automatizaciones posibles',
    '📊 Evaluar impacto financiero de la IA',
    '🧠 Recomendar arquitectura técnica',
    '📤 Enviar informe al correo',
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage = { from: 'user', text: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          from: 'ia',
          text: `Gracias por compartirlo. Ya estoy analizando cómo optimizar tus procesos. Si quieres puedo: ${opcionesIA.join(', ')}. ¿Cuál te interesa primero?`
        }
      ]);
    }, 1500);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-white relative">
      {/* Botón de cerrar sesión */}
      <button
        onClick={() => setShowLogoutConfirm(true)}
        className="absolute top-4 right-4 text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg shadow-md z-10"
      >
        Cerrar sesión
      </button>

      {/* Chat principal */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`max-w-xl px-4 py-3 rounded-lg text-sm shadow-md ${
              msg.from === 'ia'
                ? 'bg-green-100 text-gray-800 self-start'
                : 'bg-blue-600 text-white self-end'
            }`}
          >
            {msg.text}
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-gray-50 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none"
          placeholder="Escribe tu mensaje o selecciona una opción..."
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Enviar
        </button>
      </div>

      {/* Confirmación de logout */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-[90vw] text-center"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <h3 className="text-lg font-semibold mb-2">¿Cerrar sesión?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Al cerrar la ventana o salir se terminará tu sesión actual y se enviará el diagnóstico por correo.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm rounded bg-red-500 text-white hover:bg-red-600"
                >
                  Cerrar sesión
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
