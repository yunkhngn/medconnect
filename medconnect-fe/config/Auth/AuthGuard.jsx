import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { routeConfig } from "./routeConfig";
import Loading from "@/components/ui/loading";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const AuthGuard = ({ children }) => {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // 🔹 Theo dõi trạng thái đăng nhập Firebase
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        authCheck(router.pathname, user);
      } else {
        setAuthorized(false);
        router.push("/");
      }
      setCheckingAuth(false);
    });

    // 🔹 Lắng nghe thay đổi route
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

  // 🔹 Tìm rule phù hợp trong routeConfig
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

  // 🔹 Kiểm tra xác thực & quyền
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

    try {
      // 🔹 Lấy ID token trực tiếp từ Firebase user
      const token = await user.getIdToken();

      const response = await fetch("http://localhost:8080/api/user/role", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        setAuthorized(false);
        router.push("/403");
        return;
      }

      const data = await response.json();
      const userRole = data.role?.toLowerCase();

      if (rule.roles && !rule.roles.includes(userRole)) {
        setAuthorized(false);
        router.push(rule.redirectIfUnauthorized || "/403");
        return;
      }

      setAuthorized(true);
    } catch (error) {
      console.error("Lỗi khi xác thực role:", error);
      setAuthorized(false);
      router.push("/403");
    }
  };

  // 🔹 Khi đang kiểm tra hoặc chưa xác thực xong → hiển thị Loading
  if (checkingAuth || !authorized) {
    return <Loading />;
  }

  return children;
};

export default AuthGuard;
