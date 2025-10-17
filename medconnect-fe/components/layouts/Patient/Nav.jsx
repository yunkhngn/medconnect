import React, { useEffect, useState } from "react";
import {
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { Home, FileText, Calendar } from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const PatientNav = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userPhoto, setUserPhoto] = useState(null);

  useEffect(() => {
    setMounted(true);

    // Listen for firebase auth state and update user info
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setUserEmail(user.email || "");
        setUserPhoto(user.photoURL || null);

        // keep a fallback in localStorage for compatibility if some flows still read it
        try {
          if (user.email) localStorage.setItem("userEmail", user.email);
        } catch (e) {
          // ignore localStorage errors
        }
      } else {
        setIsLoggedIn(false);
        setUserEmail(localStorage.getItem("userEmail") || "");
        setUserPhoto(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const isActive = (href) => router.pathname === href;

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      router.push("/dang-nhap");
    }
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-28 bg-white border-r border-gray-200 flex flex-col justify-between z-50">
      {/* Logo */}
      <div className="p-4 flex items-center justify-center border-b border-gray-100">
        <Link href="/nguoi-dung/trang-chu">
          <Image
            src="/assets/logo.svg"
            alt="Logo"
            width={40}
            height={40}
            className="cursor-pointer"
          />
        </Link>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-2 py-6 space-y-4 flex flex-col items-center">
        {/* Trang chủ */}
        <Link href="/nguoi-dung/trang-chu">
          <div
            className={`transition-all duration-200 cursor-pointer flex flex-col items-center gap-2 py-3 px-2 rounded-xl
              ${
                isActive("/nguoi-dung/trang-chu")
                  ? "bg-teal-50 text-teal-700"
                  : "text-gray-400 hover:bg-gray-50 hover:text-gray-700"
              }
            `}
          >
            <Home className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-medium text-center">Trang chủ</span>
          </div>
        </Link>

        {/* Hồ sơ bệnh án */}
        <Link href="/nguoi-dung/ho-so-benh-an">
          <div
            className={`transition-all duration-200 cursor-pointer flex flex-col items-center gap-2 py-3 px-2 rounded-xl
              ${
                isActive("/nguoi-dung/ho-so-benh-an")
                  ? "bg-teal-50 text-teal-700"
                  : "text-gray-400 hover:bg-gray-50 hover:text-gray-700"
              }
            `}
          >
            <FileText className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-medium text-center">Hồ sơ</span>
          </div>
        </Link>

        {/* Lịch hẹn */}
        <Link href="/nguoi-dung/lich-hen">
          <div
            className={`transition-all duration-200 cursor-pointer flex flex-col items-center gap-2 py-3 px-2 rounded-xl
              ${
                isActive("/nguoi-dung/lich-hen")
                  ? "bg-teal-50 text-teal-700"
                  : "text-gray-400 hover:bg-gray-50 hover:text-gray-700"
              }
            `}
          >
            <Calendar className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-medium text-center">Lịch hẹn</span>
          </div>
        </Link>
      </nav>

      {/* User Avatar */}
      {isLoggedIn && (
        <div className="p-4 border-t border-gray-100 flex items-center justify-center">
          <Dropdown placement="top">
            <DropdownTrigger>
              <Avatar
                src={
                  userPhoto
                    ? userPhoto
                    : userEmail
                    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        userEmail
                      )}&size=128&bold=true&rounded=true&background=random&color=ffffff`
                    : "/assets/homepage/mockup-avatar.jpg"
                }
                alt={userEmail ? userEmail : "User Avatar"}
                className="w-10 h-10 ring-2 ring-cyan-100 cursor-pointer transition-transform hover:scale-105"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="User Actions">
              <DropdownItem key="settings">
                <Link href="/nguoi-dung/cai-dat" className="w-full block">
                  Cài đặt
                </Link>
              </DropdownItem>
              <DropdownItem
                key="logout"
                color="danger"
                className="text-red-600"
                onClick={handleLogout}
              >
                Đăng xuất
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      )}
    </div>
  );
};

export default PatientNav;