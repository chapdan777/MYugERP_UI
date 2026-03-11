import React, { useState } from 'react';
import { Box, Paper, Typography, Button, Dialog, DialogTitle, DialogContent, FormControlLabel, Switch } from '@mui/material';
// import { useSnackbar } from 'notistack';

import { PropertiesTable } from './PropertiesTable';
import { PropertyForm } from './PropertyForm';

import { useProperties, useActivateProperty, useDeactivateProperty } from '../model/property.hooks';
import type { Property } from '../model/types';

export const PropertiesManagementPage: React.FC = () => {
  const { properties, isLoading, mutate } = useProperties();
  const { activateProperty } = useActivateProperty();
  const { deactivateProperty } = useDeactivateProperty();
  // const { enqueueSnackbar } = useSnackbar();

  const [showForm, setShowForm] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | undefined>(undefined);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info',
  });

  // Filter properties based on active status
  const filteredProperties = properties?.filter(prop =>
    showInactive ? true : prop.isActive
  );

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setShowForm(true);
  };

  const handleTogglePropertyStatus = async (property: Property) => {
    try {
      if (property.isActive) {
        await deactivateProperty(property.id);
        console.log(`Свойство "${property.name}" деактивировано`);
      } else {
        await activateProperty(property.id);
        console.log(`Свойство "${property.name}" активировано`);
      }

      // Обновляем список свойств
      if (mutate) {
        mutate();
      }
    } catch (error) {
      console.error('Ошибка при изменении статуса:', error);
      console.error('Ошибка при изменении статуса свойства');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProperty(undefined);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProperty(undefined);

    setSnackbar({
      open: true,
      message: editingProperty ? 'Свойство обновлено!' : 'Свойство создано!',
      severity: 'success'
    });

    // Обновляем список свойств
    if (mutate) {
      mutate();
    }
  };

  return (
    <Box sx={{ p: { xs: 0, sm: 1, md: 3 } }}>
      <Paper sx={{ p: { xs: 1, sm: 2, md: 3 }, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h5">Управление дополнительными свойствами</Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  color="primary"
                />
              }
              label="Показать неактивные"
            />
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => setShowForm(true)}
            >
              Добавить свойство
            </Button>
          </Box>
        </Box>

        <PropertiesTable
          properties={filteredProperties || []}
          loading={isLoading}
          onEdit={handleEditProperty}
          // onViewValues={handleShowPropertyValues}
          onToggleStatus={handleTogglePropertyStatus}
        />
      </Paper>

      <Dialog
        open={showForm}
        onClose={handleCloseForm}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingProperty ? 'Редактирование свойства' : 'Создание нового свойства'}
        </DialogTitle>
        <DialogContent>
          <PropertyForm
            property={editingProperty}
            onSuccess={handleFormSuccess}
            onCancel={handleCloseForm}
          />
        </DialogContent>
      </Dialog>

      {/* Snackbar для уведомлений */}
      {snackbar.open && (
        <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              backgroundColor: snackbar.severity === 'success' ? '#4caf50' : '#f44336',
              color: 'white',
              minWidth: 300
            }}
          >
            <Typography>{snackbar.message}</Typography>
          </Paper>
        </div>
      )}
    </Box>
  );
};