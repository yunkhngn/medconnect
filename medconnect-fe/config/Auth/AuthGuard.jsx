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

        // Khớp wildcard (ví dụ /doctor/*)
        const matchedKey = Object.keys(routeConfig).find((key) => {
            if (key.endsWith("/*")) {
                const base = key.slice(0, -1);
                return path.startsWith(base);
            }
            return false;
        });

        return matchedKey ? routeConfig[matchedKey] : null;
    };


    const authCheck = (url) => {
        const userToken = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');
        const path = url.split('?')[0];

        const rule = findMatchingRouteRule(path);

        if (!rule || !rule.authRequired) {
            setAuthorized(true);
            return;
        }

        if (rule.authRequired && !userToken) {
            setAuthorized(false);
            router.push(rule.redirectIfNotAuth || '/dang-nhap');
            return;
        }

        if (rule.roles && !rule.roles.includes(userRole)) {
            setAuthorized(false);
            router.push(rule.redirectIfUnauthorized || '/403');
            return;
        }

        setAuthorized(true);
    };

    return authorized ? children : <Loading />;
};

export default AuthGuard;