import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import productService from '../services/productService';
import { useCart } from '../context/CartContext';
import PageTransition from '../components/PageTransition';
import RatingStars from '../components/RatingStars';
import PriceDisplay from '../components/PriceDisplay';
import { formatSpecifications, parseComparisonIds } from '../utils/productUtils';

export default function ProductComparisonPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchComparisonProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(location.search);
        const ids = parseComparisonIds(params, 4);
        
        if (ids.length > 0) {
          const promises = ids.map(id => productService.getProduct(id));
          const results = await Promise.allSettled(promises);
          const validProducts = results
            .filter(r => r.status === 'fulfilled' && r.value)
            .map(r => r.value?.data || r.value)
            .filter(p => p && (p._id || p.id));

          setProducts(validProducts);
        } else if (location.state?.products) {
          setProducts(location.state.products.slice(0, 4));
        }
      } catch (error) {
        console.error('Failed to fetch products for comparison', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComparisonProducts();
  }, [location.search, location.state]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await productService.getProducts({ search: searchQuery, limit: 5 });
      setSearchResults(Array.isArray(results) ? results.filter(Boolean) : []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const addProduct = (product) => {
    if (products.length >= 4) return;
    if (products.find(p => p._id === product._id)) return;
    
    const newProducts = [...products, product];
    setProducts(newProducts);
    
    // Update URL
    const params = new URLSearchParams();
    newProducts.forEach(p => params.append('id', p._id || p.id));
    navigate(`/compare?${params.toString()}`, { replace: true });
    
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeProduct = (productId) => {
    const newProducts = products.filter(p => (p._id || p.id) !== productId);
    setProducts(newProducts);
    
    // Update URL
    const params = new URLSearchParams();
    newProducts.forEach(p => params.append('id', p._id || p.id));
    navigate(`/compare?${params.toString()}`, { replace: true });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-500">Loading comparison...</p>
      </div>
    );
  }

  const features = ['Brand', 'Category', 'Price', 'Rating', 'Stock', 'Description'];

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Compare Products</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Compare up to 4 products side by side to make the best choice.</p>

        {products.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-gray-200 dark:border-slate-800 text-center shadow-sm">
            <svg className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No products to compare</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">Search for products below to add them to your comparison view.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse">
              <thead>
                <tr>
                  <th className="p-4 border-b border-r border-gray-200 dark:border-slate-700 w-48 bg-gray-50 dark:bg-slate-800/50"></th>
                  {products.map(product => (
                    <th key={product._id || product.id} className="p-6 border-b border-r last:border-r-0 border-gray-200 dark:border-slate-700 w-1/4 align-top relative">
                      <button 
                        onClick={() => removeProduct(product._id || product.id)}
                        className="absolute top-4 right-4 p-1 bg-white dark:bg-slate-800 text-gray-400 hover:text-red-500 rounded-full shadow-sm border border-gray-100 dark:border-slate-700"
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                      <div className="h-40 bg-white dark:bg-slate-800 rounded-lg overflow-hidden border border-gray-100 dark:border-slate-700 flex items-center justify-center mb-4">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                        ) : (
                          <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        )}
                      </div>
                      <Link to={`/products/${product._id || product.id}`} className="block font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 mb-2 line-clamp-2">
                        {product.name}
                      </Link>
                      <button 
                        onClick={() => addToCart(product, 1)}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors mt-4"
                      >
                        Add to Cart
                      </button>
                    </th>
                  ))}
                  {products.length < 4 && (
                    <th className="p-6 border-b border-gray-200 dark:border-slate-700 w-1/4 align-middle text-center bg-gray-50/50 dark:bg-slate-800/20">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Add another product</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">({4 - products.length} slots remaining)</p>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {features.map((feature, idx) => (
                  <tr key={feature} className={idx % 2 === 0 ? 'bg-gray-50/30 dark:bg-slate-800/10' : ''}>
                    <td className="p-4 border-b border-r border-gray-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-800/50 text-sm">
                      {feature}
                    </td>
                    {products.map(product => (
                      <td key={`${product._id || product.id}-${feature}`} className="p-4 border-b border-r last:border-r-0 border-gray-200 dark:border-slate-700 text-sm text-gray-600 dark:text-gray-400 align-top">
                        {feature === 'Price' && <PriceDisplay price={product.price} size="sm" />}
                        {feature === 'Brand' && (product.brand || 'N/A')}
                        {feature === 'Category' && product.category}
                        {feature === 'Rating' && <RatingStars rating={product.rating || 0} size="sm" showCount count={product.numReviews || 0} />}
                        {feature === 'Stock' && (
                          <span className={`font-medium ${product.stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                          </span>
                        )}
                        {feature === 'Description' && <span className="line-clamp-4">{product.description || 'No description available.'}</span>}
                      </td>
                    ))}
                    {products.length < 4 && (
                      <td className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/20"></td>
                    )}
                  </tr>
                ))}
                
                {/* Specifications if they exist */}
                <tr>
                  <td colSpan={products.length + (products.length < 4 ? 2 : 1)} className="p-4 border-b border-gray-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white bg-gray-100 dark:bg-slate-800 text-sm">
                    Specifications
                  </td>
                </tr>
                <tr>
                  <td className="p-4 border-b border-r border-gray-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-800/50 text-sm">Details</td>
                  {products.map(product => {
                    const specsList = formatSpecifications(product.specifications);
                    return (
                      <td key={`${product._id || product.id}-specs`} className="p-4 border-b border-r last:border-r-0 border-gray-200 dark:border-slate-700 text-sm text-gray-600 dark:text-gray-400 align-top">
                        {specsList.length > 0 ? (
                          <ul className="space-y-1">
                            {specsList.map((spec, sIdx) => (
                              <li key={sIdx}>
                                <span className="font-medium text-slate-700 dark:text-gray-300">{spec.key}:</span> {spec.value}
                              </li>
                            ))}
                          </ul>
                        ) : 'N/A'}
                      </td>
                    );
                  })}
                  {products.length < 4 && (
                    <td className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/20"></td>
                  )}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {products.length < 4 && (
          <div className="mt-12 max-w-2xl bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Add a product to compare</h3>
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Search for a product..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500"
              />
              <button 
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </form>

            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2 border border-gray-100 dark:border-slate-700 rounded-xl p-2 max-h-64 overflow-y-auto">
                {searchResults.map(result => (
                  <div key={result._id || result.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded overflow-hidden">
                        {result.image && <img src={result.image} className="w-full h-full object-cover" alt="" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">{result.name}</p>
                        <PriceDisplay price={result.price} size="sm" />
                      </div>
                    </div>
                    <button 
                      onClick={() => addProduct(result)}
                      disabled={products.some(p => (p._id || p.id) === (result._id || result.id))}
                      className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {products.some(p => (p._id || p.id) === (result._id || result.id)) ? 'Added' : 'Add'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
