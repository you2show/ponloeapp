import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const useAdminProtection = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      navigate('/');
      return;
    }

    // Check if user has admin role or is the app owner
    const isOwner = 
      profile?.username === 'ponloe' || 
      profile?.social_telegram?.includes('1276188382') ||
      user?.email === 'tg1276188382@ponloe.com';

    const isAdmin = isOwner || profile?.role === 'admin' || user?.user_metadata?.role === 'admin';
    
    if (!isAdmin) {
      navigate('/');
      return;
    }
  }, [user, profile, navigate]);

  const isOwner = 
    profile?.username === 'ponloe' || 
    profile?.social_telegram?.includes('1276188382') ||
    user?.email === 'tg1276188382@ponloe.com';

  return {
    isAdmin: isOwner || profile?.role === 'admin' || user?.user_metadata?.role === 'admin',
    isOwner,
    user,
    profile,
    loading,
  };
};
