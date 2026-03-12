import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const useAdminProtection = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      navigate('/');
      return;
    }

    // Check if user has admin role
    const isAdmin = profile?.role === 'admin' || user?.user_metadata?.role === 'admin';
    if (!isAdmin) {
      navigate('/');
      return;
    }
  }, [user, profile, navigate]);

  return {
    isAdmin: profile?.role === 'admin' || user?.user_metadata?.role === 'admin',
    user,
    profile,
  };
};
