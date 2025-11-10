import React from 'react';
import { Button } from '@heroui/react';
import Link from 'next/link';
import Router from 'next/router';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-xl"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-2xl">

        {/* 404 Text */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-fuchsia-200">
            404
          </h1>
          <div className="mt-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Trang không tồn tại
            </h2>
            <p className="text-lg text-gray-600">
              Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
            </p>
          </div>
        </div>

        {/* Illustration */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-64 h-64">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Doctor illustration */}
              <circle cx="100" cy="100" r="80" fill="#E0E7FF" opacity="0.3" />
              <circle cx="100" cy="90" r="30" fill="#60A5FA" />
              <rect x="70" y="115" width="60" height="60" rx="5" fill="#3B82F6" />
              <circle cx="85" cy="85" r="5" fill="white" />
              <circle cx="115" cy="85" r="5" fill="white" />
              <path d="M 85 100 Q 100 110 115 100" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              color="primary" 
              size="lg"
              className="min-w-[200px]"
              startContent={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              }
              onClick={() => Router.push('/')}
            >
              Về trang chủ
            </Button>
        </div>

        {/* Help Links */}
        <div className="mt-12 text-sm text-gray-600">
          <p className="mb-2">Có thể bạn đang tìm:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/dang-nhap" className="text-blue-600 hover:text-blue-700 hover:underline">
              Đăng nhập
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/dang-ky" className="text-blue-600 hover:text-blue-700 hover:underline">
              Đăng ký
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/chinh-sach/dieu-khoan-su-dung" className="text-blue-600 hover:text-blue-700 hover:underline">
              Điều khoản
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/chinh-sach/chinh-sach-bao-mat" className="text-blue-600 hover:text-blue-700 hover:underline">
              Bảo mật
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;