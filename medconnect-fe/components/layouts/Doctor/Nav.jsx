import React from 'react';
import { Avatar, Card, CardBody } from '@heroui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import menuItems from "@/config/Nav/doctorNav";

const Nav = () => {
  const router = useRouter();
  const isActive = (href) => router.pathname === href;

  return (
    <div className="fixed left-0 top-0 h-screen w-30 bg-white border-r border-gray-200 flex flex-col z-50">
      {/* Logo */}
      <Link href="/doctor/dashboard">
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
          <Avatar
            src="/assets/homepage/mockup-avatar.jpg"
            alt="User Avatar"
            className="w-10 h-10 ring-2 ring-cyan-100"
          />
        </div>
      </div>
    </div>
  );
};

export default Nav;