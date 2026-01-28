const axios = require('axios');

async function testUserUpdate() {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3Njg0NzA4MjcsImV4cCI6MTc2ODQ3MTcyN30.tFEEyxeBO4CPEHSuwdoFaSMbGf1Em1sd292Sf0TX-tk';
  
  console.log('=== Тест обновления пользователя ===\n');
  
  try {
    // 1. Получаем текущего пользователя
    console.log('1. Получаем пользователя с ID=1...');
    const getUserResponse = await axios.get('http://localhost:3003/api/users/1', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Текущий пользователь:');
    console.log(JSON.stringify(getUserResponse.data, null, 2));
    
    // 2. Тестируем обновление профиля (основной endpoint)
    console.log('\n2. Тестируем обновление профиля...');
    const profileUpdateData = {
      fullName: 'Обновленное Имя Администратора',
      email: 'admin.updated@example.com'
    };
    
    const profileResponse = await axios.put('http://localhost:3003/api/users/1', profileUpdateData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Профиль успешно обновлен:');
    console.log(JSON.stringify(profileResponse.data, null, 2));
    
    // 3. Тестируем изменение роли
    console.log('\n3. Тестируем изменение роли на manager...');
    const roleResponse = await axios.put('http://localhost:3003/api/users/1/role', 
      { role: 'manager' },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Роль успешно изменена:');
    console.log(JSON.stringify(roleResponse.data, null, 2));
    
    // 4. Тестируем деактивацию
    console.log('\n4. Тестируем деактивацию пользователя...');
    const deactivateResponse = await axios.put('http://localhost:3003/api/users/1/deactivate', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Пользователь деактивирован:');
    console.log(JSON.stringify(deactivateResponse.data, null, 2));
    
    // 5. Тестируем активацию
    console.log('\n5. Тестируем активацию пользователя...');
    const activateResponse = await axios.put('http://localhost:3003/api/users/1/activate', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Пользователь активирован:');
    console.log(JSON.stringify(activateResponse.data, null, 2));
    
    // 6. Возвращаем исходные значения
    console.log('\n6. Возвращаем исходные значения...');
    await axios.put('http://localhost:3003/api/users/1', 
      { 
        fullName: 'System Administrator',
        email: 'admin@example.com'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    await axios.put('http://localhost:3003/api/users/1/role', 
      { role: 'admin' },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Исходные значения восстановлены');
    
  } catch (error) {
    console.log('❌ Ошибка:');
    if (error.response) {
      console.log('Статус:', error.response.status);
      console.log('Данные:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Сообщение:', error.message);
    }
  }
}

testUserUpdate();