import api from './api';

const normalizeProductList = (payload) => {
  const rawProducts = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.products)
      ? payload.products
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.items)
          ? payload.items
          : [];

  const products = rawProducts.filter(Boolean);
  const pagination = payload?.pagination || {
    page: payload?.page ?? 1,
    limit: payload?.limit ?? (products.length || 12),
    totalPages: payload?.pagination?.totalPages ?? payload?.pages ?? 1,
    totalProducts: payload?.pagination?.totalProducts ?? payload?.total ?? products.length
  };

  products.pagination = pagination;
  return products;
};

const normalizeProduct = (payload) => payload?.product ?? payload?.data ?? payload ?? null;

const productService = {
  getProducts: async (params) => {
    const res = await api.get('/products', { params });
    const data = res.data;

    if (data?.success === false) {
      throw new Error(data?.message || 'Failed to fetch products');
    }

    return normalizeProductList(data);
  },
  getProduct: async (id) => {
    const res = await api.get(`/products/${id}`);
    const data = res.data;

    if (data?.success === false) {
      throw new Error(data?.message || 'Failed to fetch product');
    }

    return normalizeProduct(data);
  },
  createProduct: async (data) => {
    const res = await api.post('/products', data);
    return normalizeProduct(res.data);
  },
  updateProduct: async (id, data) => {
    const res = await api.put(`/products/${id}`, data);
    return normalizeProduct(res.data);
  },
  deleteProduct: async (id) => {
    const res = await api.delete(`/products/${id}`);
    return res.data?.message ?? 'Product removed';
  }
};

export default productService;