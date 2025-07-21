'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentUser, supabase, subscribeToAuthState } from '../../lib/supabaseClient';
import { X } from 'lucide-react';
import { FaTrash } from 'react-icons/fa';

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

  const formatAuditContent = (content) => {
    try {
      const parsed = typeof content === 'string' ? JSON.parse(content) : content;
      return (
        <div className="space-y-4">
          {Object.entries(parsed).map(([key, value]) => (
            <div key={key}>
              <p className="text-sm font-semibold text-gray-900">{key}</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
              </p>
            </div>
          ))}
        </div>
      );
    } catch {
      return (
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{content}</p>
      );
    }
  };

  return (
    <div className="w-full h-screen bg-white text-gray-800 p-8 overflow-y-auto">
      <h2 className="text-3xl font-bold mb-10">📂 Mis Auditorías</h2>

      {auditorias.length === 0 ? (
        <p className="text-sm text-gray-400">Aún no tienes auditorías registradas.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {auditorias.map((a) => (
            <motion.div
              key={a.id}
              onClick={() => setSelectedAudit(a)}
              whileHover={{ y: -2, boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.05)' }}
              whileTap={{ scale: 0.97 }}
              className="cursor-pointer bg-white border border-gray-200 hover:border-gray-300 rounded-2xl p-5 transition-all shadow-sm"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    {new Date(a.created_at).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-700 line-clamp-3 leading-snug">
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
                  className="text-gray-400 hover:text-red-600 transition"
                >
                  <FaTrash size={16} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedAudit && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl p-8 w-[95%] max-w-4xl max-h-[85vh] overflow-y-auto shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedAudit(null)}
                className="absolute top-4 right-4 text-gray-300 hover:text-black transition"
              >
                <X size={20} />
              </button>

              <h3 className="text-xl font-bold mb-6">
                📝 Auditoría generada el {new Date(selectedAudit.created_at).toLocaleString()}
              </h3>

              <div className="prose max-w-none text-sm text-gray-800">
                {formatAuditContent(selectedAudit.audit_content)}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
