const axios = require('axios');

async function createTestProduct() {
  try {
    // First, authenticate to get token
    console.log('1. Authenticating...');
    const loginResponse = await axios.post('http://localhost:3003/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    const accessToken = loginResponse.data.accessToken;
    console.log('✅ Authentication successful');
    console.log('Token:', accessToken.substring(0, 20) + '...');
    
    // Create test product
    console.log('\n2. Creating test product...');
    const productData = {
      name: 'Тестовое окно стандартное',
      code: 'WND-TST-001',
      category: 'windows',
      description: 'Тестовое окно для проверки отображения в списке номенклатуры',
      basePrice: 15000,
      unit: 'шт'
    };
    
    const createResponse = await axios.post('http://localhost:3003/api/products', productData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Product created successfully:');
    console.log(JSON.stringify(createResponse.data, null, 2));
    
    // Verify by getting the list
    console.log('\n3. Verifying product list...');
    const listResponse = await axios.get('http://localhost:3003/api/products', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('✅ Products list:');
    console.log(`Total products: ${listResponse.data.length}`);
    listResponse.data.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (${product.code}) - ${product.basePrice} ${product.unit}`);
    });
    
  } catch (error) {
    console.log('❌ Error:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Message:', error.message);
    }
  }
}

createTestProduct();
