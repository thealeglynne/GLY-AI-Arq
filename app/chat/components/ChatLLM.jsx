'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function ChatLLM({ empresa }) {
  const [messages, setMessages] = useState([
    {
      from: 'ia',
      text: `Hola ${empresa.rol} de ${empresa.nombreEmpresa}, 👋 Soy GLY-IA y estoy aquí para ayudarte a diagnosticar los procesos actuales de tu empresa y construir un camino hacia la automatización inteligente. ¿Por dónde te gustaría comenzar? 🤖`
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
          text: `Interesante. Gracias por compartirlo. Con esa información puedo comenzar a identificar oportunidades de automatización. ¿Quieres que revise procesos específicos como ventas, operaciones o recursos humanos? 📊`
        }
      ]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-white">
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

      <div className="p-4 border-t bg-gray-50 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none"
          placeholder="Escribe tu mensaje..."
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
