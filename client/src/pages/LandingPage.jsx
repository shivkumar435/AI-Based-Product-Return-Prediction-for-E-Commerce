import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import HeroSection from '../components/HeroSection';
import ProductCard from '../components/ProductCard';
import productService from '../services/productService';

const features = [
  {
    title: 'AI Predictions',
    desc: 'Random Forest model trained on real e-commerce transaction patterns for accurate return predictions.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
    ),
    color: 'indigo',
  },
  {
    title: 'Real-time Analytics',
    desc: 'Instant probability scores and risk classifications the moment an order is placed.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
    ),
    color: 'amber',
  },
  {
    title: 'Secure Platform',
    desc: 'JWT authentication, bcrypt password hashing, Helmet security headers, and rate limiting.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
    ),
    color: 'emerald',
  },
  {
    title: 'Admin Dashboard',
    desc: 'Full analytics suite — charts, high-risk alerts, prediction reports, and order management.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    ),
    color: 'purple',
  },
];

const colorMap = {
  indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30',
  amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30',
  emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30',
  purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30',
};

const steps = [
  { step: '01', title: 'Browse Products', desc: 'Explore our catalog of products across 7 categories.', icon: '🛒' },
  { step: '02', title: 'Submit Order Details', desc: 'Enter order parameters including customer profile and purchase details.', icon: '📋' },
  { step: '03', title: 'AI Analyzes 12 Features', desc: 'Our Random Forest model evaluates every dimension of the transaction.', icon: '🧠' },
  { step: '04', title: 'Instant Risk Score', desc: 'Receive a probability score, risk level, and actionable recommendation.', icon: '📊' },
];




export default function LandingPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    productService.getProducts().then(data => setProducts((data || []).slice(0, 4))).catch(() => {});
  }, []);

  return (
    <div>
      <HeroSection />

      {/* Features */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">Why ReturnSense</p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Everything you need to reduce returns</h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Built for final-year project demonstration and production use — a complete AI-integrated e-commerce platform.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="p-6 bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${colorMap[f.color]}`}>
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold mb-2 text-slate-900 dark:text-white">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">The Process</p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">How AI Return Prediction Works</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {steps.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="relative bg-white dark:bg-slate-800/60 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">Step {item.step}</span>
                </div>
                <h3 className="text-base font-semibold mb-2 text-slate-900 dark:text-white">{item.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Preview */}
      {products.length > 0 && (
        <section className="py-20 bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-10">
              <div>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">Catalog</p>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Featured Products</h2>
                <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">Try our prediction model on real products.</p>
              </div>
              <Link to="/products" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline hidden sm:block">
                View all products →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
            <div className="text-center mt-8 sm:hidden">
              <Link to="/products" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                View all products →
              </Link>
            </div>
          </div>
        </section>
      )}

      
      {/* Animated Stats */}
      <section className="py-20 bg-indigo-600 dark:bg-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Predictions Made', value: '2000+' },
              { label: 'Uptime', value: '99.9%' },
              { label: 'ML Models Compared', value: '4' },
              { label: 'Features Analyzed', value: '12' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="text-4xl font-extrabold mb-2">{stat.value}</div>
                <div className="text-indigo-200 text-sm font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">Trusted By</p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-12">What Our Partners Say</h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { quote: "ReturnSense cut our false return claims by 40% in just two months.", author: "Sarah Jenkins", role: "E-commerce Director" },
              { quote: "The real-time risk scoring allows us to process high-value orders with confidence.", author: "Michael Chen", role: "Operations Lead" },
              { quote: "Integration was seamless. The prediction accuracy has consistently stayed above 85%.", author: "Emma Davis", role: "Tech Lead" }
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 bg-gray-50 dark:bg-slate-900 rounded-2xl text-left"
              >
                <div className="text-indigo-600 mb-4">
                  <svg className="w-8 h-8 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 italic">"{t.quote}"</p>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{t.author}</p>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
