import React from 'react';
import { Avatar, Card, CardBody } from '@heroui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';

const Nav = () => {
  const router = useRouter();

  const menuItems = [
    {
      label: 'Dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      href: '/doctor/ui',
    },
    {
      label: 'Appointments',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      href: '/doctor/appointments',
    },
    {
      label: 'Working Hours',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      href: '/doctor/working-hours',
    },
    {
      label: 'Messages',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
      href: '/doctor/messages',
    },
    {
      label: 'Profile',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      href: '/doctor/profile',
    },
  ];

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
            src="/api/placeholder/40/40"
            alt="User Avatar"
            className="w-10 h-10 ring-2 ring-cyan-100"
          />
        </div>
      </div>
    </div>
  );
};

export default Nav;