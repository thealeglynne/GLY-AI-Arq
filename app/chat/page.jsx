'use client';

import { useState } from 'react';
import ModalInicio from './components/AnalisisProcesos';
import ChatLLM from './components/ChatLLM';

export default function Diagnostico() {
  const [datosEmpresa, setDatosEmpresa] = useState(null);

  return (
    <div className="relative min-h-screen bg-gray-100">
      {!datosEmpresa && <ModalInicio onComplete={setDatosEmpresa} />}
      {datosEmpresa && <ChatLLM empresa={datosEmpresa} />}
    </div>
  );
}
