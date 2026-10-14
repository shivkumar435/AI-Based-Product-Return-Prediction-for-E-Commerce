const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Prediction = require('./models/Prediction');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/return_sense');
    console.log('MongoDB Connected for Seeding');
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  await connectDB();

  try {
    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    await Prediction.deleteMany();
    console.log('Collections cleared');

    // Users
    const admin = await User.create({ name: 'Admin', email: 'admin@returnsense.com', password: 'admin123', role: 'admin' });
    const user1 = await User.create({ name: 'Alice Customer', email: 'alice@example.com', password: 'password123', role: 'user', phone: '1234567890', address: '123 Alice St' });
    const user2 = await User.create({ name: 'Bob Buyer', email: 'bob@example.com', password: 'password123', role: 'user', phone: '2345678901', address: '456 Bob Ave' });
    const user3 = await User.create({ name: 'Charlie Shopper', email: 'charlie@example.com', password: 'password123', role: 'user', phone: '3456789012', address: '789 Charlie Blvd' });
    const user4 = await User.create({ name: 'Diana Consumer', email: 'diana@example.com', password: 'password123', role: 'user', phone: '4567890123', address: '101 Diana Ln' });
    const users = [user1, user2, user3, user4];
    console.log('Users created');

    // Products
    const categories = ['Electronics', 'Clothing', 'Shoes', 'Home & Kitchen', 'Beauty', 'Sports', 'Books'];
    const productsData = [];
    for (let i = 1; i <= 55; i++) {
      const cat = categories[i % categories.length];
      productsData.push({
        name: `Sample Product ${i} - ${cat}`,
        category: cat,
        price: +(Math.random() * 200 + 10).toFixed(2),
        stock: Math.floor(Math.random() * 100),
        image: `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop`,
        description: `This is a comprehensive description for Sample Product ${i} in the ${cat} category. It has many features and benefits.`,
        brand: `Brand ${Math.floor(i / 10) + 1}`,
        specifications: { weight: '1kg', dimensions: '10x10x10' },
        rating: +(Math.random() * 2 + 3).toFixed(1),
        tags: [cat.toLowerCase(), 'sample', 'demo']
      });
    }
    const products = await Product.insertMany(productsData);
    console.log('Products created');

    // Orders
    const statuses = ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Return Requested', 'Return Approved', 'Return Rejected', 'Returned', 'Refunded'];
    const paymentMethods = ['Credit Card', 'Debit Card', 'UPI', 'Cash on Delivery', 'Net Banking'];
    const ordersData = [];
    const predictionRecords = [];
    
    for (let i = 0; i < 220; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const product = products[Math.floor(Math.random() * products.length)];
      const qty = Math.floor(Math.random() * 3) + 1;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      let isReturn = ['Return Requested', 'Return Approved', 'Returned', 'Refunded'].includes(status);
      const prob = isReturn ? (50 + Math.random() * 45) : (5 + Math.random() * 40);
      const predictionStr = prob > 50 ? 'Likely to Return' : 'Not Likely to Return';
      
      const order = {
        user: user._id,
        product: product._id,
        quantity: qty,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        totalPrice: +(product.price * qty).toFixed(2),
        prediction: predictionStr,
        probability: +prob.toFixed(2),
        status: status,
      };
      
      ordersData.push(order);
      
      if (Math.random() > 0.5) {
        predictionRecords.push({
          user: user._id,
          inputFeatures: {
            Customer_Age: Math.floor(Math.random() * 50) + 18,
            Product_Price: product.price,
            Quantity: qty,
            Product_Category: product.category,
            Payment_Method: order.paymentMethod,
          },
          prediction: predictionStr,
          confidence: +prob.toFixed(2),
        });
      }
    }
    await Order.insertMany(ordersData);
    await Prediction.insertMany(predictionRecords);
    console.log('Orders & Predictions created');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Seeding Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
