import axios from 'axios';

async function testProductCreation() {
  try {
    // Authenticate
    console.log('1. Аутентификация...');
    const loginResponse = await axios.post('http://localhost:3003/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    const accessToken = loginResponse.data.accessToken;
    console.log('✅ Аутентификация успешна\n');
    
    // Test product data
    const testData = {
      name: 'Тестовый продукт для проверки создания',
      code: 'TEST-001',
      category: 'other',
      description: 'Тестовый продукт для проверки полного цикла создания номенклатуры',
      basePrice: 9999.99,
      unit: 'шт'
    };
    
    console.log('2. Создание тестового продукта...');
    console.log('Данные:', JSON.stringify(testData, null, 2));
    
    const createResponse = await axios.post('http://localhost:3003/api/products', testData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Продукт успешно создан:');
    console.log(JSON.stringify(createResponse.data, null, 2));
    
    // Verify by getting updated list
    console.log('\n3. Проверка обновленного списка...');
    const listResponse = await axios.get('http://localhost:3003/api/products', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log(`✅ Всего продуктов: ${listResponse.data.length}`);
    const newProduct = listResponse.data.find(p => p.code === 'TEST-001');
    if (newProduct) {
      console.log('✅ Новый продукт найден в списке:');
      console.log(`   ${newProduct.name} (${newProduct.code}) - ${newProduct.basePrice} ${newProduct.unit}`);
    } else {
      console.log('❌ Новый продукт не найден в списке');
    }
    
    // Cleanup - delete test product
    console.log('\n4. Очистка - удаление тестового продукта...');
    if (newProduct) {
      await axios.delete(`http://localhost:3003/api/products/${newProduct.id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      console.log('✅ Тестовый продукт удален');
    }
    
  } catch (error) {
    console.log('❌ Ошибка:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Message:', error.message);
    }
  }
}

testProductCreation();
