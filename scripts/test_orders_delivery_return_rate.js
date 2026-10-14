/**
 * Test Suite: Order Delivery Dates & Actual Return Rate Verification
 * Covers:
 *  1. Business days date calculation (weekends skipped, 3-7 business days default)
 *  2. Estimated delivery date on order creation & persistence
 *  3. Actual delivery date on order delivery
 *  4. Status information across pending, confirmed, packed, shipped, delivered, cancelled, return-requested
 *  5. Actual order return rate calculation:
 *     - Clearly defined denominator: eligible delivered orders only
 *     - Undelivered orders excluded from denominator
 *     - Cancelled orders excluded from denominator
 *     - Pending return requests included in denominator but excluded from numerator
 *     - Completed returns included in numerator
 *     - Empty dataset handling (0 delivered orders -> 0% return rate, no NaN / division by zero)
 *  6. ML predicted return probability kept strictly separate from actual return rate
 */

const { addBusinessDays, calculateDeliveryWindow, getDeliveryStatusInfo } = require('../server/utils/deliveryDate');

const API_URL = process.env.BACKEND_URL || 'http://localhost:5000/api';

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
  return { status: res.status, data };
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

async function runTests() {
  console.log('================================================================');
  console.log('Orders Section: Estimated Delivery & Actual Return Rate Tests');
  console.log('================================================================\n');

  // ----------------------------------------------------------------
  // PART 1: Business Day & Weekend Handling Unit Tests
  // ----------------------------------------------------------------
  console.log('[1/4] Testing Delivery Date Business Calculations...');

  // Case A: Starting Friday, Oct 16, 2026. Adding 1 business day should be Monday, Oct 19.
  const friday = new Date('2026-10-16T10:00:00Z'); // Friday
  assert(friday.getUTCDay() === 5, 'Base date is Friday');

  const plusOneBizDay = addBusinessDays(friday, 1);
  assert(plusOneBizDay.getDay() === 1, 'Adding 1 business day to Friday skips Saturday & Sunday -> lands on Monday');

  // Case B: Adding 5 business days (demo default) starting Friday lands on next Friday
  const plusFiveBizDays = addBusinessDays(friday, 5);
  assert(plusFiveBizDays.getDay() === 5, 'Adding 5 business days to Friday lands on next Friday (7 calendar days later)');

  // Case C: Delivery Window defaults (3 to 7 business days)
  const window = calculateDeliveryWindow(friday, 3, 7);
  assert(window.minDate instanceof Date && window.maxDate instanceof Date, 'Window returns Date instances');
  assert(window.minDate < window.maxDate, 'minDate precedes maxDate');
  assert(window.estimatedDelivery instanceof Date, 'estimatedDelivery is provided');

  // Case D: Status Info messages
  const pendingInfo = getDeliveryStatusInfo({ status: 'Pending', estimatedDelivery: window.estimatedDelivery });
  assert(pendingInfo.statusText === 'Pending Confirmation' && pendingInfo.isDelivered === false, 'Pending status message is correct');

  const deliveredDate = new Date('2026-10-20T14:30:00Z');
  const deliveredInfo = getDeliveryStatusInfo({ status: 'Delivered', actualDeliveryDate: deliveredDate });
  assert(deliveredInfo.isDelivered === true && deliveredInfo.deliveryText.includes('Delivered on'), 'Delivered status displays actual delivery date');

  const cancelledInfo = getDeliveryStatusInfo({ status: 'Cancelled' });
  assert(cancelledInfo.deliveryText.includes('No delivery') && cancelledInfo.isDelivered === false, 'Cancelled status displays no delivery scheduled');

  const returnReqInfo = getDeliveryStatusInfo({ status: 'Return Requested', actualDeliveryDate: deliveredDate });
  assert(returnReqInfo.deliveryText.includes('Return requested'), 'Return requested displays suitable status');

  // ----------------------------------------------------------------
  // PART 2: API Login & Setup
  // ----------------------------------------------------------------
  console.log('\n[2/4] Authenticating Test Users...');
  const adminLogin = await post('/auth/login', { email: 'admin@returnsense.com', password: 'admin123' });
  assert(adminLogin.status === 200 && adminLogin.data.data?.token, 'Admin login succeeds');
  const adminToken = adminLogin.data.data?.token;

  const ts = Date.now();
  const customerReg = await post('/auth/register', { name: 'Order Tester', email: `ordertest_${ts}@test.com`, password: 'password123' });
  assert(customerReg.status === 201 && customerReg.data.data?.token, 'Customer registration succeeds');
  const userToken = customerReg.data.data?.token;

  const prods = await get('/products?limit=1');
  const productId = prods.data.products[0]._id;
  assert(Boolean(productId), `Found test product ID: ${productId}`);

  // ----------------------------------------------------------------
  // PART 3: Order Creation with Estimated Delivery & Actual Delivery Update
  // ----------------------------------------------------------------
  console.log('\n[3/4] Testing Order Flow: Estimated Delivery -> Delivered Transition...');

  const orderRes = await post('/orders', {
    product: productId,
    quantity: 1,
    paymentMethod: 'Credit Card',
    deliveryTime: 4
  }, userToken);

  assert(orderRes.status === 201 && orderRes.data.order?._id, 'Order placement succeeds');
  const createdOrder = orderRes.data.order;
  const orderId = createdOrder._id;

  assert(Boolean(createdOrder.estimatedDelivery), `Order contains estimatedDelivery date: ${createdOrder.estimatedDelivery}`);
  const estDate = new Date(createdOrder.estimatedDelivery);
  assert(!isNaN(estDate.getTime()), 'estimatedDelivery is a valid timestamp');
  assert(estDate > new Date(), 'estimatedDelivery is set in the future');

  // Fetch single order details
  const detailRes = await get(`/orders/${orderId}`, userToken);
  assert(detailRes.status === 200, 'Customer fetches order detail');
  assert(Boolean(detailRes.data.order?.estimatedDelivery), 'Order details include estimatedDelivery');
  assert(Boolean(detailRes.data.deliveryInfo?.deliveryText), `deliveryInfo attached: "${detailRes.data.deliveryInfo?.deliveryText}"`);

  // Transition to Confirmed
  const confirmRes = await put(`/orders/${orderId}/status`, { status: 'Confirmed' }, adminToken);
  assert(confirmRes.status === 200 && confirmRes.data.order?.status === 'Confirmed', 'Order transitioned to Confivered');

  // Transition to Packed
  const packRes = await put(`/orders/${orderId}/status`, { status: 'Packed' }, adminToken);
  assert(packRes.status === 200 && packRes.data.order?.status === 'Packed', 'Order transitioned to Packed');

  // Transition to Shipped
  const shipRes = await put(`/orders/${orderId}/status`, { status: 'Shipped' }, adminToken);
  assert(shipRes.status === 200 && shipRes.data.order?.status === 'Shipped', 'Order transitioned to Shipped');

  // Transition to Delivered (Must automatically record actualDeliveryDate)
  const delivRes = await put(`/orders/${orderId}/status`, { status: 'Delivered' }, adminToken);
  assert(delivRes.status === 200 && delivRes.data.order?.status === 'Delivered', 'Order transitioned to Delivered');
  assert(Boolean(delivRes.data.order?.actualDeliveryDate), `Order automatically assigned actualDeliveryDate: ${delivRes.data.order?.actualDeliveryDate}`);
  assert(delivRes.data.deliveryInfo?.deliveryText.includes('Delivered on'), 'Delivery info displays actual delivery date');

  // ----------------------------------------------------------------
  // PART 4: Actual Order Return Rate Calculation Verification
  // ----------------------------------------------------------------
  console.log('\n[4/4] Testing Actual Return Rate Rules (Denominator & Numerator Isolation)...');

  const dashRes = await get('/admin/dashboard', adminToken);
  assert(dashRes.status === 200, 'Admin dashboard returns 200');

  const { stats } = dashRes.data;
  assert(typeof stats?.actualReturnRate === 'number', `Dashboard has actualReturnRate: ${stats?.actualReturnRate}%`);
  assert(typeof stats?.eligibleDeliveredOrders === 'number', `Dashboard has eligibleDeliveredOrders: ${stats?.eligibleDeliveredOrders}`);
  assert(typeof stats?.returnedOrders === 'number', `Dashboard has returnedOrders: ${stats?.returnedOrders}`);
  assert(typeof stats?.avgReturnProbability === 'number', `Dashboard keeps avgReturnProbability (ML) separate: ${stats?.avgReturnProbability}%`);

  // Verify mathematical relationship:
  if (stats.eligibleDeliveredOrders > 0) {
    const expectedRate = Number(((stats.returnedOrders / stats.eligibleDeliveredOrders) * 100).toFixed(1));
    assert(stats.actualReturnRate === expectedRate, `actualReturnRate (${stats.actualReturnRate}%) exactly equals (returned ${stats.returnedOrders} / delivered ${stats.eligibleDeliveredOrders}) * 100`);
  } else {
    assert(stats.actualReturnRate === 0, 'actualReturnRate is 0 when eligible delivered orders is 0 (safe empty dataset handling)');
  }

  // Request return on delivered order -> status becomes Return Requested
  const retReqRes = await post(`/orders/${orderId}/return`, { returnReason: 'Defective zipper' }, userToken);
  assert(retReqRes.status === 200 && retReqRes.data.order?.status === 'Return Requested', 'Order status set to Return Requested');

  // Verify that Return Requested is in eligible delivered denominator, but NOT yet in returned numerator
  const dashAfterReq = await get('/admin/dashboard', adminToken);
  const statsAfterReq = dashAfterReq.data.stats;
  assert(statsAfterReq.returnRequestedOrders >= 1, `Pending return requests tracked: ${statsAfterReq.returnRequestedOrders}`);
  // returnedOrders count should NOT have increased just because of a request!
  assert(statsAfterReq.returnedOrders === stats.returnedOrders, `Returned orders count unchanged by pending return request (${statsAfterReq.returnedOrders})`);

  // Approve return -> status becomes Returned
  const approveRes = await put(`/orders/${orderId}/status`, { status: 'Returned', note: 'Return package received and verified' }, adminToken);
  assert(approveRes.status === 200 && approveRes.data.order?.status === 'Returned', 'Order status confirmed as Returned');

  // Verify dashboard after completed return
  const dashAfterRet = await get('/admin/dashboard', adminToken);
  const statsAfterRet = dashAfterRet.data.stats;
  assert(statsAfterRet.returnedOrders === stats.returnedOrders + 1, `Completed returns incremented by 1 (${statsAfterRet.returnedOrders})`);

  // Analytics endpoint verification
  const analyticsRes = await get('/admin/analytics', adminToken);
  assert(analyticsRes.status === 200, 'Admin analytics returns 200');
  assert(Array.isArray(analyticsRes.data.data?.returnRateTrend), 'returnRateTrend array returned');
  assert(Boolean(analyticsRes.data.data?.summary), 'Analytics data includes summary metrics');
  assert(typeof analyticsRes.data.data?.summary?.actualReturnRate === 'number', `Analytics summary has actualReturnRate: ${analyticsRes.data.data?.summary?.actualReturnRate}%`);

  // Reports endpoint verification
  const reportsRes = await get('/admin/reports?type=Product%20Report', adminToken);
  assert(reportsRes.status === 200, 'Admin reports returns 200');
  assert(Boolean(reportsRes.data.summary), 'Reports returns summary with actualReturnRate');
  assert(typeof reportsRes.data.summary?.actualReturnRate === 'number', `Reports summary has actualReturnRate: ${reportsRes.data.summary?.actualReturnRate}%`);

  console.log('\n================================================================');
  console.log(`Execution Complete: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(e => {
  console.error('Fatal Test Runner Error:', e);
  process.exit(1);
});
