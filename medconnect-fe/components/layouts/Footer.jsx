import React from 'react';
import { Divider } from '@heroui/react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer role="contentinfo" className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <Divider />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Logo & Info */}
          <section className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <Image
                src="/assets/logo.svg"
                alt="MedConnect Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                MedConnect
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Nền tảng đặt lịch khám bệnh và tư vấn y tế trực tuyến hàng đầu Việt Nam.
            </p>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>📧 support@medconnect.vn</p>
              <p>📞 Hotline: 1900-6969</p>
            </div>
          </section>

          {/* Dịch vụ */}
          <section>
            <h4 className="text-sm font-semibold mb-4 text-gray-900 dark:text-white uppercase tracking-wider">
              Dịch vụ
            </h4>
            <nav className="flex flex-col space-y-2">
              <Link 
                href="/tim-bac-si"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
              >
                Tìm bác sĩ
              </Link>
              <Link 
                href="/dang-ky"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
              >
                Đăng ký tài khoản
              </Link>
            </nav>
          </section>

          {/* Hỗ trợ */}
          <section>
            <h4 className="text-sm font-semibold mb-4 text-gray-900 dark:text-white uppercase tracking-wider">
              Hỗ trợ
            </h4>
            <nav className="flex flex-col space-y-2">
              <Link 
                href="/chinh-sach/chinh-sach-bao-mat"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
              >
                Chính sách bảo mật
              </Link>
              <Link 
                href="/chinh-sach/dieu-khoan-su-dung"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
              >
                Điều khoản sử dụng
              </Link>
            </nav>
          </section>

          {/* Liên hệ */}
          <section>
            <h4 className="text-sm font-semibold mb-4 text-gray-900 dark:text-white uppercase tracking-wider">
              Liên hệ
            </h4>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p className="flex items-center space-x-2">
                <span>📧</span>
                <span>support@medconnect.vn</span>
              </p>
              <p className="flex items-center space-x-2">
                <span>📞</span>
                <span>1900-6969</span>
              </p>
              <p className="flex items-center space-x-2">
                <span>📍</span>
                <span>FU Hoà Lạc, Việt Nam</span>
              </p>
            </div>
          </section>

        </div>
      </div>
      
      <Divider />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <p>© {year} MedConnect. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Team G1-SE1961-NJ</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;