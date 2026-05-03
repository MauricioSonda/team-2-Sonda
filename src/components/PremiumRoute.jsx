import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { usePremium } from '../hooks/usePremium';

export function PremiumRoute({ children, required = false }) {
  const token = localStorage.getItem('access_token');
  const { isPremium, loading, refetch } = usePremium();
  const [hasRefetched, setHasRefetched] = useState(false);

  useEffect(() => {
    if (token && !loading && !hasRefetched) {
      const timer = setTimeout(() => {
        refetch();
        setHasRefetched(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [token, loading, refetch, hasRefetched]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f6]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#ffb800]"></div>
      </div>
    );
  }

  if (!isPremium) {
    return <Navigate to="/premium" replace />;
  }

  return children;
}

export default PremiumRoute;
