/**
 * @file Страница управления данными
 * @description Главная страница для управления основными сущностями системы:
 * пользователи, номенклатура, свойства, шапки заказов и значения свойств
 */

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Paper, 
  Container,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import { css } from '@emotion/react';
import { UserForm, UsersTable } from '../../../features/user-management';
import { ProductForm, ProductsTable } from '../../../features/product-management';
import type { User } from '../../../features/user-management/model/types';
import type { Product } from '../../../features/product-management/model/types';

// Стилизованный контейнер для страницы
const StyledContainer = ({ children }: { children: React.ReactNode }) => (
  <Container 
    maxWidth="xl" 
    sx={{ 
      paddingTop: '20px',
      paddingBottom: '20px',
    }}
  >
    {children}
  </Container>
);

// Стилизованная карточка для секций
const SectionCard = ({ children }: { children: React.ReactNode }) => (
  <Card 
    sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column' 
    }}
  >
    {children}
  </Card>
);

// Интерфейс для состояния вкладок
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Компонент для панели вкладки
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`data-management-tabpanel-${index}`}
      aria-labelledby={`data-management-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Функция для получения значения атрибута id для вкладки
function a11yProps(index: number) {
  return {
    id: `data-management-tab-${index}`,
    'aria-controls': `data-management-tabpanel-${index}`,
  };
}

// Основной компонент страницы управления данными
const DataManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    // Сбрасываем состояние формы при смене вкладки
    setEditingUser(null);
    setShowUserForm(false);
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowUserForm(true);
  };

  const handleFormSuccess = () => {
    setEditingUser(null);
    setShowUserForm(false);
  };

  const handleFormCancel = () => {
    setEditingUser(null);
    setShowUserForm(false);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleProductFormSuccess = () => {
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const handleProductFormCancel = () => {
    setEditingProduct(null);
    setShowProductForm(false);
  };

  return (
    <StyledContainer>
      <Paper elevation={3} sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Пользователи" {...a11yProps(0)} />
            <Tab label="Номенклатура" {...a11yProps(1)} />
            <Tab label="Дополнительные свойства" {...a11yProps(2)} />
            <Tab label="Шапки заказов" {...a11yProps(3)} />
            <Tab label="Значения свойств" {...a11yProps(4)} />
          </Tabs>
        </Box>
        
        {/* Вкладка Пользователи */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
            <Box sx={{ flex: 1 }}>
              <SectionCard>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      {editingUser ? 'Редактировать пользователя' : 'Создать нового пользователя'}
                    </Typography>
                    {!showUserForm && (
                      <Button 
                        variant="contained" 
                        onClick={handleCreateUser}
                      >
                        Добавить пользователя
                      </Button>
                    )}
                  </Box>
                  
                  {showUserForm ? (
                    <UserForm 
                      user={editingUser || undefined}
                      onSuccess={handleFormSuccess}
                      onCancel={handleFormCancel}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Нажмите кнопку "Добавить пользователя" для создания нового пользователя
                    </Typography>
                  )}
                </CardContent>
              </SectionCard>
            </Box>
            <Box sx={{ flex: 1 }}>
              <SectionCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Список пользователей
                  </Typography>
                  <UsersTable onEdit={handleEditUser} />
                </CardContent>
              </SectionCard>
            </Box>
          </Box>
        </TabPanel>
        
        {/* Вкладка Номенклатура */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
            <Box sx={{ flex: 1 }}>
              <SectionCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Добавление новой номенклатуры
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Форма для добавления новых продуктов/товаров в систему
                  </Typography>
                  {showProductForm ? (
                    <ProductForm 
                      product={editingProduct || undefined}
                      onSuccess={handleProductFormSuccess}
                      onCancel={handleProductFormCancel}
                    />
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Нажмите кнопку "Добавить номенклатуру" для создания нового продукта
                      </Typography>
                      <Button 
                        variant="contained" 
                        onClick={handleCreateProduct}
                      >
                        Добавить номенклатуру
                      </Button>
                    </Box>
                  )
                </CardContent>
              </SectionCard>
            </Box>
            <Box sx={{ flex: 1 }}>
              <SectionCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Список номенклатуры
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Таблица со списком всей номенклатуры
                  </Typography>
                  <ProductsTable 
                    onEdit={handleEditProduct}
                    onView={(product) => {
                      // Можно реализовать просмотр деталей
                      console.log('Просмотр продукта:', product);
                    }}
                  />
                </CardContent>
              </SectionCard>
            </Box>
          </Box>
        </TabPanel>
        
        {/* Вкладка Дополнительные свойства */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
            <Box sx={{ flex: 1 }}>
              <SectionCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Управление свойствами
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Форма для создания и редактирования дополнительных свойств
                  </Typography>
                  {/* Здесь будет форма управления свойствами */}
                </CardContent>
              </SectionCard>
            </Box>
            <Box sx={{ flex: 1 }}>
              <SectionCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Список свойств
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Таблица со списком всех дополнительных свойств
                  </Typography>
                  {/* Здесь будет таблица свойств */}
                </CardContent>
              </SectionCard>
            </Box>
          </Box>
        </TabPanel>
        
        {/* Вкладка Шапки заказов */}
        <TabPanel value={activeTab} index={3}>
          <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
            <Box sx={{ flex: 1 }}>
              <SectionCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Создание шапки заказа
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Форма для создания шаблонов шапок и настройки свойств
                  </Typography>
                  {/* Здесь будет форма создания шапки заказа */}
                </CardContent>
              </SectionCard>
            </Box>
            <Box sx={{ flex: 1 }}>
              <SectionCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Список шапок заказов
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Таблица со списком всех шаблонов заказов
                  </Typography>
                  {/* Здесь будет таблица шапок заказов */}
                </CardContent>
              </SectionCard>
            </Box>
          </Box>
        </TabPanel>
        
        {/* Вкладка Значения свойств */}
        <TabPanel value={activeTab} index={4}>
          <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
            <Box sx={{ flex: 1 }}>
              <SectionCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Управление значениями
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Форма для управления возможными значениями для свойств
                  </Typography>
                  {/* Здесь будет форма управления значениями */}
                </CardContent>
              </SectionCard>
            </Box>
            <Box sx={{ flex: 1 }}>
              <SectionCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Список значений свойств
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Таблица со списком всех значений свойств
                  </Typography>
                  {/* Здесь будет таблица значений свойств */}
                </CardContent>
              </SectionCard>
            </Box>
          </Box>
        </TabPanel>
      </Paper>
    </StyledContainer>
  );
};

export default DataManagementPage;