import React, { useEffect, useState } from 'react';
import { Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import menuItems from "@/config/Nav/adminNav";
import { logout as authLogout } from "@/utils/auth";

const Nav = () => {
  const router = useRouter();
  const isActive = (href) => router.pathname === href;

  const handleLogout = () => {
    authLogout();
    router.push("/dang-nhap");
  };

  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserEmail(localStorage.getItem('userEmail') || '');
    }
  }, []);

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
              <Avatar
                src={
                  userEmail
                    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(userEmail)}&size=128&bold=true&rounded=true&background=random&color=ffffff`
                    : '/assets/homepage/mockup-avatar.jpg'
                }
                alt={userEmail ? userEmail : 'User Avatar'}
                className="w-10 h-10 ring-2 ring-cyan-100 cursor-pointer transition-transform hover:scale-105"
                as="button"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="User Actions">
              <DropdownItem key="settings" textValue="Settings">
                <Link href="/admin/cai-dat" className="w-full block">
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