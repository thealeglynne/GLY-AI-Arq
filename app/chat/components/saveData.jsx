'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSave, FaTimes } from 'react-icons/fa';
import { saveAuditToSupabase, getCurrentUser } from '../../lib/supabaseClient2';

export default function SaveAudit({ auditContent, onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isFeedbackPopupOpen, setIsFeedbackPopupOpen] = useState(false);

  const handleSave = async () => {
    if (!auditContent) {
      setError('No hay contenido para guardar.');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const user = await getCurrentUser();
      if (!user || !user.email) throw new Error('Usuario no autenticado.');

      const result = await saveAuditToSupabase({
        gmail: user.email,
        contend1: auditContent,
      });

      if (result.error) throw new Error(result.error.message);

      setMessage('Auditoría guardada exitosamente.');
      setIsFeedbackPopupOpen(true);
      setTimeout(() => {
        setIsFeedbackPopupOpen(false);
        onClose();
      }, 3000);
    } catch (err) {
      console.error('Error al guardar la auditoría:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsFeedbackPopupOpen(true);
    setTimeout(() => {
      setIsFeedbackPopupOpen(false);
      onClose();
    }, 3000);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto p-6 relative"
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
            aria-label="Cerrar modal"
          >
            <FaTimes size={20} />
          </button>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Informe Técnico Consultivo</h2>
          <div className="text-gray-700 text-sm whitespace-pre-wrap mb-6">{auditContent}</div>
          {message && (
            <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm">{message}</div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">{error}</div>
          )}
          <div className="flex justify-end gap-4">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className={`px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              aria-label="Guardar auditoría"
            >
              {isLoading ? 'Guardando...' : <FaSave className="inline mr-2" />}
              {isLoading ? 'Guardando...' : 'Guardar Auditoría'}
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              aria-label="Cerrar"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>

      {isFeedbackPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 relative"
          >
            <h2 className="text-xl font-bold mb-4 text-gray-800">Continúa la Conversación</h2>
            <p className="text-gray-700 text-sm mb-6">
              Si no está conforme con la auditoría, puede seguir dialogando con la IA para que reúna más información y la haga más ajustada.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setIsFeedbackPopupOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                aria-label="Entendido"
              >
                Entendido
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}