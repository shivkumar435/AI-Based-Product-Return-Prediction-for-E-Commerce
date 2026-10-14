import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import productService from '../services/productService';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { SkeletonCard } from '../components/SkeletonLoader';
import PageTransition from '../components/PageTransition';
import FilterSidebar from '../components/FilterSidebar';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('name-asc');
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;
  const [pagination, setPagination] = useState({ page: 1, limit: itemsPerPage, totalPages: 1, totalProducts: 0 });

  const [filters, setFilters] = useState({ categories: [], brands: [], minPrice: '', maxPrice: '', minRating: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [compareList, setCompareList] = useState([]);
  const [facetOptions, setFacetOptions] = useState({ categories: [], brands: [] });

  const fetchProducts = async () => {
    setLoading(true);
    setError('');

    try {
      const params = { page, limit: itemsPerPage, sort: sortOrder };
      if (search) params.search = search;
      if (filters.categories.length > 0) params.category = filters.categories.join(',');
      if (filters.brands.length > 0) params.brand = filters.brands.join(',');
      if (filters.minPrice !== '') params.minPrice = filters.minPrice;
      if (filters.maxPrice !== '') params.maxPrice = filters.maxPrice;
      if (filters.minRating) params.rating = filters.minRating;

      const result = await productService.getProducts(params);
      let safeProducts = Array.isArray(result) ? result.filter(Boolean) : [];

      setFacetOptions({
        categories: Array.from(new Set(safeProducts.map(p => p.category).filter(Boolean))),
        brands: Array.from(new Set(safeProducts.map(p => p.brand).filter(Boolean)))
      });

      setProducts(safeProducts);
      setPagination({
        page: result?.pagination?.page ?? page,
        limit: result?.pagination?.limit ?? itemsPerPage,
        totalPages: result?.pagination?.totalPages ?? Math.max(1, Math.ceil(safeProducts.length / itemsPerPage)),
        totalProducts: result?.pagination?.totalProducts ?? safeProducts.length
      });
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setProducts([]);
      setPagination({ page: 1, limit: itemsPerPage, totalPages: 1, totalProducts: 0 });
      setError(err?.message || 'Failed to fetch products');
      toast.error(err?.response?.data?.message || err?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, sortOrder, page, filters]);

  const handleSearch = useCallback((value) => {
    setPage(1);
    setSearch(value);
  }, []);

  const handleFilterChange = (newFilters) => {
    setPage(1);
    setFilters(newFilters);
  };

  const toggleCompare = (product) => {
    setCompareList(prev => {
      const productId = product?._id || product?.id;
      const exists = prev.find(p => (p._id || p.id) === productId);
      if (exists) return prev.filter(p => (p._id || p.id) !== productId);
      if (prev.length >= 4) {
        toast.error('You can only compare up to 4 products');
        return prev;
      }
      return [...prev, product];
    });
  };

  const goToCompare = () => {
    const params = new URLSearchParams();
    compareList.forEach(p => params.append('id', p._id || p.id));
    navigate(`/compare?${params.toString()}`);
  };

  const displayProducts = Array.isArray(products) ? products : [];
  const totalPages = pagination?.totalPages || 1;
  const hasProducts = displayProducts.length > 0;

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Our Products</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Browse and predict returns for our catalog.</p>
          </div>
          <div className="flex gap-3 items-center">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              Filters
            </button>
            <div className="w-full md:w-72">
              <SearchBar onSearch={handleSearch} placeholder="Search products..." />
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar - Desktop */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <FilterSidebar filters={filters} onFilterChange={handleFilterChange} categories={facetOptions.categories} brands={facetOptions.brands} />
            </div>
          </div>
          
          {/* Sidebar - Mobile Drawer */}
          <AnimatePresence>
            {isSidebarOpen && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-40 md:hidden" />
                <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.3 }} className="fixed inset-y-0 left-0 w-80 bg-white dark:bg-slate-900 z-50 p-6 overflow-y-auto md:hidden shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Filters</h2>
                    <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-500"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                  </div>
                  <FilterSidebar filters={filters} onFilterChange={handleFilterChange} categories={facetOptions.categories} brands={facetOptions.brands} />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {displayProducts.length} of {pagination.totalProducts} products
              </p>
              <select 
                value={sortOrder} 
                onChange={(e) => { setPage(1); setSortOrder(e.target.value); }}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="name-asc">Name: A-Z</option>
                <option value="name-desc">Name: Z-A</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Top Rated</option>
                <option value="popularity-desc">Most Reviewed</option>
              </select>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : hasProducts ? (
              <>
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {displayProducts.map((product, i) => (
                      <motion.div
                        key={product?._id ?? product?.id ?? i}
                        layoutId={product?._id ?? product?.id ?? `product-${i}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                        className="relative group"
                      >
                        <ProductCard product={product} />
                        
                        {/* Compare Checkbox Overlay */}
                        <div className="absolute top-3 left-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                          <label className="flex items-center gap-2 bg-white dark:bg-slate-800 px-2 py-1.5 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={compareList.some(p => (p._id || p.id) === (product._id || product.id))}
                              onChange={() => toggleCompare(product)}
                              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <span className="text-xs font-medium text-slate-700 dark:text-gray-300">Compare</span>
                          </label>
                        </div>
                        {/* If already selected, keep it visible */}
                        {compareList.some(p => (p._id || p.id) === (product._id || product.id)) && (
                          <div className="absolute top-3 left-3 z-20">
                            <label className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/40 px-2 py-1.5 rounded-lg shadow-sm border border-indigo-200 dark:border-indigo-800 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={true}
                                onChange={() => toggleCompare(product)}
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                              />
                              <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">Added</span>
                            </label>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
                
                {totalPages > 1 && (
                  <div className="mt-10 flex justify-center items-center gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded-lg border border-gray-200 dark:border-slate-700 text-sm font-medium disabled:opacity-50">Prev</button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Page {pagination?.page ?? page} of {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 rounded-lg border border-gray-200 dark:border-slate-700 text-sm font-medium disabled:opacity-50">Next</button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
                  {error ? 'Unable to load products' : 'No products found'}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {error ? 'Please try again in a moment.' : 'Try adjusting your search or category filter.'}
                </p>
                {error && (
                  <button onClick={fetchProducts} className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">Retry</button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Floating Compare Button */}
        <AnimatePresence>
          {compareList.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 50 }} 
              className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-slate-800 rounded-full shadow-2xl border border-gray-200 dark:border-slate-700 px-6 py-3 flex items-center gap-4"
            >
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-xs font-bold">{compareList.length}</span>
                <span className="text-sm font-medium text-slate-700 dark:text-gray-200">Products selected</span>
              </div>
              <div className="w-px h-6 bg-gray-200 dark:bg-slate-700"></div>
              <button onClick={goToCompare} className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">Compare Now</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
