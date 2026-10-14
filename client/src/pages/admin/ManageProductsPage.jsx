import { useState, useEffect } from 'react';
import productService from '../../services/productService';
import { motion } from 'framer-motion';
import PageTransition from '../../components/PageTransition';
import { SkeletonTable } from '../../components/SkeletonLoader';
import DataTable from '../../components/DataTable';
import toast from 'react-hot-toast';

const CATEGORIES = ['Electronics', 'Clothing', 'Shoes', 'Home & Kitchen', 'Beauty', 'Sports', 'Books'];

export default function ManageProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const openAdd = () => { setEditingProduct(null); setImagePreview(''); setShowModal(true); };
  const openEdit = (row) => { setEditingProduct(row); setImagePreview(row.image || ''); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditingProduct(null); setImagePreview(''); };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productService.deleteProduct(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    data.price = Number(data.price);
    data.stock = Number(data.stock);
    setSaving(true);
    try {
      if (editingProduct) await productService.updateProduct(editingProduct._id, data);
      else await productService.createProduct(data);
      toast.success(editingProduct ? 'Product updated' : 'Product created');
      closeModal();
      fetchProducts();
    } catch (err) {
      toast.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: 'image', label: 'Image',
      render: row => (
        <div className="w-11 h-11 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center">
          {row.image
            ? <img src={row.image} alt={row.name} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
            : <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          }
        </div>
      )
    },
    { key: 'name', label: 'Product', render: row => <div className="font-medium text-slate-900 dark:text-white">{row.name}</div> },
    { key: 'category', label: 'Category', render: row => (
      <span className="px-2 py-0.5 text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full">{row.category}</span>
    )},
    { key: 'price', label: 'Price', render: row => <span className="font-medium">${row.price.toFixed(2)}</span> },
    { key: 'stock', label: 'Stock', render: row => (
      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${row.stock > 10 ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : row.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
        {row.stock} units
      </span>
    )},
    { key: 'actions', label: 'Actions', render: row => (
      <div className="flex gap-2">
        <button onClick={() => openEdit(row)} className="px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">Edit</button>
        <button onClick={() => handleDelete(row._id)} className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">Delete</button>
      </div>
    )}
  ];

  const inputClass = "mt-1 w-full border border-gray-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors";

  return (
    <PageTransition>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Products</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{products.length} products in catalog</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium transition text-sm shadow-md shadow-indigo-500/20">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Add Product
        </button>
      </div>

      {loading ? <SkeletonTable /> : (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <DataTable columns={columns} data={products} exportable exportFilename="products" />
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Name</label>
                <input name="name" defaultValue={editingProduct?.name} required placeholder="e.g. Wireless Headphones" className={inputClass} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                <select name="category" defaultValue={editingProduct?.category || ''} required className={inputClass}>
                  <option value="" disabled>Select a category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price ($)</label>
                  <input name="price" type="number" step="0.01" min="0" defaultValue={editingProduct?.price} required placeholder="0.00" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Stock</label>
                  <input name="stock" type="number" min="0" defaultValue={editingProduct?.stock} required placeholder="0" className={inputClass} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image URL</label>
                <input
                  name="image"
                  defaultValue={editingProduct?.image}
                  placeholder="https://images.unsplash.com/..."
                  onChange={e => setImagePreview(e.target.value)}
                  className={inputClass}
                />
                {imagePreview && (
                  <div className="mt-2 h-32 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" onError={e => { e.target.style.display = 'none'; }} />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea name="description" defaultValue={editingProduct?.description} rows="3" placeholder="Product description..." className={`${inputClass} resize-none`} />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium text-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving ? (
                    <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Saving...</>
                  ) : (editingProduct ? 'Update Product' : 'Create Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
    </PageTransition>
  );
}
