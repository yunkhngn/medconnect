import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { routeConfig } from "./routeConfig";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const AuthGuard = ({ children }) => {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        authCheck(router.pathname, user);
      } else {
        setAuthorized(false);
        router.push("/");
      }
      setCheckingAuth(false);
    });

    const handleStart = () => setAuthorized(false);
    const handleComplete = (url) => authCheck(url, auth.currentUser);

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);

    return () => {
      unsubscribe();
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
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

  const authCheck = async (url, user) => {
    const path = url.split("?")[0];
    const rule = findMatchingRouteRule(path);

    if (!rule || !rule.authRequired) {
      setAuthorized(true);
      return;
    }

    if (!user) {
      setAuthorized(false);
      router.push(rule.redirectIfNotAuth || "/");
      return;
    }

    // Check cached role from COOKIE only
    const getCookieRole = () => {
      const cookies = document.cookie.split(';');
      const roleCookie = cookies.find(c => c.trim().startsWith('userRole='));
      return roleCookie ? roleCookie.split('=')[1] : null;
    };

    const cachedRole = getCookieRole();
    
    if (cachedRole && rule.roles) {
      const roleMatch = rule.roles.map(r => r.toLowerCase()).includes(cachedRole.toLowerCase());
      if (roleMatch) {
        setAuthorized(true);
        return;
      }
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch("http://localhost:8080/api/user/role", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        // Clear everything on error
        localStorage.removeItem('authToken');
        document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        setAuthorized(false);
        router.push("/");
        return;
      }

      const data = await response.json();
      const userRole = data.role?.toLowerCase();

      // Update cookie ONLY (NOT localStorage)
      document.cookie = `userRole=${userRole}; path=/; max-age=86400; SameSite=Lax`;

      if (rule.roles && !rule.roles.map(r => r.toLowerCase()).includes(userRole)) {
        setAuthorized(false);
        router.push(rule.redirectIfUnauthorized || "/");
        return;
      }

      setAuthorized(true);
    } catch (error) {
      console.error("Lỗi khi xác thực role:", error);
      localStorage.removeItem('authToken');
      document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      setAuthorized(false);
      router.push("/");
    }
  };

  if (checkingAuth || !authorized) {
    return null;
  }

  return children;
};

export default AuthGuard;
