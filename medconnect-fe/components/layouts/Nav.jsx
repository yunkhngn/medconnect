import React, { useEffect, useState } from "react";
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
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import navigate from "@/config/Nav/guestNav";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { Home, FileText, Calendar, User } from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import getUserRole from "../../config/Auth/GetUserRole";
import UserAvatar from "@/components/ui/UserAvatar";

const Nav = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [userPhoto, setUserPhoto] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Subscribe to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        setUserEmail(user.email || localStorage.getItem("userEmail") || "");
        setUserPhoto(user.photoURL || null);

        // attempt to get role (reads custom claim or falls back to backend)
        try {
          const role = await getUserRole(user, { fallbackToBackend: true });
          setUserRole(role ? role.toLowerCase() : null);
        } catch (err) {
          console.warn("Failed to get user role:", err);
          setUserRole(null);
        }

        // keep a fallback in localStorage for compatibility
        try {
          if (user.email) localStorage.setItem("userEmail", user.email);
        } catch (e) {
          // ignore localStorage errors
        }
      } else {
        // not signed in
        setIsLoggedIn(false);
        setUserRole(null);
        setUserPhoto(null);
        // keep fallback from localStorage if available
        try {
          setUserEmail(localStorage.getItem("userEmail") || "");
        } catch (e) {
          setUserEmail("");
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const isActive = (href) => router.pathname === href;

  const handleLogout = async () => {
    try {
      // Sign out from Firebase client
      await signOut(auth);

      // OPTIONAL: If you use a server-side session cookie, you can call your backend logout endpoint here
      // await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/auth/logout`, {
      //   method: "POST",
      //   credentials: "include",
      // });

      // Note: per your request we do NOT remove remember-me keys here,
      // so rememberedEmail/rememberedPassword/rememberMe remain in localStorage.
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      router.push("/dang-nhap");
    }
  };

  return (
    <>
      <Navbar maxWidth="full" className=" lg:px-12">
        <NavbarBrand>
          <Link href="/" passHref className="flex items-center text-lg text-primary-600 dark:text-primary-400">
            <Image src="/assets/logo.svg" alt="MedConnect Logo" width={32} height={32} className="mr-2" />
            <p className="font-bold text-inherit">MedConnect</p>
          </Link>
        </NavbarBrand>

        {/* Desktop Menu */}
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          {navigate.route.map((item, index) => (
            <NavbarItem key={index}>
              <Link href={item.link} className="text-primary-600 font-semibold hover:text-primary-600 dark:hover:text-primary-400">
                {item.text}
              </Link>
            </NavbarItem>
          ))}
        </NavbarContent>

        <NavbarContent justify="end">
          {/* Desktop Auth Buttons */}
          {!isLoggedIn && (
            <div className="hidden sm:flex gap-3">
              <NavbarItem>
                <Link
                  href="/dang-nhap"
                  passHref
                  className="px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:from-blue-600 hover:to-cyan-700 hover:scale-105 shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/20 hover:border-white/30"
                >
                  Đăng nhập
                </Link>
              </NavbarItem>
              <NavbarItem>
                <Link
                  href="/dang-ky"
                  passHref
                  className="px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 bg-white/90 backdrop-blur-md text-gray-700 hover:bg-white hover:text-gray-900 hover:scale-105 shadow-lg hover:shadow-xl border border-white/30 hover:border-white/50"
                >
                  Đăng ký
                </Link>
              </NavbarItem>
            </div>
          )}

          {/* Desktop Avatar */}
          {isLoggedIn && (
            <NavbarItem className="hidden sm:flex">
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                <UserAvatar 
                  size={40}
                  asButton
                />
                </DropdownTrigger>
                <DropdownMenu aria-label="User Actions" variant="flat">
                  <DropdownItem
                    key="dashboard"
                    startContent={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    }
                    onClick={() => {
                      const role = (userRole || "").toUpperCase();
                      if (role === "ADMIN") router.push("/admin/trang-chu");
                      else if (role === "DOCTOR") router.push("/bac-si/trang-chu");
                      else router.push("/nguoi-dung/trang-chu");
                    }}
                  >
                    Dashboard
                  </DropdownItem>

                  <DropdownItem
                    key="settings"
                    startContent={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    }
                    onClick={() => {
                      const role = (userRole || "").toUpperCase();
                      if (role === "ADMIN") router.push("/admin/cai-dat");
                      else if (role === "DOCTOR") router.push("/bac-si/cai-dat");
                      else router.push("/nguoi-dung/cai-dat");
                    }}
                  >
                    Settings
                  </DropdownItem>

                  <DropdownItem
                    key="logout"
                    color="danger"
                    className="text-danger"
                    startContent={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    }
                    onClick={handleLogout}
                  >
                    Logout
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </NavbarItem>
          )}

          {/* Mobile Menu Button */}
          <NavbarItem className="sm:hidden">
            <Button
              isIconOnly
              variant="light"
              onClick={() => setIsMenuOpen(true)}
              className="text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </NavbarItem>
        </NavbarContent>
      </Navbar>
      
      {/* Mobile Menu Modal */}
      <Modal isOpen={isMenuOpen} onOpenChange={setIsMenuOpen} size="full" className="sm:hidden" hideCloseButton={true}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center justify-between">
                <div className="flex items-center">
                  <Image src="/assets/logo.svg" alt="MedConnect Logo" width={32} height={32} className="mr-2" />
                  <span className="font-bold text-lg">MedConnect</span>
                </div>
                <Button isIconOnly variant="light" onClick={onClose}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </ModalHeader>
              <ModalBody className="px-6">
                {/* Navigation Links */}
                <div className="space-y-4 mb-8">
                  {navigate.route.map((item, index) => (
                    <Link
                      key={index}
                      href={item.link}
                      className="block py-3 px-4 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
                      onClick={onClose}
                    >
                      {item.text}
                    </Link>
                  ))}
                </div>

                {/* Auth Section */}
                {!isLoggedIn ? (
                  <div className="space-y-4">
                    <Button
                      color="primary"
                      size="lg"
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      onClick={() => {
                        onClose();
                        router.push("/dang-nhap");
                      }}
                    >
                      Đăng nhập
                    </Button>
                    <Button
                      variant="bordered"
                      size="lg"
                      className="w-full bg-white/90 backdrop-blur-md border-white/30 hover:bg-white hover:scale-105 shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={() => {
                        onClose();
                        router.push("/dang-ky");
                      }}
                    >
                      Đăng ký
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Avatar
                        src={userPhoto || null}
                        size="md"
                        showFallback
                        fallback={
                          <User className="text-default-400" size={24} />
                        }
                      />
                      <div>
                        <p className="font-medium text-gray-900">{userEmail}</p>
                        <p className="text-sm text-gray-500 capitalize">{userRole}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button
                        variant="light"
                        className="w-full justify-start"
                        startContent={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                        }
                        onClick={() => {
                          onClose();
                          const role = (userRole || "").toUpperCase();
                          if (role === "ADMIN") router.push("/admin/trang-chu");
                          else if (role === "DOCTOR") router.push("/bac-si/trang-chu");
                          else router.push("/nguoi-dung/trang-chu");
                        }}
                      >
                        Dashboard
                      </Button>

                      <Button
                        variant="light"
                        className="w-full justify-start"
                        startContent={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        }
                        onClick={() => {
                          onClose();
                          const role = (userRole || "").toUpperCase();
                          if (role === "ADMIN") router.push("/admin/cai-dat");
                          else if (role === "DOCTOR") router.push("/bac-si/cai-dat");
                          else router.push("/nguoi-dung/cai-dat");
                        }}
                      >
                        Settings
                      </Button>

                      <Button
                        color="danger"
                        variant="light"
                        className="w-full justify-start"
                        startContent={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                        }
                        onClick={() => {
                          onClose();
                          handleLogout();
                        }}
                      >
                        Logout
                      </Button>
                    </div>
                  </div>
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default Nav;