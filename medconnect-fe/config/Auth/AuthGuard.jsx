import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { isAuthenticated, getUserRole } from "@/utils/auth";

/**
 * Client-side guard (optional). Server-side middleware is authoritative.
 * - public routes allowed
 * - protected prefixes: /admin -> ADMIN, /bac-si -> DOCTOR, /nguoi-dung -> PATIENT
 * - guest -> redirect /dang-nhap
 * - wrong role -> redirect to role home
 */
const AuthGuard = ({ children }) => {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  const publicRoutes = [
    "/",
    "/dang-nhap",
    "/dang-ky",
    "/quen-mat-khau",
    "/tim-bac-si",
    "/chinh-sach",
  ];

  const getRoleHome = (role) => {
    if (!role) return "/";
    switch (role.toUpperCase()) {
      case "ADMIN":
        return "/admin/trang-chu";
      case "DOCTOR":
        return "/bac-si/trang-chu";
      case "PATIENT":
        return "/nguoi-dung/trang-chu";
      default:
        return "/";
    }
  };

  const checkRoute = (path) => {
    // allow public
    if (publicRoutes.some((r) => path === r || path.startsWith(r + "/")))
      return true;

    // protected prefixes
    if (path.startsWith("/admin")) return "ADMIN";
    if (path.startsWith("/bac-si")) return "DOCTOR";
    if (path.startsWith("/nguoi-dung")) return "PATIENT";

    // default allow
    return true;
  };

  useEffect(() => {
    const guard = () => {
      const path = router.pathname;
      const rule = checkRoute(path);

      // no strict role required
      if (rule === true) {
        setReady(true);
        return;
      }

      const logged = isAuthenticated();
      const role = getUserRole();

      if (!logged) {
        // guest -> login
        router.replace("/dang-nhap");
        return;
      }

      // role required
      if (typeof rule === "string") {
        if (!role || role.toUpperCase() !== rule) {
          // redirect to user's home
          router.replace(getRoleHome(role));
          return;
        }
      }

      setReady(true);
    };

    // initial check
    guard();

    // check on route change
    const handleRoute = (url) => {
      setReady(false);
      // run guard after route settles
      setTimeout(() => guard(), 10);
    };

    router.events.on("routeChangeComplete", handleRoute);
    router.events.on("routeChangeError", handleRoute);

    return () => {
      router.events.off("routeChangeComplete", handleRoute);
      router.events.off("routeChangeError", handleRoute);
    };
  }, [router]);

  if (!ready) return null; // or simple spinner

  return <>{children}</>;
};

export default AuthGuard;
