import React, { useEffect, useState } from 'react';
import { Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import menuItems from "@/config/Nav/doctorNav";
import { getAuth, signOut } from "firebase/auth";
import { useTheme } from 'next-themes';

const Nav = () => {
  const router = useRouter();
  const isActive = (href) => router.pathname === href;

 const handleLogout = async () => {
  const auth = getAuth();
  try {
    await signOut(auth);
    router.push('/dang-nhap');
  } catch (error) {
    console.error("Logout failed: ", error);
  }
};

  const [userEmail, setUserEmail] = useState('');
  const { resolvedTheme } = useTheme();
  const [mountedTheme, setMountedTheme] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserEmail(localStorage.getItem('userEmail') || '');
    }
    setMountedTheme(true);
  }, []);

  const getInitials = (email) => {
    if (!email) return '';
    const local = email.split('@')[0];
    const parts = local.split(/[\.\-_]/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const hashToHue = (str) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h + str.charCodeAt(i) * (i + 1)) % 360;
    return h;
  };

  const getAvatarStyle = (email) => {
    if (!email || !mountedTheme) return {};
    const hue = hashToHue(email);
    const isDark = resolvedTheme === 'dark';
    const saturation = '66%';
    const lightA = isDark ? '36%' : '92%';
    const lightB = isDark ? '26%' : '76%';
    const bg1 = `hsl(${hue} ${saturation} ${lightA})`;
    const bg2 = `hsl(${(hue + 30) % 360} ${saturation} ${lightB})`;
    const textColor = isDark ? '#ffffff' : '#0f172a';
    return {
      background: `linear-gradient(135deg, ${bg1}, ${bg2})`,
      color: textColor,
    };
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-30 bg-white border-r border-gray-200 flex flex-col z-50">
      {/* Logo */}
      <Link href="/">
        <div className="p-4 flex items-center justify-center border-b border-gray-100">
          <div className="w-13 h-13 bg-gray-100 rounded-xl flex items-center justify-center">
            <Image src="/assets/logo.svg" alt="Logo" width={40} height={40} />
          </div>
        </div>
      </Link>

      {/* Menu Items */}
      <nav className="flex-1 px-2 py-6 space-y-2">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div
              className={`
                transition-all duration-200 cursor-pointer flex flex-col items-center gap-2 py-3 px-2 rounded-lg
                ${isActive(item.href) 
                  ? 'bg-teal-50 text-teal-700' 
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700'
                }
              `}
            >
              <div className="w-6 h-6">
                {item.icon}
              </div>
              <span className="text-xs font-medium text-center">
                {item.label}
              </span>
            </div>
          </Link>
        ))}
      </nav>

      {/* User Avatar */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center justify-center">
          <Dropdown placement="top">
            <DropdownTrigger>
              {userEmail ? (
                <Avatar
                  className="w-10 h-10 ring-2 ring-cyan-100 cursor-pointer flex items-center justify-center"
                  as="button"
                  style={getAvatarStyle(userEmail)}
                >
                  {getInitials(userEmail)}
                </Avatar>
              ) : (
                <Avatar
                  src="/assets/homepage/mockup-avatar.jpg"
                  alt="User Avatar"
                  className="w-10 h-10 ring-2 ring-cyan-100 cursor-pointer"
                />
              )}
            </DropdownTrigger>
            <DropdownMenu aria-label="User Actions">
              <DropdownItem key="settings" textValue="Settings">
                <Link href="/bac-si/cai-dat" className="w-full block">
                  Cài đặt
                </Link>
              </DropdownItem>
              <DropdownItem 
                key="logout" 
                className="bg-gray-100 text-red-600"
                color="danger"
                variant="flat"
                onClick={handleLogout}
              >
                Đăng xuất
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </div>
  );
};

export default Nav;