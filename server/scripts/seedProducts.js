const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const connectDB = require('../config/db');
const Product = require('../models/Product');

/**
 * Curated dataset of 55 realistic e-commerce products across all 7 supported categories:
 * - Electronics (8)
 * - Clothing (8)
 * - Shoes (8)
 * - Home & Kitchen (8)
 * - Beauty (8)
 * - Sports (8)
 * - Books (7)
 * Total: 55 products
 */
const SAMPLE_PRODUCTS = [
  // --- ELECTRONICS (8) ---
  {
    sku: 'SKU-ELEC-001',
    name: 'Wireless Noise-Canceling Headphones',
    category: 'Electronics',
    price: 149.99,
    stock: 45,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop'],
    description: 'Over-ear Bluetooth headphones with active noise cancellation, 30-hour battery life, and crystal-clear voice clarity for calls.',
    brand: 'AudioMax',
    discount: 15,
    rating: 4.7,
    numReviews: 128,
    specifications: [
      { key: 'Battery Life', value: '30 hours' },
      { key: 'Connectivity', value: 'Bluetooth 5.2' },
      { key: 'Weight', value: '250g' }
    ],
    tags: ['electronics', 'audio', 'headphones', 'wireless'],
    isActive: true,
    lowStockThreshold: 10
  },
  {
    sku: 'SKU-ELEC-002',
    name: 'Smart Fitness Tracker & Heart Monitor',
    category: 'Electronics',
    price: 89.99,
    stock: 60,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop'],
    description: 'Track daily steps, sleep stages, continuous heart rate, and 20+ workout modes with 50m water resistance.',
    brand: 'FitPulse',
    discount: 10,
    rating: 4.5,
    numReviews: 94,
    specifications: [
      { key: 'Display', value: '1.4-inch AMOLED' },
      { key: 'Water Resistance', value: '5 ATM (50m)' },
      { key: 'Battery', value: '7 days' }
    ],
    tags: ['electronics', 'smartwatch', 'fitness', 'wearable'],
    isActive: true,
    lowStockThreshold: 10
  },
  {
    sku: 'SKU-ELEC-003',
    name: '7-in-1 USB-C Multiport Hub Adapter',
    category: 'Electronics',
    price: 39.99,
    stock: 110,
    image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600&h=600&fit=crop'],
    description: 'Aluminum hub with 4K HDMI, 3 USB 3.0 ports, 100W Power Delivery pass-through, and SD/microSD card readers.',
    brand: 'NexusTech',
    discount: 5,
    rating: 4.6,
    numReviews: 82,
    specifications: [
      { key: 'Output', value: '4K @ 60Hz HDMI' },
      { key: 'Power Delivery', value: 'Up to 100W' },
      { key: 'Material', value: 'Anodized Aluminum' }
    ],
    tags: ['electronics', 'accessories', 'usb-c', 'hub'],
    isActive: true,
    lowStockThreshold: 15
  },
  {
    sku: 'SKU-ELEC-004',
    name: 'Mechanical RGB Gaming Keyboard',
    category: 'Electronics',
    price: 119.99,
    stock: 35,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=600&fit=crop'],
    description: 'Tactile mechanical switches with per-key RGB backlighting, aircraft-grade aluminum frame, and magnetic wrist rest.',
    brand: 'ViperGear',
    discount: 20,
    rating: 4.8,
    numReviews: 215,
    specifications: [
      { key: 'Switch Type', value: 'Tactile Brown' },
      { key: 'Backlighting', value: '16.8M RGB' },
      { key: 'Connection', value: 'Detachable USB-C' }
    ],
    tags: ['electronics', 'gaming', 'keyboard', 'rgb'],
    isActive: true,
    lowStockThreshold: 10
  },
  {
    sku: 'SKU-ELEC-005',
    name: 'Portable Bluetooth Waterproof Speaker',
    category: 'Electronics',
    price: 59.99,
    stock: 75,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop'],
    description: 'Rugged IPX7 waterproof Bluetooth speaker delivering 360-degree sound with deep bass and 16 hours of playtime.',
    brand: 'SoundWave',
    discount: 10,
    rating: 4.4,
    numReviews: 67,
    specifications: [
      { key: 'Waterproof Rating', value: 'IPX7' },
      { key: 'Battery Life', value: '16 hours' },
      { key: 'Range', value: '20 meters' }
    ],
    tags: ['electronics', 'audio', 'speaker', 'portable'],
    isActive: true,
    lowStockThreshold: 10
  },
  {
    sku: 'SKU-ELEC-006',
    name: 'Ergonomic Vertical Wireless Mouse',
    category: 'Electronics',
    price: 34.99,
    stock: 90,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&h=600&fit=crop'],
    description: 'Natural handshake position reduces wrist strain. Dual mode 2.4GHz USB and Bluetooth with silent clicks.',
    brand: 'ErgoLife',
    discount: 0,
    rating: 4.3,
    numReviews: 45,
    specifications: [
      { key: 'DPI Levels', value: '800 / 1200 / 1600 / 2400' },
      { key: 'Connectivity', value: 'Dual 2.4G & BT 5.0' },
      { key: 'Battery', value: 'Rechargeable Li-Ion' }
    ],
    tags: ['electronics', 'mouse', 'ergonomic', 'office'],
    isActive: true,
    lowStockThreshold: 15
  },
  {
    sku: 'SKU-ELEC-007',
    name: 'Fast Wireless Charging Stand 15W',
    category: 'Electronics',
    price: 27.99,
    stock: 85,
    image: 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e5?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1586816879360-004f5b0c51e5?w=600&h=600&fit=crop'],
    description: 'Qi-certified fast wireless charging stand with dual charging coils for portrait or landscape phone placement.',
    brand: 'VoltCharge',
    discount: 15,
    rating: 4.5,
    numReviews: 110,
    specifications: [
      { key: 'Max Output', value: '15W' },
      { key: 'Standard', value: 'Qi 2.0 Certified' },
      { key: 'Safety', value: 'Foreign Object Detection' }
    ],
    tags: ['electronics', 'charger', 'wireless', 'stand'],
    isActive: true,
    lowStockThreshold: 10
  },
  {
    sku: 'SKU-ELEC-008',
    name: 'Ultra-Clear 4K Streaming Webcam',
    category: 'Electronics',
    price: 79.99,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=600&h=600&fit=crop'],
    description: '4K Ultra HD webcam with autoframing AI, dual omnidirectional noise-reducing microphones, and privacy shutter.',
    brand: 'VisionPro',
    discount: 12,
    rating: 4.6,
    numReviews: 53,
    specifications: [
      { key: 'Resolution', value: '4K @ 30fps / 1080p @ 60fps' },
      { key: 'Field of View', value: '90 degrees' },
      { key: 'Microphone', value: 'Dual Stereo Noise Reduction' }
    ],
    tags: ['electronics', 'webcam', 'video', 'streaming'],
    isActive: true,
    lowStockThreshold: 10
  },

  // --- CLOTHING (8) ---
  {
    sku: 'SKU-CLOT-001',
    name: "Men's Classic Cotton Oxford Shirt",
    category: 'Clothing',
    price: 49.99,
    stock: 80,
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=600&fit=crop'],
    description: '100% breathable organic cotton shirt with button-down collar. Perfect for both office meetings and casual dinners.',
    brand: 'UrbanCraft',
    discount: 10,
    rating: 4.6,
    numReviews: 76,
    specifications: [
      { key: 'Material', value: '100% Cotton' },
      { key: 'Fit', value: 'Regular Fit' },
      { key: 'Care', value: 'Machine Wash Cold' }
    ],
    tags: ['clothing', 'men', 'shirt', 'cotton'],
    isActive: true,
    lowStockThreshold: 15
  },
  {
    sku: 'SKU-CLOT-002',
    name: "Women's Floral Tiered Summer Dress",
    category: 'Clothing',
    price: 64.99,
    stock: 55,
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=600&fit=crop'],
    description: 'Lightweight flowy tiered midi dress with subtle floral print, smocked bodice, and adjustable shoulder straps.',
    brand: 'FloraBreeze',
    discount: 15,
    rating: 4.7,
    numReviews: 112,
    specifications: [
      { key: 'Length', value: 'Midi' },
      { key: 'Fabric', value: 'Rayon Chiffon' },
      { key: 'Lining', value: 'Fully Lined' }
    ],
    tags: ['clothing', 'women', 'dress', 'summer'],
    isActive: true,
    lowStockThreshold: 10
  },
  {
    sku: 'SKU-CLOT-003',
    name: 'Cozy Heavyweight Unisex Hoodie',
    category: 'Clothing',
    price: 54.99,
    stock: 95,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&h=600&fit=crop'],
    description: 'Fleece-lined 380gsm cotton-poly blend pullover hoodie with double-layer hood and front pouch pocket.',
    brand: 'ThreadWorks',
    discount: 0,
    rating: 4.8,
    numReviews: 140,
    specifications: [
      { key: 'Fabric Weight', value: '380 GSM' },
      { key: 'Blend', value: '80% Cotton / 20% Polyester' },
      { key: 'Style', value: 'Oversized Kangaroo Pocket' }
    ],
    tags: ['clothing', 'unisex', 'hoodie', 'casual'],
    isActive: true,
    lowStockThreshold: 15
  },
  {
    sku: 'SKU-CLOT-004',
    name: 'Slim-Fit Stretch Denim Jeans',
    category: 'Clothing',
    price: 59.99,
    stock: 70,
    image: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1542272604-780c96856592?w=600&h=600&fit=crop'],
    description: 'Classic five-pocket denim with elastane stretch for all-day comfort. Reinforced stitching and durable metal hardware.',
    brand: 'DenimForge',
    discount: 20,
    rating: 4.5,
    numReviews: 98,
    specifications: [
      { key: 'Cut', value: 'Slim Fit' },
      { key: 'Composition', value: '98% Cotton, 2% Elastane' },
      { key: 'Rise', value: 'Mid Rise' }
    ],
    tags: ['clothing', 'jeans', 'denim', 'pants'],
    isActive: true,
    lowStockThreshold: 10
  },
  {
    sku: 'SKU-CLOT-005',
    name: 'Thermal Waterproof Winter Parka',
    category: 'Clothing',
    price: 189.99,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce667883?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1539533018447-63fcce667883?w=600&h=600&fit=crop'],
    description: 'Cold-weather parka insulated with sustainable recycled down, faux-fur trimmed removable hood, and fleece-lined storm pockets.',
    brand: 'NordicPeak',
    discount: 25,
    rating: 4.9,
    numReviews: 87,
    specifications: [
      { key: 'Temperature Rating', value: '-20°C / -4°F' },
      { key: 'Insulation', value: '650 Fill Power Recycled Down' },
      { key: 'Shell', value: 'Hydrophobic DWR Treated' }
    ],
    tags: ['clothing', 'jacket', 'winter', 'parka'],
    isActive: true,
    lowStockThreshold: 10
  },
  {
    sku: 'SKU-CLOT-006',
    name: 'Breathable Athletic Performance T-Shirt',
    category: 'Clothing',
    price: 24.99,
    stock: 120,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&h=600&fit=crop'],
    description: 'Moisture-wicking, anti-odor performance crewneck tee with four-way stretch fabric for maximum training mobility.',
    brand: 'AeroDry',
    discount: 5,
    rating: 4.4,
    numReviews: 62,
    specifications: [
      { key: 'Material', value: '92% Polyester, 8% Spandex' },
      { key: 'Technology', value: 'Quick-Dry Moisture Wicking' },
      { key: 'Seams', value: 'Flatlock Anti-Chafing' }
    ],
    tags: ['clothing', 'activewear', 'tshirt', 'gym'],
    isActive: true,
    lowStockThreshold: 20
  },
  {
    sku: 'SKU-CLOT-007',
    name: 'Tailored Wool Blend Blazer',
    category: 'Clothing',
    price: 139.99,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=600&fit=crop'],
    description: 'Single-breasted wool-blend blazer with notch lapels, interior welt pockets, and a refined modern silhouette.',
    brand: 'St. Claire',
    discount: 15,
    rating: 4.7,
    numReviews: 41,
    specifications: [
      { key: 'Fabric', value: '60% Wool, 40% Polyester' },
      { key: 'Closure', value: 'Two-Button' },
      { key: 'Lining', value: 'Silky Bemberg Lining' }
    ],
    tags: ['clothing', 'blazer', 'formal', 'suits'],
    isActive: true,
    lowStockThreshold: 8
  },
  {
    sku: 'SKU-CLOT-008',
    name: 'High-Waisted Yoga Leggings with Pockets',
    category: 'Clothing',
    price: 38.99,
    stock: 85,
    image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&h=600&fit=crop'],
    description: 'Buttery-soft, squat-proof workout leggings featuring a wide tummy-control waistband and deep dual side pockets.',
    brand: 'FlexForm',
    discount: 10,
    rating: 4.8,
    numReviews: 184,
    specifications: [
      { key: 'Inseam', value: '28 inches' },
      { key: 'Waistband', value: 'High Rise 4.5 inch' },
      { key: 'Pockets', value: 'Dual Phone Side Pockets' }
    ],
    tags: ['clothing', 'activewear', 'leggings', 'yoga'],
    isActive: true,
    lowStockThreshold: 15
  },

  // --- SHOES (8) ---
  {
    sku: 'SKU-SHOE-001',
    name: 'Pro Cushion Carbon Running Shoes',
    category: 'Shoes',
    price: 129.99,
    stock: 45,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop'],
    description: 'Engineered mesh upper with responsive carbon-infused foam midsole providing exceptional energy return on every stride.',
    brand: 'Velocity',
    discount: 15,
    rating: 4.8,
    numReviews: 145,
    specifications: [
      { key: 'Arch Support', value: 'Neutral' },
      { key: 'Heel-to-Toe Drop', value: '8mm' },
      { key: 'Weight', value: '215g (Size 9)' }
    ],
    tags: ['shoes', 'running', 'sneakers', 'sports'],
    isActive: true,
    lowStockThreshold: 10
  },
  {
    sku: 'SKU-SHOE-002',
    name: 'Classic White Leather Minimalist Sneakers',
    category: 'Shoes',
    price: 89.99,
    stock: 65,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop'],
    description: 'Handcrafted full-grain leather upper with memory foam cushioned insole and vulcanized natural rubber sole.',
    brand: 'CommonCraft',
    discount: 10,
    rating: 4.6,
    numReviews: 92,
    specifications: [
      { key: 'Upper Material', value: 'Full Grain Leather' },
      { key: 'Sole', value: 'Natural Rubber Cupsole' },
      { key: 'Insole', value: 'Removable Memory Foam' }
    ],
    tags: ['shoes', 'casual', 'sneakers', 'leather'],
    isActive: true,
    lowStockThreshold: 12
  },
  {
    sku: 'SKU-SHOE-003',
    name: 'Waterproof Full-Grain Leather Chelsea Boots',
    category: 'Shoes',
    price: 159.99,
    stock: 35,
    image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&h=600&fit=crop'],
    description: 'Weatherproof oiled leather Chelsea boots with elastic side gussets, pull tabs, and non-slip Goodyear welted commando sole.',
    brand: 'IronTrail',
    discount: 20,
    rating: 4.7,
    numReviews: 68,
    specifications: [
      { key: 'Construction', value: 'Goodyear Welted' },
      { key: 'Sole', value: 'Lugged Vibram Outsole' },
      { key: 'Weatherproofing', value: 'Seam-Sealed Waterproof' }
    ],
    tags: ['shoes', 'boots', 'leather', 'chelsea'],
    isActive: true,
    lowStockThreshold: 10
  },
  {
    sku: 'SKU-SHOE-004',
    name: 'Trail Hiking Boots with Ankle Support',
    category: 'Shoes',
    price: 144.99,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600&h=600&fit=crop'],
    description: 'Breathable waterproof membrane keeps feet dry on technical mountain trails. Reinforced rubber toe cap protects against rocks.',
    brand: 'AlpineShield',
    discount: 10,
    rating: 4.8,
    numReviews: 83,
    specifications: [
      { key: 'Membrane', value: 'AquaShield Waterproof' },
      { key: 'Outsole', value: 'Deep 5mm Traction Lugs' },
      { key: 'Shank', value: 'Molded TPU Stability' }
    ],
    tags: ['shoes', 'hiking', 'outdoor', 'boots'],
    isActive: true,
    lowStockThreshold: 10
  },
  {
    sku: 'SKU-SHOE-005',
    name: 'Casual Suede Slip-On Loafers',
    category: 'Shoes',
    price: 74.99,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&h=600&fit=crop'],
    description: 'Soft brushed calfskin suede driving loafers with hand-stitched detailing and flexible pebble rubber traction sole.',
    brand: 'Bellucci',
    discount: 5,
    rating: 4.4,
    numReviews: 39,
    specifications: [
      { key: 'Upper', value: 'Genuine Suede' },
      { key: 'Lining', value: 'Breathable Leather' },
      { key: 'Sole Type', value: 'Split Driver Studded Sole' }
    ],
    tags: ['shoes', 'loafers', 'suede', 'slipon'],
    isActive: true,
    lowStockThreshold: 10
  },
  {
    sku: 'SKU-SHOE-006',
    name: 'High-Top Canvas Street Skate Shoes',
    category: 'Shoes',
    price: 49.99,
    stock: 80,
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&h=600&fit=crop'],
    description: 'Durable 14oz canvas upper skate sneakers with reinforced ollie zone padding and grippy herringbone rubber tread.',
    brand: 'StreetLab',
    discount: 10,
    rating: 4.5,
    numReviews: 104,
    specifications: [
      { key: 'Material', value: '14oz Cotton Canvas' },
      { key: 'Tread', value: 'Herringbone Grip' },
      { key: 'Closure', value: 'Lace-Up with Metal Eyelets' }
    ],
    tags: ['shoes', 'skate', 'canvas', 'hightop'],
    isActive: true,
    lowStockThreshold: 15
  },
  {
    sku: 'SKU-SHOE-007',
    name: 'Comfort Memory Foam Slides Sandal',
    category: 'Shoes',
    price: 29.99,
    stock: 120,
    image: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=600&h=600&fit=crop'],
    description: 'Ultra-plush dual-layer EVA foam slide sandals with arch support, contoured footbed, and water-friendly quick-dry build.',
    brand: 'CloudStride',
    discount: 0,
    rating: 4.6,
    numReviews: 78,
    specifications: [
      { key: 'Material', value: 'High-Density Injection Molded EVA' },
      { key: 'Features', value: 'Waterproof & Machine Washable' },
      { key: 'Heel Height', value: '1.2 inches' }
    ],
    tags: ['shoes', 'sandals', 'slides', 'summer'],
    isActive: true,
    lowStockThreshold: 20
  },
  {
    sku: 'SKU-SHOE-008',
    name: 'Formal Leather Oxford Dress Shoes',
    category: 'Shoes',
    price: 119.99,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&h=600&fit=crop'],
    description: 'Polished cap-toe Oxford dress shoes crafted from premium cowhide leather with leather lining and stacked wooden heel.',
    brand: 'Kingsman',
    discount: 15,
    rating: 4.7,
    numReviews: 57,
    specifications: [
      { key: 'Style', value: 'Closed-Lacing Cap Toe' },
      { key: 'Leather', value: 'Polished Full-Grain Calfskin' },
      { key: 'Heel', value: 'Stacked Leather & Rubber Inset' }
    ],
    tags: ['shoes', 'formal', 'dress', 'oxford'],
    isActive: true,
    lowStockThreshold: 8
  },

  // --- HOME & KITCHEN (8) ---
  {
    sku: 'SKU-HOME-001',
    name: 'Smart Robot Vacuum Cleaner & Mop',
    category: 'Home & Kitchen',
    price: 279.99,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop'],
    description: 'Precision LiDAR navigation robot vacuum with 3000Pa suction power, multi-floor mapping, and smartphone voice control.',
    brand: 'RoboClean',
    discount: 20,
    rating: 4.6,
    numReviews: 135,
    specifications: [
      { key: 'Suction Power', value: '3000 Pa' },
      { key: 'Runtime', value: '150 minutes' },
      { key: 'Dustbin Capacity', value: '450 ml' }
    ],
    tags: ['home', 'appliance', 'vacuum', 'smart'],
    isActive: true,
    lowStockThreshold: 10
  },
  {
    sku: 'SKU-HOME-002',
    name: '10-Piece Ceramic Non-Stick Cookware Set',
    category: 'Home & Kitchen',
    price: 119.99,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=600&h=600&fit=crop'],
    description: 'Toxic-free mineral ceramic coated pots and pans with induction-compatible stainless steel base and stay-cool handles.',
    brand: 'ChefHaven',
    discount: 15,
    rating: 4.7,
    numReviews: 89,
    specifications: [
      { key: 'Coating', value: 'PTFE/PFOA Free Ceramic' },
      { key: 'Oven Safe', value: 'Up to 450°F' },
      { key: 'Pieces', value: '10 Pieces with Glass Lids' }
    ],
    tags: ['home', 'kitchen', 'cookware', 'pots'],
    isActive: true,
    lowStockThreshold: 10
  },
  {
    sku: 'SKU-HOME-003',
    name: 'Vacuum Insulated Stainless Steel Water Bottle',
    category: 'Home & Kitchen',
    price: 24.99,
    stock: 150,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop'],
    description: 'Double-wall 18/8 food-grade stainless steel bottle. Keeps liquids ice cold for 24 hours or piping hot for 12 hours.',
    brand: 'HydroTherm',
    discount: 0,
    rating: 4.8,
    numReviews: 240,
    specifications: [
      { key: 'Capacity', value: '32 oz (950ml)' },
      { key: 'Material', value: '18/8 Pro Grade Steel' },
      { key: 'Lid Type', value: 'Leak-Proof Chug Cap' }
    ],
    tags: ['home', 'bottle', 'drinkware', 'insulated'],
    isActive: true,
    lowStockThreshold: 25
  },
  {
    sku: 'SKU-HOME-004',
    name: '15-Bar Espresso & Cappuccino Machine',
    category: 'Home & Kitchen',
    price: 169.99,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&h=600&fit=crop'],
    description: 'Compact Italian pump espresso maker with manual milk frothing wand for rich microfoam lattes and cappuccinos at home.',
    brand: 'BaristaCraft',
    discount: 10,
    rating: 4.5,
    numReviews: 74,
    specifications: [
      { key: 'Pump Pressure', value: '15 Bar Italian Pump' },
      { key: 'Water Tank', value: '1.2 Liter Removable' },
      { key: 'Heating', value: 'ThermoBlock Rapid Heat' }
    ],
    tags: ['home', 'coffee', 'espresso', 'kitchen'],
    isActive: true,
    lowStockThreshold: 8
  },
  {
    sku: 'SKU-HOME-005',
    name: 'Digital Air Fryer with Touchscreen Preset',
    category: 'Home & Kitchen',
    price: 89.99,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&h=600&fit=crop'],
    description: 'Cook crispy, healthy meals with 85% less oil using rapid 360-degree air convection. Features 8 one-touch cooking presets.',
    brand: 'CrispAir',
    discount: 15,
    rating: 4.7,
    numReviews: 160,
    specifications: [
      { key: 'Capacity', value: '5.8 Quart' },
      { key: 'Presets', value: '8 One-Touch Programs' },
      { key: 'Basket', value: 'Dishwasher Safe Non-Stick' }
    ],
    tags: ['home', 'kitchen', 'airfryer', 'cooking'],
    isActive: true,
    lowStockThreshold: 10
  },
  {
    sku: 'SKU-HOME-006',
    name: 'Ultra-Quiet Ultrasonic Cool Mist Humidifier',
    category: 'Home & Kitchen',
    price: 44.99,
    stock: 70,
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=600&fit=crop'],
    description: 'Top-fill 4-liter cool mist humidifier with essential oil tray, auto shut-off, and whisper-quiet 24dB operation for bedrooms.',
    brand: 'PureBreeze',
    discount: 5,
    rating: 4.4,
    numReviews: 65,
    specifications: [
      { key: 'Capacity', value: '4 Liters' },
      { key: 'Noise Level', value: '< 24 dB' },
      { key: 'Coverage', value: 'Up to 350 sq ft' }
    ],
    tags: ['home', 'wellness', 'humidifier', 'bedroom'],
    isActive: true,
    lowStockThreshold: 15
  },
  {
    sku: 'SKU-HOME-007',
    name: 'Professional Japanese Damascus Chef Knife',
    category: 'Home & Kitchen',
    price: 69.99,
    stock: 55,
    image: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1593618998160-e34014e67546?w=600&h=600&fit=crop'],
    description: 'Razor-sharp 8-inch VG-10 core chef knife wrapped in 67 layers of Damascus stainless steel with ergonomic pakkawood handle.',
    brand: 'Shinzo',
    discount: 10,
    rating: 4.9,
    numReviews: 95,
    specifications: [
      { key: 'Blade Length', value: '8 Inches' },
      { key: 'Steel Core', value: 'Japanese VG-10 High Carbon' },
      { key: 'Hardness', value: '60+ HRC' }
    ],
    tags: ['home', 'kitchen', 'knife', 'chef'],
    isActive: true,
    lowStockThreshold: 10
  },
  {
    sku: 'SKU-HOME-008',
    name: 'Bamboo Bath Mat & Spa Step',
    category: 'Home & Kitchen',
    price: 29.99,
    stock: 90,
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&h=600&fit=crop'],
    description: 'Natural eco-friendly water-resistant bamboo floor mat with vented slats for fast drying and non-slip rubber floor pads.',
    brand: 'ZenHome',
    discount: 0,
    rating: 4.5,
    numReviews: 52,
    specifications: [
      { key: 'Dimensions', value: '24 x 16 inches' },
      { key: 'Material', value: '100% Moso Bamboo' },
      { key: 'Finish', value: 'Water-Repellent Gloss' }
    ],
    tags: ['home', 'bathroom', 'bamboo', 'eco'],
    isActive: true,
    lowStockThreshold: 15
  },

  // --- BEAUTY (8) ---
  {
    sku: 'SKU-BEAU-001',
    name: 'Hydrating Botanical Face Moisturizer',
    category: 'Beauty',
    price: 36.99,
    stock: 95,
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop'],
    description: 'Lightweight, non-greasy facial lotion infused with hyaluronic acid, jojoba oil, and soothing green tea extract.',
    brand: 'PureGlow',
    discount: 10,
    rating: 4.7,
    numReviews: 122,
    specifications: [
      { key: 'Volume', value: '50 ml / 1.7 oz' },
      { key: 'Skin Type', value: 'All Skin Types' },
      { key: 'Formulation', value: 'Paraben-Free & Vegan' }
    ],
    tags: ['beauty', 'skincare', 'face', 'moisturizer'],
    isActive: true,
    lowStockThreshold: 20
  },
  {
    sku: 'SKU-BEAU-002',
    name: 'Salon Ionic Hair Dryer & Styling Kit',
    category: 'Beauty',
    price: 69.99,
    stock: 45,
    image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&h=600&fit=crop'],
    description: '1875W professional tourmaline ceramic blow dryer with negative ion technology to seal moisture and eliminate frizz.',
    brand: 'VelvetStyle',
    discount: 15,
    rating: 4.6,
    numReviews: 88,
    specifications: [
      { key: 'Power', value: '1875 Watts' },
      { key: 'Attachments', value: 'Diffuser & Concentrator Nozzle' },
      { key: 'Settings', value: '3 Heat / 2 Speed / Cool Shot' }
    ],
    tags: ['beauty', 'haircare', 'styling', 'dryer'],
    isActive: true,
    lowStockThreshold: 10
  },
  {
    sku: 'SKU-BEAU-003',
    name: 'Luxury Artisan Eau de Parfum Trio Gift Set',
    category: 'Beauty',
    price: 89.99,
    stock: 35,
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&h=600&fit=crop'],
    description: 'Collection of three signature artisan scents: Bergamot Amber, Velvet Rose, and Santal Noir in travel spray bottles.',
    brand: 'Maison Royale',
    discount: 10,
    rating: 4.8,
    numReviews: 64,
    specifications: [
      { key: 'Concentration', value: 'Eau de Parfum (20% Oil)' },
      { key: 'Volume', value: '3 x 30 ml Sprays' },
      { key: 'Packaging', value: 'Velvet Presentation Box' }
    ],
    tags: ['beauty', 'fragrance', 'perfume', 'luxury'],
    isActive: true,
    lowStockThreshold: 10
  },
  {
    sku: 'SKU-BEAU-004',
    name: 'Anti-Aging Vitamin C + E Facial Serum',
    category: 'Beauty',
    price: 42.99,
    stock: 80,
    image: 'https://images.unsplash.com/photo-1608248597359-5324083a2139?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1608248597359-5324083a2139?w=600&h=600&fit=crop'],
    description: '20% active L-ascorbic acid serum with ferulic acid. Brightens dark spots, firms skin, and fights environmental damage.',
    brand: 'DermaLuxe',
    discount: 15,
    rating: 4.7,
    numReviews: 153,
    specifications: [
      { key: 'Active Ingredients', value: '20% Vitamin C, 1% Vitamin E, 0.5% Ferulic' },
      { key: 'Volume', value: '30 ml Glass Dropper' },
      { key: 'Cruelty-Free', value: 'Leaping Bunny Certified' }
    ],
    tags: ['beauty', 'skincare', 'serum', 'antiaging'],
    isActive: true,
    lowStockThreshold: 15
  },
  {
    sku: 'SKU-BEAU-005',
    name: '12-Piece Premium Vegan Makeup Brush Set',
    category: 'Beauty',
    price: 34.99,
    stock: 70,
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=600&h=600&fit=crop'],
    description: 'Densely packed ultra-soft synthetic bristles that pick up powder, cream, and liquid products seamlessly. Includes roll pouch.',
    brand: 'ArtisanFace',
    discount: 0,
    rating: 4.6,
    numReviews: 87,
    specifications: [
      { key: 'Bristles', value: '100% Cruelty-Free Taklon' },
      { key: 'Handle', value: 'Natural Birch Wood' },
      { key: 'Pieces', value: '12 Brushes + Faux Leather Case' }
    ],
    tags: ['beauty', 'makeup', 'brushes', 'cosmetics'],
    isActive: true,
    lowStockThreshold: 15
  },
  {
    sku: 'SKU-BEAU-006',
    name: 'Mineral Sunscreen Broad Spectrum SPF 50',
    category: 'Beauty',
    price: 28.99,
    stock: 110,
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&h=600&fit=crop'],
    description: 'Reef-safe 100% non-nano zinc oxide sunscreen. Sheer, non-greasy matte finish with zero white cast.',
    brand: 'SolGuard',
    discount: 5,
    rating: 4.5,
    numReviews: 109,
    specifications: [
      { key: 'SPF', value: 'Broad Spectrum SPF 50' },
      { key: 'Active Ingredient', value: 'Non-Nano Zinc Oxide 18%' },
      { key: 'Water Resistance', value: '80 Minutes' }
    ],
    tags: ['beauty', 'skincare', 'sunscreen', 'spf'],
    isActive: true,
    lowStockThreshold: 20
  },
  {
    sku: 'SKU-BEAU-007',
    name: 'Nourishing Moroccan Argan Hair Oil',
    category: 'Beauty',
    price: 26.99,
    stock: 90,
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop'],
    description: 'Cold-pressed 100% organic argan oil repairs split ends, restores shine, and shields hair from thermal heat styling up to 450°F.',
    brand: 'AtlasGold',
    discount: 0,
    rating: 4.8,
    numReviews: 142,
    specifications: [
      { key: 'Volume', value: '100 ml / 3.4 oz' },
      { key: 'Extraction', value: 'Cold-Pressed Virgin Oil' },
      { key: 'Origin', value: 'Morocco' }
    ],
    tags: ['beauty', 'haircare', 'oil', 'argan'],
    isActive: true,
    lowStockThreshold: 15
  },
  {
    sku: 'SKU-BEAU-008',
    name: 'Rose Quartz Facial Roller & Gua Sha Set',
    category: 'Beauty',
    price: 22.99,
    stock: 85,
    image: 'https://images.unsplash.com/photo-1590156546946-ce55a12a6a5d?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1590156546946-ce55a12a6a5d?w=600&h=600&fit=crop'],
    description: 'Authentic Brazilian rose quartz stones designed for lymphatic drainage facial massage, reducing puffiness and tension.',
    brand: 'GlowRitual',
    discount: 10,
    rating: 4.6,
    numReviews: 73,
    specifications: [
      { key: 'Material', value: '100% Genuine Rose Quartz' },
      { key: 'Frame', value: 'Reinforced Zinc Alloy' },
      { key: 'Includes', value: 'Dual-End Roller & Heart Gua Sha' }
    ],
    tags: ['beauty', 'skincare', 'guasha', 'roller'],
    isActive: true,
    lowStockThreshold: 15
  },

  // --- SPORTS (8) ---
  {
    sku: 'SKU-SPOR-001',
    name: 'Extra Thick Eco-Friendly Yoga Mat with Strap',
    category: 'Sports',
    price: 39.99,
    stock: 75,
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop'],
    description: '6mm high-density non-slip TPE yoga mat with alignment guide lines and moisture-resistant surface for yoga and pilates.',
    brand: 'ZenAthletics',
    discount: 10,
    rating: 4.7,
    numReviews: 118,
    specifications: [
      { key: 'Thickness', value: '6 mm' },
      { key: 'Material', value: 'Biodegradable TPE' },
      { key: 'Dimensions', value: '72 x 24 inches' }
    ],
    tags: ['sports', 'fitness', 'yoga', 'pilates'],
    isActive: true,
    lowStockThreshold: 15
  },
  {
    sku: 'SKU-SPOR-002',
    name: 'Adjustable Cast Iron Dumbbell Set (20kg)',
    category: 'Sports',
    price: 79.99,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&h=600&fit=crop'],
    description: 'Solid cast iron weight plates with textured chrome handles and threaded spinlock collars for safe, fast home workouts.',
    brand: 'IronForge',
    discount: 15,
    rating: 4.8,
    numReviews: 89,
    specifications: [
      { key: 'Total Weight', value: '20 kg / 44 lbs' },
      { key: 'Plates Included', value: '4x 2.5kg, 4x 1.25kg, 4x 0.5kg' },
      { key: 'Barbell Connector', value: 'Included (Converts to Barbell)' }
    ],
    tags: ['sports', 'fitness', 'weights', 'gym'],
    isActive: true,
    lowStockThreshold: 8
  },
  {
    sku: 'SKU-SPOR-003',
    name: 'Carbon Fiber Pro Tennis Racket',
    category: 'Sports',
    price: 119.99,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600&h=600&fit=crop'],
    description: '100 sq in headsize graphite racket offering superior torsional stability, crisp feedback, and high spin potential.',
    brand: 'AeroStrike',
    discount: 10,
    rating: 4.6,
    numReviews: 48,
    specifications: [
      { key: 'Head Size', value: '100 sq. in.' },
      { key: 'Unstrung Weight', value: '300 g / 10.6 oz' },
      { key: 'String Pattern', value: '16x19' }
    ],
    tags: ['sports', 'tennis', 'racket', 'outdoor'],
    isActive: true,
    lowStockThreshold: 8
  },
  {
    sku: 'SKU-SPOR-004',
    name: '5-Level Resistance Exercise Bands Set',
    category: 'Sports',
    price: 19.99,
    stock: 140,
    image: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600&h=600&fit=crop'],
    description: 'Set of 5 natural latex loop bands ranging from 5 lbs to 40 lbs of resistance. Includes carry bag and workout poster.',
    brand: 'BandFit',
    discount: 0,
    rating: 4.7,
    numReviews: 165,
    specifications: [
      { key: 'Resistance Levels', value: 'X-Light, Light, Medium, Heavy, X-Heavy' },
      { key: 'Material', value: '100% Natural Malaysian Latex' },
      { key: 'Circumference', value: '12 inches' }
    ],
    tags: ['sports', 'resistance', 'workout', 'mobility'],
    isActive: true,
    lowStockThreshold: 20
  },
  {
    sku: 'SKU-SPOR-005',
    name: 'Anti-Burst Exercise & Balance Gym Ball',
    category: 'Sports',
    price: 24.99,
    stock: 65,
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=600&fit=crop'],
    description: 'Professional grade anti-burst PVC balance ball tested up to 2000 lbs. Includes quick-inflation foot pump.',
    brand: 'CoreStability',
    discount: 0,
    rating: 4.5,
    numReviews: 76,
    specifications: [
      { key: 'Diameter', value: '65 cm (for heights 5\'4" to 5\'11")' },
      { key: 'Max Weight', value: '2,000 lbs Static' },
      { key: 'Material', value: 'Non-Toxic PVC Free of Phthalates' }
    ],
    tags: ['sports', 'fitness', 'stability', 'core'],
    isActive: true,
    lowStockThreshold: 10
  },
  {
    sku: 'SKU-SPOR-006',
    name: 'High-Velocity Speed Jump Rope with Steel Cable',
    category: 'Sports',
    price: 16.99,
    stock: 120,
    image: 'https://images.unsplash.com/photo-1544033527-b192daee1f5b?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1544033527-b192daee1f5b?w=600&h=600&fit=crop'],
    description: '360-degree dual ball bearing jump rope with kink-resistant vinyl coated steel wire and non-slip aluminum alloy handles.',
    brand: 'RopeX',
    discount: 0,
    rating: 4.8,
    numReviews: 132,
    specifications: [
      { key: 'Bearings', value: '360° Ball Bearing Mechanism' },
      { key: 'Cable', value: '10ft Adjustable Braided Steel' },
      { key: 'Handles', value: '6-inch Knurled Aluminum' }
    ],
    tags: ['sports', 'cardio', 'jumprope', 'boxing'],
    isActive: true,
    lowStockThreshold: 20
  },
  {
    sku: 'SKU-SPOR-007',
    name: 'Deep Tissue High-Frequency Massage Gun',
    category: 'Sports',
    price: 89.99,
    stock: 35,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop'],
    description: 'Brushless quiet motor percussive therapy device with 30 adjustable speed levels and 6 targeted massage heads for muscle recovery.',
    brand: 'RecoverPro',
    discount: 20,
    rating: 4.7,
    numReviews: 110,
    specifications: [
      { key: 'Stroke Amplitude', value: '12 mm' },
      { key: 'Speed Range', value: '1200 - 3200 RPM' },
      { key: 'Battery', value: '2500mAh (6 hours runtime)' }
    ],
    tags: ['sports', 'recovery', 'massage', 'therapy'],
    isActive: true,
    lowStockThreshold: 8
  },
  {
    sku: 'SKU-SPOR-008',
    name: 'Insulated Trail Running Hydration Vest',
    category: 'Sports',
    price: 54.99,
    stock: 45,
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=600&fit=crop'],
    description: 'Ergonomic bounce-free running vest with dual 500ml front soft flasks, emergency whistle, and breathable 3D air mesh back.',
    brand: 'TrailRunner',
    discount: 10,
    rating: 4.6,
    numReviews: 54,
    specifications: [
      { key: 'Capacity', value: '5 Liters Cargo + 1L Hydration' },
      { key: 'Flasks Included', value: '2x 500ml BPA-Free Soft Flasks' },
      { key: 'Fit', value: 'Adjustable Dual Sternum Straps' }
    ],
    tags: ['sports', 'running', 'hydration', 'trail'],
    isActive: true,
    lowStockThreshold: 10
  },

  // --- BOOKS (7) ---
  {
    sku: 'SKU-BOOK-001',
    name: 'JavaScript: The Definitive Guide (7th Edition)',
    category: 'Books',
    price: 39.99,
    stock: 95,
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&h=600&fit=crop'],
    description: 'The master reference for JavaScript programmers covering ES2020+, Node.js, Web APIs, and functional programming patterns.',
    brand: "O'Reilly Media",
    discount: 10,
    rating: 4.9,
    numReviews: 210,
    specifications: [
      { key: 'Pages', value: '706 pages' },
      { key: 'Format', value: 'Paperback' },
      { key: 'Language', value: 'English' }
    ],
    tags: ['books', 'programming', 'javascript', 'tech'],
    isActive: true,
    lowStockThreshold: 15
  },
  {
    sku: 'SKU-BOOK-002',
    name: 'Hands-On Machine Learning with Scikit-Learn & TensorFlow',
    category: 'Books',
    price: 49.99,
    stock: 60,
    image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&h=600&fit=crop'],
    description: 'Practical guide to building intelligent systems using Python, Scikit-Learn, Keras, and TensorFlow 2 with real-world examples.',
    brand: "O'Reilly Media",
    discount: 15,
    rating: 4.9,
    numReviews: 185,
    specifications: [
      { key: 'Pages', value: '850 pages' },
      { key: 'Edition', value: '3rd Edition' },
      { key: 'Topic', value: 'Deep Learning & ML Pipelines' }
    ],
    tags: ['books', 'machine-learning', 'python', 'ai'],
    isActive: true,
    lowStockThreshold: 10
  },
  {
    sku: 'SKU-BOOK-003',
    name: 'Designing Data-Intensive Applications',
    category: 'Books',
    price: 45.99,
    stock: 75,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=600&fit=crop'],
    description: 'The big ideas behind reliable, scalable, and maintainable systems. Essential reading for backend and distributed systems engineers.',
    brand: "O'Reilly Media",
    discount: 5,
    rating: 4.9,
    numReviews: 310,
    specifications: [
      { key: 'Author', value: 'Martin Kleppmann' },
      { key: 'Pages', value: '616 pages' },
      { key: 'Focus', value: 'Distributed Architecture & Data Systems' }
    ],
    tags: ['books', 'architecture', 'database', 'system-design'],
    isActive: true,
    lowStockThreshold: 15
  },
  {
    sku: 'SKU-BOOK-004',
    name: 'Atomic Habits: Tiny Changes, Remarkable Results',
    category: 'Books',
    price: 18.99,
    stock: 140,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=600&fit=crop'],
    description: 'An easy and proven way to build good habits and break bad ones using behavioral psychology and practical compound progress.',
    brand: 'Avery Publishing',
    discount: 10,
    rating: 4.8,
    numReviews: 450,
    specifications: [
      { key: 'Author', value: 'James Clear' },
      { key: 'Format', value: 'Hardcover' },
      { key: 'Pages', value: '320 pages' }
    ],
    tags: ['books', 'self-help', 'productivity', 'habits'],
    isActive: true,
    lowStockThreshold: 20
  },
  {
    sku: 'SKU-BOOK-005',
    name: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    category: 'Books',
    price: 42.99,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&h=600&fit=crop'],
    description: 'Learn to write clean, refactored, test-driven code that is easy to read, test, and maintain throughout project lifecycles.',
    brand: 'Prentice Hall',
    discount: 10,
    rating: 4.7,
    numReviews: 240,
    specifications: [
      { key: 'Author', value: 'Robert C. Martin' },
      { key: 'Pages', value: '464 pages' },
      { key: 'Topic', value: 'Code Quality & Refactoring' }
    ],
    tags: ['books', 'programming', 'software-engineering', 'clean-code'],
    isActive: true,
    lowStockThreshold: 10
  },
  {
    sku: 'SKU-BOOK-006',
    name: 'The Psychology of Money',
    category: 'Books',
    price: 19.99,
    stock: 120,
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&h=600&fit=crop'],
    description: 'Timeless lessons on wealth, greed, and happiness exploring how emotions, ego, and luck shape our financial decisions.',
    brand: 'Harriman House',
    discount: 5,
    rating: 4.8,
    numReviews: 320,
    specifications: [
      { key: 'Author', value: 'Morgan Housel' },
      { key: 'Pages', value: '256 pages' },
      { key: 'Format', value: 'Paperback' }
    ],
    tags: ['books', 'finance', 'psychology', 'investing'],
    isActive: true,
    lowStockThreshold: 15
  },
  {
    sku: 'SKU-BOOK-007',
    name: 'Deep Work: Rules for Focused Success in a Distracted World',
    category: 'Books',
    price: 21.99,
    stock: 80,
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=600&fit=crop'],
    description: 'The ability to focus without distraction on a cognitively demanding task is the superpower of the modern knowledge economy.',
    brand: 'Grand Central Publishing',
    discount: 0,
    rating: 4.7,
    numReviews: 190,
    specifications: [
      { key: 'Author', value: 'Cal Newport' },
      { key: 'Pages', value: '304 pages' },
      { key: 'Format', value: 'Hardcover' }
    ],
    tags: ['books', 'productivity', 'career', 'focus'],
    isActive: true,
    lowStockThreshold: 15
  }
];

// Helper to escape regex special characters
const readline = require('readline');

const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Interactive URI prompt helper (avoids storing secrets in history or .env)
const promptUriIfRequested = async () => {
  const args = process.argv.slice(2);
  if (args.includes('--prompt-uri') || args.includes('--interactive')) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    return new Promise((resolve) => {
      rl.question('Enter MongoDB Atlas URI (input will not be logged): ', (answer) => {
        rl.close();
        if (answer && answer.trim()) {
          process.env.MONGO_URI = answer.trim();
        }
        resolve();
      });
    });
  }
};

const runSeeder = async () => {
  await promptUriIfRequested();

  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run') || !args.includes('--confirm-write');
  const isWriteConfirmed = args.includes('--confirm-write');
  const isProductionConfirmed = args.includes('--confirm-production') || process.env.ALLOW_PRODUCTION_SEED === 'true';
  const isLocalWriteAllowed = args.includes('--allow-local-write');

  console.log('\n======================================================');
  console.log('       ReturnSense Safe Product Seeder & Sync         ');
  console.log('======================================================');

  try {
    console.log('Connecting to database...');
    await connectDB();

    if (mongoose.connection.readyState !== 1) {
      console.error('[Fatal Error] Unable to connect to MongoDB.');
      process.exit(1);
    }

    const dbName = mongoose.connection.name || 'unknown';
    const host = mongoose.connection.host || 'unknown';
    const isRemote = host.includes('.mongodb.net') || process.env.NODE_ENV === 'production';

    console.log(`Target Database: ${dbName}`);
    console.log(`Database Host:   ${host} (${isRemote ? 'Remote / Cloud Atlas' : 'Local'})`);
    console.log(`Operation Mode:  ${isDryRun ? 'DRY RUN (Read-Only)' : 'WRITE (Inserting missing products)'}`);
    console.log('------------------------------------------------------');

    // Safety guard against unverified database name
    if (!dbName || dbName === 'unknown') {
      console.error('[Safety Halt] Database name cannot be determined. Operation cancelled.');
      await mongoose.connection.close();
      process.exit(1);
    }

    // Strict Production & Write Safety Guards
    if (isWriteConfirmed) {
      if (isRemote || isProductionConfirmed) {
        // 1. Both confirmation flags are mandatory for production
        if (!isProductionConfirmed) {
          console.error('\n[PRODUCTION SAFETY GUARD ACTIVE]');
          console.error('The target database appears to be a remote / production MongoDB Atlas instance.');
          console.error(`Connected host: ${host}`);
          console.error(`Database name:  ${dbName}`);
          console.error('\nTo prevent unintended writes, you must provide BOTH:');
          console.error('  --confirm-write AND --confirm-production');
          console.error('Or set environment variable: ALLOW_PRODUCTION_SEED=true');
          console.error('\nNo data was modified. Exiting safely.');
          console.log('======================================================\n');
          await mongoose.connection.close();
          process.exit(1);
        }

        // 2. Strict Host Verification: Must be MongoDB Atlas
        if (!host.includes('.mongodb.net')) {
          console.error('\n[HOST VERIFICATION FAILED]');
          console.error(`Expected MongoDB Atlas host (*.mongodb.net), but connected to: ${host}`);
          console.error('Production writes are restricted exclusively to MongoDB Atlas.');
          console.error('Aborting before writing any records. No data was modified.\n');
          console.log('======================================================\n');
          await mongoose.connection.close();
          process.exit(1);
        }

        // 3. Strict Database Name Verification: Must be exactly 'returnprediction'
        if (dbName !== 'returnprediction') {
          console.error('\n[DATABASE NAME MISMATCH]');
          console.error(`Expected target database 'returnprediction', but connected to: '${dbName}'`);
          console.error('Production writes are only permitted against the designated database: returnprediction');
          console.error('Aborting before writing any records. No data was modified.\n');
          console.log('======================================================\n');
          await mongoose.connection.close();
          process.exit(1);
        }
      } else {
        // Local write guard: requires explicit --allow-local-write
        if (!isLocalWriteAllowed) {
          console.error('\n[LOCAL WRITE GUARD ACTIVE]');
          console.error('Target database is local. To authorize a local write, pass --allow-local-write.');
          console.error('No data was modified. Exiting safely.\n');
          await mongoose.connection.close();
          process.exit(1);
        }
      }
    }

    // Step 1: Inspect existing products
    const initialProductCount = await Product.countDocuments();
    console.log(`Existing products currently in collection: ${initialProductCount}`);

    // Step 2: Compare sample dataset with existing database records
    const toInsert = [];
    const skipped = [];

    for (const item of SAMPLE_PRODUCTS) {
      const matchCriteria = [];
      if (item.sku) {
        matchCriteria.push({ sku: item.sku });
      }
      matchCriteria.push({ name: { $regex: new RegExp(`^${escapeRegex(item.name)}$`, 'i') } });

      const existing = await Product.findOne({ $or: matchCriteria }).select('_id name sku category price');

      if (existing) {
        skipped.push({
          candidate: item.name,
          existingId: existing._id,
          matchedOn: existing.sku === item.sku ? 'sku' : 'name'
        });
      } else {
        toInsert.push(item);
      }
    }

    console.log(`Total sample items evaluated:           ${SAMPLE_PRODUCTS.length}`);
    console.log(`Existing items matched (will skip):     ${skipped.length}`);
    console.log(`New items to insert (missing):          ${toInsert.length}`);

    // Dry Run Summary
    if (isDryRun) {
      console.log('\n[DRY RUN SUMMARY]');
      console.log(`  * Existing products in DB: ${initialProductCount}`);
      console.log(`  * Proposed new inserts:    ${toInsert.length}`);
      console.log(`  * Skipped duplicates:      ${skipped.length}`);
      console.log(`  * Projected final count:   ${initialProductCount + toInsert.length}`);

      if (toInsert.length > 0) {
        console.log('\nSample items that WOULD be inserted:');
        toInsert.slice(0, 5).forEach((p, idx) => {
          console.log(`    ${idx + 1}. [${p.category}] ${p.name} ($${p.price}) - SKU: ${p.sku}`);
        });
        if (toInsert.length > 5) {
          console.log(`    ... and ${toInsert.length - 5} more items.`);
        }
      } else {
        console.log('\nAll sample products already exist in the database! No additions needed.');
      }

      console.log('\n[NOTICE] This was a DRY RUN. Zero changes were written to the database.');
      console.log('To execute this write, run with explicit confirmation:');
      if (isRemote) {
        console.log('  node scripts/seedProducts.js --confirm-write --confirm-production');
      } else {
        console.log('  node scripts/seedProducts.js --confirm-write');
      }
      console.log('======================================================\n');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Step 3: Write Execution (Only when --confirm-write is present)
    if (toInsert.length === 0) {
      console.log('\n[Result] All 55 sample products are already present in the database.');
      console.log('No new products needed to be inserted. Collection remains unchanged.');
      console.log('======================================================\n');
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log(`\nInserting ${toInsert.length} missing products...`);
    const insertResult = await Product.insertMany(toInsert, { ordered: false });
    const insertedCount = insertResult.length;

    const finalProductCount = await Product.countDocuments();

    console.log('\n[WRITE COMPLETE - SUMMARY]');
    console.log(`  * Initial products in DB:  ${initialProductCount}`);
    console.log(`  * Successfully inserted:   ${insertedCount}`);
    console.log(`  * Skipped duplicates:      ${skipped.length}`);
    console.log(`  * Final total in database: ${finalProductCount}`);
    console.log('\n[Verification Passed] All inserted products conform to schema and categories.');
    console.log('Users, Orders, Predictions, and other collections were untouched.');
    console.log('======================================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('\n[Seeder Execution Error]:', err.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

runSeeder();
