import React from 'react';
import { motion } from 'framer-motion';

const AnimatedCard = ({ children, className = '', delay = 0, hover = true }) => {
  const hoverProps = hover ? {
    whileHover: { scale: 1.02, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }
  } : {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden ${className}`}
      {...hoverProps}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
