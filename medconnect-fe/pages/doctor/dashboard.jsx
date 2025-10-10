"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../../lib/firebase";
import { routeConfig } from "../../config/routeConfig";
import Image from "next/image";

export default function DoctorDashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const route = routeConfig["/doctor/dashboard"];
      const user = auth.currentUser;

      if (!user) {
        router.push(route.redirectIfNotAuth);
        return;
      }

      try {
        const role = localStorage.getItem("userRole")?.toLowerCase();

        if (!role || !route.roles.includes(role)) {
          router.push(route.redirectIfUnauthorized);
          return;
        }

        setIsAuthorized(true);
      } catch (err) {
        console.error("Error verifying role:", err);
        router.push("/");
      }
    };

    checkAccess();
  }, [router]);

  const handleLogout = async () => {
    await auth.signOut();
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    router.push("/");
  };

  if (!isAuthorized)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <p>Đang xác thực quyền truy cập...</p>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-10">
      <div className="flex items-center mb-6">
        <Image
          src="/assets/logo.svg"
          alt="MedConnect Logo"
          width={40}
          height={40}
          className="mr-2"
        />
        <h1 className="text-3xl font-bold text-gray-800">
          Doctor Dashboard
        </h1>
      </div>

      <p className="text-gray-600 mb-8 text-center max-w-md">
        Chào mừng bạn đến với khu vực dành cho bác sĩ.  
        Tại đây bạn có thể xem lịch hẹn, quản lý bệnh nhân và cập nhật hồ sơ y tế.
      </p>

      <button
        onClick={handleLogout}
        className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
      >
        Đăng xuất
      </button>
    </div>
  );
}
