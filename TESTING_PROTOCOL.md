# 🧪 End-to-End Testing Report

## ReturnSense - Comprehensive QA Protocol

**Test Date**: September 2026  
**Test Environment**: Development  
**Tester Role**: QA Engineer  
**Status**: Ready for Execution

---

## 📋 Test Plan Overview

### Testing Scope
```
✓ Customer Workflows (User Journey)
✓ Admin Workflows (Operational Tasks)  
✓ ML Integration (Prediction Accuracy)
✓ API Endpoints (All 40+ endpoints)
✓ Database Operations (CRUD operations)
✓ Authentication & Security (User access)
✓ Performance & Load (Response times)
✓ Error Handling (Edge cases)
```

### Testing Objectives
1. **Functionality**: All features work as designed
2. **Reliability**: No crashes or data loss
3. **Security**: Auth & data protection working
4. **Performance**: Response times acceptable
5. **Usability**: Intuitive user experience
6. **Compatibility**: Works on major browsers
7. **Scalability**: Handles expected load

### Test Environment Setup
```
Frontend: http://localhost:5173 (React dev server)
Backend: http://localhost:5000 (Express server)
ML API: http://localhost:5001 (Flask ML server)
Database: MongoDB (Local or Atlas)
Browser: Chrome/Firefox/Safari (desktop)
Mobile: iOS Safari, Google Chrome Android
Test Data: Seeds from seed.js + manual test accounts
```

---

## 👤 Customer Journey Testing (Phase 4)

### Test Suite 1: User Registration & Authentication

#### Test Case 1.1: New User Registration
```
Test ID: T-AUTH-001
Title: Register new customer account
Priority: Critical
Pre-requisites: None

Steps:
1. Navigate to /register
2. Enter email: testuser@example.com
3. Enter password: TestPass123!
4. Enter confirm password: TestPass123!
5. Click "Create Account"

Expected Results:
- Account created successfully
- Redirected to login page
- Can login with credentials
- User appears in database

Pass/Fail: ___ 
Notes: ___________
```

#### Test Case 1.2: Login with Valid Credentials
```
Test ID: T-AUTH-002
Title: Login with correct email/password
Priority: Critical

Steps:
1. Navigate to /login
2. Email: testuser@example.com
3. Password: TestPass123!
4. Click "Login"

Expected:
- Success message shown
- Redirected to dashboard
- JWT token stored in localStorage
- User info displayed in navbar
- Can access protected routes

Pass/Fail: ___
```

#### Test Case 1.3: Login with Invalid Password
```
Test ID: T-AUTH-003
Title: Login with wrong password
Priority: High

Steps:
1. Navigate to /login
2. Email: testuser@example.com
3. Password: WrongPass123!
4. Click "Login"

Expected:
- Error message: "Invalid credentials"
- Remain on login page
- Account not locked (allow retries)
- No token generated

Pass/Fail: ___
```

#### Test Case 1.4: Logout
```
Test ID: T-AUTH-004
Title: User logout
Priority: High

Steps:
1. Login as user
2. Click user menu (top right)
3. Click "Logout"

Expected:
- Logged out successfully
- Redirected to home page
- Token removed from localStorage
- Cannot access protected routes

Pass/Fail: ___
```

### Test Suite 2: Product Browsing & Search

#### Test Case 2.1: View Product Catalog
```
Test ID: T-PROD-001
Title: Browse product catalog page
Priority: High

Steps:
1. Navigate to /products
2. Page should load with products

Expected:
- 12 products displayed (default pagination)
- Product cards show: image, name, price, rating
- Loading spinner appears briefly
- No console errors
- Responsive design (mobile/tablet)

Pass/Fail: ___
Notes: ___________
```

#### Test Case 2.2: Search Products
```
Test ID: T-PROD-002
Title: Search for products
Priority: High

Steps:
1. Go to /products
2. Enter "iPhone" in search box
3. Press Enter

Expected:
- Filtered list showing only matching products
- Results update in real-time
- No matches shows empty state
- Search is case-insensitive

Pass/Fail: ___
```

#### Test Case 2.3: Filter by Category
```
Test ID: T-PROD-003
Title: Filter products by category
Priority: High

Steps:
1. Go to /products
2. Click "Filter" sidebar
3. Select category: Electronics
4. View filtered results

Expected:
- Shows only Electronics products
- Filter count displayed (23 items)
- Clear filter button available
- Multiple filters can be applied

Pass/Fail: ___
```

#### Test Case 2.4: Sort Products
```
Test ID: T-PROD-004
Title: Sort products by price
Priority: Medium

Steps:
1. Go to /products
2. Click sort dropdown
3. Select "Price: Low to High"

Expected:
- Products reordered by price ascending
- Lowest price first
- Highest price last
- Sort selection saved

Pass/Fail: ___
```

#### Test Case 2.5: View Product Details
```
Test ID: T-PROD-005
Title: View full product details
Priority: High

Steps:
1. Click any product from list
2. View product detail page

Expected:
- High-res product images
- Full description
- Specifications/features
- Customer ratings & reviews (if any)
- Related products section
- Add to cart button
- Stock status displayed
- Price displayed correctly

Pass/Fail: ___
```

### Test Suite 3: Shopping Cart

#### Test Case 3.1: Add to Cart
```
Test ID: T-CART-001
Title: Add product to shopping cart
Priority: Critical

Steps:
1. Go to product detail page
2. Set quantity: 1
3. Click "Add to Cart"

Expected:
- Success notification
- Cart icon updates with count (1)
- Toast message: "Added to cart"
- Cart data saved (refresh persists)

Pass/Fail: ___
```

#### Test Case 3.2: View Cart
```
Test ID: T-CART-002
Title: View shopping cart contents
Priority: Critical

Steps:
1. Click cart icon in navbar
2. Navigate to /cart

Expected:
- Shows all cart items
- Product images, names, prices
- Quantity, subtotal per item
- Total cart value
- Save for later section
- Remove item buttons

Pass/Fail: ___
```

#### Test Case 3.3: Update Quantity
```
Test ID: T-CART-003
Title: Increase/decrease item quantity
Priority: High

Steps:
1. Go to cart page
2. Find item
3. Click + increase button (quantity 1→2)

Expected:
- Quantity updates
- Subtotal recalculates
- Cart total updates
- Change saved to database

Pass/Fail: ___
```

#### Test Case 3.4: Remove from Cart
```
Test ID: T-CART-004
Title: Remove item from cart
Priority: High

Steps:
1. Go to cart page
2. Click "Remove" button

Expected:
- Item removed from cart
- Cart updates
- Confirmation shown
- Cart count decreases

Pass/Fail: ___
```

#### Test Case 3.5: Save for Later
```
Test ID: T-CART-005
Title: Move item to Save for Later
Priority: Medium

Steps:
1. Go to cart page
2. Click "Save for Later" button
3. Navigate to wishlist

Expected:
- Item moved to Save for Later section
- Item removed from active cart
- Can view in wishlist
- Can move back to cart

Pass/Fail: ___
```

### Test Suite 4: Checkout Process

#### Test Case 4.1: Enter Shipping Address
```
Test ID: T-CHECKOUT-001
Title: Enter shipping address during checkout
Priority: Critical

Steps:
1. Go to cart (with items)
2. Click "Proceed to Checkout"
3. Step 1: Address
4. Fill address form:
   - Street: 123 Main St
   - City: New York
   - State: NY
   - ZIP: 10001
5. Click "Continue"

Expected:
- Form validates input
- Address saved
- Proceeds to step 2
- Address shown in review

Pass/Fail: ___
```

#### Test Case 4.2: Select Payment Method
```
Test ID: T-CHECKOUT-002
Title: Select payment method
Priority: Critical

Steps:
1. Step 2: Payment
2. Select payment: Credit Card
3. Fill details:
   - Card: 4242 4242 4242 4242
   - Expiry: 12/25
   - CVV: 123
4. Click "Continue"

Expected:
- Payment method selected
- Proceeds to review
- Details not logged (security)

Pass/Fail: ___
Note: Use test card numbers from Stripe
```

#### Test Case 4.3: Review Order
```
Test ID: T-CHECKOUT-003
Title: Review order before placing
Priority: Critical

Steps:
1. Step 3: Review
2. View all order details
3. Click "Place Order"

Expected:
- Shows shipping address
- Shows payment summary
- Shows items and prices
- Taxes calculated
- Final total correct
- Order placed successfully
- Redirected to confirmation

Pass/Fail: ___
```

#### Test Case 4.4: Order Confirmation
```
Test ID: T-CHECKOUT-004
Title: Order confirmation after checkout
Priority: High

Steps:
1. After placing order
2. View confirmation page

Expected:
- Order number displayed
- Confirmation message
- Order total shown
- Estimated delivery date
- "View Order" button available
- Can navigate to home
- Email confirmation sent

Pass/Fail: ___
```

### Test Suite 5: Order Management

#### Test Case 5.1: View Order History
```
Test ID: T-ORDER-001
Title: View customer order history
Priority: High

Steps:
1. Go to /order-history
2. View all customer orders

Expected:
- Lists all orders
- Sorted by date (newest first)
- Shows status, amount, date
- Pagination if many orders
- Click to view details

Pass/Fail: ___
```

#### Test Case 5.2: Track Order
```
Test ID: T-ORDER-002
Title: Track order status in detail
Priority: High

Steps:
1. Go to order history
2. Click specific order
3. View order detail page

Expected:
- Full order information
- Status timeline
- Current step highlighted
- Estimated delivery
- Tracking number (if shipped)
- All items listed

Pass/Fail: ___
```

#### Test Case 5.3: Request Return
```
Test ID: T-ORDER-003
Title: Request return for delivered order
Priority: High

Steps:
1. Open delivered order
2. Click "Request Return"
3. Reason: Defective
4. Add comment: "Screen has dead pixels"
5. Submit request

Expected:
- Return request submitted
- Status changes to "Return Requested"
- Confirmation message shown
- Return instructions emailed
- Can view return status

Pass/Fail: ___
```

#### Test Case 5.4: Cancel Order
```
Test ID: T-ORDER-004
Title: Cancel order in processing
Priority: High

Steps:
1. Open order in Processing status
2. Click "Cancel Order"
3. Confirm cancellation

Expected:
- Order cancelled
- Refund initiated
- Status → Cancelled
- Notification sent
- Inventory restored

Pass/Fail: ___
```

### Test Suite 6: User Account Management

#### Test Case 6.1: View Profile
```
Test ID: T-USER-001
Title: View user profile information
Priority: Medium

Steps:
1. Go to /profile
2. View profile details

Expected:
- Name, email, phone displayed
- Avatar shown
- Accounts status
- Member since date
- Edit button available

Pass/Fail: ___
```

#### Test Case 6.2: Edit Profile
```
Test ID: T-USER-002
Title: Update profile information
Priority: Medium

Steps:
1. Go to profile
2. Click "Edit Profile"
3. Change name: "John Updated"
4. Click "Save"

Expected:
- Changes saved
- Success message
- Profile updated everywhere
- Last modified timestamp

Pass/Fail: ___
```

#### Test Case 6.3: Change Password
```
Test ID: T-USER-003
Title: Change password
Priority: High

Steps:
1. Go to profile
2. Click "Change Password"
3. Current: TestPass123!
4. New: NewPass456!
5. Confirm: NewPass456!
6. Click "Save"

Expected:
- Password changed
- Confirmation message
- Old password no longer works
- Can login with new password

Pass/Fail: ___
```

#### Test Case 6.4: View Saved Addresses
```
Test ID: T-USER-004
Title: View and manage addresses
Priority: Medium

Steps:
1. Go to profile
2. View "Saved Addresses"
3. Add new address
4. Set as default
5. Delete unused address

Expected:
- All addresses listed
- Add new address form
- Set default address
- Delete with confirmation
- Used in checkout

Pass/Fail: ___
```

### Test Suite 7: Wishlist

#### Test Case 7.1: Add to Wishlist
```
Test ID: T-WISH-001
Title: Add product to wishlist
Priority: Medium

Steps:
1. Go to product detail
2. Click heart icon "Add to Wishlist"

Expected:
- Heart icon fills/changes color
- Success notification
- Item added to wishlist
- Persists on refresh

Pass/Fail: ___
```

#### Test Case 7.2: View Wishlist
```
Test ID: T-WISH-002
Title: View wishlist items
Priority: Medium

Steps:
1. Go to /wishlist
2. View all saved items

Expected:
- All wishlist items displayed
- Product cards shown
- Remove button available
- Move to cart button
- Empty state if no items

Pass/Fail: ___
```

#### Test Case 7.3: Remove from Wishlist
```
Test ID: T-WISH-003
Title: Remove item from wishlist
Priority: Medium

Steps:
1. Go to wishlist
2. Click "Remove" on item

Expected:
- Item removed
- Wishlist updates
- Item count decreases
- Heart icon unfills

Pass/Fail: ___
```

---

## 👨‍💼 Admin Workflows Testing (Phase 6)

### Test Suite 8: Admin Dashboard

#### Test Case 8.1: Access Admin Panel
```
Test ID: T-ADMIN-001
Title: Login as admin and access dashboard
Priority: Critical

Steps:
1. Navigate to /login
2. Login as admin@example.com
3. Navigate to /admin/dashboard

Expected:
- Admin dashboard loads
- Admin-only routes accessible
- KPI cards displayed
- Charts rendered without errors
- Sidebar navigation visible

Pass/Fail: ___
```

#### Test Case 8.2: Dashboard KPIs
```
Test ID: T-ADMIN-002
Title: Dashboard KPI cards display correctly
Priority: High

Steps:
1. Open admin dashboard
2. View KPI cards:
   - Total Revenue
   - Total Orders
   - Return Rate
   - Active Users

Expected:
- All metrics display
- Numbers are current/accurate
- Growth percentages shown
- No loading errors
- Cards are responsive

Pass/Fail: ___
```

#### Test Case 8.3: Dashboard Charts
```
Test ID: T-ADMIN-003
Title: View dashboard charts
Priority: High

Steps:
1. Open dashboard
2. View revenue trend chart
3. View order distribution chart
4. Hover over data points

Expected:
- Charts render correctly
- Hover tooltips show values
- Charts responsive
- Legend displayed correctly
- No console errors

Pass/Fail: ___
```

### Test Suite 9: Product Management

#### Test Case 9.1: View Products
```
Test ID: T-PROD-ADMIN-001
Title: Admin view product list
Priority: High

Steps:
1. Go to /admin/products
2. View product list

Expected:
- All products listed
- Columns: Name, Price, Stock, Rating
- Pagination working
- Search/filter available
- Action buttons (Edit/Delete)

Pass/Fail: ___
```

#### Test Case 9.2: Create Product
```
Test ID: T-PROD-ADMIN-002
Title: Admin create new product
Priority: High

Steps:
1. Go to /admin/products
2. Click "Add Product"
3. Fill form:
   - Name: Test Product
   - Price: $99.99
   - Stock: 50
   - Category: Electronics
4. Upload images
5. Click "Create"

Expected:
- Product created
- Appears in list
- Database updated
- Can search for it
- Customers can see it

Pass/Fail: ___
```

#### Test Case 9.3: Edit Product
```
Test ID: T-PROD-ADMIN-003
Title: Admin edit product details
Priority: High

Steps:
1. Go to /admin/products
2. Click product "Edit"
3. Change price: $89.99
4. Click "Save"

Expected:
- Changes saved
- Price updated
- Appears in category
- Confirmation shown
- Change logged

Pass/Fail: ___
```

#### Test Case 9.4: Delete Product
```
Test ID: T-PROD-ADMIN-004
Title: Admin delete product
Priority: High

Steps:
1. Go to /admin/products
2. Click product "Delete"
3. Confirm deletion

Expected:
- Product removed from list
- Not visible to customers
- Order history retained
- Notification shown

Pass/Fail: ___
```

### Test Suite 10: Order Management

#### Test Case 10.1: View Orders
```
Test ID: T-ORDER-ADMIN-001
Title: Admin view all orders
Priority: High

Steps:
1. Go to /admin/orders
2. View order list

Expected:
- All orders listed
- Columns: ID, Customer, Amount, Status
- Can filter by status
- Can search by order ID
- Pagination working

Pass/Fail: ___
```

#### Test Case 10.2: View Order Details
```
Test ID: T-ORDER-ADMIN-002
Title: Admin view order details
Priority: High

Steps:
1. Go to /admin/orders
2. Click order ID

Expected:
- Full order information
- Customer details
- Shipping address
- Payment info
- Status timeline
- Items listed

Pass/Fail: ___
```

#### Test Case 10.3: Update Order Status
```
Test ID: T-ORDER-ADMIN-003
Title: Admin update order status
Priority: High

Steps:
1. Open order details
2. Click "Update Status"
3. Select: Shipped
4. Add note: "Shipped via FedEx #123456"
5. Confirm

Expected:
- Status updated
- Timeline updated
- Customer notified
- Status logged

Pass/Fail: ___
```

#### Test Case 10.4: Approve Return
```
Test ID: T-ORDER-ADMIN-004
Title: Admin approve return request
Priority: High

Steps:
1. Find order with return request
2. Click order
3. Click "Approve Return"
4. Refund: Full ($1299.00)
5. Confirm

Expected:
- Return approved
- Refund processed
- Status → Returned
- Customer notified
- Inventory updated

Pass/Fail: ___
```

### Test Suite 11: User Management

#### Test Case 11.1: View Users
```
Test ID: T-USER-ADMIN-001
Title: Admin view user list
Priority: High

Steps:
1. Go to /admin/users
2. View user list

Expected:
- All users listed
- Columns: Name, Email, Orders, Status
- Can filter/search
- View details available
- Edit/Delete buttons

Pass/Fail: ___
```

#### Test Case 11.2: View User Profile
```
Test ID: T-USER-ADMIN-002
Title: Admin view user details
Priority: High

Steps:
1. Go to /admin/users
2. Click user name

Expected:
- Full user profile
- Account info
- Order history
- Return history
- Statistics
- Edit/Delete options

Pass/Fail: ___
```

#### Test Case 11.3: Suspend User
```
Test ID: T-USER-ADMIN-003
Title: Admin suspend user account
Priority: Medium

Steps:
1. Open user profile
2. Click "Suspend Account"
3. Reason: "Fraudulent activity"
4. Confirm

Expected:
- Account suspended
- User cannot login
- Cannot place orders
- User notified
- Can unsuspend later

Pass/Fail: ___
```

### Test Suite 12: Analytics

#### Test Case 12.1: View Analytics Dashboard
```
Test ID: T-ANALYTICS-001
Title: View analytics page
Priority: High

Steps:
1. Go to /admin/analytics
2. View analytics metrics

Expected:
- Page loads without errors
- Metrics displayed:
  - Revenue, Orders, Customers
  - Trends and graphs
- Date range selector works
- Filters available

Pass/Fail: ___
```

#### Test Case 12.2: Return Analysis
```
Test ID: T-ANALYTICS-002
Title: View return analysis charts
Priority: High

Steps:
1. Go to /admin/analytics
2. View "Return Analysis" section

Expected:
- Return metrics displayed
- Return reasons pie chart
- High return products listed
- RMA rate calculated
- Trends shown

Pass/Fail: ___
```

#### Test Case 12.3: Prediction Analytics
```
Test ID: T-ANALYTICS-003
Title: View ML prediction performance
Priority: Medium

Steps:
1. Go to /admin/predictions
2. View model metrics
3. View risk distribution

Expected:
- Model accuracy: 85%+
- Precision/recall shown
- Risk level distribution
- Prediction calibration
- Training date/version

Pass/Fail: ___
```

---

## 🤖 ML Integration Testing

### Test Suite 13: Prediction Accuracy

#### Test Case 13.1: Predict Low Risk
```
Test ID: T-ML-001
Title: Predict low risk customer order
Priority: High

Steps:
1. Go to /order (manual prediction test)
2. Fill features:
   - Price: $500 (mid-range)
   - Category: Electronics
   - Discount: 5% (low)
   - Delivery Time: 2 days
   - Rating: 4.8 (high)
   - Previous Returns: 0
   - Customer Age: 35 (mid)
   - Gender: Male
   - Shipping Distance: 100km
   - Order Frequency: 20 (frequent)
   - Payment: Credit Card
3. Submit

Expected Outcome:
- Prediction: 0 (No Return)
- Probability: ~20-35% (low risk)
- Confidence: 65-80%
- Explanation shown

Pass/Fail: ___
```

#### Test Case 13.2: Predict High Risk
```
Test ID: T-ML-002
Title: Predict high risk customer order
Priority: High

Steps:
1. Go to /order (manual prediction)
2. Fill features:
   - Price: $1500 (high)
   - Category: Electronics
   - Discount: 40% (high)
   - Delivery Time: 7 days
   - Rating: 2.5 (low)
   - Previous Returns: 5 (many)
   - Customer Age: 22 (young)
   - Gender: Female
   - Shipping Distance: 2000km (far)
   - Order Frequency: 2 (rare)
   - Payment: COD
3. Submit

Expected Outcome:
- Prediction: 1 (Return)
- Probability: ~70-85% (high risk)
- Confidence: 60-75%
- Explanation shown

Pass/Fail: ___
```

#### Test Case 13.3: Prediction Factors
```
Test ID: T-ML-003
Title: Verify prediction explanation
Priority: High

Steps:
1. Submit prediction
2. View risk factors explanation

Expected:
- Risk factors listed
- Positive factors shown (green)
- Negative factors shown (red)
- Feature importance displayed
- Clear explanation

Pass/Fail: ___
```

### Test Suite 14: ML API Integration

#### Test Case 14.1: ML API Health Check
```
Test ID: T-ML-API-001
Title: Verify ML API is running
Priority: Critical

Steps:
Terminal: curl http://localhost:5001/health

Expected Response:
{
  "status": "healthy",
  "model_loaded": true,
  "version": "1.0.0"
}

Pass/Fail: ___
```

#### Test Case 14.2: Prediction API Call
```
Test ID: T-ML-API-002
Title: Test direct ML API prediction
Priority: High

Steps:
Terminal: 
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{
    "price": 1299,
    "category": "Electronics",
    ...
  }'

Expected:
- Returns prediction object
- Includes probability
- Includes risk_level
- Status 200 OK

Pass/Fail: ___
```

---

## 🔐 Security Testing

### Test Suite 15: Authentication & Authorization

#### Test Case 15.1: Protected Routes
```
Test ID: T-SEC-001
Title: Cannot access protected routes without login
Priority: Critical

Steps:
1. Clear browser data/logout
2. Try to access /cart (without token)
3. Try to access /profile (without token)

Expected:
- Redirected to /login
- Cannot access protected content
- Error message shown

Pass/Fail: ___
```

#### Test Case 15.2: Admin-Only Routes
```
Test ID: T-SEC-002
Title: Regular user cannot access admin routes
Priority: Critical

Steps:
1. Login as regular user
2. Try to access /admin/dashboard
3. Try to access /admin/products

Expected:
- Access denied
- Redirected to home or error page
- Cannot see admin content

Pass/Fail: ___
```

#### Test Case 15.3: JWT Token Validation
```
Test ID: T-SEC-003
Title: Invalid JWT tokens rejected
Priority: High

Steps:
1. Login and get token
2. Modify token (change characters)
3. Try API call with modified token

Expected:
- Request rejected
- Error: "Unauthorized"
- Token refresh not possible

Pass/Fail: ___
```

### Test Suite 16: Data Validation

#### Test Case 16.1: SQL Injection Prevention
```
Test ID: T-SEC-004
Title: SQL injection attempts blocked
Priority: High

Steps:
1. Search bar: '); DROP TABLE users; --
2. Product filter: 1' OR '1'='1

Expected:
- Treated as literal search
- No injection executed
- Safe handling

Pass/Fail: ___
```

#### Test Case 16.2: XSS Prevention
```
Test ID: T-SEC-005
Title: Cross-site scripting prevented
Priority: High

Steps:
1. Product review: <script>alert('xss')</script>
2. Submit review

Expected:
- Script not executed
- Rendered as text
- Tags escaped

Pass/Fail: ___
```

---

## 📈 Performance Testing

### Test Suite 17: Load & Response Times

#### Test Case 17.1: Page Load Performance
```
Test ID: T-PERF-001
Title: Measure page load times
Priority: Medium

Measurements:
- Landing Page: < 2 seconds ___
- Products Page: < 2 seconds ___
- Product Detail: < 2 seconds ___
- Checkout: < 2 seconds ___
- Dashboard: < 2 seconds ___

Expected: All < 3 seconds (acceptable), < 2 ideal

Pass/Fail: ___
```

#### Test Case 17.2: API Response Times
```
Test ID: T-PERF-002
Title: Measure API response times
Priority: Medium

Endpoints:
- GET /products: < 500ms ___
- GET /orders: < 500ms ___
- POST /predict: < 2000ms ___
- POST /orders: < 1000ms ___

Pass/Fail: ___
```

#### Test Case 17.3: Database Query Performance
```
Test ID: T-PERF-003
Title: Monitor database query times
Priority: Medium

Queries:
- Get user orders: < 100ms ___
- Get products list: < 200ms ___
- Get analytics: < 500ms ___

MongoDB slow query log:
Check if any queries > 1000ms

Pass/Fail: ___
```

### Test Suite 18: Scalability Tests

#### Test Case 18.1: Concurrent Predictions
```
Test ID: T-SCALE-001
Title: Handle multiple predictions simultaneously
Priority: Medium

Steps:
1. Send 10 concurrent prediction requests
2. Monitor response times & errors

Expected:
- All complete successfully
- Response time stable
- No queue buildup
- ML API handles load

Pass/Fail: ___
```

---

## 🐛 Error Handling Testing

### Test Suite 19: Error Scenarios

#### Test Case 19.1: Empty Cart Checkout
```
Test ID: T-ERROR-001
Title: Cannot checkout with empty cart
Priority: Medium

Steps:
1. Clear cart completely
2. Try to go to checkout

Expected:
- Error message: "Cart is empty"
- Redirected to products
- Helpful error message

Pass/Fail: ___
```

#### Test Case 19.2: Out of Stock Handling
```
Test ID: T-ERROR-002
Title: Handle out of stock products
Priority: High

Steps:
1. Find out-of-stock product
2. Try to add to cart

Expected:
- Error message shown
- Button disabled
- Cannot add to cart
- "Out of Stock" badge shown

Pass/Fail: ___
```

#### Test Case 19.3: Payment Failure
```
Test ID: T-ERROR-003
Title: Handle payment failures gracefully
Priority: High

Steps:
1. Checkout with failed payment
2. Observe error handling

Expected:
- Clear error message
- Option to retry
- Order not created
- Cart items retained

Pass/Fail: ___
```

#### Test Case 19.4: Network Timeout
```
Test ID: T-ERROR-004
Title: Handle network timeouts
Priority: Medium

Steps:
1. Simulate slow network
2. Try to load products
3. Observe timeout handling

Expected:
- Loading spinner shown
- Timeout message after N seconds
- Retry button available
- Graceful degradation

Pass/Fail: ___
```

---

## 📱 Browser & Device Compatibility

### Test Suite 20: Cross-Browser Testing

#### Desktop Browsers
```
Chrome (Latest)        - Pass/Fail: ___
Firefox (Latest)       - Pass/Fail: ___
Safari (Latest)        - Pass/Fail: ___
Edge (Latest)          - Pass/Fail: ___

Compatibility Issues: ___________
```

#### Mobile Devices
```
iPhone 12 (Safari)     - Pass/Fail: ___
Samsung Galaxy (Chrome) - Pass/Fail: ___
iPad (Safari)          - Pass/Fail: ___

Mobile Issues: ___________
```

#### Responsive Design
```
Desktop (1920x1080)    - Pass/Fail: ___
Tablet (768x1024)      - Pass/Fail: ___
Mobile (375x667)       - Pass/Fail: ___

Breakpoint Issues: ___________
```

---

## 📊 Test Summary & Results

### Test Execution Summary
```
Total Test Cases: 100+
Passed: ___ / 100+
Failed: ___ / 100+
Blocked: ___ / 100+
Pass Rate: ___%

Critical Issues: ___
High Priority Issues: ___
Medium Priority Issues: ___

Test Coverage: ___%
```

### Issues Identified

#### Critical Issues
```
1. ___________
   Severity: Critical
   Steps to Reproduce: ___________
   Expected vs Actual: ___________
   Workaround: ___________
```

#### High Priority Issues
```
1. ___________
2. ___________
```

#### Medium Priority Issues
```
1. ___________
2. ___________
```

### Sign-Off

```
QA Engineer: _______________
Date: _______________
Approved for Release: [ ] Yes [ ] No

Remaining Issues Tracked: ___________
Defect ID(s): ___________
Next Steps: ___________
```

---

**Test Plan Version**: 1.0.0  
**Last Updated**: September 2026  
**Next Review**: After first round of testing

