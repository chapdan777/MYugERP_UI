/**
 * @file Страница управления данными
 * @description Главная страница для управления основными сущностями системы:
 * пользователи, номенклатура, свойства, шапки заказов, операции и значения свойств
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
import { UserForm, UsersTable } from '../../../features/manage-users';
import { ProductsTable, ProductForm } from '../../../features/manage-products';
import { PropertiesManagementPage } from '../../../features/manage-properties';
import { PropertyHeadersManagementPage } from '../../../features/manage-property-headers';
import { PropertyDependenciesManagementPage } from '../../../features/manage-property-dependencies';
import {
  OperationsTable,
  OperationForm,
  useOperations,
  useCreateOperation,
  useUpdateOperation,
  useDeleteOperation,
} from '../../../features/manage-operations';
import type { Operation, CreateOperationDto, UpdateOperationDto } from '../../../features/manage-operations';
import {
  StatusesTable,
  StatusForm,
  useWorkOrderStatuses,
  useCreateWorkOrderStatus,
  useUpdateWorkOrderStatus,
  useDeleteWorkOrderStatus,
} from '../../../features/manage-work-order-statuses';
import type { WorkOrderStatus, CreateWorkOrderStatusDto, UpdateWorkOrderStatusDto } from '../../../features/manage-work-order-statuses';
import {
  DepartmentsTable,
  DepartmentForm,
  useCreateDepartment,
  useUpdateDepartment,
} from '../../../features/manage-departments';
import type { ProductionDepartment, CreateProductionDepartmentDto, UpdateProductionDepartmentDto } from '../../../features/manage-departments';
import { useDeactivateProduct } from '../../../features/manage-products/model/product.hooks';
import type { User } from '../../../features/manage-users/model/types';
import type { Product } from '../../../features/manage-products/model/types';
import { MainLayout } from '@widgets/layout';

/**
 * Стилизованный контейнер для страницы
 */
const StyledContainer = ({ children }: { children: React.ReactNode }) => (
  <Container
    maxWidth="xl"
    sx={{
      paddingTop: { xs: '8px', sm: '16px', md: '20px' },
      paddingBottom: { xs: '8px', sm: '16px', md: '20px' },
      px: { xs: 0, sm: 2, md: 3 },
    }}
  >
    {children}
  </Container>
);

/**
 * Стилизованная карточка для секций
 */
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

/**
 * Интерфейс для состояния вкладок
 */
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

/**
 * Компонент для панели вкладки
 */
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
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
          {children}
        </Box>
      )}
    </div>
  );
}

/**
 * Функция для получения значения атрибута id для вкладки
 */
function a11yProps(index: number) {
  return {
    id: `data-management-tab-${index}`,
    'aria-controls': `data-management-tabpanel-${index}`,
  };
}

/**
 * Основной компонент страницы управления данными
 */
const DataManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingOperation, setEditingOperation] = useState<Operation | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showOperationForm, setShowOperationForm] = useState(false);
  const [editingStatus, setEditingStatus] = useState<WorkOrderStatus | null>(null);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<ProductionDepartment | null>(null);
  const [showDepartmentForm, setShowDepartmentForm] = useState(false);

  const { deactivateProduct } = useDeactivateProduct();

  // Хуки для операций
  const { operations, isLoading: isLoadingOperations } = useOperations();
  const { createOperation } = useCreateOperation();
  const { updateOperation } = useUpdateOperation();
  const { deleteOperation } = useDeleteOperation();

  // Хуки для статусов ЗН
  const { statuses, isLoading: isLoadingStatuses } = useWorkOrderStatuses();
  const { createStatus } = useCreateWorkOrderStatus();
  const { updateStatus } = useUpdateWorkOrderStatus();
  const { deleteStatus } = useDeleteWorkOrderStatus();

  // Хуки для участников
  const { createDepartment } = useCreateDepartment();
  const { updateDepartment } = useUpdateDepartment();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    // Сбрасываем состояние формы при смене вкладки
    setEditingUser(null);
    setShowUserForm(false);
    setShowOperationForm(false);
    setShowStatusForm(false);
    setShowDepartmentForm(false);
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

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      console.log('Деактивация продукта:', productId);
      await deactivateProduct(productId.toString());
      console.log('Продукт успешно деактивирован');
    } catch (error) {
      console.error('Ошибка при деактивации продукта:', error);
    }
  };

  const handleProductFormSuccess = () => {
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const handleProductFormCancel = () => {
    setShowProductForm(false);
  };

  // Обработчики для операций
  const handleCreateOperation = () => {
    setEditingOperation(null);
    setShowOperationForm(true);
  };

  const handleEditOperation = (operation: Operation) => {
    setEditingOperation(operation);
    setShowOperationForm(true);
  };

  const handleDeleteOperation = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту операцию?')) {
      try {
        await deleteOperation(id);
      } catch (error) {
        console.error('Ошибка удаления операции:', error);
      }
    }
  };

  const handleSaveOperation = async (dto: CreateOperationDto | UpdateOperationDto, id?: number) => {
    if (id) {
      await updateOperation(id, dto as UpdateOperationDto);
    } else {
      await createOperation(dto as CreateOperationDto);
    }
  };

  const handleCloseOperationForm = () => {
    setEditingOperation(null);
    setShowOperationForm(false);
  };

  // Обработчики для статусов ЗН
  const handleCreateStatus = () => {
    setEditingStatus(null);
    setShowStatusForm(true);
  };

  const handleEditStatus = (status: WorkOrderStatus) => {
    setEditingStatus(status);
    setShowStatusForm(true);
  };

  const handleDeleteStatus = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот статус?')) {
      try {
        await deleteStatus(id);
      } catch (error) {
        console.error('Ошибка удаления статуса:', error);
      }
    }
  };

  const handleSaveStatus = async (dto: CreateWorkOrderStatusDto | UpdateWorkOrderStatusDto, id?: number) => {
    if (id) {
      await updateStatus(id, dto as UpdateWorkOrderStatusDto);
    } else {
      await createStatus(dto as CreateWorkOrderStatusDto);
    }
  };

  const handleCloseStatusForm = () => {
    setEditingStatus(null);
    setShowStatusForm(false);
  };

  const handleMoveStatusUp = async (status: WorkOrderStatus) => {
    const sortedStatuses = [...statuses].sort((a, b) => a.sortOrder - b.sortOrder);
    const index = sortedStatuses.findIndex(s => s.id === status.id);
    if (index > 0) {
      const prevStatus = sortedStatuses[index - 1];
      await updateStatus(status.id, { sortOrder: prevStatus.sortOrder });
      await updateStatus(prevStatus.id, { sortOrder: status.sortOrder });
    }
  };

  const handleMoveStatusDown = async (status: WorkOrderStatus) => {
    const sortedStatuses = [...statuses].sort((a, b) => a.sortOrder - b.sortOrder);
    const index = sortedStatuses.findIndex(s => s.id === status.id);
    if (index < sortedStatuses.length - 1) {
      const nextStatus = sortedStatuses[index + 1];
      await updateStatus(status.id, { sortOrder: nextStatus.sortOrder });
      await updateStatus(nextStatus.id, { sortOrder: status.sortOrder });
    }
  };

  // Обработчики для участков
  const handleCreateDepartment = () => {
    setEditingDepartment(null);
    setShowDepartmentForm(true);
  };

  const handleEditDepartment = (department: ProductionDepartment) => {
    setEditingDepartment(department);
    setShowDepartmentForm(true);
  };

  const handleSaveDepartment = async (dto: CreateProductionDepartmentDto | UpdateProductionDepartmentDto, id?: number) => {
    if (id) {
      await updateDepartment(id, dto as UpdateProductionDepartmentDto);
    } else {
      await createDepartment(dto as CreateProductionDepartmentDto);
    }
  };

  const handleCloseDepartmentForm = () => {
    setEditingDepartment(null);
    setShowDepartmentForm(false);
  };

  return (
    <MainLayout>
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
              <Tab label="Связанные доп.свойства" {...a11yProps(4)} />
              <Tab label="Операции" {...a11yProps(5)} />
              <Tab label="Статусы ЗН" {...a11yProps(6)} />
              <Tab label="Участки" {...a11yProps(7)} />
            </Tabs>
          </Box>

          {/* Вкладка Пользователи */}
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
              <Box sx={{ flex: 1 }}>
                <SectionCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="h6">
                        {editingUser ? 'Редактировать пользователя' : 'Создать нового пользователя'}
                      </Typography>
                      {!showUserForm && (
                        <Button
                          variant="contained"
                          onClick={handleCreateUser}
                          size="small"
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="h6">
                        Добавление новой номенклатуры
                      </Typography>
                      {!showProductForm && (
                        <Button
                          variant="contained"
                          onClick={handleCreateProduct}
                          size="small"
                        >
                          Добавить номенклатуру
                        </Button>
                      )}
                    </Box>

                    {showProductForm ? (
                      <ProductForm
                        product={editingProduct || undefined}
                        onSuccess={handleProductFormSuccess}
                        onCancel={handleProductFormCancel}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Нажмите кнопку "Добавить номенклатуру" для создания нового продукта
                      </Typography>
                    )}
                  </CardContent>
                </SectionCard>
              </Box>
              <Box sx={{ flex: 1 }}>
                <SectionCard>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Список номенклатуры
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Таблица со списком всей номенклатуры
                    </Typography>
                    <ProductsTable
                      onEdit={handleEditProduct}
                      onDelete={handleDeleteProduct}
                    />
                  </CardContent>
                </SectionCard>
              </Box>
            </Box>
          </TabPanel>

          {/* Вкладка Дополнительные свойства */}
          <TabPanel value={activeTab} index={2}>
            <PropertiesManagementPage />
          </TabPanel>

          {/* Вкладка Шапки заказов */}
          <TabPanel value={activeTab} index={3}>
            <PropertyHeadersManagementPage />
          </TabPanel>

          {/* Вкладка Связанные доп.свойства */}
          <TabPanel value={activeTab} index={4}>
            <PropertyDependenciesManagementPage />
          </TabPanel>

          {/* Вкладка Участки */}
          <TabPanel value={activeTab} index={7}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="h6">
                  Производственные участки
                </Typography>
                <Button variant="contained" size="small" onClick={handleCreateDepartment}>
                  Добавить участок
                </Button>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Управление производственными участками и назначение доступных операций
              </Typography>
              <DepartmentsTable
                onEdit={handleEditDepartment}
              />
            </Box>
          </TabPanel>

          {/* Вкладка Операции */}
          <TabPanel value={activeTab} index={5}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="h6">
                  Производственные операции
                </Typography>
                <Button variant="contained" size="small" onClick={handleCreateOperation}>
                  Добавить операцию
                </Button>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Справочник операций с типами расчёта, нормами времени и расценками
              </Typography>
              <OperationsTable
                operations={operations}
                isLoading={isLoadingOperations}
                onEdit={handleEditOperation}
                onDelete={handleDeleteOperation}
              />
            </Box>
          </TabPanel>

          {/* Вкладка Статусы ЗН */}
          <TabPanel value={activeTab} index={6}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="h6">
                  Статусы заказ-нарядов
                </Typography>
                <Button variant="contained" size="small" onClick={handleCreateStatus}>
                  Добавить статус
                </Button>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Справочник статусов ЗН с цветовой индикацией и порядком сортировки
              </Typography>
              <StatusesTable
                statuses={statuses}
                isLoading={isLoadingStatuses}
                onEdit={handleEditStatus}
                onDelete={handleDeleteStatus}
                onMoveUp={handleMoveStatusUp}
                onMoveDown={handleMoveStatusDown}
              />
            </Box>
          </TabPanel>
        </Paper>
      </StyledContainer>

      {/* Модальная форма для операций */}
      <OperationForm
        open={showOperationForm}
        operation={editingOperation}
        onSave={handleSaveOperation}
        onClose={handleCloseOperationForm}
      />

      {/* Модальная форма для статусов ЗН */}
      <StatusForm
        open={showStatusForm}
        status={editingStatus}
        onSave={handleSaveStatus}
        onClose={handleCloseStatusForm}
      />

      {/* Модальная форма для участков */}
      <DepartmentForm
        open={showDepartmentForm}
        department={editingDepartment}
        onSave={handleSaveDepartment}
        onClose={handleCloseDepartmentForm}
      />
    </MainLayout>
  );
};

export default DataManagementPage;