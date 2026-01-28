/**
 * @file Страница управления шапками свойств
 * @description Главная страница для управления шаблонами свойств заказов
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

import PropertyHeadersTable from './PropertyHeadersTable';
import PropertyHeaderForm from './PropertyHeaderForm';
import HeaderItemsManagement from './HeaderItemsManagement';
import HeaderProductsManagement from './HeaderProductsManagement';
import type { PropertyHeader, CreatePropertyHeaderInput, UpdatePropertyHeaderInput } from '../model/types';
import {
  useGetPropertyHeaders,
  useCreatePropertyHeader,
  useUpdatePropertyHeader,
  useActivatePropertyHeader,
  useDeactivatePropertyHeader,
  useDeletePropertyHeader,
  useRemoveItemFromHeader,
  useRemoveProductFromHeader,
} from '../model/hooks';

const PropertyHeadersManagementPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingHeader, setEditingHeader] = useState<PropertyHeader | null>(null);
  const [managingItemsHeader, setManagingItemsHeader] = useState<PropertyHeader | null>(null);
  const [managingProductsHeader, setManagingProductsHeader] = useState<PropertyHeader | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Получаем данные
  const { propertyHeaders, isLoading, isError, error } = useGetPropertyHeaders();
  const { createPropertyHeader } = useCreatePropertyHeader();
  const { updatePropertyHeader } = useUpdatePropertyHeader();
  const { activatePropertyHeader } = useActivatePropertyHeader();
  const { deactivatePropertyHeader } = useDeactivatePropertyHeader();
  const { deletePropertyHeader } = useDeletePropertyHeader();
  const { removeItemFromHeader } = useRemoveItemFromHeader();
  const { removeProductFromHeader } = useRemoveProductFromHeader();

  // Обработчики действий
  const handleCreateClick = () => {
    setEditingHeader(null);
    setShowForm(true);
    setErrorMessage(null);
    setShowSuccess(false);
  };

  const handleEditClick = (header: PropertyHeader) => {
    setEditingHeader(header);
    setShowForm(true);
    setErrorMessage(null);
    setShowSuccess(false);
  };

  const handleFormSubmit = async (data: CreatePropertyHeaderInput | UpdatePropertyHeaderInput) => {
    try {
      if (editingHeader) {
        // Редактирование
        const updateData: UpdatePropertyHeaderInput = {
          name: data.name,
          description: data.description
        };
        await updatePropertyHeader(editingHeader.id, updateData);
        setShowSuccess(true);
        handleCloseForm();
      } else {
        // Создание
        await createPropertyHeader(data as CreatePropertyHeaderInput);
        setShowSuccess(true);
        handleCloseForm();
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Произошла ошибка при сохранении');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingHeader(null);
    setErrorMessage(null);
    setShowSuccess(false);
  };

  const handleActivate = async (id: number) => {
    try {
      await activatePropertyHeader(id);
      setShowSuccess(true);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Ошибка при активации шапки');
    }
  };

  const handleDeactivate = async (id: number) => {
    try {
      await deactivatePropertyHeader(id);
      setShowSuccess(true);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Ошибка при деактивации шапки');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту шапку?')) {
      try {
        await deletePropertyHeader(id);
        setShowSuccess(true);
      } catch (error: any) {
        setErrorMessage(error.response?.data?.message || 'Ошибка при удалении шапки');
      }
    }
  };

  const handleRemoveItemFromHeader = async (headerId: number, propertyId: number) => {
    if (window.confirm('Вы уверены, что хотите удалить это свойство?')) {
      try {
        await removeItemFromHeader(headerId, propertyId);
        // SWR automatically updates the cache, so the list in form will update
      } catch (error: any) {
        setErrorMessage(error.response?.data?.message || 'Ошибка при удалении свойства');
      }
    }
  };

  const handleAddItem = (header: PropertyHeader) => {
    setManagingItemsHeader(header);
    setErrorMessage(null);
    setShowSuccess(false);
  };

  const handleCloseItemsManagement = () => {
    setManagingItemsHeader(null);
  };

  const handleRemoveProductFromHeader = async (headerId: number, productId: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот продукт?')) {
      try {
        await removeProductFromHeader(headerId, productId);
        // SWR automatically updates the cache
      } catch (error: any) {
        setErrorMessage(error.response?.data?.message || 'Ошибка при удалении продукта');
      }
    }
  };

  const handleAddProduct = (header: PropertyHeader) => {
    setManagingProductsHeader(header);
    setErrorMessage(null);
    setShowSuccess(false);
  };

  const handleCloseProductsManagement = () => {
    setManagingProductsHeader(null);
  };

  const handleCloseSnackbar = () => {
    setShowSuccess(false);
    setErrorMessage(null);
  };

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Ошибка загрузки данных: {(error as Error)?.message || 'Неизвестная ошибка'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Управление шапками свойств
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateClick}
        >
          Создать шапку
        </Button>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Здесь вы можете создавать и управлять шаблонами свойств для различных типов заказов
      </Typography>

      <PropertyHeadersTable
        headers={propertyHeaders}
        onEdit={handleEditClick}
        onDelete={handleDelete}
        onActivate={handleActivate}
        onDeactivate={handleDeactivate}
        onAddItem={handleAddItem}
        loading={isLoading}
      />

      {/* Диалог формы */}
      <Dialog
        open={showForm}
        onClose={handleCloseForm}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingHeader ? 'Редактировать шапку' : 'Создать новую шапку'}
        </DialogTitle>
        <DialogContent>
          <PropertyHeaderForm
            header={editingHeader || undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseForm}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItemFromHeader}
            onAddProduct={handleAddProduct}
            onRemoveProduct={handleRemoveProductFromHeader}
            loading={false}
            error={errorMessage}
            success={showSuccess}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Уведомления */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: '100%' }}
        >
          {editingHeader ? 'Шапка успешно обновлена!' : 'Шапка успешно создана!'}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>

      {/* Диалог управления элементами */}
      {managingItemsHeader && (
        <HeaderItemsManagement
          header={managingItemsHeader}
          open={!!managingItemsHeader}
          onClose={handleCloseItemsManagement}
        />
      )}

      {/* Диалог управления продуктами */}
      {managingProductsHeader && (
        <HeaderProductsManagement
          header={managingProductsHeader}
          open={!!managingProductsHeader}
          onClose={handleCloseProductsManagement}
        />
      )}
    </Box>
  );
};

export default PropertyHeadersManagementPage;