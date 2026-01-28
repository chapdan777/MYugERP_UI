import axios from 'axios';

async function createMoreTestProducts() {
  try {
    // Authenticate
    console.log('Authenticating...');
    const loginResponse = await axios.post('http://localhost:3003/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    const accessToken = loginResponse.data.accessToken;
    console.log('✅ Authenticated\n');
    
    // Additional products data
    const products = [
      {
        name: 'Дверь входная металлическая',
        code: 'DR-MET-001',
        category: 'doors',
        description: 'Металлическая входная дверь с усиленной конструкцией',
        basePrice: 25000,
        unit: 'шт'
      },
      {
        name: 'Фасад кухонный МДФ',
        code: 'FAC-MDF-001',
        category: 'facades',
        description: 'Кухонный фасад из МДФ с покрытием пленкой ПВХ',
        basePrice: 3500,
        unit: 'шт'
      },
      {
        name: 'Перегородка офисная стеклянная',
        code: 'PAR-GLS-001',
        category: 'partitions',
        description: 'Офисная перегородка из закаленного стекла с алюминиевым профилем',
        basePrice: 8000,
        unit: 'м2'
      }
    ];
    
    // Create each product
    for (let i = 0; i < products.length; i++) {
      console.log(`Creating product ${i + 1}/${products.length}: ${products[i].name}`);
      
      try {
        const response = await axios.post('http://localhost:3003/api/products', products[i], {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        console.log(`✅ Created: ${response.data.name} (ID: ${response.data.id})`);
      } catch (error) {
        if (error.response?.status === 409) {
          console.log(`⚠️  Product with code ${products[i].code} already exists`);
        } else {
          console.log(`❌ Error creating ${products[i].name}:`, error.response?.data || error.message);
        }
      }
    }
    
    // Show final list
    console.log('\n--- FINAL PRODUCT LIST ---');
    const listResponse = await axios.get('http://localhost:3003/api/products', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log(`Total products: ${listResponse.data.length}`);
    listResponse.data.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Code: ${product.code} | Category: ${product.category} | Price: ${product.basePrice} ${product.unit}`);
      console.log(`   Description: ${product.description}\n`);
    });
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

createMoreTestProducts();
