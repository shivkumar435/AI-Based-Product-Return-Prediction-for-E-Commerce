const Product = require('../models/Product');

const getProducts = async (req, res) => {
  try {
    const { search, category, sort, minPrice, maxPrice, brand, rating } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 12));
    let query = {};
    let sortQuery = { createdAt: -1 };
    
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.name = { $regex: escapedSearch, $options: 'i' };
    }
    
    if (category) {
      const categories = String(category).split(',').map(s => s.trim()).filter(Boolean);
      if (categories.length === 1) query.category = categories[0];
      if (categories.length > 1) query.category = { $in: categories };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (brand) {
      const brands = String(brand).split(',').map(s => s.trim()).filter(Boolean);
      if (brands.length === 1) query.brand = brands[0];
      if (brands.length > 1) query.brand = { $in: brands };
    }

    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    if (sort === 'name-asc') sortQuery = { name: 1 };
    if (sort === 'name-desc') sortQuery = { name: -1 };
    if (sort === 'price-asc') sortQuery = { price: 1 };
    if (sort === 'price-desc') sortQuery = { price: -1 };
    if (sort === 'rating-desc') sortQuery = { rating: -1, numReviews: -1 };
    if (sort === 'popularity-desc') sortQuery = { numReviews: -1, rating: -1 };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortQuery)
      .skip((page - 1) * limit)
      .limit(limit);
      
    res.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalProducts: total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json({ success: true, product });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const { 
      name, category, price, stock, image, description, brand, discount,
      rating, images, specifications, tags, isActive, lowStockThreshold, sku 
    } = req.body;
    if (!name || !price) {
      return res.status(400).json({ success: false, message: 'Name and price are required' });
    }
    
    const product = new Product({
      name,
      category: category || 'Electronics',
      price: Number(price),
      stock: stock !== undefined ? Number(stock) : 0,
      image: image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
      description,
      brand: brand || 'Generic',
      discount: discount !== undefined ? Number(discount) : 0,
      rating: rating !== undefined ? Number(rating) : 0,
      images: Array.isArray(images) ? images : [],
      specifications: Array.isArray(specifications) ? specifications : [],
      tags: Array.isArray(tags) ? tags : [],
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      lowStockThreshold: lowStockThreshold !== undefined ? Number(lowStockThreshold) : 10,
      sku: sku || undefined
    });

    const createdProduct = await product.save();
    res.status(201).json({ success: true, product: createdProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { 
      name, category, price, stock, image, description, brand, discount,
      rating, images, specifications, tags, isActive, lowStockThreshold, sku 
    } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (product) {
      if (name !== undefined) product.name = name;
      if (category !== undefined) product.category = category;
      if (price !== undefined) product.price = Number(price);
      if (stock !== undefined) product.stock = Number(stock);
      if (image !== undefined) product.image = image;
      if (description !== undefined) product.description = description;
      if (brand !== undefined) product.brand = brand;
      if (discount !== undefined) product.discount = Number(discount);
      if (rating !== undefined) product.rating = Number(rating);
      if (images !== undefined) product.images = Array.isArray(images) ? images : [];
      if (specifications !== undefined) product.specifications = Array.isArray(specifications) ? specifications : [];
      if (tags !== undefined) product.tags = Array.isArray(tags) ? tags : [];
      if (isActive !== undefined) product.isActive = Boolean(isActive);
      if (lowStockThreshold !== undefined) product.lowStockThreshold = Number(lowStockThreshold);
      if (sku !== undefined) product.sku = sku;

      const updatedProduct = await product.save();
      res.json({ success: true, product: updatedProduct });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await Product.deleteOne({ _id: product._id });
      res.json({ success: true, message: 'Product removed' });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
