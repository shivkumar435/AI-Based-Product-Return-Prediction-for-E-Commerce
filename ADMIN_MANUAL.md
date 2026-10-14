# 👨‍💼 Admin Manual

## ReturnSense - Administrator Guide

**Version**: 1.0.0  
**Date**: September 2026  
**Audience**: System Administrators, Operations Team, Analytics Team

---

## 📖 Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Product Management](#product-management)
4. [Order Management](#order-management)
5. [User Management](#user-management)
6. [Analytics & Reporting](#analytics--reporting)
7. [Inventory Management](#inventory-management)
8. [Prediction Analysis](#prediction-analysis)
9. [System Settings](#system-settings)
10. [Troubleshooting](#troubleshooting)

---

## 🚀 Getting Started

### Admin Login

1. **Access Admin Panel**
   - Navigate to: `https://yourdomain.com/login`
   - URL: `http://localhost:5173/login` (development)

2. **Enter Credentials**
   - Email: Your admin email
   - Password: Your secure admin password
   - Click "Login"

3. **Verify Access**
   - Should redirect to admin dashboard
   - If regular user, contact system admin

### Admin Permissions

```
✓ View all products
✓ Create/Edit/Delete products
✓ View all orders
✓ Update order status
✓ Approve/Reject returns
✓ View user profiles
✓ Delete customers (if needed)
✓ View analytics & reports
✓ Access system settings
✓ Manage inventory
```

### First-Time Setup

1. Verify all products are listed
2. Check MongoDB connection
3. Set inventory thresholds
4. Configure email notifications (if applicable)
5. Review ML model performance

---

## 📊 Dashboard Overview

### Admin Dashboard URL
```
http://localhost:5173/admin/dashboard
```

### Main Metrics (KPI Cards)

#### 1. Total Revenue
```
Card Title: "Total Revenue"
Value: $247,892.50
Percentage: +12.5% vs last month

What it measures:
- Sum of all completed orders
- Includes taxes & shipping
- Excludes refunded amounts

How it's calculated:
Sum(Order.pricing.total WHERE Order.status !== "refunded")
```

#### 2. Total Orders
```
Card Title: "Total Orders"
Value: 3,847
Percentage: +18.3% vs last month

What it measures:
- Total number of orders placed
- Includes all statuses
- Real-time count

How it's calculated:
COUNT(Order documents)
```

#### 3. Return Rate
```
Card Title: "Return Rate"
Value: 12.4%
Percentage: -2.1% vs last month (improvement)

What it measures:
- Percentage of orders with return requests
- Measures customer satisfaction
- Lower = better

How it's calculated:
COUNT(returns) / COUNT(total orders) * 100
```

#### 4. Active Users
```
Card Title: "Active Users"
Value: 1,247
Percentage: +5.2% vs last month

What it measures:
- Users who placed order in last 30 days
- Measures customer engagement
- Growing = healthy business

How it's calculated:
COUNT(Users WHERE lastOrder >= 30 days ago)
```

### Dashboard Charts

#### Revenue Trend Chart (Line Graph)
```
- X-axis: Last 12 months
- Y-axis: Revenue ($)
- Shows: Monthly revenue progression
- Color: Green line
- Hover: Shows exact value

Key insights:
- Seasonal patterns (peaks/valleys)
- Growth trend (up/flat/declining)
- Revenue volatility
```

#### Order Distribution Chart (Pie Chart)
```
Sections:
- Processing: 23% (orange)
- Shipped: 45% (blue)
- Delivered: 28% (green)
- Cancelled: 2% (red)
- Return Requested: 2% (yellow)

What it shows:
- Where orders are in pipeline
- Fulfillment efficiency
- Problem areas (high cancel %)
```

#### Top Products Table
```
Columns:
1. Product Name
2. Units Sold
3. Revenue
4. Return Count
5. Return Rate
6. Average Rating

Sorted by: Units Sold (descending)
Limit: Top 10 products

Use case:
- Identify bestsellers
- Find products with high returns
- Determine inventory allocation
```

---

## 📦 Product Management

### Access Product Management
```
Navigation: Admin Dashboard → Products → Manage Products
URL: http://localhost:5173/admin/products
```

### Product List View

#### Columns in Product Table
```
1. Product ID (SKU)
2. Product Name
3. Category
4. Price ($)
5. Stock (Units)
6. Rating (1-5)
7. Returns (Count)
8. Status (Active/Inactive)
9. Actions (Edit/Delete/View)
```

#### Filters Available
```
Category: [Dropdown] - Filter by product category
Price Range: $[From] - $[To]
Stock Status: [Low Stock / Out of Stock / In Stock]
Availability: [Active / Inactive]
Rating: [≥ 4.5 / ≥ 4.0 / ≥ 3.5 / All]
Search: [Free text] - Search by name/SKU
```

#### Search & Filter Example
1. Click "Filter" button
2. Select: Category = Electronics
3. Select: Stock Status = Low Stock
4. Enter: Price Range = $100 - $1000
5. Click "Apply Filters"
6. Result: Shows Electronics products under $1000 with low stock

### Create New Product

**Step 1: Basic Information**
```
Product Name: [Required] - e.g., "iPhone 15 Pro Max"
SKU/Product ID: [Required] - e.g., "APPLE-IP15-MAX"
Category: [Dropdown] - Select from list
Brand: [Optional] - e.g., "Apple"
```

**Step 2: Pricing & Stock**
```
Original Price: $[Required] - e.g., 1299
Discount (%): [Optional] - e.g., 15
Discount Price: Auto-calculated - e.g., 1104.15
Stock Quantity: [Required] - e.g., 100
Low Stock Alert: [Number] - e.g., 20
```

**Step 3: Product Details**
```
Description: [Required] - Detailed product description
Specifications: [Key-Value Pairs]
  - Color: Silver
  - Storage: 256GB
  - RAM: 8GB
  - Display: 6.7" AMOLED

Tags: [Comma-separated] - e.g., "smartphone, luxury, apple"
```

**Step 4: Images**
```
Main Image: [Upload] - Primary product image
Additional Images: [Upload Multiple] - Up to 5 images
Image Requirements:
  - Format: JPG, PNG
  - Size: 500x500 minimum
  - File size: Max 5MB each
```

**Step 5: Review & Save**
```
- Review all information
- Click "Create Product"
- Success: Product added, redirects to product list
```

### Edit Product

1. Find product in list
2. Click "Edit" button
3. Modify fields needed
4. Click "Save Changes"
5. Verify changes in product list

**Important**: Stock changes do NOT automatically update active carts

### Delete Product

```
WARNING: Deleting will:
✗ Remove from catalog
✗ Hide from customers
✓ Keep order history
✓ Keep reviews

Steps:
1. Click product row
2. Click "Delete" button
3. Confirm deletion
4. Product removed (15 min archive period)
```

### Product Status Management

```
Active Status:
- Customers can see product
- Customers can order
- Reset: 1 click to reactivate

Inactive Status:
- Hidden from customers
- Cannot order
- Useful for: Discontinued, out of stock
```

### Duplicate Product

```
Use case: Create variants quickly
Steps:
1. Open existing product
2. Click "Duplicate"
3. Modify name, SKU, images
4. Click "Save"
```

---

## 📋 Order Management

### Access Order Management
```
Navigation: Admin Dashboard → Orders → Manage Orders
URL: http://localhost:5173/admin/orders
```

### Order List View

#### Columns in Order Table
```
1. Order ID
2. Customer Name
3. Total Amount ($)
4. Order Date
5. Status (Current stage)
6. Items (Count)
7. Actions (View/Update)
```

#### Order Statuses
```
🔵 Processing     - Order received, preparing
🟠 Shipped        - En route to customer
🟢 Delivered      - Reached customer
🔴 Cancelled      - Customer/system cancelled
🟡 Return Request - Customer requested return
🟣 Returned       - Return completed/approved

Status Flow:
Processing → Shipped → Delivered → [Complete]
                              ↓
                         [Customer Request Return]
                              ↓
                         Return Request
                              ↓
                         Returned
```

#### Filters Available
```
Order Status: [Dropdown] - Select status
Date Range: [From Date] - [To Date]
Price Range: $[Min] - $[Max]
Customer: [Search by name]
Payment Status: [Paid / Pending / Failed]
Sort: [By Date / By Amount / By Status]
```

### View Order Details

**Step 1: Open Order**
```
1. Click order ID in list
2. Opens order detail page
3. Shows: All items, addresses, payment, timeline
```

**Step 2: Order Information**
```
Order ID: #ORD-2026-001234
Order Date: September 15, 2026
Customer: John Doe
Email: john@example.com
Phone: +1-XXX-XXX-XXXX

Order Total: $1,299.00
  - Subtotal: $1,199.00
  - Taxes: $100.00
  - Shipping: $0.00 (Free)
  - Discount: -$0.00
```

**Step 3: Order Items**
```
Table:
Product | Qty | Price | Total | Return?
iPhone 15 | 1 | $1,199.00 | $1,199.00 | ❌
```

**Step 4: Shipping Address**
```
Name: John Doe
Street: 123 Main Street
City: New York, NY 10001
Country: United States
Phone: +1-XXX-XXX-XXXX
```

**Step 5: Payment Information**
```
Method: Credit Card
Card: **** **** **** 4242
Processing Status: ✓ Paid
Amount: $1,299.00
```

**Step 6: Status Timeline**
```
Timeline view shows:
📍 Processing      - Sep 15, 10:30 AM
📍 Ready to Ship   - Sep 16, 2:00 PM
📍 Shipped         - Sep 16, 3:45 PM
   Tracking: 1Z999AA10123456784
📍 In Transit      - Sep 17-19
📍 Delivered       - Sep 20, 5:30 PM
```

### Update Order Status

**Steps:**
1. Open order details
2. Click "Update Status" button
3. Select new status from dropdown
4. Add optional notes (why change?)
5. Click "Confirm"
6. Status updated, customer notified

**Status Update Rules:**
```
From Processing:
  → Can change to: Shipped, Cancelled

From Shipped:
  → Can change to: Delivered, Cancelled

From Delivered:
  → Can change to: Return Requested (if return started)

From Return Requested:
  → Can change to: Returned (approved), Cancelled (rejected)

From Cancelled/Returned:
  → Cannot change (final state)
```

### Process Return Requests

**When customer requests return:**
1. Order status changes to "Return Request"
2. Appears in returns list
3. You receive notification

**Reviewing Return:**
1. Click return request
2. View reason from customer
3. Optional: Inspect return condition notes
4. Check items being returned

**Approving Return:**
```
1. Review return details
2. Click "Approve Return"
3. Enter refund amount ($)
4. Select: Full / Partial refund
5. Add notes: "Approved - Item defective"
6. Click "Process Return"

Result:
- Order status → Returned
- Refund processed
- Inventory updated (+1 stock)
- Customer notified
- Item marked as defective (analytics)
```

**Rejecting Return:**
```
1. Click "Reject Return"
2. Reason: [Dropdown]
   - Outside return window
   - Item not defective
   - Policy violation
   - Other
3. Add explanation
4. Click "Reject"

Result:
- Return cancelled
- Order status remains Delivered
- Customer can appeal
```

### Cancel Order

**Steps:**
1. Open order
2. Click "Cancel Order"
3. Reason: [Dropdown]
   - Out of stock
   - Customer request
   - Payment failed
   - Shipping issue
4. Add notes
5. Confirm cancellation

**Result:**
- Order status → Cancelled
- Inventory restored
- Refund issued (if paid)
- Customer notified

---

## 👥 User Management

### Access User Management
```
Navigation: Admin Dashboard → Users → Manage Users
URL: http://localhost:5173/admin/users
```

### User List View

#### Columns in User Table
```
1. User ID
2. Name
3. Email
4. Phone
5. Total Orders
6. Total Spent ($)
7. Account Status
8. Actions (View/Edit/Delete)
```

#### Filters Available
```
Account Status: [Active / Suspended / Inactive]
Join Date Range: [From] - [To]
Total Spent: $[Min] - $[Max]
Order Count: [Min] - [Max]
Search: [Email / Name]
```

### View User Profile

**User Information:**
```
Name: John Doe
Email: john@example.com
Phone: +1-555-0123
Gender: Male
Date of Birth: January 15, 1990
Member Since: September 1, 2025

Account Status: Active
Last Login: Today at 2:30 PM
Last Order: September 15, 2026
Total Orders: 12
Total Spent: $4,567.89

Addresses on File: 2
  1. Home: 123 Main St, New York, NY
  2. Work: 456 Oak Ave, New York, NY
```

**Customer Statistics:**
```
Order History:
- Total Orders: 12
- Average Order Value: $380.66
- Return Rate: 8.3% (1 return)
- Preferred Category: Electronics
- Preferred Brand: Apple

Recent Orders:
1. #ORD-2026-001234 - $1,299.00 - Delivered
2. #ORD-2026-001233 - $899.50 - Delivered
3. #ORD-2026-001232 - $249.99 - Delivered
```

**Return History:**
```
Returns: 1 total
1. #ORD-2026-001230 - iPhone Case
   Date: Sep 1, 2026
   Reason: Defective
   Status: Approved
   Refund: $29.99
```

### Edit User Profile

1. Click "Edit" on user
2. Modify fields:
   - Name, Email, Phone
   - Date of Birth
   - Gender
   - Default address
3. Click "Save Changes"

### Delete User

```
WARNING: Deletion will:
✗ Remove user account
✗ Hide from customer list
✓ Keep order history
✓ Keep review/feedback

Useful for:
- Fraudulent accounts
- Test accounts
- Duplicate accounts
- GDPR right to be forgotten (partial)

Steps:
1. Open user profile
2. Click "Delete Account"
3. Confirm deletion
4. Account marked as deleted
```

### Suspend User

```
Reasons to suspend:
- Fraudulent activity
- Multiple chargebacks
- Violating policies
- Verification pending

Steps:
1. Click "Suspend Account"
2. Reason: [Dropdown]
3. Duration: Until manually unsuspended
4. Notify user: [Checkbox]
5. Confirm

Result:
- User cannot login/order
- Can still view past orders
- Notification sent to email
```

---

## 📊 Analytics & Reporting

### Access Analytics
```
Navigation: Admin Dashboard → Analytics
URL: http://localhost:5173/admin/analytics
```

### Sales Analytics

**Date Range Selector**
```
Presets: Today / This Week / This Month / This Year / Custom
Default: This Month
```

**Key Metrics:**
```
Total Revenue: $45,230.50
  - Growth: +18.5% vs last period
  - Average Order: $187.43

Total Orders: 242
  - Growth: +12.3% vs last period
  - Completion Rate: 94.2%

Average Order Value: $187.43
  - Growth: +5.8% vs last period
  - Median: $156.00

Unique Customers: 189
  - New: 34 (14.6%)
  - Repeat: 155 (85.4%)
```

**Revenue by Category (Bar Chart)**
```
Electronics:        $18,450.75 (40.8%)
Home & Garden:      $12,340.20 (27.3%)
Clothing:            $9,220.55 (20.4%)
Books:               $3,120.00 (6.9%)
Sports:              $2,099.00 (4.6%)
```

**Sales Trend (Line Chart)**
```
X-axis: Days/Weeks/Months
Y-axis: Revenue ($)
Shows: Sales trajectory, peaks, valleys
Use: Identify seasonality, trends
```

### Customer Analytics

**Customer Metrics:**
```
Total Customers: 3,847
  - Active (last 30 days): 1,247 (32.4%)
  - New (this month): 187 (4.9%)
  - Inactive (>90 days): 1,203 (31.3%)

Repeat Purchase Rate: 68.4%
  - Customers with 2+ orders
  - Industry benchmark: 60%

Customer Lifetime Value (CLV): $892.45
  - Average spend per customer lifetime
  - Growing: +12% YoY

Customer Acquisition Cost: $22.50
  - Marketing spend / new customers
  - ROI: 39.6x

Churn Rate: 8.2%
  - % of customers not returning
  - Down from 9.1% last period
```

**Customer Segmentation:**
```
By Value:
- High Value (>$1000): 234 customers (6.1%)
- Medium Value ($100-$1000): 1,847 customers (48%)
- Low Value (<$100): 1,766 customers (45.9%)

By Frequency:
- Frequent (>6 orders/year): 456 (11.9%)
- Regular (2-6 orders/year): 1,234 (32.1%)
- Occasional (1 order/year): 2,157 (56%)

By Geography:
- New York: 823 (21.4%)
- California: 567 (14.8%)
- Texas: 456 (11.9%)
- Other: 2,001 (52%)
```

### Return Analysis

**Return Metrics:**
```
Total Returns: 487
Return Rate: 12.7%
  - Target: <15%
  - Status: ✓ On target

Approved Returns: 412 (84.6%)
Rejected Returns: 75 (15.4%)

Total Refunds: $89,234.67
Refund Rate: 2.9% of revenue
  - Target: <3.5%
  - Status: ✓ Below target

Average Refund: $183.52
```

**Return Reasons (Pie Chart):**
```
Defective: 45.2% (220 returns)
Wrong Item: 18.5% (90 returns)
Not as Described: 16.8% (82 returns)
Changed Mind: 12.1% (59 returns)
Damaged in Shipping: 7.4% (36 returns)
```

**High Return Products:**
```
Product | Returns | Return Rate | Avg Rating
Headphones X | 23 | 45% | 2.1 ★
USB Cable | 19 | 38% | 2.4 ★
Phone Case | 17 | 34% | 3.2 ★
Screen Protector | 15 | 30% | 3.5 ★
```

**Action Items:**
- Investigate Headphones X (45% return rate)
- Review supplier quality
- Update product description
- Consider discontinuing

### Prediction Analytics

**ML Model Performance:**
```
Model Accuracy: 85.2%
Precision: 82.1%
Recall: 83.5%
F1-Score: 82.8%

Last Updated: September 15, 2026
Model Version: 1.0.0
Training Samples: 10,000
```

**Prediction Breakdown:**
```
Low Risk (0-35%): 1,423 orders (45.2%)
Medium Risk (35-65%): 943 orders (30.1%)
High Risk (65-100%): 791 orders (25.2%)

Accuracy by Risk Level:
- Low: 92% (catches non-returners)
- Medium: 78% (moderately accurate)
- High: 78% (catches risky orders)
```

**Risk Correlation:**
```
Most Correlated Factors:
1. Previous Returns: 18.7% importance
2. Order Frequency: 22.3% importance
3. Customer Age: 14.2% importance
4. Discount Level: 12.1% importance
5. Product Price: 10.5% importance

Insights:
- Frequent customers are low-risk
- First-time customers higher risk
- Young customers more likely to return
- Heavily discounted items have more returns
```

---

## 📦 Inventory Management

### Access Inventory Management
```
Navigation: Admin Dashboard → Inventory
URL: http://localhost:5173/admin/inventory
```

### Inventory Overview

**Key Metrics:**
```
Total Stock Value: $234,567.89
Total Units in Stock: 12,345
Average Inventory Age: 45 days
Inventory Turnover: 8.2x/year

Issues:
⚠️ Low Stock Items: 23
🔴 Out of Stock: 5
✓ Healthy Stock: 342
```

### Stock Levels

**Stock Categories:**
```
In Stock
- Units: > threshold
- Status: Green
- Action: Normal

Low Stock
- Units: Between threshold and 5
- Status: Yellow
- Action: Order more

Out of Stock
- Units: 0
- Status: Red
- Action: Urgent reorder
```

### Update Stock

**Steps:**
1. Find product in inventory list
2. Click product
3. Edit "Stock Quantity" field
4. Click "Update Stock"

**Example:**
```
Before: iPhone 15 Pro - Stock: 5 units
Action: Update to 50 units
After: iPhone 15 Pro - Stock: 50 units

Note: Typically done when new shipment arrives
```

### Set Low Stock Alert

**Purpose:** Notification when stock falls below threshold

**Steps:**
1. Open product
2. Set "Low Stock Threshold" (e.g., 20 units)
3. Save
4. When stock ≤ 20: Admin receives alert

**Use Cases:**
```
High-demand items: 20-30 units
Medium-demand: 10-15 units
Slow-movers: 5-10 units
Seasonal: varies
```

### Batch Stock Update

**For multiple products:**

1. Go to Inventory page
2. Click "Batch Update"
3. Upload CSV with format:
   ```
   Product ID, New Stock
   PRODUCT-001, 50
   PRODUCT-002, 0
   PRODUCT-003, 100
   ```
4. Preview changes
5. Click "Apply"

---

## 🔮 Prediction Analysis

### Prediction Dashboard
```
Navigation: Admin Dashboard → Predictions
URL: http://localhost:5173/admin/predictions
```

### View Predictions

**High-Risk Orders to Review:**
```
List of orders with >65% return probability

Order ID | Customer | Risk Score | Probability | Status
ORD-001 | John Doe | HIGH | 78% | Processing
ORD-002 | Jane Smith | MEDIUM | 52% | Processing
ORD-003 | Bob Johnson | HIGH | 82% | Shipped

Actions:
- Click to view details
- Check prediction factors
- Contact customer if needed
```

### Risk Factors Explanation

**Risk Score Breakdown:**
```
Order #ORD-001 - Risk: HIGH (78%)

Factors Increasing Risk:
🔴 Customer Age: 22 (younger = higher risk)
🔴 Previous Returns: 3 (repeat returner)
🔴 Discount: 35% (high discount = less commitment)
🟡 Order Frequency: 2/month (occasional customer)

Factors Decreasing Risk:
🟢 Product Rating: 4.8★ (highly rated)
🟢 Delivery Time: 2 days (fast delivery)

Recommendation:
- Monitor this order closely
- Prepare return supplies
- Consider offering exchanges
```

### Prediction Accuracy Monitoring

**Tracked Metrics:**
```
Prediction Calibration:
- Orders predicted "Low Risk" (0-35%)
  - Actual return rate: 8.2%
  - Expected: ~7%
  - Calibration: ✓ Good

- Orders predicted "Medium Risk" (35-65%)
  - Actual return rate: 42.5%
  - Expected: ~50%
  - Calibration: ~ Fair

- Orders predicted "High Risk" (65-100%)
  - Actual return rate: 68.9%
  - Expected: ~80%
  - Calibration: ~ Fair
```

### Model Retraining

**When to Retrain:**
```
Weekly: Recommended
Monthly: Standard schedule
Quarterly: Minimum required

Triggers:
- Accuracy drops below 80%
- New pattern in returns detected
- Seasonal changes detected
- Business policy changes
```

**Initiate Retraining:**
```
1. Go to Prediction Settings
2. Click "Retrain Model"
3. Select date range for training
4. Review new training samples
5. Click "Start Training"
6. Monitor progress
7. Validate new model
8. If better: Deploy
```

---

## ⚙️ System Settings

### Access Settings
```
Navigation: Admin Dashboard → Settings
URL: http://localhost:5173/admin/settings
```

### General Settings

**Store Information:**
```
Store Name: ReturnSense
Store Email: support@returnsense.com
Store Phone: 1-800-RETURN
Website: www.returnsense.com
Support Email: support@returnsense.com
```

**Business Settings:**
```
Currency: USD ($)
Timezone: Eastern Time (ET)
Language: English

Tax Rate: 8.25%
Shipping Flat Rate: 0 (Free shipping)
Min Order Value: $0
Max Order Value: $50,000
```

### Notification Settings

```
Email Notifications (on/off):
- Order Confirmation: ✓ ON
- Shipment Update: ✓ ON
- Delivery Confirmation: ✓ ON
- Low Stock Alert: ✓ ON
- Return Request: ✓ ON
- Return Approved: ✓ ON

SMS Notifications (optional):
- Order Placed: ◯ OFF
- Shipped: ◯ OFF
- Delivery: ◯ OFF
```

### Security Settings

**Authentication:**
```
Session Timeout: 30 minutes
Require 2FA: ◯ OFF
IP Whitelist: [Disable]
Login Attempts: 5 before lockout
Lockout Duration: 15 minutes
```

**Password Policy:**
```
Minimum Length: 8 characters
Complexity Required: Yes (uppercase, number, special char)
Expiration: 90 days
History: Last 5 passwords not allowed
```

### API Keys & Integration

**API Settings:**
```
ML Model Endpoint: http://localhost:5001
API Timeout: 30 seconds
Retry Policy: 3 attempts
Cache Expiry: 1 hour
```

---

## 🐛 Troubleshooting

### Common Issues

#### Issue: Can't access admin dashboard
**Cause:** Not logged in with admin account
**Solution:**
1. Log out completely
2. Login with admin email
3. Verify role is "admin" in database
4. Clear browser cache

#### Issue: Orders not appearing in list
**Cause:** Filter applied or data not loaded
**Solution:**
1. Check filter settings
2. Clear all filters
3. Refresh page (Ctrl+R)
4. Check MongoDB connection
5. Contact developer if persists

#### Issue: Can't update order status
**Cause:** Invalid status transition
**Solution:**
```
Reference valid transitions:
Processing → Shipped or Cancelled
Shipped → Delivered or Cancelled
Delivered → Final
```

#### Issue: Product images not uploading
**Cause:** File size or format issue
**Solution:**
1. Check file format (JPG/PNG only)
2. Resize image if >5MB
3. Use PNG for transparency
4. Check internet connection

#### Issue: Predictions not appearing
**Cause:** ML API down or not connected
**Solution:**
1. Check if Flask API running: `python app.py`
2. Verify port 5001 accessible
3. Check firewall rules
4. Restart Flask service

#### Issue: Low stock alerts not received
**Cause:** Notifications not enabled
**Solution:**
1. Go to Settings → Notifications
2. Enable "Low Stock Alert"
3. Verify email is correct
4. Check spam folder
5. Whitelist admin@returnsense.com

### Getting Help

**Documentation:**
- API Docs: [API_DOCS.md](API_DOCS.md)
- Database Schema: [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)
- Setup Guide: [INSTALLATION.md](INSTALLATION.md)

**Support Channels:**
- Email: support@returnsense.com
- Documentation: /docs
- Chat: In-app support widget
- Bug Report: GitHub issues

---

**Admin Manual Version**: 1.0.0  
**Last Updated**: September 2026  
**Maintained By**: Development Team

