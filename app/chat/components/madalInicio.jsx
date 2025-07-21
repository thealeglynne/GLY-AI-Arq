'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function ModalInicio({ onComplete }) {
  const [showModal, setShowModal] = useState(true);

  const handleClose = () => {
    setShowModal(false);
    onComplete?.({ nombreEmpresa: '', rol: '' });
  };

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          className="fixed inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-3xl shadow-2xl w-[80vw] max-w-4xl px-[4vw] py-[5vh] text-gray-800"
            initial={{ scale: 0.95, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 40 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="w-full flex flex-col items-center justify-center gap-[2vh]">
              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-bold text-center text-black"
                style={{
                  fontSize: 'clamp(1.4rem, 2.5vw, 2.3rem)',
                  lineHeight: '1.3',
                }}
              >
                ¡Bienvenido a <span className="text-black">GLY-AI</span>
              </motion.h2>

              <Image
                src="/logo2.png"
                alt="Logo GLY-IA"
                width={70}
                height={70}
                className="mt-[-8px]"
              />

<p
  className="text-center text-gray-600 max-w-[70ch]"
  style={{
    fontSize: 'clamp(0.75rem, 1.2vw, 1rem)',
    lineHeight: '1.6',
  }}
>
  Soy una inteligencia artificial diseñada para entender los desafíos clave en tu organización y transformar esa información en oportunidades reales de automatización.  
  <br /><br />
  Mi misión es auditar tus procesos y ayudarte a construir soluciones basadas en IA que se integren de forma natural con tu operación actual. Junto a GLYNNE, podemos convertir cualquier reto en un sistema escalable y eficiente.
</p>
              <div className="pt-4">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.03 }}
                  onClick={handleClose}
                  className="px-6 py-3 rounded-full font-semibold text-white bg-black hover:bg-gray-900 transition"
                  style={{ fontSize: 'clamp(0.8rem, 1vw, 1rem)' }}
                >
                  Comenzar Análisis
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}