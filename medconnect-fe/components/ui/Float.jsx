import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const Float = ({ 
  children, 
  variant = 'fadeInUp', 
  delay = 0, 
  duration = 0.4, 
  threshold = 0.1,
  once = true,
  className = '',
  ...props 
}) => {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, once]);

  const variants = {
    fadeInUp: {
      initial: { opacity: 0, y: 50 },
      animate: { opacity: 1, y: 0 },
    },
    fadeInLeft: {
      initial: { opacity: 0, x: -50 },
      animate: { opacity: 1, x: 0 },
    },
    fadeInRight: {
      initial: { opacity: 0, x: 50 },
      animate: { opacity: 1, x: 0 },
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
    },
    slideInUp: {
      initial: { y: 100, opacity: 0 },
      animate: { y: 0, opacity: 1 },
    },
  };

  const selectedVariant = variants[variant] || variants.fadeInUp;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="initial"
      animate={inView ? "animate" : "initial"}
      variants={selectedVariant}
      transition={{ duration, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Float;
