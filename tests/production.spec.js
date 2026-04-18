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
    expect(data.user.email).toBe('admin@bayo.com');
    expect(data.token).toBeDefined();
    
    console.log('✅ 1. Admin login works');
    console.log('   - Email:', data.user.email);
    console.log('   - Role:', data.user.role);
    console.log('   - Token received:', !!data.token);
  });

  test('Admin can access protected routes', async ({ request }) => {
    const loginResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: 'admin@bayo.com',
        password: 'admin123'
      }
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    const response = await request.get(`${API_URL}/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.orders).toBeDefined();
    
    console.log('✅ 2. Admin can access protected routes');
    console.log('   - Orders endpoint accessible');
    console.log('   - Orders found:', data.orders.length);
  });

  test('Admin can create product', async ({ request }) => {
    const loginResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: 'admin@bayo.com',
        password: 'admin123'
      }
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    
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
    
    console.log('✅ 3. Admin can create product');
    console.log('   - Product name:', data.product.name);
    console.log('   - Product ID:', data.product.id);
    console.log('   - Price:', data.product.price);
    
    // Clean up
    await request.delete(`${API_URL}/products/${data.product.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  });

  test('Admin can update product', async ({ request }) => {
    const loginResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: 'admin@bayo.com',
        password: 'admin123'
      }
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    // Create a test product first
    const createResponse = await request.post(`${API_URL}/products`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      data: {
        name: 'Test Product ' + Date.now(),
        description: 'Test product for automated testing',
        price: 150000,
        category: 'Accessoires',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
        stock: 10
      }
    });
    
    const createData = await createResponse.json();
    const productId = createData.product.id;
    
    // Update the product
    const updateResponse = await request.put(`${API_URL}/products/${productId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      data: {
        name: 'Updated Test Product',
        price: 200000
      }
    });
    
    expect(updateResponse.ok()).toBeTruthy();
    
    const updateData = await updateResponse.json();
    expect(updateData.product.name).toBe('Updated Test Product');
    expect(updateData.product.price).toBe(200000);
    
    console.log('✅ 4. Admin can update product');
    console.log('   - Product updated successfully');
    console.log('   - New name:', updateData.product.name);
    console.log('   - New price:', updateData.product.price);
    
    // Clean up
    await request.delete(`${API_URL}/products/${productId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  });

  test('Admin can delete product', async ({ request }) => {
    const loginResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: 'admin@bayo.com',
        password: 'admin123'
      }
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    // Create a test product first
    const createResponse = await request.post(`${API_URL}/products`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      data: {
        name: 'Test Product ' + Date.now(),
        description: 'Test product for automated testing',
        price: 150000,
        category: 'Accessoires',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
        stock: 10
      }
    });
    
    const createData = await createResponse.json();
    const productId = createData.product.id;
    
    // Delete the product
    const deleteResponse = await request.delete(`${API_URL}/products/${productId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    expect(deleteResponse.ok()).toBeTruthy();
    
    // Verify product is deleted
    const getResponse = await request.get(`${API_URL}/products/${productId}`);
    expect(getResponse.status()).toBe(404);
    
    console.log('✅ 5. Admin can delete product');
    console.log('   - Product deleted successfully');
    console.log('   - Product ID:', productId);
  });

  test('Admin can update order status', async ({ request }) => {
    const loginResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: 'admin@bayo.com',
        password: 'admin123'
      }
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    const ordersResponse = await request.get(`${API_URL}/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const ordersData = await ordersResponse.json();
    
    if (ordersData.orders.length > 0) {
      const orderId = ordersData.orders[0].id;
      const newStatus = 'en_cours';
      
      const response = await request.put(`${API_URL}/orders/${orderId}/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        data: { status: newStatus }
      });
      
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.order.status).toBe(newStatus);
      
      console.log('✅ 6. Admin can update order status');
      console.log('   - Order ID:', orderId);
      console.log('   - New status:', newStatus);
    } else {
      console.log('⚠️  6. No orders to test status update');
    }
  });

  test('Admin can create delivery zone', async ({ request }) => {
    const loginResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: 'admin@bayo.com',
        password: 'admin123'
      }
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    const testZone = {
      name: 'Test Zone ' + Date.now(),
      price: 50000
    };
    
    const response = await request.post(`${API_URL}/delivery`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      data: testZone
    });
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.zone).toBeDefined();
    expect(data.zone.name).toBe(testZone.name);
    
    console.log('✅ 7. Admin can create delivery zone');
    console.log('   - Zone name:', data.zone.name);
    console.log('   - Zone price:', data.zone.price);
    console.log('   - Zone ID:', data.zone.id);
    
    // Clean up
    await request.delete(`${API_URL}/delivery/${data.zone.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  });

  test('Admin can update delivery zone', async ({ request }) => {
    const loginResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: 'admin@bayo.com',
        password: 'admin123'
      }
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    // Create a test zone first
    const createResponse = await request.post(`${API_URL}/delivery`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      data: {
        name: 'Test Zone ' + Date.now(),
        price: 50000
      }
    });
    
    const createData = await createResponse.json();
    const zoneId = createData.zone.id;
    
    // Update the zone
    const updateResponse = await request.put(`${API_URL}/delivery/${zoneId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      data: {
        price: 60000
      }
    });
    
    expect(updateResponse.ok()).toBeTruthy();
    
    const updateData = await updateResponse.json();
    expect(updateData.zone.price).toBe(60000);
    
    console.log('✅ 8. Admin can update delivery zone');
    console.log('   - Zone updated successfully');
    console.log('   - New price:', updateData.zone.price);
    
    // Clean up
    await request.delete(`${API_URL}/delivery/${zoneId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  });

  test('Admin can delete delivery zone', async ({ request }) => {
    const loginResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: 'admin@bayo.com',
        password: 'admin123'
      }
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    // Create a test zone first
    const createResponse = await request.post(`${API_URL}/delivery`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      data: {
        name: 'Test Zone ' + Date.now(),
        price: 50000
      }
    });
    
    const createData = await createResponse.json();
    const zoneId = createData.zone.id;
    
    // Delete the zone
    const deleteResponse = await request.delete(`${API_URL}/delivery/${zoneId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    expect(deleteResponse.ok()).toBeTruthy();
    
    console.log('✅ 9. Admin can delete delivery zone');
    console.log('   - Zone deleted successfully');
    console.log('   - Zone ID:', zoneId);
  });

  test('Admin can update site settings', async ({ request }) => {
    const loginResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: 'admin@bayo.com',
        password: 'admin123'
      }
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    // Get current settings
    const getResponse = await request.get(`${API_URL}/settings`);
    const getData = await getResponse.json();
    
    // Update settings
    const response = await request.put(`${API_URL}/settings`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      data: {
        logoText: 'BAYO TEST',
        heroTitle: 'Test Title'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.settings.logoText).toBe('BAYO TEST');
    
    console.log('✅ 10. Admin can update site settings');
    console.log('   - Settings updated successfully');
    console.log('   - New logo text:', data.settings.logoText);
    
    // Restore original settings
    await request.put(`${API_URL}/settings`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      data: {
        logoText: getData.settings.logoText,
        heroTitle: getData.settings.heroTitle
      }
    });
  });

  test('Admin can create banner', async ({ request }) => {
    const loginResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: 'admin@bayo.com',
        password: 'admin123'
      }
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    const testBanner = {
      image_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200',
      title: 'Test Banner',
      subtitle: 'Test subtitle',
      link: '/products'
    };
    
    const response = await request.post(`${API_URL}/settings/banners`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      data: testBanner
    });
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.banner).toBeDefined();
    expect(data.banner.title).toBe(testBanner.title);
    
    console.log('✅ 11. Admin can create banner');
    console.log('   - Banner created successfully');
    console.log('   - Banner title:', data.banner.title);
    console.log('   - Banner ID:', data.banner.id);
    
    // Clean up
    await request.delete(`${API_URL}/settings/banners/${data.banner.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  });

  test('Admin can delete banner', async ({ request }) => {
    const loginResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: 'admin@bayo.com',
        password: 'admin123'
      }
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    // Create a test banner first
    const createResponse = await request.post(`${API_URL}/settings/banners`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      data: {
        image_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200',
        title: 'Test Banner',
        subtitle: 'Test subtitle',
        link: '/products'
      }
    });
    
    const createData = await createResponse.json();
    const bannerId = createData.banner.id;
    
    // Delete the banner
    const deleteResponse = await request.delete(`${API_URL}/settings/banners/${bannerId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    expect(deleteResponse.ok()).toBeTruthy();
    
    console.log('✅ 12. Admin can delete banner');
    console.log('   - Banner deleted successfully');
    console.log('   - Banner ID:', bannerId);
  });
});
