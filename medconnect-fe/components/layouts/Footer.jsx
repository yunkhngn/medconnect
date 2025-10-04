import React from 'react';
import { Divider } from '@heroui/react';
import Link from 'next/link';

const Footer = () => {
  const year = new Date().getFullYear();

  // Navigation links configuration
  const navigationLinks = [
    { href: "/", label: "Trang chủ" },
    { href: "/doctors", label: "Tìm bác sĩ" },
    { href: "/appointments", label: "Đặt lịch hẹn" },
    { href: "/about", label: "Về MedConnect" },
    { href: "/contact", label: "Liên hệ" }
  ];

  const systemLinks = [
    { href: "/vision", label: "Tầm nhìn sứ mệnh" },
    { href: "/healthcare-system", label: "Hệ thống cơ sở y tế" },
    { href: "/find-doctor", label: "Tìm bác sĩ" },
    { href: "/careers", label: "Làm việc tại MedConnect" }
  ];

  const serviceLinks = [
    { href: "/specialties", label: "Chuyên khoa" },
    { href: "/services", label: "Gói dịch vụ" },
    { href: "/insurance", label: "Bảo hiểm" },
    { href: "/appointments", label: "Đặt lịch hẹn" }
  ];

  const supportLinks = [
    { href: "/faq", label: "FAQ" },
    { href: "/policy/privacy", label: "Chính sách bảo mật" },
    { href: "/policy/terms", label: "Điều khoản sử dụng" }
  ];

  return (
    <footer role="contentinfo" className="bg-gray-50 dark:bg-gray-900">
      <Divider />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Hệ thống MedConnect */}
          <section>
            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Hệ thống MedConnect
            </h4>
            <nav className="flex flex-col space-y-2">
              {systemLinks.map((link, index) => (
                <Link 
                  key={index} 
                  href={link.href}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </section>

          {/* Dịch vụ */}
          <section>
            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Dịch vụ
            </h4>
            <nav className="flex flex-col space-y-2">
              {serviceLinks.map((link, index) => (
                <Link 
                  key={index} 
                  href={link.href}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </section>

          {/* Điều hướng */}
          <section>
            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Điều hướng
            </h4>
            <nav className="flex flex-col space-y-2">
              {navigationLinks.map((link, index) => (
                <Link 
                  key={index} 
                  href={link.href}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </section>

          {/* Hỗ trợ */}
          <section>
            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Hỗ trợ
            </h4>
            <nav className="flex flex-col space-y-2">
              {supportLinks.map((link, index) => (
                <Link 
                  key={index} 
                  href={link.href}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </section>

        </div>
      </div>
      
      <Divider />
      
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          © {year} MedConnect. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;