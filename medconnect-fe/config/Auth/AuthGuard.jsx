import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { routeConfig } from './routeConfig';
import Loading from '@/components/ui/loading';

const AuthGuard = ({ children }) => {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    authCheck(router.pathname);

    const handleStart = () => setAuthorized(false);
    const handleComplete = (url) => authCheck(url);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
    };
  }, []);

  const findMatchingRouteRule = (path) => {
    if (routeConfig[path]) return routeConfig[path];

    const matchedKey = Object.keys(routeConfig).find((key) => {
      if (key.endsWith("/*")) {
        const base = key.slice(0, -1);
        return path.startsWith(base);
      }
      return false;
    });

    return matchedKey ? routeConfig[matchedKey] : null;
  };

  const authCheck = async (url) => {
    const token = localStorage.getItem('authToken');
    const path = url.split('?')[0];
    const rule = findMatchingRouteRule(path);

    if (!rule || !rule.authRequired) {
      setAuthorized(true);
      return;
    }

    if (!token) {
      setAuthorized(false);
      router.push(rule.redirectIfNotAuth || '/');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/user/role', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        setAuthorized(false);
        router.push('/403');
        return;
      }

      const data = await response.json();
      const userRole = data.role?.toLowerCase();

      if (rule.roles && !rule.roles.includes(userRole)) {
        setAuthorized(false);
        router.push(rule.redirectIfUnauthorized || '/403');
        return;
      }

      setAuthorized(true);
    } catch (error) {
      console.error('Lỗi khi xác thực role:', error);
      setAuthorized(false);
      router.push('/403');
    }
  };

  return authorized ? children : <Loading />;
};

export default AuthGuard;
