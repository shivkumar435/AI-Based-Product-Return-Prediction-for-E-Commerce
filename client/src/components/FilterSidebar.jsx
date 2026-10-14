import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FilterSidebar({ filters, onFilterChange, categories = [], brands = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState({
    category: false,
    price: false,
    brand: false,
    rating: false
  });

  const toggleSection = (section) => {
    setCollapsed(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCheckboxChange = (key, value, isChecked) => {
    let current = filters[key] || [];
    if (isChecked) {
      onFilterChange({ ...filters, [key]: [...current, value] });
    } else {
      onFilterChange({ ...filters, [key]: current.filter(item => item !== value) });
    }
  };

  const handleRadioChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const handlePriceChange = (e, type) => {
    const val = e.target.value === '' ? '' : Number(e.target.value);
    onFilterChange({ 
      ...filters, 
      [type]: val
    });
  };

  const clearFilters = () => {
    onFilterChange({ categories: [], brands: [], minPrice: '', maxPrice: '', minRating: '' });
  };

  const ChevronIcon = ({ isCollapsed }) => (
    <svg 
      className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} 
      fill="none" viewBox="0 0 24 24" stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  );

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Filters</h2>
        <button 
          onClick={clearFilters}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
        >
          Clear All
        </button>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
          <button 
            onClick={() => toggleSection('category')}
            className="flex items-center justify-between w-full mb-3"
          >
            <h3 className="font-medium text-slate-900 dark:text-white">Category</h3>
            <ChevronIcon isCollapsed={collapsed.category} />
          </button>
          {!collapsed.category && (
            <div className="space-y-2 mt-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {categories.map(cat => (
                <label key={cat} className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-slate-600 dark:bg-slate-700"
                    checked={(filters.categories || []).includes(cat)}
                    onChange={(e) => handleCheckboxChange('categories', cat, e.target.checked)}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-300">{cat}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Price Range */}
      <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
        <button 
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full mb-3"
        >
          <h3 className="font-medium text-slate-900 dark:text-white">Price Range</h3>
          <ChevronIcon isCollapsed={collapsed.price} />
        </button>
        {!collapsed.price && (
          <div className="flex items-center gap-2 mt-2">
            <input 
              type="number" 
              placeholder="Min"
              min="0"
              value={filters.priceRange?.min || ''}
              onChange={(e) => handlePriceChange(e, 'min')}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none"
            />
            <span className="text-gray-500">-</span>
            <input 
              type="number" 
              placeholder="Max"
              min="0"
              value={filters.priceRange?.max || ''}
              onChange={(e) => handlePriceChange(e, 'max')}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>
        )}
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
          <button 
            onClick={() => toggleSection('brand')}
            className="flex items-center justify-between w-full mb-3"
          >
            <h3 className="font-medium text-slate-900 dark:text-white">Brand</h3>
            <ChevronIcon isCollapsed={collapsed.brand} />
          </button>
          {!collapsed.brand && (
            <div className="space-y-2 mt-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {brands.map(brand => (
                <label key={brand} className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox"
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-slate-600 dark:bg-slate-700"
                    checked={(filters.brands || []).includes(brand)}
                    onChange={(e) => handleCheckboxChange('brands', brand, e.target.checked)}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-300">{brand}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rating */}
      <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
        <button 
          onClick={() => toggleSection('rating')}
          className="flex items-center justify-between w-full mb-3"
        >
          <h3 className="font-medium text-slate-900 dark:text-white">Customer Rating</h3>
          <ChevronIcon isCollapsed={collapsed.rating} />
        </button>
        {!collapsed.rating && (
          <div className="space-y-2 mt-2">
            {[4, 3, 2].map(star => (
              <label key={star} className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="radio"
                  name="rating"
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-slate-600 dark:bg-slate-700"
                  checked={Number(filters.minRating || 0) === star}
                  onChange={() => handleRadioChange('minRating', star)}
                />
                <span className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                  {star} <span className="text-amber-400 mx-1">★</span> & up
                </span>
              </label>
            ))}
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="radio"
                name="rating"
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-slate-600 dark:bg-slate-700"
                  checked={!filters.minRating}
                onChange={() => handleRadioChange('minRating', null)}
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">All Ratings</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden mb-4 flex justify-end">
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-white font-medium shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
          Filters {Object.keys(filters).length > 0 && <span className="bg-indigo-600 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center">{Object.keys(filters).length}</span>}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 shrink-0 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl p-5 h-max sticky top-24">
        <FilterContent />
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-[280px] max-w-full bg-white dark:bg-slate-900 z-50 shadow-2xl overflow-y-auto p-5"
            >
              <div className="flex justify-end mb-2">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <FilterContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
