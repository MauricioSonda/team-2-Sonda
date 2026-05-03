import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/axios';
import { usePremium } from '../hooks/usePremium';
import { useToast } from '../components/Toast';
import tomateImg from '../assets/tomate.png';
import customLogo from '../assets/logo.png';

const FEATURES_FREE = [
  'Publicar recetas',
  'Manejar tus recetas',
  'Crear y manejar tus categorías',
];

const FEATURES_PREMIUM = [
  'Todo lo del plan gratuito',
  'Recetas ilimitadas',
  'Desbloquear todo el catalogo de recetas',
  'Ver, comentar y calificar recetas de otros usuarios',
  'Modo cocina (guía paso a paso)',
];

export default function Premium() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const isRequired = searchParams.get('required') === 'true';
  
  const { isPremium, subscription, loading } = usePremium();
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const isAuth = !!localStorage.getItem('access_token');

  const handleCheckout = async () => {
    if (!isAuth) {
      toast.info('Debes iniciar sesión para suscribirte.');
      navigate('/login');
      return;
    }
    setCheckoutLoading(true);
    try {
      const res = await api.post('/billing/checkout', { plan: selectedPlan });
      window.location.href = res.data.checkout_url;
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al iniciar el pago. Intenta de nuevo.';
      toast.error(msg);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await api.post('/billing/portal');
      window.location.href = res.data.portal_url;
    } catch (err) {
      toast.error('Error al abrir el portal de facturación.');
    } finally {
      setPortalLoading(false);
    }
  };

  const handleCancel = async () => {
    const confirmed = await toast.confirm(
      '¿Seguro que deseas cancelar tu suscripción? Perderás el acceso premium de inmediato.',
      { danger: true, confirmText: 'Cancelar suscripción' }
    );
    if (!confirmed) return;
    try {
      await api.delete('/billing/subscription');
      toast.success('Suscripción cancelada.');
      window.location.reload();
    } catch (err) {
      toast.error('Error al cancelar la suscripción.');
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] font-sans text-gray-800 flex flex-col">

      <header className="w-full h-24 bg-[#ffb800] px-8 flex justify-between items-center shadow-md relative z-50">
        <div className="max-w-[1600px] mx-auto w-full flex justify-between items-center h-full">
          <Link to={isRequired ? "#" : "/"} onClick={isRequired ? (e) => e.preventDefault() : undefined} className={`flex items-center group gap-4 ${isRequired ? 'cursor-not-allowed opacity-50' : ''}`}>
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-inner transform group-hover:scale-105 transition-transform overflow-hidden p-2">
              <img src={tomateImg} alt="Tomate Logo" className="w-full h-full object-contain" />
            </div>
            <img src={customLogo} alt="Salsa de Tomate" style={{ width: '250px', marginTop: '8px' }} />
          </Link>
          <div className="flex gap-4">
            {isAuth && !isRequired ? (
              <>
                <Link to="/explore" className="px-6 py-2.5 bg-white text-[#ffb800] font-black text-lg md:text-xl rounded-full shadow hover:bg-gray-50 transition-colors">Explorar</Link>
                <Link to="/my-recipes" className="px-6 py-2.5 bg-white text-[#ffb800] font-black text-lg md:text-xl rounded-full shadow hover:bg-gray-50 transition-colors">Mis recetas</Link>
              </>
            ) : isAuth && isRequired ? (
              <span className="text-white font-black text-sm px-4 py-2">Completa tu suscripción</span>
            ) : (
              <>
                <Link to="/login" className="px-6 py-2.5 bg-white text-[#ffb800] font-black text-lg md:text-xl rounded-full shadow hover:bg-gray-50 transition-colors">Ingresar</Link>
                <Link to="/register" className="px-6 py-2.5 outline outline-2 outline-white text-white font-black text-lg md:text-xl rounded-full hover:bg-white/10 transition-colors">Regístrate</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-[1200px] mx-auto px-6 py-16">

        <div className="text-center mb-16">
          {isRequired && (
            <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-2xl p-4 text-red-600 font-black max-w-lg mx-auto">
              ⚠️ Se requiere una suscripción activa para continuar
            </div>
          )}
          <span className="inline-block bg-[#fff3cd] text-[#d48c00] font-black px-5 py-2 rounded-full text-sm uppercase tracking-wider mb-4">
            ✦ Premium
          </span>
          <h1 className="text-5xl md:text-6xl font-black text-[#1a2e35] mb-4">
            Cocina sin límites
          </h1>
          <p className="text-xl text-gray-500 font-bold max-w-xl mx-auto">
            Desbloquea todo el potencial de Salsa de Tomate con una suscripción premium.
          </p>
        </div>

        {!loading && isPremium && (
          <div className="bg-white rounded-[2rem] border-2 border-[#ffb800] p-10 shadow-sm mb-12 text-center max-w-lg mx-auto">
            <div className="text-5xl mb-4">🫵🏻</div>
            <h2 className="text-3xl font-black text-[#1a2e35] mb-2">¡Ya eres Premium!</h2>
            <p className="text-gray-500 font-bold mb-2">
              Plan: <span className="text-[#1a2e35] capitalize">{subscription?.plan === 'annual' ? 'Anual' : 'Mensual'}</span>
            </p>
            {subscription?.current_period_end && (
              <p className="text-gray-400 font-bold text-sm mb-8">
                Próxima renovación: {new Date(subscription.current_period_end).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleCancel}
                className="px-8 py-4 border-2 border-red-300 text-red-500 font-black rounded-xl hover:bg-red-50 transition-colors"
              >
                Cancelar suscripción
              </button>
            </div>
          </div>
        )}

        {!loading && !isPremium && (
          <>
            <div className="flex justify-center mb-12">
              <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 flex gap-2">
                <button
                  onClick={() => setSelectedPlan('monthly')}
                  className={`px-8 py-3 rounded-xl font-black text-lg transition-all ${selectedPlan === 'monthly' ? 'bg-[#ffb800] text-white shadow' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  Mensual
                </button>
                <button
                  onClick={() => setSelectedPlan('annual')}
                  className={`px-8 py-3 rounded-xl font-black text-lg transition-all flex items-center gap-2 ${selectedPlan === 'annual' ? 'bg-[#ffb800] text-white shadow' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  Anual
                  <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-black">-16.66%</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 max-w-3xl mx-auto">

              <div className="bg-white rounded-[2rem] border border-gray-200 p-8 flex flex-col shadow-sm">
                <div className="mb-6">
                  <h3 className="text-2xl font-black text-[#1a2e35] mb-1">Gratuito</h3>
                  <p className="text-gray-400 font-bold">Para compartir tus recetas</p>
                </div>
                <div className="mb-6">
                  <span className="text-5xl font-black text-[#1a2e35]">$0</span>
                  <span className="text-gray-400 font-bold ml-2">/ mes</span>
                </div>
                <ul className="flex flex-col gap-3 mb-8 flex-grow">
                  {FEATURES_FREE.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-gray-700 font-bold">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto">
                  <span className="w-full block text-center py-4 border-2 border-gray-200 text-gray-500 font-black rounded-xl">
                    Plan actual
                  </span>
                </div>
              </div>

              <div className="bg-[#1a2e35] rounded-[2rem] p-8 flex flex-col shadow-xl relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-[#ffb800] text-[#1a2e35] text-xs font-black px-3 py-1 rounded-full uppercase">
                  Recomendado
                </div>
                <div className="mb-6">
                  <h3 className="text-2xl font-black text-white mb-1">Premium</h3>
                  <p className="text-gray-400 font-bold">Para chefs apasionados</p>
                </div>
                <div className="mb-6">
                  {selectedPlan === 'monthly' ? (
                    <>
                      <span className="text-5xl font-black text-white">$50</span>
                      <span className="text-gray-400 font-bold ml-2">MXN / mes</span>
                    </>
                  ) : (
                    <>
                      <span className="text-5xl font-black text-white">$500</span>
                      <span className="text-gray-400 font-bold ml-2">MXN / año</span>
                      <p className="text-green-400 text-sm font-bold mt-1">Equivale a $41.66/mes · Ahorras $100</p>
                    </>
                  )}
                </div>
                <ul className="flex flex-col gap-3 mb-8 flex-grow">
                  {FEATURES_PREMIUM.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-gray-300 font-bold">
                      <svg className="w-5 h-5 text-[#ffb800] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="w-full py-4 bg-[#ffb800] hover:bg-[#e0a200] text-[#1a2e35] font-black text-lg rounded-xl shadow-lg transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
                >
                  {checkoutLoading ? 'Redirigiendo...' : `Suscribirme ${selectedPlan === 'annual' ? 'anual' : 'mensual'}`}
                </button>
                <p className="text-center text-gray-500 text-xs font-bold mt-3">
                  Cancela cuando quieras · Pago seguro con Stripe
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-gray-400 text-sm font-bold">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Pago 100% seguro
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                Procesado por Stripe
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Cancela en cualquier momento
              </span>
            </div>
          </>
        )}

        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#ffb800]"></div>
          </div>
        )}
      </main>

      <footer className="w-full text-center py-10 border-t border-gray-100 text-gray-400 font-bold text-sm">
        Precios en MXN · IVA incluido · Powered by <span className="text-[#635bff] font-black">Stripe</span>
      </footer>
    </div>
  );
}
