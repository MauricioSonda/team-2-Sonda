import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { usePremium } from '../hooks/usePremium';
import tomateImg from '../assets/tomate.png';
import customLogo from '../assets/logo.png';

export default function PremiumSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { isPremium, subscription, loading, refetch } = usePremium();
  const [retries, setRetries] = useState(0);

  useEffect(() => {
    if (!sessionId) return;
    (async () => {
      try {
        await (await import('../api/axios')).api.post('/billing/sync', { session_id: sessionId });
        refetch();
      } catch (err) {
        console.error('Sync session error', err);
      }
    })();
  }, [sessionId, refetch]);

  useEffect(() => {
    if (!isPremium && retries < 5) {
      const timer = setTimeout(() => {
        refetch();
        setRetries(r => r + 1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isPremium, retries, refetch]);

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

          {loading || (!isPremium && retries < 5) ? (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#ffb800] mx-auto mb-6"></div>
              <h2 className="text-2xl font-black text-[#1a2e35] mb-2">Activando tu suscripción...</h2>
              <p className="text-gray-400 font-bold">Esto tarda solo unos segundos.</p>
            </>
          ) : isPremium ? (
            <>
              <div className="text-7xl mb-6">😄</div>
              <h1 className="text-4xl font-black text-[#1a2e35] mb-3">¡Bienvenido a Premium!</h1>
              <p className="text-gray-500 font-bold mb-2">
                Tu suscripción está activa.
              </p>
              {subscription?.current_period_end && (
                <p className="text-gray-400 font-bold text-sm mb-8">
                  Próxima renovación: {new Date(subscription.current_period_end).toLocaleDateString('es-MX', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
              )}
              <div className="flex flex-col gap-4">
                <Link
                  to="/my-recipes"
                  className="w-full py-4 bg-[#ffb800] hover:bg-[#e0a200] text-white font-black text-lg rounded-xl shadow transition-transform hover:scale-[1.02]"
                >
                  Ir a mis recetas
                </Link>
                <Link
                  to="/explore"
                  className="w-full py-4 border-2 border-gray-200 text-gray-700 font-black text-lg rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Explorar recetas
                </Link>
                <Link
                  to="/premium"
                  className="text-sm text-gray-400 font-bold hover:text-gray-600 transition-colors"
                >
                  Gestionar mi suscripción
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="text-5xl mb-6">⏳</div>
              <h2 className="text-2xl font-black text-[#1a2e35] mb-2">Tu pago fue recibido</h2>
              <p className="text-gray-500 font-bold mb-6">
                Estamos procesando tu suscripción. Puede tomar un momento en reflejarse.
              </p>
              <Link to="/my-recipes" className="px-8 py-4 bg-[#1a2e35] text-white font-black rounded-xl hover:bg-[#2a3e4a] transition-colors">
                Ir a mis recetas
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
