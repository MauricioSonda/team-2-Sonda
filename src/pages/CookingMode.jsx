import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/axios';

export default function CookingMode() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState({});

  const timerRef = useRef(null);
  const wakeLockRef = useRef(null);
  const isAuth = !!localStorage.getItem('access_token');

  useEffect(() => {
    api.get(`/recipes/${id}`)
      .then(res => {
        const r = res.data.data;
        r.steps = (r.steps || []).sort((a, b) => a.step_number - b.step_number);
        setRecipe(r);
      })
      .catch(() => navigate('/explore'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const request = async () => {
      try {
        if ('wakeLock' in navigator)
          wakeLockRef.current = await navigator.wakeLock.request('screen');
      } catch (_) {}
    };
    request();
    return () => { wakeLockRef.current?.release().catch(() => {}); };
  }, []);

  const handleNext = useCallback(() => {
    if (!recipe) return;
    if (currentStep < recipe.steps.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      clearInterval(timerRef.current);
      setDone(true);
    }
  }, [currentStep, recipe]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  }, [currentStep]);

  useEffect(() => {
    const handler = (e) => {
      if (done) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') handleNext();
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   handlePrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleNext, handlePrev, done]);

  useEffect(() => {
    clearInterval(timerRef.current);
    setTimerRunning(false);
    setTimerSeconds(0);
  }, [currentStep]);

  const startTimer = (secs) => {
    setTimerSeconds(secs);
    setTimerRunning(true);
    timerRef.current = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); setTimerRunning(false); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const toggleTimer = (initial) => {
    if (timerRunning) {
      clearInterval(timerRef.current);
      setTimerRunning(false);
    } else {
      startTimer(timerSeconds > 0 ? timerSeconds : initial);
    }
  };

  const resetTimer = (initial) => {
    clearInterval(timerRef.current);
    setTimerRunning(false);
    setTimerSeconds(initial);
  };

  const handleRate = async (stars) => {
    setRating(stars);
    if (isAuth) {
      try { await api.post(`/recipes/${id}/ratings`, { stars }); } catch (_) {}
    }
    setRatingSubmitted(true);
  };

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const detectTimer = (text) => {
    const m = text.match(/(\d+)\s*(minutos?|mins?)/i);
    const s = text.match(/(\d+)\s*(segundos?|segs?)/i);
    if (m) return parseInt(m[1]) * 60;
    if (s) return parseInt(s[1]);
    return null;
  };

  if (loading) return (
    <div className="min-h-screen bg-[#1a2e35] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#ffb800]" />
    </div>
  );

  if (!recipe?.steps?.length) return (
    <div className="min-h-screen bg-[#1a2e35] flex flex-col items-center justify-center gap-4 text-white">
      <p className="text-xl font-black">Esta receta no tiene pasos.</p>
      <Link to={`/recipe/${id}`} className="px-6 py-2.5 bg-white text-[#ffb800] font-black text-sm rounded-full shadow hover:bg-gray-50 transition-colors">Volver</Link>
    </div>
  );

  const steps    = recipe.steps;
  const step     = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const suggested = detectTimer(step.instruction);

  if (done) return (
    <div className="min-h-screen bg-[#1a2e35] flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-[2rem] p-10 max-w-md w-full text-center shadow-2xl">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-black text-[#1a2e35] mb-2">¡Listo para servir!</h2>
        <p className="text-gray-500 font-bold mb-1">Completaste <span className="text-[#1a2e35]">{recipe.title}</span></p>
        <p className="text-gray-400 font-bold text-sm mb-6">¿Qué tal te quedó?</p>

        {!ratingSubmitted ? (
          <div className="flex justify-center gap-3 mb-8">
            {[1,2,3,4,5].map(star => (
              <button key={star}
                onMouseEnter={() => setRatingHover(star)}
                onMouseLeave={() => setRatingHover(0)}
                onClick={() => handleRate(star)}
                className="text-4xl transition-transform hover:scale-125"
                style={{ color: (ratingHover || rating) >= star ? '#ffb800' : '#e5e7eb' }}>
                ★
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center mb-8 gap-2">
            <div className="flex gap-1">
              {[1,2,3,4,5].map(star => (
                <span key={star} className="text-3xl" style={{ color: rating >= star ? '#ffb800' : '#e5e7eb' }}>★</span>
              ))}
            </div>
            <p className="text-green-600 font-bold text-sm">¡Gracias por tu calificación!</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Link to={`/recipe/${id}`}
            className="w-full py-4 bg-[#ffb800] hover:bg-[#e0a200] text-[#1a2e35] font-black text-lg rounded-xl shadow-lg transition-transform hover:scale-[1.02] active:scale-95">
            Ver receta completa
          </Link>
          <button onClick={() => { setDone(false); setCurrentStep(0); setRating(0); setRatingSubmitted(false); }}
            className="w-full py-4 border-2 border-gray-200 text-gray-700 font-black text-lg rounded-xl hover:bg-gray-50 shadow-sm transition-colors">
            Cocinar de nuevo
          </button>
          <Link to="/explore" className="text-sm text-gray-400 font-bold hover:text-gray-600">
            Explorar más recetas
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1a2e35] flex flex-col select-none">

      <div className="flex items-center justify-between px-5 py-4">
        <Link to={`/recipe/${id}`}
          className="px-4 py-2 bg-white text-[#ffb800] font-black rounded-full shadow hover:bg-gray-50 transition-colors text-sm flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
          Salir
        </Link>
        <span className="text-white/60 font-bold text-sm max-w-[200px] truncate">{recipe.title}</span>
        {'wakeLock' in navigator && (
          <span className="text-xs bg-[#ffb800]/20 text-[#ffb800] font-bold px-3 py-1 rounded-full">
            pantalla activa
          </span>
        )}
      </div>

      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-[#ffb800] transition-all duration-500 shadow-md" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex justify-center gap-2 py-4">
        {steps.map((_, i) => (
          <button key={i}
            onClick={() => { clearInterval(timerRef.current); setTimerRunning(false); setTimerSeconds(0); setCurrentStep(i); }}
            className={`rounded-full transition-all duration-300 ${
              i === currentStep ? 'bg-[#ffb800] w-6 h-2 shadow-lg' :
              i < currentStep  ? 'bg-white/40 w-2 h-2'  : 'bg-white/20 w-2 h-2'
            }`}
          />
        ))}
      </div>

      <div className="flex-grow flex flex-col items-center justify-center px-5 pb-4 max-w-xl mx-auto w-full">

        <p className="text-[#ffb800] font-black text-sm uppercase tracking-widest mb-4">
          Paso {currentStep + 1} de {steps.length}
        </p>

        <div className="bg-white rounded-[2rem] p-8 w-full shadow-2xl mb-5">
          <p className="text-xl font-bold text-[#1a2e35] leading-relaxed">{step.instruction}</p>
        </div>

        {suggested && (
          <div className="bg-white/10 rounded-2xl px-6 py-4 w-full flex items-center justify-between mb-4">
            <div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">Temporizador</p>
              <p className={`font-mono text-4xl font-black ${timerSeconds === 0 && !timerRunning ? 'text-green-600' : 'text-[#ffb800]'}`}>
                {fmt(timerSeconds > 0 ? timerSeconds : suggested)}
              </p>
            </div>
            <div className="flex gap-2">
              {timerSeconds > 0 && timerSeconds < suggested && (
                <button onClick={() => resetTimer(suggested)}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white/70 font-bold text-sm rounded-xl shadow-sm">
                  Reset
                </button>
              )}
              <button onClick={() => toggleTimer(suggested)}
                className={`px-5 py-2 font-black text-sm rounded-xl transition-transform ${
                  timerRunning     ? 'bg-red-500/80 hover:bg-red-500 text-white shadow-lg' :
                  timerSeconds === 0 ? 'bg-green-500/80 hover:bg-green-500 text-white shadow-lg' :
                                     'bg-[#ffb800] hover:bg-[#e0a200] text-[#1a2e35] shadow-lg'
                }`}>
                {timerRunning ? 'Pausar' : timerSeconds === 0 ? '¡Listo!' : 'Continuar'}
              </button>
            </div>
          </div>
        )}

        {recipe.ingredients?.length > 0 && (
          <details className="w-full mb-4 group">
            <summary className="bg-white/10 hover:bg-white/15 rounded-2xl px-5 py-3 text-white font-bold text-sm cursor-pointer list-none flex items-center justify-between transition-colors">
              <span>Ver todos los ingredientes</span>
              <svg className="w-4 h-4 text-white/60 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="bg-white/10 rounded-2xl px-5 py-3 mt-1 flex flex-col gap-2">
              {recipe.ingredients.map((ing, idx) => (
                <button key={idx} onClick={() => setCheckedIngredients(p => ({ ...p, [idx]: !p[idx] }))}
                  className="flex items-center gap-3 text-left w-full">
                  <div className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors ${
                    checkedIngredients[idx] ? 'bg-[#ffb800] border-[#ffb800]' : 'border-white/40'
                  }`}>
                    {checkedIngredients[idx] && (
                      <svg className="w-3 h-3 text-[#1a2e35]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm font-bold transition-colors ${checkedIngredients[idx] ? 'text-white/40 line-through' : 'text-white/80'}`}>
                    {ing.quantity && <span className="text-[#ffb800]">{ing.quantity} {ing.unit} </span>}
                    {ing.name}
                  </span>
                </button>
              ))}
            </div>
          </details>
        )}
      </div>

      <div className="flex gap-4 px-5 pb-8 max-w-xl mx-auto w-full">
        <button onClick={handlePrev} disabled={currentStep === 0}
          className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white font-black text-lg rounded-2xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-sm">
          ← Anterior
        </button>
        <button onClick={handleNext}
          className="flex-[2] py-4 bg-[#ffb800] hover:bg-[#e0a200] text-[#1a2e35] font-black text-lg rounded-2xl transition-transform hover:scale-[1.02] active:scale-95 shadow-lg">
          {currentStep === steps.length - 1 ? '¡Terminé!' : 'Siguiente →'}
        </button>
      </div>

      <p className="text-center text-white/20 text-xs font-bold pb-4 hidden md:block">
        Usa ← → del teclado para navegar
      </p>
    </div>
  );
}