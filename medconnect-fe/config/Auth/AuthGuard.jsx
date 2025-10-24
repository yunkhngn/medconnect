import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { routeConfig } from "./routeConfig";
import { useAuth } from "@/contexts/AuthContext";

const AuthGuard = ({ children }) => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      console.log('[AuthGuard] Checking auth...', { authLoading, hasUser: !!user, path: router.pathname });
      
      if (authLoading) {
        console.log('[AuthGuard] Auth still loading, waiting...');
        return; // Wait for auth to complete
      }

      if (!isMounted) return;

      try {
        const path = router.pathname.split("?")[0];
        const rule = findMatchingRouteRule(path);

        console.log('[AuthGuard] Route rule:', rule);

        // If user is logged in and route has redirectIfAuth, redirect them
        if (user && rule?.redirectIfAuth) {
          console.log('[AuthGuard] User logged in, checking role for redirect...');
          try {
            const token = await user.getIdToken();
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/user/role`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (!response.ok) {
              throw new Error("Failed to fetch role");
            }

            const data = await response.json();
            const userRole = data.role?.toLowerCase();
            const dashboardPath = getRoleDashboard(userRole);

            console.log('[AuthGuard] Redirecting logged-in user to:', dashboardPath);
            if (router.pathname !== dashboardPath) {
              router.replace(dashboardPath);
              return;
            }
          } catch (error) {
            console.error("[AuthGuard] Error fetching role for redirect:", error);
          }
        }

        // Public route - always allow
        if (!rule || !rule.authRequired) {
          console.log('[AuthGuard] Public route, allowing...');
          setAuthorized(true);
          setChecking(false);
          return;
        }

        // Protected route - check authentication
        if (!user) {
          console.log('[AuthGuard] Protected route, no user, redirecting...');
          setAuthorized(false);
          setChecking(false);
          const redirectPath = rule.redirectIfNotAuth || "/dang-nhap";
          if (router.pathname !== redirectPath) {
            router.replace(redirectPath);
          }
          return;
        }

        // User logged in - check role
        console.log('[AuthGuard] User found, checking role...');
        const token = await user.getIdToken();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/user/role`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch role");
        }

        const data = await response.json();
        const userRole = data.role?.toLowerCase();

        console.log('[AuthGuard] User role:', userRole, 'Required:', rule.roles);

        // Check if user has required role
        if (rule.roles && !rule.roles.includes(userRole)) {
          console.log('[AuthGuard] Role mismatch, redirecting...');
          setAuthorized(false);

          // Redirect to user's own dashboard based on their role
          const dashboardPath = getRoleDashboard(userRole);

          if (router.pathname !== dashboardPath) {
            router.replace(dashboardPath);
          }
        } else {
          console.log('[AuthGuard] Authorized!');
          setAuthorized(true);
        }
      } catch (error) {
        console.error("[AuthGuard] Auth check error:", error);
        setError(error.message);
        setAuthorized(false);
        if (isMounted) {
          router.replace("/dang-nhap");
        }
      } finally {
        if (isMounted) setChecking(false);
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [user, authLoading, router.pathname]); // Depend on user from context

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

  // Get dashboard path based on user role
  const getRoleDashboard = (role) => {
    switch (role) {
      case "admin":
        return "/admin/trang-chu";
      case "doctor":
        return "/bac-si/trang-chu";
      case "patient":
        return "/nguoi-dung/trang-chu";
      default:
        return "/";
    }
  };

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang xác thực...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">Có lỗi xảy ra: {error}</p>
          <button
            onClick={() => router.reload()}
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
