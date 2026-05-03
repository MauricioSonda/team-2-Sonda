import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/axios';

export function usePremium() {
  const [isPremium, setIsPremium] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      setIsPremium(false);
      return;
    }
    try {
      const res = await api.get('/billing/status');
      setIsPremium(res.data?.is_premium ?? false);
      setSubscription(res.data?.subscription ?? null);
    } catch (err) {
      console.warn('No se pudo verificar el estado de suscripción:', err?.response?.status ?? err?.message);
      setIsPremium(false);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return { isPremium, subscription, loading, refetch: fetchStatus };
}
