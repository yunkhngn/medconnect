import React from 'react';
import { Button } from '@heroui/react';
import Router from 'next/router';

const ServerErrorPage = () => {
  return (
    <div className="z-99999 min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-xl"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-red-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl"></div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-2xl">
        {/* 500 Text */}
        <div className="mb-8 mt-8">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-600">
            500
          </h1>
          <div className="mt-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Lỗi máy chủ
            </h2>
            <p className="text-lg text-gray-600">
              Rất tiếc, đã có lỗi xảy ra trên máy chủ. Chúng tôi đang khắc phục vấn đề.
            </p>
          </div>
        </div>

        {/* Illustration */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-64 h-64">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Server error illustration */}
              <circle cx="100" cy="100" r="80" fill="#FEE2E2" opacity="0.3" />
              {/* Server */}
              <rect x="60" y="60" width="80" height="60" rx="5" fill="#DC2626" />
              <rect x="60" y="60" width="80" height="15" rx="5" fill="#991B1B" />
              {/* Warning symbol */}
              <circle cx="100" cy="140" r="25" fill="#FCA5A5" />
              <text x="100" y="155" fontSize="30" fill="#991B1B" textAnchor="middle" fontWeight="bold">!</text>
              {/* Lights */}
              <circle cx="75" cy="68" r="3" fill="#FCA5A5" />
              <circle cx="90" cy="68" r="3" fill="#FCA5A5" />
              <circle cx="105" cy="68" r="3" fill="#FCA5A5" />
            </svg>
          </div>
        </div>

        {/* Error Details */}
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 mb-2">
            <strong>Mã lỗi:</strong> 500 Internal Server Error
          </p>
          <p className="text-sm text-red-700">
            Đội ngũ kỹ thuật đã được thông báo và đang xử lý sự cố. Vui lòng thử lại sau.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            color="danger" 
            size="lg"
            className="min-w-[200px]"
            onClick={() => window.location.reload()}
            startContent={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            }
          >
            Thử lại
          </Button>
            <Button 
              variant="bordered" 
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

        {/* Help Section */}
        <div className="mt-12 p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Cần trợ giúp ngay?
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Nếu sự cố vẫn tiếp diễn, vui lòng liên hệ với chúng tôi:
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <a href="mailto:support@medconnect.vn" className="text-red-600 hover:text-red-700 hover:underline flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              support@medconnect.vn
            </a>
            <span className="text-gray-300">|</span>
            <a href="tel:1900xxxx" className="text-red-600 hover:text-red-700 hover:underline flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Hotline: 1900-xxxx
            </a>
          </div>
        </div>

        {/* Timestamp */}
        <div className="mt-6 text-xs text-gray-500">
          Thời gian: {new Date().toLocaleString('vi-VN')}
        </div>
      </div>
    </div>
  );
};

export default ServerErrorPage;
