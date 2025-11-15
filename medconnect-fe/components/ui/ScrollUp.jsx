import React, { useState, useEffect } from 'react';

const ScrollUp = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled up to given distance
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-white/20 backdrop-blur-md text-white shadow-2xl hover:shadow-3xl hover:scale-110 active:scale-95 transition-all duration-500 flex items-center justify-center group border-2 border-white/30 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      aria-label="Scroll to top"
    >
      {/* Inner circle */}
      <div className="absolute inset-1 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 flex items-center justify-center">
        <svg 
          className="w-6 h-6 transform group-hover:-translate-y-1 transition-transform duration-300 text-white" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </div>
    </button>
  );
};

export default ScrollUp;