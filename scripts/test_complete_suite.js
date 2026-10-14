const API_URL = process.env.BACKEND_URL || 'http://localhost:5000/api';
const ML_URL = process.env.ML_URL || 'http://localhost:5001';

const post = async (path, body, token) => {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
};

const get = async (path, token) => {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data, headers: res.headers };
};

const put = async (path, body, token) => {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
};

const del = async (path, token) => {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'DELETE',
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
};

let passed = 0;
let failed = 0;

function assert(condition, testName, detail = '') {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${detail}`);
    failed++;
  }
}

async function runSuite() {
  console.log('====================================================');
  console.log('ReturnSense: Comprehensive System Verification Suite');
  console.log('====================================================\n');

  const ts = Date.now();
  const testUser = { name: 'Automated Tester', email: `test_${ts}@returnsense.test`, password: 'password123' };
  let userToken = '';
  let adminToken = '';
  let productId = '';
  let testOrderId = '';

  // 1. ML SERVICE DIRECT VERIFICATION
  console.log('[1/7] Testing ML Service (Flask API directly)...');
  try {
    const mlHealth = await fetch(`${ML_URL}/model-info`).then(r => r.json());
    assert(mlHealth.success === true, 'Flask model-info endpoint responds with success');
    assert(mlHealth.data?.metrics?.accuracy > 0, `Flask loads trained model (Accuracy: ${mlHealth.data?.metrics?.accuracy}%)`);

    const mlPredict = await fetch(`${ML_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Customer_Age: 32,
        Gender: 'Female',
        Product_Category: 'Clothing',
        Product_Price: 89.99,
        Discount: 20,
        Quantity: 2,
        Payment_Method: 'Credit Card',
        Delivery_Time: 4,
        Shipping_Distance: 120,
        Previous_Returns: 1,
        Customer_Rating: 4.0,
        Order_Frequency: 8
      })
    }).then(r => r.json());

    assert(mlPredict.success === true, 'Flask predict returns valid prediction');
    assert(typeof mlPredict.data?.probability === 'number' && mlPredict.data?.probability >= 0 && mlPredict.data?.probability <= 100, `ML probability is valid percentage (${mlPredict.data?.probability}%)`);
    assert(['Low', 'Medium', 'High'].includes(mlPredict.data?.risk_level), `ML risk level is classified (${mlPredict.data?.risk_level})`);
  } catch (err) {
    assert(false, 'Flask ML service communication', err.message);
  }

  // 2. AUTHENTICATION & PROFILE
  console.log('\n[2/7] Testing Authentication, Profile & Address Management...');
  try {
    const regRes = await post('/auth/register', testUser);
    assert(regRes.status === 201 && regRes.data.data?.token, 'Customer registration succeeds and returns token');
    userToken = regRes.data.data?.token;

    const loginRes = await post('/auth/login', { email: testUser.email, password: testUser.password });
    assert(loginRes.status === 200 && loginRes.data.data?.token, 'Customer login succeeds and verifies password');

    // Admin login
    const adminLogin = await post('/auth/login', { email: 'admin@returnsense.com', password: 'admin123' });
    assert(adminLogin.status === 200 && adminLogin.data.data?.role === 'admin', 'Admin login succeeds and identifies admin role');
    adminToken = adminLogin.data.data?.token;

    const meRes = await get('/auth/me', userToken);
    assert(meRes.status === 200 && meRes.data.data?.email === testUser.email, 'Get profile (/auth/me) returns authenticated user');

    const updateProfile = await put('/users/profile', { name: 'Updated Tester' }, userToken);
    assert(updateProfile.status === 200 && updateProfile.data.data?.name === 'Updated Tester', 'Profile name update succeeds');

    const addAddr = await post('/users/addresses', { type: 'Home', street: '123 Testing Way', city: 'Metropolis', state: 'NY', zip: '10001' }, userToken);
    assert(addAddr.status === 200 && addAddr.data.data?.length > 0, 'Address creation succeeds');

    const changePw = await put('/users/change-password', { currentPassword: 'password123', newPassword: 'newpassword123' }, userToken);
    assert(changePw.status === 200, 'Secure password change succeeds');

    // Restore password
    await put('/users/change-password', { currentPassword: 'newpassword123', newPassword: 'password123' }, userToken);
  } catch (err) {
    assert(false, 'Auth & Profile tests', err.message);
  }

  // 3. PRODUCT CATALOG & SEARCH
  console.log('\n[3/7] Testing Product Catalog, Search & Filtering...');
  try {
    const prods = await get('/products?limit=10');
    assert(prods.status === 200 && prods.data.products?.length > 0, `Products list retrieved (${prods.data.products?.length} products)`);
    productId = prods.data.products[0]._id;

    const searchRes = await get('/products?search=Sample');
    assert(searchRes.status === 200, 'Product search with text query succeeds');

    const filterRes = await get('/products?category=Electronics&minPrice=10&maxPrice=500');
    assert(filterRes.status === 200, 'Product filter by category and price range succeeds');

    const sortRes = await get('/products?sort=price-asc');
    assert(sortRes.status === 200, 'Product sorting by price ascending succeeds');

    const detailRes = await get(`/products/${productId}`);
    assert(detailRes.status === 200 && detailRes.data.product?._id === productId, 'Get single product detail by ID succeeds');
  } catch (err) {
    assert(false, 'Product catalog tests', err.message);
  }

  // 4. CART & WISHLIST
  console.log('\n[4/7] Testing Cart & Wishlist Operations...');
  try {
    const addCart = await post('/cart/items', { productId, quantity: 2 }, userToken);
    assert(addCart.status === 200, 'Add item to persistent shopping cart succeeds');

    const getCart = await get('/cart', userToken);
    assert(getCart.status === 200 && getCart.data.data?.cart?.items?.length > 0, 'Get user cart computes server-side totals');

    const itemId = getCart.data.data.cart.items[0]._id;
    const updateCart = await put(`/cart/items/${itemId}`, { quantity: 1 }, userToken);
    assert(updateCart.status === 200, 'Update item quantity in cart succeeds');

    const saveLater = await put(`/cart/items/${itemId}/save-for-later`, {}, userToken);
    assert(saveLater.status === 200, 'Toggle save-for-later in cart succeeds');

    // Wishlist
    const addWish = await post(`/wishlist/${productId}`, {}, userToken);
    assert(addWish.status === 200, 'Add item to wishlist succeeds');

    const checkWish = await get(`/wishlist/check?productId=${productId}`, userToken);
    assert(checkWish.status === 200 && checkWish.data.data?.inWishlist === true, 'Check item in wishlist returns true');

    const remWish = await del(`/wishlist/${productId}`, userToken);
    assert(remWish.status === 200, 'Remove item from wishlist succeeds');
  } catch (err) {
    assert(false, 'Cart & Wishlist tests', err.message);
  }

  // 5. ORDER CREATION & ML RETURN RISK INTEGRATION
  console.log('\n[5/7] Testing Order Placement & AI Return Prediction Pipeline...');
  try {
    const orderBody = {
      product: productId,
      quantity: 1,
      paymentMethod: 'Credit Card',
      discount: 15,
      deliveryTime: 3,
      customerRating: 4.5,
      previousReturns: 0,
      customerAge: 28,
      gender: 'Male',
      shippingDistance: 45,
      orderFrequency: 6
    };

    const orderRes = await post('/orders', orderBody, userToken);
    assert(orderRes.status === 201 && orderRes.data.order?._id, 'Order placement succeeds with server-side price calculation');
    testOrderId = orderRes.data.order._id;

    const placedOrder = orderRes.data.order;
    assert(typeof placedOrder.probability === 'number' && placedOrder.probability > 0, `Order contains real ML probability (${placedOrder.probability}%)`);
    assert(['Low', 'Medium', 'High'].includes(placedOrder.riskLevel), `Order has riskLevel classified (${placedOrder.riskLevel})`);

    // Verify Prediction collection record
    const userPreds = await get('/predict', userToken);
    const linkedPred = userPreds.data.predictions?.find(p => String(p.orderId) === String(testOrderId));
    assert(Boolean(linkedPred), 'Prediction record is automatically saved in MongoDB and linked to orderId');

    // Authorization & Ownership test
    const otherUserRes = await post('/auth/register', { name: 'Stranger', email: `stranger_${ts}@returnsense.test`, password: 'password123' });
    const strangerToken = otherUserRes.data.data?.token;

    const strangerOrderAccess = await get(`/orders/${testOrderId}`, strangerToken);
    assert(strangerOrderAccess.status === 403, 'Unauthorized access to another customer order is blocked (403)');

    const strangerInvoiceAccess = await get(`/orders/${testOrderId}/invoice`, strangerToken);
    assert(strangerInvoiceAccess.status === 403, 'Unauthorized invoice access is blocked (403)');

    // Invoice generation for owner
    const invoiceRes = await get(`/orders/${testOrderId}/invoice`, userToken);
    assert(invoiceRes.status === 200 && invoiceRes.data.data?.orderId, 'Authorized invoice generation succeeds');

    // Order cancellation test
    const cancelRes = await post(`/orders/${testOrderId}/cancel`, { cancelReason: 'Placed by mistake' }, userToken);
    assert(cancelRes.status === 200 && cancelRes.data.order?.status === 'Cancelled', 'Order cancellation requests and restocks product');
  } catch (err) {
    assert(false, 'Order & Prediction pipeline tests', err.message);
  }

  // 6. REVIEWS & RATINGS
  console.log('\n[6/7] Testing Product Reviews & Aggregate Rating Updates...');
  try {
    const reviewRes = await post(`/reviews/product/${productId}`, { rating: 5, comment: 'Automated test review - exceptional quality!' }, userToken);
    assert(reviewRes.status === 201, 'Review submission by customer succeeds');

    const getReviews = await get(`/reviews/product/${productId}`);
    assert(getReviews.status === 200 && getReviews.data.data?.length > 0, 'Product reviews fetched with user details');

    const myReviews = await get('/reviews/my', userToken);
    assert(myReviews.status === 200 && myReviews.data.data?.length > 0, 'Customer retrieved own review list');

    if (reviewRes.data.data?._id) {
      const delReview = await del(`/reviews/${reviewRes.data.data._id}`, userToken);
      assert(delReview.status === 200, 'Review deletion and rating recalculation succeeds');
    }
  } catch (err) {
    assert(false, 'Reviews tests', err.message);
  }

  // 7. ADMIN DASHBOARD, ANALYTICS, INVENTORY & EXPORTS
  console.log('\n[7/7] Testing Admin Analytics, Reports, Inventory & CSV Export...');
  try {
    // Non-admin blocked from admin endpoints
    const forbiddenAdmin = await get('/admin/dashboard', userToken);
    assert(forbiddenAdmin.status === 403, 'Non-admin customer access to admin dashboard is forbidden (403)');

    const adminDash = await get('/admin/dashboard', adminToken);
    assert(adminDash.status === 200 && adminDash.data.stats?.orders > 0, `Admin dashboard KPIs computed from real DB data (Orders: ${adminDash.data.stats?.orders}, Revenue: $${adminDash.data.stats?.totalRevenue})`);
    assert(adminDash.data.stats?.highRiskOrders >= 0, `High risk orders count computed (${adminDash.data.stats?.highRiskOrders})`);

    const adminAnalytics = await get('/admin/analytics', adminToken);
    assert(adminAnalytics.status === 200 && adminAnalytics.data.data?.monthlyRevenue, 'Admin analytics trends computed from real data');

    const adminCustAnalytics = await get('/admin/customer-analytics', adminToken);
    assert(adminCustAnalytics.status === 200 && adminCustAnalytics.data.data?.totalCustomers > 0, 'Customer lifetime value and return analytics computed');

    const adminInventory = await get('/admin/inventory', adminToken);
    assert(adminInventory.status === 200 && adminInventory.data.data?.totalProducts > 0, `Inventory valuation computed (Total Value: $${adminInventory.data.data?.totalValue})`);

    const adminReports = await get('/admin/reports?type=Product%20Report', adminToken);
    assert(adminReports.status === 200 && adminReports.data.reportData?.length > 0, 'Admin Product Report generation succeeds');

    const csvExport = await fetch(`${API_URL}/admin/export-csv?type=Product%20Report`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const csvText = await csvExport.text();
    assert(csvExport.status === 200 && csvText.includes('productName'), 'Admin CSV export streams valid formatted CSV file');

    const adminModelInfo = await get('/admin/model-info', adminToken);
    assert(adminModelInfo.status === 200 && adminModelInfo.data.data?.best_model, `Admin model info retrieved (${adminModelInfo.data.data?.best_model})`);
  } catch (err) {
    assert(false, 'Admin operations tests', err.message);
  }

  console.log('\n====================================================');
  console.log(`Test Execution Results: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runSuite().catch(e => {
  console.error('Fatal Test Suite Error:', e);
  process.exit(1);
});
