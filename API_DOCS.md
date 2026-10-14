# 📡 API Documentation

## ReturnSense - API Reference Guide

**Base URL**: `http://localhost:5000/api`

**Version**: 1.0.0

**Last Updated**: September 2026

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Products](#products)
4. [Cart](#cart)
5. [Orders](#orders)
6. [Wishlist](#wishlist)
7. [Reviews](#reviews)
8. [Predictions](#predictions)
9. [Admin](#admin)

---

## 🔐 Authentication

All protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

### Register

**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "User already exists"
}
```

### Login

**POST** `/auth/login`

Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Get Current User

**GET** `/auth/me`

Get authenticated user profile.

**Headers**: Authorization (JWT required)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Forgot Password

**POST** `/auth/forgot-password`

Request password reset.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset link sent to email",
  "token": "reset_token_here"
}
```

### Reset Password

**POST** `/auth/reset-password/:token`

Reset password with token.

**Request Body:**
```json
{
  "password": "newpassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful",
  "token": "new_jwt_token"
}
```

---

## 👤 Users

### Get User Profile

**GET** `/users/profile`

Get current user's profile.

**Headers**: Authorization (JWT required)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Update Profile

**PUT** `/users/profile`

Update user profile information.

**Headers**: Authorization (JWT required)

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

### Change Password

**PUT** `/users/change-password`

Change user password.

**Headers**: Authorization (JWT required)

**Request Body:**
```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## 🛍️ Products

### Get All Products

**GET** `/products`

Get list of products with filtering, sorting, and pagination.

**Query Parameters:**
```
page=1                      # Page number (default: 1)
limit=12                    # Items per page (default: 12)
search=electronics          # Search by name
category=Electronics        # Filter by category
sort=price-asc              # Sort: name-asc, name-desc, price-asc, price-desc
minPrice=100                # Minimum price
maxPrice=1000               # Maximum price
brand=Apple                 # Filter by brand
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "product_id",
      "name": "iPhone 14",
      "category": "Electronics",
      "price": 999,
      "stock": 50,
      "rating": 4.5,
      "numReviews": 250,
      "image": "url",
      "images": ["url1", "url2"],
      "description": "...",
      "brand": "Apple",
      "discount": 10,
      "specifications": [{"key": "Storage", "value": "256GB"}]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "totalPages": 5,
    "totalProducts": 50
  }
}
```

### Get Product Details

**GET** `/products/:id`

Get detailed information about a specific product.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "product_id",
    "name": "iPhone 14",
    "category": "Electronics",
    "price": 999,
    "stock": 50,
    "rating": 4.5,
    "numReviews": 250,
    "image": "url",
    "images": ["url1", "url2"],
    "description": "Latest iPhone with advanced features",
    "brand": "Apple",
    "discount": 10,
    "specifications": [
      {"key": "Storage", "value": "256GB"},
      {"key": "RAM", "value": "6GB"},
      {"key": "Color", "value": "Space Black"}
    ],
    "tags": ["flagship", "premium"]
  }
}
```

### Create Product (Admin)

**POST** `/products`

Create a new product (admin only).

**Headers**: Authorization (JWT required, Admin)

**Request Body:**
```json
{
  "name": "iPhone 14 Pro",
  "category": "Electronics",
  "price": 1099,
  "stock": 30,
  "brand": "Apple",
  "image": "url",
  "description": "Pro model",
  "discount": 5,
  "specifications": [{"key": "Material", "value": "Stainless Steel"}]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "new_product_id",
    "name": "iPhone 14 Pro",
    ...
  }
}
```

### Update Product (Admin)

**PUT** `/products/:id`

Update product information.

**Headers**: Authorization (JWT required, Admin)

**Request Body:**
```json
{
  "name": "iPhone 14 Pro Max",
  "price": 1199,
  "stock": 25
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... }
}
```

### Delete Product (Admin)

**DELETE** `/products/:id`

Delete a product.

**Headers**: Authorization (JWT required, Admin)

**Response (200):**
```json
{
  "success": true,
  "message": "Product deleted"
}
```

---

## 🛒 Cart

### Get Cart

**GET** `/cart`

Get user's shopping cart.

**Headers**: Authorization (JWT required)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "cart": {
      "_id": "cart_id",
      "user": "user_id",
      "items": [
        {
          "_id": "item_id",
          "product": {
            "_id": "product_id",
            "name": "iPhone 14",
            "price": 999,
            "image": "url"
          },
          "quantity": 1,
          "savedForLater": false
        }
      ]
    },
    "totalPrice": 999,
    "totalItems": 1
  }
}
```

### Add to Cart

**POST** `/cart`

Add item to cart.

**Headers**: Authorization (JWT required)

**Request Body:**
```json
{
  "productId": "product_id",
  "quantity": 1
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Item added to cart",
  "data": { ... }
}
```

### Update Cart Item

**PUT** `/cart/:itemId`

Update quantity of cart item.

**Headers**: Authorization (JWT required)

**Request Body:**
```json
{
  "quantity": 2
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Cart updated",
  "data": { ... }
}
```

### Remove from Cart

**DELETE** `/cart/:itemId`

Remove item from cart.

**Headers**: Authorization (JWT required)

**Response (200):**
```json
{
  "success": true,
  "message": "Item removed",
  "data": { ... }
}
```

### Clear Cart

**DELETE** `/cart`

Clear all items from cart.

**Headers**: Authorization (JWT required)

**Response (200):**
```json
{
  "success": true,
  "message": "Cart cleared",
  "data": { ... }
}
```

---

## 📦 Orders

### Create Order

**POST** `/orders`

Create a new order.

**Headers**: Authorization (JWT required)

**Request Body:**
```json
{
  "product": "product_id",
  "quantity": 1,
  "paymentMethod": "Credit Card",
  "discount": 0,
  "deliveryTime": 3,
  "customerRating": 4,
  "previousReturns": 0,
  "customerAge": 30,
  "gender": "Male",
  "shippingDistance": 50,
  "orderFrequency": 5
}
```

**Response (201):**
```json
{
  "success": true,
  "order": {
    "_id": "order_id",
    "orderNumber": "ORD-001001",
    "user": "user_id",
    "product": "product_id",
    "quantity": 1,
    "totalPrice": 999,
    "status": "Pending",
    "prediction": "Return",
    "probability": 45.5,
    "riskLevel": "Medium",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Get User Orders

**GET** `/orders`

Get orders for current user.

**Headers**: Authorization (JWT required)

**Query Parameters:**
```
page=1          # Page number
limit=10        # Items per page
```

**Response (200):**
```json
{
  "success": true,
  "orders": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "totalOrders": 3
  }
}
```

### Get Order Details

**GET** `/orders/:id`

Get detailed information about an order.

**Headers**: Authorization (JWT required)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "order_id",
    "orderNumber": "ORD-001001",
    "user": { "name": "John Doe", "email": "john@example.com" },
    "product": { "name": "iPhone 14", "price": 999 },
    "quantity": 1,
    "totalPrice": 999,
    "paymentMethod": "Credit Card",
    "status": "Confirmed",
    "statusHistory": [
      {
        "status": "Pending",
        "timestamp": "2024-01-15T10:30:00Z",
        "note": "Order received"
      }
    ],
    "shippingAddress": {
      "name": "John Doe",
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zip": "10001",
      "phone": "+1-234-567-8900"
    },
    "prediction": "No Return",
    "probability": 25.3,
    "riskLevel": "Low"
  }
}
```

### Cancel Order

**POST** `/orders/:id/cancel`

Cancel an order (must be Pending or Confirmed).

**Headers**: Authorization (JWT required)

**Request Body:**
```json
{
  "cancelReason": "Changed my mind"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Order cancelled",
  "order": { ... }
}
```

### Request Return

**POST** `/orders/:id/return`

Request return for a delivered order.

**Headers**: Authorization (JWT required)

**Request Body:**
```json
{
  "returnReason": "Product defective"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Return requested",
  "order": { ... }
}
```

### Get Invoice

**GET** `/orders/:id/invoice`

Get invoice for an order.

**Headers**: Authorization (JWT required)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "orderId": "order_id",
    "date": "2024-01-15T10:30:00Z",
    "invoiceNumber": "INV-001001",
    "customer": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "items": [
      {
        "productName": "iPhone 14",
        "quantity": 1,
        "price": 999,
        "total": 999
      }
    ],
    "subtotal": 999,
    "tax": 179.82,
    "total": 1178.82
  }
}
```

---

## ❤️ Wishlist

### Get Wishlist

**GET** `/wishlist`

Get user's wishlist.

**Headers**: Authorization (JWT required)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "product_id",
      "name": "iPhone 14",
      "price": 999,
      "image": "url"
    }
  ]
}
```

### Add to Wishlist

**POST** `/wishlist`

Add product to wishlist.

**Headers**: Authorization (JWT required)

**Request Body:**
```json
{
  "productId": "product_id"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Added to wishlist"
}
```

### Remove from Wishlist

**DELETE** `/wishlist/:productId`

Remove product from wishlist.

**Headers**: Authorization (JWT required)

**Response (200):**
```json
{
  "success": true,
  "message": "Removed from wishlist"
}
```

---

## 🤖 Predictions

### Make Prediction

**POST** `/predict`

Get return prediction for a product/order.

**Headers**: Authorization (JWT required)

**Request Body:**
```json
{
  "Product_Price": 999,
  "Product_Category": "Electronics",
  "Discount": 10,
  "Delivery_Time": 3,
  "Customer_Rating": 4,
  "Previous_Returns": 0,
  "Payment_Method": "Credit Card",
  "Quantity": 1,
  "Customer_Age": 30,
  "Gender": "Male",
  "Shipping_Distance": 50,
  "Order_Frequency": 5
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "prediction": "No Return",
    "probability": 25.3,
    "confidence": 85.5,
    "risk_level": "Low",
    "risk_factors": [
      {
        "feature": "Low_Price",
        "reason": "Price is below average",
        "impact": "Decreases return risk",
        "contribution": -15.2
      }
    ],
    "explanation": "Based on the input features..."
  }
}
```

### Get All Predictions

**GET** `/predict/history`

Get user's prediction history.

**Headers**: Authorization (JWT required)

**Query Parameters:**
```
page=1      # Page number
limit=10    # Items per page
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "prediction_id",
      "prediction": "No Return",
      "probability": 25.3,
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

## 👨‍💼 Admin

### Get Dashboard

**GET** `/admin/dashboard`

Get admin dashboard data.

**Headers**: Authorization (JWT required, Admin)

**Response (200):**
```json
{
  "success": true,
  "stats": {
    "users": 150,
    "products": 500,
    "orders": 1020,
    "predictions": 1020,
    "returnRate": 15.3,
    "totalRevenue": 500000
  },
  "charts": {
    "categoryReturns": [...],
    "paymentMethods": [...]
  },
  "recentOrders": [...]
}
```

### Get Reports

**GET** `/admin/reports`

Get comprehensive reports.

**Headers**: Authorization (JWT required, Admin)

**Query Parameters:**
```
reportType=sales       # sales, returns, customers, products
startDate=2024-01-01
endDate=2024-01-31
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "categoryStats": [...],
    "monthlyStats": [...],
    "timeSeriesData": [...]
  }
}
```

### Get High-Risk Customers

**GET** `/admin/high-risk-customers`

Get customers with high return rates.

**Headers**: Authorization (JWT required, Admin)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "customer": { "name": "John Doe", "email": "john@example.com" },
      "returnRate": 45.5,
      "totalOrders": 20,
      "totalReturns": 9
    }
  ]
}
```

### Update Order Status (Admin)

**PUT** `/orders/:id/status`

Update order status (admin only).

**Headers**: Authorization (JWT required, Admin)

**Request Body:**
```json
{
  "status": "Shipped"
}
```

**Response (200):**
```json
{
  "success": true,
  "order": { ... }
}
```

---

## ❌ Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized (Invalid/Missing token)
- **403**: Forbidden (Insufficient permissions)
- **404**: Not Found
- **500**: Server Error

### Auth Errors

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### Validation Errors

```json
{
  "success": false,
  "message": "Validation failed",
  "validationErrors": {
    "email": "Invalid email format"
  }
}
```

---

## 🔄 Pagination

All list endpoints support pagination:

```
GET /products?page=2&limit=20
```

Response format:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "totalPages": 5,
    "totalItems": 100
  }
}
```

---

## 📊 Rate Limiting

API enforces rate limiting:

- **Auth endpoints**: 20 requests per 15 minutes per IP
- **General endpoints**: 200 requests per 15 minutes per IP

Rate limit headers:

```
X-RateLimit-Limit: 200
X-RateLimit-Remaining: 195
X-RateLimit-Reset: 1705310400
```

---

## 🧪 Testing Examples

### Using Curl

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'

# Get Products
curl http://localhost:5000/api/products?page=1&limit=12

# Create Order (with token)
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product": "product_id",
    "quantity": 1,
    "paymentMethod": "Credit Card"
  }'
```

### Using Postman

1. Import the API collection
2. Set `{{baseUrl}}` variable to `http://localhost:5000/api`
3. Authenticate and copy token to `{{token}}` variable
4. Run requests

---

**For more information, refer to the GitHub repository or contact support.**

**Last Updated**: September 2026
**Maintained By**: Development Team
