import React from 'react';
import { Link } from 'react-router-dom';
import tomateImg from '../assets/tomate.png';
import customLogo from '../assets/logo.png';

export default function PremiumCancel() {
  return (
    <div className="min-h-screen bg-[#faf9f6] font-sans flex flex-col">
      <header className="w-full h-24 bg-[#ffb800] px-8 flex items-center shadow-md relative z-50">
        <div className="max-w-[1600px] mx-auto w-full flex items-center">
          <Link to="/" className="flex items-center group gap-4">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-inner transform group-hover:scale-105 transition-transform overflow-hidden p-2">
              <img src={tomateImg} alt="Tomate Logo" className="w-full h-full object-contain" />
            </div>
            <img src={customLogo} alt="Salsa de Tomate" style={{ width: '250px', marginTop: '8px' }} />
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-8">
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-12 max-w-lg w-full text-center">
          <div className="text-6xl mb-6">😕</div>
          <h1 className="text-3xl font-black text-[#1a2e35] mb-3">Pago cancelado</h1>
          <p className="text-gray-500 font-bold mb-8">
            No se realizó ningún cobro. Puedes volver a intentarlo cuando quieras.
          </p>
          <div className="flex flex-col gap-4">
            <Link
              to="/premium"
              className="w-full py-4 bg-[#ffb800] hover:bg-[#e0a200] text-white font-black text-lg rounded-xl shadow transition-transform hover:scale-[1.02]"
            >
              Ver planes premium
            </Link>
            <Link
              to="/"
              className="w-full py-4 border-2 border-gray-200 text-gray-700 font-black text-lg rounded-xl hover:bg-gray-50 transition-colors"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
