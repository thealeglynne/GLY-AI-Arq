'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSlidersH, FaUserSecret, FaLaptopCode, FaChartLine, FaRobot,
  FaBalanceScale, FaProjectDiagram, FaFeatherAlt, FaInfoCircle,
  FaTimes, FaPaperPlane
} from 'react-icons/fa';
import Image from 'next/image';

const roles = [
  { key: 'auditor', label: 'Auditor Estratégico', icon: FaUserSecret },
  { key: 'desarrollador', label: 'Desarrollador IA', icon: FaLaptopCode },
  { key: 'consultor', label: 'Consultor de Negocio', icon: FaChartLine },
  { key: 'orquestador', label: 'Orquestador de Agentes', icon: FaRobot },
  { key: 'analista', label: 'Analista de Riesgo', icon: FaBalanceScale },
  { key: 'arquitecto', label: 'Arquitecto de Soluciones', icon: FaProjectDiagram },
];

const sugerencias = [
  'Nuestra empresa es de 45 empleados. ¿Cómo iniciamos una auditoría?',
  'Tenemos operaciones presenciales. ¿Cómo identificar procesos automatizables?',
  'Quiero que GLY-IA nos ayude a integrar agentes en el área de soporte.',
  'Nuestra empresa trabaja en retail. ¿Qué tareas son candidatas a IA?',
  '¿Cómo conectamos esta herramienta a nuestros procesos actuales?',
  '¿Cuántos procesos podemos automatizar sin afectar la operación?'
];

export default function ChatConConfiguracion() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showInstrucciones, setShowInstrucciones] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1024);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState({
    temperatura: 0.7,
    rolAgente: 'auditor',
    sector: '',
    modalidad: '',
    departamentos: [],
  });

  const messagesEndRef = useRef(null);
  const isMobile = windowWidth < 640;
  const API_URL = 'https://gly-ai-brain.onrender.com'; // URL directa del endpoint

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
    if (messages.length === 0) {
      setTimeout(() => {
        setMessages([{
          from: 'ia',
          text: '👋 ¡Hola! Soy GLY-IA. Estoy aquí para ayudarte a auditar tus procesos, entender tu empresa y proponerte soluciones con inteligencia artificial. Puedes empezar contándome a qué se dedica tu empresa, cuántos empleados tiene y qué procesos deseas mejorar.'
        }]);
      }, 500);
    }
  }, []);

  const update = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { from: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const rolesBackend = {
        'auditor': 'Auditor',
        'desarrollador': 'Desarrollador',
        'consultor': 'Gestor de Negocios',
        'orquestador': 'Desarrollador',
        'analista': 'Auditor',
        'arquitecto': 'Desarrollador'
      };

      // Estructura de datos optimizada para el endpoint
      const requestData = {
        query: input,
        rol: rolesBackend[config.rolAgente] || 'Auditor',
        temperatura: config.temperatura,
        estilo: 'Formal',
        config: {
          sector: config.sector,
          modalidad: config.modalidad,
          departamentos: config.departamentos.join(', ') // Convertir array a string
        }
      };

      const response = await fetch(`${API_URL}/gpt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        timeout: 60000 // Timeout de 60 segundos para Render free tier
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Manejar posibles formatos de respuesta
      const respuesta = data.respuesta || data.message || "No se pudo procesar la respuesta";
      setMessages(prev => [...prev, { from: 'ia', text: respuesta }]);

    } catch (error) {
      console.error('Error al conectar con GLY-ai-Brain:', error);
      setMessages(prev => [...prev, {
        from: 'ia',
        text: '⚠️ Lo siento, estoy teniendo problemas para conectarme. Por favor intenta nuevamente en unos momentos. (El servicio gratuito puede tardar hasta 50 segundos en iniciar)'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Resto del código permanece igual...
  const SidebarContent = () => (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Configurar GLY-IA</h2>
        {isMobile && (
          <button 
            onClick={() => setMenuOpen(false)}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <FaTimes />
          </button>
        )}
      </div>
      
      <div className="flex justify-center">
        <Image src="/logo2.png" alt="Modelo IA" width={50} height={50} />
      </div>

      <div>
        <label className="text-sm font-semibold mb-2 block">Rol del agente</label>
        <div className="grid grid-cols-2 gap-2">
          {roles.map(({ key, label, icon: Icon }) => (
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              key={key}
              onClick={() => update('rolAgente', key)}
              className={`flex items-center gap-2 p-2 text-sm rounded-md border transition-all ${
                config.rolAgente === key
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              <Icon /> {label}
            </motion.button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium flex items-center gap-2">
          <FaFeatherAlt /> Temperatura
        </label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={config.temperatura}
          onChange={(e) => update('temperatura', parseFloat(e.target.value))}
          className="w-full accent-black"
        />
        <div className="text-xs text-center text-gray-500">{config.temperatura.toFixed(2)}</div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div>
          <label className="text-sm font-semibold mb-2 block">📂 Sector de la empresa</label>
          <select
            className="w-full text-sm border rounded-md p-2"
            value={config.sector || ''}
            onChange={(e) => update('sector', e.target.value)}
          >
            <option value="">Selecciona un sector</option>
            <option value="tecnologia">Tecnología</option>
            <option value="finanzas">Finanzas</option>
            <option value="logistica">Logística</option>
            <option value="manufactura">Manufactura</option>
            <option value="salud">Salud</option>
            <option value="retail">Retail</option>
            <option value="consultoria">Consultoría</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold mb-2 block">🛠️ Modalidad operativa</label>
          <div className="grid grid-cols-2 gap-2">
            {['Presencial', 'Remoto', 'Híbrido'].map((modo) => (
              <motion.button
                whileTap={{ scale: 0.95 }}
                key={modo}
                onClick={() => update('modalidad', modo.toLowerCase())}
                className={`p-2 text-sm rounded-md border transition-all ${
                  config.modalidad === modo.toLowerCase()
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                {modo}
              </motion.button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold mb-2 block">🏢 Departamentos activos</label>
          <div className="grid grid-cols-2 gap-2">
            {['Ventas', 'Marketing', 'RRHH', 'Operaciones', 'Soporte', 'Finanzas'].map((dep) => (
              <motion.button
                whileTap={{ scale: 0.95 }}
                key={dep}
                onClick={() => {
                  const current = config.departamentos || [];
                  const updated = current.includes(dep)
                    ? current.filter((d) => d !== dep)
                    : [...current, dep];
                  update('departamentos', updated);
                }}
                className={`p-2 text-sm rounded-md border transition-all ${
                  config.departamentos?.includes(dep)
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                {dep}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="text-center mt-4">
        <button
          onClick={() => setShowInstrucciones(true)}
          className="text-sm flex items-center gap-2 px-3 py-2 mx-auto bg-gray-100 border rounded-md hover:bg-gray-200 transition"
        >
          <FaInfoCircle /> Instrucciones de configuración
        </button>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold mb-2">💡 Preguntas sugeridas</h3>
        <div className="flex flex-col gap-2 text-sm">
          {sugerencias.map((q, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                setInput(q);
                if (isMobile) setMenuOpen(false);
              }}
              className="text-left p-2 border rounded-md hover:bg-gray-200 transition"
            >
              {q}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="flex h-screen relative bg-gray-50">
      {isMobile && (
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="absolute top-2 left-2 z-50 p-2 rounded-full bg-black text-white shadow-md"
        >
          <FaSlidersH />
        </button>
      )}

      <AnimatePresence>
        {(!isMobile || menuOpen) && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="w-full sm:max-w-sm bg-white border-r border-gray-200 p-4 flex flex-col justify-between overflow-y-auto z-40 absolute sm:relative h-full"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex flex-col flex-1 h-full ml-0 sm:ml-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`max-w-[80%] px-4 py-3 rounded-lg text-sm shadow-md ${
                  msg.from === 'ia'
                    ? 'bg-white text-gray-800'
                    : 'bg-black text-white'
                }`}
              >
                {msg.text}
              </motion.div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t bg-white flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="Escribe tu mensaje..."
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className={`px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-900 transition ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Enviando...' : <FaPaperPlane />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showInstrucciones && (
          <motion.div
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowInstrucciones(false)}
          >
            <motion.div
              className="bg-white rounded-xl p-6 w-full max-w-lg"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">📘 Instrucciones de configuración</h2>
                <button 
                  onClick={() => setShowInstrucciones(false)}
                  className="p-1 rounded-full hover:bg-gray-200"
                >
                  <FaTimes />
                </button>
              </div>
              <ul className="text-sm list-disc pl-5 space-y-2">
                <li><strong>Temperatura:</strong> controla la creatividad del modelo. Valores bajos (0.2–0.4) generan respuestas más predecibles; valores altos (0.7–1) son más exploratorios.</li>
                <li><strong>Rol del agente:</strong> define el enfoque con el que GLY-IA responde. Ej: un Auditor analiza eficiencia, un Orquestador propone arquitecturas, etc.</li>
                <li>Los demás parámetros ayudan a contextualizar mejor las respuestas según tu empresa.</li>
                <li>Puedes usar las preguntas sugeridas como punto de partida.</li>
                <li><strong>Nota:</strong> El servicio gratuito puede tardar hasta 50 segundos en responder la primera vez debido a que el servidor se "duerme" por inactividad.</li>
              </ul>
              <div className="text-right mt-4">
                <button
                  onClick={() => setShowInstrucciones(false)}
                  className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}