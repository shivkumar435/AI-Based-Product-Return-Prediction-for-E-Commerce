import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import PageTransition from '../components/PageTransition';
import RatingStars from '../components/RatingStars';
import PriceDisplay from '../components/PriceDisplay';
import ProductCard from '../components/ProductCard';
import WishlistButton from '../components/WishlistButton';
import reviewService from '../services/reviewService';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  
  const { addToCart } = useCart();

  const fetchReviews = async () => {
    try {
      const revs = await reviewService.getProductReviews(id);
      setReviews(Array.isArray(revs) ? revs : []);
    } catch (_) {}
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await productService.getProduct(id);
        setProduct(data);
        setActiveImage(0);
        setQuantity(1);
        
        // Fetch related products (same category)
        if (data.category) {
          const related = await productService.getProducts({ category: data.category, limit: 5 });
          const filtered = Array.isArray(related) ? related.filter(p => (p._id || p.id) !== id).slice(0, 4) : [];
          setRelatedProducts(filtered);
        }
        await fetchReviews();
      } catch (err) {
        toast.error('Failed to load product');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id, navigate]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      await reviewService.createReview(id, { rating: reviewRating, comment: reviewComment });
      toast.success('Review submitted successfully!');
      setReviewComment('');
      setShowReviewForm(false);
      await fetchReviews();
      const freshProd = await productService.getProduct(id);
      setProduct(freshProd);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-gray-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="space-y-6 pt-4">
            <div className="h-8 bg-gray-200 dark:bg-slate-800 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded w-1/4"></div>
            <div className="h-24 bg-gray-200 dark:bg-slate-800 rounded"></div>
            <div className="h-12 bg-gray-200 dark:bg-slate-800 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  // Mock multiple images if only one is provided
  const images = product.images && product.images.length > 0 
    ? product.images 
    : (product.image ? [product.image, product.image, product.image] : []);

  const isOutOfStock = product.stock === 0;

  // Mock category risk
  const categoryRiskRates = {
    'Electronics': 12.5,
    'Clothing': 24.8,
    'Shoes': 18.2,
    'Home & Kitchen': 8.4,
    'Beauty': 5.2,
    'Sports': 10.1,
    'Books': 2.1
  };
  const categoryRisk = categoryRiskRates[product.category] || 15.0;

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden flex items-center justify-center relative">
              <div className="absolute top-4 right-4 z-10">
                <WishlistButton productId={product._id || product.id} />
              </div>
              {images.length > 0 ? (
                <img src={images[activeImage]} alt={product.name} className="w-full h-full object-contain p-4" />
              ) : (
                <svg className="w-32 h-32 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`aspect-square bg-white dark:bg-slate-900 rounded-xl border-2 overflow-hidden ${activeImage === idx ? 'border-indigo-600' : 'border-gray-100 dark:border-slate-800 hover:border-indigo-300'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain p-2" />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400 text-xs font-bold rounded-full uppercase tracking-wider">{product.category}</span>
              {product.brand && <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{product.brand}</span>}
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <RatingStars rating={product.rating || 0} size="md" showCount count={product.numReviews || 0} />
              <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-700"></div>
              <span className={`text-sm font-medium ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
                {isOutOfStock ? 'Out of Stock' : `${product.stock} in stock`}
              </span>
            </div>
            
            <div className="mb-8">
              <PriceDisplay price={product.price} originalPrice={product.discount > 0 ? product.price / (1 - product.discount/100) : null} size="xl" />
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
              {product.description || 'No description available for this product.'}
            </p>

            {/* AI Return Risk Preview */}
            <div className="mb-8 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/20 flex items-start gap-4">
              <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-indigo-600 dark:text-indigo-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div>
                <h3 className="font-semibold text-indigo-900 dark:text-indigo-300 text-sm mb-1">AI Return Insights</h3>
                <p className="text-sm text-indigo-700 dark:text-indigo-400/80">
                  Products in the <strong>{product.category}</strong> category have a historically <strong>{categoryRisk}% average return rate</strong>. A personalized prediction will be generated at checkout.
                </p>
              </div>
            </div>

            <hr className="border-gray-200 dark:border-slate-800 mb-8" />
            
            {/* Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 dark:border-slate-600 rounded-xl h-12 bg-white dark:bg-slate-900">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={isOutOfStock}
                    className="px-4 text-gray-600 dark:text-gray-300 hover:text-indigo-600 disabled:opacity-50 h-full flex items-center justify-center"
                  >-</button>
                  <span className="w-10 text-center font-medium text-slate-900 dark:text-white">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    disabled={isOutOfStock || quantity >= product.stock}
                    className="px-4 text-gray-600 dark:text-gray-300 hover:text-indigo-600 disabled:opacity-50 h-full flex items-center justify-center"
                  >+</button>
                </div>
                
                <button 
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="flex-1 h-12 bg-white dark:bg-slate-800 border-2 border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:border-gray-300 disabled:text-gray-400"
                >
                  Add to Cart
                </button>
              </div>
              
              <button 
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-500/20 transition-colors disabled:opacity-50 disabled:shadow-none"
              >
                Buy Now
              </button>
            </div>
            
            <div className="mt-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
              <span>Free delivery on orders above $500</span>
            </div>
          </div>
        </div>

        {/* Specifications Section */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Specifications</h2>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(product.specifications).map(([key, value], idx) => (
                    <tr key={key} className={idx % 2 === 0 ? 'bg-gray-50 dark:bg-slate-800/50' : ''}>
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white w-1/3">{key}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Customer Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="bg-gray-50 dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 text-center">
                <p className="text-5xl font-bold text-slate-900 dark:text-white mb-2">{(product.rating || 0).toFixed(1)}</p>
                <div className="flex justify-center mb-2">
                  <RatingStars rating={product.rating || 0} size="lg" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Based on {product.numReviews || 0} reviews</p>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-slate-900 dark:text-white">Customer Feedback</h3>
                <button 
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {showReviewForm ? 'Cancel' : 'Write a Review'}
                </button>
              </div>

              {showReviewForm && (
                <form onSubmit={handleSubmitReview} className="mb-8 p-6 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 space-y-4">
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">Write your Review</h4>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Rating</label>
                    <select 
                      value={reviewRating} 
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                    >
                      <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                      <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                      <option value="3">⭐⭐⭐ (3 Stars)</option>
                      <option value="2">⭐⭐ (2 Stars)</option>
                      <option value="1">⭐ (1 Star)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Your Comment</label>
                    <textarea 
                      rows="3"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience with this product..."
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={submittingReview}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-6">
                {reviews.length > 0 ? (
                  reviews.map((r, i) => (
                    <div key={r._id || i} className="border-b border-gray-100 dark:border-slate-800 pb-6 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-xs">
                            {(r.user?.name || 'Customer').substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-white">{r.user?.name || 'Verified Customer'}</span>
                        </div>
                        <span className="text-xs text-gray-500">{new Date(r.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                      <RatingStars rating={r.rating || 5} size="sm" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{r.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                    No reviews yet. Be the first to review this product!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">You Might Also Like</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(prod => (
                <ProductCard key={prod._id || prod.id} product={prod} />
              ))}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}