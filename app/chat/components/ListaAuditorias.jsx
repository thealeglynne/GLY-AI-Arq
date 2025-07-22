'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentUser, supabase, subscribeToAuthState } from '../../lib/supabaseClient';
import { X } from 'lucide-react';
import { FaTrash } from 'react-icons/fa';
import PreguntasSugeridas from '../components/preguntasPredefinidas'; // Asegúrate que la ruta sea correcta

export default function AuditoriasFullScreen() {
  const [user, setUser] = useState(null);
  const [auditorias, setAuditorias] = useState([]);
  const [selectedAudit, setSelectedAudit] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();
    const sub = subscribeToAuthState((event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchAuditorias = async () => {
      const { data, error } = await supabase
        .from('auditorias')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!error) setAuditorias(data);
    };
    fetchAuditorias();
  }, [user]);

  const handleDelete = async (auditId) => {
    try {
      const { error } = await supabase
        .from('auditorias')
        .delete()
        .eq('id', auditId)
        .eq('user_id', user.id);
      if (error) throw error;
      setAuditorias((prev) => prev.filter((audit) => audit.id !== auditId));
      if (selectedAudit?.id === auditId) setSelectedAudit(null);
    } catch (error) {
      console.error('Error deleting audit:', error.message);
      alert('No se pudo eliminar la auditoría: ' + error.message);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-white text-gray-800 overflow-hidden">
      {/* 🔝 Parte superior - Auditorías */}
      <div className="h-1/2 w-full p-6 overflow-y-auto border-b border-gray-200">
        <h2 className="text-2xl font-semibold mb-6">Mis Auditorías</h2>

        {auditorias.length === 0 ? (
          <p className="text-sm text-gray-500">Aún no tienes auditorías registradas.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {auditorias.map((a) => (
              <motion.div
                key={a.id}
                onClick={() => setSelectedAudit(a)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="cursor-pointer bg-gray-50 border border-gray-200 hover:border-black rounded-xl p-4 shadow-sm transition-all flex justify-between items-center"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    {new Date(a.created_at).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {typeof a.audit_content === 'string'
                      ? a.audit_content.slice(0, 120)
                      : JSON.stringify(a.audit_content).slice(0, 120)}...
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(a.id);
                  }}
                  className="text-gray-500 hover:text-red-600 transition p-2"
                >
                  <FaTrash size={16} />
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 🔽 Parte inferior - Preguntas sugeridas */}
      <div className="h-1/2 w-full p-6 overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-6"></h2>
        <PreguntasSugeridas onSeleccionar={(pregunta) => console.log('Seleccionaste:', pregunta)} />
      </div>

      {/* 🪟 Modal de detalle */}
      <AnimatePresence>
        {selectedAudit && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-2xl p-6 w-[90%] max-w-4xl max-h-[80%] overflow-y-auto shadow-xl relative"
            >
              <button
                onClick={() => setSelectedAudit(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-black transition"
              >
                <X size={20} />
              </button>

              <h3 className="text-lg font-bold mb-4">
                Auditoría del {new Date(selectedAudit.created_at).toLocaleString()}
              </h3>

              <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                {typeof selectedAudit.audit_content === 'string'
                  ? selectedAudit.audit_content
                  : JSON.stringify(selectedAudit.audit_content, null, 2)}
              </pre>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
