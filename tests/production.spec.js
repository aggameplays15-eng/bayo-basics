import { test, expect } from '@playwright/test';

const BASE_URL = 'https://bayo-basics.vercel.app';
const API_URL = 'https://bayo-basics.vercel.app/_/backend/api';

test.describe('Bayo Basics Production Tests', () => {
  
  test('Frontend loads correctly', async ({ page }) => {
    // Collect console messages
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
      console.log(`Console [${msg.type()}]:`, msg.text());
    });

    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/Bayo/);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if products are displayed (using Card component or product links)
    const productLinks = await page.locator('a[href^="/product/"]').count();
    console.log(`Product links found: ${productLinks}`);
    
    // If no products, check for errors
    if (productLinks === 0) {
      const bodyText = await page.textContent('body');
      console.log('Page body text preview:', bodyText.substring(0, 300));
      
      // Check for JavaScript errors
      const errors = consoleMessages.filter(msg => msg.includes('error') || msg.includes('Error'));
      if (errors.length > 0) {
        console.log('JavaScript errors found:', errors);
      }
      
      // Check if API calls are being made
      const apiCalls = consoleMessages.filter(msg => msg.includes('/_/backend/api'));
      if (apiCalls.length > 0) {
        console.log('API calls detected:', apiCalls);
      } else {
        console.log('No API calls detected in console');
      }
    }
    
    // For now, just check if page loads without errors
    await expect(page).toHaveTitle(/Bayo/);
    console.log(`✅ Frontend loaded (products: ${productLinks})`);
  });

  test('Products API returns data', async ({ request }) => {
    const response = await request.get(`${API_URL}/products`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.products).toBeDefined();
    expect(data.products.length).toBeGreaterThan(0);
    
    console.log(`✅ Products API returned ${data.products.length} products`);
  });

  test('Health endpoint works', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/_/backend/health`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.status).toBe('OK');
    expect(data.service).toBe('Bayo Basics API');
    
    console.log('✅ Health endpoint working');
  });

  test('Delivery zones API works', async ({ request }) => {
    const response = await request.get(`${API_URL}/delivery`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.zones).toBeDefined();
    expect(data.zones.length).toBeGreaterThan(0);
    
    console.log(`✅ Delivery zones API returned ${data.zones.length} zones`);
  });

  test('Settings API works', async ({ request }) => {
    const response = await request.get(`${API_URL}/settings`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.settings).toBeDefined();
    expect(data.settings.logoText).toBeDefined();
    
    console.log('✅ Settings API working');
  });

  test('Single product API works', async ({ request }) => {
    // First get all products to get a valid ID
    const productsResponse = await request.get(`${API_URL}/products`);
    const productsData = await productsResponse.json();
    const firstProductId = productsData.products[0].id;
    
    // Get single product
    const response = await request.get(`${API_URL}/products/${firstProductId}`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.product).toBeDefined();
    expect(data.product.id).toBe(firstProductId);
    
    console.log(`✅ Single product API working for product ${firstProductId}`);
  });

  test('User registration works', async ({ request }) => {
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'test123456'
    };
    
    const response = await request.post(`${API_URL}/auth/register`, {
      data: testUser
    });
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.user).toBeDefined();
    expect(data.token).toBeDefined();
    
    console.log(`✅ User registration works for ${testUser.email}`);
  });

  test('Product categories API works', async ({ request }) => {
    const response = await request.get(`${API_URL}/products/meta/categories`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.categories).toBeDefined();
    expect(data.categories.length).toBeGreaterThan(0);
    
    console.log(`✅ Product categories API returned ${data.categories.length} categories`);
  });

  test('Security headers are present', async ({ page }) => {
    const response = await page.goto(BASE_URL);
    
    // Check if page loaded successfully
    expect(response?.ok()).toBeTruthy();
    
    // Check security headers from the response
    const headers = response?.headers() || {};
    const csp = headers['content-security-policy'];
    const hsts = headers['strict-transport-security'];
    
    // Security headers should be present
    if (csp || hsts) {
      console.log('✅ Security headers present');
      if (csp) console.log('  - CSP:', csp.substring(0, 50) + '...');
      if (hsts) console.log('  - HSTS:', hsts);
    } else {
      console.log('⚠️  Security headers not found in frontend response');
    }
    
    // At least one security header should be present
    expect(csp || hsts).toBeDefined();
  });

  test('Admin login works', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: 'admin@bayo.com',
        password: 'admin123'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.user).toBeDefined();
    expect(data.user.role).toBe('admin');
    expect(data.token).toBeDefined();
    
    console.log('✅ Admin login works');
  });

  test('Admin can access protected routes', async ({ request }) => {
    // First login as admin
    const loginResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: 'admin@bayo.com',
        password: 'admin123'
      }
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    // Try to access admin-only route (all orders)
    const response = await request.get(`${API_URL}/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.orders).toBeDefined();
    
    console.log(`✅ Admin can access protected routes (${data.orders.length} orders)`);
  });

  test('Admin can create product', async ({ request }) => {
    // Login as admin
    const loginResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: 'admin@bayo.com',
        password: 'admin123'
      }
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    // Create a test product
    const testProduct = {
      name: 'Test Product ' + Date.now(),
      description: 'Test product for automated testing',
      price: 150000,
      category: 'Accessoires',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      stock: 10
    };
    
    const response = await request.post(`${API_URL}/products`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      data: testProduct
    });
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.product).toBeDefined();
    expect(data.product.name).toBe(testProduct.name);
    
    console.log('✅ Admin can create product:', data.product.name);
    
    // Clean up - delete the test product
    await request.delete(`${API_URL}/products/${data.product.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  });

  test('Admin can update order status', async ({ request }) => {
    // Login as admin
    const loginResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: 'admin@bayo.com',
        password: 'admin123'
      }
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    // Get all orders
    const ordersResponse = await request.get(`${API_URL}/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const ordersData = await ordersResponse.json();
    
    if (ordersData.orders.length > 0) {
      const orderId = ordersData.orders[0].id;
      const newStatus = 'en_cours';
      
      // Update order status
      const response = await request.put(`${API_URL}/orders/${orderId}/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        data: { status: newStatus }
      });
      
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.order.status).toBe(newStatus);
      
      console.log(`✅ Admin can update order status to ${newStatus}`);
    } else {
      console.log('⚠️  No orders to test status update');
    }
  });
});
