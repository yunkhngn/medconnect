import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      console.log('[AuthContext] SSR detected, skipping...');
      return;
    }

    let isMounted = true;
    console.log('[AuthContext] Setting up auth listener...');

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!isMounted) return;
      
      console.log('[AuthContext] User state changed:', firebaseUser ? `User: ${firebaseUser.email}` : 'No user');
      setUser(firebaseUser);
      setLoading(false);
      setInitializing(false);
    }, (error) => {
      console.error('[AuthContext] Auth error:', error);
      if (isMounted) {
        setLoading(false);
        setInitializing(false);
      }
    });

    return () => {
      console.log('[AuthContext] Cleanup...');
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Don't render children until auth is initialized (client-side only)
  if (typeof window !== 'undefined' && initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang khởi tạo...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

