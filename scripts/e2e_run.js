const API_ORIGIN = process.env.BACKEND_URL || 'http://localhost:5000';

const jsonPost = async (path, body = {}, token) => {
  const res = await fetch(API_ORIGIN + '/api' + path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return { status: res.status, data };
};

const jsonGet = async (path, token) => {
  const res = await fetch(API_ORIGIN + '/api' + path, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
};

const run = async () => {
  try {
    console.log('Starting E2E run against', API_ORIGIN);
    const timestamp = Date.now();
    const testEmail = `e2e_user_${timestamp}@example.com`;
    const password = 'password123';

    console.log('Registering user', testEmail);
    const reg = await jsonPost('/auth/register', { name: 'E2E Tester', email: testEmail, password });
    const regData = reg.data?.data ?? reg.data;
    if (!regData?.token) throw new Error('Registration did not return token');
    const token = regData.token;
    console.log('Registered, token acquired');

    console.log('Logging in');
    const login = await jsonPost('/auth/login', { email: testEmail, password });
    const loginData = login.data?.data ?? login.data;
    const loginToken = loginData.token;
    if (!loginToken) throw new Error('Login did not return token');
    console.log('Login successful');

    console.log('Fetching product list');
    const prods = await jsonGet('/products');
    const products = Array.isArray(prods.data?.products) ? prods.data.products : (Array.isArray(prods.data) ? prods.data : []);
    if (!products || products.length === 0) throw new Error('No products available to order');
    const product = products[0];
    console.log('Selected product', product._id || product.id || product.name);

    const orderBody = {
      product: product._id || product.id,
      quantity: 1,
      paymentMethod: 'Credit Card',
      discount: product.discount || 0,
      deliveryTime: 3,
      customerRating: 5,
      previousReturns: 0,
      customerAge: 30,
      gender: 'Male',
      shippingDistance: 50,
      orderFrequency: 5
    };

    console.log('Placing order');
    const orderRes = await jsonPost('/orders', orderBody, loginToken);
    const order = orderRes.data?.order ?? orderRes.data;
    if (!order || !order._id) throw new Error('Order creation failed');
    console.log('Order created', order._id);

    await new Promise(r => setTimeout(r, 1200));

    console.log('Fetching user predictions');
    const predsRes = await jsonGet('/predict', loginToken);
    const preds = predsRes.data?.predictions ?? predsRes.data?.data ?? predsRes.data ?? [];
    console.log('Predictions found:', Array.isArray(preds) ? preds.length : 'unknown');

    const linked = Array.isArray(preds) ? preds.find(p => String(p.orderId) === String(order._id)) : null;
    if (linked) console.log('Found linked prediction with probability', linked.probability);
    else console.warn('No linked prediction found');

    const fetched = await jsonGet(`/orders/${order._id}`, loginToken);
    const fetchedOrder = fetched.data?.order ?? fetched.data?.data ?? fetched.data;
    console.log('Fetched order probability:', fetchedOrder?.probability);

    // Unauthorized access check
    const otherEmail = `e2e_other_${timestamp}@example.com`;
    await jsonPost('/auth/register', { name: 'Other', email: otherEmail, password: 'password123' });
    const otherLogin = await jsonPost('/auth/login', { email: otherEmail, password: 'password123' });
    const otherToken = otherLogin.data?.data?.token ?? otherLogin.data?.token;
    const invoice = await jsonGet(`/orders/${order._id}/invoice`, otherToken);
    if (invoice.status === 403) console.log('Unauthorized invoice access blocked (403)');
    else console.warn('Unexpected invoice access response', invoice.status);

    console.log('E2E run finished successfully');
  } catch (err) {
    console.error('E2E run error:', err.message || err);
    process.exit(2);
  }
};

if (require.main === module) run();

module.exports = { run };
