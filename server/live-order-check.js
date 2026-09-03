const mongoose = require('mongoose');
const Order = require('./models/Order');
const base = 'http://localhost:5000/api';

async function request(path, options = {}, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(base + path, { ...options, headers });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, body };
}

(async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/hunarhub');

  const productRes = await request('/products');
  if (!productRes.ok || !productRes.body.data?.length) throw new Error('No product found');
  const product = productRes.body.data[0];

  const customerLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'samiya@example.com', password: 'password123' })
  });
  if (!customerLogin.ok) throw new Error('Customer login failed');
  const customerToken = customerLogin.body.token;

  const entrepreneurLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'saniya@example.com', password: 'password123' })
  });
  if (!entrepreneurLogin.ok) throw new Error('Entrepreneur login failed');
  const entrepreneurToken = entrepreneurLogin.body.token;

  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@hunarhub.com', password: 'admin1234' })
  });
  if (!adminLogin.ok) throw new Error('Admin login failed');
  const adminToken = adminLogin.body.token;

  const payload = {
    quantity: 1,
    customerDetails: {
      name: 'Samiya Khan',
      phone: '9876543210',
      address: '12 Market Lane',
      city: 'Lahore',
      state: 'Punjab',
      postalCode: '54000'
    }
  };

  const created = await request(`/dashboard/customer/products/${product._id}/orders`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }, customerToken);

  console.log('CREATE_STATUS', created.status);
  console.log(JSON.stringify(created.body, null, 2));
  if (!created.ok) throw new Error(`Order creation failed: ${created.body.message || 'unknown'}`);

  const orderId = created.body.data._id;

  const dbOrder = await Order.findById(orderId).lean();
  console.log('DB_ORDER', JSON.stringify({
    id: dbOrder?._id,
    customer: dbOrder?.customer,
    entrepreneur: dbOrder?.entrepreneur,
    status: dbOrder?.status,
    paymentStatus: dbOrder?.paymentStatus,
    paymentMethod: dbOrder?.paymentMethod,
    totalAmount: dbOrder?.totalAmount,
    customerName: dbOrder?.customerDetails?.name,
    phone: dbOrder?.customerDetails?.phone,
    city: dbOrder?.customerDetails?.city
  }, null, 2));

  const customerOrders = await request('/dashboard/customer/resources', {}, customerToken);
  const entrepreneurOrders = await request('/dashboard/entrepreneur/resources', {}, entrepreneurToken);
  const adminOrders = await request('/dashboard/admin/resources', {}, adminToken);

  console.log('CUSTOMER_ORDERS', customerOrders.body.data.orders.length);
  console.log('ENTREPRENEUR_ORDERS', entrepreneurOrders.body.data.orders.length);
  console.log('ADMIN_ORDERS', adminOrders.body.data.orders.length);

  const update = await request(`/dashboard/entrepreneur/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'confirmed' })
  }, entrepreneurToken);

  console.log('UPDATE_STATUS', update.status);
  console.log(JSON.stringify(update.body, null, 2));

  const finalCustomer = await request('/dashboard/customer/resources', {}, customerToken);
  const order = finalCustomer.body.data.orders.find(o => o._id === orderId);
  console.log('FINAL_ORDER', JSON.stringify({
    id: order?._id,
    status: order?.status,
    paymentStatus: order?.paymentStatus,
    totalAmount: order?.totalAmount,
    customer: order?.customerDetails?.name,
    entrepreneur: order?.entrepreneurName
  }, null, 2));

  if (!dbOrder || dbOrder.paymentStatus !== 'pending') throw new Error('Payment status is not pending');
  if (dbOrder.totalAmount !== 1200) throw new Error(`Unexpected total: ${dbOrder.totalAmount}`);
  if (order?.status !== 'confirmed') throw new Error(`Order status did not update: ${order?.status}`);

  console.log('E2E_CHECK: PASS');
  await mongoose.disconnect();
})();
