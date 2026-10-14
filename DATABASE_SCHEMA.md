# 🗄️ Database Schema Documentation

## ReturnSense - MongoDB Database Schema

**Database Name**: `returnsense`

**Platform**: MongoDB Atlas

---

## 📋 Collections Overview

| Collection | Documents | Purpose |
|------------|-----------|---------|
| `users` | User accounts | Customer and admin profiles |
| `products` | Product catalog | E-commerce products |
| `orders` | Customer orders | Order history and management |
| `carts` | Shopping carts | User shopping sessions |
| `wishlist` | Saved items | User favorites |
| `reviews` | Product reviews | Customer feedback |
| `predictions` | ML predictions | Return risk assessments |

---

## 👤 Users Collection

Stores user account information.

```javascript
{
  _id: ObjectId,
  
  // Basic Info
  name: String,                    // Full name
  email: String,                   // Unique email
  password: String,                // Hashed password
  role: String,                    // "user", "admin"
  
  // Profile
  avatar: String,                  // Profile picture URL
  phone: String,                   // Contact number
  dateOfBirth: Date,              // User age calculation
  gender: String,                  // "Male", "Female", "Other"
  
  // Address
  defaultShippingAddress: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    phone: String
  },
  
  // Account
  isVerified: Boolean,              // Email verification status
  status: String,                   // "active", "suspended", "deleted"
  
  // Password Reset
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  // Statistics
  totalOrders: Number,              // Count of orders
  totalSpent: Number,               // Total money spent
  totalReturns: Number,             // Count of returns
  returnRate: Number,               // Return percentage
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes
```javascript
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ createdAt: -1 })
db.users.createIndex({ role: 1 })
```

---

## 🛍️ Products Collection

Stores e-commerce product information.

```javascript
{
  _id: ObjectId,
  
  // Basic Info
  sku: String,                      // Stock Keeping Unit
  name: String,                     // Product name
  description: String,              // Detailed description
  
  // Category & Classification
  category: String,                 // "Electronics", "Clothing", etc
  brand: String,                    // Manufacturer/brand
  tags: [String],                   // Search tags
  
  // Pricing
  price: Number,                    // Current price (₹)
  discount: Number,                 // Discount percentage (0-100)
  costPrice: Number,                // Cost to business
  
  // Stock Management
  stock: Number,                    // Current quantity
  lowStockThreshold: Number,        // Alert threshold
  
  // Images & Media
  image: String,                    // Main image URL
  images: [String],                 // Gallery images
  
  // Specifications
  specifications: [
    {
      key: String,                  // e.g., "Storage"
      value: String                 // e.g., "256GB"
    }
  ],
  
  // Ratings & Reviews
  rating: Number,                   // Average rating (0-5)
  numReviews: Number,               // Count of reviews
  totalRating: Number,              // Sum of all ratings
  
  // Status
  isActive: Boolean,                // Listing status
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes
```javascript
db.products.createIndex({ name: "text", description: "text" })
db.products.createIndex({ category: 1 })
db.products.createIndex({ price: 1 })
db.products.createIndex({ brand: 1 })
db.products.createIndex({ rating: -1 })
db.products.createIndex({ isActive: 1 })
```

---

## 📦 Orders Collection

Stores customer orders and order tracking.

```javascript
{
  _id: ObjectId,
  
  // Order Details
  orderNumber: String,              // Unique order ID (e.g., "ORD-001001")
  invoiceNumber: String,            // Invoice reference
  
  // User Reference
  user: ObjectId,                   // Reference to User
  
  // Product Details (Backward Compatibility)
  product: ObjectId,                // Reference to Product (single item)
  items: [                          // Multiple items support
    {
      product: ObjectId,
      name: String,
      price: Number,
      quantity: Number,
      image: String,
      prediction: String,           // Return prediction for this item
      probability: Number,
      riskLevel: String
    }
  ],
  quantity: Number,                 // Quantity ordered
  
  // Pricing
  subtotal: Number,                 // Before tax & shipping
  discount: Number,                 // Discount amount
  tax: Number,                      // Tax (typically 18% in India)
  shippingFee: Number,              // Shipping cost
  totalPrice: Number,               // Final amount
  
  // Payment
  paymentMethod: String,            // "Credit Card", "UPI", "Cash on Delivery"
  paymentStatus: String,            // "Pending", "Paid", "Failed", "Refunded"
  transactionId: String,            // Payment gateway reference
  
  // Shipping
  shippingAddress: {
    name: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
  },
  
  // Tracking
  trackingNumber: String,           // Carrier tracking ID
  carrier: String,                  // "Fedex", "UPS", etc
  estimatedDelivery: Date,
  
  // ML Prediction
  prediction: String,               // "Return", "No Return", "Unknown"
  probability: Number,              // Return probability (0-100)
  riskLevel: String,                // "Low", "Medium", "High", "Unknown"
  riskFactors: [
    {
      feature: String,              // Feature name
      reason: String,               // Why this contributes
      impact: String,               // "Increases", "Decreases"
      contribution: Number          // % contribution
    }
  ],
  
  // Order Status
  status: String,                   // Current status
  statusHistory: [
    {
      status: String,
      timestamp: Date,
      note: String
    }
  ],
  
  // Cancellation & Returns
  cancelReason: String,
  returnReason: String,
  returnImages: [String],           // Photos for return claim
  
  // Admin Notes
  notes: String,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### Order Statuses
```
"Pending"           -> Order placed, awaiting confirmation
"Confirmed"         -> Payment received
"Processing"        -> Being prepared
"Packed"            -> Ready to ship
"Shipped"           -> In transit
"Out for Delivery"  -> Local delivery stage
"Delivered"         -> Successfully delivered
"Cancelled"         -> Order cancelled
"Return Requested"  -> Customer requested return
"Return Approved"   -> Return accepted
"Return Rejected"   -> Return denied
"Returned"          -> Item returned
"Refunded"          -> Money refunded
```

### Indexes
```javascript
db.orders.createIndex({ user: 1 })
db.orders.createIndex({ status: 1 })
db.orders.createIndex({ createdAt: -1 })
db.orders.createIndex({ orderNumber: 1 }, { unique: true })
db.orders.createIndex({ paymentStatus: 1 })
```

---

## 🛒 Cart Collection

User shopping carts and saved items.

```javascript
{
  _id: ObjectId,
  
  // User Reference
  user: ObjectId,                   // Reference to User
  
  // Cart Items
  items: [
    {
      _id: ObjectId,
      product: ObjectId,            // Reference to Product
      quantity: Number,
      savedForLater: Boolean,       // Save for later vs active
      addedAt: Date
    }
  ],
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes
```javascript
db.carts.createIndex({ user: 1 }, { unique: true })
```

---

## ❤️ Wishlist Collection

User's saved favorites and wishlist items.

```javascript
{
  _id: ObjectId,
  
  // User Reference
  user: ObjectId,                   // Reference to User
  
  // Wishlist Items
  products: [ObjectId],             // Array of product references
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes
```javascript
db.wishlist.createIndex({ user: 1 }, { unique: true })
```

---

## ⭐ Reviews Collection

Product reviews and ratings from customers.

```javascript
{
  _id: ObjectId,
  
  // References
  product: ObjectId,                // Reference to Product
  user: ObjectId,                   // Reference to User
  order: ObjectId,                  // Reference to Order (optional)
  
  // Review Content
  rating: Number,                   // 1-5 stars
  title: String,                    // Review title
  description: String,              // Detailed review
  
  // Review Media
  images: [String],                 // Photos
  videos: [String],                 // Video links
  
  // Verification
  isVerified: Boolean,              // Verified purchase
  
  // Engagement
  helpful: Number,                  // Helpful votes
  unhelpful: Number,                // Unhelpful votes
  
  // Status
  status: String,                   // "pending", "approved", "rejected"
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes
```javascript
db.reviews.createIndex({ product: 1 })
db.reviews.createIndex({ user: 1 })
db.reviews.createIndex({ createdAt: -1 })
db.reviews.createIndex({ rating: -1 })
```

---

## 🤖 Predictions Collection

ML model predictions for return probability.

```javascript
{
  _id: ObjectId,
  
  // User & Order Reference
  user: ObjectId,                   // Reference to User
  order: ObjectId,                  // Reference to Order (optional)
  
  // Input Features
  inputFeatures: {
    Product_Price: Number,
    Product_Category: String,
    Discount: Number,
    Delivery_Time: Number,
    Customer_Rating: Number,
    Previous_Returns: Number,
    Payment_Method: String,
    Quantity: Number,
    Customer_Age: Number,
    Gender: String,
    Shipping_Distance: Number,
    Order_Frequency: Number
  },
  
  // Prediction Results
  prediction: String,               // "Return", "No Return", "Unknown"
  probability: Number,              // 0-100 (% return likelihood)
  confidence: Number,               // 0-100 (model confidence)
  riskLevel: String,                // "Low", "Medium", "High"
  
  // Explainability
  riskFactors: [
    {
      feature: String,              // Feature name
      reason: String,               // Interpretation
      impact: String,               // "Increases" or "Decreases"
      contribution: Number
    }
  ],
  
  // Model Info
  modelVersion: String,             // Model version used
  algorithm: String,                // "RandomForest"
  
  // Timestamps
  createdAt: Date
}
```

### Indexes
```javascript
db.predictions.createIndex({ user: 1 })
db.predictions.createIndex({ createdAt: -1 })
db.predictions.createIndex({ probability: -1 })
```

---

## 📊 Aggregate Queries

### Total Revenue
```javascript
db.orders.aggregate([
  { $match: { status: { $ne: "Returned" } } },
  { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } }
])
```

### Monthly Revenue
```javascript
db.orders.aggregate([
  { $match: { status: { $ne: "Returned" } } },
  {
    $group: {
      _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
      revenue: { $sum: "$totalPrice" },
      orders: { $sum: 1 }
    }
  },
  { $sort: { _id: -1 } }
])
```

### Return Rate by Category
```javascript
db.orders.aggregate([
  { $lookup: { from: "products", localField: "product", foreignField: "_id", as: "productInfo" } },
  { $unwind: "$productInfo" },
  {
    $group: {
      _id: "$productInfo.category",
      total: { $sum: 1 },
      returns: { $sum: { $cond: [{ $eq: ["$status", "Returned"] }, 1, 0] } }
    }
  },
  {
    $project: {
      category: "$_id",
      returnRate: { $multiply: [{ $divide: ["$returns", "$total"] }, 100] },
      total: 1,
      returns: 1,
      _id: 0
    }
  }
])
```

### High-Value Customers
```javascript
db.orders.aggregate([
  { $match: { paymentStatus: "Paid" } },
  {
    $group: {
      _id: "$user",
      totalSpent: { $sum: "$totalPrice" },
      orderCount: { $sum: 1 }
    }
  },
  { $sort: { totalSpent: -1 } },
  { $limit: 20 },
  { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "userInfo" } }
])
```

---

## 🔍 Data Modeling Relationships

### Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐
│    Users    │◄────────┤   Orders     │
│  (users)    │1   *    │  (orders)    │
└─────────────┘         └──────────────┘
       │                      │
       │1             ●       ├─────────────────┐
       │              │       │                 │
       │              ▼       ▼                 ▼
       │         ┌────────┐  ┌────────────┐   ┌──────────────┐
       │         │Product │  │ Prediction │   │ Shipping Addr│
       │         │        │  │            │   │              │
       │         └────────┘  └────────────┘   └──────────────┘
       │
       ├──●──────────┐
       │             │
       ▼             ▼
  ┌────────┐   ┌──────────┐
  │ Cart   │   │ Wishlist │
  │ (carts)│   │ (wishlist)
  └────────┘   └──────────┘
       │             │
       └──────●──────┤
              │      │
              ▼      ▼
          ┌──────────────┐
          │  Products    │
          │  (products)  │
          └──────────────┘
              ▲  │
              │  │●────────┐
              │  │         ▼
              │  │    ┌──────────┐
              │  │    │ Reviews  │
              │  │    │(reviews) │
              │  │    └──────────┘
              │  │
          ┌───┴──┴──────┐
          │Users         │
          └──────────────┘
```

---

## 🔐 Security Considerations

1. **Password**: Hashed with bcrypt (never stored plain)
2. **Sensitive Data**: Avoid storing in predictable fields
3. **PII**: Encrypted in transit (HTTPS only)
4. **Backup**: Daily automatic backups via MongoDB Atlas
5. **Access Control**: RBAC implemented at API level

---

## 📈 Performance Notes

1. **Indexing**: All frequently queried fields are indexed
2. **Pagination**: Used for all list endpoints (default limit: 10-20)
3. **Denormalization**: Some data denormalized for query performance
4. **Sharding**: Ready for horizontal scaling (MongoDB Atlas)
5. **Connection Pooling**: Automatic via MongoDB driver

---

## 🔄 Data Integrity

- **Referential**: Uses ObjectId references (no foreign keys)
- **Validation**: Schema validation at application level
- **Timestamps**: All documents have createdAt/updatedAt
- **Status Tracking**: statusHistory maintains audit trail

---

**Database Script**: [db-setup.js](./server/seed.js)
**Last Updated**: September 2026
