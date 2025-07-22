'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaLightbulb,
  FaSearch,
  FaTools,
  FaRetweet,
  FaExclamationTriangle,
  FaChartLine,
} from 'react-icons/fa';

const instrucciones = [
  {
    label: 'Habla como si fuera tu colega',
    icon: <FaLightbulb className="text-orange-500 text-lg" />,
    descripcion: `Explícale cómo funcionan tus procesos, como si estuvieras entrenando a alguien nuevo en tu empresa.`,
  },
  {
    label: 'Sé específico',
    icon: <FaSearch className="text-orange-500 text-lg" />,
    descripcion: `Describe flujos completos: "el lead entra por WhatsApp, lo pasamos a Excel, luego facturamos en el ERP..."`,
  },
  {
    label: 'Menciona herramientas',
    icon: <FaTools className="text-orange-500 text-lg" />,
    descripcion: `GLY-AI funciona mejor si sabe que usas cosas como Notion, Gmail, HubSpot, SAP, Google Sheets, etc.`,
  },
  {
    label: 'Describe un flujo real',
    icon: <FaRetweet className="text-orange-500 text-lg" />,
    descripcion: `Cuéntale qué pasa desde que llega un cliente hasta que se entrega el servicio o producto.`,
  },
  {
    label: 'Cuenta tus dolores',
    icon: <FaExclamationTriangle className="text-orange-500 text-lg" />,
    descripcion: `Menciona qué cosas te hacen perder tiempo, generan errores o requieren intervención manual.`,
  },
  {
    label: 'Comparte tus metas',
    icon: <FaChartLine className="text-orange-500 text-lg" />,
    descripcion: `¿Buscas escalar, ahorrar tiempo, mejorar la trazabilidad? Cuanto más claro el objetivo, mejor el diagnóstico.`,
  },
];

export default function InstruccionesAuditoriaCompact() {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <div className="w-full max-w-[400px] mx-auto p-4 space-y-4 bg-white rounded-2xl shadow-lg border border-gray-200">
      <motion.h2
        className="text-lg font-bold text-center text-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Haz más efectiva tu auditoría con GLY-AI
      </motion.h2>

      <p className="text-sm text-gray-500 text-center">
        Estas recomendaciones ayudan a que la IA entienda mejor tu negocio y proponga soluciones relevantes.
      </p>

      <div className="flex flex-col gap-3">
        {instrucciones.map((item, index) => (
          <motion.div
            key={index}
            onClick={() => setActiveIndex(index)}
            className="bg-white border border-gray-300 rounded-xl p-3 cursor-pointer hover:shadow-md transition"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-start gap-2 text-sm font-semibold text-gray-700">
              {item.icon}
              <span>{item.label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* POPUP CON BLUR */}
      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            className="fixed inset-0 backdrop-blur-sm bg-white/40 z-50 flex items-center justify-center px-4"
            onClick={() => setActiveIndex(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white max-w-sm w-full rounded-xl p-5 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <h3 className="text-md font-bold mb-2 text-gray-800">
                {instrucciones[activeIndex].label}
              </h3>
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {instrucciones[activeIndex].descripcion}
              </p>
              <button
                onClick={() => setActiveIndex(null)}
                className="absolute top-2 right-3 text-lg font-bold text-gray-400 hover:text-black"
              >
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
