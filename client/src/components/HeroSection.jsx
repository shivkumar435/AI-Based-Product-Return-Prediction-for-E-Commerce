import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const stats = [
  { label: 'Prediction Accuracy', value: '83%+' },
  { label: 'ML Features Analyzed', value: '12' },
  { label: 'Supported Categories', value: '7' },
  { label: 'Algorithm', value: 'Random Forest' },
];

export default function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-slate-900 text-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 z-0" />

      {/* Animated blobs */}
      <div className="absolute top-10 left-1/4 w-80 h-80 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse z-0" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse z-0" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 z-0" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs text-indigo-300 font-medium mb-6 backdrop-blur-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          AI-Powered Prediction Engine Active
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight"
        >
          Predict Returns<br />
          <motion.span 
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"
          >
            Before They Happen
          </motion.span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-2xl mx-auto text-lg text-gray-300 mb-10 leading-relaxed"
        >
          Leverage machine learning to identify high-risk orders in real-time. Reduce return costs, improve customer experience, and make data-driven decisions.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
        >
          <Link
            to="/register"
            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-base transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50"
          >
            Get Started Free
          </Link>
          <Link
            to="/products"
            className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-semibold text-base transition-all backdrop-blur-sm"
          >
            Explore Demo →
          </Link>
        </motion.div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {stats.map((stat, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + (i * 0.1) }}
              className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm"
            >
              <p className="text-2xl font-extrabold text-white mb-1">{stat.value}</p>
              <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom wave */}
      <div className="relative z-10 h-12 bg-gradient-to-b from-transparent to-white dark:to-slate-950" />
    </div>
  );
}
