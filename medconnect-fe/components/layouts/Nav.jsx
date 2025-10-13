"use client";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from "@heroui/react";
import navigate from "@/config/Nav/guestNav";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

const Nav = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        try {
          const token = await user.getIdToken();
          const response = await fetch("http://localhost:8080/api/user/role", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUserRole(data.role?.toLowerCase() || null);
          } else {
            console.error("Failed to fetch user role");
          }
        } catch (error) {
          console.error("Error fetching role:", error);
        }
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleNavigation = (link) => {
    router.push(link);
  };

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      setUserRole(null);
      router.push("/dang-nhap");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading || !mounted) return null;

  const getRolePath = (role, path) => {
    switch (role) {
      case "doctor":
        return `/bac-si/${path}`;
      case "patient":
        return `/nguoi-dung/${path}`;
      case "admin":
        return `/admin/${path}`;
      default:
        return "/";
    }
  };

  return (
    <Navbar shouldHideOnScroll maxWidth="full" className="px-6 sm:px-12">
      <NavbarBrand>
        <Link
          href="/"
          passHref
          className="flex items-center text-lg text-primary-600 dark:text-primary-400"
        >
          <Image
            src="/assets/logo.svg"
            alt="MedConnect Logo"
            width={40}
            height={40}
            className="mr-2"
          />
          <p className="font-bold text-inherit">MedConnect</p>
        </Link>
      </NavbarBrand>

      {/* MENU GIỮA */}
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {navigate.route.map((item, index) => (
          <NavbarItem key={index}>
            <Link
              href={item.link}
              className="text-primary-600 font-semibold hover:text-primary-600 dark:hover:text-primary-400"
            >
              {item.text}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      {/* MENU PHẢI */}
      <NavbarContent justify="end">
        {/* Nếu chưa đăng nhập */}
        {!isLoggedIn &&
          navigate.button.map((item, index) => (
            <NavbarItem key={index}>
              <Button
                color={item.color}
                variant={item.variant}
                onPress={() => handleNavigation(item.link)}
              >
                {item.text}
              </Button>
            </NavbarItem>
          ))}

        {/* Nếu đã đăng nhập */}
        {isLoggedIn && userRole && (
          <NavbarItem>
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  src="/assets/homepage/mockup-avatar.jpg"
                  className="w-10 h-10 ring-2 ring-cyan-100 cursor-pointer transition-transform hover:scale-105"
                  as="button"
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="User Actions" variant="flat">
                <DropdownItem
                  key="dashboard"
                  startContent={
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                  }
                  onClick={() => router.push(getRolePath(userRole, "trang-chu"))}
                >
                  Trang chủ
                </DropdownItem>

                <DropdownItem
                  key="profile"
                  startContent={
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  }
                  onClick={() => router.push(getRolePath(userRole, "ho-so"))}
                >
                  Hồ sơ
                </DropdownItem>

                <DropdownItem
                  key="settings"
                  startContent={
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  }
                  onClick={() => router.push(getRolePath(userRole, "cai-dat"))}
                >
                  Cài đặt
                </DropdownItem>

                <DropdownItem
                  key="logout"
                  color="danger"
                  className="text-danger"
                  startContent={
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                  }
                  onClick={handleLogout}
                >
                  Đăng xuất
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        )}
      </NavbarContent>
    </Navbar>
  );
};

export default Nav;
