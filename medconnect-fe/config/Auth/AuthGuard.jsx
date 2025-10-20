import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { routeConfig } from "./routeConfig";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const AuthGuard = ({ children }) => {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;

      try {
        const path = router.pathname.split("?")[0];
        const rule = findMatchingRouteRule(path);

        // Public route - always allow
        if (!rule || !rule.authRequired) {
          setAuthorized(true);
          setLoading(false);
          return;
        }

        // Protected route - check authentication
        if (!user) {
          setAuthorized(false);
          setLoading(false);
          const redirectPath = rule.redirectIfNotAuth || "/dang-nhap";
          if (router.pathname !== redirectPath) {
            router.replace(redirectPath);
          }
          return;
        }

        // User logged in - check role
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

        // Check if user has required role
        if (rule.roles && !rule.roles.includes(userRole)) {
          setAuthorized(false);

          // Redirect to user's own dashboard based on their role
          const dashboardPath = getRoleDashboard(userRole);

          if (router.pathname !== dashboardPath) {
            router.replace(dashboardPath);
          }
        } else {
          setAuthorized(true);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setError(error.message);
        setAuthorized(false);
        if (isMounted) {
          router.replace("/dang-nhap");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [router.pathname, router.asPath]); // Add router.asPath to dependencies

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
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
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
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
