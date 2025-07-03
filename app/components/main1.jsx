'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Main1() {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setShowLogo(true), 1000);
    return () => clearTimeout(timeout);
  }, []);

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/chat`,
      },
    });

    if (error) console.error('Error al iniciar sesión con Google:', error.message);
  };

  useEffect(() => {
    const checkAndInsertUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user?.email) {
        setEmail(user.email);

        const { data, error } = await supabase
          .from('GLNNEacces')
          .select('*')
          .eq('email', user.email)
          .single();

        if (!data && !error) {
          await supabase.from('GLNNEacces').insert([{ email: user.email }]);
        }

        router.push('/chat');
      }
    };

    checkAndInsertUser();
  }, []);

  return (
    <main className="relative w-full h-screen overflow-hidden font-inter">
      {/* Video de fondo */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/integracion.mp4" type="video/mp4" />
      </video>

      {/* Capa oscura */}
      <div className="absolute inset-0 bg-black/60 z-10" />

      {/* Contenido */}
      <div className="relative z-20 w-full h-full flex items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-xl p-6 sm:p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl text-white text-center space-y-4">
          <img
            src="/logo.png"
            alt="Logo GLY-IA"
            className={`w-16 sm:w-20 mx-auto transition-all duration-1000 ${showLogo ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
          />

          <h2 className="text-sm sm:text-base font-medium">
            Automatiza <span className="font-bold text-white">sin complicaciones</span>
          </h2>

          <p className="text-xs sm:text-sm text-white/80">
            Nuestra IA <span className="font-bold text-white">GLY-IA</span> analiza tu negocio y te sugiere cómo empezar a optimizar procesos.
          </p>

          <p className="text-xs sm:text-sm text-white/80">
            Gratis. En segundos. Sin fricción.
          </p>

          <button
            onClick={() => {
              localStorage.removeItem('glyiaChatClosed');
              setShowLoginModal(true);
            }}
            className="relative mt-2 px-6 py-3 text-sm font-semibold bg-white text-black rounded-xl shadow-xl group overflow-hidden transition-all"
          >
            <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-black/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
            <span className="relative z-10">Explora con GLY-IA</span>
          </button>
        </div>
      </div>

      {/* Modal Login */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="relative bg-white p-5 sm:p-6 rounded-xl w-[90vw] max-w-md shadow-xl"
            >
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-3 right-4 text-gray-400 hover:text-black text-xl"
              >
                &times;
              </button>

              <h3 className="text-base font-bold text-gray-800 text-center mb-2">Empieza ahora</h3>
              <p className="text-xs text-gray-600 text-center mb-4">
                Inicia sesión para recibir recomendaciones personalizadas.
              </p>

              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-black text-white text-sm font-semibold shadow-md hover:bg-gray-900 transition"
              >
                <img src="/google.png" alt="Google" className="w-4 h-4" />
                Continuar con Google
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
